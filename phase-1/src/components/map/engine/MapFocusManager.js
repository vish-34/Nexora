export const FocusState = {
  IDLE: 'IDLE',
  USER_INTERACTING: 'USER_INTERACTING',
  SETTLING: 'SETTLING',
  TRANSITIONING: 'TRANSITIONING',
  COOLDOWN: 'COOLDOWN'
};

export const NavMode = {
  IDLE: 'IDLE',
  DESCENDING: 'DESCENDING', // Zooming IN (down into children)
  ASCENDING: 'ASCENDING'     // Zooming OUT (immediate upward parent snap)
};

export class MapFocusManager {
  constructor(registry, hierarchy, detector, transitionController, cameraController) {
    this.registry = registry;
    this.hierarchy = hierarchy;
    this.detector = detector;
    this.transitionController = transitionController;
    this.cameraController = cameraController;

    this.currentRegion = null;
    this.listeners = [];
    this.frameCounter = 0;

    // Zoom tracking for instant threshold crossing detection (Point 3)
    this.previousZoom = this.cameraController.camera.zoom;

    // Transition State Machine
    this.state = FocusState.IDLE;
    this.navMode = NavMode.IDLE;
    this.isTransitioning = false;
    this.transitionCooldownUntil = 0;

    // Focus Change Debounce State (Applied to zoom-in descent only)
    this.pendingCandidate = null;
    this.pendingSince = 0;
    this.DEBOUNCE_MS = 160;
    this.COOLDOWN_MS = 250; // Short 250ms post-transition cooldown

    // Debug Mode
    this.debugEnabled = false;
    if (typeof window !== 'undefined') {
      window.__MAP_DEBUG__ = (val = true) => { this.debugEnabled = val; };
    }
  }

  onFocusChange(callback) {
    this.listeners.push(callback);
  }

  canTransition(current, candidate, direction) {
    if (!current || !candidate) return false;
    if (current.id === candidate.id) return false;

    if (direction === 'OUT') {
      return candidate.id === current.parentId;
    }

    if (direction === 'IN') {
      return candidate.parentId === current.id || this.hierarchy.isDescendantOf(candidate, current);
    }

    return false;
  }

  setCurrentRegion(region, skipAnimation = false, isProgrammatic = false) {
    const prev = this.currentRegion;
    this.currentRegion = region;
    this.detector.setCurrentRegion(region);

    if (!skipAnimation) {
      this.transitionController.transitionTo(region, prev, {
        isProgrammatic,
        animateZoom: isProgrammatic
      });
    }

    for (const listener of this.listeners) {
      listener(region);
    }
  }

  /**
   * Programmatic navigation (e.g. from navbar clicks or reset button)
   */
  focusRegion(regionId, options = { animateZoom: true, force: true }) {
    const region = this.registry.get(regionId);
    if (!region) return;

    this.pendingCandidate = null;
    this.pendingSince = 0;
    this.navMode = NavMode.IDLE;

    if (options.force || !this.currentRegion || this.currentRegion.id !== region.id) {
      const prev = this.currentRegion;
      this.currentRegion = region;
      this.detector.setCurrentRegion(region);

      this.state = FocusState.TRANSITIONING;
      this.isTransitioning = true;

      this.transitionController.transitionTo(region, prev, {
        isProgrammatic: true,
        animateZoom: options.animateZoom !== false,
        onComplete: () => {
          this.isTransitioning = false;
          this.transitionCooldownUntil = performance.now() + this.COOLDOWN_MS;
          this.state = FocusState.COOLDOWN;
        }
      });

      for (const listener of this.listeners) {
        listener(region);
      }
    }
  }

  /**
   * Render loop check:
   * Features IMMEDIATE zero-delay threshold crossing for zoom-out ascent,
   * while keeping smooth debounced candidate selection for zoom-in descent.
   */
  update() {
    this.frameCounter++;
    const now = performance.now();
    const currentZoom = this.cameraController.camera.zoom;
    const previousZoom = this.previousZoom;
    this.previousZoom = currentZoom;

    // 1. Block detection during active transition
    if (this.isTransitioning || this.transitionController.isTransitioning) {
      this.state = FocusState.TRANSITIONING;
      return;
    }

    // 2. Cooldown check
    if (now < this.transitionCooldownUntil) {
      this.state = FocusState.COOLDOWN;
      return;
    }

    // 3. Track Zoom Direction
    const zoomDir = this.cameraController.zoomDirection; // 'IN' | 'OUT' | 'NONE'
    const isZoomingOut = zoomDir === 'OUT' || currentZoom < previousZoom;

    if (zoomDir === 'IN') {
      this.navMode = NavMode.DESCENDING;
    } else if (isZoomingOut) {
      this.navMode = NavMode.ASCENDING;
    }

    // =========================================================================
    // POINT 3 & 4: IMMEDIATE EXIT THRESHOLD CROSSING (ZERO DEBOUNCE ON ZOOM OUT)
    // =========================================================================
    if (isZoomingOut && this.currentRegion && this.currentRegion.parentId) {
      const exitThreshold = this.currentRegion.focusConfig?.exitZoom ?? 0.65;

      // The exact moment the zoom crosses below the exit threshold:
      if (currentZoom <= exitThreshold && previousZoom > exitThreshold) {
        const parent = this.registry.get(this.currentRegion.parentId);
        if (parent) {
          if (this.debugEnabled) {
            console.log(`[IMMEDIATE UPWARD CROSSING] ${this.currentRegion.name} ──► ${parent.name} (zoom: ${currentZoom.toFixed(2)})`);
          }
          this.executeImmediateParentSnap(parent);
          return;
        }
      }
    }

    // =========================================================================
    // ZOOM IN / SETTLING LOGIC (Preserved smooth descent)
    // =========================================================================
    if (this.cameraController.isInteracting) {
      this.state = FocusState.USER_INTERACTING;
      this.pendingCandidate = null;
      this.pendingSince = 0;
      return;
    }

    const zoomVelocity = Math.abs(this.cameraController.zoomVelocity || 0);
    const hasSettled = zoomVelocity < 0.005;

    if (!hasSettled) {
      this.state = FocusState.SETTLING;
      return;
    }

    this.state = FocusState.IDLE;

    // Direction-aware detection
    const target = this.cameraController.controls.target;
    const direction = this.navMode === NavMode.ASCENDING ? 'OUT' : (zoomDir === 'IN' ? 'IN' : 'NONE');

    const candidate = this.detector.detect({
      target,
      currentZoom,
      currentRegion: this.currentRegion,
      direction
    });

    if (candidate && (!this.currentRegion || candidate.id !== this.currentRegion.id)) {
      if (this.canTransition(this.currentRegion, candidate, direction)) {
        if (!this.pendingCandidate || this.pendingCandidate.id !== candidate.id) {
          this.pendingCandidate = candidate;
          this.pendingSince = now;

          if (this.debugEnabled) {
            console.log(`[TREE CANDIDATE] Pending: ${candidate.name} (direction: ${direction}, zoom: ${currentZoom.toFixed(2)})`);
          }
        } else if (now - this.pendingSince >= this.DEBOUNCE_MS) {
          this.commitFocusChange(candidate, direction);
        }
      } else {
        this.pendingCandidate = null;
        this.pendingSince = 0;
      }
    } else {
      this.pendingCandidate = null;
      this.pendingSince = 0;
    }
  }

  /**
   * Immediate Parent Snap (Points 4, 5, 6, 7)
   * Executes without waiting for controls.end, settling, or debounce.
   * Runs a fast, magnetic blend preserving user spatial context.
   */
  executeImmediateParentSnap(parentRegion) {
    const prev = this.currentRegion;
    this.currentRegion = parentRegion;
    this.detector.setCurrentRegion(parentRegion);

    this.pendingCandidate = null;
    this.pendingSince = 0;
    this.navMode = NavMode.ASCENDING; // Lock child auto-detection
    this.state = FocusState.TRANSITIONING;
    this.isTransitioning = true;

    // Fast magnetic blend (0.45s, power3.out)
    this.transitionController.transitionTo(parentRegion, prev, {
      isProgrammatic: false,
      isUpwardSnap: true,
      duration: 0.45,
      onComplete: () => {
        this.isTransitioning = false;
        this.transitionCooldownUntil = performance.now() + this.COOLDOWN_MS;
        this.state = FocusState.COOLDOWN;
      }
    });

    // Notify React UI
    for (const listener of this.listeners) {
      listener(parentRegion);
    }
  }

  /**
   * Commit confirmed downward focus change during zoom-in descent.
   */
  commitFocusChange(region, direction) {
    if (this.debugEnabled) {
      console.log(`[TREE COMMIT] Transition: ${this.currentRegion?.name} ──(${direction})──► ${region.name}`);
    }

    const prev = this.currentRegion;
    this.currentRegion = region;
    this.detector.setCurrentRegion(region);

    this.pendingCandidate = null;
    this.pendingSince = 0;

    if (direction === 'OUT') {
      this.navMode = NavMode.ASCENDING;
    }

    this.transitionController.transitionTo(region, prev, {
      isProgrammatic: false,
      animateZoom: false
    });

    for (const listener of this.listeners) {
      listener(region);
    }

    this.transitionCooldownUntil = performance.now() + this.COOLDOWN_MS;
    this.state = FocusState.COOLDOWN;
  }
}
