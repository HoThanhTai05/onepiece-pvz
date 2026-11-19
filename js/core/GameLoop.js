/**
 * Fixed Timestep Game Loop (60 FPS) with Accumulator
 * Ensures consistent physics, animations, and projectile speeds across 60Hz, 120Hz, and mobile screens.
 */

export class GameLoop {
  constructor(updateFn, renderFn, fixedStep = 1 / 60) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.fixedStep = fixedStep;
    this.fixedStepMs = fixedStep * 1000;

    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.rafId = null;

    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Clamp frame time to prevent lag explosion
    if (frameTime > 200) frameTime = 200;

    if (!this.isPaused) {
      this.accumulator += frameTime;
      while (this.accumulator >= this.fixedStepMs) {
        this.updateFn(this.fixedStep);
        this.accumulator -= this.fixedStepMs;
      }
    }

    const alpha = this.isPaused ? 0 : this.accumulator / this.fixedStepMs;
    this.renderFn(alpha);

    this.rafId = requestAnimationFrame(this.loop);
  }
}
