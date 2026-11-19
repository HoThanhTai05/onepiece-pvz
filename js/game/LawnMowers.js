/**
 * Ngũ Lão Tinh (Cơ chế Tuyến Phòng Thủ Cuối Cùng - Bá Vương Hắc Lôi)
 * Đứng lùi về phía bờ cảng bên trái + Giáng cột sét đen Haki Bá Vương từ bầu trời xuống!
 */

import { GRID_CONFIG } from './Grid.js';

export class Warship {
  constructor(row, grid = null) {
    this.row = row;
    // Lùi thêm 0.22 ô về bên trái so với vị trí mặc định để không lấn vào ô lưới
    const baseCol = grid ? grid.getShipCol() : -0.48;
    this.colPos = baseCol - 0.20;

    const anchor = grid ? grid.gridToPixel(this.colPos, this.row + 0.56) : null;
    this.x = anchor ? anchor.x : 80;
    this.y = anchor ? anchor.y : (GRID_CONFIG.offsetY + row * GRID_CONFIG.cellHeight + GRID_CONFIG.cellHeight / 2);
    this.scale = anchor ? anchor.scale : 1.0;

    this.width = 72;
    this.height = 72;
    this.isActivated = false;
    this.isDone = false;
    this.bobPhase = row * 1.1;

    // Biến điều khiển hiệu ứng Haki Bá Vương
    this.hakiTimer = 0;
    this.maxHakiDuration = 1.25;
    this.lightningCol = 0;
    this.skyBolts = []; // Chỉ giữ các cột sét giáng từ trên trời xuống
  }

  update(dt, piratesInLane, onAction, grid = null) {
    if (this.isDone) return;

    this.bobPhase += dt * 3.2;

    if (grid && !this.isActivated) {
      // Luôn giữ vị trí đứng lùi sang trái 0.22 ô
      this.colPos = grid.getShipCol() - 0.20;
    }

    if (!this.isActivated) {
      // Kích hoạt ngay khi bất kỳ Hải Tặc nào chạm vạch bờ cảng (colPos <= 0.06)
      const intruder = piratesInLane.find(p => !p.isDead && !p.isDying && p.colPos <= 0.06);
      if (intruder) {
        this.isActivated = true;
        this.hakiTimer = 0;
        this.lightningCol = 0;
        if (onAction) onAction('WARSHIP_TRIGGERED', { warship: this });
      }
    } else {
      this.hakiTimer += dt;

      // Sét quét dọc 10 cột trong 0.45 giây đầu
      const progress = Math.min(1, this.hakiTimer / 0.45);
      this.lightningCol = progress * 10.5;

      // Hủy diệt toàn bộ hải tặc trên đường quét của Haki
      for (const p of piratesInLane) {
        if (!p.isDead && !p.isDying && p.colPos <= this.lightningCol + 0.6) {
          p.takeDamage(99999, { ignoreArmor: true });
        }
      }

      // Tạo các cột sét Haki từ trên trời giáng xuống
      this.generateConquerorHaki(grid);

      if (this.hakiTimer >= this.maxHakiDuration) {
        this.isDone = true;
      }
    }

    if (grid) {
      const pt = grid.gridToPixel(this.colPos, this.row + 0.56);
      this.x = pt.x;
      this.y = pt.y;
      this.scale = pt.scale;
    }
  }

  // Tạo các cột Hắc Lôi giáng thẳng từ bầu trời (đã bỏ tia sét ngang)
  generateConquerorHaki(grid) {
    this.skyBolts = [];

    const maxCol = Math.min(9.5, this.lightningCol);
    const sc = this.scale || 1;

    // Khoảng cách giữa các cột sét thưa hơn một chút (1.35 ô) để nhìn rõ và lực từng tia
    for (let c = 0.5; c <= maxCol; c += 1.35) {
      if (this.hakiTimer > 0.8 && Math.random() > 0.45) continue;

      const targetPt = grid
        ? grid.gridToPixel(c, this.row + 0.52)
        : { x: GRID_CONFIG.offsetX + c * GRID_CONFIG.cellWidth, y: this.y };

      const mainSegments = [];
      const branches = [];
      let curX = targetPt.x + (Math.random() - 0.5) * 65;
      let curY = -30;
      const steps = 8;

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const nextY = -30 + (targetPt.y + 30) * t;
        const jitter = (i === steps) ? 0 : (Math.random() - 0.5) * 52 * sc;
        const nextX = targetPt.x + jitter;
        const w = (i === steps ? 15 : 20 - Math.abs(0.5 - t) * 9) * sc;

        mainSegments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY, w });

        // Giảm số nhánh phụ để không bị rối ngang màn hình
        if (i >= 3 && i < steps - 1 && Math.random() < 0.35) {
          const dir = Math.random() < 0.5 ? -1 : 1;
          let bx = nextX;
          let by = nextY;
          for (let b = 0; b < 2; b++) {
            const bnx = bx + dir * (14 + Math.random() * 20) * sc;
            const bny = by + (20 + Math.random() * 22) * sc;
            branches.push({ x1: bx, y1: by, x2: bnx, y2: bny, w: (7.5 - b * 2.5) * sc });
            bx = bnx;
            by = bny;
          }
        }

        curX = nextX;
        curY = nextY;
      }

      this.skyBolts.push({
        mainSegments,
        branches,
        hitX: targetPt.x,
        hitY: targetPt.y
      });
    }
  }

  // Vẽ tia sét Haki 3 lớp: Hào quang đỏ thẫm -> Viền đỏ rực -> Lõi đen đặc
  drawHakiSegments(ctx, segments, isBranch = false) {
    if (!segments || segments.length === 0) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';

    // Lớp 1: Hào quang Haki đỏ máu bên ngoài
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 55, 0.52)';
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = isBranch ? 10 : 24;
    for (const s of segments) {
      ctx.lineWidth = s.w * 2.05;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    ctx.restore();

    // Lớp 2: Viền điện tích đỏ tươi sắc lẹm
    ctx.save();
    ctx.strokeStyle = '#ff1744';
    for (const s of segments) {
      ctx.lineWidth = s.w * 1.22;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    ctx.restore();

    // Lớp 3: Lõi Haki Bá Vương ĐEN TUYỀN
    ctx.save();
    ctx.strokeStyle = '#050003';
    for (const s of segments) {
      ctx.lineWidth = s.w * 0.68;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  render(ctx, grid = null, assets = null) {
    if (this.isDone) return;

    const pt = grid ? grid.gridToPixel(this.colPos, this.row + 0.56) : { x: this.x, y: this.y, scale: this.scale || 1 };
    this.x = pt.x;
    this.y = pt.y;
    const sc = (pt.scale || 1) * 0.96;

    const bobY = this.isActivated ? Math.sin(this.bobPhase * 18) * 2.5 : Math.sin(this.bobPhase) * 1.5;
    const shakeX = this.isActivated ? (Math.random() - 0.5) * 5 : 0;
    const x = this.x + shakeX;
    const y = this.y + bobY;

    const fadeOut = this.isActivated
      ? Math.max(0, 1 - Math.max(0, this.hakiTimer - 0.8) / 0.45)
      : 1;

    // 1. HIỆU ỨNG HÀO QUANG HAKI QUANH NGƯỜI NGŨ LÃO TINH
    if (this.isActivated) {
      ctx.save();
      ctx.globalAlpha = fadeOut;

      // Chớp tối màn hình nhẹ lúc tung chiêu
      if (this.hakiTimer < 0.14) {
        ctx.fillStyle = 'rgba(10, 0, 5, 0.28)';
        ctx.fillRect(0, 0, 1200, 700);
      }

      const domeR = (62 + Math.sin(this.hakiTimer * 40) * 14) * sc;
      const centerHakiY = y - 34 * sc;
      const grad = ctx.createRadialGradient(x, centerHakiY, 6 * sc, x, centerHakiY, domeR);
      grad.addColorStop(0, 'rgba(5, 0, 5, 0.92)');
      grad.addColorStop(0.45, 'rgba(220, 0, 50, 0.75)');
      grad.addColorStop(0.75, 'rgba(20, 0, 10, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, centerHakiY, domeR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 2. VẼ NHÂN VẬT NGŨ LÃO TINH (ĐÃ THU NHỎ LẠI 90x90 VÀ LÙI QUA TRÁI)
    ctx.save();
    ctx.translate(x, y);
    if (this.isActivated) {
      ctx.globalAlpha = fadeOut;
      ctx.scale(sc * 1.12, sc * 1.12);
    } else {
      ctx.scale(sc, sc);
    }

    const elders = [
      'unit_saturn',   // Hàng 0
      'unit_mars',     // Hàng 1
      'unit_warcury',  // Hàng 2
      'unit_nusjuro',  // Hàng 3
      'unit_jupeter'   // Hàng 4
    ];

    const spriteKey = elders[this.row] || 'unit_saturn';
    const sprite = assets ? assets.get(spriteKey) : null;

    if (sprite) {
      // Kích thước 90x90 cân đối hơn (nhỏ hơn 108 cũ)
      const drawW = 100;
      const drawH = 100;
      ctx.drawImage(sprite, -drawW / 2, -drawH + 18, drawW, drawH);
    } else {
      ctx.font = '50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👴', 0, 0);
    }
    ctx.restore();

    // 3. VẼ CÁC CỘT SÉT HAKI BÁ VƯƠNG TỪ TRÊN TRỜI GIÁNG XUỐNG
    if (this.isActivated) {
      ctx.save();
      ctx.globalAlpha = fadeOut;

      for (const bolt of this.skyBolts) {
        // Vẽ nhánh phụ nhỏ
        this.drawHakiSegments(ctx, bolt.branches, true);
        // Vẽ cột sét chính từ trên trời xuống
        this.drawHakiSegments(ctx, bolt.mainSegments, false);

        // Chấn động đen-đỏ dưới mặt đất nơi sét đánh trúng
        const hx = bolt.hitX;
        const hy = bolt.hitY;

        ctx.fillStyle = '#ff0033';
        ctx.beginPath();
        ctx.ellipse(hx, hy, 34 * sc, 11 * sc, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#050003';
        ctx.beginPath();
        ctx.ellipse(hx, hy, 21 * sc, 6.5 * sc, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gai Haki bắn lên từ tâm điểm nổ
        ctx.fillStyle = '#050003';
        ctx.strokeStyle = '#ff1744';
        ctx.lineWidth = 1.8 * sc;
        for (let k = 0; k < 4; k++) {
          const ang = -Math.PI * 0.18 - (k / 3) * Math.PI * 0.64 + (Math.random() - 0.5) * 0.15;
          const len = (24 + Math.random() * 20) * sc;
          ctx.beginPath();
          ctx.moveTo(hx - 4 * sc, hy);
          ctx.lineTo(hx + Math.cos(ang) * len, hy + Math.sin(ang) * len);
          ctx.lineTo(hx + 4 * sc, hy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }
}