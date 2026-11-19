# 🛡️ HẢI QUÂN ĐẠI CHIẾN HẢI TẶC — VERSION 5 (ĐỒ HỌA 3D PVZ, KHỚP LƯỚI MỌI ẢI & BOM CHERRY) 🏴‍☠️

> **Game thủ thành chiến thuật chuẩn *Plants vs. Zombies* phiên bản Anime One Piece 3D trên điện thoại & máy tính: toàn bộ 4 bản đồ chiến trường khớp chuẩn 5×9 ô phối cảnh, tạo hình 3D PvZ cho 10 binh chủng Hải Quân & 9 Hải Tặc + Boss Tứ Hoàng, lưu tài khoản vĩnh viễn trên máy chủ!**

---

## ✨ NÂNG CẤP NỔI BẬT Ở VERSION 5

1. **Khớp Lưới Hoàn Hảo Toàn Bộ 4 Bản Đồ Chiến Trường ([`Grid.js`](js/game/Grid.js)):**
   - Vẽ lại chính xác bề mặt chiến đấu `5 hàng × 9 cột` theo góc phối cảnh cho **cả 4 bản đồ** (`grass` Căn Cứ & Arlong Park, `sand` Bãi Biển Orange & Syrup, `wood` Boong Tàu Baratie & Impel Down, `marineford` Vịnh Băng Marineford), xóa bỏ hoàn toàn tình trạng ô cờ bị lệch hàng hay cắt lề trên tranh nền.

2. **Sửa Triệt Để Lỗi Xẻng Thu Hồi Lính ([`GameManager.js`](js/game/GameManager.js) + [`Pirates.js`](js/game/Pirates.js)):**
   - Hỗ trợ chạm trúng cả phần đầu/mũ cao phía trên chân ô khi đang cầm **`⛏️ XẺNG`** (kèm khung tô đỏ `⛏️ XÚC` & biểu tượng Xẻng theo trỏ chuột/ngón tay).
   - Khi thu hồi, đơn vị bị xóa khỏi lưới ngay lập tức và mọi Hải Tặc đang cắn đơn vị đó lập tức tách ra trở về trạng thái `WALKING` tiếp tục tiến bước thay vì đánh vào khoảng không.

3. **Đổi Cơ Chế Bom Cherry & Đại Bác Buster Call Cố Định ([`Units.js`](js/game/Units.js) + [`Projectiles.js`](js/game/Projectiles.js)):**
   - **🍒 Bom Cherry Hải Quân (`CHERRY_BOMB` — mở sau Màn 2, `150 Beli`):** Thay thế *Bẫy Hải Lâu Thạch*; phồng to `0.95s` rồi phát nổ tức thì `1800 DMG` xuyên giáp trên toàn vùng `3×3 ô` (tự động nâng cấp các tài khoản cũ đã mở `SEASTONE_MINE`).
   - **💥 Đại Bác Buster Call (`BUSTER_CANNON` — mở sau Màn 3, `225 Beli`):** Chuyển thành **tháp pháo đặt cố định vĩnh viễn** trên sân, bắn đạn đại bác tầm xa `75 DMG` kèm nổ lan `65%` sát thương sang hải tặc xung quanh.

4. **Đồ Họa Nhân Vật 3D Chân Thực Chuẩn PvZ ([`AssetManager.js`](js/core/AssetManager.js)):**
   - Bổ sung tạo hình 3D nổi khối kèm bóng đổ tiếp đất đa lớp cho Bom Cherry, Chiến Hạm Hải Quân, Crocodile, Mihawk, Akainu và toàn bộ 9 binh chủng Hải Tặc + Boss (kể cả biến thể vỡ thùng gỗ / vỡ giáp sắt / hóa cuồng nộ).

5. **Hệ Thống Tài Khoản Thuyền Trưởng & Thông Số Tiếng Việt (Từ V4):**
   - Lưu đồng bộ lên máy chủ (`saves/profiles.json`) qua `/api/profiles`, `/api/save`, `/api/delete` và `localStorage`.
   - File [`js/game/Units.js`](js/game/Units.js), [`js/game/Pirates.js`](js/game/Pirates.js), [`js/game/Stages.js`](js/game/Stages.js) chú thích Tiếng Việt từng dòng; bấm `F5` áp dụng ngay nhờ `Cache-Control: no-cache`.

---

## 📱 CÁCH CHẠY & LƯU TÀI KHOẢN TRÊN PC + ĐIỆN THOẠI

1. Mở terminal/PowerShell hoặc nhấp đúp **`start_game.bat`** để chạy máy chủ lưu tiến độ (`py server.py` trong `d:\Code Game\onepiece-pvz`).
   > **Lưu ý:** Nên mở game qua `server.py` (mặc định `http://localhost:8088/index.html`) thay vì mở trực tiếp `file://` để kích hoạt API lưu vĩnh viễn vào `saves/profiles.json`.
2. Trên điện thoại cùng Wi-Fi, quét mã QR từ **`mo_ma_qr_choi_dien_thoai.bat`** và chạm **`⛶ Toàn màn hình`** góc trên phải.
3. Góc trên trái màn hình chính hiển thị tài khoản hiện tại — chạm vào để đổi tài khoản hoặc tạo profile riêng cho từng người chơi!

---

## 🛠️ MẸO NHANH KHI TỰ CHỈNH THÔNG SỐ NHÂN VẬT

- Muốn **Sên Beli** đẻ tiền nhanh hơn hoặc nhiều tiền hơn: sửa `produceFirstDelay`, `produceInterval`, `beliAmount` trong `UNIT_TYPES.DEN_DEN_MUSHI` ([`js/game/Units.js`](js/game/Units.js)).
- Muốn **Lính bắn mạnh hơn / rẻ hơn / hồi thẻ nhanh hơn**: sửa `cost`, `cooldown`, `damage`, `shootInterval` trong [`js/game/Units.js`](js/game/Units.js).
- Muốn **Hải Tặc yếu hơn hoặc đi chậm hơn**: sửa `hp`, `armorHp`, `speed`, `attack` trong [`js/game/Pirates.js`](js/game/Pirates.js).
- Muốn **đợt quái đầu tiên ra muộn hơn hoặc tăng tiền đầu trận**: sửa `initialBeli` và `waves[0].delay` trong [`js/game/Stages.js`](js/game/Stages.js).

---

## 🗺️ LỘ TRÌNH 9 MÀN ĐẠI HẢI TRÌNH

| Màn | Chiến Trường | Boss / Hải Tặc Mới | Phần Thưởng Thu Phục |
| :---: | :--- | :--- | :--- |
| **Màn 1** | **Căn Cứ Shells Town** (`grass`) | Hải tặc tân binh (3 làn giữa) | 🛡️ **Lính Khiên Sắt** |
| **Màn 2** | **Thị Trấn Orange Town** (`sand`) | Hải tặc Thùng Gỗ (5 làn mở) | 🍒 **Bom Cherry Hải Quân** |
| **Màn 3** | **Bờ Biển Làng Syrup** (`sand`) | Hải tặc Buggy Nhảy Sào | 💥 **Đại Bác Buster Call** |
| **Màn 4** | **Nhà Hàng Biển Baratie** (`wood`) | Hải tặc Giáp Sắt | 🎖️ **Đội Trưởng Súng Đôi** |
| **Màn 5** | **Công Viên Arlong Park** (`grass`) | Kiếm sĩ Cuồng Nộ | ❄️ **Đô Đốc Băng Aokiji** |
| **Màn 6** | **Quần Đảo Sabaody** (`grass`) | 🔥 **Ma Cô Phượng Hoàng** + Oars | 🏜️ **Thất Vũ Hải Crocodile** |
| **Màn 7** | **Ngục Tối Impel Down** (`wood`) | 🌑 **Tứ Hoàng Râu Đen** | ⚔️ **Mắt Diều Hâu Mihawk** |
| **Màn 8** | **Cổng Chính Nghĩa Marineford** (`marineford`) | Liên minh Râu Đen + Ma Cô + Oars | 🌋 **Thủy Sư Đô Đốc Akainu** |
| **Màn 9** | **Đại Chiến Thượng Đỉnh Marineford** (`marineford`) | 🔱 **Tứ Hoàng Râu Trắng** + Toàn hạm đội | 🏆 **Cúp Chiến Thắng Toàn Thế Giới** |
