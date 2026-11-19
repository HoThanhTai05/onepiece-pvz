/**
 * Main Game Entry Point (Version 4 - 1068x600 Mobile 16:9 Fullscreen + iOS Fullscreen Stretch)
 */

import { GameLoop } from './core/GameLoop.js';
import { GameManager } from './game/GameManager.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const container = document.getElementById('gameContainer');
  const rotateHint = document.getElementById('rotateHint');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const rotateFsBtn = document.getElementById('rotateFsBtn');
  const skipRotateBtn = document.getElementById('skipRotateBtn');

  // Virtual game resolution: 1068 x 600 (~16:9 mobile phone widescreen!)
  canvas.width = 1068;
  canvas.height = 600;

  let portraitDismissed = false;
  let isPseudoFullscreen = false; // Hỗ trợ phóng tràn viền 100% trên iPhone (Safari & Chrome)

  // Nhận diện thiết bị di động / iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Initialize Game Manager
  const game = new GameManager(canvas);
  window.__game = game;

  function isCurrentlyFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || isPseudoFullscreen);
  }

  // Resize and scale canvas to fit mobile/desktop screen
  function resizeGame() {
    // Lấy kích thước tràn toàn bộ màn hình (kể cả vùng tai thỏ & đáy màn hình iPhone)
    const windowWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const windowHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    // Nếu đang mở từ icon ngoài Màn hình chính iPhone (Standalone mode) thì ẩn luôn nút Toàn màn hình cho đỡ vướng
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (fullscreenBtn && isStandalone) {
      fullscreenBtn.style.display = 'none';
    }

    // Hiện nhắc xoay ngang nếu đang cầm dọc điện thoại
    if (windowHeight > windowWidth && windowWidth < 768 && !portraitDismissed) {
      if (rotateHint) rotateHint.style.display = 'flex';
    } else {
      if (rotateHint) rotateHint.style.display = 'none';
    }

    // Luôn ép Canvas phủ kín 100% chiều ngang và chiều dọc màn hình
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    // Độ phân giải vẽ bên trong giữ tỷ lệ chuẩn để tọa độ chuột/chạm trong GameManager luôn chính xác
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const pxW = Math.max(1068, Math.min(2136, Math.round(windowWidth * dpr)));
    const pxH = Math.round(pxW * 600 / 1068);
    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }
  }

  function updateFsLabel() {
    if (!fullscreenBtn) return;
    const isFs = isCurrentlyFullscreen();
    fullscreenBtn.textContent = isFs ? '✕ Thoát' : '⛶ Toàn màn hình';
    setTimeout(resizeGame, 80);
  }

  window.addEventListener('resize', resizeGame);
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      window.scrollTo(0, 1);
      resizeGame();
    }, 180);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeGame);
  }
  resizeGame();

  async function enterLandscapeFullscreen() {
    const target = container || document.documentElement;
    const canNativeFs = !isIOS && (target.requestFullscreen || target.webkitRequestFullscreen);

    if (canNativeFs) {
      try {
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else if (target.webkitRequestFullscreen) {
          await target.webkitRequestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch {
        // Nếu trình duyệt chặn Native Fullscreen thì chuyển sang Pseudo Fullscreen
        isPseudoFullscreen = true;
      }
    } else {
      // Trên iPhone (Safari & Chrome): Bật chế độ bung tràn viền 100% khung nhìn
      isPseudoFullscreen = true;
      window.scrollTo(0, 1);
    }

    portraitDismissed = true;
    updateFsLabel();
    resizeGame();
  }

  async function exitLandscapeFullscreen() {
    isPseudoFullscreen = false;
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
    } catch {
      // Ignore exit errors
    }
    updateFsLabel();
    resizeGame();
  }

  // Fullscreen support
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', async () => {
      if (!isCurrentlyFullscreen()) {
        await enterLandscapeFullscreen();
      } else {
        await exitLandscapeFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        isPseudoFullscreen = false;
      }
      updateFsLabel();
    });
    document.addEventListener('webkitfullscreenchange', () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        isPseudoFullscreen = false;
      }
      updateFsLabel();
    });
  }

  if (rotateFsBtn) {
    rotateFsBtn.addEventListener('click', () => enterLandscapeFullscreen());
  }

  if (skipRotateBtn) {
    skipRotateBtn.addEventListener('click', () => {
      portraitDismissed = true;
      resizeGame();
    });
  }

  // Prevent default scroll/bounce on mobile touch
  document.body.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
      e.preventDefault();
    }
  }, { passive: false });

  // Initialize and run the 60 FPS fixed-timestep Game Loop
  const loop = new GameLoop(
    (dt) => game.update(dt),
    () => game.render(),
    1 / 60
  );

  loop.start();
});