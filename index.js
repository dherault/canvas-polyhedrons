const { cos, sin, PI } = Math
const canvas = document.getElementsByTagName('canvas')[0]
const _ = canvas.getContext('2d')

const width = canvas.width = window.innerWidth
const height = canvas.height = window.innerHeight

_.fillStyle = 'black'
_.strokeStyle = 'white'

const hexahedron = createHexahedron()

let da = 0
let db = 0
let dc = 0

document.getElementById('button-a-plus').onclick = () => {
  da += Math.PI / 240
}
document.getElementById('button-a-minus').onclick = () => {
  da -= Math.PI / 240
}
document.getElementById('button-b-plus').onclick = () => {
  db += Math.PI / 240
}
document.getElementById('button-b-minus').onclick = () => {
  db -= Math.PI / 240
}
document.getElementById('button-c-plus').onclick = () => {
  dc += Math.PI / 240
}
document.getElementById('button-c-minus').onclick = () => {
  dc -= Math.PI / 240
}

document.getElementById('button-alpha-plus').onclick = () => {
  hexahedron.rotationOffset.alpha += Math.PI / 16
}
document.getElementById('button-alpha-minus').onclick = () => {
  hexahedron.rotationOffset.alpha -= Math.PI / 16
}
document.getElementById('button-beta-plus').onclick = () => {
  hexahedron.rotationOffset.beta += Math.PI / 16
}
document.getElementById('button-beta-minus').onclick = () => {
  hexahedron.rotationOffset.beta -= Math.PI / 16
}
document.getElementById('button-gamma-plus').onclick = () => {
  hexahedron.rotationOffset.gamma += Math.PI / 16
}
document.getElementById('button-gamma-minus').onclick = () => {
  hexahedron.rotationOffset.gamma -= Math.PI / 16
}

const oVector = { x: 0, y: 0, z: 0 }
const oRotation = { a: 0, b: 0, c: 0 }
const oRotationOffset = { alpha: 0, beta: 0, gamma: 0 }
const translationVector = { x: width / 2, y: height / 2 }
const triangle = createPolygon(7)

function draw() {
  _.fillRect(0, 0, width, height)

  const points = hexahedron.nodes
    .map(node => scaleNode(node, 200))
    .map(node => projectOnZPlane(node, hexahedron.rotation, hexahedron.rotationOffset))
    .map(point => translateOnZPlane(point, translationVector))

  _.beginPath()
  hexahedron.vertices.forEach(([i, j]) => {
    _.moveTo(points[i].x, points[i].y)
    _.lineTo(points[j].x, points[j].y)
  })
  _.closePath()
  _.stroke()

  // const points = triangle
  //   .map(node => scaleNode(node, 200))
  //   .map(node => projectOnZPlane(node, oRotation, oRotationOffset))
  //   .map(point => translateOnZPlane(point, translationVector))

  // console.log('triangle', triangle)
  // console.log('points', points)

  // points.forEach(drawPoint)

  // _.beginPath()
  // for (let i = 0; i < points.length; i++) {
  //   const p1 = points[i]
  //   const p2 = i === points.length - 1 ? points[0] : points[i + 1]

  //   _.moveTo(p1.x, p1.y)
  //   _.lineTo(p2.x, p2.y)
  // }
  // _.closePath()
  // _.stroke()
}

function drawPoint({ x, y }) {
  _.fillStyle = 'white'
  _.beginPath()
  _.arc(x, y, 3, 0, 2 * PI)
  _.closePath()
  _.fill()
}

function update() {
  hexahedron.rotation.a += da
  hexahedron.rotation.b += db
  hexahedron.rotation.c += dc
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

  console.log('Y', Y)

  return {
    x: Y[0][0],
    y: Y[1][0],
    z: Y[2][0],
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

  console.log('ca, sa, cb, sb, cc, sc', ca, sa, cb, sb, cc, sc)

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

  console.log('X, rotateX, rotateY, rotateZ, rotateAlpha, rotateBeta, rotateGamma', X, rotateX, rotateY, rotateZ, rotateAlpha, rotateBeta, rotateGamma)

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

function scaleNode({ x, y , z }, factor) {
  return {
    x: x * factor,
    y: y * factor,
    z: z * factor,
  }
}

function createPolyhedron(angle, dihedralAngle) {
  const polyhedron = []
  const origin = { x: 0, y: 0, z: 0 }

  return polyhedron
}

function createTetrahedron() {
  return createPolyhedron(Math.PI / 3, )
}

function createHexahedron() {
  const polyhedron = {
    nodes: [
      { x: -0.5, y: -0.5, z: -0.5 },
      { x: -0.5, y: 0.5, z: -0.5 },
      { x: 0.5, y: -0.5, z: -0.5 },
      { x: 0.5, y: 0.5, z: -0.5 },
      { x: -0.5, y: -0.5, z: 0.5 },
      { x: -0.5, y: 0.5, z: 0.5 },
      { x: 0.5, y: -0.5, z: 0.5 },
      { x: 0.5, y: 0.5, z: 0.5 },
    ],
    vertices: [
      [0, 1],
      [1, 3],
      [2, 3],
      [0, 2],
      [4, 5],
      [5, 7],
      [6, 7],
      [4, 6],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ],
    rotation: { a: 0, b: 0, c: 0 },
    rotationOffset: { alpha: 0, beta: 0, gamma: 0 },
  }

  return polyhedron
}

function createPolygon(n) {
  const angle = 2 * Math.PI / n
  const origin = { x: 0, y: 0, z: 0 }
  const points = [origin]

  let previousVector = { x: 1, y: 0, z: 0 }

  for (let i = 1; i < n; i++) {
    const previousPoint = points[i - 1]
    const vector = rotateVectorOnZAxis(previousVector, angle)

    previousVector = vector
    points.push(addVectorToPoint(previousPoint, vector))
  }

  return points
}

window.addEventListener('load', () => {
  setInterval(update, 20)
  draw()
})
