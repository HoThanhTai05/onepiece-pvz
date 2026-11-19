/**
 * Hiệu Ứng Hạt, Chữ Nổi Chiến Đấu & Kỹ Năng Đô Đốc / Tứ Hoàng (Version 4 - Khớp Phối Cảnh 2.5D)
 */

import { GRID_CONFIG } from './Grid.js';

export class Particle {
  constructor(x, y, vx, vy, color, radius, maxLife) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.radius = radius;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.alpha = 1.0;
  }

  update(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.life -= dt;
    this.alpha = Math.max(0, this.life / this.maxLife);
    return this.life > 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(1, this.radius * (this.life / this.maxLife)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ExplosionSpark extends Particle {
  constructor(x, y, color = '#f39c12') {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4.2;
    super(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4 + Math.random() * 4.5, 0.42 + Math.random() * 0.28);
  }
}

export class FloatingText {
  constructor(text, x, y, color = '#ffffff', fontSize = 16) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.vy = -1.05;
    this.color = color;
    this.fontSize = fontSize;
    this.life = 0.92;
    this.maxLife = 0.92;
    this.alpha = 1.0;
  }

  update(dt) {
    this.y += this.vy * dt * 60;
    this.life -= dt;
    this.alpha = Math.max(0, Math.min(1, (this.life / this.maxLife) * 1.4));
    return this.life > 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `900 ${this.fontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#181828';
    ctx.strokeText(this.text, this.x, this.y);

    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class ShockwaveRing {
  constructor(x, y, maxRadius = 110, color = '#f1c40f', maxLife = 0.45) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.maxRadius = maxRadius;
    this.color = color;
    this.life = maxLife;
    this.maxLife = maxLife;
  }

  update(dt) {
    this.life -= dt;
    const progress = 1 - Math.max(0, this.life / this.maxLife);
    this.radius = 10 + (this.maxRadius - 10) * (1 - Math.pow(1 - progress, 2));
    return this.life > 0;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 6 * alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Sóng Hắc Kiếm Yoru của Mihawk bay dọc theo hàng phối cảnh (colPos)
 */
export class AnimeSlashWave {
  constructor(startColPos, row) {
    this.colPos = startColPos;
    this.row = row;
    this.speed = 760;
    this.life = 1.45;
    this.maxLife = 1.45;
    this.pirates = pirates;
    this.onHitPirate = onHitPirate;
    this.hitSet = new Set();
  }

  update(dt) {
    const prevCol = this.colPos;
    this.colPos += (this.speed / 84) * dt;
    this.life -= dt;

    if (this.pirates && this.onHitPirate) {
      for (const p of this.pirates) {
        if (
          p.row === this.row &&
          !p.isDead &&
          !p.isDying &&
          !this.hitSet.has(p) &&
          p.colPos <= this.colPos + 0.35 &&
          p.colPos >= prevCol - 0.85
        ) {
          this.hitSet.add(p);
          this.onHitPirate(p);
        }
      }
    }
    return this.life > 0 && this.colPos <= 10.2;
  }

  render(ctx, grid = null) {
    const pt = grid
      ? grid.gridToPixel(this.colPos, this.row + 0.5)
      : { x: GRID_CONFIG.offsetX + this.colPos * GRID_CONFIG.cellWidth, y: GRID_CONFIG.offsetY + this.row * GRID_CONFIG.cellHeight + 45, scale: 1 };

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.scale(pt.scale || 1, pt.scale || 1);
    const alpha = Math.min(1, this.life * 2.5);
    ctx.globalAlpha = alpha;

    const grad = ctx.createLinearGradient(-95, 0, 25, 0);
    grad.addColorStop(0, 'rgba(0, 230, 118, 0)');
    grad.addColorStop(0.65, 'rgba(0, 230, 118, 0.55)');
    grad.addColorStop(1, 'rgba(185, 246, 202, 0.95)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-95, -34);
    ctx.quadraticCurveTo(24, 0, -95, 34);
    ctx.lineTo(-60, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#00e676';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(-24, 0, 44, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();

    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(-28, 0, 44, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Đại Cuồng Phong Bão Cát Sables của Thất Vũ Hải Crocodile (Phễu Lốc 3D + Chạm Mới Đẩy Lùi)
 */
export class SandTornado {
  constructor(startColPos, row, pirates = null, onHitPirate = null) {
    this.colPos = startColPos;
    this.row = row;
    this.speed = 460;
    this.life = 1.65;
    this.maxLife = 1.65;
    this.spin = 0;

    // Nhận danh sách Hải Tặc và hàm xử lý khi lốc chạm vào người Hải Tặc
    this.pirates = pirates;
    this.onHitPirate = onHitPirate;
    this.hitPirates = new Set(); // Đảm bảo mỗi Hải Tặc chỉ bị cuốn 1 lần mỗi cơn lốc

    // Khởi tạo các hạt cát vàng & mảnh đá bay xoáy quanh thân lốc
    this.debris = [];
    for (let i = 0; i < 34; i++) {
      this.debris.push({
        heightRatio: Math.random(), // Vị trí từ chân lốc (0) lên đỉnh lốc (1)
        angle: Math.random() * Math.PI * 2,
        rotSpeed: 10 + Math.random() * 12,
        radiusBonus: (Math.random() - 0.3) * 18,
        size: 2 + Math.random() * 4.2,
        isRock: i % 5 === 0,
        color: i % 3 === 0 ? '#fff2a3' : (i % 2 === 0 ? '#f1c40f' : '#b87729')
      });
    }
  }

  update(dt) {
    const prevCol = this.colPos;
    this.colPos += (this.speed / 84) * dt;
    this.spin += dt * 18;
    this.life -= dt;

    for (const d of this.debris) {
      d.angle += d.rotSpeed * dt;
      d.heightRatio += dt * 0.55;
      if (d.heightRatio > 1) d.heightRatio -= 1;
    }

    // Kiểm tra va chạm thực tế: Lốc bay chạm đến đâu mới đẩy lùi Hải Tặc đến đó!
    if (this.pirates && this.onHitPirate) {
      for (const p of this.pirates) {
        if (
          !p.isDead &&
          !p.isDying &&
          p.row === this.row &&
          !this.hitPirates.has(p) &&
          p.colPos <= this.colPos + 0.35 &&
          p.colPos >= prevCol - 0.85
        ) {
          this.hitPirates.add(p);
          this.onHitPirate(p);
        }
      }
    }

    return this.life > 0 && this.colPos <= 10.2;
  }

  render(ctx, grid = null) {
    const pt = grid
      ? grid.gridToPixel(this.colPos, this.row + 0.62)
      : { x: GRID_CONFIG.offsetX + this.colPos * GRID_CONFIG.cellWidth, y: GRID_CONFIG.offsetY + this.row * GRID_CONFIG.cellHeight + 52, scale: 1 };

    const sc = pt.scale || 1;
    const alpha = Math.min(1, this.life * 2.4);

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.scale(sc, sc);
    ctx.globalAlpha = alpha;

    const totalH = 128; // Chiều cao tổng của cơn lốc Sables
    const slices = 22;

    // Hàm tính tâm lệch X và bán kính phễu ở từng độ cao t (0 = chân lốc, 1 = đỉnh lốc)
    const getSpineX = (t) => {
      // Cơn lốc hơi chồm về phía trước + uốn lượn hình sin sống động
      const lean = t * 18;
      const wave = Math.sin(this.spin * 0.75 - t * 5.2) * (4 + t * 9);
      return lean + wave;
    };
    const getRadius = (t) => {
      // Phễu nhỏ ở đáy (12px), phình to mạnh ở đỉnh (54px)
      return 11 + Math.pow(t, 1.15) * 43 + Math.sin(this.spin * 1.3 + t * 8) * 3;
    };

    // 1. VẼ ĐÁM MÂY BỤI MÙ & XOÁY CÁT DƯỚI MẶT ĐẤT
    const dustGrad = ctx.createRadialGradient(0, 4, 4, 0, 4, 56);
    dustGrad.addColorStop(0, 'rgba(194, 133, 56, 0.85)');
    dustGrad.addColorStop(0.5, 'rgba(225, 177, 44, 0.45)');
    dustGrad.addColorStop(1, 'rgba(225, 177, 44, 0)');
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.ellipse(-8, 6, 58, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vòng cắt gió sắc lẹm dưới chân lốc
    ctx.strokeStyle = 'rgba(255, 243, 176, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 4, 28 + Math.sin(this.spin * 2) * 5, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. VẼ THÂN PHỄU BÃO CÁT LIỀN MẠCH (GRADIENT 3D TỪ SÁNG SANG TỐI)
    const leftEdge = [];
    const rightEdge = [];
    for (let i = 0; i <= slices; i++) {
      const t = i / slices;
      const y = -t * totalH;
      const cx = getSpineX(t);
      const r = getRadius(t);
      leftEdge.push({ x: cx - r, y });
      rightEdge.push({ x: cx + r, y });
    }

    const bodyGrad = ctx.createLinearGradient(-45, -totalH * 0.5, 55, -totalH * 0.5);
    bodyGrad.addColorStop(0, 'rgba(120, 75, 22, 0.82)');
    bodyGrad.addColorStop(0.38, 'rgba(218, 165, 50, 0.92)');
    bodyGrad.addColorStop(0.72, 'rgba(251, 197, 49, 0.95)');
    bodyGrad.addColorStop(1, 'rgba(140, 88, 28, 0.85)');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
    for (let i = 1; i <= slices; i++) {
      ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
    }
    for (let i = slices; i >= 0; i--) {
      ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // 3. VẼ CÁC DẢI LỐC XOẮN ỐC & LƯỠI GIÓ CÁT QUẤN QUANH THÂN PHỄU
    for (let i = 1; i <= slices; i++) {
      const t = i / slices;
      const y = -t * totalH;
      const cx = getSpineX(t);
      const r = getRadius(t);
      const ry = 4.5 + t * 9.5;
      const rot = Math.sin(this.spin + i * 0.6) * 0.12;

      // Vòng xoáy cát đậm nhạt đan xen tạo chiều sâu
      ctx.strokeStyle = (i % 2 === 0)
        ? 'rgba(255, 245, 192, 0.65)'
        : 'rgba(108, 71, 27, 0.55)';
      ctx.lineWidth = (i % 3 === 0) ? 3.2 : 2.0;

      ctx.beginPath();
      // Chỉ vẽ nửa cung phía trước để tạo cảm giác xoắn 3D
      const startAng = (this.spin * 1.4 + i * 0.9) % (Math.PI * 2);
      ctx.ellipse(cx, y, r * 1.04, ry, rot, startAng, startAng + Math.PI * 1.25);
      ctx.stroke();
    }

    // 4. VẼ MẮT BÃO TỐI SẦM Ở ĐỈNH PHỄU TRÊN CAO
    const topX = getSpineX(1);
    const topR = getRadius(1);
    const eyeGrad = ctx.createRadialGradient(topX, -totalH, 4, topX, -totalH, topR);
    eyeGrad.addColorStop(0, '#3d250b');
    eyeGrad.addColorStop(0.55, '#8c581c');
    eyeGrad.addColorStop(1, '#e1b12c');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(topX, -totalH, topR, 14, 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fff5c0';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(topX, -totalH, topR * 0.85, 10, 0.06, this.spin, this.spin + Math.PI * 1.4);
    ctx.stroke();

    // 5. VẼ CÁC MẢNH ĐÁ VỠ & HẠT CÁT VÀNG XOÁY TÍT XUNG QUANH
    for (const d of this.debris) {
      const t = d.heightRatio;
      const y = -t * totalH;
      const cx = getSpineX(t);
      const orbitR = getRadius(t) + 6 + d.radiusBonus;

      const dx = cx + Math.cos(d.angle) * orbitR;
      const dy = y + Math.sin(d.angle) * (5 + t * 8);

      if (d.isRock) {
        // Vẽ mảnh đá sa mạc góc cạnh
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(d.angle);
        ctx.fillStyle = '#5c3c16';
        ctx.strokeStyle = '#d4a359';
        ctx.lineWidth = 1;
        const s = d.size * 1.3;
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.5);
        ctx.lineTo(0, -s);
        ctx.lineTo(s, -s * 0.2);
        ctx.lineTo(s * 0.6, s);
        ctx.lineTo(-s * 0.7, s * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        // Vẽ hạt cát vàng & vệt gió lấp lánh
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(dx, dy, d.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

/**
 * Thiên thạch dung nham Lưu Tinh Hỏa Sơn của Akainu rơi xuống cụm hải tặc
 */
export class MagmaMeteor {
  constructor(targetX, targetY, delay = 0, onImpact = null) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = targetX - 180;
    this.y = targetY - 460;
    this.delay = delay;
    this.onImpact = onImpact;
    this.impacted = false;
    this.life = 0.72;
    this.maxLife = 0.72;
    this.speed = 920;
  }

  update(dt) {
    if (this.delay > 0) {
      this.delay -= dt;
      return true;
    }

    if (!this.impacted) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= this.speed * dt) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.impacted = true;
        this.life = 0.45;
        this.maxLife = 0.45;
        if (this.onImpact) this.onImpact(this.targetX, this.targetY);
      } else {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }
      return true;
    }

    this.life -= dt;
    return this.life > 0;
  }

  render(ctx) {
    if (this.delay > 0) return;
    ctx.save();

    if (!this.impacted) {
      ctx.fillStyle = 'rgba(231, 76, 60, 0.32)';
      ctx.beginPath();
      ctx.ellipse(this.targetX, this.targetY + 14, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createLinearGradient(this.x - 50, this.y - 120, this.x, this.y);
      grad.addColorStop(0, 'rgba(255, 71, 87, 0)');
      grad.addColorStop(0.6, 'rgba(255, 107, 1, 0.75)');
      grad.addColorStop(1, '#fff200');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x - 42, this.y - 108);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffa502';
      ctx.beginPath();
      ctx.arc(this.x - 2, this.y - 2, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const p = 1 - this.life / this.maxLife;
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(this.targetX, this.targetY, 22 + p * 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.restore();
  }
}

/**
 * Gai Băng Kỷ Băng Hà của Aokiji mọc xuyên 9 ô theo đúng phối cảnh hàng
 */
/**
 * Đại Băng Tinh Kỷ Băng Hà (Ice Age) của Đô Đốc Aokiji - Phiên bản 3D Đa Diện & Sương Hàn Khí
 */
export class IceAgeCrystal {
  constructor(row) {
    this.row = row;
    this.life = 1.75;
    this.maxLife = 1.75;
    this.time = 0;

    // Khởi tạo sẵn các hạt sương lạnh & bông tuyết bay dọc làn đường
    this.frostMotes = [];
    for (let i = 0; i < 28; i++) {
      this.frostMotes.push({
        colOffset: Math.random() * GRID_CONFIG.cols,
        yOffset: -8 - Math.random() * 55,
        vy: -12 - Math.random() * 22,
        vx: 8 + Math.random() * 18,
        size: 2.2 + Math.random() * 3.8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4,
        isSnowflake: i % 3 === 0
      });
    }
  }

  update(dt) {
    this.life -= dt;
    this.time += dt;
    for (const m of this.frostMotes) {
      m.yOffset += m.vy * dt;
      m.colOffset += (m.vx / 84) * dt;
      m.rot += m.rotSpeed * dt;
      if (m.yOffset < -72) m.yOffset = -5;
    }
    return this.life > 0;
  }

  // Hàm vẽ 1 trụ băng tinh thể 3D vát cạnh (mặt sáng + mặt tối + viền phản quang)
  draw3DIceSpire(ctx, x, y, width, height, tiltX, sc) {
    if (height <= 2) return;
    const tipX = x + tiltX * sc;
    const tipY = y - height;
    const halfW = (width * 0.5) * sc;
    const midY = y - height * 0.28;

    // Mặt trái (Đón sáng - Trắng xanh lấp lánh)
    const leftGrad = ctx.createLinearGradient(tipX, tipY, x - halfW, y);
    leftGrad.addColorStop(0, '#ffffff');
    leftGrad.addColorStop(0.45, '#b3f0ff');
    leftGrad.addColorStop(1, '#00b4d8');
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(x - halfW, midY);
    ctx.lineTo(x - halfW * 0.72, y);
    ctx.lineTo(x, y + 3 * sc);
    ctx.closePath();
    ctx.fill();

    // Mặt phải (Khuất sáng - Xanh lam sâu thẳm tạo khối 3D)
    const rightGrad = ctx.createLinearGradient(tipX, tipY, x + halfW, y);
    rightGrad.addColorStop(0, '#dff9fb');
    rightGrad.addColorStop(0.35, '#0097e6');
    rightGrad.addColorStop(1, '#023e8a');
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(x, y + 3 * sc);
    ctx.lineTo(x + halfW * 0.72, y);
    ctx.lineTo(x + halfW, midY);
    ctx.closePath();
    ctx.fill();

    // Đường sống băng sắc lẹm ở chính giữa
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 1.8 * sc;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(x, y + 3 * sc);
    ctx.stroke();

    // Viền ngoài tinh thể phát sáng
    ctx.strokeStyle = '#e0fbfc';
    ctx.lineWidth = 1.3 * sc;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(x - halfW, midY);
    ctx.lineTo(x - halfW * 0.72, y);
    ctx.lineTo(x, y + 3 * sc);
    ctx.lineTo(x + halfW * 0.72, y);
    ctx.lineTo(x + halfW, midY);
    ctx.closePath();
    ctx.stroke();
  }

  // Hàm vẽ hoa tuyết 6 cánh
  drawSnowflake(ctx, x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }
    ctx.restore();
  }

  render(ctx, grid = null) {
    ctx.save();
    const prog = 1 - this.life / this.maxLife;
    const fade = this.life < 0.45 ? (this.life / 0.45) : 1;
    ctx.globalAlpha = fade;

    // 1. VẼ THẢM BĂNG ĐÓNG CỨNG DƯỚI MẶT ĐẤT & SƯƠNG MÙ HÀN KHÍ DỌC HÀNG
    const startPt = grid
      ? grid.gridToPixel(0, this.row + 0.65)
      : { x: GRID_CONFIG.offsetX, y: GRID_CONFIG.offsetY + this.row * GRID_CONFIG.cellHeight + 60, scale: 1 };
    const waveCol = Math.min(GRID_CONFIG.cols, prog * 26); // Băng lan cực nhanh từ trái sang phải
    const endPt = grid
      ? grid.gridToPixel(waveCol, this.row + 0.65)
      : { x: GRID_CONFIG.offsetX + waveCol * GRID_CONFIG.cellWidth, y: startPt.y, scale: 1 };

    const sc0 = startPt.scale || 1;
    const laneW = Math.max(10, endPt.x - startPt.x);

    // Thảm băng phát sáng dưới mặt đất
    const frostGrad = ctx.createLinearGradient(startPt.x, startPt.y - 22 * sc0, startPt.x, startPt.y + 18 * sc0);
    frostGrad.addColorStop(0, 'rgba(0, 210, 255, 0)');
    frostGrad.addColorStop(0.35, 'rgba(130, 235, 255, 0.55)');
    frostGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.75)');
    frostGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');
    ctx.fillStyle = frostGrad;
    ctx.fillRect(startPt.x, startPt.y - 22 * sc0, laneW, 40 * sc0);

    // 2. VẼ CỤM TINH THỂ BĂNG 3D TRỒI LÊN THEO ĐỢT SÓNG Ở TỪNG Ô
    for (let c = 0; c < GRID_CONFIG.cols; c++) {
      // Độ trễ để cột băng mọc đuổi nhau từ cột 0 -> cột 8 giống nguyên tác Aokiji
      const cellDelay = c * 0.032;
      const localProg = Math.max(0, prog - cellDelay);
      if (localProg <= 0) continue;

      // Hiệu ứng trồi vọt lên (overshoot nhẹ) rồi đứng vững
      const rawGrow = Math.min(1, localProg * 5.5);
      const grow = rawGrow < 0.8
        ? (rawGrow / 0.8) * 1.12
        : 1.12 - ((rawGrow - 0.8) / 0.2) * 0.12;

      const pt = grid
        ? grid.gridToPixel(c + 0.5, this.row + 0.82)
        : { x: GRID_CONFIG.offsetX + c * GRID_CONFIG.cellWidth + 41, y: GRID_CONFIG.offsetY + this.row * GRID_CONFIG.cellHeight + 75, scale: 1 };
      const sc = pt.scale || 1;

      // Đế băng nứt vỡ dưới chân mỗi cụm
      ctx.fillStyle = 'rgba(200, 248, 255, 0.78)';
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, 28 * sc * Math.min(1, rawGrow), 8.5 * sc * Math.min(1, rawGrow), 0, 0, Math.PI * 2);
      ctx.fill();

      // Vẽ 2 gai băng phụ hai bên trước
      const sideH1 = (32 + (c % 3) * 6) * grow * sc;
      const sideH2 = (28 + ((c + 1) % 2) * 8) * grow * sc;
      this.draw3DIceSpire(ctx, pt.x - 15 * sc, pt.y - 1 * sc, 18, sideH1, -9, sc);
      this.draw3DIceSpire(ctx, pt.x + 15 * sc, pt.y - 1 * sc, 17, sideH2, 11, sc);

      // Vẽ đại trụ băng chính giữa cao vút, hơi chĩa mũi nhọn về phía Hải Tặc
      const mainH = (54 + (c % 2) * 14) * grow * sc;
      const mainTilt = (c % 2 === 0 ? 7 : 4);
      this.draw3DIceSpire(ctx, pt.x, pt.y + 2 * sc, 26, mainH, mainTilt, sc);

      // Ánh sáng lóe chữ thập (Sparkle) trên đỉnh trụ băng
      if (rawGrow > 0.7) {
        const sparkX = pt.x + mainTilt * sc;
        const sparkY = pt.y + 2 * sc - mainH;
        const pulse = 0.6 + 0.4 * Math.sin(this.time * 18 + c);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.lineWidth = 1.6 * sc;
        const sLen = 8 * sc * pulse;
        ctx.beginPath();
        ctx.moveTo(sparkX - sLen, sparkY);
        ctx.lineTo(sparkX + sLen, sparkY);
        ctx.moveTo(sparkX, sparkY - sLen);
        ctx.lineTo(sparkX, sparkY + sLen);
        ctx.stroke();
      }
    }

    // 3. VẼ BÔNG TUYẾT 6 CÁNH & HẠT SƯƠNG LẠNH BAY LƠ LỬNG
    for (const m of this.frostMotes) {
      if (m.colOffset > waveCol) continue;
      const mPt = grid
        ? grid.gridToPixel(m.colOffset, this.row + 0.7)
        : { x: GRID_CONFIG.offsetX + m.colOffset * GRID_CONFIG.cellWidth, y: startPt.y, scale: 1 };
      const mSc = mPt.scale || 1;
      const mx = mPt.x;
      const my = mPt.y + m.yOffset * mSc;

      if (m.isSnowflake) {
        this.drawSnowflake(ctx, mx, my, m.size * 1.6 * mSc, m.rot);
      } else {
        ctx.fillStyle = '#e0fbfc';
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 0.7 * mSc, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

/**
 * Vết Nứt Không Gian Gura Gura của Tứ Hoàng Râu Trắng theo phối cảnh hàng
 */
export class QuakeCrack {
  constructor(colPos, row) {
    this.colPos = colPos;
    this.row = row;
    this.life = 1.1;
    this.maxLife = 1.1;
  }

  update(dt) {
    this.life -= dt;
    return this.life > 0;
  }

  render(ctx, grid = null) {
    const pt = grid
      ? grid.gridToPixel(this.colPos, this.row + 0.45)
      : { x: GRID_CONFIG.offsetX + this.colPos * GRID_CONFIG.cellWidth, y: GRID_CONFIG.offsetY + this.row * GRID_CONFIG.cellHeight + 40, scale: 1 };
    const pLeft1 = grid ? grid.gridToPixel(this.colPos - 1.1, this.row + 0.2) : { x: pt.x - 95, y: pt.y - 22 };
    const pLeft2 = grid ? grid.gridToPixel(this.colPos - 2.2, this.row + 0.55) : { x: pt.x - 185, y: pt.y + 6 };
    const pLeft3 = grid ? grid.gridToPixel(this.colPos - 3.6, this.row + 0.25) : { x: pt.x - 300, y: pt.y - 18 };
    const pBot1 = grid ? grid.gridToPixel(this.colPos - 1.0, this.row + 0.8) : { x: pt.x - 85, y: pt.y + 22 };
    const pBot2 = grid ? grid.gridToPixel(this.colPos - 2.4, this.row + 0.72) : { x: pt.x - 200, y: pt.y + 18 };

    ctx.save();
    const prog = 1 - this.life / this.maxLife;
    const alpha = 1 - prog;
    ctx.globalAlpha = alpha;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5 * alpha;
    ctx.shadowColor = '#74b9ff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(pt.x - 18, pt.y - 10, (24 + prog * 145) * (pt.scale || 1), 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#dfe6e9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pt.x - 10, pt.y - 10);
    ctx.lineTo(pLeft1.x, pLeft1.y);
    ctx.lineTo(pLeft2.x, pLeft2.y);
    ctx.lineTo(pLeft3.x, pLeft3.y);
    ctx.moveTo(pt.x - 10, pt.y - 10);
    ctx.lineTo(pBot1.x, pBot1.y);
    ctx.lineTo(pBot2.x, pBot2.y);
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Vòng Xoáy Ám Huyệt Kurouzu của Tứ Hoàng Râu Đen
 */
/**
 * Hố Đen Ám Thủy (Black Hole / Kurouzu) của Tứ Hoàng Râu Đen - Yami Yami no Mi
 */
export class DarkVortex {
  constructor(x, y, maxLife = 2.6) {
    this.x = x;
    this.y = y;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.spin = 0;

    // Các hạt bóng tối & mảnh năng lượng bị lực hút trọng lực kéo vào tâm hố đen
    this.voidMotes = [];
    for (let i = 0; i < 26; i++) {
      this.voidMotes.push({
        angle: Math.random() * Math.PI * 2,
        dist: 12 + Math.random() * 48,
        height: Math.random() * 68,
        speed: 2.5 + Math.random() * 3.5,
        size: 2.2 + Math.random() * 4.2,
        isDarkCore: i % 2 === 0
      });
    }
  }

  update(dt) {
    this.spin += dt * 7.5;
    this.life -= dt;

    // Hiệu ứng hút xoáy vào tâm (Implosion Gravity)
    for (const m of this.voidMotes) {
      m.angle += dt * m.speed * 1.8;
      m.dist -= dt * 36;
      m.height += dt * 22;
      if (m.dist <= 3 || m.height > 72) {
        m.dist = 42 + Math.random() * 20;
        m.height = Math.random() * 14;
      }
    }

    return this.life > 0;
  }

  render(ctx) {
    const prog = 1 - this.life / this.maxLife;
    // Phình to cực nhanh lúc mới xuất hiện và thu hẹp hút vào tâm khi kết thúc
    const expand = Math.min(1, prog * 6);
    const fade = Math.min(1, this.life * 2.5);

    ctx.save();
    ctx.translate(this.x, this.y + 16);
    ctx.scale(expand, expand);
    ctx.globalAlpha = fade;

    // 1. HÀO QUANG TRỌNG LỰC TÍM ĐEN LAN TỎA DƯỚI MẶT ĐẤT
    const pulse = 1 + Math.sin(this.spin * 2.2) * 0.08;
    const outerR = 56 * pulse;
    const groundGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, outerR);
    groundGrad.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
    groundGrad.addColorStop(0.48, 'rgba(28, 0, 48, 0.92)');
    groundGrad.addColorStop(0.76, 'rgba(155, 40, 225, 0.65)');
    groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, outerR, outerR * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. VÒNG XOÁY HỐ ĐEN & CHân Trời Sự Kiện (Event Horizon)
    for (let i = 0; i < 3; i++) {
      const rX = (42 - i * 9) * pulse;
      const rY = (17 - i * 3.5) * pulse;
      const startAng = this.spin * (1.3 + i * 0.35) + i * 2.1;

      ctx.strokeStyle = i === 0 ? '#d980fa' : '#8e44ad';
      ctx.lineWidth = 2.6 - i * 0.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, rX, rY, 0, startAng, startAng + Math.PI * 1.35);
      ctx.stroke();
    }

    // Lõi Hố Đen đặc quánh dưới chân
    ctx.fillStyle = '#030006';
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 * pulse, 12 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. CÁC DẢI KHÓI HẮC ÁM (YAMI TENDRILS) TRỒI LÊN QUẤN CHẶT MỤC TIÊU
    const tendrilCount = 6;
    for (let i = 0; i < tendrilCount; i++) {
      const baseAngle = this.spin * 0.9 + (i * Math.PI * 2) / tendrilCount;
      const startX = Math.cos(baseAngle) * 28;
      const startY = Math.sin(baseAngle) * 10;

      const midX = Math.cos(baseAngle + 0.9) * 22;
      const midY = -30 + Math.sin(this.spin * 2 + i) * 6;

      const tipX = Math.cos(baseAngle + 1.8) * 9;
      const tipY = -62 - (i % 2) * 12 + Math.sin(this.spin * 3 + i) * 5;

      // Viền năng lượng tím phát sáng bên ngoài dải khói
      ctx.strokeStyle = 'rgba(190, 46, 221, 0.78)';
      ctx.lineWidth = 8.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();

      // Lõi khói đen đặc của trái Yami Yami
      ctx.strokeStyle = '#05010a';
      ctx.lineWidth = 4.8;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();
    }

    // 4. VÒNG XIỀNG XÍCH BÓNG TỐI XOAY NGANG THÂN ĐƠN VỊ BỊ KHỐNG CHẾ
    const ringY = -32 + Math.sin(this.spin * 3) * 3;
    ctx.strokeStyle = '#e056fd';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, ringY, 27, 8, 0.12 * Math.sin(this.spin), 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#05010a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, ringY, 25, 7, -0.12 * Math.sin(this.spin), this.spin, this.spin + Math.PI * 1.2);
    ctx.stroke();

    // 5. HẠT VẬT CHẤT BỊ HÚT VÀO TÂM & TIA CHỚP HẮC ÁM
    for (const m of this.voidMotes) {
      const mx = Math.cos(m.angle) * m.dist;
      const my = Math.sin(m.angle) * (m.dist * 0.38) - m.height;

      if (m.isDarkCore) {
        ctx.fillStyle = '#05010a';
        ctx.strokeStyle = '#be2edd';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#e056fd';
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tia sét đen-tím xẹt ngẫu nhiên quanh hố đen
    if (Math.random() < 0.65) {
      const lAngle = Math.random() * Math.PI * 2;
      const lx = Math.cos(lAngle) * 18;
      const ly = -12 - Math.random() * 38;
      ctx.strokeStyle = '#e056fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(lx * 0.6 + (Math.random() - 0.5) * 10, ly + 10);
      ctx.lineTo(lx, ly);
      ctx.stroke();
    }

    ctx.restore();
  }
}
