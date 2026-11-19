/**
 * Hệ Thống Lưới Phối Cảnh 2.5D Khớp Theo Từng Ảnh Nền (Version 4)
 * Mỗi bản đồ (Cỏ Shells Town, Bãi Biển Sand, Boong Tàu Wood, Băng Marineford)
 * có bộ tọa độ hình thang phối cảnh 5 hàng x 9 cột khớp sát với đường kẻ vẽ trên nền ảnh.
 */

export const GRID_CONFIG = {
  cols: 9,
  rows: 5,
  // Giá trị tham chiếu tương thích ngược (1068x600)
  cellWidth: 82,
  cellHeight: 90,
  offsetX: 156,
  offsetY: 132,
  canvasWidth: 1068,
  canvasHeight: 600
};

// Cấu hình tọa độ phối cảnh 2.5D riêng cho từng ảnh nền chiến trường (khung chuẩn 1068x600)
export const GRID_THEMES = {
  // 1. Màn cỏ căn cứ Shells Town / Arlong Park (bg_battle_grass.png)
  grass: {
    bgKey: 'bg_battle_grass',
    // Mốc Y ranh giới trên-dưới của 5 hàng cỏ (từ hàng 0 trên cùng đến đáy hàng 4)
    rowYs: [160, 232, 312, 398, 493, 598],
    // Mép trái sát tường đá chéo & mép phải hết khung cỏ
    topLeftX: 274,
    topRightX: 1066,
    botLeftX: 86,
    botRightX: 1068,
    // Vị trí neo chiến hạm dọc bờ đá cầu cảng
    shipCol: -0.52,
    topScale: 0.87,
    botScale: 1.08,
    lockedThemeColor: 'rgba(28, 36, 44, 0.56)',
    lockedText: '🪨 BỜ ĐÁ CHƯA KHAI PHÁ (MỞ Ở MÀN 2)'
  },

  // 2. Bãi biển cát vàng Orange Town / Làng Syrup (bg_battle_sand.png)
  sand: {
    bgKey: 'bg_battle_sand',
    // Khớp khít từng vạch gỗ dạt & vỏ sò chia 5 làn trên cát
    rowYs: [186, 256, 324, 394, 468, 544],
    // Mép trái sát hàng rào dây cầu gỗ & mép phải né tán lá dừa
    topLeftX: 296,
    topRightX: 1018,
    botLeftX: 168,
    botRightX: 1034,
    shipCol: -0.48,
    topScale: 0.86,
    botScale: 1.06,
    lockedThemeColor: 'rgba(66, 52, 34, 0.55)',
    lockedText: '🏝️ BÃI CÁT CHƯA MỞ RỘNG'
  },

  // 3. Boong tàu gỗ Baratie / Đại ngục Impel Down (bg_battle_wood.png)
  wood: {
    bgKey: 'bg_battle_wood',
    // Khớp theo các khớp ván boong tàu 5x9 trên ảnh nền đã căn chỉnh
    rowYs: [176, 243, 317, 400, 491, 596],
    topLeftX: 165,
    topRightX: 1066,
    botLeftX: 83,
    botRightX: 1068,
    shipCol: -0.35,
    topScale: 0.86,
    botScale: 1.08,
    lockedThemeColor: 'rgba(48, 28, 16, 0.58)',
    lockedText: '🪵 KHU VỰC BOONG ĐANG ĐÓNG CỬA'
  },

  // 4. Mặt vịnh đóng băng Marineford (bg_battle_ice.png)
  marineford: {
    bgKey: 'bg_battle_ice',
    // Khớp đúng 5 hàng x 9 cột băng Marineford
    rowYs: [254, 314, 381, 453, 529, 598],
    topLeftX: 278,
    topRightX: 1020,
    botLeftX: 94,
    botRightX: 1054,
    shipCol: -0.36,
    topScale: 0.83,
    botScale: 1.09,
    lockedThemeColor: 'rgba(20, 42, 68, 0.56)',
    lockedText: '🧊 VÙNG BĂNG PHONG TỎA'
  }
};

export class Grid {
  constructor(cols = GRID_CONFIG.cols, rows = GRID_CONFIG.rows) {
    this.cols = cols;
    this.rows = rows;
    this.theme = 'grass';
    this.themeConfig = GRID_THEMES.grass;

    this.lockedRows = [];
    this.cells = Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  /**
   * Cập nhật phối cảnh lưới khớp với bản đồ màn chơi hiện tại
   */
  setTheme(theme = 'grass') {
    const normalized = theme === 'dock' ? 'sand' : theme;
    this.theme = GRID_THEMES[normalized] ? normalized : 'grass';
    this.themeConfig = GRID_THEMES[this.theme];
  }

  getShipCol() {
    return this.themeConfig.shipCol ?? -0.45;
  }

  setLockedRows(lockedRows = []) {
    this.lockedRows = lockedRows;
  }

  isRowLocked(row) {
    return this.lockedRows.includes(row);
  }

  getUnit(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    return this.cells[row][col];
  }

  setUnit(col, row, unit) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows && !this.isRowLocked(row)) {
      this.cells[row][col] = unit;
    }
  }

  removeUnit(col, row) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      const u = this.cells[row][col];
      if (u) {
        u.isDead = true;
        u.burstQueue = 0;
        u.skillReady = false;
      }
      this.cells[row][col] = null;
      return u;
    }
    return null;
  }

  isCellOccupied(col, row) {
    if (this.isRowLocked(row)) return true;
    const u = this.getUnit(col, row);
    return u !== null && !u.isDead;
  }

  /**
   * Chuyển đổi tọa độ liên tục (colFloat: 0..9, rowFloat: 0..5) sang điểm pixel 2.5D trên màn hình
   */
  gridToPixel(colFloat, rowFloat) {
    const cfg = this.themeConfig;
    const ys = cfg.rowYs;

    let y;
    if (rowFloat <= 0) {
      y = ys[0] + rowFloat * (ys[1] - ys[0]);
    } else if (rowFloat >= this.rows) {
      y = ys[this.rows] + (rowFloat - this.rows) * (ys[this.rows] - ys[this.rows - 1]);
    } else {
      const rIdx = Math.min(this.rows - 1, Math.max(0, Math.floor(rowFloat)));
      const frac = rowFloat - rIdx;
      y = ys[rIdx] + frac * (ys[rIdx + 1] - ys[rIdx]);
    }

    const totalH = Math.max(1, ys[this.rows] - ys[0]);
    const tY = (y - ys[0]) / totalH;

    const leftX = cfg.topLeftX + tY * (cfg.botLeftX - cfg.topLeftX);
    const rightX = cfg.topRightX + tY * (cfg.botRightX - cfg.topRightX);
    const spanW = rightX - leftX;

    const x = leftX + (colFloat / this.cols) * spanW;
    const clampedT = Math.max(0, Math.min(1.15, tY));
    const scale = cfg.topScale + clampedT * (cfg.botScale - cfg.topScale);

    const rowIdxClamped = Math.min(this.rows - 1, Math.max(0, Math.floor(rowFloat)));
    const rowHeight = ys[rowIdxClamped + 1] - ys[rowIdxClamped];

    return {
      x,
      y,
      scale,
      cellWidth: spanW / this.cols,
      rowHeight,
      leftX,
      rightX
    };
  }

  /**
   * Chuyển tọa độ chuột / cảm ứng (px, py) sang ô { col, row } theo hình thang phối cảnh
   */
  pixelToCell(px, py) {
    const cfg = this.themeConfig;
    const ys = cfg.rowYs;

    if (py < ys[0] || py >= ys[this.rows]) return null;

    let row = -1;
    for (let r = 0; r < this.rows; r++) {
      if (py >= ys[r] && py < ys[r + 1]) {
        row = r;
        break;
      }
    }
    if (row === -1) return null;

    const tY = (py - ys[0]) / Math.max(1, ys[this.rows] - ys[0]);
    const leftX = cfg.topLeftX + tY * (cfg.botLeftX - cfg.topLeftX);
    const rightX = cfg.topRightX + tY * (cfg.botRightX - cfg.topRightX);

    if (px < leftX || px >= rightX) return null;

    const col = Math.floor(((px - leftX) / (rightX - leftX)) * this.cols);
    if (col >= 0 && col < this.cols) {
      return { col, row };
    }
    return null;
  }

  /**
   * Chuyển tọa độ pixel X tại 1 hàng cụ thể sang chỉ số cột liên tục colFloat
   */
  pixelToColFloat(px, row = 2) {
    const pt = this.gridToPixel(0, row + 0.5);
    const spanW = pt.rightX - pt.leftX;
    if (spanW <= 0) return 0;
    return ((px - pt.leftX) / spanW) * this.cols;
  }

  /**
   * Lấy đầy đủ thông tin hình học (tâm, chân, 4 góc tứ giác, scale) của 1 ô (col, row)
   */
  cellToPixel(col, row) {
    const tl = this.gridToPixel(col, row);
    const tr = this.gridToPixel(col + 1, row);
    const br = this.gridToPixel(col + 1, row + 1);
    const bl = this.gridToPixel(col, row + 1);
    const center = this.gridToPixel(col + 0.5, row + 0.5);
    const feet = this.gridToPixel(col + 0.5, row + 0.86);

    return {
      x: tl.x,
      y: tl.y,
      centerX: center.x,
      centerY: center.y,
      feetX: feet.x,
      feetY: feet.y,
      cellWidth: center.cellWidth,
      cellHeight: center.rowHeight,
      scale: center.scale,
      quad: [tl, tr, br, bl]
    };
  }

  getRowCenterY(row) {
    return this.gridToPixel(4.5, row + 0.5).y;
  }

  getRowFeetY(row) {
    return this.gridToPixel(4.5, row + 0.85).y;
  }

  getRowScale(row) {
    return this.gridToPixel(4.5, row + 0.5).scale;
  }

  getWharfX(row) {
    return this.gridToPixel(0, row + 0.5).x;
  }

  getWarshipAnchor(row) {
    const shipCol = this.getShipCol();
    return this.gridToPixel(shipCol, row + 0.56);
  }

  clear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c] = null;
      }
    }
  }

  getAllUnits() {
    const list = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c] && !this.cells[r][c].isDead) {
          list.push(this.cells[r][c]);
        }
      }
    }
    return list;
  }

  render(ctx, theme = 'grass', hoveredCell = null, selectedUnitType = null, assets = null, time = 0, fallbackDrawer = null, isShovelActive = false) {
    if (theme && theme !== this.theme) {
      this.setTheme(theme);
    }
    const cfg = this.themeConfig;

    ctx.save();

    const bgImg = assets ? assets.get(cfg.bgKey) : null;
    if (bgImg) {
      // Vẽ ảnh nền chuẩn 1068x600 + nối gương bên phải khi camera quét lúc đầu màn
      ctx.drawImage(bgImg, 0, 0, 1068, 600);
      ctx.save();
      ctx.translate(2136, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(bgImg, 0, 0, 1068, 600);
      ctx.restore();

      // Hiệu ứng sóng biển lấp lánh nhẹ ở chân trời
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      const sparkleY = this.theme === 'marineford' ? 148 : 88;
      for (let i = 0; i < 14; i++) {
        const sx = (i * 97 + time * 18) % 1300;
        const sy = sparkleY + (i % 3) * 10;
        const alpha = 0.22 + 0.4 * Math.abs(Math.sin(time * 2.4 + i));
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, sy, 14 + (i % 3) * 5, 2);
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#1e824c';
      ctx.fillRect(0, 0, 1340, 600);
    }

    // KHÔNG vẽ đè ô kẻ vuông giả lên nền ảnh đã vẽ sẵn làn!
    // Chỉ phủ lớp màn sương phối cảnh gọn bên trong hình thang của những hàng đang bị khóa (ví dụ Màn 1 khóa hàng 0 & 4)
    for (let r = 0; r < this.rows; r++) {
      if (!this.isRowLocked(r)) continue;

      const tl = this.gridToPixel(0, r);
      const tr = this.gridToPixel(this.cols, r);
      const br = this.gridToPixel(this.cols, r + 1);
      const bl = this.gridToPixel(0, r + 1);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();

      ctx.fillStyle = cfg.lockedThemeColor || 'rgba(34, 40, 48, 0.56)';
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.26)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      const mid = this.gridToPixel(4.5, r + 0.5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(cfg.lockedText, mid.x, mid.y);
      ctx.restore();
    }

    // Đường ranh giới cảng phòng thủ (chạy nghiêng đúng theo bờ tường / cầu gỗ trong ảnh)
    const wharfTop = this.gridToPixel(0, 0);
    const wharfBot = this.gridToPixel(0, this.rows);
    ctx.save();
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(wharfTop.x, wharfTop.y);
    ctx.lineTo(wharfBot.x, wharfBot.y);
    ctx.stroke();
    ctx.restore();

    // Khi di chuột hoặc đang cầm thẻ lính đặt xuống / cầm Xẻng: sáng nhẹ ĐÚNG ô hình thang phối cảnh
    if (hoveredCell && !this.isRowLocked(hoveredCell.row)) {
      const { col, row } = hoveredCell;
      const cell = this.cellToPixel(col, row);
      const [tl, tr, br, bl] = cell.quad;
      const occupied = this.isCellOccupied(col, row);

      // Nếu đang cầm Bom Đôi Buster Call: tô viền nhẹ phạm vi nổ 3x3 ô xung quanh
      if (selectedUnitType && selectedUnitType.id === 'BUSTER_CANNON' && !occupied) {
        const rad = selectedUnitType.blastRadiusCols ?? 1;
        for (let rr = Math.max(0, row - rad); rr <= Math.min(this.rows - 1, row + rad); rr++) {
          if (this.isRowLocked(rr)) continue;
          for (let cc = Math.max(0, col - rad); cc <= Math.min(this.cols - 1, col + rad); cc++) {
            if (rr === row && cc === col) continue;
            const cAoE = this.cellToPixel(cc, rr);
            const [q0, q1, q2, q3] = cAoE.quad;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(q0.x, q0.y);
            ctx.lineTo(q1.x, q1.y);
            ctx.lineTo(q2.x, q2.y);
            ctx.lineTo(q3.x, q3.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 71, 87, 0.16)';
            ctx.strokeStyle = 'rgba(255, 71, 87, 0.45)';
            ctx.lineWidth = 1.3;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();

      if (isShovelActive) {
        ctx.fillStyle = occupied ? 'rgba(255, 71, 87, 0.44)' : 'rgba(255, 165, 2, 0.16)';
        ctx.strokeStyle = occupied ? '#ff4757' : 'rgba(255, 165, 2, 0.65)';
        ctx.lineWidth = occupied ? 3.0 : 1.6;
      } else if (selectedUnitType) {
        ctx.fillStyle = occupied ? 'rgba(231, 76, 60, 0.36)' : 'rgba(46, 204, 113, 0.30)';
        ctx.strokeStyle = occupied ? '#e74c3c' : '#2ecc71';
        ctx.lineWidth = 2.5;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
        ctx.lineWidth = 1.6;
      }
      ctx.fill();
      ctx.stroke();

      if (isShovelActive && occupied) {
        ctx.font = `bold ${Math.round(14 * cell.scale)}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#181828';
        ctx.lineWidth = 3;
        ctx.strokeText('⛏️ XÚC', cell.centerX, cell.centerY);
        ctx.fillText('⛏️ XÚC', cell.centerX, cell.centerY);
      }

      // Vẽ bóng xem trước nhân vật đứng đúng chân trên ô phối cảnh
      if (selectedUnitType && !occupied) {
        ctx.globalAlpha = 0.6;
        const sc = cell.scale;
        const size = 82 * sc;
        const sprite = assets ? assets.get(`unit_${selectedUnitType.id}`) : null;
        if (sprite) {
          ctx.drawImage(sprite, cell.feetX - size / 2, cell.feetY - size + 4 * sc, size, size);
        } else if (fallbackDrawer) {
          fallbackDrawer(ctx, selectedUnitType.id, cell.feetX, cell.feetY - size * 0.45, size * 0.9, time, assets);
        } else {
          ctx.font = `${Math.round(32 * sc)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(selectedUnitType.icon, cell.centerX, cell.centerY);
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }
}
