@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo        SAT Practice Tracker - Windows Launcher
echo ========================================================

:: Check for Python or Py launcher
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=py
) else (
    where python >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PYTHON_CMD=python
    ) else (
        echo [ERROR] Python not found. Please install Python 3.10+ from python.org.
        pause
        exit /b 1
    )
)

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    %PYTHON_CMD% -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

:: Use virtual environment python
if exist "venv\Scripts\python.exe" (
    set PYTHON_CMD=venv\Scripts\python.exe
)

:: Run launcher
%PYTHON_CMD% run.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server terminated with error.
    pause
)
