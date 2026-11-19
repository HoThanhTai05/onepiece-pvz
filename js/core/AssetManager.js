/**
 * Asset Manager for Version 2 Anime Visuals
 * Preloads high-resolution One Piece anime backgrounds and transparent character sprites.
 */

export class AssetManager {
  constructor() {
    this.images = {};
    this.loadedCount = 0;
    this.totalCount = 0;
    this.isReady = false;
  }

  getManifest() {
    return {
      // Backgrounds
      bg_title: 'assets/images/bg_title.png',
      bg_map: 'assets/images/bg_map.png',
      bg_battle_grass: 'assets/images/bg_battle_grass.png',
      bg_battle_wood: 'assets/images/bg_battle_wood.png',
      bg_battle_sand: 'assets/images/bg_battle_sand.png',
      bg_battle_ice: 'assets/images/bg_battle_ice.png',

      // Marine Defender & Warship 3D Sprites (Transparent PNGs)
      unit_DEN_DEN_MUSHI: 'assets/images/unit_den_den_mushi.png',
      unit_MARINE_RIFLE: 'assets/images/unit_marine_rifle.png',
      unit_MARINE_SHIELD: 'assets/images/unit_marine_shield.png',
      unit_SEASTONE_MINE: 'assets/images/unit_seastone_mine.png',
      unit_BUSTER_CANNON: 'assets/images/unit_buster_cannon.png',
      unit_MARINE_CAPTAIN: 'assets/images/unit_marine_captain.png',
      unit_AOKIJI_ICE: 'assets/images/unit_aokiji_ice.png',
      unit_CROCODILE: 'assets/images/unit_crocodile.png',
      unit_MIHAWK: 'assets/images/unit_mihawk.png',
      unit_AKAINU: 'assets/images/unit_akainu.png',
      unit_WARSHIP: 'assets/images/unit_warship.png',
      unit_saturn: 'assets/images/unit_saturn.png',
      unit_mars: 'assets/images/unit_mars.png',
      unit_warcury: 'assets/images/unit_warcury.png',
      unit_nusjuro: 'assets/images/unit_nusjuro.png',
      unit_jupeter: 'assets/images/unit_jupeter.png',

      // Pirate & Yonko Boss 3D Sprites (with destructible armor variants)
      pirate_PIRATE_GRUNT: 'assets/images/pirate_grunt.png',
      pirate_BARREL_PIRATE: 'assets/images/pirate_barrel.png',
      pirate_BARREL_PIRATE_naked: 'assets/images/pirate_barrel_naked.png',
      pirate_ARMORED_PIRATE: 'assets/images/pirate_armored.png',
      pirate_ARMORED_PIRATE_naked: 'assets/images/pirate_armored_naked.png',
      pirate_BUGGY_JUMPER: 'assets/images/pirate_buggy.png',
      pirate_BERSERKER_SWORDSMAN: 'assets/images/pirate_berserker.png',
      pirate_BERSERKER_SWORDSMAN_rage: 'assets/images/pirate_berserker_rage.png',
      pirate_OARS_GIANT: 'assets/images/pirate_oars.png',
      pirate_MARCO_PHOENIX: 'assets/images/pirate_marco.png',
      pirate_BLACKBEARD: 'assets/images/pirate_blackbeard.png',
      pirate_WHITEBEARD: 'assets/images/pirate_whitebeard.png'
    };
  }

  loadAll(onProgress) {
    const manifest = this.getManifest();
    const entries = Object.entries(manifest);
    this.totalCount = entries.length;
    this.loadedCount = 0;

    return new Promise((resolve) => {
      if (this.totalCount === 0) {
        this.isReady = true;
        resolve();
        return;
      }

      entries.forEach(([key, src]) => {
        const img = new Image();
        img.onload = () => {
          this.images[key] = img;
          this.loadedCount++;
          if (onProgress) onProgress(this.loadedCount / this.totalCount);
          if (this.loadedCount >= this.totalCount) {
            this.isReady = true;
            resolve();
          }
        };
        img.onerror = () => {
          console.warn(`Failed to load asset: ${src}`);
          this.loadedCount++;
          if (onProgress) onProgress(this.loadedCount / this.totalCount);
          if (this.loadedCount >= this.totalCount) {
            this.isReady = true;
            resolve();
          }
        };
        img.src = src;
      });
    });
  }

  get(key) {
    return this.images[key] || null;
  }

  getProgress() {
    if (this.totalCount === 0) return 1;
    return this.loadedCount / this.totalCount;
  }
}
