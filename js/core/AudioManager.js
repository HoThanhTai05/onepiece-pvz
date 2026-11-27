/**
 * Web Audio API Synthesizer for One Piece PvZ (Marine vs Pirates)
 * 100% Procedural, Zero External Dependency, Zero Latency.
 *
 * Version 6:
 *  - Thanh kéo âm lượng 0-100% (setVolume / getVolume) lưu bền trong localStorage.
 *  - Đợt Cuối kịch tính hơn: còi 3 tầng + trống trận + sấm rền, và nhạc nền chiến trận dồn dập (startFinalWaveBGM).
 *  - Thêm âm thanh rơi / nhặt Vàng Khối, mua đồ Shop Vàng.
 */

const VOLUME_KEY = 'op_pvz_volume';

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.noiseBuffer = null;
    this.isMuted = false;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmMode = 'normal'; // 'normal' | 'final'

    // Âm lượng tổng 0..1 (mặc định 80%)
    this.volume = 0.8;
    try {
      const saved = parseFloat(localStorage.getItem(VOLUME_KEY));
      if (!Number.isNaN(saved)) this.volume = Math.min(1, Math.max(0, saved));
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
    
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.45;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.65;
      this.musicGain.connect(this.masterGain);

      // Bộ đệm nhiễu trắng dùng cho trống snare / sấm
      const len = Math.floor(this.ctx.sampleRate * 1.2);
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  applyMasterVolume() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  getVolume() {
    return this.volume;
  }

  /** Đặt âm lượng 0..1 (kéo thanh trượt). Kéo lên > 0 sẽ tự bật lại tiếng nếu đang tắt. */
  setVolume(v) {
    this.volume = Math.min(1, Math.max(0, Number(v) || 0));
    if (this.volume > 0 && this.isMuted) this.isMuted = false;
    this.applyMasterVolume();
    try {
      localStorage.setItem(VOLUME_KEY, String(this.volume));
    } catch {
      // Bỏ qua
    }
    return this.volume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && this.volume <= 0.01) this.volume = 0.6;
    this.applyMasterVolume();
    return this.isMuted;
  }

  isSilent() {
    return this.isMuted || this.volume <= 0.001;
  }

  // --- HÀM TIỆN ÍCH ÂM THANH ---

  /** Một nốt đơn giản (osc + envelope) */
  tone(type, f0, f1, t, dur, vol, dest = null) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + dur);
    osc.connect(gain);
    gain.connect(dest || this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Nhiễu trắng có lọc (trống snare / sấm) */
  noise(t, dur, vol, filterType = 'lowpass', freq = 800, dest = null) {
    if (!this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest || this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  /** Trống trận (kick sâu) */
  drum(t, vol = 0.7, dest = null) {
    this.tone('sine', 150, 42, t, 0.22, vol, dest);
    this.noise(t, 0.05, vol * 0.25, 'lowpass', 400, dest);
  }

  // --- SOUND EFFECTS ---

  /** Tiếng súng trường Hải Quân */
  playGunshot() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('sawtooth', 380, 80, t, 0.12, 0.22);
  }

  /** Tiếng nổ lớn (Bom Đôi / Mìn / Thiên Thạch) */
  playCannon() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('triangle', 140, 30, t, 0.4, 0.7);
    this.noise(t, 0.35, 0.4, 'lowpass', 900);
  }

  /** Tiếng nhặt tiền Beli (leng keng) */
  playBeli() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [659, 987].forEach((freq, idx) => {
      this.tone('sine', freq, freq, t + idx * 0.06, 0.14, 0.35);
    });
  }

  /** Tiếng Vàng Khối rơi xuống đất (coong coong) */
  playGoldDrop() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('triangle', 880, 880, t, 0.22, 0.4);
    this.tone('sine', 1320, 1320, t + 0.07, 0.3, 0.3);
    this.tone('sine', 1760, 1760, t + 0.14, 0.35, 0.22);
  }

  /** Tiếng nhặt Vàng Khối (chuông vàng lấp lánh đi lên) */
  playGoldCollect() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [784, 988, 1175, 1568].forEach((freq, i) => {
      this.tone('sine', freq, freq, t + i * 0.055, 0.2, 0.32);
    });
  }

  /** Tiếng mua đồ ở Shop Vàng (két tiền + chuông) */
  playShopBuy() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('square', 523, 523, t, 0.09, 0.22);
    this.tone('square', 659, 659, t + 0.09, 0.09, 0.22);
    this.tone('square', 784, 784, t + 0.18, 0.09, 0.22);
    this.tone('sine', 1047, 1047, t + 0.27, 0.45, 0.35);
    this.noise(t + 0.02, 0.1, 0.12, 'highpass', 4000);
  }

  /** Tiếng báo lỗi / không đủ vàng */
  playDenied() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('square', 200, 120, t, 0.2, 0.25);
  }

  /** Tiếng bố trí lính hải quân xuống ô */
  playPlant() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('sine', 220, 120, t, 0.12, 0.4);
  }

  /** Tiếng hải tặc chém / tấn công lính */
  playChomp() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('square', 160, 60, t, 0.09, 0.22);
  }

  /**
   * Tiếng còi báo động Đợt Tấn Công Lớn.
   * isFinalWave = true: kịch tính hơn nhiều (còi 3 tầng + trống trận + sấm rền).
   */
  playHugeWave(isFinalWave = false) {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (!isFinalWave) {
      this.tone('sawtooth', 260, 440, t, 0.4, 0.6);
      this.tone('sawtooth', 440, 260, t + 0.4, 0.45, 0.5);
      this.drum(t, 0.6);
      this.drum(t + 0.45, 0.6);
      return;
    }

    // Còi chiến tranh 3 tầng (hợp âm thứ trầm hùng) vang 2 hồi
    const horn = (start, base) => {
      [base, base * 1.189, base * 1.498].forEach((f) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f * 0.92, start);
        osc.frequency.linearRampToValueAtTime(f, start + 0.35);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, start);
        filter.frequency.linearRampToValueAtTime(2400, start + 0.4);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.38, start + 0.12);
        gain.gain.setValueAtTime(0.38, start + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 1.15);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 1.2);
      });
    };
    horn(t, 146.83);
    horn(t + 1.25, 164.81);

    // Trống trận dồn dập
    for (let i = 0; i < 14; i++) {
      this.drum(t + i * 0.14, 0.7 + (i % 4 === 0 ? 0.25 : 0));
    }
    for (let i = 0; i < 6; i++) {
      this.drum(t + 2.0 + i * 0.09, 0.85);
    }
    // Sấm rền
    this.noise(t, 2.6, 0.55, 'lowpass', 260);
    this.noise(t + 0.9, 1.8, 0.4, 'lowpass', 420);
  }

  /** Tiếng Chiến Hạm Buster Call kích hoạt dọn sạch đường */
  playWarship() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(150, t + 0.5);
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.85);
  }

  /** Tiếng thi triển Kỹ Năng Đô Đốc / Thất Vũ Hải */
  playSkillCast(kind = 'power') {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (kind === 'ice') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.45);
    } else if (kind === 'slash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.28);
    } else if (kind === 'magma') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.55);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.linearRampToValueAtTime(740, t + 0.25);
    }

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.52);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  /** Tiếng Râu Trắng Gura Gura / Boss Râu Đen thi triển chiêu */
  playBossQuake() {
    if (this.isSilent()) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone('sawtooth', 95, 28, t, 0.65, 0.85);
    this.noise(t, 0.5, 0.35, 'lowpass', 300);
  }

  // --- NHẠC NỀN ---

  /** BGM Anime Battle Melody (bình thường) - gọi startFinalWaveBGM() để đổi sang nhạc Đợt Cuối */
  startBGM() {
    if (this.isPlayingBGM) return;
    this.ensureContext();
    this.isPlayingBGM = true;
    this.bgmStep = 0;
    this.bgmMode = 'normal';

    // Giai điệu anh hùng vui nhộn (Normal BGM)
    const normalMelody = [
      440, 0, 440, 523.25, 0, 587.33, 523.25, 440,
      392, 0, 440, 0, 523.25, 659.25, 587.33, 0,
      440, 0, 440, 523.25, 0, 659.25, 783.99, 659.25,
      587.33, 523.25, 440, 392, 440, 0, 0, 0
    ];
    const normalBass = [
      110, 110, 110, 130.81, 110, 146.83, 130.81, 110,
      98, 98, 110, 110, 130.81, 164.81, 146.83, 146.83,
      110, 110, 110, 130.81, 110, 164.81, 196, 164.81,
      146.83, 130.81, 110, 98, 110, 110, 110, 0
    ];

    // Giai điệu Đợt Cuối hoàn toàn mới (Tông Đô Thứ kịch tính, tiết tấu dồn dập khác hẳn nhạc nền thường)
    const finalMelody = [
      // Câu 1: Riff dồn dập báo hiệu nguy hiểm (C minor)
      523.25, 622.25, 783.99, 622.25, 523.25, 783.99, 932.33, 783.99,
      698.46, 622.25, 587.33, 493.88, 523.25, 622.25, 783.99, 0,
      // Câu 2: Leo thang căng thẳng (Ab -> G7)
      622.25, 783.99, 932.33, 783.99, 698.46, 932.33, 1046.50, 932.33,
      783.99, 698.46, 622.25, 587.33, 783.99, 0, 987.77, 0,
      // Câu 3: Cao trào Boss Tứ Hoàng càn quét
      1046.50, 932.33, 783.99, 622.25, 1046.50, 932.33, 783.99, 622.25,
      830.61, 783.99, 698.46, 622.25, 587.33, 698.46, 783.99, 932.33,
      // Câu 4: Dồn lực tổng tấn công
      1046.50, 0, 932.33, 783.99, 698.46, 622.25, 587.33, 493.88,
      523.25, 783.99, 1046.50, 783.99, 1046.50, 0, 1046.50, 0
    ];

    // Bass Đợt Cuối chạy nhảy quãng 8 liên hoàn (Octave Gallop)
    const finalBass = [
      130.81, 261.63, 130.81, 261.63, 130.81, 261.63, 130.81, 261.63,
      116.54, 233.08, 116.54, 233.08, 98.00, 196.00, 98.00, 196.00,
      103.83, 207.65, 103.83, 207.65, 116.54, 233.08, 116.54, 233.08,
      98.00, 196.00, 98.00, 196.00, 98.00, 196.00, 123.47, 196.00,
      130.81, 261.63, 130.81, 261.63, 116.54, 233.08, 116.54, 233.08,
      103.83, 207.65, 103.83, 207.65, 98.00, 196.00, 98.00, 196.00,
      87.31, 174.61, 103.83, 207.65, 98.00, 196.00, 123.47, 246.94,
      130.81, 196.00, 261.63, 196.00, 130.81, 0, 130.81, 0
    ];

    const tick = () => {
      if (!this.isPlayingBGM) return;
      const isFinal = this.bgmMode === 'final';
      // Tốc độ đợt cuối cực nhanh (90ms) so với nhạc thường (140ms)
      const tempoMs = isFinal ? 90 : 140;

      if (!this.isSilent() && this.ctx) {
        const t = this.ctx.currentTime;
        const melody = isFinal ? finalMelody : normalMelody;
        const bass = isFinal ? finalBass : normalBass;
        const idx = this.bgmStep % melody.length;
        const note = melody[idx];
        const bNote = bass[idx];

        if (note > 0) {
          // Tiếng giai điệu đợt cuối to gấp đôi (0.34) và dày 2 bè
          this.tone(isFinal ? 'sawtooth' : 'triangle', note, note, t, isFinal ? 0.085 : 0.12, isFinal ? 0.34 : 0.2, this.musicGain);
          if (isFinal) {
            this.tone('square', note * 0.5, note * 0.5, t, 0.08, 0.22, this.musicGain);
          }
        }
        if (bNote > 0) {
          // Bass đợt cuối dày và mạnh (0.48)
          this.tone(isFinal ? 'sawtooth' : 'sine', bNote, bNote, t, isFinal ? 0.085 : 0.12, isFinal ? 0.48 : 0.25, this.musicGain);
        }

        if (isFinal) {
          // Trống trận dồn dập: Kick mạnh mỗi nhịp chẵn, Snare chát chúa + Hi-hat liên hoàn
          if (idx % 2 === 0) this.drum(t, idx % 4 === 0 ? 0.95 : 0.72, this.musicGain);
          if (idx % 4 === 2) this.noise(t, 0.09, 0.48, 'bandpass', 1800, this.musicGain);
          this.noise(t, 0.03, 0.18, 'highpass', 6000, this.musicGain);
        }
      }
      this.bgmStep++;
      this.bgmTimer = setTimeout(tick, tempoMs);
    };

    this.bgmTimer = setTimeout(tick, 100);
  }

  /** Chuyển nhạc nền sang bản Đợt Cuối kịch tính (nhanh hơn, to hơn, có trống trận) */
  startFinalWaveBGM() {
    if (!this.isPlayingBGM) this.startBGM();
    this.bgmMode = 'final';
    this.bgmStep = 0;
    if (this.musicGain) {
      this.musicGain.gain.value = 0.95; // Kích tối đa âm lượng nhạc nền khi vào đợt cuối
    }
  }

  stopBGM() {
    this.isPlayingBGM = false;
    this.bgmMode = 'normal';
    if (this.musicGain) {
      this.musicGain.gain.value = 0.65;
    }
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
  /** Nhạc chờ sảnh chính: Phong cách hải chiến nhẹ nhàng (Trống trầm + Hợp âm kèn/dây Rê thứ) */
  startTitleMusic() {
    this.ensureContext();
    if (this.titleMusicTimer) return;

    const chords = [
      [146.83, 220.00, 293.66, 349.23], // Dm (Rê thứ)
      [116.54, 174.61, 233.08, 293.66], // Bb (Si giáng trưởng)
      [130.81, 196.00, 261.63, 329.63], // C  (Đô trưởng)
      [110.00, 164.81, 220.00, 261.63]  // Am (La thứ)
    ];

    let step = 0;

    const playBar = () => {
      if (!this.ctx || this.ctx.state === 'suspended' || this.isSilent()) return;
      const now = this.ctx.currentTime;
      const chord = chords[step % chords.length];

      // 1. Nền kèn/dây trầm ấm ngân dài
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(520, now);

        const noteVol = i === 0 ? 0.14 : 0.055;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(noteVol, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 3.2);
      });

      // 2. Nhịp trống chiến tranh trầm nhẹ (Tùng... tùng... tùng)
      [0, 1.5, 2.25].forEach((offset, idx) => {
        const t = now + offset;
        const drumOsc = this.ctx.createOscillator();
        const drumGain = this.ctx.createGain();

        drumOsc.type = 'sine';
        drumOsc.frequency.setValueAtTime(idx === 0 ? 85 : 68, t);
        drumOsc.frequency.exponentialRampToValueAtTime(34, t + 0.35);

        const dVol = idx === 0 ? 0.25 : 0.16;
        drumGain.gain.setValueAtTime(dVol, t);
        drumGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

        drumOsc.connect(drumGain);
        drumGain.connect(this.musicGain);

        drumOsc.start(t);
        drumOsc.stop(t + 0.45);
      });

      step++;
    };

    playBar();
    this.titleMusicTimer = setInterval(playBar, 3000);
  }

  stopTitleMusic() {
    if (this.titleMusicTimer) {
      clearInterval(this.titleMusicTimer);
      this.titleMusicTimer = null;
    }
  }
}