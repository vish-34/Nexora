import * as THREE from 'three';

export class RaycastManager {
  constructor(camera, container, getActiveRegion = null) {
    this.camera = camera;
    this.container = container;
    this.getActiveRegion = getActiveRegion;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.interactiveMeshes = [];
    this.hoveredRegion = null;
    this.listeners = {
      hover: [],
      click: []
    };

    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerDown = this.handlePointerDown.bind(this);

    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('click', this.onPointerDown);
  }

  setInteractiveMeshes(meshes) {
    this.interactiveMeshes = meshes;
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  handlePointerMove(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, true);

    // Only consider meshes that are visible and have perceptible opacity
    const validIntersects = intersects.filter((hit) => {
      const obj = hit.object;
      if (!obj.visible) return false;
      if (obj.material && obj.material.opacity !== undefined && obj.material.opacity < 0.15) {
        return false;
      }
      return true;
    });

    if (validIntersects.length > 0) {
      const activeRegion = this.getActiveRegion ? this.getActiveRegion() : null;
      const activeLevel = activeRegion ? activeRegion.level : 'country';

      // Tier-aware preference:
      // At country level -> prefer state (so clicking Maharashtra selects Maharashtra, not its districts!)
      // At state level -> prefer district / city (so clicking Mumbai selects Mumbai!)
      // At city level -> prefer neighborhood
      // At neighborhood level -> prefer microgrid
      const targetLevelMap = {
        world: ['country', 'state'],
        country: ['state', 'country'],
        state: ['city', 'district', 'state'],
        city: ['neighborhood', 'city'],
        district: ['neighborhood', 'city', 'district'],
        neighborhood: ['microgrid', 'neighborhood'],
        microgrid: ['microgrid']
      };

      const preferredLevels = targetLevelMap[activeLevel] || ['state', 'country'];
      let hitRegion = null;

      for (const prefLevel of preferredLevels) {
        for (const hit of validIntersects) {
          const r = hit.object.userData?.region;
          if (r && r.level === prefLevel) {
            hitRegion = r;
            break;
          }
        }
        if (hitRegion) break;
      }

      // Fallback to first valid hit
      if (!hitRegion) {
        for (const hit of validIntersects) {
          if (hit.object.userData?.region) {
            hitRegion = hit.object.userData.region;
            break;
          }
        }
      }

      if (hitRegion !== this.hoveredRegion) {
        this.hoveredRegion = hitRegion;
        this.container.style.cursor = hitRegion ? 'pointer' : 'default';
        this.emit('hover', hitRegion);
      }
    } else if (this.hoveredRegion !== null) {
      this.hoveredRegion = null;
      this.container.style.cursor = 'default';
      this.emit('hover', null);
    }
  }

  handlePointerDown() {
    if (this.hoveredRegion) {
      this.emit('click', this.hoveredRegion);
    }
  }

  emit(event, data) {
    for (const cb of this.listeners[event] || []) {
      cb(data);
    }
  }

  dispose() {
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('click', this.onPointerDown);
  }
}
