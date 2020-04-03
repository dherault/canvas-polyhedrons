const { cos, sin, acos, atan, sqrt, PI } = Math
const TAU = 2 * PI
const canvas = document.getElementsByTagName('canvas')[0]
const _ = canvas.getContext('2d')

const width = canvas.width = window.innerWidth
const height = canvas.height = window.innerHeight

const backgroundColor = 'white'
const verticeColor = 'black'
const faceColor = 'pink'
// const nodeColor = 'red'
// const centerColor = 'blue'
// const pivotColor = 'green'
// const originColor = 'gold'

const oOrigin = { x: 0, y: 0, z: 0 }
const forward = { x: 0, y: 0, z: 1 }
const translationVector = { x: width / 2, y: height / 2, z: 0 }

// const polyhedron = createPolyhedron(4, PI / 2)
// const polyhedron = createPolyhedron(3, acos(1 / 3))
// const polyhedron = createPolyhedron(3, acos(-1 / 3))
const polyhedron = createPolyhedron(3, acos(-sqrt(5) / 3))
// const polyhedron = createPolyhedron(5, 2 * atan((1 + sqrt(5)) / 2))

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
  polyhedron.alpha += Math.PI / 16
}
document.getElementById('button-alpha-minus').onclick = () => {
  polyhedron.alpha -= Math.PI / 16
}
document.getElementById('button-beta-plus').onclick = () => {
  polyhedron.beta += Math.PI / 16
}
document.getElementById('button-beta-minus').onclick = () => {
  polyhedron.beta -= Math.PI / 16
}
document.getElementById('button-gamma-plus').onclick = () => {
  polyhedron.gamma += Math.PI / 16
}
document.getElementById('button-gamma-minus').onclick = () => {
  polyhedron.gamma -= Math.PI / 16
}


function project(nodes, rotationParameters) {
  return nodes
  .map(node => scaleVector(node, 200))
  .map(node => applyRotations(node, rotationParameters))
  .map(node => translatePoint(node, translationVector))
}

function draw() {
  _.fillStyle = backgroundColor
  _.fillRect(0, 0, width, height)

  let facesNodes = polyhedron.faces
  .map(({ nodes, center }) => ({ nodes, center: applyRotations(center, polyhedron) }))
  .sort((a, b) => a.center.z < b.center.z ? -1 : 1)

  console.log('facesNodes', facesNodes)
  facesNodes = facesNodes
  .map(({ nodes }) => project(nodes, polyhedron))

  // .sort((a, b) => {
  //   const ia = polyhedron.faces.indexOf(a)
  //   const ib = polyhedron.faces.indexOf(b)

  //   const centerA = polyhedron.centers[ia]
  //   const centerB = polyhedron.centers[ib]

  //   return centerA.z > centerB.z ? -1 : 1
  // })
  // const centers = project(polyhedron.centers, polyhedron.rotation, polyhedron.rotationOffset)
  // const pivots = project(polyhedron.pivots, polyhedron.rotation, polyhedron.rotationOffset)

  // _.fillStyle = originColor
  // _.beginPath()
  // _.arc(translationVector.x, translationVector.y, 5, 0, TAU)
  // _.closePath()
  // _.fill()

  _.strokeStyle = verticeColor
  _.fillStyle = faceColor
  facesNodes.forEach(nodes => {
    _.beginPath()
    _.moveTo(nodes[0].x, nodes[0].y)

    for (let i = 1; i < nodes.length; i++) {
      _.lineTo(nodes[i].x, nodes[i].y)
    }

    _.closePath()
    _.stroke()
    _.fill()
  })

  // _.fillStyle = nodeColor
  // faces.forEach(nodes => {
  //   nodes.forEach(node => {
  //     _.beginPath()
  //     _.arc(node.x, node.y, 2, 0, TAU)
  //     _.closePath()
  //     _.fill()
  //   })
  // })

  // _.fillStyle = centerColor
  // centers.forEach(center => {
  //   _.beginPath()
  //   _.arc(center.x, center.y, 4, 0, TAU)
  //   _.closePath()
  //   _.fill()
  // })

  // _.fillStyle = pivotColor
  // pivots.forEach(pivot => {
  //   _.beginPath()
  //   _.arc(pivot.x, pivot.y, 3, 0, TAU)
  //   _.closePath()
  //   _.fill()
  // })
}

/* ---
  Update
--- */

function update() {
  polyhedron.a += da
  polyhedron.b += db
  polyhedron.c += dc
}

/* ---
  Polyhedron creation
--- */

function createPolyhedron(nSides, dihedralAngle) {
  const faces = [createPolygonNodes(nSides, oOrigin, forward)]
  const centers = [oOrigin]

  const queue = [
    {
      center: oOrigin,
      nodes: faces[0],
    },
  ]

  while (true) {
    if (!queue.length) break

    const { center, nodes } = queue.shift()

    for (let i = 0; i < nSides; i++) {
      const a = nodes[i]
      const b = nodes[i === nSides - 1 ? 0 : i + 1]

      const pivot = createCenter(a, b)
      const p = createVector(center, pivot)
      const nextCenter = translatePoint(pivot, p)
      const rotatedCenter = rotatePointAroundAxis(nextCenter, a, b, PI - dihedralAngle)

      if (centers.every(o => norm(createVector(o, rotatedCenter)) > 0.01)) {
        const normalVector = crossProduct(p, createVector(a, b))
        const polygonNodes = createPolygonNodes(nSides, nextCenter, normalVector, a)
        .map(node => rotatePointAroundAxis(node, a, b, PI - dihedralAngle))

        faces.push(polygonNodes)
        centers.push(rotatedCenter)

        queue.push({
          center: rotatedCenter,
          nodes: polygonNodes,
        })
      }
    }
  }

  const centersVector = centers.reduce((accumulator, node) => addVectors(accumulator, node), { x: 0, y: 0, z: 0 })
  const polyhedronCenterTranslation = scaleVector(centersVector, -1 / centers.length)

  return {
    faces: faces.map((nodes, i) => ({
      center: centers[i],
      nodes: nodes.map(node => translatePoint(node, polyhedronCenterTranslation)),
    })),
    a: 0,
    b: 0,
    c: 0,
    alpha: 0,
    beta: 0,
    gamma: 0,
  }
}

function createPolygonNodes(nSides, origin, normalVector, firstNode) {
  const angle = TAU / nSides
  const distanceFromCenter = sqrt(1 / 2 / (1 - cos(angle)))
  const nodes = [firstNode || { x: distanceFromCenter + origin.x, y: origin.y, z: origin.z }]

  for (let i = 1; i < nSides; i++) {
    nodes.push(
      rotatePointAroundAxis(
        nodes[i - 1],
        origin,
        addVectors(origin, normalVector),
        angle
      )
    )
  }

  return nodes
}

/* ---
  Math helpers
--- */

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
    z: a.x * b.y - a.y * b.x,
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

function applyRotations({ x, y, z }, { a, b, c, alpha, beta, gamma }) {
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

  const X = [[x], [y], [z]]

  let Y = multiplyMatrices(rotateZ, multiplyMatrices(rotateY, multiplyMatrices(rotateX, X)))
  Y = multiplyMatrices(rotateGamma, multiplyMatrices(rotateBeta, multiplyMatrices(rotateAlpha, Y)))

  return {
    x: Y[0][0],
    y: Y[1][0],
    z: Y[2][0],
  }
}

/* ---
  Visualization loop
--- */

function step() {
  update()
  draw()
  requestAnimationFrame(step)
}

requestAnimationFrame(step)
