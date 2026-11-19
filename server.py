import http.server
import socketserver
import webbrowser
import socket
import os
import sys
import json
import time
import threading
import urllib.request

PORT = 8088
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
SAVES_DIR = os.path.join(DIRECTORY, "saves")
PROFILES_FILE = os.path.join(SAVES_DIR, "profiles.json")
STORE_LOCK = threading.Lock()


def ensure_saves_store():
    os.makedirs(SAVES_DIR, exist_ok=True)
    if not os.path.exists(PROFILES_FILE):
        with open(PROFILES_FILE, "w", encoding="utf-8") as f:
            json.dump({"lastActive": "", "profiles": {}}, f, ensure_ascii=False, indent=2)


def normalize_username(name: str) -> str:
    return " ".join(str(name or "").strip().split())


def profile_key(name: str) -> str:
    return normalize_username(name).lower()


def load_profiles_store() -> dict:
    with STORE_LOCK:
        ensure_saves_store()
        try:
            with open(PROFILES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, dict):
                return {"lastActive": "", "profiles": {}}
            profiles = data.get("profiles")
            if not isinstance(profiles, dict):
                profiles = {}
            migrated_profiles = {k: sanitize_profile_payload(v) for k, v in profiles.items() if isinstance(v, dict)}
            return {
                "lastActive": str(data.get("lastActive") or ""),
                "profiles": migrated_profiles,
            }
        except Exception:
            return {"lastActive": "", "profiles": {}}


def write_profiles_store(store: dict):
    os.makedirs(SAVES_DIR, exist_ok=True)
    tmp_path = PROFILES_FILE + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(store, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, PROFILES_FILE)


def sanitize_profile_payload(payload: dict) -> dict:
    display_name = normalize_username(payload.get("username") or "Thuyền Trưởng Hải Quân")
    if len(display_name) > 32:
        display_name = display_name[:32]

    max_stage = payload.get("maxUnlockedStage", 1)
    try:
        max_stage = max(1, min(9, int(max_stage)))
    except Exception:
        max_stage = 1

    units = payload.get("unlockedUnits")
    if not isinstance(units, list) or len(units) == 0:
        units = ["DEN_DEN_MUSHI", "MARINE_RIFLE"]
    units = list(dict.fromkeys(["SEASTONE_MINE" if str(u) == "CHERRY_BOMB" else str(u) for u in units if u]))

    stars = payload.get("stageStars")
    if not isinstance(stars, dict):
        stars = {}

    deck = payload.get("selectedDeck")
    if not isinstance(deck, list) or len(deck) == 0:
        deck = units[:7]
    else:
        deck = list(dict.fromkeys(["SEASTONE_MINE" if str(u) == "CHERRY_BOMB" else str(u) for u in deck if u]))

    # Shop Vàng (V6): Vàng Khối, số ô bài tối đa và các món nâng cấp đã mua
    try:
        gold_bars = max(0, min(999999, int(payload.get("goldBars", 0))))
    except Exception:
        gold_bars = 0
    try:
        max_slots = max(7, min(9, int(payload.get("maxDeckSlots", 7))))
    except Exception:
        max_slots = 7
    raw_upg = payload.get("shopUpgrades")
    shop_upgrades = {}
    if isinstance(raw_upg, dict):
        allowed = {
            "EXTRA_SLOT": 2,
            "ADMIRAL_SKILL_ICE": 1,
            "ADMIRAL_SKILL_MAGMA": 1,
            "DF_MERA_SHOOTER": 3,
            "DF_KIRA_DEFENSE": 3,
            "DF_GOLD_ADMIRAL": 3,
        }
        for k, cap in allowed.items():
            try:
                lv = int(raw_upg.get(k, 0))
            except Exception:
                lv = 0
            shop_upgrades[k] = max(0, min(cap, lv))
    max_slots = min(9, max(max_slots, 7 + shop_upgrades.get("EXTRA_SLOT", 0)))

    updated_at = payload.get("updatedAt")
    try:
        updated_at = int(updated_at) if updated_at else int(time.time() * 1000)
    except Exception:
        updated_at = int(time.time() * 1000)

    return {
        "username": display_name,
        "maxUnlockedStage": max_stage,
        "unlockedUnits": units,
        "stageStars": stars,
        "selectedDeck": deck[:max_slots],
        "goldBars": gold_bars,
        "maxDeckSlots": max_slots,
        "shopUpgrades": shop_upgrades,
        "updatedAt": updated_at,
    }


def save_profile_to_store(payload: dict) -> dict:
    with STORE_LOCK:
        ensure_saves_store()
        store = {}
        try:
            with open(PROFILES_FILE, "r", encoding="utf-8") as f:
                store = json.load(f)
        except Exception:
            store = {"lastActive": "", "profiles": {}}
        if not isinstance(store, dict):
            store = {"lastActive": "", "profiles": {}}
        if not isinstance(store.get("profiles"), dict):
            store["profiles"] = {}

        clean = sanitize_profile_payload(payload)
        key = profile_key(clean["username"])
        existing = store["profiles"].get(key)
        force = bool(payload.get("forceOverwrite"))

        if existing and not force:
            # Nếu client cũ hơn dữ liệu đang có trên máy chủ thì chỉ cập nhật nếu client mới hơn hoặc tiến độ cao hơn
            ex_stage = int(existing.get("maxUnlockedStage", 1))
            ex_units = len(existing.get("unlockedUnits") or [])
            ex_ts = int(existing.get("updatedAt", 0))
            if clean["updatedAt"] < ex_ts and (clean["maxUnlockedStage"] < ex_stage or len(clean["unlockedUnits"]) < ex_units):
                clean = existing

        store["profiles"][key] = clean
        if payload.get("setActive", True):
            store["lastActive"] = clean["username"]

        write_profiles_store(store)
        return {"ok": True, "profile": clean, "lastActive": store["lastActive"], "profiles": store["profiles"]}


def delete_profile_from_store(username: str) -> dict:
    with STORE_LOCK:
        ensure_saves_store()
        try:
            with open(PROFILES_FILE, "r", encoding="utf-8") as f:
                store = json.load(f)
        except Exception:
            store = {"lastActive": "", "profiles": {}}
        if not isinstance(store.get("profiles"), dict):
            store["profiles"] = {}

        key = profile_key(username)
        removed = store["profiles"].pop(key, None) is not None
        if profile_key(store.get("lastActive", "")) == key:
            remaining = list(store["profiles"].values())
            store["lastActive"] = remaining[0]["username"] if remaining else ""
        write_profiles_store(store)
        return {"ok": True, "removed": removed, "lastActive": store.get("lastActive", ""), "profiles": store["profiles"]}


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def ensure_qr_code(local_ip, port):
    qr_file = os.path.join(DIRECTORY, "qr_code.png")
    url = f"http://{local_ip}:{port}/index.html"
    api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=350x350&data={url}"
    try:
        urllib.request.urlretrieve(api_url, qr_file)
    except Exception:
        pass


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Đảm bảo khi người dùng tự chỉnh file Units.js / Pirates.js / Stages.js và bấm F5 sẽ nhận thông số mới ngay
        if self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_json(self, status_code: int, obj: dict):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/profiles":
            store = load_profiles_store()
            self.send_json(200, {"ok": True, **store})
            return
        super().do_GET()

    def do_POST(self):
        route = self.path.split("?")[0]
        if route not in ("/api/save", "/api/delete"):
            self.send_json(404, {"ok": False, "error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(max(0, min(length, 262144)))
            payload = json.loads(raw.decode("utf-8")) if raw else {}
        except Exception as e:
            self.send_json(400, {"ok": False, "error": str(e)})
            return

        if route == "/api/save":
            res = save_profile_to_store(payload)
            self.send_json(200, res)
        elif route == "/api/delete":
            res = delete_profile_from_store(payload.get("username", ""))
            self.send_json(200, res)

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

    def send_error(self, code, message=None, explain=None):
        if code == 400 and message and "Bad request version" in str(message):
            sys.stderr.write("\n" + "!" * 65 + "\n")
            sys.stderr.write(" [NHẮC NHỞ]: Điện thoại đang tự động kết nối HTTPS!\n")
            sys.stderr.write(" 👉 Vui lòng dùng CAMERA quét mã QR trên màn hình máy tính\n")
            sys.stderr.write("    hoặc gõ ĐẦY ĐỦ tiền tố: http:// (không có chữ s)\n")
            sys.stderr.write("!" * 65 + "\n\n")
        super().send_error(code, message, explain)


def main():
    os.chdir(DIRECTORY)
    ensure_saves_store()
    local_ip = get_local_ip()
    ensure_qr_code(local_ip, PORT)

    server_address = ("0.0.0.0", PORT)
    try:
        with ThreadedTCPServer(server_address, Handler) as httpd:
            pc_url = f"http://localhost:{PORT}/index.html"
            mobile_url = f"http://{local_ip}:{PORT}/index.html"

            print("=" * 68)
            print("  🛡️ HẢI QUÂN ĐẠI CHIẾN HẢI TẶC (ONE PIECE PvZ V6) 🏴‍☠️")
            print("=" * 68)
            print(f"  💻 Trên Máy Tính:    {pc_url}")
            print(f"  📱 Trên Điện Thoại:  {mobile_url}")
            print(f"  💾 Thư Mục Lưu TK:   {PROFILES_FILE}")
            print("=" * 68)
            print("  👉 Mở Camera / Zalo quét mã QR trên màn hình để vào chơi ngay!")
            print("  👉 Đảm bảo điện thoại và máy tính kết nối CHUNG MẠNG WI-FI!")
            print("  Nhấn Ctrl + C để dừng máy chủ.")
            print("=" * 68)

            try:
                webbrowser.open(pc_url)
            except Exception:
                pass

            httpd.serve_forever()
    except OSError as e:
        if e.errno in (10048, 98):
            alt_port = 8089
            mobile_url = f"http://{local_ip}:{alt_port}/index.html"
            print(f"Cổng {PORT} đang bận, chuyển sang cổng {alt_port}...")
            ensure_qr_code(local_ip, alt_port)
            with ThreadedTCPServer(("0.0.0.0", alt_port), Handler) as httpd:
                print(f"  💻 Trên Máy Tính:   http://localhost:{alt_port}/index.html")
                print(f"  📱 Trên Điện Thoại: {mobile_url}")
                print(f"  💾 Thư Mục Lưu TK:  {PROFILES_FILE}")
                try:
                    webbrowser.open(f"http://localhost:{alt_port}/index.html")
                except Exception:
                    pass
                httpd.serve_forever()
        else:
            raise e


if __name__ == '__main__':
    main()
