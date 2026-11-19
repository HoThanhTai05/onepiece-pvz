/**
 * ============================================================================
 * BẢNG THÔNG SỐ LÍNH HẢI QUÂN, THẤT VŨ HẢI & ĐÔ ĐỐC (UNIT_TYPES)
 * ============================================================================
 * Hướng dẫn tự chỉnh sửa:
 * Bạn có thể thay đổi trực tiếp các con số bên dưới (thời gian tính bằng GIÂY)
 * để cân bằng lại giá tiền, máu, sát thương hoặc tốc độ bắn/hồi chiêu.
 * Lưu file xong tải lại (F5) trình duyệt là áp dụng ngay!
 * ============================================================================
 */

import { GRID_CONFIG } from './Grid.js';

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export const UNIT_TYPES = {
  // --------------------------------------------------------------------------
  // 1. SÊN TRUYỀN TIN BELI (Nhiệm vụ: Tạo tiền Beli giống Hoa Hướng Dương PvZ)
  // --------------------------------------------------------------------------
  DEN_DEN_MUSHI: {
    id: 'DEN_DEN_MUSHI',                  // Mã định danh đơn vị (không đổi tên mã này)
    name: 'Sên Truyền Tin Beli',          // Tên đầy đủ hiển thị trong Bách Khoa
    shortName: 'Sên Beli',                // Tên ngắn gọn hiện dưới thẻ bài
    role: 'Tạo Tiền',                     // Vai trò chiến thuật
    icon: '🐌',                           // Biểu tượng dự phòng
    cost: 50,                             // Giá tiền Beli cần để đặt xuống sân
    cooldown: 7.5,                        // Thời gian hồi thẻ bài trước khi đặt con tiếp (giây)
    maxHp: 300,                           // Máu tối đa chịu đòn của Sên
    damage: 0,                            // Sát thương bắn (0 vì là lính kinh tế)
    beliAmount: 25,                       // Số tiền Beli mỗi đồng vàng rơi ra
    produceFirstDelay: 4.2,               // Thời gian đẻ đồng tiền ĐẦU TIÊN sau khi đặt (giây)
    produceInterval: 15.0,                // Thời gian giữa các lần đẻ tiền tiếp theo (giây)
    unlockStage: 1,                       // Màn mở khóa (1 = có sẵn từ đầu)
    description: 'Tạo ra 25 Beli định kỳ nhanh hơn để xây phòng tuyến từ sớm.'
  },

  // --------------------------------------------------------------------------
  // 2. LÍNH SÚNG TRƯỜNG (Nhiệm vụ: Bắn đạn chì cơ bản giống Peashooter)
  // --------------------------------------------------------------------------
  MARINE_RIFLE: {
    id: 'MARINE_RIFLE',                   // Mã định danh đơn vị
    name: 'Lính Súng Trường',             // Tên đầy đủ
    shortName: 'Súng Trường',             // Tên ngắn trên thẻ
    role: 'Tấn Công',                     // Vai trò
    icon: '💂',                           // Biểu tượng
    cost: 100,                            // Giá Beli đặt quân
    cooldown: 6.5,                        // Thời gian hồi thẻ (giây)
    maxHp: 300,                           // Máu tối đa
    damage: 31,                           // Sát thương mỗi viên đạn bắn trúng
    shootInterval: 1.35,                  // Khoảng thời gian giữa 2 phát bắn (giây - nhỏ hơn = bắn nhanh hơn)
    projectileKind: 'lead',               // Loại đạn ('lead' = đạn chì thường)
    unlockStage: 1,                       // Mở khóa từ Màn 1
    description: 'Bắn đạn chì gây sát thương ổn định lên hải tặc cùng hàng.'
  },

  // --------------------------------------------------------------------------
  // 3. LÍNH KHIÊN SẮT (Nhiệm vụ: Tường chắn thép giống Wall-nut)
  // --------------------------------------------------------------------------
  MARINE_SHIELD: {
    id: 'MARINE_SHIELD',                  // Mã định danh đơn vị
    name: 'Lính Khiên Sắt',               // Tên đầy đủ
    shortName: 'Khiên Sắt',               // Tên ngắn
    role: 'Phòng Thủ',                    // Vai trò
    icon: '🛡️',                           // Biểu tượng
    cost: 50,                             // Giá Beli đặt quân
    cooldown: 21.0,                       // Thời gian hồi thẻ (giây)
    maxHp: 3000,                          // Máu giáp cực dày chặn bước tiến Hải Tặc
    damage: 0,                            // Không tấn công
    unlockStage: 2,                       // Nhận sau khi thắng Màn 1 (dùng từ Màn 2)
    description: 'Giáp sắt cực trâu (4000 HP), che chắn cản bước tiến hải tặc.'
  },

  // --------------------------------------------------------------------------
  // 4. MÌN HẢI LÂU THẠCH 25B (Nhiệm vụ: Mìn chôn dưới đất giống Potato Mine PvZ)
  // --------------------------------------------------------------------------
  SEASTONE_MINE: {
    id: 'SEASTONE_MINE',                  // Mã định danh đơn vị (Mìn Hải Lâu Thạch)
    name: 'Mìn Hải Lâu Thạch 25B',        // Tên đầy đủ hiển thị trong Bách Khoa
    shortName: 'Mìn 25B',                 // Tên ngắn gọn hiện dưới thẻ bài
    role: 'Mìn Chôn Đất',                 // Vai trò chiến thuật
    icon: '⚓',                           // Biểu tượng dự phòng
    cost: 25,                             // Giá Beli đặt mìn (rẻ nhất game!)
    cooldown: 18.0,                       // Thời gian hồi thẻ bài trước khi đặt mìn tiếp (giây)
    maxHp: 300,                           // Máu của mìn lúc đang chôn chờ nạp (bị cắn sẽ mất mìn)
    damage: 1500,                         // Sát thương nổ khi hải tặc dẫm trúng (XUYÊN GIÁP)
    armTime: 8.5,                         // Thời gian chôn nạp mìn trước khi trồi lên sẵn sàng nổ (giây)
    blastRadiusCols: 0.9,                 // Bán kính nổ theo số ô quanh mìn (0.9 = nổ ngay ô đó + lân cận sát)
    unlockStage: 3,                       // Nhận sau khi thắng Màn 2 (dùng từ Màn 3)
    description: 'Mìn rẻ 25B: chôn 8.5s để nạp, sau đó trồi lên. Hải tặc dẫm trúng sẽ nổ 1800 DMG xuyên giáp!'
  },

  // --------------------------------------------------------------------------
  // 5. BOM ĐÔI TRÁI ÁC QUỶ / BUSTER CALL (Nhiệm vụ: Bom nổ tức thì 3x3 giống Cherry Bomb PvZ)
  // --------------------------------------------------------------------------
  BUSTER_CANNON: {
    id: 'BUSTER_CANNON',                  // Mã định danh đơn vị (giữ nguyên mã để không mất save cũ)
    name: 'Bom Đôi Buster Call',          // Tên đầy đủ (1 quả bom Hải Quân + 1 quả bom Trái Ác Quỷ)
    shortName: 'Bom Đôi',                 // Tên ngắn gọn hiện dưới thẻ bài
    role: 'Nổ Tức Thì 3x3',               // Vai trò chiến thuật
    icon: '💣',                           // Biểu tượng dự phòng
    cost: 150,                            // Giá Beli đặt bom nổ diện rộng
    cooldown: 30.0,                       // Thời gian hồi thẻ bài trước khi dùng lại (giây)
    maxHp: 300,                           // Máu tạm thời trong lúc đếm ngược phát nổ
    damage: 1800,                         // Sát thương nổ cực đại (xuyên giáp tiêu diệt cả giáp sắt!)
    fuseTime: 0.95,                       // Thời gian phồng to đếm ngược rồi phát nổ (giây)
    blastRadiusCols: 1,                   // Bán kính nổ theo số ô xung quanh (1 = vùng 3x3 ô)
    unlockStage: 4,                       // Nhận sau khi thắng Màn 3 (dùng từ Màn 4)
    description: 'Bom đôi Buster Call + Trái Ác Quỷ: phồng 0.95s rồi nổ tung vùng 3x3 ô (1800 DMG xuyên giáp)!'
  },

  // --------------------------------------------------------------------------
  // 6. ĐỘI TRƯỞNG SÚNG ĐÔI (Nhiệm vụ: Bắn 2 phát liên hoàn giống Repeater)
  // --------------------------------------------------------------------------
  MARINE_CAPTAIN: {
    id: 'MARINE_CAPTAIN',                 // Mã định danh đơn vị
    name: 'Đội Trưởng Súng Đôi',          // Tên đầy đủ
    shortName: 'Đội Trưởng',              // Tên ngắn
    role: 'Xạ Thủ Đôi',                   // Vai trò
    icon: '🎖️',                           // Biểu tượng
    cost: 175,                            // Giá Beli
    cooldown: 7.5,                        // Thời gian hồi thẻ (giây)
    maxHp: 300,                           // Máu tối đa
    damage: 31,                           // Sát thương MỖI VIÊN đạn (bắn 2 viên = 40 DMG/loạt)
    shootInterval: 1.35,                  // Thời gian giữa mỗi loạt bắn đôi (giây)
    burstCount: 2,                        // Số viên đạn bắn ra trong 1 loạt (2 viên)
    burstInterval: 0.15,                  // Độ trễ giữa viên 1 và viên 2 (giây)
    projectileKind: 'lead',               // Loại đạn
    unlockStage: 5,                       // Nhận sau khi thắng Màn 4 (dùng từ Màn 5)
    description: 'Bắn liên hoàn 2 phát đạn súng lục trong mỗi lượt tấn công.'
  },

  // --------------------------------------------------------------------------
  // 7. ĐÔ ĐỐC BĂNG AOKIJI (Đánh thường làm chậm + SKILL Đóng Băng Cả Hàng)
  // --------------------------------------------------------------------------
  AOKIJI_ICE: {
    id: 'AOKIJI_ICE',                     // Mã định danh đơn vị
    name: 'Đô Đốc Băng Aokiji',           // Tên đầy đủ
    shortName: 'Aokiji',                  // Tên ngắn
    role: 'Đô Đốc',                       // Cấp bậc
    icon: '❄️',                           // Biểu tượng
    cost: 250,                            // Giá Beli đặt Aokiji
    cooldown: 7.5,                        // Thời gian hồi thẻ (giây)
    maxHp: 350,                           // Máu tối đa
    damage: 31,                           // Sát thương mũi băng bắn thường
    shootInterval: 1.45,                  // Tốc độ bắn thường (giây/phát)
    projectileKind: 'ice',                // Đạn băng làm chậm 50% tốc độ chạy địch
    slowDuration: 3.5,                    // Thời gian làm chậm địch khi trúng đạn băng thường (giây)
    skillName: 'Kỷ Băng Hà (Ice Age)',    // Tên tuyệt chiêu
    skillCooldown: 16.0,                  // Thời gian hồi tuyệt chiêu (giây)
    skillInitialRatio: 0.45,              // Phần trăm hồi chiêu chờ sẵn lúc vừa đặt xuống (0.45 = chờ 45%)
    skillDamage: 160,                     // Sát thương tuyệt chiêu lên toàn bộ hải tặc trong hàng
    skillFreezeDuration: 2.5,             // Thời gian ĐÓNG BĂNG CỨNG khiến địch đứng im & tắt hồi máu (giây)
    skillColor: '#00d2ff',                // Màu viền aura chiêu
    unlockStage: 7,                       // Nhận sau khi thắng Màn 5 (dùng từ Màn 6)
    description: 'Bắn đao băng làm chậm 50%. SKILL: Đóng băng cứng cả hàng 3.5s & phá hồi máu Marco!'
  },

  // --------------------------------------------------------------------------
  // 8. THẤT VŨ HẢI CROCODILE (Đánh xuyên 3 tên + SKILL Bão Cát đẩy lùi)
  // --------------------------------------------------------------------------
  CROCODILE: {
    id: 'CROCODILE',                      // Mã định danh đơn vị
    name: 'Thất Vũ Hải Crocodile',        // Tên đầy đủ
    shortName: 'Crocodile',               // Tên ngắn
    role: 'Thất Vũ Hải',                  // Cấp bậc
    icon: '🏜️',                           // Biểu tượng
    cost: 225,                            // Giá Beli
    cooldown: 11.0,                       // Thời gian hồi thẻ (giây)
    maxHp: 500,                           // Máu tối đa
    damage: 30,                           // Sát thương lưỡi cát thường (xuyên tối đa 3 hải tặc)
    shootInterval: 1.55,                  // Tốc độ bắn lưỡi cát thường (giây/phát)
    projectileKind: 'sand',               // Lưỡi cát xuyên thấu
    skillName: 'Bão Cát Sables',          // Tên tuyệt chiêu
    skillCooldown: 16.0,                  // Thời gian hồi tuyệt chiêu (giây)
    skillInitialRatio: 0.45,              // Thời gian chờ lần tung chiêu đầu tiên (45% cooldown)
    skillDamage: 180,                     // Sát thương bão cát lên toàn hàng
    skillPushCols: 1.2,                   // Số ô hất văng đẩy lùi Hải Tặc về bên phải
    skillColor: '#fbc531',                // Màu cát vàng
    unlockStage: 6,                       // Nhận sau khi thắng Màn 6 (dùng từ Màn 7)
    description: 'Phóng lưỡi cát xuyên 3 tên (30 DMG). SKILL: Tạo bão cát thổi bay & đẩy lùi cả hàng!'
  },

  // --------------------------------------------------------------------------
  // 9. MẮT DIỀU HÂU MIHAWK (Kiếm khí xuyên giáp + SKILL Sóng Hắc Kiếm Yoru)
  // --------------------------------------------------------------------------
  MIHAWK: {
    id: 'MIHAWK',                         // Mã định danh đơn vị
    name: 'Mắt Diều Hâu Mihawk',          // Tên đầy đủ
    shortName: 'Mihawk',                  // Tên ngắn
    role: 'Thất Vũ Hải',                  // Cấp bậc
    icon: '⚔️',                           // Biểu tượng
    cost: 300,                            // Giá Beli
    cooldown: 14.0,                       // Thời gian hồi thẻ (giây)
    maxHp: 600,                           // Máu tối đa
    damage: 85,                           // Sát thương nhát chém thường (XUYÊN GIÁP hoàn toàn, xuyên 4 tên!)
    shootInterval: 1.65,                  // Tốc độ chém thường (giây/nhát)
    projectileKind: 'slash',              // Sóng kiếm khí xuyên giáp
    skillName: 'Nhất Kiếm Yoru',          // Tên tuyệt chiêu
    skillCooldown: 18.0,                  // Thời gian hồi tuyệt chiêu (giây)
    skillInitialRatio: 0.45,              // Chờ chiêu đầu
    skillDamage: 450,                     // Sát thương cực đại XUYÊN GIÁP quét cả hàng
    skillColor: '#00e676',                // Màu Hắc Kiếm xanh ngọc
    unlockStage: 8,                       // Nhận sau khi thắng Màn 7 (dùng từ Màn 8)
    description: 'Chém kiếm khí xuyên giáp 4 tên (85 DMG). SKILL: Sóng hắc kiếm 450 DMG quét dọc hàng!'
  },

  // --------------------------------------------------------------------------
  // 10. THỦY SƯ ĐÔ ĐỐC AKAINU (Nổ lan thiêu đốt + SKILL Mưa Thiên Thạch toàn map)
  // --------------------------------------------------------------------------
  AKAINU: {
    id: 'AKAINU',                         // Mã định danh đơn vị
    name: 'Thủy Sư Đô Đốc Akainu',        // Tên đầy đủ
    shortName: 'Akainu',                  // Tên ngắn
    role: 'Đô Đốc',                       // Cấp bậc
    icon: '🌋',                           // Biểu tượng
    cost: 350,                            // Giá Beli
    cooldown: 18.0,                       // Thời gian hồi thẻ (giây)
    maxHp: 600,                           // Máu tối đa
    damage: 55,                           // Sát thương đạn dung nham thường (kèm nổ lan 55% & thiêu đốt)
    shootInterval: 1.75,                  // Tốc độ ném dung nham thường (giây/phát)
    projectileKind: 'magma',              // Đạn dung nham nổ lan
    burnDuration: 4.0,                    // Thời gian thiêu đốt đốt máu liên tục sau khi trúng đạn (giây)
    splashDamageRatio: 0.55,              // Tỷ lệ sát thương lan sang hải tặc đứng cạnh (0.55 = 55% sát thương gốc)
    splashRadiusCols: 0.95,               // Phạm vi nổ lan theo số ô
    skillName: 'Lưu Tinh Hỏa Sơn',        // Tên tuyệt chiêu
    skillCooldown: 20.0,                  // Thời gian hồi tuyệt chiêu (giây)
    skillInitialRatio: 0.45,              // Chờ chiêu đầu
    skillMeteorCount: 5,                  // Số thiên thạch dung nham dội xuống toàn bản đồ
    skillMeteorDamage: 260,               // Sát thương mỗi vụ nổ thiên thạch (xuyên giáp + đốt 4.5s)
    skillColor: '#ff4757',                // Màu dung nham đỏ rực
    unlockStage: 9,                       // Nhận sau khi thắng Màn 8 (dùng ở Màn 9 Đại Chiến!)
    description: 'Ném nắm đấm dung nham nổ lan & thiêu đốt. SKILL: Mưa 5 thiên thạch dội xuống toàn bản đồ!'
  }
};

/**
 * ============================================================================
 * BẢNG GIÁ SHOP VÀNG & HIỆU QUẢ NÂNG CẤP (SHOP_ITEMS)
 * ============================================================================
 * Vàng Khối rơi từ hải tặc (tỷ lệ chỉnh ở ECONOMY_CONFIG.goldDropChance trong Stages.js).
 * Bạn có thể tự sửa giá (costs) hoặc cấp tối đa (maxLevel) ngay bên dưới.
 *   costs: mảng giá Vàng Khối cho từng cấp (cấp 1, cấp 2, cấp 3...)
 * ============================================================================
 */
export const SHOP_ITEMS = {
  EXTRA_SLOT: {
    id: 'EXTRA_SLOT',
    group: 'SLOT',
    icon: '🎒',
    name: 'Mở Thêm Ô Bài',                         // Tên món hàng
    desc: 'Mở thêm 1 ô thẻ lính trên khay (7 → 9 ô).', // Mô tả
    maxLevel: 2,                                   // Mua tối đa 2 lần (7 → 8 → 9 ô)
    costs: [6, 12]                                 // Giá Vàng Khối: lần 1 = 6, lần 2 = 12
  },
  ADMIRAL_SKILL_ICE: {
    id: 'ADMIRAL_SKILL_ICE',
    group: 'SKILL',
    icon: '🧊',
    name: 'Cứu Viện Aokiji: Kỷ Băng Hà',
    desc: 'Nút kỹ năng trong trận: đóng băng TOÀN BỘ hải tặc 4s + 200 DMG. Hồi 35s.',
    maxLevel: 1,
    costs: [10],
    cooldown: 35,                                  // Thời gian hồi chiêu (giây)
    freezeTime: 4.0,                               // Thời gian đóng băng cứng (giây)
    damage: 200                                    // Sát thương lên mỗi hải tặc
  },
  ADMIRAL_SKILL_MAGMA: {
    id: 'ADMIRAL_SKILL_MAGMA',
    group: 'SKILL',
    icon: '🌋',
    name: 'Cứu Viện Akainu: Mưa Thiên Thạch',
    desc: 'Nút kỹ năng trong trận: 8 thiên thạch dung nham dội toàn bản đồ (320 DMG + thiêu đốt). Hồi 40s.',
    maxLevel: 1,
    costs: [10],
    cooldown: 40,                                  // Thời gian hồi chiêu (giây)
    meteorCount: 8,                                // Số thiên thạch
    damage: 320                                    // Sát thương mỗi thiên thạch
  },
  DF_MERA_SHOOTER: {
    id: 'DF_MERA_SHOOTER',
    group: 'FRUIT',
    icon: '🔥',
    name: 'Trái Mera Mera (Hỏa Hỏa)',
    desc: 'Lính Súng Trường & Đội Trưởng: +25% sát thương/cấp, đạn lửa thiêu đốt hải tặc.',
    maxLevel: 3,
    costs: [6, 10, 15],
    damagePerLevel: 0.25                           // +25% sát thương mỗi cấp
  },
  DF_KIRA_DEFENSE: {
    id: 'DF_KIRA_DEFENSE',
    group: 'FRUIT',
    icon: '💎',
    name: 'Trái Kira Kira + Haki Vũ Trang',
    desc: 'Khiên Sắt: +35% máu/cấp & phản sát thương gai. Mìn/Bom Đôi: +25% sát thương nổ & hồi nhanh hơn.',
    maxLevel: 3,
    costs: [6, 10, 15],
    hpPerLevel: 0.35,                              // +35% máu Khiên Sắt mỗi cấp
    thornPerLevel: 25,                             // Sát thương gai phản lại hải tặc cắn (mỗi giây)
    blastPerLevel: 0.25,                           // +25% sát thương nổ Mìn/Bom Đôi mỗi cấp
    cooldownCutPerLevel: 0.12                      // Giảm 12% thời gian hồi thẻ Mìn/Bom Đôi mỗi cấp
  },
  DF_GOLD_ADMIRAL: {
    id: 'DF_GOLD_ADMIRAL',
    group: 'FRUIT',
    icon: '👑',
    name: 'Trái Hoàng Kim + Haki Bá Vương',
    desc: 'Sên Beli: +5 Beli/cấp & đẻ tiền nhanh hơn. Đô Đốc/Thất Vũ Hải: tuyệt chiêu +20% sát thương, hồi nhanh -15%.',
    maxLevel: 3,
    costs: [6, 10, 15],
    beliPerLevel: 5,                               // +5 Beli mỗi đồng tiền Sên Beli
    produceCutPerLevel: 0.12,                      // Giảm 12% thời gian giữa 2 lần đẻ tiền mỗi cấp
    skillDamagePerLevel: 0.20,                     // +20% sát thương tuyệt chiêu mỗi cấp
    skillCooldownCutPerLevel: 0.15                 // Giảm 15% thời gian hồi tuyệt chiêu mỗi cấp
  }
};

export class Unit {
  constructor(col, row, typeDef, upgrades = {}) {
    this.col = col;
    this.row = row;
    this.type = typeDef.id;
    this.typeDef = typeDef;
    this.upgrades = upgrades || {};

    const lvMera = this.upgrades.DF_MERA_SHOOTER || 0;
    const lvKira = this.upgrades.DF_KIRA_DEFENSE || 0;
    const lvGold = this.upgrades.DF_GOLD_ADMIRAL || 0;

    // Chỉ số cơ bản sau khi áp dụng Trái Ác Quỷ cường hóa mua ở Shop Vàng
    let maxHp = typeDef.maxHp;
    this.damageMul = 1.0;
    this.fireBullets = false;
    this.thornDamage = 0;
    this.skillDamageMul = 1.0;
    this.produceMul = 1.0;
    this.beliBonus = 0;
    this.armTimeMul = 1.0;

    if ((this.type === 'MARINE_RIFLE' || this.type === 'MARINE_CAPTAIN') && lvMera > 0) {
      this.damageMul += SHOP_ITEMS.DF_MERA_SHOOTER.damagePerLevel * lvMera;
      this.fireBullets = true;
    }
    if (this.type === 'MARINE_SHIELD' && lvKira > 0) {
      maxHp = Math.round(maxHp * (1 + SHOP_ITEMS.DF_KIRA_DEFENSE.hpPerLevel * lvKira));
      this.thornDamage = SHOP_ITEMS.DF_KIRA_DEFENSE.thornPerLevel * lvKira;
    }
    if ((this.type === 'SEASTONE_MINE' || this.type === 'BUSTER_CANNON') && lvKira > 0) {
      this.damageMul += SHOP_ITEMS.DF_KIRA_DEFENSE.blastPerLevel * lvKira;
      this.armTimeMul = Math.max(0.4, 1 - SHOP_ITEMS.DF_KIRA_DEFENSE.cooldownCutPerLevel * lvKira);
    }
    if (this.type === 'DEN_DEN_MUSHI' && lvGold > 0) {
      this.beliBonus = SHOP_ITEMS.DF_GOLD_ADMIRAL.beliPerLevel * lvGold;
      this.produceMul = Math.max(0.5, 1 - SHOP_ITEMS.DF_GOLD_ADMIRAL.produceCutPerLevel * lvGold);
    }
    const isHero = ['AOKIJI_ICE', 'CROCODILE', 'MIHAWK', 'AKAINU'].includes(this.type);
    if (isHero && lvGold > 0) {
      this.skillDamageMul = 1 + SHOP_ITEMS.DF_GOLD_ADMIRAL.skillDamagePerLevel * lvGold;
    }

    this.hp = maxHp;
    this.maxHp = maxHp;

    this.animTime = Math.random() * Math.PI * 2;
    this.shootTimer = 0.55 + Math.random() * 0.35;
    this.produceTimer = (typeDef.produceFirstDelay ?? 4.2) * this.produceMul;
    this.armTimer = (typeDef.armTime ?? 11.0) * this.armTimeMul;
    this.armTotalTime = this.armTimer;
    this.isArmed = false;
    this.fuseTimer = typeDef.fuseTime ?? 0.92;
    this.fuseTotalTime = typeDef.fuseTime ?? 0.92;
    this.isDetonated = false;
    this.isDead = false;
    this.popAnim = 0;

    // Hàng đợi bắn liên hoàn (Đội trưởng Súng Đôi)
    this.burstQueue = 0;
    this.burstDelay = 0;

    // Hệ thống Tuyệt Chiêu (Đô Đốc & Thất Vũ Hải)
    const gLv = this.upgrades.DF_GOLD_ADMIRAL || 0;
    const isHeroUnit = ['AOKIJI_ICE', 'CROCODILE', 'MIHAWK', 'AKAINU'].includes(this.type);
    const cdMul = (isHeroUnit && gLv > 0)
      ? Math.max(0.4, 1 - SHOP_ITEMS.DF_GOLD_ADMIRAL.skillCooldownCutPerLevel * gLv)
      : 1.0;
    this.skillMaxCooldown = (typeDef.skillCooldown || 0) * cdMul;
    const initRatio = typeDef.skillInitialRatio ?? 0.45;
    this.skillCooldown = this.skillMaxCooldown > 0 ? this.skillMaxCooldown * initRatio : 0;
    this.skillReady = false;
    this.skillCastAnim = 0;

    // Trạng thái hoạt ảnh mượt mà
    this.spawnAnim = 0;
    this.recoilTimer = 0;
    this.produceGlowTimer = 0;
    this.hitShakeTimer = 0;
    this.muzzleFlashTimer = 0;
    this.stunTimer = 0; // Bị Râu Đen khống chế bằng Ám Huyệt Kurouzu
  }

  update(dt, piratesInLane, onAction, allPirates = null, autoSkill = true) {
    this.animTime += dt * 3.4;

    if (this.spawnAnim < 1.0) {
      this.spawnAnim = Math.min(1.0, this.spawnAnim + dt * 2.7);
    }
    if (this.recoilTimer > 0) this.recoilTimer = Math.max(0, this.recoilTimer - dt);
    if (this.produceGlowTimer > 0) this.produceGlowTimer = Math.max(0, this.produceGlowTimer - dt);
    if (this.hitShakeTimer > 0) this.hitShakeTimer = Math.max(0, this.hitShakeTimer - dt);
    if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt);
    if (this.skillCastAnim > 0) this.skillCastAnim = Math.max(0, this.skillCastAnim - dt);

    // Đang bị Râu Đen khóa không thể hành động
    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      return;
    }

    // Sạc thời gian hồi Tuyệt Chiêu
    if (this.skillMaxCooldown > 0 && !this.skillReady) {
      this.skillCooldown -= dt;
      if (this.skillCooldown <= 0) {
        this.skillCooldown = 0;
        this.skillReady = true;
      }
    }

    // Sên Beli tạo tiền định kỳ
    if (this.type === 'DEN_DEN_MUSHI') {
      this.produceTimer -= dt;
      if (this.produceTimer <= 0) {
        this.produceTimer = (this.typeDef.produceInterval ?? 15.0) * this.produceMul;
        this.produceGlowTimer = 1.15;
        if (onAction) {
          onAction('PRODUCE_BELI', {
            col: this.col,
            row: this.row,
            amount: (this.typeDef.beliAmount ?? 25) + this.beliBonus
          });
        }
      }
    }

    // Mìn Hải Lâu Thạch: chôn nạp dưới đất, nạp xong sẽ trồi lên chờ hải tặc dẫm (GameManager kiểm tra va chạm)
    if (this.type === 'SEASTONE_MINE' && !this.isArmed) {
      this.armTimer -= dt;
      if (this.armTimer <= 0) {
        this.isArmed = true;
        if (onAction) onAction('MINE_ARMED', { unit: this, col: this.col, row: this.row });
      }
    }
    if (this.type === 'SEASTONE_MINE' && this.isArmed && this.popAnim < 1) {
      this.popAnim = Math.min(1, this.popAnim + dt * 2.6);
    }

    // Bom Đôi Buster Call đếm ngược phồng to rồi nổ tung 3x3 ô
    if (this.type === 'BUSTER_CANNON') {
      this.fuseTimer -= dt;
      if (this.fuseTimer <= 0 && !this.isDetonated) {
        this.isDetonated = true;
        this.isDead = true;
        if (onAction) {
          onAction('DETONATE_BUSTER', {
            col: this.col,
            row: this.row,
            damage: Math.round((this.typeDef.damage ?? 1800) * this.damageMul),
            radiusCols: this.typeDef.blastRadiusCols ?? 1
          });
        }
      }
    }

    // Kiểm tra mục tiêu trong làn bằng tọa độ cột phối cảnh (colPos)
    const activeLaneTargets = piratesInLane.filter(
      p => p.colPos >= this.col - 0.22 && p.colPos <= 9.65 && !p.isDead && !p.isDying
    );
    const hasGlobalTargets = allPirates
      ? allPirates.some(p => p.colPos <= 9.65 && !p.isDead && !p.isDying)
      : activeLaneTargets.length > 0;

    // Tự động tung Tuyệt Chiêu nếu bật Chế độ Tự Động và có địch
    if (this.skillReady && autoSkill) {
      const threatPresent = (this.type === 'AKAINU') ? hasGlobalTargets : (activeLaneTargets.length > 0);
      if (threatPresent) {
        this.castSkill(onAction);
      }
    }

    // Xử lý bắn thường cho các đơn vị tầm xa / pháo đài / tướng
    const isShooter = (this.typeDef.damage || 0) > 0 && this.type !== 'BUSTER_CANNON' && this.type !== 'SEASTONE_MINE';
    if (isShooter) {
      const hasTarget = activeLaneTargets.length > 0;

      if (hasTarget) {
        this.shootTimer -= dt;

        if (this.burstQueue > 0) {
          this.burstDelay -= dt;
          if (this.burstDelay <= 0) {
            this.burstQueue--;
            this.burstDelay = this.typeDef.burstInterval ?? 0.16;
            this.triggerShotVisuals();
            this.emitBasicShot(onAction);
          }
        }

        if (this.shootTimer <= 0) {
          this.shootTimer = this.typeDef.shootInterval ?? 1.45;
          const bCount = this.typeDef.burstCount || 1;
          if (bCount > 1) {
            this.burstQueue = bCount - 1;
            this.burstDelay = this.typeDef.burstInterval ?? 0.16;
          }
          this.triggerShotVisuals();
          this.emitBasicShot(onAction);
        }
      } else {
        this.shootTimer = Math.min(this.shootTimer, 0.35);
      }
    }
  }

  emitBasicShot(onAction) {
    if (!onAction) return;
    let kind = this.typeDef.projectileKind || 'lead';
    const damage = Math.round((this.typeDef.damage ?? 20) * this.damageMul);
    if (this.fireBullets && kind === 'lead') kind = 'fire_lead';

    onAction('SHOOT_PROJECTILE', {
      unit: this,
      kind,
      damage,
      isIce: (kind === 'ice'),
      opts: {
        slowDuration: this.typeDef.slowDuration,
        burnDuration: this.fireBullets ? 2.5 : this.typeDef.burnDuration,
        splashDamageRatio: this.typeDef.splashDamageRatio,
        splashRadiusCols: this.typeDef.splashRadiusCols
      }
    });
  }

  castSkill(onAction) {
    if (!this.skillReady || this.stunTimer > 0 || this.isDead) return false;
    this.skillReady = false;
    this.skillCooldown = this.skillMaxCooldown;
    this.skillCastAnim = 0.65;
    this.recoilTimer = 0.25;

    if (onAction) {
      onAction('HERO_SKILL', { unit: this, skillName: this.typeDef.skillName });
    }
    return true;
  }

  triggerShotVisuals() {
    this.recoilTimer = 0.24;
    this.muzzleFlashTimer = 0.13;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitShakeTimer = 0.16;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }

  render(ctx, grid, assets = null) {
    if (this.isDead) return;

    const cell = grid.cellToPixel(this.col, this.row);
    const x = cell.feetX;
    const feetY = cell.feetY;
    const centerY = cell.centerY;
    const sc = cell.scale || 1;

    ctx.save();

    // Vòng hào quang dưới chân khi Tuyệt Chiêu đã hồi xong
    if (this.skillReady) {
      const auraColor = this.typeDef.skillColor || '#f1c40f';
      const ringR = (29 + Math.sin(this.animTime * 2.5) * 4) * sc;
      ctx.save();
      ctx.strokeStyle = auraColor;
      ctx.lineWidth = 3 * sc;
      ctx.globalAlpha = 0.72 + Math.sin(this.animTime * 3) * 0.25;
      ctx.beginPath();
      ctx.ellipse(x, feetY - 2 * sc, ringR, 11 * sc, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Hoạt ảnh thở & co giãn mượt mà
    const breathWave = Math.sin(this.animTime);
    const secondaryWave = Math.sin(this.animTime * 1.7 + 0.6);
    let scaleX = 1.0 + breathWave * 0.032 + secondaryWave * 0.008;
    let scaleY = 1.0 - breathWave * 0.036;
    let rot = breathWave * 0.018;
    let offsetX = 0;
    let offsetY = 0;

    if (this.spawnAnim < 1.0) {
      const pop = Math.max(0.15, easeOutBack(this.spawnAnim));
      scaleX *= pop;
      scaleY *= pop;
      offsetY -= Math.sin(this.spawnAnim * Math.PI) * 10;
    }

    const isShooter = (this.typeDef.damage || 0) > 0 && this.type !== 'BUSTER_CANNON' && this.type !== 'SEASTONE_MINE';
    if (this.shootTimer < 0.18 && this.shootTimer > 0 && isShooter) {
      const prep = 1 - this.shootTimer / 0.18;
      offsetX += prep * 3;
      rot += prep * 0.04;
    }

    if (this.type === 'DEN_DEN_MUSHI') {
      rot = Math.sin(this.animTime * 0.9) * 0.06;
      if (this.produceGlowTimer > 0) {
        const jumpProg = 1 - this.produceGlowTimer / 1.15;
        const jump = Math.sin(jumpProg * Math.PI) * 11;
        offsetY -= Math.max(0, jump);
        const auraAlpha = (this.produceGlowTimer / 1.15) * 0.55;
        ctx.fillStyle = `rgba(241, 196, 15, ${auraAlpha})`;
        ctx.beginPath();
        ctx.arc(x, centerY - 4 * sc, 36 * sc, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (this.recoilTimer > 0) {
      const k = 1 - easeOutCubic(1 - this.recoilTimer / 0.24);
      const kick = 8.5;
      offsetX -= k * kick;
      rot -= k * 0.095;
      scaleX *= (1.0 - k * 0.065);
      scaleY *= (1.0 + k * 0.06);
    }

    if (this.skillCastAnim > 0) {
      const sProg = 1 - this.skillCastAnim / 0.65;
      const leap = Math.sin(sProg * Math.PI) * 14;
      offsetY -= leap;
      scaleX *= 1.12;
      scaleY *= 1.12;
    }

    if (this.type === 'BUSTER_CANNON') {
      const progress = Math.max(0, 1.0 - this.fuseTimer / Math.max(0.1, this.fuseTotalTime));
      const swell = 1.0 + progress * 0.42 + Math.sin(this.animTime * 12) * 0.075;
      scaleX = swell;
      scaleY = swell;
      rot = Math.sin(this.animTime * 15) * 0.11;

      const dangerAlpha = 0.22 + progress * 0.42;
      ctx.fillStyle = `rgba(255, 56, 56, ${dangerAlpha})`;
      ctx.beginPath();
      ctx.ellipse(x, feetY - 12 * sc, (38 + progress * 14) * sc, (15 + progress * 6) * sc, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.hitShakeTimer > 0) {
      offsetX += Math.sin(this.hitShakeTimer * 80) * 3.5;
    }

    if (this.stunTimer > 0) {
      offsetX += Math.sin(this.animTime * 14) * 2.5;
      scaleY *= 0.92;
    }

    if (this.type === 'AOKIJI_ICE') {
      ctx.fillStyle = 'rgba(0, 210, 255, 0.24)';
      ctx.beginPath();
      ctx.ellipse(x, feetY - 2 * sc, (31 + Math.sin(this.animTime * 2) * 4) * sc, 10 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vẽ nhân vật 3D neo chân đúng tại (x, feetY) và scale theo độ sâu phối cảnh
    const sprite = assets ? assets.get(`unit_${this.type}`) : null;
    ctx.save();
    ctx.translate(x + offsetX * sc, feetY + offsetY * sc);
    ctx.rotate(rot);
    ctx.scale(sc * scaleX, sc * scaleY);

    if (this.type === 'SEASTONE_MINE') {
      this.renderMine(ctx, sprite);
    } else if (sprite) {
      const isHeroTall = (this.type === 'AOKIJI_ICE' || this.type === 'MARINE_CAPTAIN' || this.type === 'CROCODILE' || this.type === 'MIHAWK' || this.type === 'AKAINU');
      const drawW = isHeroTall ? 90 : 84;
      const drawH = isHeroTall ? 92 : 84;
      ctx.drawImage(sprite, -drawW / 2, -drawH + 5, drawW, drawH);
    } else if (this.type === 'CROCODILE') {
      Unit.drawAnimeCrocodile(ctx, this.animTime);
    } else if (this.type === 'MIHAWK') {
      Unit.drawAnimeMihawk(ctx, this.animTime, this.recoilTimer > 0);
    } else if (this.type === 'AKAINU') {
      Unit.drawAnimeAkainu(ctx, this.animTime, this.recoilTimer > 0);
    } else {
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.typeDef.icon, 0, -10);
    }

    // Vết nứt khiên Lính Khiên Sắt khi bị hư hại
    if (this.type === 'MARINE_SHIELD') {
      const hpPct = this.hp / this.maxHp;
      if (hpPct < 0.66) {
        ctx.strokeStyle = 'rgba(20, 20, 30, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, -56);
        ctx.lineTo(-4, -44);
        ctx.lineTo(-10, -34);
        ctx.stroke();
      }
      if (hpPct < 0.33) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(4, -48);
        ctx.lineTo(-6, -30);
        ctx.lineTo(2, -18);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Tia lửa nòng súng tại đầu mũi tấn công theo lưới phối cảnh
    if (this.muzzleFlashTimer > 0) {
      const muzzlePt = grid.gridToPixel(this.col + 0.85, this.row + 0.85);
      const flashColor = this.type === 'AOKIJI_ICE' ? '#00d2ff'
        : this.type === 'CROCODILE' ? '#fbc531'
        : this.type === 'MIHAWK' ? '#00e676'
        : this.type === 'AKAINU' ? '#ff4757'
        : this.fireBullets ? '#ff7f50'
        : '#f1c40f';

      ctx.save();
      ctx.translate(muzzlePt.x, muzzlePt.y - 65 * sc);
      ctx.scale(sc, sc);
      ctx.fillStyle = flashColor;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const r = (i % 2 === 0) ? 15 : 5;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Nhãn trạng thái bị khống chế
    if (this.stunTimer > 0) {
      ctx.fillStyle = '#be2edd';
      ctx.font = `bold ${Math.round(11 * sc)}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2.5;
      ctx.strokeText('🌑 BỊ KHỐNG CHẾ', x, feetY - 84 * sc);
      ctx.fillText('🌑 BỊ KHỐNG CHẾ', x, feetY - 84 * sc);
    }

    // Nhãn Tuyệt Chiêu Sẵn Sàng / Thanh sạc
    if (this.skillReady && this.stunTimer <= 0) {
      const pulseY = Math.sin(this.animTime * 2.8) * 3;
      const badgeW = 54 * sc;
      const badgeH = 16 * sc;
      const badgeY = Math.max(96, feetY - 94 * sc) + pulseY;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 22, 34, 0.92)';
      ctx.beginPath();
      ctx.roundRect(x - badgeW / 2, badgeY, badgeW, badgeH, 6);
      ctx.fill();
      ctx.strokeStyle = this.typeDef.skillColor || '#f1c40f';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = this.typeDef.skillColor || '#f1c40f';
      ctx.font = `bold ${Math.max(9, Math.round(10 * sc))}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ CHIÊU!', x, badgeY + badgeH / 2);
      ctx.restore();
    } else if (this.skillMaxCooldown > 0 && this.stunTimer <= 0) {
      const prog = Math.max(0, 1 - this.skillCooldown / this.skillMaxCooldown);
      const bw = 38 * sc;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(x - bw / 2, feetY + 1, bw, 3.5);
      ctx.fillStyle = this.typeDef.skillColor || '#00d2ff';
      ctx.fillRect(x - bw / 2, feetY + 1, bw * prog, 3.5);
    }

    // Thanh máu khi bị cắn
    if (this.hp < this.maxHp && this.type !== 'BUSTER_CANNON') {
      const barW = 46 * sc;
      const barH = 5;
      const barX = x - barW / 2;
      const barY = Math.max(94, feetY - 82 * sc);
      const hpPct = Math.max(0, this.hp / this.maxHp);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
      ctx.fillRect(barX, barY, barW * hpPct, barH);
    }

    ctx.restore();
  }

  /** Vẽ Mìn Hải Lâu Thạch: đang nạp thì chôn dưới đất (chỉ lộ đầu gai + đèn đỏ nhấp nháy), nạp xong trồi lên */
  renderMine(ctx, sprite) {
    const drawMound = () => {
      ctx.fillStyle = '#5b3a1e';
      ctx.beginPath();
      ctx.ellipse(0, -2, 34, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a5230';
      ctx.beginPath();
      ctx.ellipse(-4, -6, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a2f18';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-22 + i * 11, -3 + (i % 2) * 3, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (!this.isArmed) {
      // Chôn dưới đất: cắt phần thân, chỉ thò đầu mìn lên khỏi mô đất
      const progress = 1 - Math.max(0, this.armTimer) / Math.max(0.1, this.armTotalTime);
      ctx.save();
      ctx.beginPath();
      ctx.rect(-70, -130, 140, 108);
      ctx.clip();
      ctx.translate(0, 46 - progress * 6);
      ctx.scale(0.9, 0.9);
      if (sprite) ctx.drawImage(sprite, -42, -79, 84, 84);
      ctx.restore();
      drawMound();

      // Vòng nạp mìn nhỏ phía trên mô đất
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -40, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#00d2ff';
      ctx.beginPath();
      ctx.arc(0, -40, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
      return;
    }

    // Đã nạp xong: trồi lên bật nảy & đèn báo đỏ nhấp nháy
    const p = easeOutBack(Math.min(1, this.popAnim));
    ctx.save();
    ctx.translate(0, (1 - p) * 40);
    if (sprite) {
      const blink = 0.5 + 0.5 * Math.sin(this.animTime * 6);
      ctx.drawImage(sprite, -42, -79, 84, 84);
      ctx.fillStyle = `rgba(255, 40, 40, ${0.25 + blink * 0.5})`;
      ctx.beginPath();
      ctx.arc(0, -76, 8 + blink * 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚓', 0, -10);
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255, 71, 87, 0.9)';
    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SẴN SÀNG', 0, 16);
  }

  // =========================================================================
  // ĐỒ HỌA DỰ PHÒNG CHO ĐÔ ĐỐC & THẤT VŨ HẢI (KHI CHƯA NẠP ĐƯỢC PNG)
  // =========================================================================

  static ink(ctx, lw = 2.3) {
    ctx.strokeStyle = '#181828';
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  static drawAnimeCrocodile(ctx, animTime = 0) {
    const sway = Math.sin(animTime * 1.1) * 2.5;

    ctx.fillStyle = 'rgba(225, 177, 44, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, -6, 28 + sway, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.roundRect(-10, -24, 8, 22, 3);
    ctx.roundRect(2, -24, 8, 22, 3);
    ctx.fill();
    Unit.ink(ctx, 2);

    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.moveTo(-26 - sway * 0.5, -10);
    ctx.quadraticCurveTo(-22, -48, -10, -56);
    ctx.lineTo(14, -54);
    ctx.lineTo(14, -14);
    ctx.closePath();
    ctx.fill();
    Unit.ink(ctx, 2.4);

    ctx.fillStyle = '#485460';
    ctx.beginPath();
    ctx.ellipse(-2, -52, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    Unit.ink(ctx, 2);

    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.roundRect(-10, -50, 22, 27, 5);
    ctx.fill();
    Unit.ink(ctx, 2.2);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(8, -42, 13, 12, 4);
    ctx.fill();
    Unit.ink(ctx, 2);

    ctx.strokeStyle = '#fff5c0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(27, -38, 10, -Math.PI * 0.7, Math.PI * 0.8);
    ctx.stroke();
    Unit.ink(ctx, 1.8);

    ctx.fillStyle = '#e6b88a';
    ctx.beginPath();
    ctx.arc(1, -64, 12.5, 0, Math.PI * 2);
    ctx.fill();
    Unit.ink(ctx, 2.3);

    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.arc(0, -68, 12.5, Math.PI * 0.95, Math.PI * 2.05);
    ctx.lineTo(-14, -64);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -63);
    ctx.lineTo(10, -63);
    ctx.stroke();

    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.arc(6, -65, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(8, -58);
    ctx.lineTo(18, -60);
    ctx.stroke();
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(19, -60, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawAnimeMihawk(ctx, animTime = 0, isSlashing = false) {
    const capeSway = Math.sin(animTime * 1.3) * 3;
    const swordRot = isSlashing ? 0.65 : -0.22 + Math.sin(animTime) * 0.04;

    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.roundRect(-10, -24, 8, 22, 3);
    ctx.roundRect(2, -24, 8, 22, 3);
    ctx.fill();
    Unit.ink(ctx, 2);

    ctx.fillStyle = '#880e4f';
    ctx.beginPath();
    ctx.moveTo(-24 - capeSway * 0.5, -8);
    ctx.lineTo(-13, -52);
    ctx.lineTo(12, -52);
    ctx.lineTo(12, -12);
    ctx.closePath();
    ctx.fill();
    Unit.ink(ctx, 2.3);

    ctx.fillStyle = '#f5cba7';
    ctx.beginPath();
    ctx.roundRect(-7, -50, 14, 24, 3);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(1, -46);
    ctx.lineTo(1, -34);
    ctx.moveTo(-4, -41);
    ctx.lineTo(6, -41);
    ctx.stroke();

    ctx.save();
    ctx.translate(4, -38);
    ctx.rotate(swordRot);
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(-2, -16, 6, 32, 2);
    ctx.fill();
    Unit.ink(ctx, 2);
    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.lineTo(42, -9);
    ctx.quadraticCurveTo(48, -4, 44, 4);
    ctx.lineTo(4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f5cba7';
    ctx.beginPath();
    ctx.arc(0, -64, 12, 0, Math.PI * 2);
    ctx.fill();
    Unit.ink(ctx, 2.2);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(6, -64, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.arc(6, -64, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-3, -55);
    ctx.lineTo(6, -54);
    ctx.stroke();

    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.ellipse(0, -73, 25, 6.5, -0.08, 0, Math.PI * 2);
    ctx.fill();
    Unit.ink(ctx, 2.2);

    ctx.beginPath();
    ctx.roundRect(-10, -86, 20, 14, 4);
    ctx.fill();
    Unit.ink(ctx, 2.2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-8, -82);
    ctx.quadraticCurveTo(-24, -96, -26, -78);
    ctx.quadraticCurveTo(-18, -76, -8, -82);
    ctx.fill();
    Unit.ink(ctx, 1.8);
  }

  static drawAnimeAkainu(ctx, animTime = 0, isAttacking = false) {
    const pulse = Math.sin(animTime * 3) * 2;
    const coatSway = Math.sin(animTime * 1.4) * 3;

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(-10, -24, 9, 22, 3);
    ctx.roundRect(2, -24, 9, 22, 3);
    ctx.fill();
    Unit.ink(ctx, 2.2);

    ctx.fillStyle = '#f5f6fa';
    ctx.beginPath();
    ctx.moveTo(-26 - coatSway * 0.6, -8);
    ctx.lineTo(-14, -55);
    ctx.lineTo(13, -55);
    ctx.lineTo(10, -10);
    ctx.closePath();
    ctx.fill();
    Unit.ink(ctx, 2.4);

    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.roundRect(-10, -52, 22, 29, 5);
    ctx.fill();
    Unit.ink(ctx, 2.2);
    ctx.fillStyle = '#ff6b81';
    ctx.beginPath();
    ctx.arc(-3, -44, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(-15, -56, 12, 6, 3);
    ctx.roundRect(6, -56, 12, 6, 3);
    ctx.fill();
    Unit.ink(ctx, 1.8);

    ctx.fillStyle = '#d99b66';
    ctx.beginPath();
    ctx.arc(1, -64, 12.5, 0, Math.PI * 2);
    ctx.fill();
    Unit.ink(ctx, 2.3);

    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.moveTo(2, -67);
    ctx.lineTo(10, -64);
    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-12, -80, 25, 11, 4);
    ctx.fill();
    Unit.ink(ctx, 2.2);
    ctx.fillStyle = '#181828';
    ctx.beginPath();
    ctx.roundRect(3, -72, 16, 4.5, 2);
    ctx.fill();

    ctx.save();
    ctx.translate(isAttacking ? 18 : 13, -38);
    ctx.fillStyle = 'rgba(255, 71, 87, 0.38)';
    ctx.beginPath();
    ctx.arc(8, 0, 15 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(8, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    Unit.ink(ctx, 2);
    ctx.fillStyle = '#ffa502';
    ctx.beginPath();
    ctx.arc(10, -1, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff200';
    ctx.beginPath();
    ctx.arc(11, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static renderPortrait(ctx, unitId, cx, cy, size = 56, animTime = 0, assets = null) {
    const spr = assets ? assets.get(`unit_${unitId}`) : null;
    if (spr) {
      ctx.drawImage(spr, cx - size / 2, cy - size / 2, size, size);
      return;
    }

    if (unitId === 'CROCODILE' || unitId === 'MIHAWK' || unitId === 'AKAINU') {
      ctx.save();
      ctx.translate(cx, cy + size * 0.44);
      const sc = size / 86;
      ctx.scale(sc, sc);
      if (unitId === 'CROCODILE') Unit.drawAnimeCrocodile(ctx, animTime);
      else if (unitId === 'MIHAWK') Unit.drawAnimeMihawk(ctx, animTime, false);
      else Unit.drawAnimeAkainu(ctx, animTime, false);
      ctx.restore();
      return;
    }

    const def = UNIT_TYPES[unitId];
    ctx.save();
    ctx.font = `${Math.round(size * 0.52)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def ? def.icon : '⚓', cx, cy);
    ctx.restore();
  }
}
