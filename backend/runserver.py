"""Start Django runserver and Daphne together for local development."""

from __future__ import annotations

import argparse
import os
import signal
import subprocess
import sys
import time
from pathlib import Path


def resolve_python(script_dir: Path) -> str:
    """Prefer backend/venv Python if available, fallback to current interpreter."""
    windows_venv_python = script_dir / "venv" / "Scripts" / "python.exe"
    unix_venv_python = script_dir / "venv" / "bin" / "python"

    if windows_venv_python.exists():
        return str(windows_venv_python)
    if unix_venv_python.exists():
        return str(unix_venv_python)
    return sys.executable


def stop_process(proc: subprocess.Popen[bytes], name: str) -> None:
    """Stop a child process if it is still running."""
    if proc.poll() is not None:
        return

    print(f"[stop] Finalizando {name} (pid={proc.pid})...")
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        print(f"[stop] {name} nao respondeu, forçando encerramento.")
        proc.kill()
        proc.wait(timeout=5)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Inicia Django runserver e Daphne juntos."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host de bind.")
    parser.add_argument(
        "--django-port", type=int, default=8000, help="Porta do Django runserver."
    )
    parser.add_argument(
        "--daphne-port", type=int, default=8001, help="Porta do Daphne."
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    python_exec = resolve_python(script_dir)

    env = os.environ.copy()
    env.setdefault("DJANGO_SETTINGS_MODULE", "helpsister.settings")

    django_cmd = [
        python_exec,
        "manage.py",
        "runserver",
        f"{args.host}:{args.django_port}",
    ]
    daphne_cmd = [
        python_exec,
        "-m",
        "daphne",
        "-b",
        args.host,
        "-p",
        str(args.daphne_port),
        "helpsister.asgi:application",
    ]

    print(f"[info] Python: {python_exec}")
    print(f"[start] Django -> http://{args.host}:{args.django_port}")
    django_proc = subprocess.Popen(django_cmd, cwd=script_dir, env=env)

    print(f"[start] Daphne -> ws/http ASGI em {args.host}:{args.daphne_port}")
    daphne_proc = subprocess.Popen(daphne_cmd, cwd=script_dir, env=env)

    try:
        while True:
            django_code = django_proc.poll()
            daphne_code = daphne_proc.poll()

            if django_code is not None:
                print(f"[exit] Django encerrou com codigo {django_code}.")
                break
            if daphne_code is not None:
                print(f"[exit] Daphne encerrou com codigo {daphne_code}.")
                break

            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[info] CTRL+C recebido. Encerrando processos...")
    finally:
        stop_process(django_proc, "Django")
        stop_process(daphne_proc, "Daphne")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
