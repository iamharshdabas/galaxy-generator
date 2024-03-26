import * as debug from "lil-gui"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import "../style.css"
import fragmentShader from "./shaders/fragment.glsl"
import vertexShader from "./shaders/vertex.glsl"

let width = innerWidth
let height = innerHeight
const canvas = document.querySelector("#webgl")

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ canvas })
const orbitControl = new OrbitControls(camera, canvas)
camera.position.set(0, 1, 4)
camera.lookAt(0, 0, 0)
renderer.setSize(width, height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
orbitControl.enableZoom = true
orbitControl.enablePan = false
orbitControl.enableDamping = true

const gui = new debug.GUI({ width: 360 })
const debugObject = {
  totalStars: 40000,
  radius: 6,
  branch: 8,
  randomness: 0.1,
  power: 4,
  size: 20,
  brightness: 2,
  speed: 0.5,
  insideColor: "#ff8822",
  outsideColor: "#2288ff",
}

let geometry
let material
let galaxy

const randomAxis = () => {
  return Math.pow(Math.random(), debugObject.power) * (Math.random() > 0.5 ? 1 : -1) * debugObject.randomness
}

const generateGalaxy = () => {
  if (galaxy) {
    geometry.dispose()
    material.dispose()
    scene.remove(galaxy)
  }

  const position = new Float32Array(debugObject.totalStars * 3)
  const colors = new Float32Array(debugObject.totalStars * 3)
  const randomness = new Float32Array(debugObject.totalStars * 3)
  const size = new Float32Array(debugObject.totalStars)

  const insideColor = new THREE.Color(debugObject.insideColor)
  const outsideColor = new THREE.Color(debugObject.outsideColor)

  for (let i = 0; i < debugObject.totalStars; i++) {
    const i3 = i * 3

    const branchAngle = ((i % debugObject.branch) / debugObject.branch) * Math.PI * 2
    const radius = debugObject.radius * Math.random()

    position[i3] = Math.cos(branchAngle) * radius + randomAxis() * radius
    position[i3 + 1] = randomAxis() * radius
    position[i3 + 2] = Math.sin(branchAngle) * radius + randomAxis() * radius

    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / debugObject.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b

    randomness[i3] = randomAxis()
    randomness[i3 + 1] = randomAxis()
    randomness[i3 + 2] = randomAxis()
  }

  for (let i = 0; i < debugObject.totalStars; i++) {
    size[i] = Math.random()
  }

  geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3))
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute("aRandomness", new THREE.BufferAttribute(randomness, 3))
  geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1))

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uSize: {
        value: debugObject.size * renderer.getPixelRatio(),
      },
      uBrightness: {
        value: debugObject.brightness,
      },
      uTime: {
        value: 0,
      },
    },
  })
  galaxy = new THREE.Points(geometry, material)
  scene.add(galaxy)
}
generateGalaxy()

gui.add(debugObject, "totalStars", 10000, 100000, 10000).onFinishChange(generateGalaxy)
gui.add(debugObject, "radius", 1, 10, 1).onFinishChange(generateGalaxy)
gui.add(debugObject, "branch", 1, 10, 1).onFinishChange(generateGalaxy)
gui.add(debugObject, "randomness", 0, 1, 0.1).onFinishChange(generateGalaxy)
gui.add(debugObject, "power", 1, 10, 1).onFinishChange(generateGalaxy)
gui.add(debugObject, "size", 10, 40, 5).onFinishChange(generateGalaxy)
gui.add(debugObject, "brightness", 0, 4, 0.5).onFinishChange(generateGalaxy)
gui.add(debugObject, "speed", 0, 10, 1)
gui.addColor(debugObject, "insideColor").onFinishChange(generateGalaxy)
gui.addColor(debugObject, "outsideColor").onFinishChange(generateGalaxy)

window.addEventListener("resize", () => {
  width = innerWidth
  height = innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)

  const elapsedTime = clock.getElapsedTime()
  material.uniforms.uTime.value = elapsedTime * debugObject.speed

  orbitControl.update()
  renderer.render(scene, camera)
}

animate()
