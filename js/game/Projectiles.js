/**
 * Đạn Bắn & Chiêu Thức Bay Dọc Làn Phối Cảnh (Version 4)
 * Di chuyển theo hệ tọa độ colPos (0..9) để khớp hoàn hảo đường đi của Hải Tặc ở mọi độ sâu hàng.
 */

import { GRID_CONFIG } from './Grid.js';

export class Projectile {
  constructor(colPos, row, kindOrIsIce = 'lead', damage = 20, opts = {}) {
    this.colPos = colPos;
    this.row = row;
    this.x = GRID_CONFIG.offsetX + colPos * GRID_CONFIG.cellWidth;
    this.y = (GRID_CONFIG.offsetY + row * GRID_CONFIG.cellHeight + GRID_CONFIG.cellHeight / 2);

    if (typeof kindOrIsIce === 'boolean') {
      this.kind = kindOrIsIce ? 'ice' : 'lead';
    } else {
      this.kind = kindOrIsIce || 'lead';
    }

    this.isIce = (this.kind === 'ice');
    this.damage = damage;
    this.slowDuration = opts.slowDuration || 4.5;
    this.burnDuration = opts.burnDuration || 4.0;
    this.splashDamageRatio = opts.splashDamageRatio || 0.55;
    this.splashRadiusCols = opts.splashRadiusCols || 0.95;

    this.isDestroyed = false;
    this.animTime = 0;
    this.hitPirates = new Set();

    switch (this.kind) {
      case 'sand':
        this.speed = 460;
        this.pierceLeft = 3;
        break;
      case 'slash':
        this.speed = 560;
        this.pierceLeft = 4;
        break;
      case 'magma':
        this.speed = 420;
        this.pierceLeft = 1;
        break;
      case 'cannonball':
        this.speed = 375;
        this.pierceLeft = 1;
        break;
      case 'ice':
      case 'lead':
      default:
        this.speed = 390;
        this.pierceLeft = 1;
        break;
    }
  }

  update(dt, piratesInLane, onAction, grid = null, allPirates = null) {
    if (this.isDestroyed) return;

    this.animTime += dt;
    this.colPos += (this.speed / 84) * dt;

    if (grid) {
      const pt = grid.gridToPixel(this.colPos, this.row + 0.5);
      this.x = pt.x;
      this.y = pt.y;
    } else {
      this.x += this.speed * dt;
    }

    for (const p of piratesInLane) {
      if (p.isDead || p.isDying || this.hitPirates.has(p)) continue;

      const hitHalfCols = (this.kind === 'slash' || this.kind === 'sand') ? 0.38 : 0.30;
      if (Math.abs(this.colPos - p.colPos) <= hitHalfCols) {
        this.hitPirates.add(p);

        const hitPt = grid ? grid.gridToPixel(p.colPos, this.row + 0.5) : { x: this.x, y: this.y };

        if (this.kind === 'cannonball') {
          p.takeDamage(this.damage, {});
          const splashDmg = Math.round(this.damage * (this.splashDamageRatio || 0.65));
          const rad = this.splashRadiusCols || 1.05;
          const pool = allPirates || piratesInLane;
          for (const other of pool) {
            if (other !== p && !other.isDead && !other.isDying && Math.abs(other.row - this.row) <= 1) {
              const maxCols = (other.row === this.row) ? rad : Math.max(0.75, rad * 0.8);
              if (Math.abs(other.colPos - this.colPos) <= maxCols) {
                other.takeDamage(splashDmg);
              }
            }
          }
          if (onAction) {
            onAction('PROJECTILE_HIT', {
              x: hitPt.x,
              y: hitPt.y,
              colPos: this.colPos,
              row: this.row,
              kind: this.kind,
              damage: this.damage,
              splashDmg,
              isIce: false,
              isCannonball: true
            });
          }
          this.isDestroyed = true;
          break;
        }

        if (this.kind === 'magma') {
          p.takeDamage(this.damage, { burnTime: this.burnDuration });
          // Nổ lan dung nham lên các hải tặc lân cận cùng hàng
          for (const other of piratesInLane) {
            if (other !== p && !other.isDead && !other.isDying && Math.abs(other.colPos - this.colPos) <= this.splashRadiusCols) {
              other.takeDamage(Math.round(this.damage * this.splashDamageRatio), { burnTime: Math.max(2.0, this.burnDuration - 1.0) });
            }
          }
          if (onAction) {
            onAction('PROJECTILE_HIT', {
              x: hitPt.x,
              y: hitPt.y,
              colPos: this.colPos,
              row: this.row,
              kind: this.kind,
              damage: this.damage,
              isIce: false,
              isMagma: true
            });
          }
          this.isDestroyed = true;
          break;
        }

        if (this.kind === 'slash') {
          p.takeDamage(this.damage, { ignoreArmor: true });
        } else if (this.kind === 'fire_lead') {
          // Đạn lửa Trái Mera Mera: gây sát thương + thiêu đốt hải tặc
          p.takeDamage(this.damage, { burnTime: this.burnDuration });
        } else {
          p.takeDamage(this.damage, { isIce: this.isIce, slowDuration: this.slowDuration });
        }

        if (onAction) {
          onAction('PROJECTILE_HIT', {
            x: hitPt.x,
            y: hitPt.y,
            colPos: this.colPos,
            row: this.row,
            kind: this.kind,
            damage: this.damage,
            isIce: this.isIce
          });
        }

        this.pierceLeft--;
        if (this.pierceLeft <= 0) {
          this.isDestroyed = true;
          break;
        }
      }
    }

    if (this.colPos > 9.95) {
      this.isDestroyed = true;
    }
  }

  render(ctx, grid = null) {
    if (this.isDestroyed) return;

    const pt = grid ? grid.gridToPixel(this.colPos, this.row + 0.85) : { x: this.x, y: this.y, scale: 1 };
    const sc = pt.scale || 1;
    const x = pt.x;
    const y = pt.y - 65 * sc;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    if (this.kind === 'ice') {
      // Mũi giáo băng Aokiji
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.45)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();

      ctx.fillStyle = '#00d2ff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-4, -6.5);
      ctx.lineTo(-11, 0);
      ctx.lineTo(-4, 6.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.kind === 'sand') {
      // Lưỡi cát xuyên thấu Crocodile
      const grad = ctx.createLinearGradient(-30, 0, 14, 0);
      grad.addColorStop(0, 'rgba(225, 177, 44, 0)');
      grad.addColorStop(0.55, 'rgba(225, 177, 44, 0.65)');
      grad.addColorStop(1, '#fbc531');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-30, -13);
      ctx.quadraticCurveTo(16, 0, -30, 13);
      ctx.lineTo(-12, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fff5c0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-4, 0, 14, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
    } else if (this.kind === 'slash') {
      // Trảm kiếm khí xanh ngọc Mihawk
      const grad = ctx.createLinearGradient(-36, 0, 18, 0);
      grad.addColorStop(0, 'rgba(0, 230, 118, 0)');
      grad.addColorStop(0.6, 'rgba(0, 230, 118, 0.6)');
      grad.addColorStop(1, '#b9f6ca');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-38, -22);
      ctx.quadraticCurveTo(20, 0, -38, 22);
      ctx.lineTo(-18, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-8, 0, 22, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-6, 0, 22, -Math.PI * 0.36, Math.PI * 0.36);
      ctx.stroke();
    } else if (this.kind === 'magma') {
      // Nắm đấm dung nham Akainu
      const wobble = Math.sin(this.animTime * 22) * 2;
      ctx.fillStyle = 'rgba(255, 71, 87, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-16, 0, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c0392b';
      ctx.strokeStyle = '#181828';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 11.5 + wobble * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffa502';
      ctx.beginPath();
      ctx.arc(2, -1, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff200';
      ctx.beginPath();
      ctx.arc(3, -2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === 'cannonball') {
      // Đạn đại bác sắt Buster Call đổ bóng 3D + ngòi nổ lóe sáng
      const smokeShift = Math.sin(this.animTime * 18) * 1.8;
      ctx.fillStyle = 'rgba(189, 195, 199, 0.38)';
      ctx.beginPath();
      ctx.arc(-18, smokeShift, 7.5, 0, Math.PI * 2);
      ctx.arc(-28, -smokeShift, 5, 0, Math.PI * 2);
      ctx.fill();

      const ballGrad = ctx.createRadialGradient(-4, -4, 1.5, 0, 0, 11);
      ballGrad.addColorStop(0, '#95a5a6');
      ballGrad.addColorStop(0.42, '#485460');
      ballGrad.addColorStop(1, '#181828');
      ctx.fillStyle = ballGrad;
      ctx.strokeStyle = '#0d1117';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, -9);
      ctx.quadraticCurveTo(6, -15, 10, -13);
      ctx.stroke();

      const sparkR = 3.2 + Math.sin(this.animTime * 28) * 1.1;
      ctx.fillStyle = '#ffa502';
      ctx.beginPath();
      ctx.arc(10, -13, sparkR * 1.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff9c4';
      ctx.beginPath();
      ctx.arc(10, -13, sparkR * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === 'fire_lead') {
      // Đạn lửa Trái Mera Mera: quả cầu lửa cam đỏ kéo đuôi lửa
      const flick = Math.sin(this.animTime * 30) * 2;
      const tail = ctx.createLinearGradient(-30, 0, 0, 0);
      tail.addColorStop(0, 'rgba(255, 71, 87, 0)');
      tail.addColorStop(1, 'rgba(255, 140, 0, 0.8)');
      ctx.fillStyle = tail;
      ctx.beginPath();
      ctx.moveTo(-30, flick);
      ctx.lineTo(0, -8);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      const fireGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 9);
      fireGrad.addColorStop(0, '#fff7b0');
      fireGrad.addColorStop(0.45, '#ffa502');
      fireGrad.addColorStop(1, '#e8412c');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 8.5 + flick * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Đạn chì Hải Quân đổ bóng 3D
      ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();

      const leadGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7);
      leadGrad.addColorStop(0, '#fff59d');
      leadGrad.addColorStop(0.5, '#f1c40f');
      leadGrad.addColorStop(1, '#b7791f');
      ctx.fillStyle = leadGrad;
      ctx.strokeStyle = '#181828';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
