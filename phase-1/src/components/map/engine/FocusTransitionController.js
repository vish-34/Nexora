import gsap from 'gsap';

export class FocusTransitionController {
  constructor(cameraController, hierarchy, boundaryRenderer) {
    this.cameraController = cameraController;
    this.hierarchy = hierarchy;
    this.boundaryRenderer = boundaryRenderer;
    this.isTransitioning = false;
    this.lastActiveRegionId = null;
    this.masterTimeline = null;
  }

  /**
   * Execute focus transition:
   * - Programmatic (clicks): full camera fly-to with master timeline.
   * - Upward Snap (instant zoom-out threshold crossing): smooth magnetic blend preserving spatial context.
   * - Downward Auto-detection (manual zoom-in): pure visual opacity cross-fade.
   */
  transitionTo(newRegion, currentRegion, options = {}) {
    if (!newRegion) return;

    const isProgrammatic = options.isProgrammatic === true;
    const isUpwardSnap = options.isUpwardSnap === true;
    const duration = options.duration || (isUpwardSnap ? 0.45 : (newRegion.focusConfig?.transitionDuration || 0.8));

    const camera = this.cameraController.camera;
    const controls = this.cameraController.controls;

    // 1. Upward Magnetic Snap (Instant Parent Reframe preserving spatial context)
    if (isUpwardSnap) {
      if (this.masterTimeline) {
        this.masterTimeline.kill();
        this.masterTimeline = null;
      }
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
      gsap.killTweensOf(camera);

      this.isTransitioning = true;

      const framing = this.cameraController.fitBounds(newRegion.projectedBounds, 1.25);

      // Preserve spatial context: blend current target gently toward parent center (Point 6)
      const currentTargetX = controls.target.x;
      const currentTargetY = controls.target.y;
      const blendFactor = 0.40; // 40% drift toward parent center, 60% user context preservation

      const targetX = currentTargetX + (framing.target.x - currentTargetX) * blendFactor;
      const targetY = currentTargetY + (framing.target.y - currentTargetY) * blendFactor;

      this.masterTimeline = gsap.timeline({
        onComplete: () => {
          this.isTransitioning = false;
          if (options.onComplete) options.onComplete();
        }
      });

      this.masterTimeline.to(
        controls.target,
        {
          x: targetX,
          y: targetY,
          duration: duration,
          ease: 'power3.out',
          overwrite: 'auto'
        },
        0
      );

      this.masterTimeline.to(
        camera.position,
        {
          x: targetX,
          y: targetY,
          duration: duration,
          ease: 'power3.out',
          overwrite: 'auto'
        },
        0
      );

      // Smoothly reframe zoom toward parent fit
      this.masterTimeline.to(
        camera,
        {
          zoom: Math.min(camera.zoom, framing.zoom),
          duration: duration,
          ease: 'power3.out',
          overwrite: 'auto',
          onUpdate: () => camera.updateProjectionMatrix()
        },
        0
      );
    }
    // 2. Programmatic Camera Flight (clicks on navbar or states)
    else if (isProgrammatic) {
      if (this.masterTimeline) {
        this.masterTimeline.kill();
        this.masterTimeline = null;
      }
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
      gsap.killTweensOf(camera);

      this.isTransitioning = true;

      const framing = this.cameraController.fitBounds(newRegion.projectedBounds, 1.25);

      this.masterTimeline = gsap.timeline({
        onComplete: () => {
          this.isTransitioning = false;
          if (options.onComplete) options.onComplete();
        }
      });

      this.masterTimeline.to(
        controls.target,
        {
          x: framing.target.x,
          y: framing.target.y,
          z: 0,
          duration: duration,
          ease: 'power2.out',
          overwrite: 'auto'
        },
        0
      );

      this.masterTimeline.to(
        camera.position,
        {
          x: framing.position.x,
          y: framing.position.y,
          duration: duration,
          ease: 'power2.out',
          overwrite: 'auto'
        },
        0
      );

      if (options.animateZoom !== false) {
        this.masterTimeline.to(
          camera,
          {
            zoom: framing.zoom,
            duration: duration,
            ease: 'power2.out',
            overwrite: 'auto',
            onUpdate: () => camera.updateProjectionMatrix()
          },
          0
        );
      }
    }

    // 3. Hierarchy-Aware Material Opacity Transitions
    this.updateVisibility(newRegion, isUpwardSnap ? 0.35 : (isProgrammatic ? duration : 0.45));

    // 4. Highlight Active Boundary
    if (newRegion.level !== 'world') {
      this.boundaryRenderer.setHighlight(newRegion);
    } else {
      this.boundaryRenderer.clearHighlight();
    }
  }

  /**
   * Smooth, selective visibility cross-fading
   */
  updateVisibility(activeRegion, duration = 0.35) {
    if (!activeRegion) return;

    if (this.lastActiveRegionId === activeRegion.id) {
      return;
    }
    this.lastActiveRegionId = activeRegion.id;

    const isForeignCountry = activeRegion.level === 'country' && activeRegion.id !== 'india';
    const isWorld = activeRegion.level === 'world';

    const ancestors = new Set(this.hierarchy.getAncestors(activeRegion).map((r) => r.id));
    const siblings = new Set(this.hierarchy.getSiblings(activeRegion).map((r) => r.id));
    const children = new Set(this.hierarchy.getChildren(activeRegion).map((r) => r.id));

    const allRegions = this.hierarchy.registry.getAll();

    for (const region of allRegions) {
      if (!region.mesh) continue;

      let targetOpacity = 0.0;
      let shouldBeVisible = true;

      if (isWorld) {
        if (region.level === 'country') {
          targetOpacity = region.id === 'india' ? 0.95 : 0.70;
        } else {
          targetOpacity = 0.0;
          shouldBeVisible = false;
        }
      } else if (isForeignCountry) {
        if (region.id === activeRegion.id) {
          targetOpacity = 0.95;
        } else if (region.level === 'country') {
          targetOpacity = 0.30;
        } else {
          targetOpacity = 0.0;
          shouldBeVisible = false;
        }
      } else if (region.id === activeRegion.id) {
        targetOpacity = 0.95;
      } else if (children.has(region.id)) {
        targetOpacity = 0.65;
      } else if (siblings.has(region.id)) {
        targetOpacity = 0.20;
      } else if (ancestors.has(region.id)) {
        targetOpacity = 0.30;
      } else if (region.level === 'country') {
        targetOpacity = 0.15;
      } else {
        targetOpacity = 0.0;
        shouldBeVisible = false;
      }

      if (targetOpacity === 0) {
        region.mesh.visible = false;
        region.mesh.traverse((child) => {
          if (child.material) {
            gsap.killTweensOf(child.material);
            child.material.opacity = 0.0;
          }
        });
      } else {
        region.mesh.visible = true;
        region.mesh.traverse((child) => {
          if (child.material) {
            const targetChildOpacity = child.isLine ? 0.95 : targetOpacity;
            gsap.killTweensOf(child.material);
            gsap.to(child.material, {
              opacity: targetChildOpacity,
              duration: duration,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  }
}
