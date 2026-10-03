import * as THREE from 'three';
import { modelCache } from '../core/ModelCache.js';

/** One transparent, static model stage for the currently selected roster hero. */
export class HeroRosterPreview {
  constructor(container, hero) {
    this._container = container;
    this._disposed = false;
    this._model = null;
    this._heroId = null;
    this._requestedHeroId = null;
    this._requestId = 0;

    try {
      this._renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      this._container.dataset.modelState = 'unavailable';
      return;
    }

    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.15));
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.12;
    this._renderer.setClearColor(0x000000, 0);
    this._renderer.domElement.classList.add('roster-character-canvas');
    this._container.appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    this._scene.add(new THREE.HemisphereLight(0xf5f5ff, 0x62627a, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
    keyLight.position.set(3.5, 5.5, 5);
    this._scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe5e4ff, 1.8);
    fillLight.position.set(-4, 3, 4);
    this._scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xb7aaff, 2.0);
    rimLight.position.set(-2, 4, -4);
    this._scene.add(rimLight);

    this._resizeObserver = new ResizeObserver(() => this._render());
    this._resizeObserver.observe(container);
    this.showHero(hero);
  }

  async showHero(hero) {
    if (this._disposed || !this._renderer || this._requestedHeroId === hero.id) return;

    const requestId = ++this._requestId;
    this._requestedHeroId = hero.id;
    if (this._heroId === hero.id) return;
    this._container.dataset.modelState = 'loading';

    try {
      const model = await modelCache.instantiate(hero.file, {
        targetHeight: hero.baseScale || 2.5,
        yOffset: hero.yOffset || 0,
      });
      if (this._disposed || requestId !== this._requestId) return;

      this._model?.removeFromParent();
      this._model = model;
      this._heroId = hero.id;
      model.rotation.y = -0.12;
      this._scene.add(model);

      const bounds = new THREE.Box3().setFromObject(model);
      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const distance = Math.max(5.4, sphere.radius / Math.tan(THREE.MathUtils.degToRad(this._camera.fov / 2)) * 1.18);
      this._camera.position.set(sphere.center.x + 0.15, sphere.center.y + 0.12, sphere.center.z + distance);
      this._camera.lookAt(sphere.center);

      this._container.dataset.modelState = 'ready';
      this._render();
    } catch (error) {
      if (!this._disposed && requestId === this._requestId) {
        this._container.dataset.modelState = 'unavailable';
        this._requestedHeroId = this._heroId;
      }
      console.warn(`[HeroRosterPreview] Could not load ${hero.name}'s 3D model.`, error);
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
    this._requestId++;
    this._resizeObserver?.disconnect();
    this._model?.removeFromParent();
    this._renderer?.forceContextLoss();
    this._renderer?.dispose();
    this._renderer?.domElement?.remove();
  }
}
