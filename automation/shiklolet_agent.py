"""
╔══════════════════════════════════════════════════════════════════╗
║          SHIKLOLET AUTOMATION AGENT (שיקלולט סוכן)              ║
║  Runs on the OFFICE COMPUTER where Shiklolet is installed.       ║
║  Polls the web app for pending tasks, opens Shiklolet, exports   ║
║  the PDF, and sends it back to the web app.                      ║
╚══════════════════════════════════════════════════════════════════╝

Requirements:
  pip install pyautogui pillow requests pygetwindow keyboard pywin32

Before running:
  1. Copy .env.agent.example to .env.agent and fill in your values
  2. Make sure Shiklolet is installed on this PC
  3. Run: python shiklolet_agent.py

How it works:
  - Every 30s it pings the web app to say it's alive (heartbeat)
  - The web app returns any pending export tasks
  - For each task: open Shiklolet → navigate → export PDF → upload to web app
"""

import os
import sys
import time
import json
import logging
import tempfile
import requests
import pyautogui
import subprocess
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────────────────────────
load_dotenv(".env.agent")

APP_URL    = os.environ["APP_URL"]          # e.g. https://cpa-office.vercel.app
AGENT_SECRET = os.environ["AGENT_SECRET"]  # same as SHIKLOLET_AGENT_SECRET in .env
SHIKLOLET_EXE = os.environ.get("SHIKLOLET_EXE", r"C:\Program Files\Shiklolet\Shiklolet.exe")
EXPORT_DIR = Path(os.environ.get("EXPORT_DIR", tempfile.gettempdir()))
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "30"))  # seconds

HEADERS = {
    "x-agent-secret": AGENT_SECRET,
    "Content-Type": "application/json",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("shiklolet_agent.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

MONTHS_HE = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def heartbeat():
    """Ping the server and receive pending tasks."""
    try:
        resp = requests.post(f"{APP_URL}/api/employee/shiklolet/status", headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            return resp.json().get("tasks", [])
    except Exception as e:
        log.warning(f"Heartbeat failed: {e}")
    return []


def report_status(task_id: str, status: str, file_url: str = None, error_msg: str = None):
    """Tell the web app a task is done / failed."""
    payload = {"taskId": task_id, "status": status}
    if file_url:
        payload["fileUrl"] = file_url
    if error_msg:
        payload["errorMsg"] = error_msg
    try:
        requests.post(f"{APP_URL}/api/employee/shiklolet/callback", headers=HEADERS, json=payload, timeout=15)
    except Exception as e:
        log.error(f"Failed to report status: {e}")


def upload_pdf_to_server(task_id: str, pdf_path: Path) -> str | None:
    """Upload the exported PDF bytes to the web app and return the stored URL."""
    try:
        with open(pdf_path, "rb") as f:
            resp = requests.post(
                f"{APP_URL}/api/employee/shiklolet/upload",
                headers={"x-agent-secret": AGENT_SECRET},
                files={"file": (pdf_path.name, f, "application/pdf")},
                data={"taskId": task_id},
                timeout=60,
            )
        if resp.status_code == 200:
            return resp.json().get("fileUrl")
        log.error(f"Upload failed: {resp.status_code} {resp.text}")
    except Exception as e:
        log.error(f"Upload error: {e}")
    return None


def wait_for_image(image_file: str, timeout: int = 15, confidence: float = 0.85):
    """Wait until a reference image appears on screen, then return its position."""
    end = time.time() + timeout
    while time.time() < end:
        try:
            pos = pyautogui.locateOnScreen(image_file, confidence=confidence)
            if pos:
                return pos
        except Exception:
            pass
        time.sleep(0.5)
    return None


def ensure_shiklolet_open():
    """Open Shiklolet if it's not already running."""
    import subprocess, psutil
    for proc in psutil.process_iter(["name"]):
        if "shiklolet" in proc.info["name"].lower():
            log.info("Shiklolet is already running.")
            return True

    log.info(f"Launching Shiklolet: {SHIKLOLET_EXE}")
    subprocess.Popen([SHIKLOLET_EXE])
    time.sleep(5)  # wait for splash screen
    return True


# ── Main automation logic ──────────────────────────────────────────────────────
#
# IMPORTANT: The image-based automation below (wait_for_image calls) works by
# comparing screenshots to reference PNG files stored in ./images/.
# You need to create these reference images by:
#   1. Opening Shiklolet on your PC
#   2. Taking a screenshot of each UI element (button, dropdown, etc.)
#   3. Saving it with the exact filename used below
#
# The flow follows the navigation you described:
#   Shiklolet → select year → select month → select employee/all → export PDF

def process_task(task: dict):
    task_id = task["id"]
    year    = task["year"]
    month   = task["month"]
    emp_id  = task.get("employeeId")
    emp_name = task.get("employeeName")
    is_all  = emp_id is None

    log.info(f"Processing task {task_id}: {year}/{month} employee={emp_id or 'ALL'}")
    report_status(task_id, "processing")

    try:
        ensure_shiklolet_open()

        # ── Step 1: Bring Shiklolet window to front ────────────────────────
        try:
            import pygetwindow as gw
            wins = gw.getWindowsWithTitle("שיקלולט")
            if wins:
                win = wins[0]
                win.restore()
                win.activate()
                time.sleep(1)
        except Exception as e:
            log.warning(f"Could not activate window: {e}")

        pyautogui.PAUSE = 0.5  # small pause between actions

        # ── Step 2: Select the year ────────────────────────────────────────
        # Look for the year selector UI element (customize image paths!)
        year_btn = wait_for_image("images/year_dropdown.png", timeout=10)
        if not year_btn:
            # Fallback: try clicking by approximate fixed position (customize for your screen)
            log.warning("Year dropdown image not found, using fallback click position")
            pyautogui.click(200, 150)  # ← CUSTOMIZE THIS to match your Shiklolet layout
            time.sleep(0.5)
        else:
            pyautogui.click(pyautogui.center(year_btn))
            time.sleep(0.5)

        # Type the year (or click the right option in a list)
        pyautogui.hotkey("ctrl", "a")
        pyautogui.typewrite(str(year), interval=0.05)
        pyautogui.press("enter")
        time.sleep(1)

        # ── Step 3: Select the month ──────────────────────────────────────
        month_btn = wait_for_image("images/month_dropdown.png", timeout=8)
        if month_btn:
            pyautogui.click(pyautogui.center(month_btn))
        else:
            pyautogui.click(200, 220)  # ← CUSTOMIZE THIS
        time.sleep(0.5)

        month_he = MONTHS_HE[month - 1]
        log.info(f"Selecting month: {month_he}")

        # Try to find the month option by image, else type it
        month_option = wait_for_image(f"images/month_{month}.png", timeout=5)
        if month_option:
            pyautogui.click(pyautogui.center(month_option))
        else:
            pyautogui.typewrite(str(month), interval=0.05)
            pyautogui.press("enter")
        time.sleep(0.8)

        # ── Step 4: Select employee or "all" ─────────────────────────────
        if is_all:
            log.info("Selecting 'all employees' summary")
            all_btn = wait_for_image("images/all_employees_btn.png", timeout=8)
            if all_btn:
                pyautogui.click(pyautogui.center(all_btn))
            else:
                pyautogui.click(200, 300)  # ← CUSTOMIZE THIS
        else:
            log.info(f"Selecting employee: {emp_id} / {emp_name}")
            emp_field = wait_for_image("images/employee_search_field.png", timeout=8)
            if emp_field:
                pyautogui.click(pyautogui.center(emp_field))
            else:
                pyautogui.click(200, 300)  # ← CUSTOMIZE THIS
            time.sleep(0.3)
            pyautogui.hotkey("ctrl", "a")
            # Search by ID number (most reliable)
            pyautogui.typewrite(str(emp_id) if emp_id else (emp_name or ""), interval=0.05)
            time.sleep(0.5)
            pyautogui.press("enter")

        time.sleep(1)

        # ── Step 5: Click Export / Print to PDF ──────────────────────────
        export_btn = wait_for_image("images/export_pdf_btn.png", timeout=10)
        if export_btn:
            pyautogui.click(pyautogui.center(export_btn))
        else:
            log.warning("Export button not found, trying keyboard shortcut")
            pyautogui.hotkey("ctrl", "p")  # Print shortcut (common fallback)
        time.sleep(2)

        # ── Step 6: Handle save dialog ───────────────────────────────────
        # Generate a unique filename for the export
        filename = f"shiklolet_{task_id}_{year}_{month}"
        if not is_all and emp_id:
            filename += f"_{emp_id}"
        filename += ".pdf"
        output_path = EXPORT_DIR / filename

        # In the save dialog, type the full path
        save_dialog = wait_for_image("images/save_dialog.png", timeout=10)
        if save_dialog:
            pyautogui.hotkey("ctrl", "a")
            pyautogui.typewrite(str(output_path), interval=0.02)
            pyautogui.press("enter")
            time.sleep(3)
        else:
            # No save dialog — maybe it saves to a default location
            # Try to find the saved file in common locations
            log.warning("Save dialog not found — looking for auto-saved file")
            import glob
            recent = max(glob.glob(str(EXPORT_DIR / "*.pdf")), key=os.path.getctime, default=None)
            if recent:
                output_path = Path(recent)
            else:
                raise FileNotFoundError("Could not find exported PDF")

        time.sleep(2)

        # ── Step 7: Verify the file exists ───────────────────────────────
        if not output_path.exists():
            raise FileNotFoundError(f"PDF not found at {output_path}")

        log.info(f"PDF exported: {output_path} ({output_path.stat().st_size} bytes)")

        # ── Step 8: Upload to web app ─────────────────────────────────────
        file_url = upload_pdf_to_server(task_id, output_path)
        if not file_url:
            raise RuntimeError("Upload to server failed")

        # Clean up the local file
        try:
            output_path.unlink()
        except Exception:
            pass

        report_status(task_id, "done", file_url=file_url)
        log.info(f"Task {task_id} completed. File URL: {file_url}")

    except Exception as exc:
        log.exception(f"Task {task_id} failed: {exc}")
        report_status(task_id, "failed", error_msg=str(exc))


# ── Main loop ─────────────────────────────────────────────────────────────────

def main():
    log.info("=" * 60)
    log.info("  Shiklolet Agent starting up")
    log.info(f"  Web app: {APP_URL}")
    log.info(f"  Poll interval: {POLL_INTERVAL}s")
    log.info("=" * 60)

    while True:
        pending_tasks = heartbeat()
        log.info(f"Heartbeat sent. Pending tasks: {len(pending_tasks)}")

        for task in pending_tasks:
            try:
                process_task(task)
            except Exception as e:
                log.exception(f"Unhandled error in task {task.get('id')}: {e}")
            time.sleep(2)  # short pause between tasks

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
