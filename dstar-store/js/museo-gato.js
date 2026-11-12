import * as THREE from './vendor/three.module.min.js?v=170';

const HEAD = { x: 219, y: 165, unit: 0.0028, depth: 0.235 };
const HIP = { x: 0.111, y: 0.280, upper: 0.103, lower: 0.098 };
const SHOE = { sole: 0.081, heel: 0.082, toe: 0.185, footprint: 0.89, height: 0.94 };
const SHOULDER = { x: 0.158, y: 0.579, upper: 0.102, lower: 0.099 };
const SPINE = 0.352;
const NECK = 0.642;
const TAU = 2 * Math.PI;
const { clamp, lerp, smoothstep } = THREE.MathUtils;
const headPoint = (x, y) => new THREE.Vector2(x - HEAD.x, HEAD.y - y);
const contour = (path, detail) => path.getPoints(detail).map(({ x, y }) => headPoint(x, y));

function headOutline() {
  const path = new THREE.Path();
  path.moveTo(119, 138);
  path.bezierCurveTo(125, 125, 121, 57, 126, 58);
  path.bezierCurveTo(132, 57, 150, 105, 192, 105);
  path.lineTo(246, 105);
  path.bezierCurveTo(286, 105, 303, 57, 312, 58);
  path.bezierCurveTo(315, 64, 313, 125, 318, 138);
  path.quadraticCurveTo(332, 137, 339, 140);
  path.lineTo(324, 155);
  path.quadraticCurveTo(355, 177, 361, 184);
  path.quadraticCurveTo(330, 193, 308, 203);
  path.quadraticCurveTo(310, 222, 319, 249);
  path.quadraticCurveTo(316, 251, 307, 244);
  path.quadraticCurveTo(288, 232, 265, 226);
  path.quadraticCurveTo(222, 237, 173, 226);
  path.quadraticCurveTo(146, 232, 129, 244);
  path.quadraticCurveTo(119, 251, 119, 249);
  path.quadraticCurveTo(125, 225, 130, 203);
  path.quadraticCurveTo(105, 193, 77, 184);
  path.quadraticCurveTo(82, 178, 114, 155);
  path.lineTo(99, 140);
  path.quadraticCurveTo(107, 137, 119, 138);

  return contour(path, 12);
}

function eyeContours() {
  const left = new THREE.Path();
  left.moveTo(144, 143);
  left.quadraticCurveTo(180, 152, 210, 160);
  left.bezierCurveTo(221, 164, 224, 182, 213, 194);
  left.bezierCurveTo(196, 216, 169, 212, 152, 194);
  left.bezierCurveTo(139, 180, 135, 161, 144, 143);

  const right = new THREE.Path();
  right.moveTo(293, 136);
  right.quadraticCurveTo(259, 147, 228, 159);
  right.bezierCurveTo(218, 163, 217, 183, 228, 194);
  right.bezierCurveTo(248, 215, 274, 205, 289, 188);
  right.bezierCurveTo(303, 172, 302, 150, 293, 136);

  return [[left, 181, 177], [right, 263, 174]].map(([path, x, y]) => {
    const outline = contour(path, 10);
    outline.pop();
    return { outline, center: headPoint(x, y) };
  });
}

function rayRadius(points, x, y) {
  let radius = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[j];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const det = x * dy - y * dx;
    if (Math.abs(det) < 1e-6) continue;
    const t = (a.x * y - a.y * x) / det;
    if (t >= 0 && t <= 1) radius = Math.max(radius, (a.x * dy - a.y * dx) / det);
  }
  return radius;
}

function signedDistance(outline, x, y) {
  let closest = Infinity;
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[j];
    const b = outline[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy), 0, 1);
    closest = Math.min(closest, (x - a.x - t * dx) ** 2 + (y - a.y - t * dy) ** 2);
    if ((a.y > y) !== (b.y > y) && x < a.x + dx * (y - a.y) / dy) inside = !inside;
  }
  return Math.sqrt(closest) * (inside ? 1 : -1);
}

function meshGeometry(positions, indices, uvs, normals) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  if (uvs) geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (normals) geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  else geometry.computeVertexNormals();
  return geometry;
}

function facePatch(outline, center, depth, rows) {
  const points = THREE.ShapeUtils.isClockWise(outline) ? [...outline].reverse() : outline;
  const cols = points.length;
  const positions = [center.x * HEAD.unit, center.y * HEAD.unit, depth(center.x, center.y, 0)];
  const indices = [];
  for (let row = 1; row <= rows; row++) {
    const radius = row / rows;
    for (let col = 0; col < cols; col++) {
      const x = lerp(center.x, points[col].x, radius);
      const y = lerp(center.y, points[col].y, radius);
      positions.push(x * HEAD.unit, y * HEAD.unit, depth(x, y, radius));
      const outer = 1 + (row - 1) * cols;
      const inner = outer - cols;
      const next = (col + 1) % cols;
      if (row === 1) indices.push(0, outer + col, outer + next);
      else indices.push(inner + col, outer + col, outer + next, inner + col, outer + next, inner + next);
    }
  }
  return meshGeometry(positions, indices);
}

function sculptHead(fur, muzzle) {
  const head = new THREE.Group();
  const eyes = eyeContours();
  const outline = headOutline();
  outline.pop();
  const rings = 80;
  const cols = 224;
  const meridians = Array.from({ length: cols }, (_, col) => {
    const angle = -col * TAU / cols;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    return { x, y, rim: rayRadius(outline, x, y), core: 1 / Math.hypot(x / 90, y / 58) };
  });
  const radiusAt = (radius, core, rim) => radius * lerp(core, rim, radius ** 10);
  const cheek = (x, y) => 0.014 * Math.exp(-(((Math.abs(x) - 17) / 20) ** 2 + ((y + 35) / 12) ** 2));
  const surfaceDepth = (x, y) => {
    const angle = ((-Math.atan2(y, x) / TAU + 1) % 1) * cols;
    const a = meridians[Math.floor(angle)];
    const b = meridians[(Math.floor(angle) + 1) % cols];
    const core = lerp(a.core, b.core, angle % 1);
    const rim = lerp(a.rim, b.rim, angle % 1);
    const distance = Math.hypot(x, y);
    let low = 0;
    let high = 1;
    for (let i = 0; i < 12; i++) {
      const mid = (low + high) * 0.5;
      if (radiusAt(mid, core, rim) < distance) low = mid;
      else high = mid;
    }
    return Math.sqrt(1 - low * low) * HEAD.depth + cheek(x, y);
  };
  const positions = [0, 0, HEAD.depth];
  const indices = [];
  for (let ring = 1; ring < rings; ring++) {
    const angle = ring * Math.PI / rings;
    const radius = Math.sin(angle);
    const z = Math.cos(angle) * HEAD.depth;
    for (const { x, y, rim, core } of meridians) {
      const distance = radiusAt(radius, core, rim);
      const px = x * distance;
      const py = y * distance;
      let relief = 0;
      if (z > 0) {
        relief = cheek(px, py);
        for (const eye of eyes) {
          if (Math.abs(px - eye.center.x) > 51 || Math.abs(py - eye.center.y) > 51) continue;
          const edge = signedDistance(eye.outline, px, py);
          const brow = (edge + 4.3) / 4.2;
          relief += 0.008 * Math.exp(-brow * brow) - 0.050 * smoothstep(edge, -3, 5);
        }
      }
      positions.push(px * HEAD.unit, py * HEAD.unit, z + relief);
    }
  }
  const rear = positions.length / 3;
  positions.push(0, 0, -HEAD.depth);
  for (let ring = 0; ring < rings; ring++) {
    for (let col = 0; col < cols; col++) {
      const next = (col + 1) % cols;
      const inner = 1 + (ring - 1) * cols;
      const outer = inner + cols;
      if (ring === 0) indices.push(0, outer + next, outer + col);
      else if (ring === rings - 1) indices.push(inner + col, inner + next, rear);
      else indices.push(inner + col, inner + next, outer + col, inner + next, outer + next, outer + col);
    }
  }
  head.add(new THREE.Mesh(meshGeometry(positions, indices), fur));

  const ivory = new THREE.MeshStandardMaterial({ color: 0xded7cb, roughness: 0.32, vertexColors: true });
  const iris = new THREE.MeshStandardMaterial({ color: 0x100e12, roughness: 0.24 });
  for (const { outline: rim, center } of eyes) {
    const edge = rim.map((p) => p.clone().lerp(center, 0.062));
    const relative = edge.map((p) => p.clone().sub(center));
    const eyeDepth = (x, y, radius) => surfaceDepth(x, y) - 0.029 + 0.035 * (1 - radius * radius);
    const eyeRows = 20;
    const eye = facePatch(edge, center, eyeDepth, eyeRows);
    const colors = [1, 1, 1];
    for (let row = 1; row <= eyeRows; row++) {
      const light = 1 - 0.34 * smoothstep(row / eyeRows, 0.64, 1);
      edge.forEach(() => colors.push(light, light, light));
    }
    eye.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    head.add(new THREE.Mesh(eye, ivory));

    const tips = [23, 13, 18, 11, 26, 11, 18, 13];
    const star = Array.from({ length: 16 }, (_, i) => {
      const angle = i * Math.PI / 8;
      const radius = i % 2 === 0 ? tips[i / 2] : 4.6;
      return new THREE.Vector2(center.x + Math.sin(angle) * radius, center.y + Math.cos(angle) * radius);
    });
    const outline = star.flatMap((p, i) => {
      const next = star[(i + 1) % star.length];
      return Array.from({ length: 4 }, (_, j) => p.clone().lerp(next, j / 4));
    });
    const pupil = facePatch(outline, center, (x, y) => {
      const dx = x - center.x;
      const dy = y - center.y;
      const length = Math.hypot(dx, dy);
      const radius = length > 0 ? length / rayRadius(relative, dx / length, dy / length) : 0;
      return eyeDepth(x, y, radius) + 0.0034;
    }, 18);
    head.add(new THREE.Mesh(pupil, iris));
  }

  const nose = new THREE.Path();
  nose.moveTo(205, 196);
  nose.quadraticCurveTo(221, 192, 237, 195);
  nose.quadraticCurveTo(234, 205, 224, 210);
  nose.quadraticCurveTo(215, 212, 205, 196);
  const noseOutline = contour(nose, 12);
  noseOutline.pop();
  head.add(new THREE.Mesh(facePatch(noseOutline, headPoint(222, 199), (x, y, r) => surfaceDepth(x, y) + 0.023 * (1 - r * r), 7), muzzle));
  return head;
}

export function profileGeometry(profile, { back, twist = 0, fold = 0, neckline = 0, roundness = 1, centerZ } = {}) {
  const cols = back === undefined ? 36 : 26;
  const rows = 24;
  const start = (back ? Math.PI / 2 : -Math.PI / 2) + twist;
  const sweep = back === undefined ? TAU : Math.PI;
  const curve = new THREE.CatmullRomCurve3(profile.map(([y, rx, rz = rx]) => new THREE.Vector3(rx, y, rz)));
  const y0 = profile[1][0];
  const top = Math.max(...profile.map(([y]) => y));
  const span = top - y0;
  const ring = new THREE.Vector3();
  const point = (phi, t, out) => {
    curve.getPoint(clamp(t, 0, 1), ring);
    const ripple = 1 + fold * (1 - t) ** 1.6 * Math.sin(phi * 6 + 1.1);
    const side = Math.sin(phi);
    const front = Math.cos(phi);
    const dip = neckline * Math.max(0, front) ** 5 * smoothstep(ring.y, top - 0.06, top - 0.009);
    const x = Math.sign(side) * Math.abs(side) ** roundness * ring.x * ripple;
    const z = Math.sign(front) * Math.abs(front) ** roundness * ring.z * ripple;
    return out.set(x, ring.y - dip, z + (centerZ?.(ring.y) ?? 0));
  };
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const p = new THREE.Vector3();
  const q = new THREE.Vector3();
  const around = new THREE.Vector3();
  const along = new THREE.Vector3();
  for (let j = 0; j <= rows; j++) {
    const t = j / rows;
    for (let i = 0; i <= cols; i++) {
      const phi = start + i * sweep / cols;
      point(phi, t, p);
      around.copy(point(phi + 0.01, t, q)).sub(point(phi - 0.01, t, q));
      along.copy(point(phi, Math.min(1, t + 0.01), q)).sub(point(phi, Math.max(0, t - 0.01), q));
      around.cross(along).normalize();
      positions.push(p.x, p.y, p.z);
      normals.push(around.x, around.y, around.z);
      uvs.push(i / cols, clamp((p.y - y0) / span, 0, 1));
      if (i < cols && j < rows) {
        const a = j * (cols + 1) + i;
        const b = a + cols + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  return meshGeometry(positions, indices, uvs, normals);
}

function makeRig(root, joint, weight, limb) {
  root.updateWorldMatrix(true, true);
  const bones = limb ? [root, joint, limb.anchorBone, limb.tip] : [root, joint];
  if (limb?.roll) bones.push(limb.roll);
  return { root, joint, weight, limb, skeleton: new THREE.Skeleton(bones), bindMatrix: root.matrixWorld.clone() };
}

export function bindPart(geometry, material, rig) {
  const positions = geometry.attributes.position;
  const indices = new Uint16Array(positions.count * 4);
  const weights = new Float32Array(positions.count * 4);
  for (let i = 0; i < positions.count; i++) {
    const offset = i * 4;
    const y = positions.getY(i);
    const joint = rig.weight(y);
    const anchor = rig.limb?.anchor(y, positions.getX(i)) ?? 0;
    const tip = rig.limb?.tipWeight(y) ?? 0;
    const middle = (1 - anchor) * (1 - tip);
    // La clavícula y el giro del antebrazo ocupan zonas distintas de la manga.
    const roll = anchor === 0 ? joint * (rig.limb?.rollWeight?.(y) ?? 0) : 0;
    indices[offset + 1] = 1;
    indices[offset + 2] = roll > 0 ? 4 : rig.limb ? 2 : 0;
    indices[offset + 3] = rig.limb ? 3 : 0;
    weights[offset] = middle * (1 - joint);
    weights[offset + 1] = middle * (joint - roll);
    weights[offset + 2] = anchor + middle * roll;
    weights[offset + 3] = (1 - anchor) * tip;
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.bind(rig.skeleton, rig.bindMatrix);
  mesh.frustumCulled = false;
  rig.root.add(mesh);
  return mesh;
}

function makeLimb(parent, side, { x, y, upper, lower }, forearm = false) {
  const socket = new THREE.Bone();
  const root = new THREE.Bone();
  const joint = new THREE.Bone();
  const tip = new THREE.Bone();
  socket.position.set(side * x, y, 0);
  joint.position.y = -upper;
  socket.add(root);
  root.add(joint);
  const roll = forearm ? new THREE.Bone() : null;
  if (roll) {
    roll.position.y = -lower * 0.46;
    joint.add(roll);
    roll.add(tip);
  } else {
    joint.add(tip);
  }
  tip.position.y = -lower - (roll?.position.y ?? 0);
  parent.add(socket);
  const weight = (y) => smoothstep(-y, upper - 0.041, upper + 0.047);
  const anchor = (y, x) => smoothstep(y, -0.078, 0.038) * lerp(0.42, 1, smoothstep(-side * x, -0.04, 0.047));
  const tipWeight = (y) => smoothstep(-y, upper + lower - 0.023, upper + lower + 0.009);
  const rollWeight = roll ? (y) => smoothstep(-y, upper + lower * 0.17, upper + lower * 0.78) : undefined;
  return { ...makeRig(root, joint, weight, { anchorBone: parent, anchor, tip, tipWeight, roll, rollWeight }), socket, tip, roll };
}

function ellipsoid(parent, geometry, material, x, y, z, rx, ry, rz) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(rx, ry, rz);
  parent.add(mesh);
  return mesh;
}

function curvedPoint(points, radius, end = 0.05) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const segments = 18;
  const sides = 9;
  const geometry = new THREE.TubeGeometry(curve, segments, radius, sides);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const center = curve.getPointAt(progress);
    const width = lerp(1, end, progress ** 1.3);
    for (let j = 0; j <= sides; j++) {
      const index = i * (sides + 1) + j;
      vertex.fromBufferAttribute(positions, index).sub(center).multiplyScalar(width).add(center);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function bakeColoredParts(parts, material) {
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  const point = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();
  for (const part of parts.children) {
    part.updateMatrix();
    normalMatrix.getNormalMatrix(part.matrix);
    const source = part.geometry;
    const offset = positions.length / 3;
    for (let i = 0; i < source.attributes.position.count; i++) {
      point.fromBufferAttribute(source.attributes.position, i).applyMatrix4(part.matrix);
      positions.push(point.x, point.y, point.z);
      point.fromBufferAttribute(source.attributes.normal, i).applyNormalMatrix(normalMatrix);
      normals.push(point.x, point.y, point.z);
      const { r, g, b } = part.material.color;
      colors.push(r, g, b);
    }
    for (const index of source.index.array) indices.push(offset + index);
  }
  const geometry = meshGeometry(positions, indices, null, normals);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Mesh(geometry, material);
}

function makeHand(side, sphere, claw, vinyl, horn, colorMaterial) {
  const hand = new THREE.Group();
  const palm = new THREE.Group();
  const shape = profileGeometry([
    [-0.060, 0.007, 0.009], [-0.054, 0.026, 0.025], [-0.040, 0.035, 0.031],
    [-0.019, 0.035, 0.032], [0.001, 0.030, 0.027], [0.018, 0.026, 0.023]
  ]);
  palm.add(new THREE.Mesh(shape, vinyl));
  for (const x of [-0.016, 0, 0.016]) {
    const nail = new THREE.Mesh(claw, horn);
    nail.position.set(x, -0.049 + Math.abs(x) * 0.14, 0.019);
    palm.add(nail);
  }
  hand.add(bakeColoredParts(palm, colorMaterial));
  shape.dispose();
  const thumb = new THREE.Group();
  thumb.position.set(-side * 0.025, -0.013, 0.014);
  thumb.rotation.z = -side * 0.37;
  ellipsoid(thumb, sphere, vinyl, 0, -0.014, 0.006, 0.014, 0.021, 0.016);
  hand.add(thumb);
  return { hand, thumb };
}

function toeTexture() {
  const width = 256;
  const height = 128;
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;
      const edge = Math.hypot((u - 0.25) / 0.167, v / 0.76);
      const boundary = 1 - smoothstep(edge, 0.991, 1.013);
      const panel = 1 - smoothstep(edge, 0.975, 0.995);
      const pixel = (y * width + x) * 4;
      const shade = Math.round(lerp(lerp(23, 36, boundary), 29, panel));
      pixels[pixel] = pixels[pixel + 1] = pixels[pixel + 2] = shade;
      pixels[pixel + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, width, height);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function shoeMeshes(sphere) {
  const sole = { roundness: 0.78, centerZ: () => 0.047 };
  const outsole = profileGeometry([
    [-SHOE.sole, 0.004, 0.006], [-SHOE.sole, 0.084, 0.120], [-0.077, 0.095, 0.132],
    [-0.067, 0.097, 0.134], [-0.061, 0.093, 0.129]
  ], sole);
  const midsole = profileGeometry([
    [-0.069, 0.092, 0.128], [-0.065, 0.097, 0.136], [-0.055, 0.098, 0.137],
    [-0.045, 0.094, 0.133], [-0.039, 0.086, 0.125]
  ], sole);
  const upper = profileGeometry([
    [-0.051, 0.086, 0.124], [-0.038, 0.092, 0.128], [-0.013, 0.089, 0.122],
    [0.010, 0.080, 0.107], [0.035, 0.069, 0.083], [0.054, 0.057, 0.062],
    [0.066, 0.048, 0.049], [0.072, 0.035, 0.037], [0.065, 0.030, 0.031]
  ], { roundness: 0.77, centerZ: (y) => lerp(0.048, 0.002, smoothstep(y, -0.027, 0.072)) });

  const top = new THREE.Mesh(upper, new THREE.MeshStandardMaterial({ map: toeTexture(), roughness: 0.48, emissive: 0x202020, emissiveIntensity: 0.20 }));
  const details = new THREE.Group();
  const laceColor = new THREE.MeshStandardMaterial({ color: 0x262626 });
  const laces = [0.038, 0.059, 0.081];
  const ray = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
  for (const z of laces) {
    const points = [-0.034, -0.017, 0, 0.017, 0.034].map((x) => {
      const depth = z + 0.006 * (1 - (x / 0.034) ** 2);
      ray.ray.origin.set(x, 0.16, depth);
      const y = ray.intersectObject(top, false)[0]?.point.y ?? 0.041;
      return new THREE.Vector3(x, y + 0.003, depth);
    });
    const arc = new THREE.CatmullRomCurve3(points);
    details.add(new THREE.Mesh(new THREE.TubeGeometry(arc, 9, 0.0037, 6), laceColor));
  }
  ellipsoid(details, sphere, laceColor, 0, 0.030, -0.061, 0.024, 0.013, 0.013);
  const trimMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.64, emissive: 0x1a1a1a, emissiveIntensity: 0.20 });
  const trim = bakeColoredParts(details, trimMaterial);
  details.children.slice(0, laces.length).forEach(({ geometry }) => geometry.dispose());
  laceColor.dispose();

  const shoe = new THREE.Group();
  shoe.add(
    new THREE.Mesh(outsole, new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.81 })),
    new THREE.Mesh(midsole, new THREE.MeshStandardMaterial({ color: 0x242424, roughness: 0.61, emissive: 0x202020, emissiveIntensity: 0.20 })),
    top, trim
  );
  shoe.scale.set(SHOE.footprint, SHOE.height, SHOE.footprint);
  shoe.position.y = -SHOE.sole * (1 - SHOE.height);
  return shoe;
}

function walkLeg(leg, cycle, stride, height, pace) {
  const stance = 0.57;
  const swing = clamp((cycle - stance) / (1 - stance), 0, 1);
  const offset = cycle < stance ? 1 - 2 * cycle / stance : -Math.cos(Math.PI * swing);
  const lift = Math.sin(Math.PI * swing) ** 1.45 * stride;
  const push = smoothstep(cycle, 0.32, stance) * (1 - smoothstep(cycle, stance, 0.78));
  const land = 1 - smoothstep(cycle, 0, 0.12) + smoothstep(cycle, 0.82, 1);
  const pitch = (0.139 * push - 0.107 * land) * stride;
  const contactLift = SHOE.footprint * Math.max(0, Math.sin(pitch) * SHOE.toe, -Math.sin(pitch) * SHOE.heel);
  const z = offset * lerp(0.079, 0.141, pace) * stride;
  const down = HIP.y + height - SHOE.sole - contactLift - lift * lerp(0.027, 0.051, pace);
  const { upper, lower } = HIP;
  const distance = clamp(Math.hypot(z, down), 0.09, upper + lower - 0.002);
  const flex = Math.PI - Math.acos(clamp((upper * upper + lower * lower - distance * distance) / (2 * upper * lower), -1, 1));
  const hip = Math.atan2(-z, down) - Math.acos(clamp((upper * upper + distance * distance - lower * lower) / (2 * upper * distance), -1, 1));
  leg.root.rotation.x = hip;
  leg.joint.rotation.x = flex;
  leg.tip.rotation.x = -hip - flex + pitch;
}

function armAnimator(arm, side) {
  const { upper, lower } = SHOULDER;
  const down = new THREE.Vector3(0, -1, 0);
  const target = new THREE.Vector3();
  const gesture = new THREE.Vector3();
  const wrist = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const pole = new THREE.Vector3();
  const elbow = new THREE.Vector3();
  const forearm = new THREE.Vector3();
  const shoulderInverse = new THREE.Quaternion();

  return (dt, time, phase, stride, pace, greeting, reach, bend) => {
    const cycle = phase + (side > 0 ? Math.PI : 0);
    const swing = -Math.cos(cycle + 0.53);
    const forward = (swing + 1) * 0.5;
    const shoulderLead = -Math.cos(cycle + 0.86) * stride;
    const wristTrail = -Math.cos(cycle - 0.40) * stride;
    const idle = Math.sin(time * 2.1 + side) * (1 - stride);
    const wave = Math.sin(time * 10.3);
    const waveTrail = Math.sin(time * 10.3 - 0.55);
    const greet = smoothstep(greeting, 0.04, 0.95) * (1 - 0.88 * stride);

    target.set(
      side * (0.065 + stride * (0.008 + forward * 0.014) + idle * 0.002),
      -0.183 + stride * (0.007 + forward ** 2 * 0.032) + idle * 0.003,
      0.012 + swing * lerp(0.047, 0.079, pace) * stride + idle * 0.004
    );
    target.lerp(gesture.set(side * 0.087, -0.086, 0.137), reach);
    target.lerp(gesture.set(side * 0.072, -0.152, 0.088), bend);
    target.lerp(gesture.set(side * (0.129 + wave * 0.025), 0.074 + waveTrail * 0.013, 0.105), greet);
    const response = dt ? 1 - Math.exp(-dt * lerp(16, 39, stride)) : 1;
    wrist.lerp(target, response);

    arm.socket.position.z = shoulderLead * 0.009 + reach * 0.018 + greet * 0.008;
    arm.socket.rotation.set(-shoulderLead * 0.083 - reach * 0.095, side * shoulderLead * 0.044, side * (reach * 0.095 + greet * 0.15));

    // Resuelve hombro y codo a partir de la posición de la muñeca y el plano de flexión.
    const distance = clamp(wrist.length(), 0.065, upper + lower - 0.003);
    direction.copy(wrist).normalize();
    pole.set(side * lerp(0.30, 0.85, greet), -greet * 0.93, lerp(-1, -0.37, greet));
    pole.addScaledVector(direction, -pole.dot(direction)).normalize();
    const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
    elbow.copy(direction).multiplyScalar(along).addScaledVector(pole, Math.sqrt(upper * upper - along * along));
    forearm.copy(direction).multiplyScalar(distance).sub(elbow).normalize();
    arm.root.quaternion.setFromUnitVectors(down, elbow.normalize());
    shoulderInverse.copy(arm.root.quaternion).invert();
    arm.joint.quaternion.setFromUnitVectors(down, forearm.applyQuaternion(shoulderInverse));

    arm.roll.rotation.y = side * (-0.13 + wristTrail * 0.24 + reach * 0.28 + greet * (0.53 + wave * 0.13));
    arm.tip.rotation.set(-0.058 + wristTrail * 0.18 - reach * 0.12 + greet * waveTrail * 0.11, -side * (0.07 + reach * 0.12), side * (0.026 + wristTrail * 0.065 + greet * waveTrail * 0.39));
    arm.thumb.rotation.x = 0.07 + Math.max(0, wristTrail) * 0.13 + reach * 0.28 + greet * 0.08;
  };
}

function baseWardrobe(body, arms, legs, { camisa, jort }) {
  const cotton = new THREE.MeshStandardMaterial({ color: 0x383741, emissive: 0x292830, emissiveIntensity: 0.38, roughness: 0.67, side: THREE.DoubleSide });
  const denim = new THREE.MeshStandardMaterial({ color: 0x292a33, emissive: 0x1c1d27, emissiveIntensity: 0.32, roughness: 0.76, side: THREE.DoubleSide });
  const makeSet = (pattern, limbs, material) => [
    bindPart(profileGeometry(pattern.anillos, { neckline: pattern.cuello, fold: pattern.pliegue }), material, body),
    ...limbs.map((limb) => bindPart(profileGeometry(pattern.manga), material, limb))
  ];
  const shorts = {
    ...jort,
    anillos: [[0.270, 0.142, 0.077], [0.261, 0.157, 0.088], [0.281, 0.179, 0.109], [0.319, 0.187, 0.135], ...jort.anillos.slice(4)]
  };
  const star = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    const r = i % 2 ? 0.006 : (i % 4 ? 0.012 : 0.022);
    const x = Math.sin(a) * r;
    const y = Math.cos(a) * r;
    if (i === 0) star.moveTo(x, y);
    else star.lineTo(x, y);
  }
  star.closePath();
  const mark = new THREE.ShapeGeometry(star);
  mark.rotateY(0.27).rotateZ(-0.10).translate(0.058, 0.518, 0.144);
  const thread = new THREE.MeshStandardMaterial({ color: 0xbb3d4d, emissive: 0x892231, emissiveIntensity: 0.26, roughness: 0.68, side: THREE.DoubleSide });
  return {
    arriba: [...makeSet(camisa, arms, cotton), bindPart(mark, thread, body)],
    abajo: makeSet(shorts, legs, denim)
  };
}

export function createCat(scale, shadowTexture, patterns) {
  const vinyl = new THREE.MeshStandardMaterial({ color: 0x302c32, emissive: 0x211b22, emissiveIntensity: 0.22, roughness: 0.53 });
  const horn = new THREE.MeshStandardMaterial({ color: 0x5d5760, roughness: 0.5 });
  const nose = new THREE.MeshStandardMaterial({ color: 0x211a20, roughness: 0.33 });
  const colorMaterial = vinyl.clone();
  colorMaterial.color.set(0xffffff);
  colorMaterial.vertexColors = true;
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  const claw = curvedPoint([[0, 0, 0], [0, -0.003, 0.002], [0, -0.006, 0.001], [0, -0.010, -0.001]], 0.004);
  const shoe = shoeMeshes(sphere);
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  const pelvis = new THREE.Bone();
  const chest = new THREE.Bone();
  chest.position.y = SPINE;
  group.add(pelvis);
  pelvis.add(chest);
  const body = makeRig(pelvis, chest, (y) => smoothstep(y, 0.351, 0.512));
  bindPart(profileGeometry([
    [0.273, 0.016, 0.017], [0.290, 0.104, 0.070], [0.311, 0.136, 0.091],
    [0.348, 0.158, 0.110], [0.405, 0.164, 0.128], [0.479, 0.153, 0.125],
    [0.537, 0.153, 0.115], [0.579, 0.165, 0.106], [0.610, 0.131, 0.088],
    [0.642, 0.089, 0.077], [0.657, 0.064, 0.061]
  ]), vinyl, body);

  const neck = new THREE.Group();
  neck.position.set(0, NECK - SPINE, -0.015);
  neck.add(new THREE.Mesh(profileGeometry([
    [-0.026, 0.096, 0.083], [-0.001, 0.082, 0.072], [0.023, 0.072, 0.068],
    [0.050, 0.079, 0.071], [0.073, 0.096, 0.080], [0.086, 0.060, 0.052]
  ]), vinyl));
  const headJoint = new THREE.Group();
  headJoint.position.set(0, 0.026, 0.023);
  const head = sculptHead(vinyl, nose);
  head.position.y = 0.186;
  head.scale.setScalar(1.035);
  headJoint.add(head);
  neck.add(headJoint);
  chest.add(neck);

  const legs = [-1, 1].map((side) => {
    const leg = makeLimb(pelvis, side, HIP);
    bindPart(profileGeometry([
      [-0.214, 0.033, 0.033], [-0.190, 0.041, 0.041], [-0.153, 0.046, 0.047],
      [-0.111, 0.052, 0.051], [-0.073, 0.063, 0.059], [-0.026, 0.070, 0.063], [0.031, 0.061, 0.059]
    ]), vinyl, leg);
    leg.tip.add(shoe.clone());
    return leg;
  });

  const arms = [-1, 1].map((side) => {
    const arm = makeLimb(chest, side, { ...SHOULDER, y: SHOULDER.y - SPINE }, true);
    bindPart(profileGeometry([
      [-0.214, 0.024, 0.023], [-0.190, 0.030, 0.028], [-0.148, 0.041, 0.037],
      [-0.101, 0.047, 0.042], [-0.051, 0.051, 0.046], [-0.017, 0.055, 0.049],
      [0.021, 0.047, 0.043], [0.045, 0.013, 0.018]
    ]), vinyl, arm);
    const { hand, thumb } = makeHand(side, sphere, claw, vinyl, horn, colorMaterial);
    arm.tip.add(hand);
    arm.thumb = thumb;
    arm.pose = armAnimator(arm, side);
    return arm;
  });
  claw.dispose();
  horn.dispose();
  const wardrobe = baseWardrobe(body, arms, legs, patterns);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  group.add(shadow);

  let phase = 0;
  let stride = 0;
  let speed = 0;
  let direction = 1;
  let wave = 0;
  const fitting = new Set();
  function revealGarment(garment) {
    wardrobe[garment.slot].forEach((part) => { part.visible = false; });
    garment.parts.forEach((part) => { part.visible = true; });
  }
  function animate(dt, time, moving, greeting, pace = 0) {
    stride += ((moving ? 1 : 0) - stride) * (1 - Math.exp(-dt * (moving ? 14 : 17)));
    speed += (clamp(Math.abs(pace), 0, 1) - speed) * (1 - Math.exp(-dt * 13));
    if (Math.abs(pace) > 0.025) direction = Math.sign(pace);
    wave += ((greeting ? 1 : 0) - wave) * (1 - Math.exp(-dt * 7));
    phase = (phase + TAU + dt * (11 + 22 * speed) * stride * direction) % TAU;
    const swing = Math.sin(phase) * stride;
    let reach = 0;
    let bend = 0;
    for (const garment of fitting) {
      garment.fit = moving ? 1 : Math.min(1, garment.fit + dt / 0.74);
      const progress = Math.max(0, garment.fit);
      const gesture = Math.sin(Math.PI * progress);
      if (garment.slot === 'arriba') reach = gesture;
      else bend = gesture;
      if (progress >= 0.38 && !garment.parts[0].visible) revealGarment(garment);
      if (progress === 1) fitting.delete(garment);
    }

    pelvis.position.x = -Math.cos(phase) * 0.013 * stride;
    pelvis.position.y = (-0.023 - speed * 0.032 + Math.cos(phase * 2) * 0.007) * stride - bend * 0.015;
    chest.rotation.set((0.021 * direction + speed * 0.057) * stride + bend * 0.105 + Math.sin(time * 2.3) * 0.009, swing * 0.103, swing * 0.045);
    neck.rotation.set(-chest.rotation.x * 0.63 + bend * 0.045, -swing * 0.052, -swing * 0.031);
    headJoint.rotation.set(Math.cos(phase * 2 - 0.6) * 0.020 * stride - reach * 0.047, Math.sin(time * 1.7) * 0.038 * (1 - stride), -swing * 0.012);
    legs.forEach((leg, i) => walkLeg(leg, (phase / TAU + i * 0.5 + 0.13) % 1, stride, pelvis.position.y, speed));
    arms[0].pose(dt, time, phase, stride, speed, 0, reach, bend);
    arms[1].pose(dt, time, phase, stride, speed, wave, reach, bend);
    shadow.scale.setScalar(0.95 - pelvis.position.y * 1.3);
    return fitting.size > 0;
  }

  animate(0, 0, false, false);
  return {
    group, body, arms, legs, animate,
    wear(garment, instant) {
      if (instant) {
        revealGarment(garment);
        return;
      }
      garment.fit = -0.23;
      garment.parts.forEach((part) => { part.visible = false; });
      fitting.add(garment);
    },
    unwear(garment) {
      fitting.delete(garment);
      wardrobe[garment.slot].forEach((part) => { part.visible = true; });
    }
  };
}
