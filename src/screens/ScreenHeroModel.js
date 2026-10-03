import * as THREE from 'three';
import { modelCache } from '../core/ModelCache.js';

/** Static, transparent character render for dialogue scenes. */
export class ScreenHeroModel {
  constructor(container, hero, { targetHeight = 3.2 } = {}) {
    this._container = container;
    this._disposed = false;
    this._model = null;
    this._renderer = null;
    this._status = container.querySelector('.thor-model-loading-text');

    container.dataset.modelState = 'loading';

    try {
      this._renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch (error) {
      container.dataset.modelState = 'error';
      if (this._status) this._status.textContent = '3D SIGNAL UNAVAILABLE';
      console.warn('[ScreenHeroModel] WebGL is unavailable for this dialogue scene.', error);
      return;
    }

    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.12;
    this._renderer.setClearColor(0x000000, 0);
    this._renderer.domElement.classList.add('thor-screen-model-canvas');
    container.appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    this._targetHeight = targetHeight;

    this._scene.add(new THREE.HemisphereLight(0xf4f3ff, 0x29233d, 2.3));

    const keyLight = new THREE.DirectionalLight(0xffe4bd, 3.1);
    keyLight.position.set(3.5, 5.5, 5);
    this._scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd7dcff, 1.7);
    fillLight.position.set(-4, 3, 4);
    this._scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x9a82ff, 2.4);
    rimLight.position.set(-2, 4, -4);
    this._scene.add(rimLight);

    this._resizeObserver = new ResizeObserver(() => this._render());
    this._resizeObserver.observe(container);
    this._loadModel(hero);
  }

  async _loadModel(hero) {
    try {
      const model = await modelCache.instantiate(hero.file, { targetHeight: this._targetHeight });
      if (this._disposed) return;

      this._model = model;
      model.rotation.y = -0.12;
      this._scene.add(model);

      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const cameraDistance = Math.max(5.8, this._targetHeight * 2.05);
      this._camera.position.set(center.x + 0.2, center.y + 0.2, center.z + cameraDistance);
      this._camera.lookAt(center.x, center.y, center.z);

      this._container.dataset.modelState = 'ready';
      if (this._status) this._status.textContent = 'THOR · EARTH-118';
      this._render();
    } catch (error) {
      if (!this._disposed) {
        this._container.dataset.modelState = 'error';
        if (this._status) this._status.textContent = '3D SIGNAL UNAVAILABLE';
      }
      console.warn(`[ScreenHeroModel] Could not load ${hero.name} for the dialogue scene.`, error);
    }
  }

  _render() {
    if (this._disposed || !this._renderer) return;
    const width = this._container.clientWidth;
    const height = this._container.clientHeight;
    if (!width || !height) return;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(width, height, false);
    this._renderer.render(this._scene, this._camera);
  }

  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this._resizeObserver?.disconnect();
    this._model?.removeFromParent();
    this._renderer?.forceContextLoss();
    this._renderer?.dispose();
    this._renderer?.domElement?.remove();
  }
}
