#!/usr/bin/env python3
"""
SAT Practice Tracker - Cross-Platform Home Server Launcher
Works on Mac Mini (Apple Silicon M1/M2/M3), macOS, Linux, and Windows.
Binds to 0.0.0.0:8000 so devices across your local network can connect.
"""

import os
import sys
import subprocess
import platform
import socket
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"
BACKEND_DIR = BASE_DIR / "backend"

def get_lan_ips():
    """Detect local area network IP addresses."""
    ips = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.2)
        s.connect(('10.254.254.254', 1))
        primary = s.getsockname()[0]
        s.close()
        if primary and not primary.startswith("127."):
            ips.append(primary)
    except Exception:
        pass

    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith("127.") and ip not in ips:
                ips.append(ip)
    except Exception:
        pass

    return ips or ["127.0.0.1"]

def ensure_dependencies():
    """Ensure python dependencies are installed."""
    try:
        import fastapi
        import uvicorn
        import pydantic
        import multipart
    except ImportError:
        print("📦 Installing required Python dependencies...")
        req_file = BACKEND_DIR / "requirements.txt"
        cmd = [sys.executable, "-m", "pip", "install", "-r", str(req_file)]
        subprocess.check_call(cmd)

def ensure_frontend_built():
    """Ensure the React frontend is built into static files."""
    if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
        return

    print("🔨 Frontend build not found. Building React frontend...")
    # Find npm executable
    npm_cmd = "npm.cmd" if platform.system() == "Windows" else "npm"
    try:
        subprocess.check_call([npm_cmd, "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        print("⚠️  Warning: Node.js/npm not found. Serving API only mode.")
        return

    print("   - Installing frontend dependencies...")
    subprocess.check_call([npm_cmd, "install"], cwd=str(FRONTEND_DIR))
    print("   - Compiling React application with Vite...")
    subprocess.check_call([npm_cmd, "run", "build"], cwd=str(FRONTEND_DIR))
    print("✅ Frontend build completed successfully!")

def main():
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"

    print("\n" + "=" * 62)
    print("   🎓 SAT PRACTICE TRACKER - HOME SERVER LAUNCHER")
    print("=" * 62)
    print(f"   Platform: {platform.system()} {platform.machine()} ({platform.platform()})")
    print(f"   Python:   {platform.python_version()} ({sys.executable})")

    ensure_dependencies()
    ensure_frontend_built()

    lan_ips = get_lan_ips()

    print("\n" + "-" * 62)
    print("   🚀 Server is starting! Access from your devices:")
    print("-" * 62)
    print(f"   💻 Localhost:    http://localhost:{port}")
    for ip in lan_ips:
        print(f"   📱 Network Link: http://{ip}:{port}  (Open on Phone/iPad)")
    print("-" * 62)
    print("   ℹ️  Make sure your mobile device is on the SAME Wi-Fi.")
    print("   ℹ️  Scan the QR code in the app to pair instantly!")
    print("=" * 62 + "\n")

    # Launch Uvicorn
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=host,
        port=port,
        reload=False
    )

if __name__ == "__main__":
    main()
