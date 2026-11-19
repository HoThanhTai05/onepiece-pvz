/**
 * Beli Coin Economy (Sunflower / Sun Mechanics - Version 3 Smooth Collect Swoosh)
 */

export class BeliCoin {
  constructor(startX, startY, targetY, isFromSky = true, value = 25) {
    this.x = startX;
    this.y = startY;
    this.targetY = targetY;
    this.isFromSky = isFromSky;

    this.value = value;
    this.radius = 20;
    this.life = 13.0; // Stays on screen 13 seconds for relaxed mobile taps
    this.isCollected = false;
    this.isExpired = false;

    // Collection animation swooshing smoothly to Beli bank icon at (40, 47)
    this.collectAnim = 0;
    this.collectStartX = startX;
    this.collectStartY = startY;

    this.bobTime = Math.random() * Math.PI * 2;
    this.fallSpeed = isFromSky ? 58 : 42;
  }

  update(dt) {
    if (this.isExpired) return;

    if (this.isCollected) {
      this.collectAnim += dt * 3.2;
      const t = Math.min(1.0, this.collectAnim);
      const ease = 1 - Math.pow(1 - t, 3); // smooth easeOutCubic

      this.x = this.collectStartX + (40 - this.collectStartX) * ease;
      this.y = this.collectStartY + (47 - this.collectStartY) * ease;

      if (t >= 1.0) {
        this.isExpired = true;
      }
      return;
    }

    // Natural smooth floating descent
    this.bobTime += dt * 3.5;
    if (this.y < this.targetY) {
      this.y += this.fallSpeed * dt;
    } else {
      this.y = this.targetY;
      this.life -= dt;
      if (this.life <= 0) {
        this.isExpired = true;
      }
    }
  }

  collect() {
    if (this.isCollected || this.isExpired) return false;
    this.isCollected = true;
    this.collectStartX = this.x;
    this.collectStartY = this.y;
    return true;
  }

  isPointInside(px, py) {
    if (this.isCollected || this.isExpired) return false;
    const bob = (this.y >= this.targetY) ? Math.sin(this.bobTime) * 3.5 : 0;
    const d = Math.hypot(px - this.x, py - (this.y + bob));
    return d <= this.radius + 15; // Generous touch target for mobile thumbs!
  }

  render(ctx) {
    if (this.isExpired) return;

    const bob = (this.y >= this.targetY && !this.isCollected) ? Math.sin(this.bobTime) * 3.5 : 0;
    const renderY = this.y + bob;
    const coinScale = this.isCollected ? Math.max(0.55, 1.0 - this.collectAnim * 0.45) : 1.0;

    ctx.save();
    ctx.translate(this.x, renderY);
    ctx.scale(coinScale, coinScale);

    // Smooth pulsing warning when expiring
    if (this.life < 3.0 && !this.isCollected) {
      ctx.globalAlpha = 0.45 + 0.5 * Math.abs(Math.sin(this.life * 8));
    }

    // Soft radiant aura
    const pulseR = this.radius + 5 + Math.sin(this.bobTime * 1.8) * 2;
    ctx.beginPath();
    ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(241, 196, 15, 0.35)';
    ctx.fill();

    // Golden Beli Coin
    const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, this.radius);
    grad.addColorStop(0, '#fff9c4');
    grad.addColorStop(0.5, '#f1c40f');
    grad.addColorStop(1, '#d35400');

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Iconic One Piece "฿" symbol
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('฿', 0, 0);

    ctx.restore();
  }
}


/**
 * Vàng Khối (Gold Bar) - rơi từ hải tặc khi chết (tỷ lệ chỉnh ở ECONOMY_CONFIG.goldDropChance trong Stages.js)
 * Bay vọt lên theo hình vòng cung, rơi xuống đất lấp lánh. Chạm vào để nhặt (bay về ô Vàng trên HUD).
 * Nếu không kịp nhặt sau `life` giây sẽ TỰ ĐỘNG được thu để người chơi không bao giờ mất vàng.
 */
export class GoldBar {
  constructor(x, y, groundY, value = 1, targetX = 1008, targetY = 32) {
    this.x = x;
    this.y = y;
    this.groundY = groundY;
    this.value = value;
    this.vx = (Math.random() - 0.5) * 70;
    this.vy = -190;
    this.life = 9.0;
    this.isCollected = false;
    this.isExpired = false;
    this.expireRequested = false;
    this.collectAnim = 0;
    this.collectStartX = x;
    this.collectStartY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.glintTime = Math.random() * 6;
    this.landed = false;
    this.radius = 22;
  }

  update(dt) {
    if (this.isExpired) return;
    this.glintTime += dt;

    if (this.isCollected) {
      this.collectAnim += dt * 2.8;
      const t = Math.min(1.0, this.collectAnim);
      const ease = 1 - Math.pow(1 - t, 3);
      this.x = this.collectStartX + (this.targetX - this.collectStartX) * ease;
      this.y = this.collectStartY + (this.targetY - this.collectStartY) * ease;
      if (t >= 1.0) this.isExpired = true;
      return;
    }

    if (!this.landed) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += 720 * dt;
      if (this.y >= this.groundY && this.vy > 0) {
        this.y = this.groundY;
        if (Math.abs(this.vy) > 120) {
          this.vy = -this.vy * 0.38;
          this.vx *= 0.5;
        } else {
          this.landed = true;
          this.vy = 0;
          this.vx = 0;
        }
      }
    } else {
      this.life -= dt;
      if (this.life <= 0 && !this.expireRequested) {
        this.expireRequested = true;
      }
    }
  }

  collect() {
    if (this.isCollected || this.isExpired) return false;
    this.isCollected = true;
    this.collectStartX = this.x;
    this.collectStartY = this.y;
    return true;
  }

  isPointInside(px, py) {
    if (this.isCollected || this.isExpired) return false;
    return Math.hypot(px - this.x, py - (this.y - 10)) <= this.radius + 16;
  }

  render(ctx) {
    if (this.isExpired) return;
    const scale = this.isCollected ? Math.max(0.5, 1 - this.collectAnim * 0.5) : 1;
    const bob = (this.landed && !this.isCollected) ? Math.sin(this.glintTime * 4) * 2 : 0;

    ctx.save();
    ctx.translate(this.x, this.y - 12 + bob);
    ctx.scale(scale, scale);

    if (this.life < 3.0 && this.landed && !this.isCollected) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(this.life * 8));
    }

    // Ánh hào quang vàng
    const glowR = 28 + Math.sin(this.glintTime * 5) * 3;
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, glowR);
    glow.addColorStop(0, 'rgba(255, 236, 130, 0.65)');
    glow.addColorStop(1, 'rgba(255, 200, 40, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Thanh vàng khối 3D hình thang
    const topGrad = ctx.createLinearGradient(-20, -14, 20, -2);
    topGrad.addColorStop(0, '#fff3a6');
    topGrad.addColorStop(0.5, '#ffd43b');
    topGrad.addColorStop(1, '#f59f00');
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(-14, -12);
    ctx.lineTo(14, -12);
    ctx.lineTo(22, 0);
    ctx.lineTo(-22, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a5a00';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    const frontGrad = ctx.createLinearGradient(0, 0, 0, 12);
    frontGrad.addColorStop(0, '#f5b301');
    frontGrad.addColorStop(1, '#b36b00');
    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.rect(-22, 0, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(120, 60, 0, 0.8)';
    ctx.font = 'bold 9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GOLD', 0, 6.5);

    // Tia lấp lánh
    const sp = (Math.sin(this.glintTime * 6) + 1) / 2;
    ctx.strokeStyle = `rgba(255,255,255,${0.4 + sp * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9, -22 - sp * 3);
    ctx.lineTo(-9, -12);
    ctx.moveTo(-14, -17);
    ctx.lineTo(-4, -17);
    ctx.stroke();

    ctx.restore();

    if (this.landed && !this.isCollected) {
      ctx.save();
      ctx.fillStyle = '#ffe066';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      const label = `+${this.value} VÀNG`;
      ctx.strokeText(label, this.x, this.y - 40 + bob);
      ctx.fillText(label, this.x, this.y - 40 + bob);
      ctx.restore();
    }
  }
}
