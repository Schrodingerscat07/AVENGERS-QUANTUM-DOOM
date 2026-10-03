/**
 * Universe3DViewer.js
 *
 * Full WebGL 3D environment for inspecting an individual candidate universe.
 * Renders the candidate Avengers team with cinematic lighting, spatial staging,
 * and reality portal framing.
 */

import * as THREE from 'three';
import { modelCache } from '../core/ModelCache.js';

export class Universe3DViewer {
  /**
   * @param {HTMLElement} container
   * @param {object} universe
   * @param {Function} [onProgress]
   */
  constructor(container, universe, onProgress = null) {
    this._container = container;
    this._universe = universe;
    this._onProgress = onProgress;

    this._renderer = null;
    this._scene = null;
    this._camera = null;
    this._animId = null;
    this._disposed = false;

    this._modelsGroup = new THREE.Group();
    this._rimLight = null;
    this._keyLight = null;
    this._platformRings = [];
    this._targetCameraZ = 6.6;
    this._cameraFocusX = universe.cameraFocusX ?? 0;
    this._clock = new THREE.Clock();

    this._init();
  }

  async _init() {
    const width = this._container.clientWidth || window.innerWidth;
    const height = this._container.clientHeight || window.innerHeight;

    // ── Renderer ──
    this._renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    // Character assets are texture-heavy; a modest pixel-ratio cap keeps the
    // full-screen viewport crisp while avoiding a large GPU fill-rate penalty.
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this._renderer.setSize(width, height);
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.05;
    this._renderer.shadowMap.enabled = false;

    this._renderer.domElement.classList.add('universe-3d-canvas');
    this._container.appendChild(this._renderer.domElement);

    // ── Scene & Atmosphere ──
    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.FogExp2(0x030305, 0.04);

    // ── Camera ──
    this._camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this._camera.position.set(this._cameraFocusX, 1.35, 6.6);
    this._camera.lookAt(this._cameraFocusX, 1.1, 0);

    // ── Lighting ──
    this._setupLighting();

    // ── Platform Environment ──
    this._setupPlatform();

    // ── Team Group ──
    this._scene.add(this._modelsGroup);

    // ── Resize Listener ──
    this._onResize = () => this._handleResize();
    window.addEventListener('resize', this._onResize);

    // ── Start Render Loop ──
    this._renderLoop();

    // ── Load Universe Models ──
    await this._loadTeam();
  }

  _setupLighting() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    this._scene.add(ambient);

    // Key Light (front top right)
    this._keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this._keyLight.position.set(3.5, 6.5, 5.0);
    this._scene.add(this._keyLight);

    // Fill Light (front top left)
    const fillLight = new THREE.DirectionalLight(0xd0d0d0, 1.2);
    fillLight.position.set(-3.5, 5.0, 4.0);
    this._scene.add(fillLight);

    // Rim / Backlight (high contrast silhouette)
    this._rimLight = new THREE.DirectionalLight(0xffffff, 3.2);
    this._rimLight.position.set(0, 5.5, -4.5);
    this._scene.add(this._rimLight);

    // Subtle upward floor light
    const floorLight = new THREE.PointLight(0xffffff, 1.0, 8);
    floorLight.position.set(0, 0.2, 0);
    this._scene.add(floorLight);
  }

  _setupPlatform() {
    // Emitter base disc
    const baseGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.12, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0e,
      roughness: 0.6,
      metalness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.06;
    baseMesh.receiveShadow = true;
    this._scene.add(baseMesh);

    // Concentric glowing rings
    const ringRadii = [2.0, 3.2, 4.1];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.02, r + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35 - idx * 0.08,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      this._scene.add(ring);
      this._platformRings.push({ mesh: ring, speed: (idx % 2 === 0 ? 1 : -1) * (0.002 + idx * 0.001) });
    });

    // Outer subtle grid
    const grid = new THREE.GridHelper(10, 20, 0x555555, 0x222222);
    grid.position.y = -0.07;
    this._scene.add(grid);
  }

  async _loadTeam() {
    const layout = this._universe.layout;
    const total = layout.length;
    const assetProgress = new Array(total).fill(0);
    const reportProgress = () => {
      const average = assetProgress.reduce((sum, value) => sum + value, 0) / total;
      this._onProgress?.(Math.round(average * 0.95));
    };

    // Load a team's independent assets together. The cache still deduplicates
    // shared GLBs when a universe is revisited or another scene requests them.
    const models = await Promise.all(layout.map(async (item, index) => {
      const hero = item.hero;
      try {
        const model = await modelCache.instantiate(hero.file, {
          targetHeight: hero.baseScale * (item.scaleMult || 1.0),
          yOffset: hero.yOffset || 0,
        }, (pct) => {
          assetProgress[index] = Math.max(assetProgress[index], pct);
          reportProgress();
        });

        assetProgress[index] = 100;
        reportProgress();
        return { model, item };
      } catch (err) {
        assetProgress[index] = 100;
        reportProgress();
        console.error(`[Universe3DViewer] Failed loading hero model: ${hero.name}`, err);
        return null;
      }
    }));

    if (this._disposed) return;

    models.forEach((entry) => {
      if (!entry) return;
      const { model, item } = entry;
      model.position.set(...item.position);
      model.rotation.set(...item.rotation);
      model.userData = {
        baseY: item.position[1],
        bobOffset: Math.random() * Math.PI * 2,
      };
      this._modelsGroup.add(model);
    });

    if (this._onProgress && !this._disposed) {
      this._onProgress(100);
    }
  }

  /** Energize scene when team satisfies all Doom defense parameters */
  energize() {
    if (!this._rimLight) return;
    this._targetCameraZ = 7.2;

    const startTime = performance.now();
    const duration = 1200;
    const startRim = this._rimLight.intensity;
    const targetRim = 7.5;

    const flare = () => {
      if (this._disposed) return;
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      this._rimLight.intensity = startRim + (targetRim - startRim) * t;
      if (t < 1) requestAnimationFrame(flare);
    };
    flare();
  }

  _handleResize() {
    if (this._disposed || !this._renderer || !this._camera) return;
    const w = this._container.clientWidth || window.innerWidth;
    const h = this._container.clientHeight || window.innerHeight;
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(w, h);
  }

  _renderLoop() {
    if (this._disposed) return;
    this._animId = requestAnimationFrame(() => this._renderLoop());

    const elapsed = this._clock.getElapsedTime();

    // Idle character breathing/bobbing
    this._modelsGroup.children.forEach((model) => {
      if (model.userData?.baseY !== undefined) {
        model.position.y = model.userData.baseY + Math.sin(elapsed * 1.5 + model.userData.bobOffset) * 0.015;
      }
    });

    // Slow platform ring rotation
    this._platformRings.forEach(item => {
      item.mesh.rotation.z += item.speed;
    });

    // Smooth camera drift & pull-back on victory
    const targetX = this._cameraFocusX + Math.sin(elapsed * 0.25) * 0.25;
    this._camera.position.x += (targetX - this._camera.position.x) * 0.03;
    this._camera.position.z += (this._targetCameraZ - this._camera.position.z) * 0.04;
    this._camera.lookAt(this._cameraFocusX, 1.1, 0);

    this._renderer.render(this._scene, this._camera);
  }

  dispose() {
    this._disposed = true;
    if (this._animId) cancelAnimationFrame(this._animId);
    window.removeEventListener('resize', this._onResize);

    // Remove models from group
    while (this._modelsGroup.children.length > 0) {
      this._modelsGroup.remove(this._modelsGroup.children[0]);
    }

    // Clean Three.js resources
    this._renderer?.dispose();
    this._renderer?.domElement?.remove();
    this._renderer = null;
    this._scene = null;
    this._camera = null;
  }
}
