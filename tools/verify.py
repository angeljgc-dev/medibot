"""Verificación completa de MediBot: lint de contenido + pruebas automáticas (node --test) + pruebas de pantalla en el
navegador (tools/e2e_pantallas.py) + pruebas del rediseño v0.5 y de los paquetes A1–A10 (tools/e2e_rediseno.py) +
desborde y alineación en todas las pantallas de 320 a 1920 px, con «Letra grande» y en claro y oscuro (tools/check_desborde.py). Los dos usan Playwright con chromium y levantan y detienen su propio http.server por PID.
Uso: python tools/verify.py   (desde la carpeta MediBot)"""
import subprocess, sys, pathlib
raiz = pathlib.Path(__file__).resolve().parent.parent
pasos = [
    ["python", str(raiz / "tools" / "lint_contenido.py")],
    ["node", "--test", "--test-reporter=spec", *sorted(str(p) for p in (raiz / "tests").glob("*.test.mjs"))],
    [sys.executable, str(raiz / "tools" / "e2e_pantallas.py")],
    [sys.executable, str(raiz / "tools" / "e2e_rediseno.py")],
    [sys.executable, str(raiz / "tools" / "e2e_ronda2.py")],
    [sys.executable, str(raiz / "tools" / "e2e_ronda3.py")],
    [sys.executable, str(raiz / "tools" / "e2e_ronda4.py")],
    [sys.executable, str(raiz / "tools" / "check_desborde.py")],
]
for cmd in pasos:
    print(">", " ".join(pathlib.Path(c).name if i else c for i, c in enumerate(cmd)), flush=True)
    r = subprocess.run(cmd, cwd=raiz)
    if r.returncode:
        print("VERIFY: FALLÓ"); sys.exit(r.returncode)
print("VERIFY: OK")
