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
const originColor = 'gold'

// const polyhedron = createPolyhedron(PI / 2, PI / 2)
const polyhedron = createPolyhedron(PI / 3, PI / 3)

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

const translationVector = { x: width / 2, y: height / 2, z: 0 }

function project(nodes, rotation, rotationOffset) {
  return nodes
  .map(node => scaleVector(node, 200))
  .map(node => projectOnZPlane(node, rotation, rotationOffset))
  .map(node => translatePoint(node, translationVector))
}

function draw() {
  _.fillStyle = backgroundColor
  _.fillRect(0, 0, width, height)

  const nodes = project(polyhedron.nodes, polyhedron.rotation, polyhedron.rotationOffset)
  const centers = project(polyhedron.centers, polyhedron.rotation, polyhedron.rotationOffset)
  const pivots = project(polyhedron.pivots, polyhedron.rotation, polyhedron.rotationOffset)

  _.fillStyle = originColor
  _.beginPath()
  _.arc(translationVector.x, translationVector.y, 5, 0, TAU)
  _.closePath()
  _.fill()

  _.strokeStyle = verticeColor
  _.beginPath()
  polyhedron.vertices.forEach(([i, j]) => {
    _.moveTo(nodes[i].x, nodes[i].y)
    _.lineTo(nodes[j].x, nodes[j].y)
  })
  _.closePath()
  _.stroke()

  _.fillStyle = centerColor
  centers.forEach(center => {
    _.beginPath()
    _.arc(center.x, center.y, 4, 0, TAU)
    _.closePath()
    _.fill()
  })

  _.fillStyle = pivotColor
  pivots.forEach(pivot => {
    _.beginPath()
    _.arc(pivot.x, pivot.y, 3, 0, TAU)
    _.closePath()
    _.fill()
  })

  _.fillStyle = nodeColor
  nodes.forEach(node => {
    _.beginPath()
    _.arc(node.x, node.y, 2, 0, TAU)
    _.closePath()
    _.fill()
  })
}

function update() {
  polyhedron.rotation.a += da
  polyhedron.rotation.b += db
  polyhedron.rotation.c += dc
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

function createCenter(a, b) {
  return {
    x: (b.x + a.x) / 2,
    y: (b.y + a.y) / 2,
    z: (b.z + a.z) / 2,
  }
}

function createVector(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y,
    z: b.z - a.z,
  }
}

function translatePoint(p, v) {
  return addVectors(p, v)
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

function scaleVector({ x, y, z }, factor) {
  return {
    x: x * factor,
    y: y * factor,
    z: z * factor,
  }
}

function norm({ x, y, z }) {
  return sqrt(x * x + y * y + z * z)
}

function normalizeVector(v) {
  const n = norm(v)

  return {
    x: v.x / n,
    y: v.y / n,
    z: v.z / n,
  }
}

function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function crossProduct(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }
}

function projectPointOnAxis(p, a, b) {
  const ab = createVector(a, b)
  const lambda = dotProduct(ab, createVector(a, p)) / dotProduct(ab, ab)

  return addVectors(a, scaleVector(ab, lambda))
}

function rotatePointAroundAxis(p, a, b, angle) {
  const { x, y, z } = normalizeVector(createVector(a, b))
  const translationVector = projectPointOnAxis(p, a, b)
  const pp = createVector(translationVector, p)

  const c = cos(angle)
  const s = sin(angle)

  const R = [
    [c + x * x * (1 - c), x * y * (1 - c) - z * s, x * z * (1 - c) + y * s],
    [y * x * (1 - c) + z * s, c + y * y * (1 - c), y * z * (1 - c) - x * s],
    [z * x * (1 - c) - y * s, z * y * (1 - c) + x * s, c + z * z * (1 - c)],
  ]
  const X = [
    [pp.x],
    [pp.y],
    [pp.z],
  ]

  const Y = multiplyMatrices(R, X)

  return {
    x: Y[0][0] + translationVector.x,
    y: Y[1][0] + translationVector.y,
    z: Y[2][0] + translationVector.z,
  }
}

function createPolyhedron(angle, dihedralAngle) {
  const polyhedron = {
    nodes: [],
    centers: [],
    pivots: [],
    vertices: [],
    rotation: { a: 0, b: 0, c: 0 },
    // rotationOffset: { alpha: -PI / 2, beta: PI / 4, gamma: 0 },
    rotationOffset: { alpha: 0, beta: 0, gamma: 0 },
  }

  const nSides = PI / angle
  const firstOrigin = { x: 0, y: 0, z: 0 }
  const firstNormalVector = { x: 0, y: 0, z: 1 }

  polyhedron.centers.push(firstOrigin)
  polyhedron.nodes.push(...createPolygonNodes(angle, firstOrigin, firstNormalVector))

  const queue = [
    {
      origin: firstOrigin,
      nodes: polyhedron.nodes,
    },
  ]

  while (true) {
    console.log('queue.length', queue.length)
    if (!queue.length) break

    const { origin, nodes } = queue.shift()

    for (let i = 0; i < nSides; i++) {
      const a = nodes[i]
      const b = nodes[i === nSides - 1 ? 0 : i + 1]

      const pivot = createCenter(a, b)
      const p = createVector(origin, pivot)
      const normalVector = crossProduct(p, createVector(a, b))
      const nextOrigin = translatePoint(pivot, p)
      const rotatedNextOrigin = rotatePointAroundAxis(nextOrigin, a, b, PI - dihedralAngle)

      if (polyhedron.centers.every(o => norm(createVector(o, rotatedNextOrigin)) > 0.01)) {
        const polygonNodes = createPolygonNodes(angle, nextOrigin, normalVector, a)
        // .map(node => rotatePointAroundAxis(node, a, b, PI - dihedralAngle))

        polyhedron.pivots.push(pivot)
        polyhedron.centers.push(nextOrigin, rotatedNextOrigin)
        polyhedron.nodes.push(...polygonNodes)

        queue.push({
          origin: rotatedNextOrigin,
          nodes: polygonNodes,
        })
      }
    }

    break

  }

  const nFaces = polyhedron.nodes.length / nSides

  console.log('polyhedron', nFaces, nSides, polyhedron)

  return polyhedron
}

function createPolygonNodes(angle, origin, normalVector, firstNode) {
  const innerAngle = PI - angle
  const n = TAU / innerAngle

  const distanceFromCenter = sqrt(1 / 2 / (1 - cos(angle)))
  const nodes = [firstNode || { x: distanceFromCenter + origin.x, y: origin.y, z: origin.z }]

  for (let i = 1; i < n; i++) {
    const previousPoint = nodes[i - 1]

    nodes.push(rotatePointAroundAxis(previousPoint, origin, addVectors(origin, normalVector), innerAngle))
  }

  return nodes
}

function step() {
  update()
  draw()
  requestAnimationFrame(step)
}

requestAnimationFrame(step)
