const canvas = document.getElementsByTagName('canvas')[0]
const _ = canvas.getContext('2d')

const width = canvas.width = window.innerWidth
const height = canvas.height = window.innerHeight

_.fillStyle = 'black'
_.strokeStyle = 'white'

const translationVector = { x: width / 2, y: height / 2 }

const hexahedron = createHexahedron()

document.getElementById('button-a-plus').onclick = () => {
  hexahedron.rotation.a += Math.PI / 8
  draw()
}
document.getElementById('button-a-minus').onclick = () => {
  hexahedron.rotation.a -= Math.PI / 8
  draw()
}
document.getElementById('button-b-plus').onclick = () => {
  hexahedron.rotation.b += Math.PI / 8
  draw()
}
document.getElementById('button-b-minus').onclick = () => {
  hexahedron.rotation.b -= Math.PI / 8
  draw()
}
document.getElementById('button-c-plus').onclick = () => {
  hexahedron.rotation.c += Math.PI / 8
  draw()
}
document.getElementById('button-c-minus').onclick = () => {
  hexahedron.rotation.c -= Math.PI / 8
  draw()
}

function draw() {
  console.log('draw')
  _.fillRect(0, 0, width, height)

  const points = hexahedron.nodes
    .map(node => scaleNode(node, 200))
    .map(node => projectOnZPlane(node, hexahedron.rotation))
    .map(point => translateOnZPlane(point, translationVector))

  points.forEach(drawPoint)

  hexahedron.vertices.forEach(([i, j]) => {
    _.beginPath()
    _.moveTo(points[i].x, points[i].y)
    _.lineTo(points[j].x, points[j].y)
    _.closePath()
    _.stroke()
  })
}

function drawPoint({ x, y }) {
  _.beginPath()
  _.arc(x, y, 3, 0, 2 * Math.PI)
  _.closePath()
  _.stroke()
}

function projectOnZPlane({ x, y, z }, { a, b, c }) {
  console.log('x, y, z', x, y, z)
  const n = Math.sqrt(x * x + y * y + z * z)
  const alpha = Math.atan2(z, y)
  const beta = Math.atan2(x, z)
  const gamma = Math.atan2(y, x)

  const xx = n * Math.cos(beta) * Math.cos(gamma)
  const yy = n * Math.cos(alpha) * Math.cos(gamma)
  const zz = n * Math.cos(alpha) * Math.cos(beta)
  console.log('aplha, beta, gamma', alpha, beta, gamma)

  return {
    x: xx,
    y: yy,
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
  }

  return polyhedron
}

window.addEventListener('load', draw)
