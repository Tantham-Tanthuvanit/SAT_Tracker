#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "========================================================"
echo "    SAT Practice Tracker - Mac Mini M1 / macOS Launcher"
echo "========================================================"

# Find Python 3
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 is not installed. Please install it via Homebrew (brew install python) or from python.org"
    exit 1
fi

# Create virtual environment if not present
if [ ! -d "venv" ]; then
    echo "[INFO] Setting up virtual environment for Apple Silicon..."
    $PYTHON_CMD -m venv venv
fi

# Use virtual environment python
if [ -f "venv/bin/python" ]; then
    PYTHON_CMD="venv/bin/python"
fi

# Launch app
$PYTHON_CMD run.py
