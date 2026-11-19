/**
 * ============================================================================
 * BẢNG CẤU HÌNH MÀN CHƠI, ĐỢT QUÂN & KINH TẾ TIỀN BELI (ECONOMY_CONFIG + STAGES)
 * ============================================================================
 * Hướng dẫn tự chỉnh sửa thời gian & sức mạnh các màn chơi:
 *
 * 1. DANH SÁCH MÃ HẢI QUÂN (Dùng cho rewardUnit / allowedUnits):
 *    - 'DEN_DEN_MUSHI'   : Sên Beli (tạo tiền)
 *    - 'MARINE_RIFLE'    : Lính Súng Trường (bắn đơn)
 *    - 'MARINE_SHIELD'   : Lính Khiên Sắt (tanker 4000 máu)
 *    - 'SEASTONE_MINE'   : Mìn Hải Lâu Thạch 25B (chôn đất nạp 8.5s, hải tặc dẫm là nổ)
 *    - 'BUSTER_CANNON'   : Bom Đôi Buster Call / Trái Ác Quỷ (nổ tức thì 3x3 ô diệt sạch cụm địch)
 *    - 'MARINE_CAPTAIN'  : Đội Trưởng Súng Đôi (bắn 2 phát)
 *    - 'AOKIJI_ICE'      : Đô Đốc Băng Aokiji (bắn băng + Skill Đóng Băng cả hàng)
 *    - 'CROCODILE'       : Thất Vũ Hải Crocodile (xuyên 3 + Skill Bão Cát đẩy lùi)
 *    - 'MIHAWK'          : Mắt Diều Hâu Mihawk (xuyên giáp + Skill Hắc Kiếm Yoru)
 *    - 'AKAINU'          : Thủy Sư Đô Đốc Akainu (nổ đốt + Skill 5 Thiên Thạch)
 *
 * 2. DANH SÁCH MÃ HẢI TẶC (Dùng cho waves[i].spawns):
 *    - 'PIRATE_GRUNT'         : Hải Tặc Tân Binh
 *    - 'BARREL_PIRATE'        : Hải Tặc Thùng Gỗ
 *    - 'ARMORED_PIRATE'       : Hải Tặc Giáp Sắt
 *    - 'BUGGY_JUMPER'         : Hải Tặc Buggy Nhảy Sào
 *    - 'BERSERKER_SWORDSMAN'  : Kiếm Sĩ Cuồng Nộ
 *    - 'OARS_GIANT'           : Người Khổng Lồ Oars (Boss)
 *    - 'MARCO_PHOENIX'        : Ma Cô Phượng Hoàng (Boss hồi máu)
 *    - 'BLACKBEARD'           : Tứ Hoàng Râu Đen (Boss làm choáng)
 *    - 'WHITEBEARD'           : Tứ Hoàng Râu Trắng (Trùm Cuối)
 *
 * 3. DANH SÁCH BẢN ĐỒ NỀN (theme):
 *    - 'grass'      : Sân cỏ căn cứ hải cảng
 *    - 'sand'       : Bãi biển cát vàng
 *    - 'wood'       : Boong tàu gỗ
 *    - 'marineford' : Mặt vịnh băng Marineford
 *
 * 4. CÁCH TÍNH ĐỢT QUÂN (waves):
 *    - Màn 1-5: đúng 2 đợt (Đợt 1 + Đợt Cuối). Màn 6-7: 3 đợt. Màn 8-9: 4 đợt.
 *    - waves[0].delay = số giây chuẩn bị trước khi Đợt 1 xuất hiện.
 *    - Từ Đợt 2 trở đi: game CHỜ cho tới khi hải tặc đang sống trên sân còn
 *      <= ECONOMY_CONFIG.nextWaveMaxAlive (0-1 tên) rồi mới đếm ngược waves[i].delay giây
 *      (đây là giây chờ sau khi dọn gần sạch đợt trước) để ra đợt kế tiếp.
 * ============================================================================
 */

// Cấu hình tiền Beli rơi tự nhiên từ trên trời + Vàng Khối rơi từ hải tặc
export const ECONOMY_CONFIG = {
  skyBeliFirstDelay: 2.8,   // Thời gian rơi đồng Beli đầu tiên lúc vừa vào trận (giây - rất sớm để dễ xây Sên)
  skyBeliMinInterval: 8.0,  // Khoảng thời gian tối thiểu giữa 2 lần rơi Beli từ trời (giây)
  skyBeliRandomExtra: 2.5,  // Khoảng thời gian ngẫu nhiên cộng thêm (từ 8.0s đến 10.5s rơi 1 đồng)
  skyBeliValue: 25,         // Giá trị tiền của mỗi đồng Beli rơi từ trời xuống

  goldDropChance: 0.20,     // Tỷ lệ hải tặc thường chết rơi ra Vàng Khối (0.20 = 20%)
  bossGoldDropChance: 1.0,  // Tỷ lệ Boss (Oars, Marco, Râu Đen, Râu Trắng) rơi Vàng Khối (1.0 = 100%)
  goldBarValue: 1,          // Số Vàng Khối nhận được mỗi thanh vàng thường
  bossGoldBarValue: 2,      // Số Vàng Khối nhận được khi Boss rơi vàng

  nextWaveMaxAlive: 1,      // Đợt sau chỉ xuất hiện khi hải tặc còn sống <= số này (0-1 tên)
  nextWaveForceAfter: 80    // Chống kẹt màn: sau chừng này giây kể từ khi ra đợt trước thì ép ra đợt mới (giây)
};

export const STAGES = [
  // --------------------------------------------------------------------------
  // MÀN 1: CĂN CỨ SHELLS TOWN (Làm quen cơ bản với 3 làn giữa) - 2 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 1,                                // Số thứ tự màn (1..9)
    name: 'Màn 1: Căn Cứ Shells Town',    // Tên màn hiển thị trên bản đồ & HUD
    location: 'Quần Đảo East Blue',       // Tên vùng biển
    theme: 'grass',                       // Bản đồ nền: 'grass' (sân cỏ phối cảnh)
    lockedRows: [0, 4],                   // Khóa hàng 0 (trên) và hàng 4 (dưới), chỉ đánh 3 hàng giữa
    description: 'Hải tặc tân binh sắp đổ bộ! Bạn có 18 giây đầu chuẩn bị: đặt Sên Beli sinh tiền rồi bố trí Lính Súng Trường.',
    initialBeli: 175,                     // Tiền Beli khởi đầu khi vào trận
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE'], // Binh chủng mặc định gợi ý
    rewardUnit: 'MARINE_SHIELD',          // Phần thưởng rớt ra từ Hải Tặc cuối cùng của Màn 1
    waves: [
      // Đợt 1: Ra 6 tên. Mỗi tên bước ra cách nhau 12.5 giây
      { delay: 12, spawns: [{ type: 'PIRATE_GRUNT', count: 4, spawnInterval: 12.5 }] }, 
      
      // Đợt cuối Cờ Đỏ: Ra 6 tên ồ ạt. Khoảng cách mỗi tên chỉ 1 giây
      { delay: 4, spawns: [{ type: 'PIRATE_GRUNT', count: 4, spawnInterval: 1.5 }], isHugeWave: true } 
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 2: THỊ TRẤN ORANGE TOWN (Mở full 5 làn + Hải Tặc Thùng Gỗ) - 2 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 2,
    name: 'Màn 2: Thị Trấn Orange Town',
    location: 'Cảng Biển East Blue',
    theme: 'sand',
    lockedRows: [],                       // Mảng rỗng [] = mở toàn bộ 5 hàng chiến đấu
    description: 'Chiến trường mở rộng 5 làn! Hãy soạn Lính Khiên Sắt vừa thu phục để chặn Hải Tặc Thùng Gỗ!',
    initialBeli: 175,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD'],
    rewardUnit: 'SEASTONE_MINE',          // Thắng Màn 2 nhận Mìn Hải Lâu Thạch 25B!
    waves: [
      // Đợt 1: 3 Tân binh ra trước, 2 Thùng gỗ ra sau (đi chậm rãi)
      { delay: 15, spawns: [
          { type: 'PIRATE_GRUNT', count: 3, spawnInterval: 12.0 }, 
          { type: 'BARREL_PIRATE', count: 2, spawnInterval: 12.0 }
      ]}, 
      // Đợt Cờ Đỏ: Ra xen kẽ liên tục
      { delay: 4, spawns: [
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 2.0 },
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 1.5 }
      ], isHugeWave: true } 
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 3: BỜ BIỂN LÀNG SYRUP (Xuất hiện Hải Tặc Buggy Nhảy Sào) - 2 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 3,
    name: 'Màn 3: Bờ Biển Làng Syrup',
    location: 'Bờ Biển Dốc Đá',
    theme: 'sand',
    lockedRows: [],
    description: 'Băng Buggy Nhảy Sào có thể vọt qua lính đầu tiên! Chôn Mìn 25B từ sớm để hải tặc dẫm phải nổ tung.',
    initialBeli: 175,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD', 'SEASTONE_MINE'],
    rewardUnit: 'BUSTER_CANNON',          // Thắng Màn 3 nhận Bom Đôi Buster Call (nổ 3x3!)
    waves: [
      { delay: 15, spawns: [
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 12.0 }, 
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 12.0 },
          { type: 'BUGGY_JUMPER', count: 2, spawnInterval: 11.0 }
      ]}, 
      { delay: 4, spawns: [
          { type: 'BUGGY_JUMPER', count: 3, spawnInterval: 1.8 },
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 2.0 },
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 1.5 }
      ], isHugeWave: true }
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 4: NHÀ HÀNG BIỂN BARATIE (Boong tàu gỗ + Hải Tặc Giáp Sắt) - 2 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 4,
    name: 'Màn 4: Nhà Hàng Biển Baratie',
    location: 'Boong Tàu Nhà Hàng',
    theme: 'wood',
    lockedRows: [],
    description: 'Hải tặc Giáp Sắt cực trâu đổ bộ lên boong tàu! Dùng Bom Đôi Buster Call nổ 3x3 xuyên giáp diệt sạch cả cụm.',
    initialBeli: 200,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD', 'SEASTONE_MINE', 'BUSTER_CANNON'],
    rewardUnit: 'MARINE_CAPTAIN',         // Thắng Màn 4 nhận Đội Trưởng Súng Đôi
    waves: [
      { delay: 16, spawns: [
          { type: 'PIRATE_GRUNT', count: 5, spawnInterval: 12.0 }, 
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 12.0 }, 
          { type: 'ARMORED_PIRATE', count: 2, spawnInterval: 15.0 }
      ]}, 
      { delay: 4, spawns: [
          { type: 'PIRATE_GRUNT', count: 2, spawnInterval: 1.5 },
          { type: 'ARMORED_PIRATE', count: 2, spawnInterval: 4.3 }, 
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 2.0 }, 
          { type: 'BUGGY_JUMPER', count: 2, spawnInterval: 1.8 }
      ], isHugeWave: true }
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 5: CÔNG VIÊN ARLONG PARK (Kiếm Sĩ Cuồng Nộ + Nhận Aokiji) - 2 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 5,
    name: 'Màn 5: Công Viên Arlong Park',
    location: 'Căn Cứ Người Cá',
    theme: 'grass',
    lockedRows: [],
    description: 'Kiếm sĩ cuồng nộ khi vỡ khiên sẽ chạy xé gió! Đội Trưởng Súng Đôi sẽ giúp hỏa lực tuyến sau dày đặc hơn.',
    initialBeli: 225,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD', 'SEASTONE_MINE', 'BUSTER_CANNON', 'MARINE_CAPTAIN'],
    rewardUnit: 'CROCODILE',            
    waves: [
      { delay: 16, spawns: [
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 12.0 },
          { type: 'BERSERKER_SWORDSMAN', count: 2, spawnInterval: 13.0 }, 
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 12.0 }, 
          { type: 'ARMORED_PIRATE', count: 2, spawnInterval: 15.0 }
      ]}, 
      { delay: 4, spawns: [
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 2.0 },
          { type: 'BERSERKER_SWORDSMAN', count: 3, spawnInterval: 3.0 }, 
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 4.3 }, 
          { type: 'BUGGY_JUMPER', count: 2, spawnInterval: 1.8 }
      ], isHugeWave: true }
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 6: QUẦN ĐẢO SABAODY (Marco Phượng Hoàng & Oars Khổng Lồ) - 3 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 6,
    name: 'Màn 6: Quần Đảo Sabaody',
    location: 'Tân Thế Giới - Cửa Ngõ',
    theme: 'grass',
    lockedRows: [],
    description: 'Đội trưởng Ma Cô Phượng Hoàng (Marco) tự hồi máu liên tục & bay vọt! Dùng Skill Kỷ Băng Hà của Aokiji để đóng băng tắt lửa xanh!',
    initialBeli: 250,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD', 'SEASTONE_MINE', 'BUSTER_CANNON', 'MARINE_CAPTAIN', 'AOKIJI_ICE'],
    rewardUnit: 'AOKIJI_ICE',              
    waves: [
      // Đợt 1: Vẫn rớt từng con 1 một cách thong thả (mặc định)
      { delay: 15, spawns: [
          { type: 'BARREL_PIRATE', count: 4, spawnInterval: 12.0 }, 
          { type: 'PIRATE_GRUNT', count: 5, spawnInterval: 12.0 },
          { type: 'BERSERKER_SWORDSMAN', count: 2, spawnInterval: 13.5 }
      ]}, 

      // Đợt 2: THẢ 2 CON CÙNG LÚC! Nhịp game tăng gấp đôi!
      { delay: 4, concurrentSpawns: 2, spawns: [
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 12.0 },
          { type: 'MARCO_PHOENIX', count: 1, spawnInterval: 17.0 }, 
          { type: 'ARMORED_PIRATE', count: 2, spawnInterval: 15.0 },
          { type: 'OARS_GIANT', count: 1, spawnInterval: 18.0 },
          { type: 'BERSERKER_SWORDSMAN', count: 2, spawnInterval: 13.5 }
      ]}, 

      // Đợt 3 (Cờ Đỏ): Ào ạt như cũ
      { delay: 5, isHugeWave: true, spawns: [
          { type: 'MARCO_PHOENIX', count: 1, spawnInterval: 6.0 }, 
          { type: 'OARS_GIANT', count: 2, spawnInterval: 6.5 }, 
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 5.8 }
      ]}
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 7: NGỤC TỐI IMPEL DOWN (Tứ Hoàng Râu Đen + Nhận Mihawk) - 3 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 7,
    name: 'Màn 7: Ngục Tối Impel Down',
    location: 'Đại Ngục Sâu Đáy Biển',
    theme: 'wood',
    lockedRows: [],
    description: 'Tứ Hoàng Râu Đen xuất hiện dùng Ám Huyệt Kurouzu làm choáng lính! Triệu hồi Thất Vũ Hải Crocodile quét Bão Cát đẩy lùi!',
    initialBeli: 300,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD', 'SEASTONE_MINE', 'BUSTER_CANNON', 'MARINE_CAPTAIN', 'AOKIJI_ICE', 'CROCODILE'],
    rewardUnit: 'MIHAWK',                 // Thắng Màn 7 chiêu mộ Mắt Diều Hâu Mihawk
    waves: [
      { delay: 15, spawns: [
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 12.0 },
          { type: 'BARREL_PIRATE', count: 5, spawnInterval: 12.0 },
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 15.0 }, 
          { type: 'BUGGY_JUMPER', count: 2, spawnInterval: 11.0 }
      ]}, 
      { delay: 4, concurrentSpawns: 2, spawns: [
          { type: 'BLACKBEARD', count: 1, spawnInterval: 19.5 }, 
          { type: 'BARREL_PIRATE', count: 6, spawnInterval: 12.0 },
          { type: 'OARS_GIANT', count: 2, spawnInterval: 18.0 },
          { type: 'BERSERKER_SWORDSMAN', count: 4, spawnInterval: 13.5 },
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 15.0 },
      ]}, 
      { delay: 5, spawns: [
          { type: 'BLACKBEARD', count: 1, spawnInterval: 7.5 }, 
          { type: 'MARCO_PHOENIX', count: 2, spawnInterval: 6.0 }, 
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 5.8 },
          { type: 'OARS_GIANT', count: 2, spawnInterval: 6.5 }
      ], isHugeWave: true }
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 8: CỔNG CHÍNH NGHĨA MARINEFORD (Vịnh băng + Nhận Thủy Sư Akainu) - 4 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 8,
    name: 'Màn 8: Cổng Chính Nghĩa Marineford',
    location: 'Vịnh Lưỡi Liềm Marineford',
    theme: 'marineford',
    lockedRows: [],
    description: 'Liên minh Râu Đen, Ma Cô & Oars Khổng Lồ tiến đánh tổng bộ! Điều động Mắt Diều Hâu Mihawk tung Nhất Kiếm Yoru xuyên giáp!',
    initialBeli: 350,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD', 'SEASTONE_MINE', 'BUSTER_CANNON', 'MARINE_CAPTAIN', 'AOKIJI_ICE', 'CROCODILE', 'MIHAWK'],
    rewardUnit: 'AKAINU',                 // Thắng Màn 8 chiêu mộ Thủy Sư Đô Đốc Akainu
    waves: [
      { delay: 15, spawns: [
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 12.0 },
          { type: 'BARREL_PIRATE', count: 5, spawnInterval: 12.0 },
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 15.0 }, 
          { type: 'BERSERKER_SWORDSMAN', count: 2, spawnInterval: 13.0 }
      ]}, 
      { delay: 4, concurrentSpawns: 2, spawns: [
          { type: 'MARCO_PHOENIX', count: 2, spawnInterval: 16.5 }, 
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 15.0 },
          { type: 'BERSERKER_SWORDSMAN', count: 2, spawnInterval: 13.0 },
          { type: 'BARREL_PIRATE', count: 3, spawnInterval: 2.0 }
      ]}, 
      { delay: 5, concurrentSpawns: 3, spawns: [
          { type: 'PIRATE_GRUNT', count: 4, spawnInterval: 12.0 },
          { type: 'BARREL_PIRATE', count: 5, spawnInterval: 12.0 },
          { type: 'BLACKBEARD', count: 1, spawnInterval: 19.5 }, 
          { type: 'OARS_GIANT', count: 2, spawnInterval: 18.0 }, 
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 15.0 }
      ]}, 
      { delay: 6, spawns: [
          { type: 'BARREL_PIRATE', count: 4, spawnInterval: 2.0 },
          { type: 'BLACKBEARD', count: 1, spawnInterval: 7.5 }, 
          { type: 'OARS_GIANT', count: 2, spawnInterval: 5.5 }, 
          { type: 'MARCO_PHOENIX', count: 2, spawnInterval: 5.0 }, 
          { type: 'BERSERKER_SWORDSMAN', count: 2, spawnInterval: 2.6 }
      ], isHugeWave: true }
    ]
  },

  // --------------------------------------------------------------------------
  // MÀN 9: ĐẠI CHIẾN THƯỢNG ĐỈNH MARINEFORD (Trùm Cuối Râu Trắng + Râu Đen) - 4 ĐỢT
  // --------------------------------------------------------------------------
  {
    id: 9,
    name: 'Màn 9: Đại Chiến Thượng Đỉnh Marineford',
    location: 'Quảng Trường Tổng Bộ',
    theme: 'marineford',
    lockedRows: [],
    description: 'TRẬN CUỐI! Tứ Hoàng Râu Trắng (6500 HP) giáng Chấn Động Gura Gura toàn hàng! Triệu hồi Thủy Sư Akainu dội Mưa Thiên Thạch!',
    initialBeli: 400,
    allowedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE', 'MARINE_SHIELD', 'SEASTONE_MINE', 'BUSTER_CANNON', 'MARINE_CAPTAIN', 'AOKIJI_ICE', 'CROCODILE', 'MIHAWK', 'AKAINU'],
    rewardUnit: null,                     // Màn cuối nhận Cúp Tổng Bộ Marineford
    waves: [
      { delay: 15, spawns: [
          { type: 'ARMORED_PIRATE', count: 3, spawnInterval: 3.0 }, 
          { type: 'MARCO_PHOENIX', count: 1, spawnInterval: 4.5 }
      ]}, 
      { delay: 3, spawns: [
          { type: 'BLACKBEARD', count: 1, spawnInterval: 4.5 }, 
          { type: 'BERSERKER_SWORDSMAN', count: 3, spawnInterval: 2.0 }
      ]}, 
      { delay: 3, spawns: [
          { type: 'WHITEBEARD', count: 1, spawnInterval: 5.0 }, 
          { type: 'MARCO_PHOENIX', count: 2, spawnInterval: 2.5 }
      ]}, 
      { delay: 3, spawns: [
          { type: 'WHITEBEARD', count: 1, spawnInterval: 2.5 }, 
          { type: 'BLACKBEARD', count: 1, spawnInterval: 1.5 }, 
          { type: 'OARS_GIANT', count: 1, spawnInterval: 1.5 }, 
          { type: 'MARCO_PHOENIX', count: 2, spawnInterval: 0.8 }
      ], isHugeWave: true }
    ]
  }
];
