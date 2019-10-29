const { cos, sin } = Math
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

  console.log('points', points)
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

function projectOnZPlane({ x, y, z }, { a, b, c }) {
  const ca = cos(a)
  const sa = sin(a)
  const cb = cos(b)
  const sb = sin(b)
  const cc = cos(c)
  const sc = sin(c)

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

  const Y = multiplyMatrices(rotateZ, multiplyMatrices(rotateY, multiplyMatrices(rotateX, X)))

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
  }

  return polyhedron
}

window.addEventListener('load', draw)
