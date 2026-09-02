import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
  constructor(container) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const aspect = width / height;

    this.frustumSize = 120; // Base reference vertical units

    // Cached container rect to eliminate layout reflows during continuous wheel events
    this.containerRect = {
      left: 0,
      top: 0,
      width: width,
      height: height
    };
    this.updateRect();

    // Orthographic Camera for crisp 2.5D planar map
    this.camera = new THREE.OrthographicCamera(
      (-this.frustumSize * aspect) / 2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.1,
      2000
    );

    // Initial camera position centered on India
    this.camera.position.set(144.5, 40.1, 100);
    this.camera.zoom = 1.83;
    this.camera.updateProjectionMatrix();

    // Interaction and Direction tracking state
    this.isInteracting = false;
    this.lastInteractionTime = performance.now();
    this.lastZoom = this.camera.zoom;
    this.zoomVelocity = 0;
    this.zoomDirection = 'NONE'; // 'IN' | 'OUT' | 'NONE'
    this.lastDirectionTime = performance.now();
    this.wheelTimeout = null;

    // OrbitControls configured for 2D map panning
    this.controls = new OrbitControls(this.camera, container);
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.enableZoom = false; // Handled by dedicated smooth wheel listener
    this.controls.screenSpacePanning = true;
    this.controls.enableDamping = false;

    // Mouse button mappings (click & drag pan)
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.PAN
    };

    this.controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    this.controls.panSpeed = 1.1;

    // Zoom limits: allows full World view out to 0.15, down to 5000 for micro-grids
    this.controls.minZoom = 0.15;
    this.controls.maxZoom = 5000.0;

    // OrbitControls lifecycle listeners
    this.controls.addEventListener('start', () => {
      this.isInteracting = true;
      this.lastInteractionTime = performance.now();
    });

    this.controls.addEventListener('change', () => {
      this.lastInteractionTime = performance.now();
    });

    this.controls.addEventListener('end', () => {
      this.lastInteractionTime = performance.now();
      setTimeout(() => {
        if (performance.now() - this.lastInteractionTime >= 120) {
          this.isInteracting = false;
        }
      }, 130);
    });

    // Dedicated continuous wheel gesture handler
    this.handleWheel = (e) => {
      e.preventDefault();

      this.isInteracting = true;
      this.lastInteractionTime = performance.now();

      clearTimeout(this.wheelTimeout);
      this.wheelTimeout = setTimeout(() => {
        if (performance.now() - this.lastInteractionTime >= 140) {
          this.isInteracting = false;
          this.zoomDirection = 'NONE';
        }
      }, 150);

      // Two fingers UP / DOWN: Continuous Zoom with Direction Tracking
      if (Math.abs(e.deltaY) > 0) {
        // e.deltaY < 0 is scroll up (Zoom IN), e.deltaY > 0 is scroll down (Zoom OUT)
        if (e.deltaY < -1) {
          this.zoomDirection = 'IN';
          this.lastDirectionTime = performance.now();
        } else if (e.deltaY > 1) {
          this.zoomDirection = 'OUT';
          this.lastDirectionTime = performance.now();
        }

        const zoomFactor = Math.pow(0.995, e.deltaY);
        this.zoomAt(zoomFactor, e.clientX, e.clientY);
      }

      // Two fingers LEFT / RIGHT: Pan Left and Right
      if (Math.abs(e.deltaX) > 0) {
        const containerH = this.containerRect.height || 600;
        const scale = this.frustumSize / (this.camera.zoom * containerH);
        const dx = e.deltaX * scale;

        this.controls.target.x += dx;
        this.camera.position.x += dx;
        this.clampBounds();
      }
    };

    this.container.addEventListener('wheel', this.handleWheel, { passive: false });

    this.onResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  updateRect() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.containerRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width || 800,
      height: rect.height || 600
    };
  }

  handleResize() {
    if (!this.container) return;
    this.updateRect();
    const width = this.containerRect.width;
    const height = this.containerRect.height;
    const aspect = width / height;

    this.camera.left = (-this.frustumSize * aspect) / 2;
    this.camera.right = (this.frustumSize * aspect) / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = -this.frustumSize / 2;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Continuous zoom:
   * - Zoom IN: Projects toward cursor location.
   * - Zoom OUT: Expands in place around viewport center with zero displacement.
   */
  zoomAt(zoomFactor, clientX, clientY) {
    const width = this.containerRect.width;
    const height = this.containerRect.height;
    const aspect = width / height;

    const z1 = this.camera.zoom;
    const z2 = Math.max(
      this.controls.minZoom,
      Math.min(this.controls.maxZoom, z1 * zoomFactor)
    );

    if (Math.abs(z2 - z1) < 0.000001) return;

    if (zoomFactor > 1.0 && clientX !== undefined && clientY !== undefined) {
      // Zoom IN: Project toward cursor
      const px = clientX;
      const py = clientY;
      const u = ((px - this.containerRect.left) / width) * 2 - 1;
      const v = -(((py - this.containerRect.top) / height) * 2 - 1);

      const wHalfOld = (this.frustumSize * aspect) / (2 * z1);
      const hHalfOld = this.frustumSize / (2 * z1);
      const wHalfNew = (this.frustumSize * aspect) / (2 * z2);
      const hHalfNew = this.frustumSize / (2 * z2);

      const dx = u * (wHalfOld - wHalfNew);
      const dy = v * (hHalfOld - hHalfNew);

      this.camera.position.x += dx;
      this.camera.position.y += dy;
      this.controls.target.x += dx;
      this.controls.target.y += dy;
    } else {
      // Zoom OUT: Clean in-place expansion around current viewport center
      this.camera.position.x = this.controls.target.x;
      this.camera.position.y = this.controls.target.y;
    }

    this.camera.zoom = z2;
    this.clampBounds();
    this.camera.updateProjectionMatrix();
  }

  clampBounds() {
    const minX = -180.0;
    const maxX = 300.0;
    const minY = -100.0;
    const maxY = 140.0;

    this.controls.target.x = Math.max(minX, Math.min(maxX, this.controls.target.x));
    this.controls.target.y = Math.max(minY, Math.min(maxY, this.controls.target.y));
    this.camera.position.x = this.controls.target.x;
    this.camera.position.y = this.controls.target.y;
  }

  fitBounds(bounds, padding = 1.25) {
    if (!bounds) return { target: { x: 144.5, y: 40.1, z: 0 }, position: { x: 144.5, y: 40.1, z: 100 }, zoom: 1.83 };

    const width = Math.max(0.0001, bounds.width || bounds.maxX - bounds.minX);
    const height = Math.max(0.0001, bounds.height || bounds.maxY - bounds.minY);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const aspect = this.containerRect.width / this.containerRect.height;

    const zoomX = (this.frustumSize * aspect) / (width * padding);
    const zoomY = this.frustumSize / (height * padding);
    const targetZoom = Math.max(this.controls.minZoom, Math.min(this.controls.maxZoom, Math.min(zoomX, zoomY)));

    return {
      target: { x: centerX, y: centerY, z: 0 },
      position: { x: centerX, y: centerY, z: 100 },
      zoom: targetZoom
    };
  }

  zoomBy(factor) {
    this.zoomAt(factor);
  }

  update() {
    // Track instantaneous zoom velocity and direction
    const delta = this.camera.zoom - this.lastZoom;
    this.zoomVelocity = delta;
    this.lastZoom = this.camera.zoom;

    if (delta > 0.002) {
      this.zoomDirection = 'IN';
      this.lastDirectionTime = performance.now();
    } else if (delta < -0.002) {
      this.zoomDirection = 'OUT';
      this.lastDirectionTime = performance.now();
    } else if (performance.now() - this.lastDirectionTime > 250) {
      this.zoomDirection = 'NONE';
    }

    this.controls.update();
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('wheel', this.handleWheel);
    clearTimeout(this.wheelTimeout);
    this.controls.dispose();
  }
}
