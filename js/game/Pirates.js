/**
 * ============================================================================
 * BẢNG THÔNG SỐ HẢI TẶC & BOSS TỨ HOÀNG (PIRATE_TYPES + PIRATE_COMBAT_CONFIG)
 * ============================================================================
 * Hướng dẫn tự chỉnh sửa:
 * Bạn có thể tự thay đổi Máu (hp), Giáp (armorHp), Tốc độ đi (speed),
 * Sức cắn (attack) hoặc thời gian hồi chiêu của Boss ngay bên dưới.
 * Lưu file xong tải lại (F5) trình duyệt là có hiệu lực ngay!
 * ============================================================================
 */

import { GRID_CONFIG } from './Grid.js';

// Quy đổi chung cho trạng thái hiệu ứng lên Hải Tặc
export const PIRATE_COMBAT_CONFIG = {
  pxPerColEquivalent: 84,   // Số pixel quy đổi cho 1 ô ngang (dùng chuyển đổi speed sang tốc độ đi theo ô)
  slowSpeedMultiplier: 0.5, // Hệ số tốc độ khi dính đạn băng Aokiji (0.5 = bị làm chậm đi 50%)
  slowDefaultDuration: 4.5, // Thời gian làm chậm mặc định khi dính đạn băng (giây)
  magmaBurnDps: 28,         // Sát thương thiêu đốt mỗi giây khi dính dung nham của Akainu
  deathKnockbackSpeed: 0.45,// Tốc độ bị hất văng về sau (tính bằng ô/giây) lúc vừa chết
  deathFadeDuration: 0.46   // Thời gian hiệu ứng ngã văng mờ dần khi chết (giây)
};

export const PIRATE_TYPES = {
  // --------------------------------------------------------------------------
  // 1. HẢI TẶC TÂN BINH (Lính cướp biển cơ bản giống Zombie thường)
  // --------------------------------------------------------------------------
  PIRATE_GRUNT: {
    id: 'PIRATE_GRUNT',                   // Mã định danh hải tặc
    name: 'Hải Tặc Tân Binh',             // Tên hiển thị
    hp: 200,                              // Máu cơ bản (200 HP = chịu 10 viên đạn Súng Trường)
    armorHp: 0,                           // Máu giáp phụ bên ngoài (0 = không có giáp)
    speed: 15,                            // Tốc độ đi bộ danh nghĩa (số càng lớn đi càng nhanh)
    attack: 50,                           // Sát thương cắn phá công sự mỗi giây (DPS)
    scale: 1.2,                           // Tỷ lệ kích thước hiển thị (1.0 là cỡ chuẩn)
    icon: '🏴‍☠️'                           // Biểu tượng đại diện
  },

  // --------------------------------------------------------------------------
  // 2. HẢI TẶC THÙNG GỖ (Đội thùng gỗ đỡ đạn giống Conehead Zombie)
  // --------------------------------------------------------------------------
  BARREL_PIRATE: {
    id: 'BARREL_PIRATE',                  // Mã định danh
    name: 'Hải Tặc Thùng Gỗ',             // Tên hiển thị
    hp: 200,                              // Máu thân sau khi vỡ thùng gỗ
    armorHp: 180,                         // Máu của Thùng Gỗ che chắn bên ngoài (phải bắn vỡ mới trừ máu chính)
    speed: 14,                            // Tốc độ di chuyển
    attack: 80,                           // Sát thương mỗi giây lên lính Hải Quân
    scale: 1.2,                           // Kích thước chuẩn
    icon: '🪵'                            // Biểu tượng
  },

  // --------------------------------------------------------------------------
  // 3. HẢI TẶC GIÁP SẮT (Giáp sắt siêu trâu giống Buckethead Zombie)
  // --------------------------------------------------------------------------
  ARMORED_PIRATE: {
    id: 'ARMORED_PIRATE',                 // Mã định danh
    name: 'Hải Tặc Giáp Sắt',             // Tên hiển thị
    hp: 200,                              // Máu thân sau khi nát giáp
    armorHp: 400,                         // Máu Áo Giáp & Mũ Sắt (chịu đòn rất trâu, nên dùng Mihawk xuyên giáp hoặc Bom!)
    speed: 13,                            // Tốc độ di chuyển
    attack: 80,                           // Sát thương mỗi giây
    scale: 1.05,                          // Cao to hơn lính thường một chút
    icon: '⚔️'                            // Biểu tượng
  },

  // --------------------------------------------------------------------------
  // 4. HẢI TẶC BUGGY NHẢY SÀO (Chạy nhanh & nhảy vọt qua lính đầu giống Pole Vaulter)
  // --------------------------------------------------------------------------
  BUGGY_JUMPER: {
    id: 'BUGGY_JUMPER',                   // Mã định danh
    name: 'Hải Tặc Buggy Nhảy Sào',       // Tên hiển thị
    hp: 250,                              // Máu cơ bản
    armorHp: 0,                           // Không có giáp
    speed: 25,                            // Tốc độ chạy đà lúc mới xuất hiện (rất nhanh)
    speedAfterVault: 14,                  // Tốc độ đi bộ chậm lại sau khi đã nhảy sào qua 1 lính
    vaultCols: 1.4,                       // Số ô nhảy vọt qua đầu lính Hải Quân đầu tiên
    vaultDuration: 0.92,                  // Thời gian bay lộn trên không lúc nhảy sào (giây)
    attack: 70,                           // Sát thương mỗi giây
    scale: 1.2,                           // Kích thước chuẩn
    icon: '🤡'                            // Biểu tượng
  },

  // --------------------------------------------------------------------------
  // 5. KIẾM SĨ CUỒNG NỘ (Vỡ khiên sẽ nổi điên chạy cực nhanh giống Newspaper/Football)
  // --------------------------------------------------------------------------
  BERSERKER_SWORDSMAN: {
    id: 'BERSERKER_SWORDSMAN',            // Mã định danh
    name: 'Kiếm Sĩ Cuồng Nộ',             // Tên hiển thị
    hp: 200,                              // Máu cơ bản
    armorHp: 120,                         // Máu khiên gỗ bảo vệ (khi vỡ 160 giáp này sẽ hóa Cuồng Nộ!)
    speed: 20,                            // Tốc độ lúc còn khiên
    berserkSpeed: 38,                     // Tốc độ lao điên cuồng sau khi bị bắn vỡ khiên
    attack: 92,                           // Sát thương chém mỗi giây (mạnh hơn lính thường)
    scale: 1.2,                           // Kích thước chuẩn
    icon: '🗡️'                            // Biểu tượng
  },

  // --------------------------------------------------------------------------
  // 6. NGƯỜI KHỔNG LỒ OARS (Boss máu siêu trâu & dẫm nát lính giống Gargantuar)
  // --------------------------------------------------------------------------
  OARS_GIANT: {
    id: 'OARS_GIANT',                     // Mã định danh
    name: 'Người Khổng Lồ Oars',          // Tên hiển thị
    hp: 2000,                             // Máu khổng lồ (3000 HP)
    armorHp: 0,                           // Không có giáp riêng
    speed: 12,                            // Bước đi chậm chạp nhưng cực kỳ lì đòn
    attack: 200,                         // Sức dẫm mỗi giây (đủ dẫm gục ngay lính thường & vỡ nhanh Khiên Sắt)
    scale: 1.75,                          // Thân hình to lớn gấp 1.45 lần
    isBoss: true,                         // Đánh dấu là Boss (hiện thanh máu tím)
    icon: '👹'                            // Biểu tượng
  },

  // --------------------------------------------------------------------------
  // 7. MA CÔ PHƯỢNG HOÀNG MARCO (Tự hồi máu bằng lửa xanh & bay vọt qua tuyến đầu)
  // --------------------------------------------------------------------------
  MARCO_PHOENIX: {
    id: 'MARCO_PHOENIX',                  // Mã định danh
    name: 'Ma Cô Phượng Hoàng (Marco)',   // Tên hiển thị
    hp: 750,                              // Máu cao
    armorHp: 0,                           // Không giáp
    speed: 21,                            // Tốc độ bay lướt nhanh
    vaultCols: 1.4,                       // Số ô bay vọt qua lính đầu tiên
    vaultDuration: 0.92,                  // Thời gian bay lộn (giây)
    healPerSec: 21,                       // Lượng máu tự hồi MỖI GIÂY bằng lửa xanh (bị tắt khi dính băng Aokiji!)
    attack: 92,                           // Sát thương mổ mỗi giây
    scale: 1.28,                          // Kích thước hơi lớn
    isBoss: true,                         // Đánh dấu Boss
    icon: '🔥'                            // Biểu tượng
  },

  // --------------------------------------------------------------------------
  // 8. TỨ HOÀNG RÂU ĐEN (Chủ lực hậu tuyến - dùng Ám Huyệt Kurouzu làm choáng lính)
  // --------------------------------------------------------------------------
  BLACKBEARD: {
    id: 'BLACKBEARD',                     // Mã định danh
    name: 'Tứ Hoàng Râu Đen (Teach)',     // Tên hiển thị
    hp: 2800,                             // Máu Boss rất cao
    armorHp: 0,                           // Không giáp riêng
    speed: 14,                            // Tốc độ tiến quân trung bình chậm
    attack: 135,                          // Sát thương cận chiến mỗi giây
    bossSkillInitialDelay: 8.0,           // Thời gian chờ tung Ám Huyệt lần ĐẦU TIÊN sau khi xuất hiện (giây)
    bossSkillCooldown: 10,               // Thời gian hồi chiêu giữa 2 lần Ám Huyệt Kurouzu (giây)
    bossStunDuration: 1.8,                // Thời gian làm choáng khóa cứng 1 lính Hải Quân (giây)
    bossSkillRangeCols: 4.2,              // Tầm xa tung chiêu (tối đa bao nhiêu ô phía trước mặt)
    scale: 1.5,                          // Thân hình to lớn
    isBoss: true,                         // Đánh dấu Tứ Hoàng Boss
    icon: '🌑'                            // Biểu tượng
  },

  // --------------------------------------------------------------------------
  // 9. TỨ HOÀNG RÂU TRẮNG (Trùm cuối - dùng Chấn Động Gura Gura đập toàn hàng)
  // --------------------------------------------------------------------------
  WHITEBEARD: {
    id: 'WHITEBEARD',                     // Mã định danh
    name: 'Tứ Hoàng Râu Trắng (Newgate)', // Tên hiển thị
    hp: 6500,                             // Máu Trùm Cuối cực khủng (6500 HP)
    armorHp: 0,                           // Không giáp riêng
    speed: 11,                            // Bước đi uy nghi chậm rãi
    attack: 460,                          // Sức đánh đại đao Murakumogiri cực mạnh
    bossSkillInitialDelay: 7.5,           // Thời gian chờ ra Chấn Động lần ĐẦU TIÊN (giây)
    bossSkillCooldown: 11.0,              // Thời gian hồi chiêu Chấn Động Gura Gura (giây)
    bossSkillDamage: 92,                 // Sát thương chấn động gây lên TOÀN BỘ lính Hải Quân cùng hàng
    scale: 1.6,                          // Khổng lồ uy nghiêm
    isBoss: true,                         // Đánh dấu Tứ Hoàng Trùm Cuối
    icon: '🔱'                            // Biểu tượng
  }
};

export class Pirate {
  constructor(typeKey, row, startCol = 9.35, grid = null) {
    const def = PIRATE_TYPES[typeKey] || PIRATE_TYPES.PIRATE_GRUNT;
    this.type = def.id;
    this.def = def;
    this.row = row;

    // Cho phép truyền vào startCol (cột 0..11) để đi chuẩn xác theo từng hàng phối cảnh
    this.colPos = startCol;
    this.syncWorldCoords(grid);

    this.hp = def.hp;
    this.maxHp = def.hp;
    this.armorHp = def.armorHp;
    this.maxArmorHp = def.armorHp;
    this.baseSpeed = def.speed;
    this.speed = def.speed;
    this.attack = def.attack;
    this.scale = def.scale;

    this.state = 'WALKING'; // 'WALKING', 'ATTACKING', 'VAULTING', 'IDLE_PREVIEW'
    this.targetUnit = null;

    this.slowTimer = 0;
    this.freezeTimer = 0;
    this.burnTimer = 0;
    this.regenSparkTimer = 0;

    this.hasVaulted = false;
    this.vaultTimer = 0;
    this.isBerserk = false;

    this.bossSkillTimer = def.bossSkillInitialDelay || 0;
    this.bossCastAnim = 0;

    this.walkCycle = Math.random() * Math.PI * 2;
    this.attackAnimTimer = 0;
    this.hitFlashTimer = 0;
    this.isDying = false;
    this.deathTimer = 0;
    this.isDead = false;
    
    this.frameWidth = 256;   // Rộng 1 khung hình
    this.frameHeight = 256;  // Cao 1 khung hình
    this.columns = 8;        // Số cột trong tấm ảnh 2048x2048
    this.currentFrame = 0;   // Khung hình hiện tại
    this.frameCount = 0;
    this.animationSpeed = 8; // Tốc độ lật ảnh
    
  }

  syncWorldCoords(grid = null) {
    if (grid) {
      const pt = grid.gridToPixel(this.colPos, this.row + 0.85);
      this.x = pt.x;
      this.y = pt.y;
      this.rowScale = pt.scale;
    } else {
      this.x = GRID_CONFIG.offsetX + this.colPos * GRID_CONFIG.cellWidth;
      this.y = GRID_CONFIG.offsetY + this.row * GRID_CONFIG.cellHeight + GRID_CONFIG.cellHeight * 0.85;
      this.rowScale = 1.0;
    }
  }

  updateIdle(dt, grid = null) {
    this.walkCycle += dt * 3.8;
    if (grid) this.syncWorldCoords(grid);
  }

  update(dt, grid, onAction) {
    if (this.isDead) return;
    
    if (this.freezeTimer > 0) {
        // 1. Nếu đang bị Kỷ Băng Hà đóng băng cứng -> Không cộng frameCount (Đứng im hoàn toàn)
    } else {
        // 2. Nếu dính đạn thường của Aokiji -> Lấy hệ số làm chậm (thường là 0.5)
        const animRate = (this.slowTimer > 0) ? PIRATE_COMBAT_CONFIG.slowSpeedMultiplier : 1.0;
        
        // Thay vì luôn cộng 1, ta cộng theo animRate. 
        // Khi bị chậm, đếm frameCount sẽ lên rất chậm -> Ảnh lật chậm lại tương ứng!
        this.frameCount += 1 * animRate;
        
        if (this.frameCount >= this.animationSpeed) {
            this.currentFrame++;
            if (this.currentFrame >= 64) { 
                this.currentFrame = 0;
            }
            this.frameCount = 0; // reset
        }
    }
    

    this.syncWorldCoords(grid);

    // Hiệu ứng ngã văng lùi về sau khi vừa bị hạ gục
    if (this.isDying) {
      this.deathTimer -= dt;
      this.colPos += PIRATE_COMBAT_CONFIG.deathKnockbackSpeed * dt;
      this.syncWorldCoords(grid);
      if (this.deathTimer <= 0) {
        this.isDead = true;
      }
      return;
    }

    if (this.hitFlashTimer > 0) this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    if (this.bossCastAnim > 0) this.bossCastAnim = Math.max(0, this.bossCastAnim - dt);

    // Thiêu đốt liên tục từ Akainu
    if (this.burnTimer > 0) {
      this.burnTimer = Math.max(0, this.burnTimer - dt);
      this.takeDamage(PIRATE_COMBAT_CONFIG.magmaBurnDps * dt, { ignoreArmor: true, silentFlash: true });
      if (this.isDying || this.isDead) return;
    }

    // Bị đóng băng cứng bởi Kỷ Băng Hà của Aokiji
    if (this.freezeTimer > 0) {
      this.freezeTimer = Math.max(0, this.freezeTimer - dt);
      return;
    }

    // Ma Cô Phượng Hoàng tự hồi máu (tắt lửa khi đang bị dính băng Aokiji)
    const healRate = this.def.healPerSec || 0;
    if (healRate > 0 && this.slowTimer <= 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + healRate * dt);
      this.regenSparkTimer -= dt;
      if (this.regenSparkTimer <= 0) {
        this.regenSparkTimer = 0.7;
        if (onAction) onAction('MARCO_HEAL', { pirate: this });
      }
    }

    // Trạng thái bị làm chậm bởi đạn băng
    if (this.slowTimer > 0) {
      this.slowTimer = Math.max(0, this.slowTimer - dt);
      this.speed = this.baseSpeed * PIRATE_COMBAT_CONFIG.slowSpeedMultiplier;
    } else {
      this.speed = this.baseSpeed;
    }

    const animRate = (this.slowTimer > 0) ? PIRATE_COMBAT_CONFIG.slowSpeedMultiplier : 1.0;
    this.walkCycle += dt * 6.2 * (Math.max(12, this.speed) / 18) * animRate;

    // Kỹ năng riêng của Tứ Hoàng Râu Đen & Râu Trắng
    if (this.type === 'BLACKBEARD' || this.type === 'WHITEBEARD') {
      this.bossSkillTimer -= dt * animRate;
      if (this.bossSkillTimer <= 0) {
        this.tryTriggerBossSkill(grid, onAction);
      }
    }

    // Nhảy sào (Buggy) / Bay lướt cánh phượng hoàng (Marco)
    if (this.state === 'VAULTING') {
      const vDur = this.def.vaultDuration || 0.62;
      const vCols = this.def.vaultCols || 1.4;
      this.vaultTimer -= dt;
      this.colPos -= (vCols / vDur) * dt;
      this.syncWorldCoords(grid);
      if (this.vaultTimer <= 0) {
        this.state = 'WALKING';
        if (this.def.speedAfterVault) {
          this.baseSpeed = this.def.speedAfterVault;
          this.speed = this.def.speedAfterVault;
        }
      }
      return;
    }

    // Đang tấn công lính Hải Quân phía trước (tự nhả ngay lập tức nếu lính chết hoặc bị Xẻng xúc đi)
    if (this.state === 'ATTACKING' && this.targetUnit) {
      const stillInGrid = !grid || grid.getUnit(this.targetUnit.col, this.targetUnit.row) === this.targetUnit;
      if (this.targetUnit.isDead || !stillInGrid) {
        this.targetUnit = null;
        this.state = 'WALKING';
        this.attackAnimTimer = 0;
      } else {
        const prevStep = Math.floor(this.attackAnimTimer);
        this.attackAnimTimer += dt * 5.2 * animRate;
        this.targetUnit.takeDamage(this.attack * dt * animRate);
        // Haki Vũ Trang (Trái Kira Kira): Khiên Sắt phản gai lên hải tặc đang cắn
        if (this.targetUnit.thornDamage > 0) {
          this.takeDamage(this.targetUnit.thornDamage * dt, { ignoreArmor: true, silentFlash: true });
          if (this.isDying || this.isDead) return;
        }
        if (onAction && Math.floor(this.attackAnimTimer) !== prevStep) {
          onAction('PIRATE_ATTACK', { pirate: this, unit: this.targetUnit });
        }
        return;
      }
    }

    // Tiến bước về phía bờ cảng bên trái theo tọa độ cột phối cảnh (colPos)
    if (this.state === 'WALKING') {
      const colSpeed = this.speed / PIRATE_COMBAT_CONFIG.pxPerColEquivalent;
      this.colPos -= colSpeed * dt;
      this.syncWorldCoords(grid);

      const checkCol = Math.floor(this.colPos - 0.16);
      if (checkCol >= 0 && checkCol < grid.cols) {
        const unitInCell = grid.getUnit(checkCol, this.row);
        if (unitInCell && !unitInCell.isDead) {
          // Nhảy/bay qua lính đầu tiên
          if ((this.type === 'BUGGY_JUMPER' || this.type === 'MARCO_PHOENIX') && !this.hasVaulted) {
            this.hasVaulted = true;
            this.state = 'VAULTING';
            this.vaultTimer = this.def.vaultDuration || 0.62;
            if (onAction) onAction('BUGGY_VAULT', { pirate: this });
            return;
          }

          // Bắt đầu cắn/chém lính phòng thủ
          this.targetUnit = unitInCell;
          this.state = 'ATTACKING';
        }
      }
    }
  }

  tryTriggerBossSkill(grid, onAction) {
    const laneUnits = [];
    for (let c = 0; c < grid.cols; c++) {
      const u = grid.getUnit(c, this.row);
      if (u && !u.isDead && c < this.colPos + 0.25) {
        const cellPt = grid.cellToPixel(c, this.row);
        laneUnits.push({ unit: u, col: c, ux: cellPt.centerX, uy: cellPt.feetY });
      }
    }

    if (laneUnits.length === 0) {
      this.bossSkillTimer = 1.8;
      return;
    }

    if (this.type === 'BLACKBEARD') {
      const rangeCols = this.def.bossSkillRangeCols || 5.2;
      const valid = laneUnits.filter(item => item.unit.stunTimer <= 0 && (this.colPos - item.col) <= rangeCols);
      if (valid.length > 0) {
        const targetItem = valid[valid.length - 1];
        targetItem.unit.stunTimer = this.def.bossStunDuration || 2.8;
        this.bossSkillTimer = this.def.bossSkillCooldown || 9.5;
        this.bossCastAnim = 0.7;
        if (onAction) {
          onAction('BLACKBEARD_KUROUZU', {
            pirate: this,
            unit: targetItem.unit,
            x: targetItem.ux,
            y: targetItem.uy
          });
        }
      } else {
        this.bossSkillTimer = 1.5;
      }
    } else if (this.type === 'WHITEBEARD') {
      this.bossSkillTimer = this.def.bossSkillCooldown || 11.0;
      this.bossCastAnim = 0.8;
      const quakeDmg = this.def.bossSkillDamage || 160;
      for (const item of laneUnits) {
        item.unit.takeDamage(quakeDmg);
      }
      if (onAction) onAction('WHITEBEARD_QUAKE', { pirate: this, row: this.row, colPos: this.colPos });
    }
  }

  takeDamage(amount, isIceOrOpts = false) {
    if (this.isDead || this.isDying) return;

    const opts = (typeof isIceOrOpts === 'boolean') ? { isIce: isIceOrOpts } : (isIceOrOpts || {});
    if (!opts.silentFlash) {
      this.hitFlashTimer = 0.12;
    }
    if (opts.isIce) {
      this.slowTimer = Math.max(this.slowTimer, opts.slowDuration || PIRATE_COMBAT_CONFIG.slowDefaultDuration);
    }
    if (opts.freezeTime) {
      this.freezeTimer = Math.max(this.freezeTimer, opts.freezeTime);
    }
    if (opts.burnTime) {
      this.burnTimer = Math.max(this.burnTimer, opts.burnTime);
    }

    if (this.armorHp > 0 && !opts.ignoreArmor) {
      this.armorHp -= amount;
      if (this.armorHp <= 0) {
        const remaining = Math.abs(this.armorHp);
        this.armorHp = 0;
        this.hp -= remaining;

        if (this.type === 'BERSERKER_SWORDSMAN' && !this.isBerserk) {
          this.isBerserk = true;
          this.baseSpeed = this.def.berserkSpeed || 46;
        }
      }
    } else {
      this.hp -= amount;
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDying = true;
      this.deathTimer = PIRATE_COMBAT_CONFIG.deathFadeDuration;
      this.state = 'WALKING';
    }
  }

  render(ctx, grid = null, assets = null) {
    if (this.isDead) return;

    const pt = grid
      ? grid.gridToPixel(this.colPos, this.row + 0.85)
      : { x: this.x, y: this.y, scale: this.rowScale || 1.0 };
    const x = pt.x;
    const feetY = pt.y;
    const rowScale = pt.scale || 1.0;
    const sc = this.scale * rowScale;
    const centerPt = grid
      ? grid.gridToPixel(this.colPos, this.row + 0.45)
      : { x, y: feetY - 36 };
    const rowCenterY = centerPt.y;

    ctx.save();

    // Hiệu ứng ngã văng & mờ dần khi chết
    let deathRot = 0;
    let deathDropY = 0;
    if (this.isDying) {
      const dur = PIRATE_COMBAT_CONFIG.deathFadeDuration;
      const dProg = 1.0 - Math.max(0, this.deathTimer / dur);
      ctx.globalAlpha = Math.max(0, 1.0 - dProg * 0.95);
      deathRot = dProg * 1.15;
      deathDropY = dProg * 16;
    }

    const glide = (this.type === 'MARCO_PHOENIX')
      ? (6 + Math.sin(this.walkCycle) * 5)
      : (Math.pow(Math.sin(this.walkCycle), 2) * 4.5);
    const tilt = this.state === 'ATTACKING'
      ? -Math.sin(this.attackAnimTimer * 2.2) * 0.13
      : Math.sin(this.walkCycle) * 0.055;
    const legSwing = Math.sin(this.walkCycle) * 9.5;
    const armSwing = this.state === 'ATTACKING'
      ? Math.sin(this.attackAnimTimer * 2.5) * 0.92
      : Math.cos(this.walkCycle) * 0.24;

    // Nhảy vòng cung khi vượt lính
    let jumpOffsetY = 0;
    let vaultRot = 0;
    if (this.state === 'VAULTING') {
      const vDur = this.def.vaultDuration || 0.62;
      const vProg = 1.0 - (this.vaultTimer / vDur);
      jumpOffsetY = -Math.sin(vProg * Math.PI) * 68 * rowScale;
      vaultRot = (this.type === 'MARCO_PHOENIX') ? -Math.sin(vProg * Math.PI) * 0.3 : -vProg * Math.PI * 2;
    }

    // Hào quang trạng thái Băng / Cháy
    if (this.freezeTimer > 0) {
      ctx.fillStyle = 'rgba(0, 210, 255, 0.38)';
      ctx.beginPath();
      ctx.arc(x, rowCenterY + jumpOffsetY, 36 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(0, 210, 255, 0.26)';
      ctx.beginPath();
      ctx.arc(x, rowCenterY + jumpOffsetY, 32 * sc, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.burnTimer > 0 && !this.isDying) {
      ctx.fillStyle = 'rgba(255, 90, 30, 0.34)';
      ctx.beginPath();
      ctx.arc(x, rowCenterY + jumpOffsetY, 28 * sc, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vẽ thân nhân vật 3D khớp đúng tỷ lệ phối cảnh hàng
    ctx.save();
    ctx.translate(x, feetY - glide * rowScale + jumpOffsetY + deathDropY * rowScale);
    const squashY = (this.type === 'MARCO_PHOENIX') ? 1.0 : (1.0 - Math.sin(this.walkCycle * 2) * 0.032);
    const squashX = 1.0 + Math.sin(this.walkCycle * 2) * 0.025;
    ctx.scale(sc * squashX, sc * squashY);
    ctx.rotate(this.isDying ? deathRot : (this.state === 'VAULTING' ? vaultRot : tilt));
    // Lắc thân mềm mại theo nhịp bước chân (giả lập chân tay đung đưa trên sprite 3D)
    if (this.state === 'WALKING' && !this.isDying) {
      ctx.transform(1, 0, Math.sin(this.walkCycle) * 0.05, 1, 0, 0);
    } else if (this.state === 'ATTACKING' && !this.isDying) {
      ctx.transform(1, 0, -Math.max(0, Math.sin(this.attackAnimTimer * 2.5)) * 0.14, 1, 0, 0);
    }

    if (this.hitFlashTimer > 0) {
      ctx.filter = 'brightness(2.1) saturate(0.25)';
    } else if (this.slowTimer > 0 || this.freezeTimer > 0) {
      ctx.filter = 'hue-rotate(15deg) saturate(1.2) brightness(1.08)';
    }

    this.drawModel(ctx, legSwing, armSwing, assets);
    ctx.restore();

    // Khối băng tinh thể 3D bao bọc khi dính Kỷ Băng Hà của Aokiji
    if (this.freezeTimer > 0 && !this.isDying) {
      ctx.save();

      // Tự động mở rộng tảng băng nếu mục tiêu là Boss hoặc Người Khổng Lồ Oars
      const isBossSize = ['OARS_GIANT', 'WHITEBEARD', 'BLACKBEARD'].includes(this.type);
      const bScale = (isBossSize ? 1.32 : 1.0) * sc;
      const baseW = 31 * bScale;
      const topH = 88 * bScale;

      // 1. Vòng sương hàn khí & Đế băng lan tỏa dưới chân
      const frostGrad = ctx.createRadialGradient(x, feetY + 2 * bScale, 4 * bScale, x, feetY + 2 * bScale, baseW * 1.45);
      frostGrad.addColorStop(0, 'rgba(180, 248, 255, 0.85)');
      frostGrad.addColorStop(0.55, 'rgba(0, 210, 255, 0.45)');
      frostGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');
      ctx.fillStyle = frostGrad;
      ctx.beginPath();
      ctx.ellipse(x, feetY + 2 * bScale, baseW * 1.45, 11 * bScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Hai gai băng nhọn đâm chéo ra từ gốc chân
      ctx.fillStyle = 'rgba(0, 195, 255, 0.68)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4 * sc;

      // Gai trái
      ctx.beginPath();
      ctx.moveTo(x - baseW * 0.65, feetY + 2 * bScale);
      ctx.lineTo(x - baseW * 1.35, feetY - 26 * bScale);
      ctx.lineTo(x - baseW * 0.35, feetY - 15 * bScale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gai phải
      ctx.beginPath();
      ctx.moveTo(x + baseW * 0.65, feetY + 2 * bScale);
      ctx.lineTo(x + baseW * 1.38, feetY - 22 * bScale);
      ctx.lineTo(x + baseW * 0.35, feetY - 14 * bScale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. Tảng tinh thể băng chính (Chia 2 mặt sáng - tối tạo khối 3D trong suốt)
      const tipX = x - 2 * bScale;
      const tipY = feetY - topH;
      const leftShoulderX = x - baseW * 1.05;
      const leftShoulderY = feetY - topH * 0.68;
      const rightShoulderX = x + baseW * 1.08;
      const rightShoulderY = feetY - topH * 0.62;
      const leftFootX = x - baseW * 0.85;
      const rightFootX = x + baseW * 0.85;
      const bottomMidY = feetY + 5 * bScale;

      // Mặt vát bên trái (Đón sáng - Trắng lam trong trẻo)
      const leftFacet = ctx.createLinearGradient(tipX, tipY, leftFootX, bottomMidY);
      leftFacet.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
      leftFacet.addColorStop(0.45, 'rgba(130, 240, 255, 0.42)');
      leftFacet.addColorStop(1, 'rgba(0, 180, 235, 0.55)');
      ctx.fillStyle = leftFacet;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftFootX, feetY);
      ctx.lineTo(x, bottomMidY);
      ctx.closePath();
      ctx.fill();

      // Mặt vát bên phải (Khuất sáng - Xanh băng sâu thẳm)
      const rightFacet = ctx.createLinearGradient(tipX, tipY, rightFootX, bottomMidY);
      rightFacet.addColorStop(0, 'rgba(210, 250, 255, 0.58)');
      rightFacet.addColorStop(0.5, 'rgba(0, 155, 225, 0.45)');
      rightFacet.addColorStop(1, 'rgba(2, 62, 138, 0.62)');
      ctx.fillStyle = rightFacet;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(x, bottomMidY);
      ctx.lineTo(rightFootX, feetY);
      ctx.lineTo(rightShoulderX, rightShoulderY);
      ctx.closePath();
      ctx.fill();

      // 4. Vệt lóa phản quang chéo qua mặt băng (Glossy Ice Glint)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.beginPath();
      ctx.moveTo(x - baseW * 0.72, feetY - topH * 0.58);
      ctx.lineTo(x - baseW * 0.15, feetY - topH * 0.82);
      ctx.lineTo(x - baseW * 0.02, feetY - topH * 0.68);
      ctx.lineTo(x - baseW * 0.58, feetY - topH * 0.42);
      ctx.closePath();
      ctx.fill();

      // 5. Đường gân khúc xạ 3D & Vết rạn băng bên trong
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.6 * sc;
      ctx.beginPath();
      // Sống băng chính giữa
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(x, bottomMidY);
      // Các đường vát cạnh ngang
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(x, feetY - topH * 0.48);
      ctx.lineTo(rightShoulderX, rightShoulderY);
      ctx.stroke();

      // Viền ngoài tinh thể sắc nét phát sáng
      ctx.strokeStyle = '#e0fbfc';
      ctx.lineWidth = 2.2 * sc;
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftFootX, feetY);
      ctx.lineTo(x, bottomMidY);
      ctx.lineTo(rightFootX, feetY);
      ctx.lineTo(rightShoulderX, rightShoulderY);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 6. Ánh sao lấp lánh trên đỉnh tảng băng
      const spX = tipX;
      const spY = tipY;
      const spLen = 7 * bScale;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8 * sc;
      ctx.beginPath();
      ctx.moveTo(spX - spLen, spY);
      ctx.lineTo(spX + spLen, spY);
      ctx.moveTo(spX, spY - spLen);
      ctx.lineTo(spX, spY + spLen);
      ctx.stroke();

      ctx.restore();
    }

    // Vệt chém kiếm khí khi cận chiến
    if (this.state === 'ATTACKING' && !this.isDying && this.freezeTimer <= 0 && Math.sin(this.attackAnimTimer * 2.5) > 0.65) {
      ctx.save();
      ctx.strokeStyle = this.isBerserk ? '#ff4757' : (this.type === 'MARCO_PHOENIX' ? '#00d2ff' : '#ffffff');
      ctx.lineWidth = 4 * rowScale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(x - 24 * sc, rowCenterY, 22 * sc, Math.PI * 0.7, Math.PI * 1.35);
      ctx.stroke();
      ctx.restore();
    }

    // Nhãn trạng thái & Thanh Máu
    if (!this.isDying) {
      if (this.freezeTimer > 0) {
        ctx.fillStyle = '#00e5ff';
        ctx.font = `bold ${Math.max(10, Math.round(12 * rowScale))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🧊 ĐÓNG BĂNG', x, feetY - 94 * sc);
      } else if (this.slowTimer > 0) {
        ctx.fillStyle = '#00d2ff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('❄️', x + 16 * sc, feetY - 76 * sc);
      }
      if (this.burnTimer > 0) {
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', x - 16 * sc, feetY - 76 * sc);
      }

      this.renderHealthBar(ctx, x, feetY, sc);
    }

    ctx.restore();
  }

  getSpriteKey() {
    switch (this.type) {
      case 'BARREL_PIRATE':
        return this.armorHp > 0 ? 'pirate_BARREL_PIRATE' : 'pirate_BARREL_PIRATE_naked';
      case 'ARMORED_PIRATE':
        return this.armorHp > 0 ? 'pirate_ARMORED_PIRATE' : 'pirate_ARMORED_PIRATE_naked';
      case 'BERSERKER_SWORDSMAN':
        return (!this.isBerserk && this.armorHp > 0) ? 'pirate_BERSERKER_SWORDSMAN' : 'pirate_BERSERKER_SWORDSMAN_rage';
      default:
        return `pirate_${this.type}`;
    }
  }

  drawModel(ctx, legSwing, armSwing, assets = null) {
    const spr = assets ? assets.get(this.getSpriteKey()) : null;
    if (spr) {
      if (this.isBerserk) {
        ctx.fillStyle = 'rgba(255, 71, 87, 0.36)';
        ctx.beginPath();
        ctx.arc(0, -44, 36, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'BLACKBEARD' && this.bossCastAnim > 0) {
        ctx.fillStyle = 'rgba(190, 46, 221, 0.38)';
        ctx.beginPath();
        ctx.arc(-18, -42, 26, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'WHITEBEARD' && this.bossCastAnim > 0) {
        ctx.fillStyle = 'rgba(116, 185, 255, 0.42)';
        ctx.beginPath();
        ctx.arc(-16, -64, 28, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const drawW = 92;
      const drawH = 94;
      
      // --- LOGIC CẮT SPRITE SHEET ---
      const col = this.currentFrame % this.columns;
      const row = Math.floor(this.currentFrame / this.columns);
      const sourceX = col * this.frameWidth;
      const sourceY = row * this.frameHeight;
      // Dùng hàm drawImage 9 tham số để cắt ảnh từ lưới
      ctx.drawImage(
          spr, 
          sourceX, sourceY, this.frameWidth, this.frameHeight, // Tọa độ cắt trên ảnh gốc
          -drawW / 2, -drawH + 6, drawW, drawH                 // Kích thước và vị trí vẽ trên game
      );
      return;
    }

    switch (this.type) {
      case 'PIRATE_GRUNT': this.drawAnimeGrunt(ctx, legSwing, armSwing); break;
      case 'BARREL_PIRATE': this.drawAnimeBarrel(ctx, legSwing, armSwing); break;
      case 'ARMORED_PIRATE': this.drawAnimeArmored(ctx, legSwing, armSwing); break;
      case 'BUGGY_JUMPER': this.drawAnimeBuggy(ctx, legSwing, armSwing); break;
      case 'BERSERKER_SWORDSMAN': this.drawAnimeBerserker(ctx, legSwing, armSwing); break;
      case 'OARS_GIANT': this.drawAnimeOars(ctx, legSwing, armSwing); break;
      case 'MARCO_PHOENIX': this.drawAnimeMarco(ctx, legSwing, armSwing); break;
      case 'BLACKBEARD': this.drawAnimeBlackbeard(ctx, legSwing, armSwing); break;
      case 'WHITEBEARD': this.drawAnimeWhitebeard(ctx, legSwing, armSwing); break;
      default: this.drawAnimeGrunt(ctx, legSwing, armSwing); break;
    }
  }

  inkStroke(ctx, lw = 2.4) {
    ctx.strokeStyle = '#181828';
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  drawLegs(ctx, legSwing, pantColor = '#2c3e50', bootColor = '#1e1e2c') {
    // Sử dụng chu kỳ bước đi (walkCycle) có sẵn của bạn
    const isWalking = this.state === 'WALKING' || this.state === 'VAULTING';
    const cycle = isWalking ? this.walkCycle : 0;

    // Tính toán góc xoay đùi và độ gập gối (vòng lặp đi bộ 2 pha ngược nhau)
    const rightThigh = Math.sin(cycle) * 0.7; 
    // Đầu gối chỉ gập (số dương) khi chân đang rút về phía sau
    const rightKnee = Math.max(0, Math.sin(cycle - Math.PI / 2)) * 1.1; 

    const leftThigh = Math.sin(cycle + Math.PI) * 0.7;
    const leftKnee = Math.max(0, Math.sin(cycle + Math.PI - Math.PI / 2)) * 1.1;

    // Hàm nội bộ để vẽ 1 chân có khớp
    const drawJointedLeg = (offsetX, thighAngle, kneeBend, isFrontLeg) => {
      ctx.save();
      ctx.translate(offsetX, -25); // Đặt tâm xoay tại khớp hông

      // 1. Xoay đùi
      ctx.rotate(isWalking ? thighAngle : (isFrontLeg ? -0.15 : 0.15));

      // Vẽ đùi
      ctx.fillStyle = pantColor;
      ctx.beginPath();
      ctx.roundRect(-4, 0, 8, 14, 4);
      ctx.fill();
      this.inkStroke(ctx, 2.2);

      // 2. Dịch tâm xoay xuống đầu gối
      ctx.translate(0, 12); 
      // Xoay cẳng chân (gập gối)
      ctx.rotate(isWalking ? kneeBend : 0);

      // Vẽ cẳng chân
      ctx.beginPath();
      ctx.roundRect(-3.5, 0, 7, 13, 3);
      ctx.fill();
      this.inkStroke(ctx, 2.2);

      // 3. Vẽ bàn chân (hướng mũi giày sang trái)
      ctx.fillStyle = bootColor;
      ctx.beginPath();
      // Nhấc mũi chân lên một chút khi đang bước tới
      ctx.rotate(isWalking ? -kneeBend * 0.3 : 0); 
      ctx.ellipse(-3, 11, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      this.inkStroke(ctx, 2);

      ctx.restore();
    };

    // Vẽ chân phải (chân ở xa màn hình hơn)
    drawJointedLeg(2, rightThigh, rightKnee, false);
    // Vẽ chân trái (chân ở gần màn hình hơn, đè lên trên)
    drawJointedLeg(-6, leftThigh, leftKnee, true);
  }

  drawCutlass(ctx, armSwing, length = 30, bladeColor = '#dfe6e9') {
    ctx.save();
    ctx.translate(-8, -38);
    ctx.rotate(-0.4 + armSwing);

    ctx.fillStyle = '#e6b88a';
    ctx.beginPath();
    ctx.roundRect(-14, -4, 16, 8, 4);
    ctx.fill();
    this.inkStroke(ctx, 2);

    ctx.fillStyle = bladeColor;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.quadraticCurveTo(-18 - length * 0.5, -8, -14 - length, -18);
    ctx.quadraticCurveTo(-18 - length * 0.4, 2, -14, 4);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(-14, 1, 4, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 1.8);

    ctx.restore();
  }

  drawAnimeFace(ctx, yHead = -57, skin = '#e6b88a', hasEyepatch = false, isAngry = false) {
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, yHead, 13, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 2.4);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.beginPath();
    ctx.arc(1, yHead + 2, 11, 0.3, Math.PI - 0.1);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-5, yHead - 1, 3.8, 3, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isAngry ? '#e74c3c' : '#181828';
    ctx.beginPath();
    ctx.arc(-6, yHead - 1, 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-10, yHead - 5);
    ctx.lineTo(-2, yHead - 3);
    ctx.stroke();

    if (hasEyepatch) {
      ctx.strokeStyle = '#181828';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-11, yHead - 6);
      ctx.lineTo(11, yHead + 1);
      ctx.stroke();
      ctx.fillStyle = '#181828';
      ctx.beginPath();
      ctx.arc(-5, yHead - 1, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, yHead + 5);
    ctx.quadraticCurveTo(-4, yHead + 7, -1, yHead + 4);
    ctx.stroke();
  }

  drawAnimeGrunt(ctx, legSwing, armSwing) {
    this.drawLegs(ctx, legSwing);
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(-14, -46, 28, 25, 6);
    ctx.fill();
    this.inkStroke(ctx, 2.4);

    ctx.fillStyle = '#f5f6fa';
    ctx.fillRect(-12, -41, 24, 4);
    ctx.fillRect(-12, -33, 24, 4);

    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-14, -26, 28, 5);
    this.inkStroke(ctx, 1.8);

    this.drawAnimeFace(ctx, -58, '#e6b88a', true);

    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(0, -61, 13.5, Math.PI * 0.92, Math.PI * 2.08);
    ctx.lineTo(20, -63);
    ctx.lineTo(15, -55);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.2);

    this.drawCutlass(ctx, armSwing);
  }

  drawAnimeBarrel(ctx, legSwing, armSwing) {
    this.drawLegs(ctx, legSwing, '#3d2b1f');

    if (this.armorHp > 0) {
      const grad = ctx.createLinearGradient(-20, -48, 20, -20);
      grad.addColorStop(0, '#c4793c');
      grad.addColorStop(0.5, '#9c5625');
      grad.addColorStop(1, '#633312');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, -34, 21, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      this.inkStroke(ctx, 2.6);

      ctx.strokeStyle = '#576574';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-18, -42);
      ctx.quadraticCurveTo(0, -39, 18, -42);
      ctx.moveTo(-18, -26);
      ctx.quadraticCurveTo(0, -23, 18, -26);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -34, 5, 0, Math.PI * 2);
      ctx.fill();

      if (this.armorHp < (this.maxArmorHp * 0.55)) {
        ctx.strokeStyle = '#1e1008';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -46);
        ctx.lineTo(-4, -36);
        ctx.lineTo(-9, -24);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#d63031';
      ctx.beginPath();
      ctx.roundRect(-12, -46, 24, 24, 5);
      ctx.fill();
      this.inkStroke(ctx, 2.2);
    }

    this.drawAnimeFace(ctx, -59, '#e6b88a', false);

    ctx.fillStyle = '#2d1e14';
    ctx.beginPath();
    ctx.moveTo(-19, -64);
    ctx.quadraticCurveTo(0, -82, 18, -64);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.3);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-17, -64);
    ctx.lineTo(17, -64);
    ctx.stroke();

    this.drawCutlass(ctx, armSwing);
  }

  drawAnimeArmored(ctx, legSwing, armSwing) {
    this.drawLegs(ctx, legSwing, '#576574', '#222f3e');

    if (this.armorHp > 0) {
      const steel = ctx.createLinearGradient(-16, -48, 16, -20);
      steel.addColorStop(0, '#eef2f3');
      steel.addColorStop(0.5, '#95a5a6');
      steel.addColorStop(1, '#576574');

      ctx.fillStyle = steel;
      ctx.beginPath();
      ctx.roundRect(-16, -48, 32, 27, 6);
      ctx.fill();
      this.inkStroke(ctx, 2.5);

      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.arc(0, -44, 10, Math.PI, 0);
      ctx.fill();
      this.inkStroke(ctx, 2);
    } else {
      ctx.fillStyle = '#2f3640';
      ctx.beginPath();
      ctx.roundRect(-12, -46, 24, 24, 5);
      ctx.fill();
      this.inkStroke(ctx, 2.2);
    }

    this.drawAnimeFace(ctx, -58, '#e6b88a', false, true);

    if (this.armorHp > 0) {
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.arc(0, -61, 14, Math.PI * 0.9, Math.PI * 2.1);
      ctx.closePath();
      ctx.fill();
      this.inkStroke(ctx, 2.4);

      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(-3, -74);
      ctx.lineTo(3, -74);
      ctx.lineTo(0, -84);
      ctx.closePath();
      ctx.fill();
      this.inkStroke(ctx, 2);
    }

    this.drawCutlass(ctx, armSwing, 34, '#ecf0f1');
  }

  drawAnimeBuggy(ctx, legSwing, armSwing) {
    this.drawLegs(ctx, legSwing * 1.2, '#e74c3c', '#2c3e50');

    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.roundRect(-14, -46, 28, 25, 6);
    ctx.fill();
    this.inkStroke(ctx, 2.4);

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(-12, -48, 24, 7, 3);
    ctx.fill();
    this.inkStroke(ctx, 1.8);

    ctx.fillStyle = '#0984e3';
    ctx.beginPath();
    ctx.arc(12, -62, 6, 0, Math.PI * 2);
    ctx.arc(-11, -63, 5, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 2);

    this.drawAnimeFace(ctx, -58, '#ffffff', false);

    ctx.fillStyle = '#ff2e2e';
    ctx.beginPath();
    ctx.arc(-10, -56, 4.8, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 1.6);

    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(0, -68, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 2.2);

    if (!this.hasVaulted || this.state === 'VAULTING') {
      ctx.save();
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(12, -24);
      ctx.lineTo(-34, -56);
      ctx.stroke();
      this.inkStroke(ctx, 1.5);
      ctx.restore();
    }
  }

  drawAnimeBerserker(ctx, legSwing, armSwing) {
    const stride = this.isBerserk ? legSwing * 1.5 : legSwing;
    this.drawLegs(ctx, stride, '#1e272e');

    if (this.isBerserk) {
      ctx.fillStyle = 'rgba(255, 71, 87, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -40, 34, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = this.isBerserk ? '#b71540' : '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(-6, -46);
    ctx.lineTo(20, -40);
    ctx.lineTo(24, -14);
    ctx.lineTo(-10, -22);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.2);

    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.roundRect(-13, -46, 26, 24, 5);
    ctx.fill();
    this.inkStroke(ctx, 2.4);

    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.arc(2, -62, 14, 0, Math.PI * 2);
    ctx.fill();

    this.drawAnimeFace(ctx, -58, '#e6b88a', false, true);

    if (this.armorHp > 0) {
      ctx.fillStyle = '#636e72';
      ctx.beginPath();
      ctx.roundRect(-24, -48, 12, 26, 4);
      ctx.fill();
      this.inkStroke(ctx, 2.2);
    }

    this.drawCutlass(ctx, armSwing * (this.isBerserk ? 1.6 : 1.0), 34, this.isBerserk ? '#ff6b6b' : '#dfe6e9');
  }

  drawAnimeOars(ctx, legSwing, armSwing) {
    this.drawLegs(ctx, legSwing * 0.5, '#713f78', '#3c1e42');

    const bodyGrad = ctx.createLinearGradient(-24, -64, 24, -18);
    bodyGrad.addColorStop(0, '#be4b6e');
    bodyGrad.addColorStop(1, '#713f78');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-22, -62, 44, 42, 10);
    ctx.fill();
    this.inkStroke(ctx, 3);

    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -52);
    ctx.lineTo(10, -34);
    ctx.stroke();

    ctx.fillStyle = '#5c2c16';
    ctx.fillRect(-21, -28, 42, 10);
    this.inkStroke(ctx, 2);

    ctx.fillStyle = '#b3476b';
    ctx.beginPath();
    ctx.arc(0, -78, 18, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 2.8);

    ctx.fillStyle = '#f5f6fa';
    ctx.beginPath();
    ctx.moveTo(-12, -88);
    ctx.quadraticCurveTo(-30, -106, -22, -118);
    ctx.quadraticCurveTo(-14, -100, -6, -90);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.4);

    ctx.beginPath();
    ctx.moveTo(12, -88);
    ctx.quadraticCurveTo(30, -106, 22, -118);
    ctx.quadraticCurveTo(14, -100, 6, -90);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.4);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(-7, -80, 3.5, 0, Math.PI * 2);
    ctx.arc(5, -80, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-8, -70);
    ctx.lineTo(-4, -64);
    ctx.lineTo(0, -70);
    ctx.lineTo(4, -64);
    ctx.lineTo(8, -70);
    ctx.fill();

    ctx.save();
    ctx.translate(-14, -46);
    ctx.rotate(-0.4 + armSwing * 0.6);
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.roundRect(-14, -44, 15, 54, 4);
    ctx.fill();
    this.inkStroke(ctx, 2.5);
    ctx.restore();
  }

  drawAnimeMarco(ctx, legSwing, armSwing) {
    const flap = Math.sin(this.walkCycle * 1.4) * 14;

    ctx.fillStyle = 'rgba(0, 210, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(0, -45, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00d2ff';
    ctx.beginPath();
    ctx.moveTo(4, -46);
    ctx.quadraticCurveTo(36, -78 + flap, 42, -52 + flap);
    ctx.quadraticCurveTo(30, -34, 8, -32);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2);

    ctx.fillStyle = '#fff200';
    ctx.beginPath();
    ctx.moveTo(8, -44);
    ctx.quadraticCurveTo(28, -64 + flap, 34, -48 + flap);
    ctx.lineTo(10, -36);
    ctx.closePath();
    ctx.fill();

    this.drawLegs(ctx, legSwing * 0.5, '#0984e3', '#2d3436');

    ctx.fillStyle = '#e6b88a';
    ctx.beginPath();
    ctx.roundRect(-10, -48, 20, 22, 4);
    ctx.fill();
    this.inkStroke(ctx, 2);

    ctx.fillStyle = '#8e44ad';
    ctx.beginPath();
    ctx.roundRect(-14, -49, 10, 24, 4);
    ctx.roundRect(4, -49, 10, 24, 4);
    ctx.fill();
    this.inkStroke(ctx, 2.2);

    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-11, -29, 22, 5);

    this.drawAnimeFace(ctx, -60, '#e6b88a', false, true);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(-11, -67);
    ctx.lineTo(-7, -81);
    ctx.lineTo(-1, -72);
    ctx.lineTo(4, -83);
    ctx.lineTo(9, -71);
    ctx.lineTo(13, -77);
    ctx.lineTo(12, -62);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.1);

    ctx.save();
    ctx.translate(-10, -38);
    ctx.rotate(-0.2 + armSwing * 0.5);
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath();
    ctx.ellipse(-10, 0, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 2);
    ctx.restore();
  }

  drawAnimeBlackbeard(ctx, legSwing, armSwing) {
    ctx.fillStyle = 'rgba(142, 68, 173, 0.32)';
    ctx.beginPath();
    ctx.ellipse(0, -10, 32, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    this.drawLegs(ctx, legSwing * 0.65, '#1e272e', '#111');

    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.roundRect(-22, -58, 44, 38, 9);
    ctx.fill();
    this.inkStroke(ctx, 2.8);

    ctx.fillStyle = '#d99b66';
    ctx.beginPath();
    ctx.roundRect(-10, -56, 18, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-20, -28, 40, 7);
    this.inkStroke(ctx, 2);

    ctx.fillStyle = '#d99b66';
    ctx.beginPath();
    ctx.arc(0, -68, 15, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 2.5);

    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.arc(-1, -61, 14, 0.1, Math.PI - 0.1);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-9, -63, 4, 3);
    ctx.fillRect(-1, -63, 4, 3);

    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.moveTo(-22, -74);
    ctx.quadraticCurveTo(0, -96, 22, -74);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.5);

    ctx.save();
    ctx.translate(-22, -40);
    ctx.rotate(armSwing * 0.4);
    const yamiPulse = this.bossCastAnim > 0 ? 15 : 10;
    ctx.fillStyle = '#2d0b44';
    ctx.beginPath();
    ctx.arc(-6, 0, yamiPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#be2edd';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  drawAnimeWhitebeard(ctx, legSwing, armSwing) {
    this.drawLegs(ctx, legSwing * 0.55, '#1e272e', '#111');

    ctx.fillStyle = '#f5f6fa';
    ctx.beginPath();
    ctx.moveTo(-8, -64);
    ctx.lineTo(28, -56);
    ctx.lineTo(32, -8);
    ctx.lineTo(-10, -14);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.8);

    ctx.fillStyle = '#d99b66';
    ctx.beginPath();
    ctx.roundRect(-20, -64, 38, 42, 8);
    ctx.fill();
    this.inkStroke(ctx, 2.8);

    ctx.strokeStyle = '#a85a4a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, -54);
    ctx.lineTo(4, -40);
    ctx.moveTo(-10, -40);
    ctx.lineTo(4, -54);
    ctx.stroke();

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-19, -28, 36, 7);
    this.inkStroke(ctx, 2);

    ctx.fillStyle = '#d99b66';
    ctx.beginPath();
    ctx.arc(-1, -78, 15.5, 0, Math.PI * 2);
    ctx.fill();
    this.inkStroke(ctx, 2.6);

    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.arc(-1, -82, 15.5, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.2);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -71);
    ctx.quadraticCurveTo(-24, -67, -28, -81);
    ctx.quadraticCurveTo(-22, -73, -4, -75);
    ctx.lineTo(2, -75);
    ctx.quadraticCurveTo(18, -73, 24, -81);
    ctx.quadraticCurveTo(20, -67, 2, -71);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2);

    ctx.save();
    ctx.translate(-16, -44);
    ctx.rotate(-0.35 + armSwing * 0.55);

    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.lineTo(-14, -54);
    ctx.stroke();

    ctx.fillStyle = '#dfe6e9';
    ctx.beginPath();
    ctx.moveTo(-14, -54);
    ctx.quadraticCurveTo(-26, -70, -18, -84);
    ctx.quadraticCurveTo(-10, -68, -11, -54);
    ctx.closePath();
    ctx.fill();
    this.inkStroke(ctx, 2.2);

    const sphereR = this.bossCastAnim > 0 ? 18 : 11;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.strokeStyle = '#74b9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-14, -54, sphereR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  renderHealthBar(ctx, x, feetY, sc = 1.0) {
    const isWounded = this.hp < this.maxHp || (this.maxArmorHp > 0 && this.armorHp < this.maxArmorHp) || this.def.isBoss;
    if (!isWounded) return;

    const barW = 50 * Math.min(1.45, sc);
    const barH = this.def.isBoss ? 6 : 5;
    const barX = x - barW / 2;
    const barY = Math.max(94, feetY - 88 * sc);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';

    if (this.maxArmorHp > 0) {
      const armorPct = Math.max(0, this.armorHp / this.maxArmorHp);
      ctx.fillRect(barX - 1, barY - 7, barW + 2, barH + 2);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(barX, barY - 6, barW * armorPct, barH);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    }

    const hpPct = Math.max(0, this.hp / this.maxHp);
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = this.def.isBoss ? '#9b59b6' : (hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c');
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    ctx.restore();
  }
}
