
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  CylinderGeometry,
  TorusGeometry,
  SphereGeometry,
  // MeshStandardMaterial,
  MeshBasicMaterial,
  // ShaderMaterial,
  Mesh,
  PointLight,
  Color,
  Clock,
  BackSide,
  Group
} from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Tweakpane from 'tweakpane'

class App {
  constructor(container) {
    this.container = document.querySelector(container)

    this.ui = {
      score: document.querySelector('[data-ui-score]')
    }

    this.state = {
      score: 0
    }

    this._resizeCb = () => this._onResize()
    this._mousemoveCb = e => this._onMousemove(e)
  }

  init() {
    this._createScene()
    this._createCamera()
    this._createRenderer()
    this._createLight()
    this._createClock()
    this._createTube()
    this._createPlayer()
    this._createBalls()
    this._spawnBall()
    this._addListeners()
    this._createControls()
    this._createDebugPanel()

    this.renderer.setAnimationLoop(() => {
      this._update()
      this._render()
    })

    console.log(this)
  }

  destroy() {
    this.renderer.dispose()
    this._removeListeners()
  }

  _update() {
    const elapsed = this.clock.getElapsedTime()

    this.balls.children.forEach(ball => {
      ball.position.z += 0.05

      // Check the Z coordinate of the ball compared to the player
      if (ball.position.z > this.player.position.z) {
        // Compare ball's theta to player's theta
        if (
            ball.userData.theta <= this.player.userData.theta + 0.1 &&
            ball.userData.theta >= this.player.userData.theta - 0.1
            ) {
          this.balls.remove(ball)
          this.state.score++
          this.ui.score.textContent = this.state.score
          this._spawnBall()
        }
      }

      // Remove the skipped ball when it goes out of view
      if (ball.position.z > 13) {
        this.balls.remove(ball)
        this._spawnBall()
      }
    })
  }

  _render() {
    this.renderer.render(this.scene, this.camera)
  }

  _createScene() {
    this.scene = new Scene()
  }

  _createCamera() {
    this.camera = new PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 100)
    this.camera.position.set(0, 0, 14)
  }

  _createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true
    })

    this.container.appendChild(this.renderer.domElement)

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
    this.renderer.setClearColor(0x121212)
    this.renderer.physicallyCorrectLights = true
  }

  _createLight() {
    this.pointLight = new PointLight(0xff0055, 50, 100, 2)
    this.pointLight.position.set(0, 1, 3)
    this.scene.add(this.pointLight)
  }

  _createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  _createDebugPanel() {
    this.pane = new Tweakpane()

    /**
     * Scene configuration
     */
    const sceneFolder = this.pane.addFolder({ title: 'Scene' })

    let params = { background: { r: 18, g: 18, b: 18 } }

    sceneFolder.addInput(params, 'background', { label: 'Background Color' }).on('change', e => {
      this.renderer.setClearColor(new Color(e.value.r / 255, e.value.g / 255, e.value.b / 255))
    })

    /**
     * Light configuration
     */
    const lightFolder = this.pane.addFolder({ title: 'Light' })

    params = {
      color: { r: 255, g: 0, b: 85 }
    }

    lightFolder.addInput(params, 'color', { label: 'Color' }).on('change', e => {
      this.pointLight.color = new Color(e.value.r / 255, e.value.g / 255, e.value.b / 255)
    })

    lightFolder.addInput(this.pointLight, 'intensity', { label: 'Intensity', min: 0, max: 1000 })
  }

  _createTube() {
    const geom = new CylinderGeometry(5, 5, 30, 48, 1, true)
    const mat = new MeshBasicMaterial({
      color: 0x090909,
      side: BackSide
    })

    this.tube = new Mesh(geom, mat)

    this.tube.rotation.x = Math.PI*-0.5

    this.scene.add(this.tube)
  }

  _createPlayer() {
    const geom = new TorusGeometry(0.8, 0.15, 12, 50, Math.PI*2)
    const mat = new MeshBasicMaterial({ color: 0x00ffff })

    this.player = new Mesh(geom, mat)

    this.player.position.z = 4.5

    this.scene.add(this.player)
  }

  _spawnBall() {
    const geom = this.ballGeometry
    const mat = Math.random() > 0.5 ?
                  this.ballBlackMaterial :
                  this.ballWhiteMaterial

    const mesh = new Mesh(geom, mat)

    const theta = Math.random()*Math.PI*2 - Math.PI

    mesh.userData.theta = theta
    // console.log(theta)

    const x = Math.cos(theta) * 4
    const y = Math.sin(theta) * 4

    mesh.position.set(x, y, -4)

    this.balls.add(mesh)
  }

  _createBalls() {
    this.balls = new Group()
    this.scene.add(this.balls)

    this.ballGeometry = new SphereGeometry(0.5, 16, 16)

    this.ballBlackMaterial = new MeshBasicMaterial({ color: 0x404040 })
    this.ballWhiteMaterial = new MeshBasicMaterial({ color: 0xf1f2f3 })
  }

  _createClock() {
    this.clock = new Clock()
  }

  _addListeners() {
    window.addEventListener('resize', this._resizeCb, { passive: true })
    this.container.addEventListener('mousemove', this._mousemoveCb, { passive: true })
  }

  _removeListeners() {
    window.removeEventListener('resize', this._resizeCb, { passive: true })
  }

  _onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  _onMousemove(e) {
    const centerX = this.container.clientWidth*0.5
    const centerY = this.container.clientHeight*0.5

    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY

    const theta = Math.atan2(-deltaY, deltaX)
    this.player.userData.theta = theta

    const playerX = Math.cos(theta) * 4
    const playerY = Math.sin(theta) * 4

    this.player.position.x = playerX
    this.player.position.y = playerY
  }
}

const app = new App('#app')
app.init()
