/**
 * Trình Quản Lý Trạng Thái & Vòng Đời Trò Chơi (Version 6)
 * - V6: Mìn 25B + Bom Đôi Buster Call, thanh kéo âm lượng, đợt chờ dọn sạch, Vàng Khối & Shop Vàng
 * - Đồ họa nhân vật 3D PvZ sống động (AssetManager + sculpted 3D PNG)
 * - Khớp khít lưới phối cảnh 2.5D trên toàn bộ 4 bản đồ chiến trường (Grid.js)
 * - Sửa triệt để Xẻng thu hồi lính & nâng cấp Bom Cherry 3x3 / Đại Bác Buster Call cố định
 * - Lưu trữ tài khoản người chơi vĩnh viễn trên Server (saves/profiles.json) + localStorage
 */

import { Grid, GRID_CONFIG } from './Grid.js';
import { Unit, UNIT_TYPES, SHOP_ITEMS } from './Units.js';
import { Pirate, PIRATE_TYPES } from './Pirates.js';
import { Projectile } from './Projectiles.js';
import { BeliCoin, GoldBar } from './Beli.js';
import { Warship } from './LawnMowers.js';
import {
  Particle,
  ExplosionSpark,
  FloatingText,
  ShockwaveRing,
  AnimeSlashWave,
  SandTornado,
  MagmaMeteor,
  IceAgeCrystal,
  QuakeCrack,
  DarkVortex
} from './Particles.js';
import { STAGES, ECONOMY_CONFIG } from './Stages.js';
import { AudioManager } from '../core/AudioManager.js';
import { AssetManager } from '../core/AssetManager.js';

const STORAGE_V4_KEY = 'op_pvz_profiles_v4';
const DEFAULT_ACCOUNT_NAME = 'Thuyền Trưởng Hải Quân';

export class GameManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.virtualWidth = GRID_CONFIG.canvasWidth;   // 1068
    this.virtualHeight = GRID_CONFIG.canvasHeight; // 600

    this.audio = new AudioManager();
    this.assets = new AssetManager();

    this.screen = 'LOADING';
    this.loadProgressRatio = 0;

    // Hệ thống Tài Khoản & Lưu Tiến Độ
    this.activeAccountName = DEFAULT_ACCOUNT_NAME;
    this.profilesMap = {};
    this.hasLocalProfiles = false;
    this.syncStatusText = '💾 Đang đồng bộ...';
    this.maxUnlockedStage = 1;
    this.unlockedUnits = ['DEN_DEN_MUSHI', 'MARINE_RIFLE'];
    this.stageStars = {};
    this.selectedDeck = ['DEN_DEN_MUSHI', 'MARINE_RIFLE'];
    this.maxDeckSlots = 7;
    this.goldBars = 0;           // Vàng Khối đang có (tiêu ở Shop Vàng)
    this.shopUpgrades = this.getEmptyShopUpgrades();
    this.goldDrops = [];         // Vàng Khối đang nằm trên sân
    this.goldEarnedThisStage = 0;
    this.goldSaveTimer = 0;
    this.goldDirty = false;
    this.supportCd = { ICE: 0, MAGMA: 0 };
    this.isDraggingVolume = false;
    this.shopReturnScreen = 'TITLE';
    this.shopToast = null;
    this.sinceLastWave = 0;
    this.isWaitingForClear = false;

    this.loadLocalProgress();
    this.bindAccountModalUI();
    this.syncProfilesWithServer();

    // Màn & Bản Đồ
    this.currentStageIndex = 0;
    this.currentStage = STAGES[0];

    // Lưới Phối Cảnh 2.5D
    this.grid = new Grid();
    this.grid.setTheme(this.currentStage.theme);

    // Thực thể trong trận
    this.pirates = [];
    this.previewPirates = [];
    this.projectiles = [];
    this.beliCoins = [];
    this.warships = [];
    this.particles = [];
    this.floatingTexts = [];

    // Kinh tế & Chiến đấu
    this.beli = 175;
    this.skyBeliTimer = ECONOMY_CONFIG.skyBeliFirstDelay;
    this.selectedCardId = null;
    this.isShovelActive = false;
    this.unitCooldowns = {};
    this.gameSpeed = 1;
    this.autoSkill = true;

    this.skillCutIn = null;

    // Đợt tấn công (Wave)
    this.waveIndex = 0;
    this.waveTimer = 0;
    this.totalWaves = 0;
    this.hugeWaveAlertTimer = 0;
    this.isFinalWaveBanner = false;

    // Camera & Hiệu ứng
    this.globalTime = 0;
    this.cameraX = 0;
    this.introWaitTimer = 0;
    this.readyTimer = 0;
    this.screenShakeTime = 0;
    this.screenShakeMagnitude = 0;
    this.hoveredCell = null;
    this.mousePos = { x: 0, y: 0 };

    this.lootCard = null;
    this.rewardUnitDef = null;

    this.almanacTab = 'UNITS';
    this.almanacSelectedId = 'DEN_DEN_MUSHI';
    this.almanacReturnScreen = 'TITLE';

    this.setupInputs();
    this.resetWarships([]);

    this.assets.loadAll((progress) => {
      this.loadProgressRatio = progress;
    }).then(() => {
      if (this.screen === 'LOADING') {
        this.goToScreen('TITLE');
      }
    });
  }

  // =========================================================================
  // HỆ THỐNG TÀI KHOẢN & LƯU TIẾN ĐỘ VĨNH VIỄN (LOCALSTORAGE + SERVER JSON)
  // =========================================================================

  normalizeKey(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  cleanAccountName(name) {
    const cleaned = String(name || '').trim().replace(/\s+/g, ' ');
    return cleaned.slice(0, 28) || DEFAULT_ACCOUNT_NAME;
  }

  getEmptyShopUpgrades() {
    const out = {};
    for (const id of Object.keys(SHOP_ITEMS)) out[id] = 0;
    return out;
  }

  sanitizeShopUpgrades(raw) {
    const out = this.getEmptyShopUpgrades();
    if (raw && typeof raw === 'object') {
      for (const [id, item] of Object.entries(SHOP_ITEMS)) {
        const lv = Math.floor(Number(raw[id]) || 0);
        out[id] = Math.max(0, Math.min(item.maxLevel, lv));
      }
    }
    return out;
  }

  getDefaultProfile(username) {
    return {
      username: this.cleanAccountName(username),
      maxUnlockedStage: 1,
      unlockedUnits: ['DEN_DEN_MUSHI', 'MARINE_RIFLE'],
      stageStars: {},
      selectedDeck: ['DEN_DEN_MUSHI', 'MARINE_RIFLE'],
      goldBars: 0,
      maxDeckSlots: 7,
      shopUpgrades: this.getEmptyShopUpgrades(),
      updatedAt: Date.now()
    };
  }

  buildCurrentProfileSnapshot() {
    return {
      username: this.activeAccountName,
      maxUnlockedStage: this.maxUnlockedStage,
      unlockedUnits: [...this.unlockedUnits],
      stageStars: { ...this.stageStars },
      selectedDeck: [...this.selectedDeck],
      goldBars: this.goldBars,
      maxDeckSlots: this.maxDeckSlots,
      shopUpgrades: { ...this.shopUpgrades },
      updatedAt: Date.now()
    };
  }

  migrateUnitIds(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const rawId of list) {
      // V6: 'Bom Cherry' cũ được đổi thành Mìn Hải Lâu Thạch 25B (cùng ô số 4)
      const mapped = (rawId === 'CHERRY_BOMB') ? 'SEASTONE_MINE' : rawId;
      if (UNIT_TYPES[mapped] && !out.includes(mapped)) {
        out.push(mapped);
      }
    }
    return out;
  }

  applyProfileData(profile) {
    if (!profile) return;
    this.activeAccountName = this.cleanAccountName(profile.username);
    this.maxUnlockedStage = Math.min(STAGES.length, Math.max(1, Number(profile.maxUnlockedStage) || 1));
    const migratedUnlocked = this.migrateUnitIds(profile.unlockedUnits);
    this.unlockedUnits = migratedUnlocked.length > 0
      ? migratedUnlocked
      : ['DEN_DEN_MUSHI', 'MARINE_RIFLE'];
    this.stageStars = profile.stageStars && typeof profile.stageStars === 'object' ? { ...profile.stageStars } : {};
    this.goldBars = Math.max(0, Math.floor(Number(profile.goldBars) || 0));
    this.shopUpgrades = this.sanitizeShopUpgrades(profile.shopUpgrades);
    this.maxDeckSlots = Math.min(9, Math.max(7, 7 + this.shopUpgrades.EXTRA_SLOT, Math.floor(Number(profile.maxDeckSlots) || 7)));
    if (Array.isArray(profile.selectedDeck) && profile.selectedDeck.length > 0) {
      this.selectedDeck = this.migrateUnitIds(profile.selectedDeck)
        .filter(id => this.unlockedUnits.includes(id))
        .slice(0, this.maxDeckSlots);
      if (this.selectedDeck.length === 0) this.selectedDeck = ['DEN_DEN_MUSHI', 'MARINE_RIFLE'];
    }
    this.renderAccountModalList();
  }

  loadLocalProgress() {
    this.hasLocalProfiles = false;
    try {
      const rawV4 = localStorage.getItem(STORAGE_V4_KEY);
      if (rawV4) {
        const parsed = JSON.parse(rawV4);
        if (parsed && typeof parsed.profiles === 'object' && Object.keys(parsed.profiles).length > 0) {
          this.profilesMap = parsed.profiles;
          const activeKey = this.normalizeKey(parsed.activeAccount);
          const chosen = (activeKey && this.profilesMap[activeKey])
            ? this.profilesMap[activeKey]
            : Object.values(this.profilesMap)[0];
          if (chosen) {
            this.hasLocalProfiles = true;
            this.applyProfileData(chosen);
            this.syncStatusText = '💾 Đã nạp từ máy';
            return;
          }
        }
      }

      // Chuyển đổi dữ liệu cũ từ V2/V3 nếu có để không mất tiến độ người chơi cũ
      const legacyRaw = localStorage.getItem('op_pvz_v3_progress') || localStorage.getItem('op_pvz_v2_progress');
      if (legacyRaw) {
        const data = JSON.parse(legacyRaw);
        const migratedUnits = this.migrateUnitIds(data.unlockedUnits);
        const migrated = {
          username: DEFAULT_ACCOUNT_NAME,
          maxUnlockedStage: Math.min(STAGES.length, Math.max(1, data.maxUnlockedStage || 1)),
          unlockedUnits: migratedUnits.length > 0
            ? migratedUnits
            : ['DEN_DEN_MUSHI', 'MARINE_RIFLE'],
          stageStars: data.stageStars || {},
          selectedDeck: ['DEN_DEN_MUSHI', 'MARINE_RIFLE'],
          goldBars: 0,
          maxDeckSlots: 7,
          shopUpgrades: this.getEmptyShopUpgrades(),
          updatedAt: Date.now()
        };
        this.hasLocalProfiles = true;
        this.profilesMap[this.normalizeKey(DEFAULT_ACCOUNT_NAME)] = migrated;
        this.applyProfileData(migrated);
        this.persistLocalStore();
        return;
      }

      // Tài khoản mặc định lần đầu mở trên thiết bị/cổng mới (chưa chạm lưu gì)
      const fresh = this.getDefaultProfile(DEFAULT_ACCOUNT_NAME);
      fresh.updatedAt = 0;
      this.profilesMap[this.normalizeKey(fresh.username)] = fresh;
      this.applyProfileData(fresh);
    } catch (e) {
      console.warn('Local progress load failed', e);
    }
  }

  persistLocalStore() {
    try {
      const key = this.normalizeKey(this.activeAccountName);
      this.profilesMap[key] = this.buildCurrentProfileSnapshot();
      localStorage.setItem(STORAGE_V4_KEY, JSON.stringify({
        activeAccount: this.activeAccountName,
        profiles: this.profilesMap
      }));
      localStorage.setItem('op_pvz_v3_progress', JSON.stringify({
        maxUnlockedStage: this.maxUnlockedStage,
        unlockedUnits: this.unlockedUnits,
        stageStars: this.stageStars
      }));
    } catch (e) {
      console.warn('Local persist failed', e);
    }
  }

  saveProgress(forceOverwrite = false) {
    this.hasLocalProfiles = true;
    this.persistLocalStore();
    const snapshot = this.buildCurrentProfileSnapshot();
    this.pushProfileToServer(snapshot, true, forceOverwrite);
  }

  async pushProfileToServer(profile, setActive = true, forceOverwrite = false) {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, setActive, forceOverwrite })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.profiles) {
          this.profilesMap = { ...this.profilesMap, ...json.profiles };
        }
        this.syncStatusText = '☁️ Đã lưu trên máy chủ';
        this.renderAccountModalList();
      }
    } catch {
      this.syncStatusText = '💾 Đã lưu trên trình duyệt';
      this.renderAccountModalList();
    }
  }

  isMoreAdvancedProfile(a, b) {
    if (!b) return true;
    const stageA = Number(a.maxUnlockedStage || 1);
    const stageB = Number(b.maxUnlockedStage || 1);
    if (stageA !== stageB) return stageA > stageB;
    const unitsA = (a.unlockedUnits || []).length;
    const unitsB = (b.unlockedUnits || []).length;
    if (unitsA !== unitsB) return unitsA > unitsB;
    return Number(a.updatedAt || 0) >= Number(b.updatedAt || 0);
  }

  async syncProfilesWithServer() {
    try {
      const res = await fetch('/api/profiles', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.ok) return;

      const serverProfiles = data.profiles || {};
      const hasServerProfiles = Object.keys(serverProfiles).length > 0;

      // Nếu thiết bị/trình duyệt này chưa có save nào nhưng máy chủ đã có tài khoản:
      // tự động nhận thẳng danh sách & tài khoản đang chơi gần nhất trên máy chủ!
      if (!this.hasLocalProfiles && hasServerProfiles) {
        this.profilesMap = { ...serverProfiles };
        const serverLastKey = this.normalizeKey(data.lastActive);
        let chosen = (serverLastKey && this.profilesMap[serverLastKey]) ? this.profilesMap[serverLastKey] : null;
        if (!chosen) {
          chosen = Object.values(this.profilesMap).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
        }
        if (chosen) {
          this.applyProfileData(chosen);
          this.hasLocalProfiles = true;
          this.persistLocalStore();
        }
        this.syncStatusText = '☁️ Đồng bộ máy chủ OK';
        this.renderAccountModalList();
        return;
      }

      const merged = { ...this.profilesMap };
      for (const [k, sProf] of Object.entries(serverProfiles)) {
        if (!merged[k] || this.isMoreAdvancedProfile(sProf, merged[k])) {
          merged[k] = sProf;
        }
      }
      this.profilesMap = merged;

      const activeKey = this.normalizeKey(this.activeAccountName);
      if (merged[activeKey]) {
        this.applyProfileData(merged[activeKey]);
      }

      this.hasLocalProfiles = true;
      this.persistLocalStore();

      // Đẩy bản cục bộ lên máy chủ nếu máy chủ chưa có hoặc tiến độ trên máy này cao hơn
      const curr = this.profilesMap[activeKey];
      if (curr && (!serverProfiles[activeKey] || this.isMoreAdvancedProfile(curr, serverProfiles[activeKey]))) {
        await this.pushProfileToServer(curr, true, false);
      }

      this.syncStatusText = '☁️ Đồng bộ máy chủ OK';
      this.renderAccountModalList();
    } catch {
      this.syncStatusText = '💾 Chế độ lưu trình duyệt';
      this.renderAccountModalList();
    }
  }

  switchOrCreateAccount(rawName) {
    const cleanName = this.cleanAccountName(rawName);
    const key = this.normalizeKey(cleanName);

    // Lưu tài khoản hiện tại trước khi chuyển
    this.persistLocalStore();

    if (this.profilesMap[key]) {
      this.applyProfileData(this.profilesMap[key]);
    } else {
      const fresh = this.getDefaultProfile(cleanName);
      this.profilesMap[key] = fresh;
      this.applyProfileData(fresh);
    }

    this.saveProgress(true);
    this.audio.playPlant();
    this.renderAccountModalList();
  }

  saveCurrentProgressAsAccount(rawName) {
    const cleanName = this.cleanAccountName(rawName);
    const key = this.normalizeKey(cleanName);
    this.activeAccountName = cleanName;
    const snap = this.buildCurrentProfileSnapshot();
    this.profilesMap[key] = snap;
    this.saveProgress(true);
    this.audio.playBeli();
    this.renderAccountModalList();
  }

  async deleteAccount(name) {
    const key = this.normalizeKey(name);
    const entries = Object.values(this.profilesMap);
    if (entries.length <= 1 && key === this.normalizeKey(this.activeAccountName)) {
      this.resetProgress(true);
      this.renderAccountModalList();
      return;
    }

    delete this.profilesMap[key];
    if (key === this.normalizeKey(this.activeAccountName)) {
      const nextProf = Object.values(this.profilesMap)[0] || this.getDefaultProfile(DEFAULT_ACCOUNT_NAME);
      this.profilesMap[this.normalizeKey(nextProf.username)] = nextProf;
      this.applyProfileData(nextProf);
    }
    this.persistLocalStore();

    try {
      await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name })
      });
    } catch {
      // Bỏ qua lỗi mạng nếu chạy offline
    }
    this.renderAccountModalList();
  }

  resetProgress(skipConfirm = false) {
    if (!skipConfirm && typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const ok = window.confirm(`Bạn có chắc muốn xóa tiến độ của tài khoản "${this.activeAccountName}" để chơi lại từ Màn 1?`);
      if (!ok) return;
    }
    this.maxUnlockedStage = 1;
    this.unlockedUnits = ['DEN_DEN_MUSHI', 'MARINE_RIFLE'];
    this.stageStars = {};
    this.selectedDeck = ['DEN_DEN_MUSHI', 'MARINE_RIFLE'];
    this.goldBars = 0;
    this.shopUpgrades = this.getEmptyShopUpgrades();
    this.maxDeckSlots = 7;
    this.saveProgress(true);
  }

  bindAccountModalUI() {
    if (typeof document === 'undefined') return;
    this.accountModalEl = document.getElementById('accountModal');
    this.accountFormEl = document.getElementById('accountForm');
    this.accountInputEl = document.getElementById('accountNameInput');
    this.accountListEl = document.getElementById('accountList');
    this.currentAccLabelEl = document.getElementById('currentAccLabel');
    this.accSyncStatusEl = document.getElementById('accSyncStatus');
    const closeBtn = document.getElementById('closeAccountModalBtn');
    const saveAsBtn = document.getElementById('saveCurrentAsBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeAccountModal());
    }
    if (this.accountModalEl) {
      this.accountModalEl.addEventListener('click', (e) => {
        if (e.target === this.accountModalEl) this.closeAccountModal();
      });
    }
    if (this.accountFormEl) {
      this.accountFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = this.accountInputEl ? this.accountInputEl.value : '';
        if (val.trim()) {
          this.switchOrCreateAccount(val);
          if (this.accountInputEl) this.accountInputEl.value = '';
        }
      });
    }
    if (saveAsBtn) {
      saveAsBtn.addEventListener('click', () => {
        const val = this.accountInputEl ? this.accountInputEl.value : '';
        if (val.trim()) {
          this.saveCurrentProgressAsAccount(val);
          if (this.accountInputEl) this.accountInputEl.value = '';
        }
      });
    }
    this.renderAccountModalList();
  }

  openAccountModal() {
    this.renderAccountModalList();
    if (this.accountModalEl) {
      this.accountModalEl.classList.remove('hidden');
      if (this.accountInputEl) {
        this.accountInputEl.value = '';
      }
    }
  }

  closeAccountModal() {
    if (this.accountModalEl) {
      this.accountModalEl.classList.add('hidden');
    }
  }

  renderAccountModalList() {
    if (!this.accountListEl) return;
    if (this.currentAccLabelEl) {
      this.currentAccLabelEl.textContent = `${this.activeAccountName} (Màn ${this.maxUnlockedStage}/${STAGES.length})`;
    }
    if (this.accSyncStatusEl) {
      this.accSyncStatusEl.textContent = this.syncStatusText;
    }

    const totalUnits = Object.keys(UNIT_TYPES).length;
    const profiles = Object.values(this.profilesMap || {}).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    this.accountListEl.innerHTML = '';

    for (const prof of profiles) {
      const isCurrent = this.normalizeKey(prof.username) === this.normalizeKey(this.activeAccountName);
      const item = document.createElement('div');
      item.className = `acc-item${isCurrent ? ' active' : ''}`;

      const info = document.createElement('div');
      info.className = 'acc-item-info';

      const nameEl = document.createElement('div');
      nameEl.className = 'acc-item-name';
      nameEl.textContent = `${isCurrent ? '⭐ ' : '👤 '}${prof.username}`;

      const metaEl = document.createElement('div');
      metaEl.className = 'acc-item-meta';
      const uCount = (prof.unlockedUnits || []).length;
      metaEl.textContent = `Màn ${prof.maxUnlockedStage || 1}/${STAGES.length} • ${uCount}/${totalUnits} Binh chủng`;

      info.appendChild(nameEl);
      info.appendChild(metaEl);

      const actions = document.createElement('div');
      actions.className = 'acc-item-actions';

      const useBtn = document.createElement('button');
      useBtn.type = 'button';
      useBtn.className = 'btn-use';
      useBtn.textContent = isCurrent ? 'Đang chơi' : 'Chọn';
      if (!isCurrent) {
        useBtn.addEventListener('click', () => {
          this.switchOrCreateAccount(prof.username);
          this.closeAccountModal();
        });
      }

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-del';
      delBtn.textContent = '🗑️';
      delBtn.title = 'Xóa tài khoản này';
      delBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
          if (!window.confirm(`Xóa tài khoản "${prof.username}"?`)) return;
        }
        this.deleteAccount(prof.username);
      });

      actions.appendChild(useBtn);
      actions.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(actions);
      this.accountListEl.appendChild(item);
    }
  }

  // =========================================================================
  // QUẢN LÝ MÀN CHƠI & CHIẾN TRƯỜNG PHỐI CẢNH
  // =========================================================================

  resetWarships(lockedRows = []) {
    this.warships = [];
    for (let r = 0; r < 5; r++) {
      if (!lockedRows.includes(r)) {
        this.warships.push(new Warship(r, this.grid));
      }
    }
  }

  goToScreen(newScreen) {
    this.screen = newScreen;
    this.hoveredCell = null;
    this.isDraggingVolume = false;

    this.screenShakeTime = 0;
    this.screenShakeMagnitude = 0;

    if (newScreen === 'PLAYING') {
      this.audio.startBGM();
    } else if (['TITLE', 'STAGE_SELECT', 'LOOT_DROP', 'VICTORY', 'GAME_OVER', 'GOLD_SHOP'].includes(newScreen)) {
      this.audio.stopBGM();
    }
  }

  startStage(stageIdx) {
    this.currentStageIndex = stageIdx;
    this.currentStage = STAGES[stageIdx];

    this.grid.clear();
    this.grid.setTheme(this.currentStage.theme);
    const locked = this.currentStage.lockedRows || [];
    this.grid.setLockedRows(locked);
    this.resetWarships(locked);

    this.pirates = [];
  // Thêm 2 dòng này vào ngay dưới để tạo hàng đợi:
    this.pendingSpawns = []; 
    this.spawnTimer = 0;

    this.projectiles = [];
    this.beliCoins = [];
    this.goldDrops = [];
    this.goldEarnedThisStage = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.lootCard = null;
    this.rewardUnitDef = null;
    this.skillCutIn = null;

    this.buildPreviewPirates();

    if (this.unlockedUnits.length <= this.maxDeckSlots) {
      this.selectedDeck = [...this.unlockedUnits];
    } else {
      const others = this.unlockedUnits.filter(id => id !== 'DEN_DEN_MUSHI');
      this.selectedDeck = ['DEN_DEN_MUSHI', ...others.slice(-(this.maxDeckSlots - 1))];
    }

    this.cameraX = 0;
    this.introWaitTimer = 0;
    this.goToScreen('INTRO_PAN');
  }

  buildPreviewPirates() {
    this.previewPirates = [];
    const enemySet = new Set();
    this.currentStage.waves.forEach(w => w.spawns.forEach(s => enemySet.add(s.type)));
    const types = Array.from(enemySet);
    const activeRows = [0, 1, 2, 3, 4].filter(r => !(this.currentStage.lockedRows || []).includes(r));

    for (let i = 0; i < Math.max(5, types.length * 2); i++) {
      const pType = types[i % types.length];
      const row = activeRows[i % activeRows.length];
      const startCol = 9.45 + (i % 3) * 0.65 + Math.random() * 0.25;
      const p = new Pirate(pType, row, startCol, this.grid);
      p.state = 'IDLE_PREVIEW';
      this.previewPirates.push(p);
    }
  }

  beginBattleFromDeckChooser() {
    if (this.selectedDeck.length === 0) return;
    this.saveProgress();
    this.audio.playPlant();
    this.goToScreen('PAN_BACK');
  }

  initializeBattleSession() {
    this.grid.clear();
    this.grid.setTheme(this.currentStage.theme);
    const locked = this.currentStage.lockedRows || [];
    this.grid.setLockedRows(locked);
    this.resetWarships(locked);

    this.pirates = [];
    // Thêm 2 dòng này vào ngay dưới để tạo hàng đợi:
    this.pendingSpawns = []; 
    this.spawnTimer = 0;

    this.projectiles = [];
    this.beliCoins = [];
    this.goldDrops = [];
    this.goldEarnedThisStage = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.lootCard = null;
    this.skillCutIn = null;
    this.audio.stopBGM(); // Reset nhạc nền về bản thường khi vào trận mới
    this.supportCd = { ICE: 12, MAGMA: 16 };
    this.sinceLastWave = 0;
    this.isWaitingForClear = false;

    this.beli = this.currentStage.initialBeli || 175;
    this.skyBeliTimer = ECONOMY_CONFIG.skyBeliFirstDelay;
    this.selectedCardId = null;
    this.isShovelActive = false;
    this.unitCooldowns = {};
    this.gameSpeed = 1;

    this.waveIndex = 0;
    this.waveTimer = this.currentStage.waves[0] ? this.currentStage.waves[0].delay : 16;
    this.totalWaves = this.currentStage.waves.length;
    this.hugeWaveAlertTimer = 0;
    this.isFinalWaveBanner = false;

    this.readyTimer = 0;
    this.goToScreen('READY_SET_PLANT');
  }

  // =========================================================================
  // VÒNG LẶP CẬP NHẬT
  // =========================================================================
  update(dt) {
    this.globalTime += dt;

    if (this.screen === 'INTRO_PAN') {
      this.previewPirates.forEach(p => p.updateIdle(dt, this.grid));
      if (this.cameraX < 260) {
        this.cameraX = Math.min(260, this.cameraX + 360 * dt);
      } else {
        this.introWaitTimer += dt;
        if (this.currentStage.id === 1 && this.unlockedUnits.length <= 2) {
          if (this.introWaitTimer >= 1.1) {
            this.goToScreen('PAN_BACK');
          }
        } else {
          this.goToScreen('DECK_CHOOSER');
        }
      }
      return;
    }

    if (this.screen === 'DECK_CHOOSER') {
      this.previewPirates.forEach(p => p.updateIdle(dt, this.grid));
      return;
    }

    if (this.screen === 'PAN_BACK') {
      this.previewPirates.forEach(p => p.updateIdle(dt, this.grid));
      if (this.cameraX > 0) {
        this.cameraX = Math.max(0, this.cameraX - 440 * dt);
      } else {
        this.initializeBattleSession();
      }
      return;
    }

    if (this.screen === 'READY_SET_PLANT') {
      this.readyTimer += dt;
      if (this.readyTimer >= 1.95) {
        this.goToScreen('PLAYING');
      }
      return;
    }

    if (this.screen === 'LOOT_DROP') {
      this.updateParticlesAndText(dt);
      this.updateLootCard(dt);
      return;
    }

    if (this.screen !== 'PLAYING') return;

    const steps = this.gameSpeed === 2 ? 2 : 1;
    for (let s = 0; s < steps; s++) {
      this.updatePlayingStep(dt);
      if (this.screen !== 'PLAYING') break;
    }
  }

  updatePlayingStep(dt) {
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
      if (this.screenShakeTime <= 0) this.screenShakeMagnitude = 0;
    }

    if (this.hugeWaveAlertTimer > 0) {
      this.hugeWaveAlertTimer -= dt;
    }

    if (this.skillCutIn) {
      this.skillCutIn.timer -= dt;
      if (this.skillCutIn.timer <= 0) {
        this.skillCutIn = null;
      }
    }

    for (const key in this.unitCooldowns) {
      if (this.unitCooldowns[key] > 0) {
        this.unitCooldowns[key] = Math.max(0, this.unitCooldowns[key] - dt);
      }
    }
    for (const key in this.supportCd) {
      if (this.supportCd[key] > 0) {
        this.supportCd[key] = Math.max(0, this.supportCd[key] - dt);
      }
    }

    // Vàng Khối rơi trên sân: cập nhật, tự thu nếu hết hạn (không bao giờ mất vàng)
    for (let i = this.goldDrops.length - 1; i >= 0; i--) {
      const bar = this.goldDrops[i];
      bar.update(dt);
      if (bar.expireRequested && !bar.isCollected) {
        this.collectGoldBar(bar, true);
      }
      if (bar.isExpired) {
        this.goldDrops.splice(i, 1);
      }
    }

    // Lưu Vàng định kỳ (tránh ghi liên tục)
    if (this.goldDirty) {
      this.goldSaveTimer -= dt;
      if (this.goldSaveTimer <= 0) {
        this.goldDirty = false;
        this.saveProgress();
      }
    }

    // Tiền Beli rơi từ trời xuống chuẩn theo vùng đất của hàng
    this.skyBeliTimer -= dt;
    if (this.skyBeliTimer <= 0) {
      this.skyBeliTimer = ECONOMY_CONFIG.skyBeliMinInterval + Math.random() * ECONOMY_CONFIG.skyBeliRandomExtra;
      const activeRows = [0, 1, 2, 3, 4].filter(r => !this.grid.isRowLocked(r));
      const targetRow = activeRows[Math.floor(Math.random() * activeRows.length)];
      const randCol = 0.6 + Math.random() * 7.8;
      const dropPt = this.grid.gridToPixel(randCol, targetRow + 0.55);
      this.beliCoins.push(new BeliCoin(dropPt.x, -20, dropPt.y + 8, true, ECONOMY_CONFIG.skyBeliValue));
    }

    for (let i = this.beliCoins.length - 1; i >= 0; i--) {
      this.beliCoins[i].update(dt);
      if (this.beliCoins[i].isExpired) {
        this.beliCoins.splice(i, 1);
      }
    }

    // Cập nhật lính Hải Quân
    const allUnits = this.grid.getAllUnits();
    for (const unit of allUnits) {
      const piratesInRow = this.pirates.filter(p => p.row === unit.row && !p.isDead && !p.isDying);
      unit.update(dt, piratesInRow, (action, payload) => this.handleUnitAction(action, payload), this.pirates, this.autoSkill);
      if (unit.isDead) {
        this.grid.removeUnit(unit.col, unit.row);
      }
    }

    // Mìn Hải Lâu Thạch đã nạp xong: hải tặc dẫm vào là nổ
    for (const unit of this.grid.getAllUnits()) {
      if (unit.type === 'SEASTONE_MINE' && unit.isArmed && !unit.isDead) {
        const trigger = this.pirates.find(p =>
          p.row === unit.row && !p.isDead && !p.isDying && p.state !== 'VAULTING' &&
          p.colPos <= unit.col + 1.22 && p.colPos >= unit.col - 0.2
        );
        if (trigger) this.detonateMine(unit);
      }
    }

    // Cập nhật đạn
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const rowPirates = this.pirates.filter(p => p.row === proj.row && !p.isDead && !p.isDying);
      proj.update(dt, rowPirates, (action, payload) => {
        if (action === 'PROJECTILE_HIT') {
          if (payload.isCannonball) {
            this.audio.playCannon();
          } else {
            this.audio.playGunshot();
          }
          this.spawnHitSparks(payload.x, payload.y, payload.kind);
          const color = payload.isIce ? '#00d2ff'
            : payload.kind === 'slash' ? '#00e676'
            : payload.kind === 'magma' ? '#ff6b6b'
            : payload.kind === 'cannonball' ? '#ff9f43'
            : payload.kind === 'sand' ? '#fbc531'
            : '#f1c40f';
          const suffix = payload.isIce ? ' ❄️' : payload.isMagma ? ' 🔥' : payload.isCannonball ? ' 💥' : '';
          this.floatingTexts.push(new FloatingText(`-${payload.damage}${suffix}`, payload.x, payload.y - 20, color, payload.isCannonball ? 16 : 14));
          if (payload.isMagma) {
            this.particles.push(new ShockwaveRing(payload.x, payload.y, 75, '#ff4757', 0.35));
          } else if (payload.isCannonball) {
            this.particles.push(new ShockwaveRing(payload.x, payload.y, 82, '#ff9f43', 0.36));
          }
        }
      }, this.grid, this.pirates);
      if (proj.isDestroyed) {
        this.projectiles.splice(i, 1);
      }
    }

    // Cập nhật Hải Tặc
    for (let i = this.pirates.length - 1; i >= 0; i--) {
      const pirate = this.pirates[i];
      const wasDying = pirate.isDying;
      pirate.update(dt, this.grid, (action, payload) => this.handlePirateAction(action, payload));

      if (!wasDying && pirate.isDying) {
        const deathPt = this.grid.gridToPixel(pirate.colPos, pirate.row + 0.5);
        this.spawnPirateDeathSparks(deathPt.x, deathPt.y);
        this.maybeDropGold(pirate);
      }

      // Kiểm tra Hải Tặc vượt qua bờ cảng bên trái
      if (pirate.colPos <= -0.35 && !pirate.isDead && !pirate.isDying) {
        const ws = this.warships.find(w => w.row === pirate.row);
        if (!ws || ws.isDone) {
          this.triggerGameOver();
          return;
        }
      }

      if (pirate.isDead) {
        const deathX = pirate.x;
        const deathRow = pirate.row;
        this.pirates.splice(i, 1);

        if (this.waveIndex >= this.totalWaves && this.pirates.length === 0) {
          this.triggerFinalPirateLootDrop(deathX, deathRow);
          return;
        }
      }
    }

    // Cập nhật Chiến Hạm Buster Call
    for (const ws of this.warships) {
      const rowPirates = this.pirates.filter(p => p.row === ws.row && !p.isDead && !p.isDying);
      ws.update(dt, rowPirates, (action) => {
        if (action === 'WARSHIP_TRIGGERED') {
          this.audio.playWarship();
          this.triggerScreenShake(0.35, 6);
        }
      }, this.grid);
    }

    // XỬ LÝ HÀNG ĐỢI: THẢ TỪ TỪ HẢI TẶC RA SÂN
    if (this.pendingSpawns.length > 0) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            let maxInterval = 0;
            
            // Đọc xem đợt này cho phép thả mấy con 1 lúc (mặc định là 1)
            const countToSpawn = Math.min(this.currentConcurrent || 1, this.pendingSpawns.length);
            
            // Dùng vòng lặp for để thả cùng lúc 1 hoặc 2 con (tùy cấu hình)
            for (let i = 0; i < countToSpawn; i++) {
                const nextP = this.pendingSpawns.shift();
                
                const activeRows = [0, 1, 2, 3, 4].filter(r => !this.grid.isRowLocked(r));
                let row = activeRows[Math.floor(Math.random() * activeRows.length)];
                
                // Cơ chế chống dồn cục (Anti-Clumping) sẽ ép con thứ 2 đi đường khác con thứ 1
                if (activeRows.length > 1 && row === this.lastSpawnRow) {
                    const otherRows = activeRows.filter(r => r !== this.lastSpawnRow);
                    row = otherRows[Math.floor(Math.random() * otherRows.length)];
                }
                
                this.lastSpawnRow = row; 
                const startCol = 9.35 + Math.random() * 0.4;
                
                this.pirates.push(new Pirate(nextP.type, row, startCol, this.grid));
                
                // Tìm thời gian đếm ngược lớn nhất trong nhóm vừa ra
                maxInterval = Math.max(maxInterval, nextP.interval);
            }
            
            if (this.pendingSpawns.length > 0) {
                // Game sẽ chờ theo khoảng thời gian của tên cầm đồng hồ lâu nhất
                this.spawnTimer = maxInterval;
            }
        }
    }

    this.updateParticlesAndText(dt);
    this.updateWaves(dt);
  }

  updateParticlesAndText(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].update(dt)) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      if (!this.floatingTexts[i].update(dt)) this.floatingTexts.splice(i, 1);
    }
  }

  updateWaves(dt) {
    if (this.waveIndex >= this.totalWaves) return;

    this.isWaitingForClear = false;
    if (this.waveIndex >= 1) {
      this.sinceLastWave += dt;
      // Cộng thêm số lượng quái đang đứng chờ trong hàng đợi
      const alive = this.pirates.filter(p => !p.isDead && !p.isDying).length + this.pendingSpawns.length;
      const cleared = alive <= (ECONOMY_CONFIG.nextWaveMaxAlive ?? 1);
      const forced = this.sinceLastWave >= (ECONOMY_CONFIG.nextWaveForceAfter ?? 80);
      if (!cleared && !forced) {
        this.isWaitingForClear = true;
        return;
      }
    }

    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      const wave = this.currentStage.waves[this.waveIndex];
      const isFinalWave = (this.waveIndex === this.totalWaves - 1);

      if (wave) {
        if (wave.isHugeWave || isFinalWave) {
          this.hugeWaveAlertTimer = 3.5;
          this.isFinalWaveBanner = isFinalWave;
          this.audio.playHugeWave(isFinalWave);
          if (isFinalWave) this.audio.startFinalWaveBGM();
          this.triggerScreenShake(isFinalWave ? 1.1 : 0.75, isFinalWave ? 9 : 7);
        }
        // [THÊM DÒNG NÀY]: Đọc cấu hình thả mấy con cùng 1 lúc (nếu không ghi thì mặc định là 1)
        this.currentConcurrent = wave.concurrentSpawns || 1;

        // THUẬT TOÁN NẠP & XÁO TRỘN HÀNG ĐỢI THÔNG MINH
        let tempSpawns = [];
        
        // 1. Lấy toàn bộ số lượng hải tặc cấu hình trong đợt này đổ vào mảng tạm
        for (const spawn of wave.spawns) {
          for (let c = 0; c < spawn.count; c++) {
            tempSpawns.push({
              type: spawn.type,
              interval: spawn.spawnInterval || 3.0 // Độ trễ chờ con tiếp theo ra
            });
          }
        }

        let firstSpawns = [];
        // 2. Tìm và rút tối đa 2 tên Tân Binh (PIRATE_GRUNT) xếp lên đầu hàng
        for (let i = tempSpawns.length - 1; i >= 0; i--) {
          if (tempSpawns[i].type === 'PIRATE_GRUNT' && firstSpawns.length < 2) {
            firstSpawns.push(tempSpawns.splice(i, 1)[0]);
          }
        }

        // 3. Xáo trộn hoàn toàn ngẫu nhiên (Shuffle) số hải tặc còn lại
        for (let i = tempSpawns.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [tempSpawns[i], tempSpawns[j]] = [tempSpawns[j], tempSpawns[i]];
        }

        // 4. Ghép hàng đợi: [1-2 Tân Binh xếp trước] + [Đám còn lại đã xáo trộn ngẫu nhiên]
        this.pendingSpawns = firstSpawns.concat(tempSpawns);

        // Gọi con đầu tiên ra ngay lập tức
        if (this.pendingSpawns.length > 0) this.spawnTimer = 0;
      }

      this.waveIndex++;
      this.sinceLastWave = 0;
      if (this.waveIndex < this.totalWaves) {
        this.waveTimer = this.currentStage.waves[this.waveIndex].delay;
      }
    }
  }

  // --- VÀNG KHỐI ---
  maybeDropGold(pirate) {
    // 1. Tính tổng lượng máu (Máu gốc + Giáp) để đoạt định độ "mạnh"
    const totalHp = (pirate.maxHp || 0) + (pirate.maxArmorHp || 0);
    const isBoss = !!(pirate.def && pirate.def.isBoss);

    // 2. Tính tỷ lệ rơi (Chance): Tối thiểu 12% (0.12). Lính càng nhiều máu tỷ lệ càng tăng lên.
    // Ví dụ: 
    // - Lính Tân binh (200 HP) -> Tỷ lệ ~ 22%
    // - Thùng gỗ (380 HP) -> Tỷ lệ ~ 31%
    // - Giáp sắt (600 HP) -> Tỷ lệ ~ 42%
    let chance = 0.12 + (totalHp / 2000); 
    
    // Cố định Boss (hoặc lính có HP > 1800) luôn rớt vàng 100%
    chance = isBoss ? 1.0 : Math.min(1.0, chance);

    // Bốc random, nếu số bốc được lớn hơn tỷ lệ thì không rơi vàng
    if (Math.random() >= chance) return;

    // 3. Quy định số vàng rơi ra: Lính mạnh không chỉ dễ rớt mà còn rớt nhiều vàng
    let value = 1; // Mặc định rớt 1 khối
    if (totalHp >= 1500 || isBoss) {
        value = ECONOMY_CONFIG.bossGoldBarValue ?? 3; // Boss khủng rớt 3 khối
    } else if (totalHp >= 500) {
        value = 2; // Bọn trâu bò (như Giáp Sắt, Marco) rớt 2 khối
    }

    // 4. Khởi tạo cục vàng rớt xuống đất
    const pt = this.grid.gridToPixel(Math.max(0.3, Math.min(9.2, pirate.colPos)), pirate.row + 0.5);
    const ground = this.grid.gridToPixel(Math.max(0.3, Math.min(9.2, pirate.colPos)), pirate.row + 0.85);
    const x = Math.max(60, Math.min(1000, pt.x));
    
    this.goldDrops.push(new GoldBar(x, pt.y - 10, ground.y, value));
    this.audio.playGoldDrop();
}

  collectGoldBar(bar, isAuto = false) {
    if (!bar.collect()) return false;
    this.goldBars += bar.value;
    this.goldEarnedThisStage += bar.value;
    this.goldDirty = true;
    this.goldSaveTimer = 3.0;
    this.audio.playGoldCollect();
    this.floatingTexts.push(new FloatingText(`+${bar.value} 🪙 VÀNG`, bar.x, bar.y - 18, '#ffe066', 17));
    return true;
  }

  /** Thu toàn bộ Vàng Khối còn nằm trên sân (khi hết màn / thua) để người chơi không bao giờ mất vàng */
  collectAllGoldDrops() {
    for (const bar of this.goldDrops) {
      if (!bar.isCollected && !bar.isExpired) {
        bar.isCollected = true;
        this.goldBars += bar.value;
        this.goldEarnedThisStage += bar.value;
      }
    }
    this.goldDrops = [];
    this.goldDirty = false;
  }

  // --- RỚT THẺ CHIÊU MỘ TỪ TÊN HẢI TẶC CUỐI CÙNG ---
  triggerFinalPirateLootDrop(deathX, deathRow) {
    this.audio.stopBGM();
    this.audio.playBeli();
    this.collectAllGoldDrops();

    const clampedX = Math.max(220, Math.min(860, deathX));
    const groundY = this.grid.getRowCenterY(deathRow);

    const rewardKey = this.currentStage.rewardUnit;
    const isNewUnlock = rewardKey && !this.unlockedUnits.includes(rewardKey);
    if (isNewUnlock) {
      this.unlockedUnits.push(rewardKey);
      this.rewardUnitDef = UNIT_TYPES[rewardKey];
    } else {
      this.rewardUnitDef = rewardKey ? UNIT_TYPES[rewardKey] : null;
    }

    const nextStageNum = this.currentStage.id + 1;
    if (nextStageNum <= STAGES.length && nextStageNum > this.maxUnlockedStage) {
      this.maxUnlockedStage = nextStageNum;
    }
    this.stageStars[this.currentStage.id] = 3;
    this.saveProgress();

    this.lootCard = {
      x: clampedX,
      y: groundY - 25,
      vx: -35,
      vy: -240,
      groundY: groundY,
      unitId: rewardKey,
      isCollecting: false,
      collectTimer: 0,
      startX: clampedX,
      startY: groundY,
      pulseTime: 0
    };

    this.particles.push(new ShockwaveRing(clampedX, groundY, 120, '#f1c40f', 0.6));
    this.goToScreen('LOOT_DROP');
  }

  updateLootCard(dt) {
    if (!this.lootCard) return;
    const card = this.lootCard;
    card.pulseTime += dt;

    if (!card.isCollecting) {
      if (card.y < card.groundY || card.vy < 0) {
        card.x += card.vx * dt;
        card.y += card.vy * dt;
        card.vy += 680 * dt;
        if (card.y >= card.groundY) {
          card.y = card.groundY;
          if (Math.abs(card.vy) > 90) {
            card.vy = -card.vy * 0.35;
          } else {
            card.vy = 0;
            card.vx = 0;
          }
        }
      }
    } else {
      card.collectTimer += dt * 1.65;
      const t = Math.min(1.0, card.collectTimer);
      const ease = 1 - Math.pow(1 - t, 3);
      card.x = card.startX + (534 - card.startX) * ease;
      card.y = card.startY + (285 - card.startY) * ease;

      if (t >= 1.0) {
        this.goToScreen('VICTORY');
      }
    }
  }

  // --- SỰ KIỆN CỦA LÍNH, SKILL & HẢI TẶC ---
  handleUnitAction(action, payload) {
    if (action === 'PRODUCE_BELI') {
      const { centerX, centerY } = this.grid.cellToPixel(payload.col, payload.row);
      const val = payload.amount || 25;
      this.beliCoins.push(new BeliCoin(centerX - 10, centerY - 6, centerY + 18, false, val));
      this.audio.playBeli();
      this.particles.push(new ShockwaveRing(centerX, centerY, 45, '#f1c40f', 0.35));
    } else if (action === 'SHOOT_PROJECTILE') {
      this.projectiles.push(
        new Projectile(
          payload.unit.col + 0.72,
          payload.unit.row,
          payload.kind || (payload.isIce ? 'ice' : 'lead'),
          payload.damage || 20,
          payload.opts || {}
        )
      );
      this.audio.playGunshot();
    } else if (action === 'MINE_ARMED') {
      const { centerX, centerY } = this.grid.cellToPixel(payload.col, payload.row);
      this.audio.playPlant();
      this.particles.push(new ShockwaveRing(centerX, centerY, 52, '#ff4757', 0.4));
      this.floatingTexts.push(new FloatingText('💣 MÌN SẴN SÀNG!', centerX, centerY - 40, '#ff6b81', 14));
    } else if (action === 'DETONATE_CHERRY_BOMB' || action === 'DETONATE_BUSTER') {
      this.audio.playCannon();
      this.triggerScreenShake(0.65, 13);
      const c = payload.col;
      const r = payload.row;
      const dmg = payload.damage ?? 1800;
      const radCols = payload.radiusCols ?? 1;
      const { centerX, centerY } = this.grid.cellToPixel(c, r);

      this.particles.push(new ShockwaveRing(centerX, centerY, 185, '#ff2e43', 0.55));
      this.particles.push(new ShockwaveRing(centerX, centerY, 135, '#f1c40f', 0.42));
      for (let i = 0; i < 42; i++) {
        this.particles.push(new ExplosionSpark(centerX, centerY, i % 2 === 0 ? '#ff2e43' : '#f1c40f'));
      }
      this.floatingTexts.push(new FloatingText('💥 BOM ĐÔI BÙM! 💥', centerX, centerY - 22, '#ff4757', 22));

      for (const p of this.pirates) {
        if (!p.isDead && !p.isDying && Math.abs(p.row - r) <= radCols) {
          if (Math.abs(p.colPos - (c + 0.5)) <= radCols + 0.65) {
            p.takeDamage(dmg, { ignoreArmor: true });
          }
        }
      }
    } else if (action === 'HERO_SKILL') {
      this.executeHeroSkill(payload.unit);
    }
  }

  /** Mìn Hải Lâu Thạch nổ: sát thương xuyên giáp lên hải tặc cùng hàng quanh mìn */
  detonateMine(unit) {
    if (unit.isDead) return;
    unit.isDead = true;
    const def = unit.typeDef;
    const dmg = Math.round((def.damage ?? 1800) * unit.damageMul);
    const radius = def.blastRadiusCols ?? 0.9;
    const center = unit.col + 0.7;
    this.grid.removeUnit(unit.col, unit.row);
    this.detachPiratesFromUnit(unit);

    for (const p of this.pirates) {
      if (p.row === unit.row && !p.isDead && !p.isDying && Math.abs(p.colPos - center) <= radius + 0.6) {
        p.takeDamage(dmg, { ignoreArmor: true });
      }
    }
    this.handlePirateAction('MINE_EXPLODE', { col: unit.col, row: unit.row, damage: dmg });
  }

  /** Kỹ năng cứu viện Đô Đốc mua ở Shop Vàng (nút trên HUD khi đang chiến đấu) */
  castSupportSkill(kind) {
    const itemId = kind === 'ICE' ? 'ADMIRAL_SKILL_ICE' : 'ADMIRAL_SKILL_MAGMA';
    const item = SHOP_ITEMS[itemId];
    if (!this.shopUpgrades[itemId] || this.supportCd[kind] > 0) return;

    this.supportCd[kind] = item.cooldown;
    const goldLv = this.shopUpgrades.DF_GOLD_ADMIRAL || 0;
    const mul = 1 + SHOP_ITEMS.DF_GOLD_ADMIRAL.skillDamagePerLevel * goldLv;
    const dmg = Math.round(item.damage * mul);

    if (kind === 'ICE') {
      this.skillCutIn = { unitId: 'AOKIJI_ICE', title: 'CỨU VIỆN AOKIJI: KỶ BĂNG HÀ TOÀN CẢNH!', color: '#00d2ff', timer: 1.5, maxTimer: 1.5 };
      this.audio.playSkillCast('ice');
      this.triggerScreenShake(0.5, 7);
      for (let r = 0; r < 5; r++) {
        if (!this.grid.isRowLocked(r)) this.particles.push(new IceAgeCrystal(r));
      }
      for (const p of this.pirates) {
        if (!p.isDead && !p.isDying && p.colPos <= 9.65) {
          p.takeDamage(dmg, { freezeTime: item.freezeTime, isIce: true });
          const pt = this.grid.gridToPixel(p.colPos, p.row + 0.45);
          this.floatingTexts.push(new FloatingText(`-${dmg} 🧊`, pt.x, pt.y - 24, '#00e5ff', 16));
        }
      }
    } else {
      this.skillCutIn = { unitId: 'AKAINU', title: 'CỨU VIỆN AKAINU: MƯA THIÊN THẠCH!', color: '#ff4757', timer: 1.5, maxTimer: 1.5 };
      this.audio.playSkillCast('magma');
      this.triggerScreenShake(0.6, 10);
      const alive = this.pirates.filter(p => !p.isDead && !p.isDying && p.colPos <= 9.65);
      for (let i = 0; i < item.meteorCount; i++) {
        const target = alive.length > 0 ? alive[i % alive.length] : null;
        let tx, ty;
        if (target) {
          const tp = this.grid.gridToPixel(Math.max(0.4, target.colPos), target.row + 0.5);
          tx = tp.x + (Math.random() - 0.5) * 40;
          ty = tp.y;
        } else {
          const fp = this.grid.gridToPixel(2.5 + (i % 5) * 1.4, (i % 5) + 0.5);
          tx = fp.x;
          ty = fp.y;
        }
        this.particles.push(new MagmaMeteor(tx, ty, i * 0.14, (mx, my) => {
          this.audio.playCannon();
          this.triggerScreenShake(0.25, 6);
          this.particles.push(new ShockwaveRing(mx, my, 95, '#ff4757', 0.4));
          for (let k = 0; k < 12; k++) {
            this.particles.push(new ExplosionSpark(mx, my, k % 2 === 0 ? '#ff4757' : '#ffa502'));
          }
          for (const p of this.pirates) {
            if (!p.isDead && !p.isDying) {
              const pPt = this.grid.gridToPixel(p.colPos, p.row + 0.5);
              if (Math.hypot(pPt.x - mx, pPt.y - my) <= 95) {
                p.takeDamage(dmg, { burnTime: 4.0, ignoreArmor: true });
                this.floatingTexts.push(new FloatingText(`-${dmg} 🌋`, pPt.x, pPt.y - 24, '#ffa502', 15));
              }
            }
          }
        }));
      }
    }
  }

  executeHeroSkill(unit) {
    const { centerX, centerY } = this.grid.cellToPixel(unit.col, unit.row);
    const def = unit.typeDef;

    this.skillCutIn = {
      unitId: unit.type,
      title: `${def.shortName.toUpperCase()}: ${(def.skillName || '').toUpperCase()}!`,
      color: def.skillColor || '#f1c40f',
      timer: 1.4,
      maxTimer: 1.4
    };

    if (unit.type === 'AOKIJI_ICE') {
      this.audio.playSkillCast('ice');
      this.triggerScreenShake(0.35, 6);
      this.particles.push(new IceAgeCrystal(unit.row));
      this.particles.push(new ShockwaveRing(centerX, centerY, 140, '#00d2ff', 0.5));
      const skillDmg = Math.round((def.skillDamage ?? 160) * unit.skillDamageMul);
      const freezeDur = def.skillFreezeDuration ?? 3.5;

      for (const p of this.pirates) {
        if (p.row === unit.row && !p.isDead && !p.isDying && p.colPos <= 9.65) {
          p.takeDamage(skillDmg, { freezeTime: freezeDur, isIce: true });
          const pt = this.grid.gridToPixel(p.colPos, p.row + 0.45);
          this.floatingTexts.push(new FloatingText(`-${skillDmg} 🧊`, pt.x, pt.y - 24, '#00e5ff', 16));
        }
      }
    } else if (unit.type === 'CROCODILE') {
      this.audio.playSkillCast('power');
      this.triggerScreenShake(0.38, 7);
      const skillDmg = Math.round((def.skillDamage ?? 220) * unit.skillDamageMul);
      const pushCols = def.skillPushCols ?? 1.4;

      // Lốc xoáy bay chạm tới Hải Tặc nào mới đẩy lùi và gây sát thương cho Hải Tặc đó!
      this.particles.push(new SandTornado(unit.col + 0.65, unit.row, this.pirates, (p) => {
        p.takeDamage(skillDmg);
        p.colPos = Math.min(9.45, p.colPos + pushCols);
        p.syncWorldCoords(this.grid);
        if (p.state === 'ATTACKING') {
          p.targetUnit = null;
          p.state = 'WALKING';
        }
        const pt = this.grid.gridToPixel(p.colPos, p.row + 0.45);
        this.floatingTexts.push(new FloatingText(`-${skillDmg} ĐẨY LÙI!`, pt.x, pt.y - 24, '#fbc531', 15));
      }));
    } else if (unit.type === 'MIHAWK') {
      this.audio.playSkillCast('slash');
      this.triggerScreenShake(0.4, 8);
      const skillDmg = Math.round((def.skillDamage ?? 450) * unit.skillDamageMul);

      // Sóng kiếm bay chạm tới Hải Tặc nào mới chém và nổ tia lửa tại Hải Tặc đó!
      this.particles.push(new AnimeSlashWave(unit.col + 0.65, unit.row, this.pirates, (p) => {
        p.takeDamage(skillDmg, { ignoreArmor: true });
        const pt = this.grid.gridToPixel(p.colPos, p.row + 0.45);
        for (let i = 0; i < 8; i++) {
          this.particles.push(new ExplosionSpark(pt.x, pt.y, '#00e676'));
        }
        this.floatingTexts.push(new FloatingText(`-${skillDmg} ⚔️`, pt.x, pt.y - 24, '#00e676', 18));
      }));
    } else if (unit.type === 'AKAINU') {
      this.audio.playSkillCast('magma');
      this.triggerScreenShake(0.55, 10);
      const meteorCount = def.skillMeteorCount ?? 5;
      const meteorDmg = Math.round((def.skillMeteorDamage ?? 260) * unit.skillDamageMul);

      const alive = this.pirates.filter(p => !p.isDead && !p.isDying && p.colPos <= 9.65);
      alive.sort((a, b) => (b.hp + b.armorHp) - (a.hp + a.armorHp));

      for (let i = 0; i < meteorCount; i++) {
        const target = alive.length > 0 ? alive[i % alive.length] : null;
        let tx, ty;
        if (target) {
          const targetPt = this.grid.gridToPixel(Math.max(0.4, target.colPos), target.row + 0.5);
          tx = targetPt.x + (Math.random() - 0.5) * 36;
          ty = targetPt.y;
        } else {
          const fallbackPt = this.grid.gridToPixel(3.5 + (i % 4) * 1.3, (i % 5) + 0.5);
          tx = fallbackPt.x;
          ty = fallbackPt.y;
        }

        this.particles.push(new MagmaMeteor(tx, ty, i * 0.15, (mx, my) => {
          this.audio.playCannon();
          this.triggerScreenShake(0.28, 7);
          this.particles.push(new ShockwaveRing(mx, my, 95, '#ff4757', 0.4));
          for (let k = 0; k < 14; k++) {
            this.particles.push(new ExplosionSpark(mx, my, k % 2 === 0 ? '#ff4757' : '#ffa502'));
          }
          for (const p of this.pirates) {
            if (!p.isDead && !p.isDying) {
              const pPt = this.grid.gridToPixel(p.colPos, p.row + 0.5);
              if (Math.hypot(pPt.x - mx, pPt.y - my) <= 95) {
                p.takeDamage(meteorDmg, { burnTime: 4.5, ignoreArmor: true });
                this.floatingTexts.push(new FloatingText(`-${meteorDmg} 🌋`, pPt.x, pPt.y - 24, '#ffa502', 16));
              }
            }
          }
        }));
      }
    }
  }

  handlePirateAction(action, payload) {
    if (action === 'PIRATE_ATTACK') {
      this.audio.playChomp();
    } else if (action === 'BUGGY_VAULT') {
      this.audio.playPlant();
      const pt = this.grid.gridToPixel(payload.pirate.colPos, payload.pirate.row + 0.35);
      const label = payload.pirate.type === 'MARCO_PHOENIX' ? '🔥 BAY VỌT!' : '🤡 NHẢY VỌT!';
      this.floatingTexts.push(new FloatingText(label, pt.x, pt.y - 25, '#ff4757', 15));
    } else if (action === 'MINE_EXPLODE') {
      this.audio.playCannon();
      this.triggerScreenShake(0.42, 9);
      const { centerX, centerY } = this.grid.cellToPixel(payload.col, payload.row);
      const dmg = payload.damage || 1800;
      this.particles.push(new ShockwaveRing(centerX, centerY, 110, '#00d2ff', 0.45));
      for (let i = 0; i < 28; i++) {
        this.particles.push(new ExplosionSpark(centerX, centerY, i % 2 === 0 ? '#00cec9' : '#ffffff'));
      }
      this.floatingTexts.push(new FloatingText(`💥 MÌN NỔ -${dmg}!`, centerX, centerY - 18, '#ff6b81', 19));
    } else if (action === 'MARCO_HEAL') {
      const pt = this.grid.gridToPixel(payload.pirate.colPos, payload.pirate.row + 0.35);
      this.floatingTexts.push(new FloatingText('+HỒI MÁU 🔥', pt.x, pt.y - 24, '#00d2ff', 12));
    } else if (action === 'BLACKBEARD_KUROUZU') {
      this.audio.playBossQuake();
      const vy = payload.y || this.grid.getRowCenterY(payload.pirate.row);
      this.particles.push(new DarkVortex(payload.x, vy - 12, 2.7));
      this.floatingTexts.push(new FloatingText('🌑 ÁM HUYỆT KUROUZU!', payload.x, vy - 56, '#be2edd', 15));
    } else if (action === 'WHITEBEARD_QUAKE') {
      this.audio.playBossQuake();
      this.triggerScreenShake(0.65, 11);
      const pt = this.grid.gridToPixel(payload.colPos ?? payload.pirate.colPos, payload.row + 0.45);
      this.particles.push(new QuakeCrack(payload.colPos ?? payload.pirate.colPos, payload.row));
      this.floatingTexts.push(new FloatingText('🔱 CHẤN ĐỘNG GURA GURA!', pt.x - 40, pt.y - 36, '#ffffff', 17));
    }
  }

  spawnHitSparks(x, y, kind) {
    const col = kind === 'ice' ? '#00d2ff'
      : kind === 'fire_lead' ? '#ff7f50'
      : kind === 'slash' ? '#00e676'
      : kind === 'magma' ? '#ff4757'
      : kind === 'cannonball' ? '#ff9f43'
      : kind === 'sand' ? '#fbc531'
      : '#f1c40f';
    const count = kind === 'cannonball' ? 12 : 6;
    for (let i = 0; i < count; i++) {
      this.particles.push(new ExplosionSpark(x, y, col));
    }
  }

  spawnPirateDeathSparks(x, y) {
    for (let i = 0; i < 16; i++) {
      this.particles.push(new ExplosionSpark(x, y, i % 2 === 0 ? '#e74c3c' : '#f39c12'));
    }
    this.floatingTexts.push(new FloatingText('HẠ GỤC!', x, y - 24, '#ffffff', 13));
  }

  triggerScreenShake(duration, magnitude) {
    this.screenShakeTime = Math.max(this.screenShakeTime, duration);
    this.screenShakeMagnitude = Math.max(this.screenShakeMagnitude, magnitude);
  }

  triggerGameOver() {
    this.audio.stopBGM();
    this.audio.playCannon();
    this.collectAllGoldDrops();
    this.saveProgress();
    this.goToScreen('GAME_OVER');
  }

  // =========================================================================
  // CẢM ỨNG & CHUỘT
  // =========================================================================
  // =========================================================================
  // BỐ CỤC KHAY THẺ (7-9 Ô), THANH ÂM LƯỢNG & SHOP VÀNG
  // =========================================================================

  /** Kích thước thẻ & bước nhảy trên khay: 7 ô rộng rãi, 8-9 ô tự thu nhỏ để vẫn vừa khay */
  getDeckLayout() {
    const n = this.maxDeckSlots;
    if (n <= 7) return { cardW: 56, stride: 61 };
    if (n === 8) return { cardW: 50, stride: 53 };
    return { cardW: 44, stride: 47 };
  }

  getCardCooldown(uId) {
    const def = UNIT_TYPES[uId];
    let cd = def.cooldown;
    if (uId === 'SEASTONE_MINE' || uId === 'BUSTER_CANNON') {
      const lv = this.shopUpgrades.DF_KIRA_DEFENSE || 0;
      cd *= Math.max(0.4, 1 - SHOP_ITEMS.DF_KIRA_DEFENSE.cooldownCutPerLevel * lv);
    }
    return cd;
  }

  /** Vùng thanh kéo âm lượng theo từng màn hình */
  getVolumeRect() {
    if (this.screen === 'PLAYING') return { x: 778, y: 20, w: 114, h: 44 };
    if (this.screen === 'TITLE') return { x: 730, y: 18, w: 180, h: 46 };
    if (this.screen === 'PAUSE') return { x: 414, y: 350, w: 240, h: 46 };
    return null;
  }

  updateVolumeFromX(px, r) {
    const trackX = r.x + r.h + 8;
    const trackW = r.w - r.h - 20;
    this.audio.ensureContext();
    this.audio.setVolume((px - trackX) / trackW);
  }

  /** Chạm / bấm vào thanh âm lượng: vùng loa = bật/tắt tiếng, vùng thanh = kéo chỉnh */
  tryHandleVolumeDown(pos) {
    const r = this.getVolumeRect();
    if (!r) return false;
    if (pos.x < r.x || pos.x > r.x + r.w || pos.y < r.y - 6 || pos.y > r.y + r.h + 6) return false;
    if (pos.x <= r.x + r.h - 4) {
      this.audio.toggleMute();
      this.audio.playPlant();
      return true;
    }
    this.isDraggingVolume = true;
    this.updateVolumeFromX(pos.x, r);
    return true;
  }

  renderVolumeSlider(ctx, r) {
    const vol = this.audio.getVolume();
    const muted = this.audio.isSilent();
    ctx.save();
    ctx.fillStyle = 'rgba(30, 42, 56, 0.96)';
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 9);
    ctx.fill();
    ctx.strokeStyle = this.isDraggingVolume ? '#f1c40f' : '#bdc3c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Biểu tượng loa (chạm để tắt/bật tiếng)
    ctx.font = `${Math.round(r.h * 0.46)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(muted ? '🔇' : vol < 0.34 ? '🔈' : vol < 0.67 ? '🔉' : '🔊', r.x + r.h / 2, r.y + r.h / 2 + 1);

    // Thanh trượt
    const trackX = r.x + r.h + 8;
    const trackW = r.w - r.h - 20;
    const cy = r.y + r.h / 2 - (r.h > 44 ? 0 : 3);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(trackX, cy - 4, trackW, 8, 4);
    ctx.fill();

    const fillW = trackW * (muted ? 0 : vol);
    const grad = ctx.createLinearGradient(trackX, 0, trackX + trackW, 0);
    grad.addColorStop(0, '#2ecc71');
    grad.addColorStop(0.7, '#f1c40f');
    grad.addColorStop(1, '#e74c3c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(trackX, cy - 4, Math.max(0, fillW), 8, 4);
    ctx.fill();

    const kx = trackX + fillW;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kx, cy, this.isDraggingVolume ? 9 : 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#dfe6e9';
    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.fillText(muted ? 'TẮT' : `${Math.round(vol * 100)}%`, trackX + trackW / 2, r.y + r.h - 8);
    ctx.restore();
  }

  renderGoldChip(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(40, 30, 8, 0.94)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 9);
    ctx.fill();
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thanh vàng nhỏ
    const gx = x + 24;
    const gy = y + h / 2;
    ctx.fillStyle = '#ffd43b';
    ctx.strokeStyle = '#8a5a00';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx - 9, gy - 8);
    ctx.lineTo(gx + 9, gy - 8);
    ctx.lineTo(gx + 15, gy + 2);
    ctx.lineTo(gx - 15, gy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d68910';
    ctx.fillRect(gx - 15, gy + 2, 30, 8);
    ctx.strokeRect(gx - 15, gy + 2, 30, 8);

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(this.goldBars), x + 46, y + h / 2 + 1);
    ctx.restore();
  }

  getShopOrder() {
    return ['EXTRA_SLOT', 'ADMIRAL_SKILL_ICE', 'ADMIRAL_SKILL_MAGMA', 'DF_MERA_SHOOTER', 'DF_KIRA_DEFENSE', 'DF_GOLD_ADMIRAL'];
  }

  getShopCardRect(i) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return { x: 30 + col * 343, y: 88 + row * 238, w: 322, h: 224 };
  }

  openGoldShop(fromScreen) {
    this.shopReturnScreen = fromScreen || 'TITLE';
    this.shopToast = null;
    this.audio.playPlant();
    this.goToScreen('GOLD_SHOP');
  }

  buyShopItem(itemId) {
    const item = SHOP_ITEMS[itemId];
    if (!item) return;
    const lv = this.shopUpgrades[itemId] || 0;
    if (lv >= item.maxLevel) {
      this.shopToast = { text: 'Món này đã đạt cấp tối đa!', color: '#f1c40f', timer: 2.2 };
      this.audio.playDenied();
      return;
    }
    const cost = item.costs[lv];
    if (this.goldBars < cost) {
      this.shopToast = { text: `Chưa đủ Vàng Khối! Cần ${cost}, bạn có ${this.goldBars}.`, color: '#ff6b6b', timer: 2.4 };
      this.audio.playDenied();
      return;
    }
    this.goldBars -= cost;
    this.shopUpgrades[itemId] = lv + 1;
    if (itemId === 'EXTRA_SLOT') {
      this.maxDeckSlots = Math.min(9, 7 + this.shopUpgrades.EXTRA_SLOT);
    }
    this.audio.playShopBuy();
    this.shopToast = { text: `✅ Đã mua: ${item.name}!`, color: '#2ecc71', timer: 2.4 };
    this.saveProgress();
  }

  handleGoldShopClick(px, py) {
    if (px >= 28 && px <= 148 && py >= 16 && py <= 58) {
      this.audio.playPlant();
      this.goToScreen(this.shopReturnScreen || 'TITLE');
      return;
    }
    const order = this.getShopOrder();
    order.forEach((id, i) => {
      const r = this.getShopCardRect(i);
      const bx = r.x + 20;
      const by = r.y + r.h - 54;
      if (px >= bx && px <= bx + r.w - 40 && py >= by && py <= by + 40) {
        this.buyShopItem(id);
      }
    });
  }

  renderGoldShopScreen(ctx) {
    const bg = this.assets.get('bg_map');
    ctx.fillStyle = '#141c28';
    ctx.fillRect(0, 0, 1068, 600);
    if (bg) {
      ctx.globalAlpha = 0.22;
      ctx.drawImage(bg, 0, 0, 1068, 600);
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = 'rgba(18, 24, 34, 0.92)';
    ctx.fillRect(0, 0, 1068, 74);
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 1068, 74);

    this.renderMenuButton(ctx, 28, 16, 120, 42, '⬅ QUAY LẠI', '#7f8c8d', '#95a5a6', 14);
    ctx.fillStyle = '#ffd43b';
    ctx.font = '900 26px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏪 SHOP VÀNG KHỐI', 534, 30);
    ctx.fillStyle = '#dfe6e9';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('Hải tặc chết có 20% rơi Vàng Khối (Boss rơi chắc chắn) — dùng vàng để mua ô bài, kỹ năng Đô Đốc & Trái Ác Quỷ', 534, 56);
    this.renderGoldChip(ctx, 924, 14, 130, 46);

    const order = this.getShopOrder();
    order.forEach((id, i) => {
      const item = SHOP_ITEMS[id];
      const r = this.getShopCardRect(i);
      const lv = this.shopUpgrades[id] || 0;
      const maxed = lv >= item.maxLevel;
      const cost = maxed ? 0 : item.costs[lv];
      const canBuy = !maxed && this.goldBars >= cost;
      const accent = item.group === 'SLOT' ? '#2ecc71' : item.group === 'SKILL' ? '#00d2ff' : '#e056fd';

      ctx.fillStyle = 'rgba(24, 32, 44, 0.96)';
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.w, r.h, 12);
      ctx.fill();
      ctx.strokeStyle = maxed ? '#7f8c8d' : accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Nhãn nhóm
      const tag = item.group === 'SLOT' ? 'Ô BÀI' : item.group === 'SKILL' ? 'KỸ NĂNG ĐÔ ĐỐC' : 'TRÁI ÁC QUỶ';
      ctx.fillStyle = accent;
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(tag, r.x + 16, r.y + 20);

      ctx.font = '44px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, r.x + 16, r.y + 58);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.textBaseline = 'alphabetic';
      this.drawWrappedText(ctx, item.name, r.x + 78, r.y + 50, r.w - 92, 19, 'left');

      ctx.fillStyle = '#bdc3c7';
      ctx.font = '12px "Segoe UI", sans-serif';
      this.drawWrappedText(ctx, item.desc, r.x + 16, r.y + 98, r.w - 32, 17, 'left');

      // Cấp độ
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.maxLevel > 1 ? `Cấp ${lv}/${item.maxLevel}` : (lv > 0 ? 'ĐÃ SỞ HỮU' : 'CHƯA MUA'), r.x + 16, r.y + r.h - 66);
      for (let k = 0; k < item.maxLevel; k++) {
        ctx.fillStyle = k < lv ? accent : 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.arc(r.x + 110 + k * 18, r.y + r.h - 70, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      const bx = r.x + 20;
      const by = r.y + r.h - 54;
      const label = maxed ? '✔ ĐÃ TỐI ĐA' : `MUA — ${cost} 🪙 VÀNG`;
      this.renderMenuButton(
        ctx, bx, by, r.w - 40, 40, label,
        maxed ? '#4b5563' : canBuy ? '#b7791f' : '#4b3a1a',
        maxed ? '#6b7280' : canBuy ? '#f1c40f' : '#7a5c1c',
        14
      );
    });

    if (this.shopToast) {
      const t = this.shopToast;
      ctx.save();
      ctx.globalAlpha = Math.min(1, t.timer * 2);
      ctx.fillStyle = 'rgba(10, 14, 22, 0.95)';
      ctx.beginPath();
      ctx.roundRect(284, 556, 500, 34, 17);
      ctx.fill();
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = t.color;
      ctx.font = 'bold 14px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.text, 534, 573);
      ctx.restore();
    }
  }

  renderSupportSkillButtons(ctx) {
    const defs = [
      { kind: 'ICE', id: 'ADMIRAL_SKILL_ICE', x: 196, label: '🧊 CỨU VIỆN AOKIJI', c1: '#0a6c8a', c2: '#00d2ff' },
      { kind: 'MAGMA', id: 'ADMIRAL_SKILL_MAGMA', x: 334, label: '🌋 CỨU VIỆN AKAINU', c1: '#8e1b1b', c2: '#ff4757' }
    ];
    for (const d of defs) {
      if (!this.shopUpgrades[d.id]) continue;
      const item = SHOP_ITEMS[d.id];
      const cd = this.supportCd[d.kind];
      const ready = cd <= 0;
      this.renderMenuButton(ctx, d.x, 552, 130, 40, ready ? d.label : `${d.label.slice(0, 2)} ${Math.ceil(cd)}s`, ready ? d.c1 : '#2d3436', ready ? d.c2 : '#636e72', 11);
      if (!ready) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        const w = 130 * (cd / item.cooldown);
        ctx.beginPath();
        ctx.roundRect(d.x, 552, w, 40, 9);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  setupInputs() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.virtualWidth / rect.width;
      const scaleY = this.virtualHeight / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const handleDown = (pos) => {
      this.mousePos = pos;
      this.audio.ensureContext();
      // Chỉ cho chỉnh thanh âm lượng khi video intro đã chạy xong hoặc đã bị bỏ qua
      const isPlayingIntroVideo = this.screen === 'TITLE' && this.titleVideo && !this.titleVideoFinished && !this.titleVideo.ended;
      if (!isPlayingIntroVideo && this.tryHandleVolumeDown(pos)) return;
      if (this.tryHandleVolumeDown(pos)) return;

      switch (this.screen) {
        case 'TITLE': this.handleTitleClick(pos.x, pos.y); break;
        case 'STAGE_SELECT': this.handleStageSelectClick(pos.x, pos.y); break;
        case 'DECK_CHOOSER': this.handleDeckChooserClick(pos.x, pos.y); break;
        case 'PLAYING': this.handlePlayingClick(pos.x, pos.y); break;
        case 'PAUSE': this.handlePauseClick(pos.x, pos.y); break;
        case 'LOOT_DROP': this.handleLootDropClick(pos.x, pos.y); break;
        case 'VICTORY': this.handleVictoryClick(pos.x, pos.y); break;
        case 'GAME_OVER': this.handleGameOverClick(pos.x, pos.y); break;
        case 'ALMANAC': this.handleAlmanacClick(pos.x, pos.y); break;
        case 'GUIDE': this.handleGuideClick(pos.x, pos.y); break;
        case 'GOLD_SHOP': this.handleGoldShopClick(pos.x, pos.y); break;
      }
    };

    const handleMove = (pos) => {
      this.mousePos = pos;
      if (this.isDraggingVolume) {
        const r = this.getVolumeRect();
        if (r) this.updateVolumeFromX(pos.x, r);
        return;
      }
      if (this.screen === 'PLAYING') {
        if (this.isShovelActive) {
          const shovelHit = this.findShovelTargetUnit(pos.x, pos.y);
          this.hoveredCell = shovelHit
            ? { col: shovelHit.col, row: shovelHit.row }
            : this.grid.pixelToCell(pos.x, pos.y);
        } else {
          this.hoveredCell = this.grid.pixelToCell(pos.x, pos.y);
        }
      }
    };

    this.canvas.addEventListener('mousedown', (e) => handleDown(getPos(e)));
    this.canvas.addEventListener('mousemove', (e) => handleMove(getPos(e)));
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleDown(getPos(e)); }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(getPos(e)); }, { passive: false });
    const stopDrag = () => { this.isDraggingVolume = false; };
    this.canvas.addEventListener('touchend', () => { this.hoveredCell = null; stopDrag(); });
    this.canvas.addEventListener('touchcancel', stopDrag);
    this.canvas.addEventListener('mouseup', stopDrag);
    this.canvas.addEventListener('mouseleave', stopDrag);
    window.addEventListener('mouseup', stopDrag);
  }

  handleDeckChooserClick(px, py) {
    const layout = this.getDeckLayout();
    let slotX = 124;
    for (let i = 0; i < this.maxDeckSlots; i++) {
      if (px >= slotX && px <= slotX + layout.cardW && py >= 12 && py <= 82) {
        if (i < this.selectedDeck.length) {
          this.selectedDeck.splice(i, 1);
          this.audio.playPlant();
        }
        return;
      }
      slotX += layout.stride;
    }

    const unitKeys = Object.keys(UNIT_TYPES);
    unitKeys.forEach((uId, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const cx = 36 + col * 112;
      const cy = 166 + row * 144;
      const cw = 104;
      const ch = 132;

      if (px >= cx && px <= cx + cw && py >= cy && py <= cy + ch) {
        if (!this.unlockedUnits.includes(uId)) return;

        const existingIdx = this.selectedDeck.indexOf(uId);
        if (existingIdx !== -1) {
          this.selectedDeck.splice(existingIdx, 1);
          this.audio.playPlant();
        } else if (this.selectedDeck.length < this.maxDeckSlots) {
          this.selectedDeck.push(uId);
          this.audio.playBeli();
        }
      }
    });

    if (px >= 34 && px <= 134 && py >= 506 && py <= 554) {
      this.goToScreen('STAGE_SELECT');
      return;
    }
    if (px >= 140 && px <= 250 && py >= 506 && py <= 554) {
      this.almanacReturnScreen = 'DECK_CHOOSER';
      this.almanacTab = 'PIRATES';
      this.almanacSelectedId = 'PIRATE_GRUNT';
      this.goToScreen('ALMANAC');
      return;
    }
    if (px >= 256 && px <= 366 && py >= 506 && py <= 554) {
      this.openGoldShop('DECK_CHOOSER');
      return;
    }
    if (px >= 372 && px <= 590 && py >= 502 && py <= 556) {
      this.beginBattleFromDeckChooser();
    }
  }

  findShovelTargetUnit(px, py) {
    // Ưu tiên kiểm tra theo khung hình hiển thị 3D từ hàng trước ra hàng sau (trúng cả mũ/đầu cao phía trên chân ô)
    const allUnits = this.grid.getAllUnits().sort((a, b) => b.row - a.row);
    for (const u of allUnits) {
      const cellPt = this.grid.cellToPixel(u.col, u.row);
      const sc = cellPt.scale || 1;
      const halfW = 42 * sc;
      const topY = cellPt.feetY - 96 * sc;
      const bottomY = cellPt.feetY + 12 * sc;
      if (px >= cellPt.feetX - halfW && px <= cellPt.feetX + halfW && py >= topY && py <= bottomY) {
        return { col: u.col, row: u.row, unit: u };
      }
    }

    const cell = this.grid.pixelToCell(px, py);
    if (cell && !this.grid.isRowLocked(cell.row)) {
      const unitInCell = this.grid.getUnit(cell.col, cell.row);
      if (unitInCell) {
        return { col: cell.col, row: cell.row, unit: unitInCell };
      }
    }
    return null;
  }

  detachPiratesFromUnit(removedUnit) {
    if (!removedUnit) return;
    for (const p of this.pirates) {
      if (p.targetUnit === removedUnit) {
        p.targetUnit = null;
        p.state = 'WALKING';
        p.attackAnimTimer = 0;
      }
    }
  }

  handlePlayingClick(px, py) {
    // Nút kỹ năng cứu viện Đô Đốc (mua ở Shop Vàng)
    if (py >= 552 && py <= 592) {
      if (px >= 196 && px <= 326 && this.shopUpgrades.ADMIRAL_SKILL_ICE) {
        this.castSupportSkill('ICE');
        return;
      }
      if (px >= 334 && px <= 464 && this.shopUpgrades.ADMIRAL_SKILL_MAGMA) {
        this.castSupportSkill('MAGMA');
        return;
      }
    }

    // Nút Xẻng trên thanh HUD
    if (px >= 550 && px <= 620 && py >= 12 && py <= 82) {
      this.isShovelActive = !this.isShovelActive;
      this.selectedCardId = null;
      this.audio.playPlant();
      return;
    }

    // Các nút điều khiển HUD trên cùng
    if (px >= 632 && px <= 716 && py >= 18 && py <= 66) {
      this.autoSkill = !this.autoSkill;
      this.audio.playPlant();
      this.floatingTexts.push(
        new FloatingText(this.autoSkill ? '⚡ SKILL: TỰ ĐỘNG' : '🎯 SKILL: THỦ CÔNG', 679, 88, '#00d2ff', 13)
      );
      return;
    }
    if (px >= 722 && px <= 772 && py >= 18 && py <= 66) {
      this.gameSpeed = (this.gameSpeed === 1) ? 2 : 1;
      this.audio.playPlant();
      return;
    }
    // (778..892: thanh âm lượng - xử lý ở tryHandleVolumeDown)
    if (px >= 898 && px <= 948 && py >= 18 && py <= 66) {
      this.goToScreen('PAUSE');
      return;
    }

    // Nếu đang cầm Xẻng: ưu tiên xúc đúng lính Hải Quân (kể cả khi có đồng Beli bay gần)
    if (this.isShovelActive) {
      const shovelHit = this.findShovelTargetUnit(px, py);
      if (shovelHit) {
        const removed = this.grid.removeUnit(shovelHit.col, shovelHit.row);
        if (removed) {
          this.detachPiratesFromUnit(removed);
          this.audio.playPlant();
          const { feetX, feetY } = this.grid.cellToPixel(shovelHit.col, shovelHit.row);
          for (let i = 0; i < 10; i++) {
            this.particles.push(new ExplosionSpark(feetX, feetY - 12, '#ff7f50'));
          }
          this.floatingTexts.push(new FloatingText('⛏️ ĐÃ XÚC!', feetX, feetY - 26, '#e74c3c', 16));
        }
        this.isShovelActive = false;
        return;
      }
      this.isShovelActive = false;
      return;
    }

    for (const bar of this.goldDrops) {
      if (bar.isPointInside(px, py)) {
        if (this.collectGoldBar(bar)) return;
      }
    }

    for (const coin of this.beliCoins) {
      if (coin.isPointInside(px, py)) {
        if (coin.collect()) {
          this.beli += coin.value;
          this.audio.playBeli();
          this.floatingTexts.push(new FloatingText(`+${coin.value} ฿`, coin.x, coin.y - 12, '#f1c40f', 18));
          return;
        }
      }
    }

    const layoutP = this.getDeckLayout();
    let cardX = 124;
    const cardY = 12;
    const cardW = layoutP.cardW;
    const cardH = 70;

    for (const uId of this.selectedDeck) {
      if (px >= cardX && px <= cardX + cardW && py >= cardY && py <= cardY + cardH) {
        const def = UNIT_TYPES[uId];
        const cd = this.unitCooldowns[uId] || 0;
        if (this.beli >= def.cost && cd <= 0) {
          this.selectedCardId = (this.selectedCardId === uId) ? null : uId;
          this.isShovelActive = false;
          this.audio.playPlant();
        }
        return;
      }
      cardX += layoutP.stride;
    }

    const cell = this.grid.pixelToCell(px, py);
    if (cell && !this.grid.isRowLocked(cell.row)) {
      const { col, row } = cell;

      if (this.selectedCardId) {
        const def = UNIT_TYPES[this.selectedCardId];
        if (!this.grid.isCellOccupied(col, row) && this.beli >= def.cost) {
          this.beli -= def.cost;
          this.unitCooldowns[this.selectedCardId] = this.getCardCooldown(this.selectedCardId);

          const newUnit = new Unit(col, row, def, this.shopUpgrades);
          this.grid.setUnit(col, row, newUnit);
          this.audio.playPlant();
          this.selectedCardId = null;

          const { feetX, feetY } = this.grid.cellToPixel(col, row);
          for (let i = 0; i < 8; i++) {
            this.particles.push(new ExplosionSpark(feetX, feetY - 8, '#2ecc71'));
          }
        }
        return;
      }

      const existingUnit = this.grid.getUnit(col, row);
      if (existingUnit && existingUnit.skillReady && existingUnit.stunTimer <= 0) {
        existingUnit.castSkill((action, payload) => this.handleUnitAction(action, payload));
        return;
      }
    }

    this.selectedCardId = null;
    this.isShovelActive = false;
  }

  handleLootDropClick(px, py) {
    if (!this.lootCard || this.lootCard.isCollecting) return;
    const dist = Math.hypot(px - this.lootCard.x, py - this.lootCard.y);
    if (dist <= 80) {
      this.lootCard.isCollecting = true;
      this.lootCard.startX = this.lootCard.x;
      this.lootCard.startY = this.lootCard.y;
      this.audio.playBeli();
      this.particles.push(new ShockwaveRing(this.lootCard.x, this.lootCard.y, 160, '#f1c40f', 0.5));
    }
  }

  handleTitleClick(px, py) {
    // Nếu video intro đang chạy -> chạm bất kỳ đâu để bỏ qua video và hiện ảnh tĩnh + các nút
    if (this.titleVideo && !this.titleVideoFinished && !this.titleVideo.ended) {
      if (this.waitingForTapToPlayIntro || this.titleVideo.paused) {
        this.waitingForTapToPlayIntro = false;
        this.titleVideo.muted = false;
        this.titleVideo.volume = this.audio.getVolume();
        this.titleVideo.play().catch(() => {});
        return;
      }
      this.titleVideo.pause();
      this.titleVideoFinished = true;
      this.audio.startTitleMusic();
      return;
    }
    // Thanh Tài Khoản Thuyền Trưởng góc trên trái (x: 20..340, y: 16..64)
    if (px >= 20 && px <= 340 && py >= 16 && py <= 64) {
      this.audio.playPlant();
      this.openAccountModal();
      return;
    }

    if (px >= 394 && px <= 674 && py >= 306 && py <= 368) {
      this.startStage(this.maxUnlockedStage - 1);
    } else if (px >= 394 && px <= 674 && py >= 384 && py <= 440) {
      this.goToScreen('STAGE_SELECT');
    } else if (px >= 150 && px <= 390 && py >= 458 && py <= 510) {
      this.almanacReturnScreen = 'TITLE';
      this.goToScreen('ALMANAC');
    } else if (px >= 414 && px <= 654 && py >= 458 && py <= 510) {
      this.goToScreen('GUIDE');
    } else if (px >= 678 && px <= 918 && py >= 458 && py <= 510) {
      this.openGoldShop('TITLE');
    } else if (px >= 20 && px <= 192 && py >= 544 && py <= 582) {
      this.resetProgress(false);
      this.audio.playPlant();
    }
  }

  handleStageSelectClick(px, py) {
    if (px >= 28 && px <= 140 && py >= 16 && py <= 62) {
      this.goToScreen('TITLE');
      return;
    }
    if (px >= 900 && px <= 1050 && py >= 16 && py <= 58) {
      this.openGoldShop('STAGE_SELECT');
      return;
    }

    const islandNodes = this.getIslandNodes();
    islandNodes.forEach((pos, idx) => {
      const stageNum = idx + 1;
      if (stageNum <= this.maxUnlockedStage) {
        if (Math.hypot(px - pos.x, py - pos.y) <= 44) {
          this.startStage(idx);
        }
      }
    });
  }

  getIslandNodes() {
    return [
      { x: 118, y: 185 },
      { x: 175, y: 440 },
      { x: 300, y: 165 },
      { x: 385, y: 430 },
      { x: 525, y: 215 },
      { x: 625, y: 445 },
      { x: 750, y: 175 },
      { x: 840, y: 425 },
      { x: 950, y: 215 }
    ];
  }

  handlePauseClick(px, py) {
    if (px >= 414 && px <= 654 && py >= 230 && py <= 276) {
      this.goToScreen('PLAYING');
    } else if (px >= 414 && px <= 654 && py >= 290 && py <= 336) {
      this.initializeBattleSession();
    } else if (px >= 414 && px <= 654 && py >= 410 && py <= 456) {
      this.goToScreen('STAGE_SELECT');
    }
  }

  handleVictoryClick(px, py) {
    if (px >= 364 && px <= 704 && py >= 480 && py <= 542) {
      const nextIdx = this.currentStageIndex + 1;
      if (nextIdx < STAGES.length) {
        this.startStage(nextIdx);
      } else {
        this.goToScreen('STAGE_SELECT');
      }
    }
  }

  handleGameOverClick(px, py) {
    if (px >= 344 && px <= 519 && py >= 420 && py <= 476) {
      this.initializeBattleSession();
    } else if (px >= 549 && px <= 724 && py >= 420 && py <= 476) {
      this.goToScreen('STAGE_SELECT');
    }
  }

  handleAlmanacClick(px, py) {
    if (px >= 34 && px <= 140 && py >= 20 && py <= 62) {
      this.goToScreen(this.almanacReturnScreen || 'TITLE');
      return;
    }
    if (px >= 160 && px <= 300 && py >= 20 && py <= 62) {
      this.almanacTab = 'UNITS';
      this.almanacSelectedId = 'DEN_DEN_MUSHI';
      return;
    }
    if (px >= 320 && px <= 460 && py >= 20 && py <= 62) {
      this.almanacTab = 'PIRATES';
      this.almanacSelectedId = 'PIRATE_GRUNT';
      return;
    }

    if (this.almanacTab === 'UNITS') {
      Object.keys(UNIT_TYPES).forEach((key, idx) => {
        const itemY = 88 + idx * 48;
        if (px >= 46 && px <= 422 && py >= itemY && py <= itemY + 44) {
          this.almanacSelectedId = key;
        }
      });
    } else {
      Object.keys(PIRATE_TYPES).forEach((key, idx) => {
        const itemY = 88 + idx * 53;
        if (px >= 46 && px <= 422 && py >= itemY && py <= itemY + 48) {
          this.almanacSelectedId = key;
        }
      });
    }
  }

  handleGuideClick(px, py) {
    if (px >= 34 && px <= 140 && py >= 20 && py <= 62) {
      this.goToScreen('TITLE');
    }
  }

  // =========================================================================
  // HIỂN THỊ ĐỒ HỌA (RENDER PIPELINE 1068 x 600)
  // =========================================================================
  render() {
    const ctx = this.ctx;
    // Vẽ theo tọa độ ảo 1068x600 nhưng xuất ra canvas độ phân giải cao (nét hơn)
    ctx.setTransform(this.canvas.width / this.virtualWidth, 0, 0, this.canvas.height / this.virtualHeight, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.save();

    if (this.screenShakeTime > 0) {
      const ox = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
      const oy = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
      ctx.translate(ox, oy);
    }

    switch (this.screen) {
      case 'LOADING': this.renderLoadingScreen(ctx); break;
      case 'TITLE': this.renderTitleScreen(ctx); break;
      case 'STAGE_SELECT': this.renderStageSelectScreen(ctx); break;
      case 'INTRO_PAN':
      case 'PAN_BACK':
        this.renderBattleSceneWithCamera(ctx);
        break;
      case 'DECK_CHOOSER':
        this.renderBattleSceneWithCamera(ctx);
        this.renderDeckChooserOverlay(ctx);
        break;
      case 'READY_SET_PLANT':
        this.renderPlayingScreen(ctx);
        this.renderReadySetBanner(ctx);
        break;
      case 'PLAYING':
        this.renderPlayingScreen(ctx);
        break;
      case 'PAUSE':
        this.renderPlayingScreen(ctx);
        this.renderPauseModal(ctx);
        break;
      case 'LOOT_DROP':
        this.renderPlayingScreen(ctx, true);
        this.renderLootDropOverlay(ctx);
        break;
      case 'VICTORY':
        this.renderVictoryScreen(ctx);
        break;
      case 'GAME_OVER':
        this.renderGameOverScreen(ctx);
        break;
      case 'ALMANAC':
        this.renderAlmanacScreen(ctx);
        break;
      case 'GUIDE':
        this.renderGuideScreen(ctx);
        break;
      case 'GOLD_SHOP':
        this.renderGoldShopScreen(ctx);
        break;
    }

    ctx.restore();
  }

  renderLoadingScreen(ctx) {
    ctx.fillStyle = '#0c1017';
    ctx.fillRect(0, 0, 1068, 600);

    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 32px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚓ ĐANG TẢI TÀI NGUYÊN ONE PIECE...', 534, 260);

    const barW = 460;
    const barH = 22;
    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.roundRect(534 - barW / 2, 310, barW, barH, 11);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.roundRect(534 - barW / 2 + 2, 312, (barW - 4) * this.loadProgressRatio, barH - 4, 9);
    ctx.fill();
  }

  renderBattleSceneWithCamera(ctx) {
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    this.grid.render(ctx, this.currentStage.theme, null, null, this.assets, this.globalTime, Unit.renderPortrait);
    for (const ws of this.warships) {
      ws.render(ctx, this.grid, this.assets);
    }
    const sorted = [...this.previewPirates].sort((a, b) => a.row - b.row);
    for (const p of sorted) {
      p.render(ctx, this.grid, this.assets);
    }

    ctx.restore();

    if (this.screen === 'INTRO_PAN' || this.screen === 'PAN_BACK') {
      ctx.save();
      ctx.fillStyle = 'rgba(12, 16, 23, 0.8)';
      ctx.beginPath();
      ctx.roundRect(244, 18, 580, 48, 10);
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`☠️ ${this.currentStage.name} — QUAN SÁT ĐỊCH!`, 534, 42);
      ctx.restore();
    }
  }

  renderDeckChooserOverlay(ctx) {
    ctx.save();

    ctx.fillStyle = 'rgba(20, 28, 38, 0.94)';
    ctx.beginPath();
    ctx.roundRect(8, 6, 560, 84, 10);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(14, 14, 102, 68, 8);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VỐN KHỞI ĐẦU', 65, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(`${this.currentStage.initialBeli} ฿`, 65, 58);

    const layoutD = this.getDeckLayout();
    let sx = 124;
    for (let i = 0; i < this.maxDeckSlots; i++) {
      const uId = this.selectedDeck[i];
      ctx.fillStyle = uId ? '#1e3749' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(sx, 12, layoutD.cardW, 70, 6);
      ctx.fill();
      ctx.strokeStyle = uId ? '#2ecc71' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (uId) {
        const def = UNIT_TYPES[uId];
        Unit.renderPortrait(ctx, uId, sx + layoutD.cardW / 2, 37, Math.min(46, layoutD.cardW - 8), this.globalTime, this.assets);
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${def.cost}฿`, sx + layoutD.cardW / 2, 74);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Ô ${i + 1}`, sx + layoutD.cardW / 2, 48);
      }
      sx += layoutD.stride;
    }

    ctx.fillStyle = 'rgba(22, 30, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(24, 100, 576, 472, 12);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🛡️ SOẠN ĐỘI HÌNH HẢI QUÂN VÀO TRẬN (TỐI ĐA ${this.maxDeckSlots} Ô)`, 312, 126);

    ctx.fillStyle = '#bdc3c7';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('Chạm vào thẻ lính bên dưới để bỏ lên khay (hoặc chạm thẻ trên khay để tháo ra)', 312, 148);

    const unitKeys = Object.keys(UNIT_TYPES);
    unitKeys.forEach((uId, idx) => {
      const def = UNIT_TYPES[uId];
      const isUnlocked = this.unlockedUnits.includes(uId);
      const isSlotted = this.selectedDeck.includes(uId);

      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const cx = 36 + col * 112;
      const cy = 166 + row * 144;
      const cw = 104;
      const ch = 132;

      ctx.fillStyle = !isUnlocked ? '#1b1f24' : isSlotted ? '#145a32' : '#2c3e50';
      ctx.beginPath();
      ctx.roundRect(cx, cy, cw, ch, 8);
      ctx.fill();
      ctx.strokeStyle = !isUnlocked ? '#4b5563' : isSlotted ? '#2ecc71' : (def.skillCooldown ? (def.skillColor || '#f1c40f') : '#f1c40f');
      ctx.lineWidth = isSlotted ? 3 : 1.8;
      ctx.stroke();

      if (isUnlocked) {
        Unit.renderPortrait(ctx, uId, cx + cw / 2, cy + 44, 72, this.globalTime, this.assets);

        if (def.skillCooldown) {
          ctx.fillStyle = def.skillColor || '#00d2ff';
          ctx.font = 'bold 9px "Segoe UI", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('⚡SKILL', cx + 6, cy + 14);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(def.shortName, cx + cw / 2, cy + 98);

        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.fillText(`${def.cost} Beli`, cx + cw / 2, cy + 116);

        if (isSlotted) {
          ctx.fillStyle = '#2ecc71';
          ctx.beginPath();
          ctx.arc(cx + cw - 13, cy + 13, 9.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('✓', cx + cw - 13, cy + 17);
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', cx + cw / 2, cy + 54);
        ctx.fillStyle = '#95a5a6';
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.fillText(`Mở sau Màn ${def.unlockStage - 1}`, cx + cw / 2, cy + 104);
      }
    });

    this.renderMenuButton(ctx, 34, 506, 100, 46, '⬅ BẢN ĐỒ', '#7f8c8d', '#95a5a6', 12);
    this.renderMenuButton(ctx, 140, 506, 110, 46, '📖 XEM ĐỊCH', '#8e44ad', '#9b59b6', 12);
    this.renderMenuButton(ctx, 256, 506, 110, 46, '🏪 SHOP VÀNG', '#b7791f', '#f1c40f', 12);

    const canStart = this.selectedDeck.length > 0;
    this.renderMenuButton(
      ctx,
      372, 502, 218, 54,
      '⚔️ XUẤT TRẬN!',
      canStart ? '#27ae60' : '#555',
      canStart ? '#2ecc71' : '#777',
      17
    );
    this.renderGoldChip(ctx, 612, 506, 130, 46);

    ctx.restore();
  }

  renderReadySetBanner(ctx) {
    ctx.save();
    let label = 'CHUẨN BỊ...';
    let color = '#f1c40f';
    const subProgress = (this.readyTimer % 0.65) / 0.65;

    if (this.readyTimer >= 1.3) {
      label = '⚔️ PHÒNG THỦ! ⚔️';
      color = '#2ecc71';
    } else if (this.readyTimer >= 0.65) {
      label = 'SẴN SÀNG...';
      color = '#e67e22';
    }

    const scale = 1.35 - 0.35 * subProgress;
    ctx.translate(534, 300);
    ctx.scale(scale, scale);

    ctx.font = '900 56px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#181828';
    ctx.strokeText(label, 0, 0);
    ctx.fillStyle = color;
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  renderPlayingScreen(ctx, hideTopHUD = false) {
    const selUnitDef = this.selectedCardId ? UNIT_TYPES[this.selectedCardId] : null;
    this.grid.render(
      ctx,
      this.currentStage.theme,
      this.hoveredCell,
      selUnitDef,
      this.assets,
      this.globalTime,
      Unit.renderPortrait,
      this.isShovelActive
    );

    for (const ws of this.warships) {
      ws.render(ctx, this.grid, this.assets);
    }

    // Sắp xếp vẽ theo thứ tự hàng từ trên xuống dưới để chiều sâu 2.5D tự nhiên
    const allUnits = this.grid.getAllUnits().sort((a, b) => a.row - b.row);
    for (const unit of allUnits) {
      unit.render(ctx, this.grid, this.assets);
    }

    for (const proj of this.projectiles) {
      proj.render(ctx, this.grid);
    }

    const sortedPirates = [...this.pirates].sort((a, b) => a.row - b.row || b.colPos - a.colPos);
    for (const p of sortedPirates) {
      p.render(ctx, this.grid, this.assets);
    }

    for (const coin of this.beliCoins) {
      coin.render(ctx);
    }

    for (const bar of this.goldDrops) {
      bar.render(ctx);
    }

    for (const pt of this.particles) {
      pt.render(ctx, this.grid);
    }

    for (const ft of this.floatingTexts) {
      ft.render(ctx);
    }

    if (!hideTopHUD) {
      this.renderTopHUD(ctx);
      this.renderBottomRightProgress(ctx);
      this.renderSupportSkillButtons(ctx);

      if (this.isShovelActive && this.screen === 'PLAYING' && this.mousePos) {
        ctx.save();
        ctx.translate(this.mousePos.x, this.mousePos.y - 10);
        ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⛏️', 0, 1);
        ctx.restore();
      }
    }

    if (this.skillCutIn) {
      this.renderSkillCutInBanner(ctx);
    }

    if (this.hugeWaveAlertTimer > 0) {
      this.renderHugeWaveBanner(ctx);
    }
  }

  renderSkillCutInBanner(ctx) {
    const ci = this.skillCutIn;
    if (!ci) return;
    ctx.save();
    const prog = 1 - ci.timer / ci.maxTimer;
    const alpha = ci.timer < 0.35 ? (ci.timer / 0.35) : Math.min(1, prog * 6);
    const slideX = prog < 0.16 ? (-220 + (prog / 0.16) * 240) : 20;

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = 'rgba(12, 18, 28, 0.9)';
    ctx.beginPath();
    ctx.roundRect(slideX, 102, 340, 56, 10);
    ctx.fill();
    ctx.strokeStyle = ci.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    Unit.renderPortrait(ctx, ci.unitId, slideX + 30, 130, 44, this.globalTime, this.assets);

    ctx.fillStyle = ci.color;
    ctx.font = '900 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚡ ${ci.title}`, slideX + 60, 124);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText('TUYỆT CHIÊU ĐÔ ĐỐC / THẤT VŨ HẢI!', slideX + 60, 143);

    ctx.restore();
  }

  renderTopHUD(ctx) {
    ctx.save();

    ctx.fillStyle = 'rgba(20, 28, 40, 0.92)';
    ctx.beginPath();
    ctx.roundRect(8, 6, 616, 84, 10);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(14, 12, 102, 70, 8);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(40, 47, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('฿', 40, 47);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.beli.toString(), 62, 47);

    const layoutH = this.getDeckLayout();
    let cardX = 124;
    const cardY = 12;
    const cardW = layoutH.cardW;
    const cardH = 70;

    for (const uId of this.selectedDeck) {
      const def = UNIT_TYPES[uId];
      const cd = this.unitCooldowns[uId] || 0;
      const canAfford = this.beli >= def.cost;
      const isSelected = this.selectedCardId === uId;

      ctx.fillStyle = isSelected ? '#16a085' : (canAfford && cd <= 0) ? '#34495e' : '#212529';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#2ecc71' : (canAfford && cd <= 0) ? (def.skillColor || '#f1c40f') : '#555';
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      if (!canAfford || cd > 0) ctx.globalAlpha = 0.45;
      Unit.renderPortrait(ctx, uId, cardX + cardW / 2, cardY + 26, Math.min(44, cardW - 8), this.globalTime, this.assets);
      ctx.globalAlpha = 1;

      if (def.skillCooldown) {
        ctx.fillStyle = def.skillColor || '#00d2ff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('⚡', cardX + 3, cardY + 10);
      }

      ctx.fillStyle = 'rgba(0,0,0,0.68)';
      ctx.fillRect(cardX + 3, cardY + 51, cardW - 6, 16);
      ctx.fillStyle = canAfford ? '#f1c40f' : '#e74c3c';
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${def.cost}฿`, cardX + cardW / 2, cardY + 59);

      if (cd > 0) {
        const cdRatio = Math.min(1, cd / this.getCardCooldown(uId));
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH * cdRatio, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(cd.toFixed(1) + 's', cardX + cardW / 2, cardY + 34);
      }

      cardX += layoutH.stride;
    }

    ctx.fillStyle = this.isShovelActive ? '#e74c3c' : '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(554, 12, 62, 70, 8);
    ctx.fill();
    ctx.strokeStyle = this.isShovelActive ? '#ffffff' : '#bdc3c7';
    ctx.lineWidth = this.isShovelActive ? 3 : 1.8;
    ctx.stroke();

    ctx.font = '25px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛏️', 585, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillText('XẺNG', 585, 68);

    this.renderMenuButton(
      ctx,
      632, 18, 84, 48,
      this.autoSkill ? '⚡ TỰ ĐỘNG' : '🎯 THỦ CÔNG',
      this.autoSkill ? '#00838f' : '#576574',
      this.autoSkill ? '#00cec9' : '#7f8c8d',
      11
    );
    this.renderMenuButton(
      ctx,
      722, 18, 50, 48,
      `⚡ x${this.gameSpeed}`,
      this.gameSpeed === 2 ? '#e67e22' : '#2c3e50',
      this.gameSpeed === 2 ? '#f39c12' : '#34495e',
      13
    );
    this.renderVolumeSlider(ctx, { x: 778, y: 20, w: 114, h: 44 });
    this.renderMenuButton(ctx, 898, 18, 50, 48, '⏸️', '#2c3e50', '#34495e', 18);
    this.renderGoldChip(ctx, 956, 18, 104, 48);

    ctx.restore();
  }

  renderBottomRightProgress(ctx) {
    ctx.save();

    if (this.waveIndex === 0 && this.waveTimer > 0) {
      ctx.fillStyle = 'rgba(20, 28, 40, 0.88)';
      ctx.beginPath();
      ctx.roundRect(576, 564, 200, 26, 13);
      ctx.fill();
      ctx.strokeStyle = '#00cec9';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#00cec9';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⏳ Đợt đầu sau: ${Math.ceil(this.waveTimer)}s`, 676, 577);
    }

    if (this.waveIndex >= 1 && this.isWaitingForClear && this.waveIndex < this.totalWaves) {
      ctx.fillStyle = 'rgba(20, 28, 40, 0.88)';
      ctx.beginPath();
      ctx.roundRect(484, 564, 296, 26, 13);
      ctx.fill();
      ctx.strokeStyle = '#e67e22';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fillStyle = '#f39c12';
      ctx.font = 'bold 11.5px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚔️ Hạ gần hết hải tặc để gọi đợt kế tiếp!', 632, 577);
    }

    const px = 786;
    const py = 564;
    const pw = 268;
    const ph = 26;

    ctx.fillStyle = 'rgba(20, 28, 40, 0.88)';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 13);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.stroke();

    const prog = Math.min(1.0, this.waveIndex / Math.max(1, this.totalWaves));
    const fillW = (pw - 6) * prog;
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.roundRect(px + pw - 3 - fillW, py + 3, fillW, ph - 6, 10);
    ctx.fill();

    this.currentStage.waves.forEach((w, idx) => {
      if (w.isHugeWave) {
        const fx = px + pw - ((idx + 1) / this.totalWaves) * (pw - 18) - 8;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚩', fx, py - 4);
      }
    });

    const skullX = px + pw - 10 - (pw - 20) * prog;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏴‍☠️', skullX, py + ph / 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentStage.name.split(':')[0]} • ĐỢT ${this.waveIndex}/${this.totalWaves}`, px + pw / 2, py + ph / 2);

    ctx.restore();
  }

  renderHugeWaveBanner(ctx) {
    ctx.save();
    const alpha = Math.min(1.0, this.hugeWaveAlertTimer);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(180, 30, 30, 0.88)';
    ctx.fillRect(0, 245, 1068, 88);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 245, 1068, 88);

    const txt = this.isFinalWaveBanner
      ? '☠️ ĐỢT TẤN CÔNG CUỐI CÙNG CỦA HẠM ĐỘI TỨ HOÀNG! ☠️'
      : '⚠️ MỘT ĐỢT HẢI TẶC KHỔNG LỒ ĐANG TỚI! ⚠️';

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10;
    ctx.fillText(txt, 534, 289);
    ctx.restore();
  }

  renderLootDropOverlay(ctx) {
    if (!this.lootCard) return;
    const c = this.lootCard;
    const def = c.unitId ? UNIT_TYPES[c.unitId] : null;

    ctx.save();
    ctx.fillStyle = c.isCollecting ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, 1068, 600);

    ctx.save();
    ctx.translate(c.x, c.y);
    const scale = c.isCollecting ? (1.0 + c.collectTimer * 1.1) : (1.0 + Math.sin(c.pulseTime * 5) * 0.06);
    ctx.scale(scale, scale);

    ctx.save();
    ctx.rotate(c.pulseTime * 1.2);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = 'rgba(241, 196, 15, 0.28)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-14, -95);
      ctx.lineTo(14, -95);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.roundRect(-44, -54, 88, 108, 10);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    if (c.unitId) {
      Unit.renderPortrait(ctx, c.unitId, 0, -10, 68, this.globalTime, this.assets);
    } else {
      ctx.font = '46px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏆', 0, -8);
    }

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(def ? def.shortName : 'CÚP CHIẾN THẮNG', 0, 40);
    ctx.restore();

    if (!c.isCollecting) {
      const arrowBob = Math.sin(c.pulseTime * 7) * 8;
      ctx.fillStyle = '#f1c40f';
      ctx.font = '900 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      const msg = def ? '👇 CHẠM ĐỂ CHIÊU MỘ ĐỒNG ĐỘI MỚI!' : '👇 CHẠM NHẬN CÚP MARINEFORD!';
      ctx.strokeText(msg, c.x, c.y - 78 + arrowBob);
      ctx.fillText(msg, c.x, c.y - 78 + arrowBob);
    }

    ctx.restore();
  }

  renderTitleScreen(ctx) {
    // 1. Khởi tạo video intro 1 lần duy nhất và phát có tiếng ngay từ đầu
    if (!this.titleVideo) {
      this.titleVideo = document.createElement('video');
      this.titleVideo.src = 'assets/intro_bg/intro_bg2.mp4';
      this.titleVideo.loop = false;
      this.titleVideo.playsInline = true;
      this.titleVideo.muted = false; // Luôn bật tiếng sẵn
      this.titleVideo.volume = this.audio.getVolume();
      this.titleVideoFinished = false;

      // Chạy hết video -> tự chuyển sang ảnh tĩnh và bật nhạc nền Menu
      this.titleVideo.addEventListener('ended', () => {
        this.titleVideoFinished = true;
        this.audio.startTitleMusic();
      });
      // Lỗi đường dẫn video -> tự bỏ qua để vào thẳng màn hình chính
      this.titleVideo.addEventListener('error', () => {
        this.titleVideoFinished = true;
        this.audio.startTitleMusic();
      });

      this.titleVideo.play().catch(() => {
        // Dự phòng nếu trình duyệt siết chặt autoplay lúc mới mở tab lần đầu
        this.titleVideo.muted = false;
        this.titleVideo.play().catch(() => {});
      });
    }
    // 2. KHI VIDEO ĐANG CHẠY -> Chỉ vẽ video + chữ nhỏ "Chạm vào màn hình để bỏ qua", ẩn toàn bộ nút!
    if (!this.titleVideoFinished && !this.titleVideo.ended) {
      if (this.titleVideo.readyState >= 2) {
        ctx.drawImage(this.titleVideo, 0, 0, 1068, 600);
      } else {
        ctx.fillStyle = '#0c1017';
        ctx.fillRect(0, 0, 1068, 600);
      }

      // Vẽ dòng chữ nhỏ nhấp nháy nhẹ ở góc dưới bên phải để hướng dẫn người chơi
      const pulseAlpha = 0.55 + Math.sin(performance.now() / 320) * 0.35;
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.font = '600 15px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeText('Chạm vào màn hình để bỏ qua ⏭', 1044, 582);
      ctx.fillStyle = '#f1f2f6';
      ctx.fillText('Chạm vào màn hình để bỏ qua ⏭', 1044, 582);
      ctx.restore();

      return; // Thoát hàm tại đây để không vẽ ảnh tĩnh và các nút bấm bên dưới!
    }
    const bg = this.assets.get('bg_title');
    if (bg) {
      ctx.drawImage(bg, 0, 0, 1068, 600);
    } else {
      ctx.fillStyle = '#1a2a6c';
      ctx.fillRect(0, 0, 1068, 600);
    }

    const vig = ctx.createLinearGradient(0, 0, 0, 600);
    vig.addColorStop(0, 'rgba(10, 15, 28, 0.55)');
    vig.addColorStop(0.5, 'rgba(10, 15, 28, 0.18)');
    vig.addColorStop(1, 'rgba(10, 15, 28, 0.72)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, 1068, 600);

    for (let i = 0; i < 18; i++) {
      const ex = (i * 79 + this.globalTime * 28) % 1068;
      const ey = (600 - ((i * 59 + this.globalTime * 42) % 600));
      ctx.fillStyle = 'rgba(255, 215, 64, 0.65)';
      ctx.beginPath();
      ctx.arc(ex, ey, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Nút Tài Khoản Thuyền Trưởng góc trên trái
    ctx.save();
    ctx.fillStyle = 'rgba(16, 24, 36, 0.92)';
    ctx.beginPath();
    ctx.roundRect(20, 16, 320, 48, 10);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const shortName = this.activeAccountName.length > 18
      ? this.activeAccountName.slice(0, 17) + '…'
      : this.activeAccountName;
    ctx.fillText(`👤 ${shortName}`, 32, 32);

    ctx.fillStyle = '#2ecc71';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText(`${this.syncStatusText} • Màn ${this.maxUnlockedStage} • Chạm đổi TK`, 32, 51);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 16;

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 50px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#181828';
    ctx.strokeText('HẢI QUÂN ĐẠI CHIẾN HẢI TẶC', 534, 128);
    ctx.fillText('HẢI QUÂN ĐẠI CHIẾN HẢI TẶC', 534, 128);

    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 20px "Segoe UI", sans-serif';
    ctx.strokeText('ONE PIECE • MARINE TOWER DEFENSE (VERSION 6)', 534, 174);
    ctx.fillText('ONE PIECE • MARINE TOWER DEFENSE (VERSION 6)', 534, 174);
    ctx.restore();

    this.renderVolumeSlider(ctx, this.getVolumeRect());
    this.renderGoldChip(ctx, 924, 18, 126, 46);

    const t = performance.now() / 1000;
    const mx = this.mousePos ? this.mousePos.x : -1;
    const my = this.mousePos ? this.mousePos.y : -1;
    const isHover = (x, y, w, h) => mx >= x && mx <= x + w && my >= y && my <= y + h;

    this.drawProButton(ctx, {
      x: 394, y: 306, w: 280, h: 62,
      text: '▶ CHƠI NGAY (MÀN ' + this.maxUnlockedStage + ')',
      isPrimary: true,
      isHovered: isHover(394, 306, 280, 62),
      fontSize: 20
    }, t);

    this.drawProButton(ctx, {
      x: 394, y: 384, w: 280, h: 56,
      text: '🗺️ BẢN ĐỒ ĐẠI HẢI TRÌNH',
      isHovered: isHover(394, 384, 280, 56),
      fontSize: 16
    }, t);

    this.drawProButton(ctx, {
      x: 150, y: 458, w: 240, h: 52,
      text: '📖 BÁCH KHOA TOÀN THƯ',
      isHovered: isHover(150, 458, 240, 52),
      fontSize: 15
    }, t);

    this.drawProButton(ctx, {
      x: 414, y: 458, w: 240, h: 52,
      text: '❓ HƯỚNG DẪN CHƠI',
      isHovered: isHover(414, 458, 240, 52),
      fontSize: 15
    }, t);

    this.drawProButton(ctx, {
      x: 678, y: 458, w: 240, h: 52,
      text: '🏪 SHOP VÀNG',
      isHovered: isHover(678, 458, 240, 52),
      fontSize: 15
    }, t);

    this.drawProButton(ctx, {
      x: 20, y: 544, w: 170, h: 36,
      text: '🔄 Reset Tài Khoản',
      isHovered: isHover(20, 544, 170, 36),
      fontSize: 12
    }, t);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Tài khoản [${this.activeAccountName}]: Đã mở ${this.unlockedUnits.length}/${Object.keys(UNIT_TYPES).length} Binh chủng • Màn ${this.maxUnlockedStage}/${STAGES.length}`,
      534,
      575
    );
  }

  renderStageSelectScreen(ctx) {
    const bg = this.assets.get('bg_map');
    if (bg) {
      ctx.drawImage(bg, 0, 0, 1068, 600);
    } else {
      ctx.fillStyle = '#2f3640';
      ctx.fillRect(0, 0, 1068, 600);
    }

    ctx.fillStyle = 'rgba(18, 24, 34, 0.85)';
    ctx.fillRect(0, 0, 1068, 74);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 1068, 74);

    this.renderMenuButton(ctx, 28, 16, 112, 42, '⬅ VỀ', '#7f8c8d', '#95a5a6', 15);

    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ BẢN ĐỒ ĐẠI HẢI TRÌNH — 9 CHIẾN DỊCH', 500, 44);
    this.renderMenuButton(ctx, 900, 16, 150, 42, '🏪 SHOP VÀNG', '#b7791f', '#f1c40f', 14);
    this.renderGoldChip(ctx, 760, 14, 126, 46);

    const nodes = this.getIslandNodes();

    ctx.save();
    ctx.strokeStyle = '#f1c40f';
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.stroke();
    ctx.restore();

    nodes.forEach((pos, idx) => {
      const stage = STAGES[idx];
      const stageNum = idx + 1;
      const isUnlocked = stageNum <= this.maxUnlockedStage;
      const isCurrent = stageNum === this.maxUnlockedStage;
      const isLegendStage = stageNum >= 6;

      if (isCurrent) {
        const pulse = 40 + Math.sin(this.globalTime * 5) * 5;
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = !isUnlocked ? '#4b5563' : isLegendStage ? '#c0392b' : '#27ae60';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isUnlocked ? '#f1c40f' : '#1f2937';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 21px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isUnlocked ? stageNum.toString() : '🔒', pos.x, pos.y);

      const shortTitle = stage.name.replace(/^Màn \d+:\s*/, '');
      ctx.fillStyle = 'rgba(15, 20, 30, 0.9)';
      ctx.beginPath();
      ctx.roundRect(pos.x - 84, pos.y + 36, 168, 25, 6);
      ctx.fill();
      ctx.strokeStyle = isUnlocked ? '#f1c40f' : '#555';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = isUnlocked ? '#f1c40f' : '#9ca3af';
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.fillText(`M${stageNum}: ${shortTitle}`, pos.x, pos.y + 49);
    });
  }

  renderPauseModal(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(0, 0, 1068, 600);

    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.roundRect(374, 140, 320, 350, 14);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TẠM DỪNG', 534, 190);

    this.renderMenuButton(ctx, 414, 230, 240, 46, '▶ TIẾP TỤC', '#27ae60', '#2ecc71', 16);
    this.renderMenuButton(ctx, 414, 290, 240, 46, '🔄 CHƠI LẠI', '#e67e22', '#f39c12', 16);
    this.renderVolumeSlider(ctx, this.getVolumeRect());
    this.renderMenuButton(ctx, 414, 410, 240, 46, '🗺️ CHỌN MÀN KHÁC', '#8e44ad', '#9b59b6', 15);
  }

  renderVictoryScreen(ctx) {
    const vGrad = ctx.createRadialGradient(534, 280, 40, 534, 280, 560);
    vGrad.addColorStop(0, '#f39c12');
    vGrad.addColorStop(0.65, '#b83227');
    vGrad.addColorStop(1, '#121824');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, 1068, 600);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 40px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 6;
    ctx.strokeText('🏆 CHIẾN THẮNG HUY HOÀNG! 🏆', 534, 74);
    ctx.fillText('🏆 CHIẾN THẮNG HUY HOÀNG! 🏆', 534, 74);

    if (this.rewardUnitDef) {
      const def = this.rewardUnitDef;

      ctx.fillStyle = 'rgba(20, 28, 40, 0.94)';
      ctx.beginPath();
      ctx.roundRect(274, 118, 520, 342, 16);
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#2ecc71';
      ctx.font = '900 18px "Segoe UI", sans-serif';
      ctx.fillText('★ BẠN VỪA CHIÊU MỘ ĐƯỢC LỰC LƯỢNG MỚI! ★', 534, 152);

      Unit.renderPortrait(ctx, def.id, 534, 240, 140, this.globalTime, this.assets);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Segoe UI", sans-serif';
      ctx.fillText(def.name, 534, 336);

      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 14px "Segoe UI", sans-serif';
      ctx.fillText(`Vai trò: ${def.role}  |  Giá: ${def.cost} Beli  |  Hồi chiêu: ${def.cooldown}s`, 534, 368);

      ctx.fillStyle = '#dfe6e9';
      ctx.font = '13px "Segoe UI", sans-serif';
      this.drawWrappedText(ctx, def.description, 534, 404, 476, 20, 'center');
    } else {
      ctx.fillStyle = 'rgba(20, 28, 40, 0.92)';
      ctx.beginPath();
      ctx.roundRect(214, 156, 640, 248, 16);
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '72px sans-serif';
      ctx.fillText('🎖️⚓🏆', 534, 232);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 24px "Segoe UI", sans-serif';
      ctx.fillText('ĐẠI THẮNG MARINEFORD! CHÍNH NGHĨA TOÀN THẮNG!', 534, 310);
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillText('Các Đô Đốc & Thất Vũ Hải đã đánh bại hạm đội Tứ Hoàng bảo vệ Tân Thế Giới!', 534, 350);
    }

    ctx.save();
    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = '#181828';
    ctx.lineWidth = 4;
    const goldLine = `🪙 Vàng Khối nhặt được: +${this.goldEarnedThisStage}  •  Tổng: ${this.goldBars} (ghé SHOP VÀNG để tiêu!)`;
    ctx.strokeText(goldLine, 534, 472);
    ctx.fillText(goldLine, 534, 472);
    ctx.restore();

    const nextLabel = this.currentStageIndex + 1 < STAGES.length
      ? '⚔️ SOẠN ĐỘI HÌNH MÀN TIẾP THEO ➔'
      : '🗺️ QUAY VỀ BẢN ĐỒ';
    this.renderMenuButton(ctx, 364, 480, 340, 58, nextLabel, '#27ae60', '#2ecc71', 17);
  }

  renderGameOverScreen(ctx) {
    ctx.fillStyle = 'rgba(12, 12, 16, 0.94)';
    ctx.fillRect(0, 0, 1068, 600);

    ctx.fillStyle = '#e74c3c';
    ctx.font = '900 44px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HẢI TẶC ĐÃ CHIẾM ĐÓNG CĂN CỨ!', 534, 180);

    ctx.font = '72px sans-serif';
    ctx.fillText('☠️', 534, 275);

    ctx.fillStyle = '#bdc3c7';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('Phòng tuyến bị xuyên thủng! Hãy sắp xếp lại đội hình Hải Quân và phục thù!', 534, 355);

    this.renderMenuButton(ctx, 344, 420, 175, 56, '🔄 THỬ LẠI', '#27ae60', '#2ecc71', 17);
    this.renderMenuButton(ctx, 549, 420, 175, 56, '🗺️ CHỌN MÀN', '#2980b9', '#3498db', 17);
  }

  renderAlmanacScreen(ctx) {
    ctx.fillStyle = '#141c28';
    ctx.fillRect(0, 0, 1068, 600);

    this.renderMenuButton(ctx, 34, 20, 106, 42, '⬅ QUAY LẠI', '#7f8c8d', '#95a5a6', 13);
    this.renderMenuButton(ctx, 160, 20, 140, 42, '🛡️ HẢI QUÂN', this.almanacTab === 'UNITS' ? '#2980b9' : '#2c3e50', '#3498db', 15);
    this.renderMenuButton(ctx, 320, 20, 140, 42, '🏴‍☠️ HẢI TẶC', this.almanacTab === 'PIRATES' ? '#c0392b' : '#2c3e50', '#e74c3c', 15);

    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.roundRect(34, 78, 400, 498, 10);
    ctx.fill();

    ctx.fillStyle = '#25313d';
    ctx.beginPath();
    ctx.roundRect(454, 78, 580, 498, 10);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this.almanacTab === 'UNITS') {
      const unitKeys = Object.keys(UNIT_TYPES);
      unitKeys.forEach((key, idx) => {
        const u = UNIT_TYPES[key];
        const isSel = this.almanacSelectedId === key;
        const itemY = 88 + idx * 48;

        ctx.fillStyle = isSel ? '#16a085' : '#2c3e50';
        ctx.beginPath();
        ctx.roundRect(46, itemY, 376, 43, 8);
        ctx.fill();

        Unit.renderPortrait(ctx, key, 72, itemY + 21, 36, this.globalTime, this.assets);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(u.name, 104, itemY + 18);

        ctx.fillStyle = u.skillCooldown ? (u.skillColor || '#00d2ff') : '#f1c40f';
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillText(`${u.role} • ${u.cost} Beli${u.skillName ? ' • ⚡ ' + u.skillName : ''}`, 104, itemY + 34);
      });

      const sel = UNIT_TYPES[this.almanacSelectedId] || UNIT_TYPES.DEN_DEN_MUSHI;
      Unit.renderPortrait(ctx, sel.id, 744, 184, 155, this.globalTime, this.assets);

      ctx.fillStyle = '#f1c40f';
      ctx.font = '900 24px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sel.name, 744, 294);

      ctx.fillStyle = sel.skillColor || '#00d2d3';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.fillText(sel.skillName ? `Vai trò: ${sel.role}  •  Skill: ${sel.skillName}` : `Vai trò: ${sel.role}`, 744, 330);

      ctx.fillStyle = '#ffffff';
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillText(`Chi phí: ${sel.cost} Beli  |  Hồi chiêu thẻ: ${sel.cooldown}s  |  HP: ${sel.maxHp}`, 744, 364);

      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.roundRect(484, 396, 520, 145, 10);
      ctx.fill();
      ctx.fillStyle = '#ecf0f1';
      ctx.font = '14px "Segoe UI", sans-serif';
      this.drawWrappedText(ctx, sel.description, 744, 452, 476, 22, 'center');
    } else {
      const pirateKeys = Object.keys(PIRATE_TYPES);
      pirateKeys.forEach((key, idx) => {
        const p = PIRATE_TYPES[key];
        const isSel = this.almanacSelectedId === key;
        const itemY = 88 + idx * 53;

        ctx.fillStyle = isSel ? '#c0392b' : '#2c3e50';
        ctx.beginPath();
        ctx.roundRect(46, itemY, 376, 48, 8);
        ctx.fill();

        const spr = this.assets ? this.assets.get(`pirate_${key}`) : null;
        if (spr) {
          ctx.drawImage(spr, 0, 0, 256, 256, 50, itemY + 2, 44, 44);
        } else {
          const miniPirate = new Pirate(key, 0, 0);
          ctx.save();
          ctx.translate(72, itemY + 42);
          ctx.scale(0.42, 0.42);
          miniPirate.drawModel(ctx, 0, 0, this.assets);
          ctx.restore();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        ctx.fillText(p.name, 102, itemY + 20);

        ctx.fillStyle = p.isBoss ? '#f1c40f' : '#ff7675';
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillText(`HP: ${p.hp}${p.armorHp ? ' | Giáp: ' + p.armorHp : ''}${p.isBoss ? ' • ★ BOSS ★' : ''}`, 102, itemY + 37);
      });

      const selP = PIRATE_TYPES[this.almanacSelectedId] || PIRATE_TYPES.PIRATE_GRUNT;
      const previewPirate = new Pirate(selP.id, 0, 5);
      previewPirate.walkCycle = this.globalTime * 4;
      ctx.save();
      ctx.translate(744, 214);
      const pScale = (selP.id === 'OARS_GIANT' || selP.id === 'WHITEBEARD') ? 1.12 : 1.38;
      ctx.scale(pScale, pScale);
      const legS = Math.sin(previewPirate.walkCycle) * 7;
      const armS = Math.cos(previewPirate.walkCycle) * 0.25;
      previewPirate.drawModel(ctx, legS, armS, this.assets);
      ctx.restore();

      ctx.fillStyle = '#ff6b6b';
      ctx.font = '900 24px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(selP.name, 744, 256);

      ctx.fillStyle = '#ffffff';
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillText(`Máu: ${selP.hp} HP  |  Giáp: ${selP.armorHp || 0} HP`, 744, 298);
      ctx.fillText(`Tốc độ: ${selP.speed} px/s  |  Sát thương: ${selP.attack} DPS`, 744, 332);

      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.roundRect(484, 368, 520, 165, 10);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.fillText('ĐẶC ĐIỂM NHẬN DẠNG & ĐỐI PHÓ:', 744, 405);

      let desc = 'Hải tặc cơ bản áp sát chém phá công sự Hải Quân.';
      if (selP.id === 'BARREL_PIRATE') desc = `Đội thùng gỗ đỡ ${selP.armorHp} sát thương trước khi lộ người.`;
      if (selP.id === 'ARMORED_PIRATE') desc = `Giáp sắt siêu cứng chặn ${selP.armorHp} sát thương; cần Mihawk hoặc bom.`;
      if (selP.id === 'BUGGY_JUMPER') desc = `Cầm sào nhảy vọt qua ${selP.vaultCols || 1.4} ô lính đầu tiên! Dùng Mìn 25B, Bom Đôi hoặc Khiên Sắt chặn.`;
      if (selP.id === 'BERSERKER_SWORDSMAN') desc = 'Khi vỡ khiên nổi điên chạy rất nhanh! Cần Aokiji làm chậm.';
      if (selP.id === 'OARS_GIANT') desc = `Boss khổng lồ ${selP.hp} HP dẫm nát mọi lính trên đường.`;
      if (selP.id === 'MARCO_PHOENIX') desc = `Tái sinh +${selP.healPerSec || 24} HP/s bằng lửa xanh & bay vọt! Dùng Aokiji đóng băng!`;
      if (selP.id === 'BLACKBEARD') desc = `Dùng Ám Huyệt Kurouzu làm choáng lính tuyến trước ${selP.bossStunDuration || 2.8}s!`;
      if (selP.id === 'WHITEBEARD') desc = `Tứ Hoàng ${selP.hp} HP! Tung Chấn Động Gura Gura (${selP.bossSkillDamage || 160} DMG) cả hàng!`;

      ctx.fillStyle = '#ecf0f1';
      ctx.font = '13.5px "Segoe UI", sans-serif';
      this.drawWrappedText(ctx, desc, 744, 446, 476, 22, 'center');
    }
  }

  renderGuideScreen(ctx) {
    ctx.fillStyle = '#141c28';
    ctx.fillRect(0, 0, 1068, 600);

    this.renderMenuButton(ctx, 34, 20, 106, 42, '⬅ VỀ', '#7f8c8d', '#95a5a6', 14);
    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 25px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❓ HƯỚNG DẪN CHƠI — PHIÊN BẢN V6 • SHOP VÀNG & ÂM LƯỢNG', 558, 46);

    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.roundRect(56, 82, 956, 494, 14);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.stroke();

    const tips = [
      { icon: '🎨', title: '1. Đồ Họa 3D Chân Thực Chuẩn PvZ & Lưới Khớp Mọi Ải', desc: 'Toàn bộ Hải Quân, Hải Tặc, Chiến Hạm & 4 bản đồ (Cỏ, Cát, Boong Tàu, Băng Marineford) được nâng cấp tạo khối 3D nổi bật, chuẩn 5x9 ô phối cảnh.' },
      { icon: '💣', title: '2. Mìn 25B & Bom Đôi Buster Call', desc: 'Mìn Hải Lâu Thạch (25 Beli) chôn 8.5s rồi trồi lên, hải tặc dẫm trúng nổ 1800 DMG. Bom Đôi Buster Call + Trái Ác Quỷ (150 Beli) nổ tức thì vùng 3x3 ô (1800 DMG xuyên giáp)!' },
      { icon: '🪙', title: '3. Vàng Khối & Shop Vàng', desc: 'Hải tặc chết có 20% rơi Vàng Khối (Boss chắc chắn rơi) - chạm để nhặt. Vào SHOP VÀNG mua thêm ô bài (tối đa 9), kỹ năng Đô Đốc Aokiji / Akainu và Trái Ác Quỷ cường hóa. Kéo thanh ⛶ âm lượng để chỉnh tiếng.' },
      { icon: '🪪', title: '4. Tài Khoản Thuyền Trưởng Lưu Vĩnh Viễn & Tự Sửa Thông Số', desc: 'Chạm "👤 Tên Tài Khoản" ở góc trên trái để lưu vĩnh viễn trên máy chủ. Chỉnh thông số trong Units.js, Pirates.js, Stages.js rồi bấm F5!' },
      { icon: '⚡', title: '5. Tuyệt Chiêu Đô Đốc & Chế Độ Điện Thoại Toàn Màn Hình', desc: 'Aokiji đóng băng hàng; Crocodile thổi bão cát đẩy lùi; Mihawk chém hắc kiếm xuyên giáp; Akainu dội 5 thiên thạch. Bấm "⛶ Toàn màn hình" để chơi mượt!' }
    ];

    let ty = 110;
    tips.forEach(t => {
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(t.icon, 84, ty + 24);

      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 15.5px "Segoe UI", sans-serif';
      ctx.fillText(t.title, 134, ty + 14);

      ctx.fillStyle = '#ecf0f1';
      ctx.font = '13.5px "Segoe UI", sans-serif';
      this.drawWrappedText(ctx, t.desc, 134, ty + 36, 845, 20, 'left');

      ty += 92;
    });
  }

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, align = 'left') {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    ctx.save();
    ctx.textAlign = align;
    lines.forEach((line, idx) => {
      ctx.fillText(line, x, y + idx * lineHeight);
    });
    ctx.restore();
    return lines.length;
  }

  renderMenuButton(ctx, x, y, w, h, text, color1, color2, fontSize = 16) {
    ctx.save();
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, color2);
    grad.addColorStop(1, color1);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 9);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 4;
    ctx.fillText(text, x + w / 2, y + h / 2);

    ctx.restore();
  }
  /**
   * Vẽ nút bấm phong cách Game Mobile 3D + Animation
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} opt { x, y, w, h, text, topColor, bottomColor, edgeColor, glowColor, isPrimary, isHovered, isPressed }
   * @param {number} time - thời gian chạy game (tính bằng giây, ví dụ performance.now() / 1000)
   */
  drawProButton(ctx, opt, time) {
    const {
      x, y, w, h, text,
      isPrimary = false,
      isHovered = false,
      isPressed = false,
      fontSize = isPrimary ? 20 : 15
    } = opt;

    const r = 8; // Bo góc nhẹ chuẩn Kiểu 3
    const cx = x + w / 2;
    const cy = y + h / 2;

    // 1. Hiệu ứng co giãn (Nhịp thở cho nút chính + Phóng to khi di chuột)
    let scale = 1;
    if (isPressed) {
      scale = 0.96;
    } else if (isHovered) {
      scale = 1.05;
    } else if (isPrimary) {
      scale = 1 + Math.sin(time * 3.5) * 0.022;
    }

    const pulse = isPrimary ? (0.5 + 0.5 * Math.sin(time * 3.5)) : 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    // 2. Nền Kính Mờ Kiểu 3 + Hào quang tỏa sáng
    ctx.save();
    if (isPrimary) {
      ctx.shadowColor = isHovered ? 'rgba(46, 204, 113, 0.9)' : `rgba(46, 204, 113, ${0.45 + pulse * 0.3})`;
      ctx.shadowBlur = isHovered ? 24 : 16;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, isHovered ? 'rgba(46, 204, 113, 0.95)' : 'rgba(34, 153, 84, 0.88)');
      grad.addColorStop(1, 'rgba(20, 90, 50, 0.92)');
      ctx.fillStyle = grad;
    } else {
      ctx.shadowColor = isHovered ? 'rgba(241, 196, 15, 0.6)' : 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = isHovered ? 20 : 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = isHovered ? 'rgba(28, 38, 52, 0.9)' : 'rgba(14, 19, 28, 0.78)';
    }

    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.fill();
    ctx.restore();

    // 3. Hiệu ứng Vệt Sáng Quét Chéo (Shine Sweep) gọn trong khung kính
    if (isPrimary || isHovered) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, r);
      ctx.clip();

      const cycle = (time * 0.9) % 2.2; // 2.2 giây quét 1 lần
      if (cycle < 1.0) {
        const sweepX = -w * 0.4 + cycle * (w * 1.8);
        const shineGrad = ctx.createLinearGradient(sweepX - 30, 0, sweepX + 30, 0);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shineGrad.addColorStop(0.5, isPrimary ? 'rgba(255, 255, 255, 0.42)' : 'rgba(241, 196, 15, 0.28)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGrad;
        ctx.beginPath();
        ctx.moveTo(sweepX - 20, 0);
        ctx.lineTo(sweepX + 25, 0);
        ctx.lineTo(sweepX - 5, h);
        ctx.lineTo(sweepX - 50, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Viền mảnh tinh tế phát sáng khi hover
    ctx.strokeStyle = isPrimary
      ? (isHovered ? '#b9f6ca' : '#2ecc71')
      : (isHovered ? '#f1c40f' : 'rgba(241, 196, 15, 0.55)');
    ctx.lineWidth = isHovered ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.roundRect(0.7, 0.7, w - 1.4, h - 1.4, r);
    ctx.stroke();

    // 5. Chữ trắng sắc nét
    ctx.font = `700 ${fontSize}px "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillText(text, w / 2, h / 2 + 1.5);
    ctx.fillStyle = isHovered && !isPrimary ? '#fff3b0' : '#ffffff';
    ctx.fillText(text, w / 2, h / 2);

    ctx.restore();
  }
  
}
