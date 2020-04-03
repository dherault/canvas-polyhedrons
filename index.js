const { cos, sin, acos, atan, sqrt, PI } = Math
const TAU = 2 * PI
const canvas = document.getElementsByTagName('canvas')[0]
const _ = canvas.getContext('2d')

const width = canvas.width = window.innerWidth
const height = canvas.height = window.innerHeight
const nPolyhedron = Math.round(24 * width / 1920)

const backgroundColor = '#3f51b5'
const verticeColor = 'white'
const faceColor = '#3f51b5'

const oOrigin = { x: 0, y: 0, z: 0 }
const forward = { x: 0, y: 0, z: 1 }

const nameToScale = {
  hexahedron: [48, 64],
  tetraedron: [48, 64],
  octahedron: [48, 64],
  icosahedron: [32, 48],
  dodecahedron: [12, 32],
}

const patrons = [
  createPolyhedron(4, PI / 2, 'hexahedron'),
  createPolyhedron(3, acos(1 / 3), 'tetraedron'),
  createPolyhedron(3, acos(-1 / 3), 'octahedron'),
  createPolyhedron(3, acos(-sqrt(5) / 3), 'icosahedron'),
  createPolyhedron(5, 2 * atan((1 + sqrt(5)) / 2), 'dodecahedron'),
]

const polyhedrons = []

for (let i = 0; i < nPolyhedron; i++) {
  polyhedrons.push(createPolyhedronInstance(randomArray(patrons)))
}

function draw() {
  _.fillStyle = backgroundColor
  _.fillRect(0, 0, width, height)

  polyhedrons.forEach(polyhedron => {
    _.strokeStyle = verticeColor
    _.fillStyle = faceColor

    polyhedron.faces
    .map(({ nodes, center }) => ({ nodes, center: applyRotations(center, polyhedron) }))
    .sort((a, b) => a.center.z < b.center.z ? -1 : 1)
    .map(({ nodes }) => nodes.map(node => applyRotations(node, polyhedron)))
    .forEach(nodes => {
      _.beginPath()
      _.moveTo(nodes[0].x + polyhedron.x, nodes[0].y + polyhedron.y)

      for (let i = 1; i < nodes.length; i++) {
        _.lineTo(nodes[i].x + polyhedron.x, nodes[i].y + polyhedron.y)
      }

      _.closePath()
      _.stroke()
      _.fill()
    })
  })
}

/* ---
  Update
--- */

function update() {
  const newPolyhedrons = []

  polyhedrons.forEach((polyhedron, i) => {
    polyhedron.a += polyhedron.da
    polyhedron.b += polyhedron.db
    polyhedron.c += polyhedron.dc
    polyhedron.x += polyhedron.dx
    polyhedron.y += polyhedron.dy

    if (
      polyhedron.x > width + polyhedron.scaleFactor ||
      polyhedron.x < -polyhedron.scaleFactor ||
      polyhedron.y > height + polyhedron.scaleFactor ||
      polyhedron.y < -polyhedron.scaleFactor
    ) {
      polyhedrons.splice(i, 1)

      const nextPolyhedron = createPolyhedronInstance(randomArray(patrons))

      if (Math.random() < 0.5) {
        nextPolyhedron.x = nextPolyhedron.dx < 0 ? width + nextPolyhedron.scaleFactor : -nextPolyhedron.scaleFactor
      }
      else {
        nextPolyhedron.y = nextPolyhedron.dy < 0 ? height + nextPolyhedron.scaleFactor : -nextPolyhedron.scaleFactor
      }

      newPolyhedrons.push(nextPolyhedron)
    }
  })

  polyhedrons.push(...newPolyhedrons)
}

/* ---
  Polyhedron creation
--- */

function createPolyhedron(nSides, dihedralAngle, name) {
  let faces = [createPolygonNodes(nSides, oOrigin, forward)]
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

  faces = faces.map((nodes, i) => ({
    center: centers[i],
    nodes: nodes.map(node => translatePoint(node, polyhedronCenterTranslation)),
  }))

  faces.name = name

  return faces
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

function createPolyhedronInstance(patron) {
  // eslint-disable-next-line prefer-spread
  const scaleFactor = randomRange.apply(null, nameToScale[patron.name])
  const params = suffle([0, randomRange(0, TAU), randomRange(0, TAU)])
  const dParams = suffle([0, randomRange(0, PI / 64), randomRange(0, PI / 64)])

  return {
    faces: patron.map(({ center, nodes }) => ({
      center,
      nodes: nodes.map(node => scaleVector(node, scaleFactor)),
    })),
    scaleFactor,
    a: params[0],
    b: params[1],
    c: params[2],
    da: dParams[0],
    db: dParams[1],
    dc: dParams[2],
    x: randomInteger(0, width),
    y: randomInteger(0, height),
    dx: randomArray([-3, -2, -1, 1, 2, 3]),
    dy: randomArray([-3, -2, -1, 1, 2, 3]),
  }
}

/* ---
  Math helpers
--- */

function randomArray(a) {
  return a[Math.floor(Math.random() * a.length)]
}

function randomRange(a, b) {
  return Math.random() * (b - a) + a
}

function randomInteger(a, b) {
  return Math.floor(randomRange(a, b))
}

function suffle(a) {
  return a.sort(() => Math.random() < 0.5 ? -1 : 1)
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

function applyRotations({ x, y, z }, { a, b, c }) {
  const ca = cos(a)
  const sa = sin(a)
  const cb = cos(b)
  const sb = sin(b)
  const cc = cos(c)
  const sc = sin(c)

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

  const X = [[x], [y], [z]]
  const Y = multiplyMatrices(rotateZ, multiplyMatrices(rotateY, multiplyMatrices(rotateX, X)))

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
