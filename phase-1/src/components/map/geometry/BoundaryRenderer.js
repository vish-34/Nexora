import * as THREE from 'three';

export class BoundaryRenderer {
  constructor(scene) {
    this.scene = scene;
    this.highlightMesh = null;
    this.currentRegionId = null;
  }

  setHighlight(region) {
    if (!region || !region.mesh) {
      this.clearHighlight();
      return;
    }

    // Skip if already highlighting this exact region
    if (this.currentRegionId === region.id && this.highlightMesh) {
      return;
    }

    this.clearHighlight();
    this.currentRegionId = region.id;

    // Find boundary line in region mesh group
    let sourceLine = null;
    region.mesh.traverse((child) => {
      if (child.isLine && child.userData?.isBoundary && !sourceLine) {
        sourceLine = child;
      }
    });

    if (sourceLine) {
      const geom = sourceLine.geometry.clone();
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color('#dff279'),
        linewidth: 2,
        transparent: true,
        opacity: 1.0,
        depthTest: false
      });
      this.highlightMesh = new THREE.LineLoop(geom, mat);
      this.highlightMesh.position.z = sourceLine.position.z + 0.005;
      this.scene.add(this.highlightMesh);
    }
  }

  clearHighlight() {
    this.currentRegionId = null;
    if (this.highlightMesh) {
      this.scene.remove(this.highlightMesh);
      if (this.highlightMesh.geometry) this.highlightMesh.geometry.dispose();
      if (this.highlightMesh.material) this.highlightMesh.material.dispose();
      this.highlightMesh = null;
    }
  }
}
