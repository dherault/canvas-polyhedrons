const { cos, sin, sqrt, abs, PI } = Math
const TAU = 2 * PI
const canvas = document.getElementsByTagName('canvas')[0]
const _ = canvas.getContext('2d')

const width = canvas.width = window.innerWidth
const height = canvas.height = window.innerHeight

const backgroundColor = 'white'
const verticeColor = 'black'
const nodeColor = 'red'
const centerColor = 'blue'
const pivotColor = 'green'

const polyhedron = createPolyhedron(PI / 2, PI / 2)

// let da = PI / 360
// let db = PI / 360
// let dc = PI / 360
let da = 0
let db = 0
let dc = 0

document.getElementById('button-a-plus').onclick = () => {
  da += Math.PI / 360
}
document.getElementById('button-a-minus').onclick = () => {
  da -= Math.PI / 360
}
document.getElementById('button-b-plus').onclick = () => {
  db += Math.PI / 360
}
document.getElementById('button-b-minus').onclick = () => {
  db -= Math.PI / 360
}
document.getElementById('button-c-plus').onclick = () => {
  dc += Math.PI / 360
}
document.getElementById('button-c-minus').onclick = () => {
  dc -= Math.PI / 360
}

document.getElementById('button-alpha-plus').onclick = () => {
  polyhedron.rotationOffset.alpha += Math.PI / 16
}
document.getElementById('button-alpha-minus').onclick = () => {
  polyhedron.rotationOffset.alpha -= Math.PI / 16
}
document.getElementById('button-beta-plus').onclick = () => {
  polyhedron.rotationOffset.beta += Math.PI / 16
}
document.getElementById('button-beta-minus').onclick = () => {
  polyhedron.rotationOffset.beta -= Math.PI / 16
}
document.getElementById('button-gamma-plus').onclick = () => {
  polyhedron.rotationOffset.gamma += Math.PI / 16
}
document.getElementById('button-gamma-minus').onclick = () => {
  polyhedron.rotationOffset.gamma -= Math.PI / 16
}

const translationVector = { x: width / 2, y: height / 2 }

function project(nodes, rotation, rotationOffset) {
  return nodes
  .map(node => scaleNode(node, 200))
  .map(node => projectOnZPlane(node, rotation, rotationOffset))
  .map(node => translateOnZPlane(node, translationVector))
}
function draw() {
  _.fillStyle = backgroundColor
  _.fillRect(0, 0, width, height)

  const nodes = project(polyhedron.nodes, polyhedron.rotation, polyhedron.rotationOffset)
  const centers = project(polyhedron.centers, polyhedron.rotation, polyhedron.rotationOffset)
  const pivots = project(polyhedron.pivots, polyhedron.rotation, polyhedron.rotationOffset)

  _.strokeStyle = verticeColor
  _.beginPath()
  polyhedron.vertices.forEach(([i, j]) => {
    _.moveTo(nodes[i].x, nodes[i].y)
    _.lineTo(nodes[j].x, nodes[j].y)
  })
  _.closePath()
  _.stroke()

  _.fillStyle = nodeColor
  nodes.forEach(node => {
    _.beginPath()
    _.arc(node.x, node.y, 2, 0, TAU)
    _.fill()
    _.closePath()
  })

  _.fillStyle = centerColor
  centers.forEach(center => {
    _.beginPath()
    _.arc(center.x, center.y, 4, 0, TAU)
    _.fill()
    _.closePath()
  })

  _.fillStyle = pivotColor
  pivots.forEach(pivot => {
    _.beginPath()
    _.arc(pivot.x, pivot.y, 3, 0, TAU)
    _.fill()
    _.closePath()
  })
}

function update() {
  polyhedron.rotation.a += da
  polyhedron.rotation.b += db
  polyhedron.rotation.c += dc
  draw()
}

function multiplyMatrices(a, b) {
  const c = []

  for (let i = 0; i < a.length; i++) {
    const row = []
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0
      for (let k = 0; k < b.length; k++) {
        sum += a[i][k] * b[k][j]
      }
      row.push(sum)
    }
    c.push(row)
  }

  return c
}

function createCenterFromPoints(a, b) {
  return {
    x: (b.x + a.x) / 2,
    y: (b.y + a.y) / 2,
    z: (b.z + a.z) / 2,
  }
}

function createVectorFromPoints(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y,
    z: b.z - a.z,
  }
}

function addVectorToPoint(p, v) {
  return {
    x: p.x + v.x,
    y: p.y + v.y,
    z: p.z + v.z,
  }
}

function addVectors(u, v) {
  return {
    x: u.x + v.x,
    y: u.y + v.y,
    z: u.z + v.z,
  }
}

function rotateVectorOnZAxis({ x, y, z }, angle) {
  const cosAngle = cos(angle)
  const sinAngle = sin(angle)
  const rotateZ = [
    [cosAngle, -sinAngle, 0],
    [sinAngle, cosAngle, 0],
    [0, 0, 1],
  ]
  const X = [[x], [y], [z]]
  const Y = multiplyMatrices(rotateZ, X)

  return {
    x: Y[0][0],
    y: Y[1][0],
    z: Y[2][0],
  }
}

function rotatePointOnZAxis(point, origin, angle) {
  const x = point.x - origin.x
  const y = point.y - origin.y
  const c = cos(angle)
  const s = sin(angle)

  return {
    x: x * c - y * s + origin.x,
    y: x * s + y * c + origin.y,
    z: 0,
  }
}

function projectOnZPlane({ x, y, z }, { a, b, c }, { alpha, beta, gamma }) {
  const ca = cos(a)
  const sa = sin(a)
  const cb = cos(b)
  const sb = sin(b)
  const cc = cos(c)
  const sc = sin(c)
  const calpha = cos(alpha)
  const salpha = sin(alpha)
  const cbeta = cos(beta)
  const sbeta = sin(beta)
  const cgamma = cos(gamma)
  const sgamma = sin(gamma)

  // console.log('ca, sa, cb, sb, cc, sc', ca, sa, cb, sb, cc, sc)

  const X = [[x], [y], [z]]
  const rotateX = [
    [1, 0, 0],
    [0, ca, -sa],
    [0, sa, ca],
  ]
  const rotateY = [
    [cb, 0, -sb],
    [0, 1, 0],
    [sb, 0, cb],
  ]
  const rotateZ = [
    [cc, -sc, 0],
    [sc, cc, 0],
    [0, 0, 1],
  ]
  const rotateAlpha = [
    [1, 0, 0],
    [0, calpha, -salpha],
    [0, salpha, calpha],
  ]
  const rotateBeta = [
    [cbeta, 0, -sbeta],
    [0, 1, 0],
    [sbeta, 0, cbeta],
  ]
  const rotateGamma = [
    [cgamma, -sgamma, 0],
    [sgamma, cgamma, 0],
    [0, 0, 1],
  ]

  // console.log('X, rotateX, rotateY, rotateZ, rotateAlpha, rotateBeta, rotateGamma', X, rotateX, rotateY, rotateZ, rotateAlpha, rotateBeta, rotateGamma)

  let Y = multiplyMatrices(rotateZ, multiplyMatrices(rotateY, multiplyMatrices(rotateX, X)))
  Y = multiplyMatrices(rotateGamma, multiplyMatrices(rotateBeta, multiplyMatrices(rotateAlpha, Y)))
  // const projection = [
  //   [1, 0, 0.5],
  //   [0, 1, 0.5],
  //   [0, 0, 0],
  // ]

  // Y = multiplyMatrices(projection, Y)

  return {
    x: Y[0][0],
    y: Y[1][0],
  }
}

function translateOnZPlane(point, vector) {
  return {
    x: point.x + vector.x,
    y: point.y + vector.y,
  }
}

function scaleNode({ x, y, z }, factor) {
  return {
    x: x * factor,
    y: y * factor,
    z: z * factor,
  }
}

function normalizeVector({ x, y, z }) {
  const norm = sqrt(x * x + y * y + z * z)

  return {
    x: x / norm,
    y: y / norm,
    z: z / norm,
  }
}

function rotatePointAroundAxis(p, a, b, angle) {
  const { x, y, z } = createVectorFromPoints(a, b)

  const c = cos(angle)
  const s = sin(angle)
  // const R = [
  //   [c + x * x * (1 - c), x * y * (1 - c) - z * s, x * z * (1 - c) + y * s],
  //   [y * x * (1 - c) + z * s, c + y * y * (1 - c), y * z * (1 - c) - x * s],
  //   [z * x * (1 - c) - y * s, z * y * (1 - c) + x * s, c + z * z * (1 - c)],
  // ]
  // const q0 = cos(angle / 2)
  // const q1 = x * sin(angle / 2)
  // const q2 = y * sin(angle / 2)
  // const q3 = z * sin(angle / 2)

  // const R = [
  //   [q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3, 2 * (q1 * q2 - q0 * q3), 2 * (q1 * q3 + q0 * q2)],
  //   [2 * (q2 * q1 + q0 * q3), q0 * q0 - q1 * q1 + q2 * q2 - q3 * q3, 2 * (q2 * q3 - q0 * q1)],
  //   [2 * (q3 * q1 - q0 * q2), 2 * (q3 * q2 + q0 * q1), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3],
  // ]
  const xx = x * x
  const yy = y * y
  const zz = z * z
  const l = xx + yy + zz
  const ll = sqrt(l)

  const R = [
    [(xx + (yy + zz) * c) / l, (x * y * (1 - c) - z * ll * s) / l, (x * z * (1 - c) + y * ll * s) / l],
    [(x * y * (1 - c) + z * ll * s) / l, (yy + (xx + zz) * c) / l, (y * z * (1 - c) - y * ll * s) / l],
    [(x * z * (1 - c) - y * ll * s) / l, (y * z * (1 - c) + x * ll * s) / l, (zz + (xx + yy) * c) / l],
  ]
  const X = [
    [p.x],
    [p.y],
    [p.z],
  ]

  const Y = multiplyMatrices(R, X)

  console.log('Y', Y)
  return {
    x: Y[0][0],
    y: Y[1][0],
    z: Y[2][0],
  }
}

function createPolyhedron(angle, dihedralAngle) {
  const polyhedron = {
    nodes: [],
    centers: [],
    pivots: [],
    vertices: [],
    rotation: { a: 0, b: 0, c: 0 },
    rotationOffset: { alpha: 0, beta: 0, gamma: 0 },
  }

  const nSides = TAU / angle
  const firstOrigin = { x: 0, y: 0, z: 0 }

  polyhedron.centers.push(firstOrigin)
  polyhedron.nodes.push(...createPolygonNodes(angle, firstOrigin))

  for (let i = 0; i < nSides; i++) {
    const a = polyhedron.nodes[i]
    const b = polyhedron.nodes[i === nSides - 1 ? 0 : i + 1]

    const pivot = createCenterFromPoints(a, b)
    const origin = addVectorToPoint(pivot, createVectorFromPoints(firstOrigin, pivot))
    const nodes = createPolygonNodes(angle, origin)

    const rotatedOrigin = rotatePointAroundAxis(origin, a, b, dihedralAngle)

    console.log('rotatedOrigin', rotatedOrigin)
    polyhedron.pivots.push(pivot)
    polyhedron.centers.push(origin, rotatedOrigin)
    polyhedron.nodes.push(...nodes)
  }

  const nFaces = polyhedron.nodes.length / nSides


  console.log('polyhedron', nFaces, nSides, polyhedron)

  return polyhedron
}

function createPolygonNodes(angle, origin, sideLength = 1) {
  const n = TAU / angle
  const distanceFromCenter = sqrt(sideLength * sideLength / 2 / (1 - cos(angle)))
  const nodes = [{ x: distanceFromCenter + origin.x, y: origin.y, z: origin.z }]

  for (let i = 1; i < n; i++) {
    const previousPoint = nodes[i - 1]

    nodes.push(rotatePointOnZAxis(previousPoint, origin, angle))
  }

  return nodes
}

function step() {
  update()
  draw()
  requestAnimationFrame(step)
}

requestAnimationFrame(step)
