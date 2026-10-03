/**
 * ModelCache.js
 *
 * High-performance WebGL asset manager for 3D character models (GLB).
 *
 * Key guarantees:
 * 1. Lazy Loading: Models are only fetched when a universe requiring them is opened.
 * 2. Deduplicated In-Memory Caching: Each GLB is fetched and parsed exactly once.
 * 3. Safe Cloning: Uses SkeletonUtils.clone to isolate bones, meshes, and materials
 *    so multiple universes sharing characters (Thor, Wanda, etc.) never mutate each other.
 * 4. Automatic Scale & Pivot Normalization: Normalizes models of differing source heights
 *    to consistent human scale (feet aligned to y = 0).
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export class ModelCache {
  constructor() {
    this._loader = new GLTFLoader();
    this._cache = new Map(); // filePath -> Promise<GLTF>
    this._readyCache = new Map(); // filePath -> raw GLTF

    // Register specular-glossiness compatibility plugin so models using
    // KHR_materials_pbrSpecularGlossiness (Wanda, Doctor Strange, Captain America, etc.)
    // have their diffuse textures and materials loaded in full color instead of flat white!
    this._loader.register((parser) => ({
      name: 'KHR_materials_pbrSpecularGlossiness',
      beforeRoot: () => {
        const json = parser.json;
        if (!json.materials) return;
        for (const mat of json.materials) {
          const sg = mat.extensions && mat.extensions['KHR_materials_pbrSpecularGlossiness'];
          if (sg) {
            if (!mat.pbrMetallicRoughness) mat.pbrMetallicRoughness = {};
            if (sg.diffuseFactor) mat.pbrMetallicRoughness.baseColorFactor = sg.diffuseFactor;
            if (sg.diffuseTexture) mat.pbrMetallicRoughness.baseColorTexture = sg.diffuseTexture;
            const gloss = sg.glossinessFactor !== undefined ? sg.glossinessFactor : 1.0;
            mat.pbrMetallicRoughness.roughnessFactor = Math.max(0.1, Math.min(1.0, 1.0 - gloss));
            mat.pbrMetallicRoughness.metallicFactor = 0.05;
          }
        }
      },
    }));
  }

  /**
   * Fetch and parse a GLB file once, caching the resulting GLTF object.
   *
   * @param {string} filePath - Path to .glb file
   * @param {Function} [onProgress] - Optional progress callback (0-100)
   * @returns {Promise<object>} Parsed GLTF data
   */
  async load(filePath, onProgress = null) {
    if (this._cache.has(filePath)) {
      return this._cache.get(filePath);
    }

    const loadPromise = new Promise((resolve, reject) => {
      this._loader.load(
        filePath,
        (gltf) => {
          this._readyCache.set(filePath, gltf);
          resolve(gltf);
        },
        (xhr) => {
          if (onProgress && xhr.total > 0) {
            const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
            onProgress(percent);
          }
        },
        (error) => {
          console.error(`[ModelCache] Failed to load GLB: ${filePath}`, error);
          this._cache.delete(filePath);
          reject(error);
        }
      );
    });

    this._cache.set(filePath, loadPromise);
    return loadPromise;
  }

  /**
   * Clone and normalize a cached character model for insertion into a scene.
   *
   * @param {string} filePath - Path to .glb file
   * @param {object} [options]
   * @param {number} [options.targetHeight=2.4] - Desired height in world units
   * @param {number} [options.yOffset=0] - Vertical offset
   * @param {Function} [onProgress] - Optional loading progress callback
   * @returns {Promise<THREE.Group>} Cloned, normalized 3D group
   */
  async instantiate(filePath, options = {}, onProgress = null) {
    const gltf = await this.load(filePath, onProgress);
    const targetHeight = options.targetHeight || 2.4;
    const yOffset = options.yOffset || 0;

    // Deep clone with skeleton bone hierarchy preserved
    const clone = SkeletonUtils.clone(gltf.scene);

    // CRITICAL: Ensure world matrices are fully computed on all nodes and armatures
    // before measuring bounding boxes, otherwise rotated root nodes cause Y and Z dimensions to swap!
    clone.updateMatrixWorld(true);

    // Compute original bounding box in world space
    const initialBox = new THREE.Box3().setFromObject(clone);
    const initialSize = initialBox.getSize(new THREE.Vector3());

    // Scale to target human height accurately
    const currentHeight = initialSize.y > 0.01 ? initialSize.y : 1.0;
    const scaleFactor = targetHeight / currentHeight;
    clone.scale.setScalar(scaleFactor);
    clone.updateMatrixWorld(true);

    // Recompute box after scaling
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

    // Center horizontally and rest feet solidly on ground (y = yOffset)
    clone.position.x -= scaledCenter.x;
    clone.position.y -= (scaledBox.min.y - yOffset);
    clone.position.z -= scaledCenter.z;
    clone.updateMatrixWorld(true);

    // Wrap in a clean pivot group
    const wrapper = new THREE.Group();
    wrapper.add(clone);

    // Optimize materials for clean, cinematic PBR lighting
    wrapper.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m.map) {
              m.map.colorSpace = THREE.SRGBColorSpace;
              m.map.needsUpdate = true;
            }
            m.needsUpdate = true;
          });
        }
      }
    });

    return wrapper;
  }

  /** Check if a model is already loaded in memory */
  isLoaded(filePath) {
    return this._readyCache.has(filePath);
  }

  /** Dispose all cached WebGL textures and geometries */
  dispose() {
    for (const gltf of this._readyCache.values()) {
      gltf.scene?.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }
    this._cache.clear();
    this._readyCache.clear();
  }
}

export const modelCache = new ModelCache();
