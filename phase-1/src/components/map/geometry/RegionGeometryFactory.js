import * as THREE from 'three';
import { geoToThree } from './geoToThree.js';

const Z_OFFSETS = {
  world: 0.00,
  country: 0.01,
  state: 0.02,
  district: 0.03,
  city: 0.035,
  neighborhood: 0.04,
  microgrid: 0.05
};

export class RegionGeometryFactory {
  static createRegionMesh(region, color = 0xe2e8f0, opacity = 0.8) {
    if (!region || !region.geometry || !region.geometry.coordinates) return null;

    const group = new THREE.Group();
    group.name = `region-group-${region.id}`;

    const zOffset = Z_OFFSETS[region.level] || 0.01;

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const boundaryLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#ffffff'), // Clean crisp white borders
      linewidth: 1.5,
      transparent: true,
      opacity: opacity > 0 ? 0.95 : 0.0,
      depthWrite: false
    });

    // Normalize geometry into a list of polygons: [ [outerRing, ...holes], ... ]
    const geom = region.geometry;
    const polygonList = geom.type === 'Polygon' ? [geom.coordinates] : (geom.type === 'MultiPolygon' ? geom.coordinates : []);

    const shapes = [];

    for (const rings of polygonList) {
      if (!rings || rings.length === 0) continue;

      const outerRing = rings[0];
      if (outerRing.length < 3) continue;

      // Outer shape ring
      const shape = new THREE.Shape();
      const oLen = outerRing.length;
      const isOClosed = (outerRing[0][0] === outerRing[oLen - 1][0] && outerRing[0][1] === outerRing[oLen - 1][1]);
      const oCount = isOClosed ? oLen - 1 : oLen;

      for (let i = 0; i < oCount; i++) {
        const v = geoToThree(outerRing[i][0], outerRing[i][1]);
        if (i === 0) shape.moveTo(v.x, v.y);
        else shape.lineTo(v.x, v.y);
      }
      shape.closePath();

      // Hole rings
      for (let h = 1; h < rings.length; h++) {
        const holeRing = rings[h];
        if (holeRing.length < 3) continue;
        const holePath = new THREE.Path();
        const hLen = holeRing.length;
        const isHClosed = (holeRing[0][0] === holeRing[hLen - 1][0] && holeRing[0][1] === holeRing[hLen - 1][1]);
        const hCount = isHClosed ? hLen - 1 : hLen;

        for (let j = 0; j < hCount; j++) {
          const v = geoToThree(holeRing[j][0], holeRing[j][1]);
          if (j === 0) holePath.moveTo(v.x, v.y);
          else holePath.lineTo(v.x, v.y);
        }
        holePath.closePath();
        shape.holes.push(holePath);
      }

      shapes.push(shape);

      // Boundary line for this polygon's outer ring
      const boundaryPoints = [];
      for (let i = 0; i < outerRing.length; i++) {
        const v = geoToThree(outerRing[i][0], outerRing[i][1]);
        boundaryPoints.push(new THREE.Vector3(v.x, v.y, zOffset + 0.002));
      }
      const lineGeom = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
      const lineLoop = new THREE.LineLoop(lineGeom, boundaryLineMat);
      lineLoop.userData = { regionId: region.id, isBoundary: true };
      group.add(lineLoop);
    }

    if (shapes.length === 0) return null;

    // Single unified ShapeGeometry for all polygons in this feature
    const shapeGeom = new THREE.ShapeGeometry(shapes);
    const mesh = new THREE.Mesh(shapeGeom, material);
    mesh.position.z = zOffset;
    mesh.userData = { regionId: region.id, region };
    group.add(mesh);

    group.userData = { regionId: region.id, region };
    group.visible = opacity > 0;
    region.mesh = group;
    return group;
  }
}
