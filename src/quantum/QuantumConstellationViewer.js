/**
 * QuantumConstellationViewer.js
 *
 * WebGL Three.js visualizer for the quantum candidate search space.
 * Represents computational basis states as a 3D multiverse lattice / constellation.
 *
 * Visual encodings:
 * - Position: 3D coordinates arranged in an Asgardian spherical lattice
 * - Node size & brightness: Proportional to probability P(x) = |alpha_x|^2
 * - Phase indicators: Orientation rings reflecting phase angle (0 vs pi)
 * - Measurement collapse: Ethereal convergence of the statevector to the sampled basis state
 */

import * as THREE from 'three';

export class QuantumConstellationViewer {
  /**
   * @param {HTMLElement} container
   * @param {number} [displayPointCount=1024]
   */
  constructor(container, displayPointCount = 1024) {
    this._container = container;
    this._pointCount = displayPointCount;

    this._renderer = null;
    this._scene = null;
    this._camera = null;
    this._animId = null;
    this._disposed = false;

    this._pointsGeometry = null;
    this._pointsMaterial = null;
    this._pointsMesh = null;
    this._markedIndices = new Set();
    this._isCollapsed = false;
    this._collapsedIndex = null;
    this._collapseProgress = 0;

    this._init();
  }

  _init() {
    const w = this._container.clientWidth || window.innerWidth;
    const h = this._container.clientHeight || window.innerHeight;

    this._renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this._renderer.setSize(w, h);
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;

    this._renderer.domElement.classList.add('quantum-lattice-canvas');
    this._container.appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.FogExp2(0x030a18, 0.05);

    this._camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this._camera.position.set(0, 0, 7.5);

    this._buildLattice();

    this._onResize = () => this._handleResize();
    window.addEventListener('resize', this._onResize);

    this._clock = new THREE.Clock();
    this._renderLoop();
  }

  _buildLattice() {
    const count = this._pointCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio for spherical distribution

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere mapping
      const theta = 2 * Math.PI * i / phi;
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const r = 3.6 + (Math.sin(i * 0.3) * 0.4);

      positions[i * 3]     = Math.cos(theta) * radiusAtY * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * r;

      // Initial ground state: only index 0 is visible
      colors[i * 3]     = i === 0 ? 1.0 : 0.2;
      colors[i * 3 + 1] = i === 0 ? 1.0 : 0.2;
      colors[i * 3 + 2] = i === 0 ? 1.0 : 0.2;

      sizes[i] = i === 0 ? 14.0 : 1.5;
    }

    this._positions = positions;
    this._basePositions = new Float32Array(positions); // copy for collapse animation
    this._colors = colors;
    this._sizes = sizes;

    this._pointsGeometry = new THREE.BufferGeometry();
    this._pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this._pointsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Respect each state's size attribute and keep overlapping points from
    // adding into a single overexposed white cloud.
    this._pointsMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(size, 2.0, 18.0);
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float radius = length(gl_PointCoord - vec2(0.5));
          float core = 1.0 - smoothstep(0.18, 0.48, radius);
          float halo = 0.22 * (1.0 - smoothstep(0.12, 0.5, radius));
          gl_FragColor = vec4(vColor, max(core, halo) * 0.92);
        }
      `,
    });

    this._pointsMesh = new THREE.Points(this._pointsGeometry, this._pointsMaterial);
    this._scene.add(this._pointsMesh);

    // Subtle cosmic bounding ring
    const ringGeo = new THREE.RingGeometry(4.3, 4.34, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x45dfff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
    });
    this._cosmicRing = new THREE.Mesh(ringGeo, ringMat);
    this._cosmicRing.rotation.x = Math.PI / 2;
    this._scene.add(this._cosmicRing);
  }

  /**
   * Update visual point sizes and colors from statevector probabilities and phases.
   *
   * @param {Float32Array|Float64Array} probabilities
   * @param {Float64Array} amplitudes
   * @param {Set<number>|Array<number>} markedSet
   */
  updateFromState(probabilities, amplitudes, markedSet = new Set()) {
    if (this._disposed || this._isCollapsed) return;

    for (const stateIndex of markedSet) this._markedIndices.add(stateIndex);
    const count = this._pointCount;
    const stride = Math.max(1, Math.floor(probabilities.length / count));

    const colors = this._colors;
    const sizes = this._sizes;

    for (let i = 0; i < count; i++) {
      const stateIdx = i * stride;
      const prob = probabilities[stateIdx] || 0;
      const amp = amplitudes[stateIdx] || 0;
      // A negative real amplitude denotes the oracle's π phase flip. Render it
      // as a warm gold marker so the phase change is visible even before probability
      // amplification makes those points grow.
      if (amp < 0) this._markedIndices.add(stateIdx);
      const isMarked = this._markedIndices.has(stateIdx);

      // Scale against the full register so uniform states look equal and
      // amplified states grow in a visible, bounded way.
      const normalizedSize = Math.min(18, 8.5 + Math.sqrt(prob * probabilities.length) * 1.8);
      sizes[i] = normalizedSize;

      // Phase 180° is a warm gold marker, distinct from the cool-blue candidate states.
      if (isMarked) {
        colors[i * 3]     = 1.0;
        colors[i * 3 + 1] = 0.58;
        colors[i * 3 + 2] = 0.16;
      } else {
        const dim = Math.max(0.5, Math.min(0.92, 0.5 + Math.sqrt(prob * probabilities.length) * 0.06));
        colors[i * 3]     = dim * 0.24;
        colors[i * 3 + 1] = dim * 0.78;
        colors[i * 3 + 2] = dim * 0.9;
      }
    }

    this._pointsGeometry.attributes.color.needsUpdate = true;
    this._pointsGeometry.attributes.size.needsUpdate = true;
  }

  /**
   * Animate wavefunction collapse towards the measured state index.
   *
   * @param {number} sampledIndex
   * @param {Function} [onComplete]
   */
  collapseTo(sampledIndex, onComplete = null) {
    this._isCollapsed = true;
    this._collapsedIndex = sampledIndex;
    this._collapseProgress = 0;

    const count = this._pointCount;
    const stride = Math.max(1, Math.floor(32768 / count));
    const targetPointIdx = Math.min(count - 1, Math.floor(sampledIndex / stride));

    const tx = this._basePositions[targetPointIdx * 3];
    const ty = this._basePositions[targetPointIdx * 3 + 1];
    const tz = this._basePositions[targetPointIdx * 3 + 2];

    const startTime = performance.now();
    const duration = 1200; // ms

    const animateCollapse = () => {
      if (this._disposed) return;
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease in-out cubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const pos = this._positions;
      const base = this._basePositions;
      const sizes = this._sizes;
      const colors = this._colors;

      for (let i = 0; i < count; i++) {
        if (i === targetPointIdx) {
          sizes[i] = 16.0 + ease * 12.0;
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.72;
          colors[i * 3 + 2] = 0.24;
        } else {
          pos[i * 3]     = base[i * 3]     + (tx - base[i * 3]) * ease;
          pos[i * 3 + 1] = base[i * 3 + 1] + (ty - base[i * 3 + 1]) * ease;
          pos[i * 3 + 2] = base[i * 3 + 2] + (tz - base[i * 3 + 2]) * ease;
          sizes[i] = Math.max(0.1, (1 - ease) * 2.0);
          colors[i * 3]     *= (1 - ease * 0.05);
          colors[i * 3 + 1] *= (1 - ease * 0.05);
          colors[i * 3 + 2] *= (1 - ease * 0.05);
        }
      }

      this._pointsGeometry.attributes.position.needsUpdate = true;
      this._pointsGeometry.attributes.size.needsUpdate = true;
      this._pointsGeometry.attributes.color.needsUpdate = true;

      if (t < 1) {
        requestAnimationFrame(animateCollapse);
      } else {
        if (onComplete) onComplete();
      }
    };

    animateCollapse();
  }

  /** Reset constellation from collapse back to full state */
  reset() {
    this._isCollapsed = false;
    this._positions.set(this._basePositions);
    this._pointsGeometry.attributes.position.needsUpdate = true;
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

    const delta = this._clock.getDelta();

    if (this._pointsMesh) {
      this._pointsMesh.rotation.y += delta * 0.12;
      this._pointsMesh.rotation.x += delta * 0.04;
    }
    if (this._cosmicRing) {
      this._cosmicRing.rotation.z += delta * 0.08;
    }

    this._renderer.render(this._scene, this._camera);
  }

  dispose() {
    this._disposed = true;
    if (this._animId) cancelAnimationFrame(this._animId);
    window.removeEventListener('resize', this._onResize);
    this._pointsGeometry?.dispose();
    this._pointsMaterial?.dispose();
    this._renderer?.dispose();
    this._renderer?.domElement?.remove();
  }
}
