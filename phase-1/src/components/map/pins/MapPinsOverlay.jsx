import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { geoToThree } from '../geometry/geoToThree.js';
import { MapPinMarker } from './MapPinMarker.jsx';
import { api } from '../../../services/api.js';

export const MapPinsOverlay = ({
  activeRegion,
  mapEngineRef,
  containerRef,
  onInspectPin
}) => {
  const [pins, setPins] = useState([]);
  const [projectedPins, setProjectedPins] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const animFrameRef = useRef(null);

  // 1. Fetch Pins dynamically based on polygon focus level
  useEffect(() => {
    let isCurrent = true;
    const rawId = (activeRegion?.id || 'india').toLowerCase();
    const rawLevel = (activeRegion?.level || 'country').toLowerCase();

    const isCountry = rawLevel === 'country' || rawId === 'india' || rawId === 'world';
    const isState = rawLevel === 'state';

    let queryParams = {};

    if (isCountry) {
      // Level 1: India as a whole focused
      queryParams = { level: 'country' };
    } else if (isState) {
      // Level 2: A particular state focused -> pins for every district in that state
      queryParams = { level: 'state', parentId: rawId, stateId: rawId };
    } else {
      // Level 3: A particular district clicked -> pins for only that district
      const centroid = activeRegion?.geoCentroid || [72.8777, 19.076];
      queryParams = {
        level: 'district',
        parentId: rawId,
        districtId: rawId,
        name: activeRegion?.name || rawId,
        lng: centroid[0],
        lat: centroid[1],
        lst_celsius: activeRegion?.properties?.lst_celsius || 42.0,
        tree_count: activeRegion?.properties?.tree_count || 4800
      };
    }

    setIsVisible(false);

    api.getPins(queryParams)
      .then((data) => {
        if (!isCurrent) return;
        setPins(data || []);
        setTimeout(() => {
          if (isCurrent) setIsVisible(true);
        }, 150);
      })
      .catch((err) => {
        console.warn('Pins fetch failed:', err);
        if (isCurrent) setPins([]);
      });

    return () => {
      isCurrent = false;
    };
  }, [activeRegion?.id, activeRegion?.level]);

  // 2. Continuous 60fps Projection Synchronization with Three.js Camera
  useEffect(() => {
    const updatePositions = () => {
      const engine = mapEngineRef?.current;
      const camera = engine?.cameraController?.camera;
      const container = containerRef?.current;

      if (!camera || !container || pins.length === 0) {
        setProjectedPins([]);
        animFrameRef.current = requestAnimationFrame(updatePositions);
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = rect.width || container.clientWidth || 800;
      const height = rect.height || container.clientHeight || 600;

      const projected = [];

      for (let i = 0; i < pins.length; i++) {
        const pin = pins[i];
        if (!pin.coordinates) continue;

        const pt = geoToThree(pin.coordinates.lng, pin.coordinates.lat);
        const v = new THREE.Vector3(pt.x, pt.y, 0.5);

        // Project 3D coordinates into Normalized Device Coordinates (NDC)
        v.project(camera);

        // Convert NDC to 2D Container Screen Coordinates
        const screenX = (v.x * 0.5 + 0.5) * width;
        const screenY = (-(v.y * 0.5) + 0.5) * height;

        // Frustum Culling: Only render if within or near viewport boundaries
        if (
          screenX >= -100 &&
          screenX <= width + 100 &&
          screenY >= -100 &&
          screenY <= height + 100
        ) {
          projected.push({
            pin,
            x: Math.round(screenX),
            y: Math.round(screenY)
          });
        }
      }

      setProjectedPins(projected);
      animFrameRef.current = requestAnimationFrame(updatePositions);
    };

    animFrameRef.current = requestAnimationFrame(updatePositions);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [pins, mapEngineRef, containerRef]);

  if (!isVisible || projectedPins.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25 transition-opacity duration-300">
      {projectedPins.map(({ pin, x, y }) => (
        <MapPinMarker
          key={pin.id}
          pin={pin}
          x={x}
          y={y}
          onInspect={onInspectPin}
        />
      ))}
    </div>
  );
};
