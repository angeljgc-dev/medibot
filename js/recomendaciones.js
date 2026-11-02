/* Motor de recomendaciones v0.5 (puro, sin DOM): decide qué ideas ve cada persona.
   Lee window.MediBotData.corpus (docs/corpus_esquema.md); si no existe, usa data/fichas.js como respaldo conservador.
   Textos en data/textos.js → recomendaciones. Pruebas: tests/recomendaciones.test.mjs.

   Reglas (en este orden):
   1. Nivel rojo → bloqueado: ninguna idea (ni comida, ni plantas, ni suplementos); solo "qué hacer ahora".
   2. Señales primero: fiebre (temperatura ≥ 37.2 °C axilar) → hidratación y suero oral; embarazo → control prenatal.
   3. Por tema elegido: se ordena por puntaje, donde la evidencia para ESE tema pesa más que todo lo
      demás junto (100 × ayuda_en + 20 × pertinencia + 15 × señal + 8 × tipo + 4 × acceso − avisos personales); máximo
      4 tarjetas por molestia y 3 por situación, 2 por tipo, 1 planta y 1 suplemento, y siempre ≥ 1 alimento o hábito.
      Solo los tipos que la sección permite (`tipos_permitidos`). Ya no existe «el suplemento siempre al final».
   4. Nunca se devuelve una entrada insegura para el perfil (esSegura) ni impropia para su edad (apta): a menores de 12
      solo plantas y suplementos con dosis para niños (`cuanto_ninos`); nunca dosis de adulto. En el embarazo, los
      suplementos que la fuente permite salen con "pregúntalo en tu control prenatal".
   5. Ámbar: los suplementos se muestran solo con "pregúntalo en tu centro de salud".
   6. Nunca un tema vacío: si todo queda excluido, alimentos y hábitos seguros + "pregunta en tu centro de salud".
   7. Medicinas: "No sé" o no contestar se trata como si tomara todas (se excluye todo lo que choque con alguna).
      Embarazo: de 12 a 59 años, "Prefiero no decir" o no contestar excluye lo que no es para el embarazo (sin decirle
      que está embarazada). "Estoy dando pecho" activa las exclusiones de lactancia. Fuera de 12 a 59 no hay embarazo.
   8. Campos opcionales del corpus (docs/corpus_esquema.md): `solo_embarazo` (solo para quien está embarazada) y
      `avisos_medicina: { clave: texto }` (solo los ve quien marcó esa medicina). Fase 2: `excluir.edad_maxima`
      (exclusiva), `ayuda_por_tema: { tema: 1..3 }`, `prioriza_si: [rasgo]`; en temas: `clase`, `grupo`, `tipos_permitidos`,
      `ocultar_grupos`, `sugerir_si` + `prioridad` y `cuando_ir: { texto, fuentes }`.
   9. Secciones visibles: ≥ 3 opciones aptas, grupo de edad fuera de `ocultar_grupos` y ningún rasgo de `ocultar_si`
      (p. ej. Cólicos de la regla con ["embarazo"]). Situaciones sugeridas: máximo 2, por `prioridad`, solo si son
      visibles. Condiciones (vesícula, hígado…) sin contestar = ninguna.
  10. Ronda de correcciones (2026-11-02, docs/corpus_esquema.md): `edad_minima` se compara con el límite inferior del
      grupo y `edad_maxima` con el superior (edadMax); `sin_cambio` → «No lo encuentro» no ofrece alternativas;
      las alternativas respetan `tipos_permitidos` de la sección de la tarjeta; `avisos_perfil` (y `avisos_condicion`
      en la tarjeta de hidratación) solo para quien tiene ese rasgo; `actividad: true` → al menos una por sección si
      hay alguna apta (criterio 11); la hoja impresa lleva la mejor idea de cada sección elegida (paraHoja).
  11. Fase 3 (criterio 16) y v0.5 (criterio 26): recomendar() también devuelve `cuidados: { tema: [tarjeta, …] }`
      (data/cuidado.js): hasta 2 por sección, las más graves que le tocan al perfil, sin repetir entre secciones, nada en
      rojo; y `cuidado: { tema: la primera | null }`. Ver cuidadoSecciones().
  12. Criterio 40 (contenido para niños, 2026-11-02). Corte: «menor» = menos de 12 años (EDAD_MENOR; grupos «bebe» y
      «nino»), el mismo que ya usan las dosis para niños y el rasgo «nino» de «Cuidado con esto». A un menor no le salen:
      la franja `cuando_ir` con `edad_minima` mayor que su edad ni las frases de su `texto_no_ninos`; las tarjetas de cuidado con `edad_minima` mayor que su
      edad; ni las frases de `aviso_no_ninos` (frases exactas de su `aviso`, que se quitan del aviso; el texto curado no
      se toca y adultos y adolescentes lo ven completo). requiereLeyenda(entrada): la leyenda COFEPRIS solo va en
      suplementos que no se piden en el centro de salud (`donde` ≠ "centro_salud").
  13. Ronda 3 (2026-11-02; pruebas: tests/ronda3_motor.test.mjs).
      58: paraHoja(rec, categorias, { omitir, aceptadas }) recorta dejando primero las ideas de la situación (embarazo,
          niño, persona mayor) y las aceptadas; en el embarazo, la actividad del embarazo antes que la genérica de adultos.
          vaEnHoja(tarjeta, rec, categorias, opciones) → ¿va en la hoja? (para «Va en tu hoja»).
      64: entradas con `rehidratacion: true` (suero oral): ningún aviso que retrase tomarlo (ni «No sé», ni embarazo, ni
          ámbar); las señales para ir hoy van en su `aviso`.
      73: tarjetas de cuidado: `edad_maxima_nino` (el rasgo «nino» de `perfiles` solo para niños menores de esa edad) y
          `en_su_lugar_por_seccion: { tema: { en_su_lugar, texto_en_su_lugar } }` (otro «En su lugar» en esa sección). */
(function () {
  "use strict";

  const ORDEN_TIPO = { alimento: 0, habito: 1, planta: 2, suplemento: 3 };
  const EDAD_GRUPO = { bebe: 0, nino: 0.25, "12a17": 12, "18a59": 18, "60mas": 60 };   // límite inferior de cada grupo
  const EDAD_NINO = { menos2: 0.25, "2a5": 2, "6a11": 6 };
  // Edad más alta posible de cada grupo (M1): «6 a 11» llega hasta los 11 años y meses. Con ella se compara edad_maxima,
  // para no mostrarle a un niño de 11 algo «para 3 a 6»; con el límite inferior se compara edad_minima. Las dos, seguras.
  const EDAD_MAX_GRUPO = { bebe: 0.24, nino: 11.99, "12a17": 17.99, "18a59": 59.99, "60mas": Infinity };
  const EDAD_MAX_NINO = { menos2: 1.99, "2a5": 5.99, "6a11": 11.99 };
  // Mismo remedio con otro id cuando no hay nombre científico que los una (decisión de diseño, 2026-11-02)
  const MISMO_REMEDIO = [["manzanilla", "manzanilla_piel"], ["llanten", "llanten_piel"]];
  // Anclas de seguridad (decisión del 2026-11-02): la regla de actividad física nunca las saca
  const ANCLAS_SEGURIDAD = ["lavar_manos", "agua_segura", "vacunas_cartilla", "suero_oral"];
  // Suplementos que el embarazo no restringe (OMS y NHS: el suero oral sí se usa): sin el aviso automático del control.
  // Desde la ronda 3 (criterio 64) se tratan como `rehidratacion: true` (ver avisosPara): sin ningún aviso que retrase.
  const SIN_AVISO_EMBARAZO = ["suero_oral"];
  const EDAD_MENOR = 12; // criterio 40: menos de 12 años = consulta por un niño o una niña (ver la regla 12 arriba)
  const MAX_HOJA = 4;  // ideas en la hoja impresa: hidratación + 1 por sección (máx. 3) caben en 1 carta (tools/e2e_pantallas.py E3b)
  const TEXTO_NINO = { menos2: "menos de 2 años", "2a5": "de 2 a 5 años", "6a11": "de 6 a 11 años" };
  const MAX_POR_TIPO = { alimento: 2, habito: 2, planta: 1, suplemento: 1 }; // por tema: variedad sin listas largas
  const MAX_TARJETAS = { molestia: 4, situacion: 3 };                         // por sección, según su clase
  const PESO_TIPO = { alimento: 2, habito: 2, planta: 1, suplemento: 0 };
  const PESO_DONDE = { casa: 2, huerto: 1, mercado: 1, tienda: 1, centro_salud: 1, farmacia: 0 }; // centro de salud: gratis, pero hay que ir
  const MIN_OPCIONES = 3;                                                      // una sección con menos no se muestra
  const MAX_SUGERIDAS = 2;
  // IMC «bajo» por grupo según las bandas de data/rangos.js (18a59: bajo peso < 18.5; 60mas: bajo para la edad < 22)
  const IMC_BAJO = { "18a59": 18.5, "60mas": 22 };
  const CLAVES_MEDICINA = ["presion", "azucar", "anticoagulante", "corazon", "tiroides", "nervios_sueno", "convulsiones", "anticonceptivo"];
  // Respaldo sin corpus: dibujo = id de pictograma del sprite (assets/pictos), nunca emoji (criterio 23)
  const DIBUJO_RESPALDO = { defensas: "p-defensas", digestion: "p-digestion", sueno: "p-sueno", energia: "p-energia", piel: "p-piel", huesos: "p-huesos", corazon: "p-corazon", vista: "p-vista" };

  const datos = () => window.MediBotData || {};
  const TX = () => (datos().textos && datos().textos.recomendaciones) || {};
  const esRiesgo = (e) => e && (e.tipo === "planta" || e.tipo === "suplemento");
  const objeto = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});

  /* ---------- Corpus (real o respaldo) ---------- */
  let respaldo = null;
  const indices = new WeakMap();
  function corpus() {
    const c = datos().corpus;
    if (c && Array.isArray(c.entradas) && Array.isArray(c.temas)) return c;
    if (!respaldo && datos().fichas) respaldo = desdeFichas(datos().fichas);
    return respaldo || { temas: [], entradas: [] };
  }
  function indice(c) {
    let m = indices.get(c);
    if (!m) { m = new Map(c.entradas.map(e => [e.id, e])); indices.set(c, m); }
    return m;
  }
  function porId(id) { return indice(corpus()).get(id) || null; }
  function temas() { return corpus().temas; }
  function grupos() { return corpus().grupos || []; }
  function temaDe(id) { return temas().find(t => t.id === id) || null; }
  function nombreTema(id) { const t = temas().find(x => x.id === id); return t ? t.nombre : id; }
  function usaRespaldo() { return corpus() === respaldo; }

  /** Convierte data/fichas.js al formato del corpus, con exclusiones conservadoras (solo mientras no exista data/corpus.js). */
  function desdeFichas(F) {
    const libre = (edad) => ({ embarazo: false, lactancia: false, edad_minima: edad, medicinas: [], condiciones: [] });
    const estricto = (edad) => ({ embarazo: true, lactancia: true, edad_minima: edad, medicinas: CLAVES_MEDICINA.slice(), condiciones: [] });
    const entradas = [];
    for (const c of F.categorias || []) {
      const fuente = (f) => (f ? [f] : []);
      if (c.destacado) entradas.push({ id: c.id + "_destacado", tipo: "habito", nombre: c.destacado.nombre, temas: [c.id], para: c.destacado.nota, como: "", ayuda: 3, excluir: libre(0), alternativas: [], fuentes: fuente(c.destacado.fuente) });
      (c.alimentos || []).forEach((a, i) => {
        const te = /(^|[^a-záéíóúñ])t[eé](?![a-záéíóúñ])/i.test(a.nombre) || !!a.advertencia; // tés: plantas con exclusiones amplias (\b no sirve con "é")
        entradas.push({ id: `${c.id}_alimento_${i}`, tipo: te ? "planta" : "alimento", nombre: a.nombre, temas: [c.id], para: a.nota, como: "", ayuda: te ? 1 : 2, aviso: a.advertencia || null, excluir: te ? estricto(12) : libre(1), alternativas: [], fuentes: fuente(a.fuente) });
      });
      if (c.habito) entradas.push({ id: c.id + "_habito", tipo: "habito", nombre: "Qué hacer hoy", temas: [c.id], para: c.habito, como: "", ayuda: 2, excluir: libre(0), alternativas: [], fuentes: [] });
      (c.suplementos || []).forEach((s, i) => entradas.push({ id: `${c.id}_suplemento_${i}`, tipo: "suplemento", nombre: s.nombre, temas: [c.id], para: s.que_hace, como: "", ayuda: s.nivel_evidencia === "alta" ? 3 : s.nivel_evidencia === "moderada" ? 2 : 1, evidencia: s.evidencia, aviso: s.advertencia, si_no_hay: s.si_no_hay, excluir: estricto(18), alternativas: [], fuentes: fuente(s.fuente) }));
    }
    return { version: "respaldo-fichas-" + (F.version || ""), temas: (F.categorias || []).map(c => ({ id: c.id, nombre: c.nombre, icono: c.icono, dibujo: DIBUJO_RESPALDO[c.id] || "p-hojita" })), entradas, respaldo: true };
  }

  /* ---------- Perfil ---------- */
  function medida(s, k) {
    const m = s.medidas && s.medidas[k];
    return m && m.estado !== "invalida" && typeof m.valor === "number" && Number.isFinite(m.valor) ? m.valor : null;
  }

  /** perfil(sesion, resultado) → edad en años (límite inferior del grupo), embarazo, medicinas, nivel y señales. */
  function perfil(sesion, resultado) {
    const s = sesion || {};
    if (!resultado && window.MediBotReglas && s.medidas && s.alarma) resultado = window.MediBotReglas.evaluar(s);
    const grupo = s.grupo || null;
    const edad = grupo === "nino" ? (EDAD_NINO[s.edadNino] ?? EDAD_GRUPO.nino) : (EDAD_GRUPO[grupo] ?? EDAD_GRUPO.nino);
    const edadMax = grupo === "nino" ? (EDAD_MAX_NINO[s.edadNino] ?? EDAD_MAX_GRUPO.nino) : (EDAD_MAX_GRUPO[grupo] ?? EDAD_MAX_GRUPO.nino);
    const elegidas = Array.isArray(s.medicinas) ? s.medicinas.filter(Boolean) : [];
    const desconocidas = elegidas.length === 0 || elegidas.includes("no_se");
    const medicinas = desconocidas ? [] : elegidas.filter(m => m !== "ninguna");
    const fertil = grupo === "12a17" || grupo === "18a59";
    const embarazo = s.embarazo === true && fertil; // un "sí" que quedó de otra edad o persona no cuenta
    const lactancia = s.lactancia === true || (fertil && s.embarazoOpcion === "lactancia");
    const temp = medida(s, "temp"), spo2 = medida(s, "spo2"), fc = medida(s, "fc");
    const imc = imcDe(s);
    return {
      persona: s.paraQuien || "yo",
      grupo, edad, edadMax, edadNino: grupo === "nino" ? (s.edadNino || null) : null,
      embarazo,
      // "Prefiero no decir" o sin contestar (12 a 59 años): se excluye lo del embarazo, como "No sé" en medicinas
      embarazoPosible: !embarazo && fertil && !["no", "no_aplica", "lactancia"].includes(s.embarazoOpcion),
      lactancia,
      medicinas, medicinasDesconocidas: desconocidas,
      condiciones: Array.isArray(s.condiciones) ? s.condiciones : [],
      cronico: { azucar: medicinas.includes("azucar"), presion: medicinas.includes("presion") },
      imc,
      nivel: resultado ? resultado.nivel : null,
      prisa: resultado ? resultado.prisa : null,
      senales: {
        fiebre: temp !== null && temp >= 37.2,
        oxigenoBajo: spo2 !== null && spo2 < 95,
        pulsoAlto: fc !== null && fc > 100,
        tos: !!(s.alarma && s.alarma.tos === true),
        imcAlto: imc !== null && edad >= 18 && imc >= 30,
        imcBajo: imc !== null && IMC_BAJO[grupo] !== undefined && imc < IMC_BAJO[grupo]
      }
    };
  }
  function imcDe(s) {
    const peso = s.peso && s.peso.valor, talla = s.talla && s.talla.valor;
    if (window.MediBotReglas && window.MediBotReglas.imcDe) return window.MediBotReglas.imcDe(peso, talla);
    return peso && talla ? Math.round((peso / ((talla / 100) ** 2)) * 10) / 10 : null;
  }
  /** Rasgos del perfil que pueden pedir `prioriza_si` (entradas) y `sugerir_si` (secciones). */
  function rasgos(p) {
    const r = new Set();
    if (p.senales.fiebre) r.add("fiebre");
    if (p.senales.imcAlto) r.add("imc_alto");
    if (p.senales.imcBajo) r.add("imc_bajo");
    if (p.embarazo) r.add("embarazo");
    if (p.lactancia) r.add("lactancia");
    if (p.grupo === "nino" || p.persona === "nino") r.add("nino");
    if (p.edad >= 60) r.add("mayor60");
    for (const m of ["azucar", "presion", "corazon"]) if (p.medicinas.includes(m)) r.add(m);
    return r;
  }

  /* ---------- Seguridad ---------- */
  /** false si la entrada choca con el perfil: embarazo, lactancia, edad mínima, medicinas o condiciones declaradas. */
  function esSegura(e, p) {
    if (!e || !p) return false;
    const ex = e.excluir;
    if (e.solo_embarazo && !p.embarazo) return false; // ácido fólico y hierro "de tu control prenatal" (docs/corpus_esquema.md)
    if (!ex) return !esRiesgo(e); // planta o suplemento sin exclusiones declaradas: no se muestra
    if ((p.embarazo || p.embarazoPosible) && (ex.embarazo || e.leyenda_embarazo)) return false;
    if (p.lactancia && ex.lactancia) return false;
    const minima = typeof ex.edad_minima === "number" ? ex.edad_minima : (esRiesgo(e) ? 18 : 0);
    if (p.edad < minima) return false;
    const choca = Array.isArray(ex.medicinas) ? ex.medicinas : [];
    if (choca.length && (p.medicinasDesconocidas || choca.some(m => p.medicinas.includes(m)))) return false;
    const cond = Array.isArray(ex.condiciones) ? ex.condiciones : [];
    if (cond.some(c => p.condiciones.includes(c))) return false;
    return true;
  }
  /** esSegura + lo que no toca por edad o etapa aunque la fuente no lo prohíba. */
  function apta(e, p) {
    if (!esSegura(e, p)) return false;
    const ex = e.excluir || {};
    // exclusiva («hasta antes de») y contra la edad más alta del grupo (M1); sin edadMax (perfil viejo), la inferior
    if (typeof ex.edad_maxima === "number" && (p.edadMax ?? p.edad) >= ex.edad_maxima) return false;
    if (p.edad < 12 && esRiesgo(e) && !e.cuanto_ninos) return false; // sin dosis para niños no se ofrece a un niño
    return true;
  }

  /* ---------- Avisos ---------- */
  const esMenor = (p) => !!p && p.edad < EDAD_MENOR;
  /** `texto` sin las frases exactas de la lista (criterio 40); null si no queda nada. */
  function sinFrases(texto, frases) {
    let t = String(texto || "");
    for (const frase of Array.isArray(frases) ? frases : []) if (frase) t = t.split(frase).join(" ");
    return t.replace(/\s+/g, " ").trim() || null;
  }
  /** Aviso general de la entrada para un menor de 12: su `aviso` sin las frases de `aviso_no_ninos` (criterio 40). */
  function avisoNinos(e) { return sinFrases(e && e.aviso, e && e.aviso_no_ninos); }
  /** Aviso general que ve ESTA persona: el `aviso` completo, o a un menor de 12, sin las frases de adulto. */
  function avisoGeneral(e, p) { return esMenor(p) && Array.isArray(e && e.aviso_no_ninos) ? avisoNinos(e) : (e && e.aviso) || null; }
  /** ¿Es `texto` el aviso general de la entrada (completo o el de menores)? Lo demás es un aviso personal. */
  const esGeneral = (texto, e) => !!e && (texto === e.aviso || (Array.isArray(e.aviso_no_ninos) && texto === avisoNinos(e)));
  /** Avisos concretos y en lenguaje simple que aplican a ESTA persona con ESTA entrada. */
  function avisosPara(e, p) {
    const T = TX(); const out = [];
    const poner = (t) => { if (t && !out.includes(t)) out.push(t); };
    if (!e || !p) return out;
    poner(avisoGeneral(e, p)); // a un menor de 12, sin las frases de adulto (criterio 40)
    // Avisos por medicina: primero los de la propia entrada (campo opcional `avisos_medicina`); la tabla de textos.js
    // solo cubre las medicinas que la entrada no trae, para no repetir el mismo aviso con otras palabras.
    const propios = e.avisos_medicina && typeof e.avisos_medicina === "object" ? e.avisos_medicina : {};
    for (const [clave, t] of Object.entries(propios)) if (p.medicinas.includes(clave)) poner(t);
    const texto = (e.id + " " + (e.nombre || "")).toLowerCase();
    for (const am of T.avisos_medicina || []) {
      if (propios[am.medicina]) continue;
      if (p.medicinas.includes(am.medicina) && new RegExp(am.patron, "i").test(texto)) poner(am.texto);
    }
    // Avisos por perfil (`avisos_perfil: { rasgo: texto }`, docs/corpus_esquema.md 2026-11-02) y por condición
    // (`avisos_condicion`, p. ej. la tarjeta de hidratación con riñones o poca agua): solo a quien tiene ese rasgo.
    const r = rasgos(p);
    for (const [rasgo, t] of Object.entries(objeto(e.avisos_perfil))) if (r.has(rasgo)) poner(t);
    for (const [cond, t] of Object.entries(objeto(e.avisos_condicion))) if (p.condiciones.includes(cond)) poner(t);
    // Rehidratación (criterio 64, `rehidratacion: true`: el suero oral): nada que la retrase. Sin «pregunta antes de
    // tomarlo» por «No sé», embarazo ni ámbar; las señales para ir hoy ya van en su `aviso` (curado, con fuente).
    const rehidrata = e.rehidratacion === true || SIN_AVISO_EMBARAZO.includes(e.id);
    if (rehidrata) return out;
    if (esRiesgo(e) && p.medicinasDesconocidas) poner(T.aviso_no_se);
    // En el embarazo, «pregúntalo en tu control prenatal», salvo que su «cómo» ya lo diga (ácido fólico y hierro)
    if (e.tipo === "suplemento" && p.embarazo && !/control prenatal/i.test(e.como || "")) poner(T.embarazo_suplemento);
    if (e.tipo === "suplemento" && p.nivel === "ambar") poner(T.ambar_suplemento);
    return out;
  }

  /* ---------- Orden por tema ---------- */
  /** Evidencia de la entrada para ESTE tema: `ayuda_por_tema[tema]` si existe; si no, `ayuda`. */
  function ayudaEn(e, tema) {
    const pt = e && e.ayuda_por_tema;
    return pt && typeof pt[tema] === "number" ? pt[tema] : (e && e.ayuda) || 1;
  }
  /** Avisos que aplican a ESTA persona: los de avisosPara menos el aviso general de la entrada (que ve todo el mundo). */
  function avisosPersonales(e, p) { return avisosPara(e, p).filter(a => !esGeneral(a, e)).length; }
  /** puntaje(e, tema, p): la evidencia manda (lo demás suma como máximo 83 y resta como máximo 20). */
  function puntaje(e, tema, p) {
    const pertinencia = (e.temas || [])[0] === tema ? 2 : 1;
    const senalPerfil = (e.prioriza_si || []).some(k => rasgos(p).has(k)) ? 1 : 0;
    const acceso = (PESO_DONDE[e.donde] ?? 0) + (e.costo === 1 ? 1 : 0);
    return 100 * ayudaEn(e, tema) + 20 * pertinencia + 15 * senalPerfil + 8 * (PESO_TIPO[e.tipo] ?? 0) + 4 * acceso
      - Math.min(20, 10 * avisosPersonales(e, p));
  }
  /** Ordena las entradas de un tema por puntaje; desempate: costo menor y luego id (el orden siempre sale igual). */
  function ordenarTema(lista, tema, p) {
    const orden = lista.map(e => [e, puntaje(e, tema, p)])
      .sort((x, y) => y[1] - x[1] || (x[0].costo || 1) - (y[0].costo || 1) || (x[0].id < y[0].id ? -1 : x[0].id > y[0].id ? 1 : 0))
      .map(x => x[0]);
    // T12-b: a igual evidencia para este tema, la primera es comida o hábito, no planta ni suplemento.
    // El puntaje lo daba por los pesos; con `donde: "centro_salud"` (criterio 40: ácido fólico) un suplemento empataba.
    if (orden.length && esRiesgo(orden[0])) {
      const k = orden.findIndex(e => (e.tipo === "alimento" || e.tipo === "habito") && ayudaEn(e, tema) === ayudaEn(orden[0], tema));
      if (k > 0) orden.unshift(orden.splice(k, 1)[0]);
    }
    return orden;
  }
  const permitido = (t, e) => !t || !Array.isArray(t.tipos_permitidos) || t.tipos_permitidos.includes(e.tipo);
  /** Opciones aptas de una sección para el perfil (solo los tipos que la sección permite), de la más adecuada a la menos. */
  function opciones(temaId, p) {
    const t = temaDe(temaId);
    return ordenarTema(corpus().entradas.filter(e => (e.temas || []).includes(temaId) && permitido(t, e) && apta(e, p)), temaId, p);
  }
  /** ¿Se muestra la sección a este perfil? Oculta con < 3 opciones aptas o si su grupo de edad está en ocultar_grupos. */
  function visible(t, p) {
    if (!t || !p) return false;
    if ((t.ocultar_grupos || []).includes(p.grupo)) return false;
    // ocultar_si: rasgos del perfil para los que la sección no toca (Cólicos de la regla en el embarazo)
    if (Array.isArray(t.ocultar_si) && t.ocultar_si.some(k => rasgos(p).has(k))) return false;
    return opciones(t.id, p).length >= MIN_OPCIONES;
  }
  function seccionesVisibles(p) { return temas().filter(t => visible(t, p)); }
  /** Situaciones que se sugieren solas (máx. 2, por prioridad) según el perfil; solo las visibles. */
  function sugeridas(p) {
    if (!p) return [];
    const r = rasgos(p);
    return temas().filter(t => Array.isArray(t.sugerir_si) && t.sugerir_si.some(k => r.has(k)) && visible(t, p))
      .sort((a, b) => (a.prioridad ?? 99) - (b.prioridad ?? 99)).slice(0, MAX_SUGERIDAS).map(t => t.id);
  }

  /* ---------- Orden simple (alternativas y hábito de respaldo) ---------- */
  function comparar(a, b) {
    return (ORDEN_TIPO[a.tipo] ?? 9) - (ORDEN_TIPO[b.tipo] ?? 9)
      || (b.ayuda || 0) - (a.ayuda || 0)
      || (a.costo || 1) - (b.costo || 1);
  }
  const ordenar = (lista) => lista.map((e, i) => [e, i]).sort((x, y) => comparar(x[0], y[0]) || x[1] - y[1]).map(x => x[0]);

  /* ---------- Alternativas ---------- */
  const comidaOHabito = (e) => e.tipo === "alimento" || e.tipo === "habito";
  /** Mismo remedio con otro id: mismo género y especie (manzanilla y manzanilla_piel: Matricaria chamomilla) o una pareja
      de la lista MISMO_REMEDIO. Ya no se decide por el prefijo del id (agua_segura no es «agua»). */
  function mismoRemedio(a, b) {
    const bin = (e) => String(e.nombre_cientifico || "").toLowerCase().replace(/\(.*?\)/g, " ").trim().split(/\s+/).slice(0, 2).join(" ");
    if (a.nombre_cientifico && b.nombre_cientifico && bin(a) === bin(b)) return true;
    return MISMO_REMEDIO.some(par => par.includes(a.id) && par.includes(b.id));
  }
  /** Tipos que se pueden ofrecer como alternativa: los de la sección de la tarjeta; sin sección, solo los que permiten
      TODAS las secciones de la entrada que restringen tipos (el motor filtra aunque los datos se equivoquen). */
  function tiposAlternativa(e, tema) {
    const restringe = (t) => t && Array.isArray(t.tipos_permitidos);
    if (tema) { const t = temaDe(tema); return restringe(t) ? t.tipos_permitidos : null; }
    const listas = (e.temas || []).map(temaDe).filter(restringe).map(t => t.tipos_permitidos);
    return listas.length ? Object.keys(ORDEN_TIPO).filter(k => listas.every(l => l.includes(k))) : null;
  }
  /** Hasta 2 alternativas, SOLO de la lista `alternativas` de la entrada (curada: sirven para lo mismo), filtradas por
      apta() y por tipos_permitidos; al menos una es alimento o hábito si la lista lo permite; nunca la misma entrada ni el
      mismo remedio con otro id. Ya no se rellena con otras entradas del mismo tema (decisión de diseño,
      2026-11-02: le salía «tortilla» a jugar_5a17). `sin_cambio: true`: ninguna. `tema`: la sección de la tarjeta. */
  function alternativas(id, p, tema) {
    if (!p || p.nivel === "rojo") return [];
    const e = porId(id); if (!e || e.sin_cambio) return [];
    const tipos = tiposAlternativa(e, tema);
    const sirve = (o) => !!o && o.id !== e.id && !mismoRemedio(o, e) && (!tipos || tipos.includes(o.tipo)) && apta(o, p);
    const candidatas = (e.alternativas || []).map(porId).filter(sirve)
      .filter((o, i, l) => l.findIndex(x => x === o || mismoRemedio(x, o)) === i);
    const out = candidatas.slice(0, 2);
    if (out.length && !out.some(comidaOHabito)) { // al menos una alternativa es comida o hábito: cambia la segunda
      const comida = candidatas.find(comidaOHabito);
      if (comida) out[out.length - 1] = comida;
    }
    return out;
  }
  /** «Cómo y cuánto» para esta persona: a menores de 12, el texto para niños si lo hay. */
  function comoPara(e, p) { return p && p.edad < 12 && e.cuanto_ninos ? "Para el niño o la niña: " + e.cuanto_ninos : e.como; }
  /** Lo que muestra, dice e imprime «No lo encuentro» (la pantalla, la voz y la hoja usan esto mismo).
      entrada: id o la entrada (las tarjetas de señal no están en el corpus).
      - sin_cambio: «Esta no tiene cambio.» + su si_no_hay (no se rellena con otro hábito).
      - sin alternativas aptas para este perfil: «Esta no tiene cambio para tu caso…» (no se lee si_no_hay, que puede
        nombrar algo que a esta persona no le toca). */
  function noLoEncuentro(entrada, p, tema) {
    const T = TX();
    const e = typeof entrada === "string" ? porId(entrada) : entrada;
    if (e && e.sin_cambio) return { sinCambio: true, intro: T.sin_cambio_propio, texto: e.si_no_hay || "", alternativas: [] };
    const alts = e ? alternativas(e.id, p, tema) : [];
    if (!alts.length) return { sinCambio: true, intro: T.sin_alternativa, texto: "", alternativas: [] };
    const plantilla = e.tipo === "habito" ? T.si_no_hay_habito : T.si_no_hay;
    return {
      sinCambio: false,
      intro: plantilla.replace("{nombre}", String(e.nombre || "")), // los nombres ya vienen bien escritos («Vida Suero Oral»)
      texto: "",
      alternativas: alts.map(a => ({ entrada: a, como: comoPara(a, p) || a.para, avisos: avisosPara(a, p), pie: a.tipo === "planta" ? T.planta_pie : "" }))
    };
  }
  const punto = (t) => (!t ? "" : /[.!?…:]$/.test(t.trim()) ? t.trim() : t.trim() + ".");
  /** Texto corrido de noLoEncuentro: "voz" (con cómo y cuánto) u "hoja" (nombres y avisos, corto). */
  function textoNoLoEncuentro(info, modo) {
    if (info.sinCambio) return [punto(info.intro), punto(info.texto)].filter(Boolean).join(" ");
    const una = (a) => modo === "hoja"
      ? a.entrada.nombre + (a.avisos.length ? " (" + a.avisos.map(punto).join(" ") + ")" : "")
      : [punto(a.entrada.nombre + ": " + a.como), a.avisos.length ? "Cuidado: " + a.avisos.map(punto).join(" ") : "", a.pie].filter(Boolean).join(" ");
    return info.intro + " " + (modo === "hoja" ? punto(info.alternativas.map(una).join(" o ")) : info.alternativas.map(una).join(" "));
  }

  /* ---------- «Cuidado con esto» (criterio 16, data/cuidado.js) ----------
     Decisiones de diseño (2026-11-02): hasta 2 tarjetas por sección (antes 1), las más graves que le toca al perfil
     (el orden del arreglo es el de gravedad); una tarjeta no se repite en dos secciones de la misma consulta; `perfiles`
     vacío = todos («nino» = menor de 12); en rojo no sale ninguna. «En su lugar» usa los ids del corpus filtrados con apta()
     y con los tipos que permite la sección (como «No lo encuentro»): el texto curado
     (`texto_en_su_lugar`) solo si TODAS son aptas y ninguna trae un aviso personal para esta persona (el texto podría nombrar algo
     que no le toca); si no, se listan las aptas con su «cómo» y sus avisos; si ninguna es apta, no hay «En su lugar». */
  function tarjetasCuidado() { const c = datos().cuidado; return c && Array.isArray(c.tarjetas) ? c.tarjetas : []; }
  /** Rasgos para `perfiles` de cuidado: «nino» solo si la persona tiene menos de 12 (no a quien consulta por un adolescente). */
  function rasgosCuidado(p) { const r = rasgos(p); if (p.edad >= 12) r.delete("nino"); return r; }
  /** `edad_minima` (criterio 40): la tarjeta no sale a quien tiene menos (p. ej. ashwagandha o toloache a un niño de 3 años). */
  const edadToca = (x, p) => !x || typeof x.edad_minima !== "number" || p.edad >= x.edad_minima;
  /** Ronda 3 (criterio 73): `edad_maxima_nino` (exclusiva, contra la edad más alta del grupo, como `excluir.edad_maxima`):
      el rasgo «nino» de `perfiles` solo cuenta si el niño o la niña tiene menos de esa edad. Los demás rasgos (p. ej.
      «lactancia») no cambian: te_agua_bebe sale a menores de 2 años y a quien da pecho. */
  function rasgosDeTarjeta(c, p, r) {
    if (typeof c.edad_maxima_nino !== "number" || !r.has("nino") || (p.edadMax ?? p.edad) < c.edad_maxima_nino) return r;
    const sin = new Set(r); sin.delete("nino"); return sin;
  }
  function cuidadoToca(c, p, r) {
    const rt = rasgosDeTarjeta(c, p, r);
    return edadToca(c, p) && (!Array.isArray(c.perfiles) || !c.perfiles.length || c.perfiles.some(k => rt.has(k)));
  }
  /** Ronda 3 (criterio 73): `en_su_lugar_por_seccion: { tema: { en_su_lugar: [ids], texto_en_su_lugar } }` cambia el
      «En su lugar» de la tarjeta cuando sale en esa sección (la ruda en Embarazo: lo del embarazo, no lo de los cólicos). */
  function enSuLugar(c, p, tema) {
    const propia = objeto(objeto(c.en_su_lugar_por_seccion)[tema]);
    if (Array.isArray(propia.en_su_lugar)) c = Object.assign({}, c, { en_su_lugar: propia.en_su_lugar, texto_en_su_lugar: propia.texto_en_su_lugar || "" });
    const ids = Array.isArray(c.en_su_lugar) ? c.en_su_lugar : [];
    const t = temaDe(tema); // como en «No lo encuentro»: solo los tipos que permite la sección (Niños: comida y hábitos)
    const aptas = ids.map(porId).filter(e => e && apta(e, p) && permitido(t, e));
    const alternativas = aptas.map(e => ({ entrada: e, como: comoPara(e, p) || e.para, avisos: avisosPara(e, p) }));
    // El aviso general de la entrada lo conoce la curaduría que escribió el texto; un aviso PERSONAL (medicina, perfil,
    // condición, «No sé»…) no: entonces se listan las alternativas con sus avisos.
    const completo = ids.length > 0 && aptas.length === ids.length && alternativas.every(a => a.avisos.every(x => esGeneral(x, a.entrada)));
    return { alternativas, texto: completo ? String(c.texto_en_su_lugar || "") : "" };
  }
  /** cuidadoSecciones(temas, p) → { tema: [ { tema, tarjeta, alternativas: [{ entrada, como, avisos }], texto }, … ] } con hasta
      MAX_CUIDADO tarjetas por sección (decisión de diseño, 2026-11-02: «hasta 2 por sección, las 2 más graves»).
      Se reparte por vueltas: en la 1.ª vuelta cada sección toma la más grave que le toca y que no salió en otra sección (lo
      mismo que antes con 1 por sección); en la 2.ª vuelta, la siguiente. Así ninguna sección se queda sin su primera tarjeta
      porque otra se llevó dos, y nunca salen 2 iguales en la misma consulta. En rojo no sale ninguna. */
  const MAX_CUIDADO = 2;
  function cuidadoSecciones(listaTemas, p) {
    const out = {};
    const elegidos = (listaTemas || []).filter(Boolean);
    for (const tema of elegidos) out[tema] = [];
    if (!p || p.nivel === "rojo") return out;
    const r = rasgosCuidado(p); const usadas = new Set();
    for (let vuelta = 0; vuelta < MAX_CUIDADO; vuelta++) {
      for (const tema of elegidos) {
        if (out[tema].length !== vuelta) continue; // la sección ya no tiene más tarjetas que le toquen
        const c = tarjetasCuidado().find(x => !usadas.has(x.id) && (x.secciones || []).includes(tema) && cuidadoToca(x, p, r));
        if (!c) continue;
        usadas.add(c.id);
        out[tema].push(Object.assign({ tema, tarjeta: c }, enSuLugar(c, p, tema)));
      }
    }
    return out;
  }
  /** cuidado(temas, p) → { tema: la más grave de su sección | null } (la primera de cuidadoSecciones). */
  function cuidado(listaTemas, p) {
    const todas = cuidadoSecciones(listaTemas, p);
    return Object.fromEntries(Object.entries(todas).map(([tema, l]) => [tema, l[0] || null]));
  }
  /** Texto de una tarjeta de cuidado: "voz" (todo), "pantalla" (lo mismo, para revisar) u "hoja" (corto: nombre y en su
      lugar; el porqué ya se vio y se oyó en la pantalla). Sin alternativas aptas no dice «En su lugar». */
  const personales = (a) => a.avisos.filter(x => !esGeneral(x, a.entrada));
  function textoCuidado(info, modo) {
    if (!info) return "";
    const c = info.tarjeta; const TC = (datos().cuidado && datos().cuidado.textos) || {};
    const titulo = TC.titulo || "Cuidado con esto"; const lugar = TC.en_su_lugar || "En su lugar";
    // En la hoja van los nombres de las alternativas (más corto que el texto curado: la hoja cabe en 1 carta)
    // En la hoja: solo los nombres de las que no traen un aviso personal ni son plantas (esas se vieron y oyeron con su
    // aviso y el pie de uso tradicional; en la hoja no cabría el pie)
    const alts = (modo !== "hoja" && info.texto) || (modo === "hoja" ? info.alternativas.filter(a => !personales(a).length && a.entrada.tipo !== "planta") : info.alternativas).map(a => modo === "hoja"
      ? a.entrada.nombre
      : [punto(a.entrada.nombre + ": " + a.como), a.avisos.length ? "Cuidado: " + a.avisos.map(punto).join(" ") : ""].filter(Boolean).join(" ")).join(modo === "hoja" ? "; " : " ");
    const enLugar = alts ? `${lugar}: ${punto(alts)}` : "";
    // La hoja es un recordatorio en una línea corrida: «Té de ruda (en su lugar: Calor tibio en la panza; Baño tibio)»
    if (modo === "hoja") return alts ? `${c.nombre} (${lugar.toLowerCase()}: ${alts})` : c.nombre;
    const pie = info.alternativas.some(a => a.entrada.tipo === "planta") ? TX().planta_pie : ""; // como en las ideas
    return [`${titulo}: ${punto(c.nombre)}`, punto(c.que_es), punto(c.por_que_cuidado), enLugar, pie, punto(c.urgente_si)].filter(Boolean).join(" ");
  }

  /* ---------- Encabezado personal ---------- */
  function encabezado(p) {
    const T = TX();
    if (p.nivel === "rojo") return T.encabezado_rojo || "";
    const yo = p.persona === "yo";
    const sujeto = p.persona === "nino" ? "Para el niño o la niña" : p.persona === "otra" ? "Para la persona" : "Para ti";
    const v = (tu, el) => (yo ? tu : el);
    const rasgos = [];
    if (p.embarazo) rasgos.push(v("estás embarazada", "está embarazada"));
    else if (p.lactancia) rasgos.push(v("estás dando pecho", "está dando pecho"));
    else if (p.edad < 12) rasgos.push("tiene " + (TEXTO_NINO[p.edadNino] || "menos de 12 años"));
    else if (p.edad >= 60) rasgos.push(v("tienes 60 años o más", "tiene 60 años o más"));
    if (p.cronico.azucar && p.cronico.presion) rasgos.push(v("tomas medicina para el azúcar y la presión", "toma medicina para el azúcar y la presión"));
    else if (p.cronico.azucar) rasgos.push(v("tomas medicina para el azúcar", "toma medicina para el azúcar"));
    else if (p.cronico.presion) rasgos.push(v("tomas medicina para la presión", "toma medicina para la presión"));
    let estado = "";
    if (p.senales.fiebre) estado = v("hoy tienes temperatura alta", "hoy tiene temperatura alta");
    else if (p.nivel === "verde") estado = v("hoy saliste en verde", "hoy salió en verde");
    else if (p.nivel === "ambar") estado = v("hoy conviene que pases al centro de salud", "hoy conviene que pase al centro de salud");
    const partes = [...rasgos, estado].filter(Boolean);
    const unidas = partes.length > 1 ? partes.slice(0, -1).join(", ") + " y " + partes[partes.length - 1] : partes[0];
    const cierre = v("estas ideas toman en cuenta tu caso.", "estas ideas toman en cuenta su caso.");
    return unidas ? `${sujeto}, que ${unidas}: ${cierre}` : `${sujeto}: ${cierre}`;
  }

  /* ---------- Recomendar ---------- */
  function senal(clave, p) {
    const base = (TX().senales || {})[clave];
    if (!base) return null;
    return Object.assign({ temas: [], excluir: { embarazo: false, lactancia: false, edad_minima: 0, medicinas: [], condiciones: [] }, alternativas: [] }, base);
  }

  /** recomendar(sesion, resultado, temas) → { bloqueado, encabezado, tarjetas: [{ entrada, tema, porque, avisos }], mensajes, perfil }. */
  function recomendar(sesion, resultado, listaTemas) {
    const s = sesion || {};
    if (!resultado && window.MediBotReglas && s.medidas && s.alarma) resultado = window.MediBotReglas.evaluar(s);
    const p = perfil(s, resultado);
    const T = TX();
    const elegidos = (listaTemas || s.categorias || []).filter(Boolean);
    if (p.nivel === "rojo") return { bloqueado: true, encabezado: encabezado(p), tarjetas: [], mensajes: [], franjas: [], cuidado: cuidado(elegidos, p), cuidados: cuidadoSecciones(elegidos, p), perfil: p };

    const yo = p.persona === "yo";
    const tarjetas = []; const usados = new Set(); const mensajes = [];
    const agregar = (entrada, tema, porque, forzar) => {
      if (!entrada || (usados.has(entrada.id) && !forzar)) return false;
      usados.add(entrada.id);
      tarjetas.push({ entrada, tema, porque, avisos: avisosPara(entrada, p) });
      return true;
    };

    // 1. Señales y etapa
    if (p.senales.fiebre) agregar(senal("hidratacion", p), null, yo ? "Porque hoy tienes temperatura alta." : "Porque hoy tiene temperatura alta.");
    if (p.embarazo) agregar(senal("prenatal", p), null, yo ? "Porque estás embarazada." : "Porque está embarazada.");

    // 2. Por tema: las de mejor puntaje, con variedad
    const franjas = [];
    // Comida y hábitos de cada sección: una sección no se lleva la última comida u hábito que le queda a una sección
    // posterior (si no, esa sección se quedaría sin ninguno; caso encontrado en pruebas: bebé con Defensas + Diarrea).
    const comidasDe = elegidos.map(tm => opciones(tm, p).filter(comidaOHabito));
    const dejaSinComida = (e, k, elegidas) => comidasDe.slice(k + 1).some(lista => lista.includes(e)
      && !lista.some(x => x !== e && !usados.has(x.id) && !elegidas.includes(x)));
    for (const [k, tema] of elegidos.entries()) {
      const t = temaDe(tema);
      const porque = (yo ? "Porque elegiste cuidar: " : "Porque eligieron cuidar: ") + nombreTema(tema) + ".";
      // Criterio 40: a un menor de 12, sin la franja de adulto (`edad_minima`) ni sus frases de adulto (`texto_no_ninos`)
      const ci = t && t.cuando_ir;
      const textoIr = ci && ci.texto && edadToca(ci, p) ? (esMenor(p) && Array.isArray(ci.texto_no_ninos) ? sinFrases(ci.texto, ci.texto_no_ninos) : ci.texto) : null;
      if (textoIr) franjas.push({ tema, texto: textoIr, fuentes: ci.fuentes || [] });
      const candidatos = opciones(tema, p);
      const maximo = MAX_TARJETAS[t && t.clase] || MAX_TARJETAS.molestia;
      const elegidas = []; const porTipo = {};
      // Sección de un solo tipo (Dolor de cabeza: solo hábitos): el tope «2 por tipo» no aplica; manda el de la sección
      const unTipo = !!t && Array.isArray(t.tipos_permitidos) && t.tipos_permitidos.length === 1;
      const cabe = (tipo) => unTipo || (porTipo[tipo] || 0) < (MAX_POR_TIPO[tipo] ?? 1);
      for (const e of candidatos) {
        if (elegidas.length >= maximo) break;
        if (usados.has(e.id) || !cabe(e.tipo)) continue;
        if (elegidas.length && comidaOHabito(e) && dejaSinComida(e, k, elegidas)) continue; // la primera (mejor evidencia) no se toca
        elegidas.push(e); porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
      }
      if (elegidas.length && !elegidas.some(comidaOHabito)) { // siempre ≥ 1 alimento o hábito: la última se cambia
        const comida = candidatos.find(e => comidaOHabito(e) && !usados.has(e.id));
        if (comida) elegidas[elegidas.length - 1] = comida;
      }
      // Criterio 11: si la sección tiene una actividad física apta (`actividad: true`), va al menos una. Si ya no cabe,
      // sale el último hábito que no es ancla de seguridad; si todos lo son y hay lugar, se agrega aunque pase de
      // 2 hábitos; si no hay lugar, sale la última tarjeta que no es ancla. Nunca la primera (la de mejor evidencia,
      // criterio 12) ni un ancla de seguridad (ANCLAS_SEGURIDAD: lavarse las manos, agua segura, vacunas, suero oral).
      if (elegidas.length && !elegidas.some(e => e.actividad)) {
        const act = candidatos.find(e => e.actividad && !usados.has(e.id) && !elegidas.includes(e) && !dejaSinComida(e, k, elegidas));
        if (act) {
          const hayLugar = elegidas.length < maximo;
          const ultimo = (ok) => { for (let i = elegidas.length - 1; i > 0; i--) if (!ANCLAS_SEGURIDAD.includes(elegidas[i].id) && ok(elegidas[i])) return i; return -1; };
          const cambiar = (j) => { if (j > 0) { elegidas.splice(j, 1); elegidas.push(act); return true; } return false; };
          if (hayLugar && cabe(act.tipo)) elegidas.push(act);
          else if (!cambiar(ultimo(e => e.tipo === act.tipo))) {
            if (hayLugar) elegidas.push(act); else cambiar(ultimo(() => true));
          }
        }
      }
      let n = 0;
      for (const e of elegidas) if (agregar(e, tema, porque)) n++;
      if (n === 0 && candidatos.length) { agregar(candidatos[0], tema, porque, true); n = 1; } // todas ya salieron en otro tema
      if (n === 0) {
        // Todo quedó excluido para este perfil: alimentos y hábitos seguros de cualquier tema + mensaje
        const seguros = ordenar(corpus().entradas.filter(e => (e.tipo === "habito" || e.tipo === "alimento") && apta(e, p)))
          .sort((a, b) => Number(usados.has(a.id)) - Number(usados.has(b.id))); // primero las que todavía no salieron
        const porqueSin = T.sin_tema || "";
        for (const e of seguros) { if (n >= 2) break; if (agregar(e, tema, porqueSin, true)) n++; }
        if (n === 0 && T.base) agregar(Object.assign({ temas: [tema], excluir: { embarazo: false, lactancia: false, edad_minima: 0, medicinas: [], condiciones: [] }, alternativas: [] }, T.base), tema, porqueSin, true);
        mensajes.push({ tema, texto: T.sin_tema });
      }
    }
    return { bloqueado: false, encabezado: encabezado(p), tarjetas, mensajes, franjas, cuidado: cuidado(elegidos, p), cuidados: cuidadoSecciones(elegidos, p), perfil: p };
  }

  /* ---------- Hoja impresa (M2; ronda 3, criterio 58) ---------- */
  // Rasgos que hacen «de la situación» a una sección-situación (Embarazo y dar pecho, Niñas y niños, Persona mayor)
  const RASGOS_SITUACION = ["embarazo", "lactancia", "nino", "mayor60"];
  /** paraHoja(rec, categorias, { omitir = [], aceptadas = [] } = {}) → [tarjeta] (las mismas de rec.tarjetas), máximo
      MAX_HOJA para que quepa en una carta.
      - omitir: ids de entrada que no van (p. ej. ["senal_prenatal"] si la hoja ya lo dice en otra línea).
      - aceptadas: ids de entrada que la persona aceptó en sus ideas («Lo tengo»). Opcional; sin ella, como antes.
      Qué entra (criterio 58), en este orden, hasta llenar:
        1. las de señal (fiebre, embarazo);
        2. una de CADA sección elegida; si no caben todas, primero las secciones de la situación de la persona;
        3. las demás, por prioridad: de la situación y aceptada → de la situación o aceptada → el resto → la actividad
           genérica de adultos cuando la persona está embarazada y tiene la del embarazo (caminar ↔ mover_embarazo).
      «De la situación»: la tarjeta es de una sección-situación que se le sugiere a ESTA persona por embarazo o lactancia,
      niño o persona mayor (`sugerir_si` con esos rasgos), o la entrada es `solo_embarazo` y la persona está embarazada.
      La idea de cada sección (paso 2) es la primera de esa sección según la misma prioridad (sin situación ni aceptadas:
      la de mejor evidencia, como antes). Orden impreso: señales, luego por sección (primero las molestias, luego las
      situaciones) y dentro de cada sección en el orden de rec.tarjetas. Nota: lo que entra depende de `aceptadas`; si la
      pantalla de ideas la pasa a medias (antes de terminar), una idea puede entrar o salir al aceptar otra. */
  function paraHoja(rec, categorias, opciones) { return elegirHoja(rec, categorias, opciones).impresas; }
  /** recorteHoja(rec, categorias, opciones) → las mismas tarjetas de paraHoja, en orden de PRIORIDAD (la primera es la que
      más importa). Si la hoja impresa no cabe en una carta, js/pantallas.js (ajustarHoja) quita «ideas de más» empezando
      por la última de esta lista (criterio 58: primero se quedan las de la situación y las aceptadas). */
  function recorteHoja(rec, categorias, opciones) { return elegirHoja(rec, categorias, opciones).prioridad; }
  function elegirHoja(rec, categorias, { omitir = [], aceptadas = [] } = {}) {
    if (!rec || rec.bloqueado) return { impresas: [], prioridad: [] };
    const quitar = Array.isArray(omitir) ? omitir : [];
    const ts = (rec.tarjetas || []).filter(t => t && t.entrada && !quitar.includes(t.entrada.id)); // p. ej. el control prenatal, si la hoja ya lo dice
    const elegidos = [...new Set((categorias || []).filter(Boolean))];
    const p = rec.perfil || null; const r = p ? rasgos(p) : new Set();
    const acept = new Set(Array.isArray(aceptadas) ? aceptadas : []);
    const esSituacion = (id) => { const t = temaDe(id); return !!t && t.clase === "situacion"; };
    const temaDeSituacion = (id) => { const t = temaDe(id); return esSituacion(id) && Array.isArray(t.sugerir_si) && t.sugerir_si.some(k => RASGOS_SITUACION.includes(k) && r.has(k)); };
    const deSituacion = (t) => (!!t.tema && temaDeSituacion(t.tema)) || (!!p && p.embarazo && !!t.entrada.solo_embarazo);
    const actEmbarazo = (e) => !!e.actividad && (!!e.solo_embarazo || (e.prioriza_si || []).includes("embarazo"));
    const hayActEmbarazo = !!p && p.embarazo && ts.some(t => actEmbarazo(t.entrada));
    const relegada = (t) => hayActEmbarazo && !!t.entrada.actividad && !actEmbarazo(t.entrada);
    const nivel = (t) => relegada(t) ? 3 : deSituacion(t) && acept.has(t.entrada.id) ? 0 : deSituacion(t) || acept.has(t.entrada.id) ? 1 : 2;
    const ordenHoja = [...elegidos.filter(id => !esSituacion(id)), ...elegidos.filter(esSituacion)]; // orden impreso
    const ordenRecorte = [...ordenHoja.filter(temaDeSituacion), ...ordenHoja.filter(id => !temaDeSituacion(id))];
    const pos = (lista, x) => { const i = lista.indexOf(x); return i < 0 ? lista.length : i; };
    const prioridad = (lista) => lista.map((t, i) => [t, i])
      .sort((a, b) => nivel(a[0]) - nivel(b[0]) || pos(ordenRecorte, a[0].tema) - pos(ordenRecorte, b[0].tema) || a[1] - b[1]).map(x => x[0]);
    const dentro = new Set(); const primeras = new Map(); // sección → su idea del paso 2
    const poner = (t) => { if (t && dentro.size < MAX_HOJA) dentro.add(t); return dentro.has(t); };
    ts.filter(t => !t.tema).forEach(poner);
    for (const id of ordenRecorte) { const t = prioridad(ts.filter(x => x.tema === id))[0]; if (t && !dentro.has(t) && poner(t)) primeras.set(id, t); }
    prioridad(ts.filter(t => t.tema)).forEach(poner);
    // Orden impreso (el de siempre): señales, la idea de cada sección (molestias y luego situaciones) y las demás por sección
    const extra = ts.map((t, i) => [t, i]).filter(x => x[0].tema && dentro.has(x[0]) && primeras.get(x[0].tema) !== x[0])
      .sort((a, b) => pos(ordenHoja, a[0].tema) - pos(ordenHoja, b[0].tema) || a[1] - b[1]).map(x => x[0]);
    return { impresas: [...ts.filter(t => !t.tema && dentro.has(t)), ...ordenHoja.map(id => primeras.get(id)).filter(Boolean), ...extra], prioridad: [...dentro] };
  }
  /** vaEnHoja(tarjeta, rec, categorias, opciones) → true si esa idea sale en la hoja impresa (para «Va en tu hoja»).
      Mismos `categorias` y `opciones` ({ omitir, aceptadas }) que la hoja. Compara por id de entrada y sección, así sirve
      aunque la pantalla de ideas y la hoja calculen cada una su propio rec. */
  function vaEnHoja(tarjeta, rec, categorias, opciones) {
    if (!tarjeta || !tarjeta.entrada) return false;
    const tema = tarjeta.tema || null;
    return paraHoja(rec, categorias, opciones || {}).some(t => t.entrada.id === tarjeta.entrada.id && (t.tema || null) === tema);
  }
  function tituloHoja(n) { return n === 1 ? "Tu idea" : `Tus ${n} ideas`; }

  /* ---------- Leyenda COFEPRIS (criterio 40) ---------- */
  /** requiereLeyenda(entrada) → true si la entrada lleva la leyenda de suplementos («ESTE PRODUCTO NO ES UN MEDICAMENTO…»):
      solo los suplementos que la persona compra por su cuenta. Lo que se pide en el centro de salud (`donde: "centro_salud"`:
      suero oral, ácido fólico y hierro del control prenatal) no la lleva. Sin entrada válida → false. */
  function requiereLeyenda(entrada) { return !!entrada && typeof entrada === "object" && entrada.tipo === "suplemento" && entrada.donde !== "centro_salud"; }

  /* ---------- Texto de apoyo para la interfaz ---------- */
  const TIPO_TEXTO = { alimento: "Comida", habito: "Hábito", planta: "Planta de uso tradicional", suplemento: "Suplemento" };
  function textoAyuda(n) { const L = TX().ayuda_niveles || []; return L[Math.min(Math.max((n || 1) - 1, 0), L.length - 1)] || ""; }

  window.MediBotRecomendaciones = {
    perfil, esSegura, apta, recomendar, alternativas, avisosPara, encabezado, mismoRemedio, ANCLAS_SEGURIDAD,
    noLoEncuentro, textoNoLoEncuentro, comoPara, paraHoja, recorteHoja, vaEnHoja, requiereLeyenda, EDAD_MENOR, tituloHoja, MAX_HOJA, cuidado, cuidadoSecciones, MAX_CUIDADO, textoCuidado,
    ayudaEn, puntaje, opciones, visible, seccionesVisibles, sugeridas, rasgos,
    corpus, temas, grupos, temaDe, porId, nombreTema, usaRespaldo, textoAyuda, TIPO_TEXTO, CLAVES_MEDICINA
  };
})();
