
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  CylinderGeometry,
  TorusGeometry,
  SphereGeometry,
  MeshMatcapMaterial,
  ShaderMaterial,
  Mesh,
  Color,
  Clock,
  BackSide,
  Group,
  Vector2,
  TextureLoader
} from 'three'

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Tweakpane from 'tweakpane'

import { gsap } from 'gsap'

class App {
  constructor(container) {
    this.container = document.querySelector(container)

    this.ui = {
      score: document.querySelector('[data-ui-score]'),
      missed: document.querySelector('[data-ui-missed]')
    }

    this.state = {
      score: 0,
      missed: 0,
      playerMode: 'white'
    }

    this._resizeCb = () => this._onResize()
    this._mousemoveCb = e => this._onMousemove(e)
    this._keydownCb = e => this._onKeydown(e)
    this._keyupCb = e => this._onKeyup(e)
  }

  init() {
    this._createScene()
    this._createCamera()
    this._createRenderer()
    this._loadTextures()
    this._createClock()
    this._createTube()
    this._createPlayer()
    this._createBalls()
    this._spawnBall()
    this._addListeners()
    // this._createControls()
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

    this.tube.material.uniforms.uTime.value = elapsed

    this.balls.children.forEach(ball => {
      ball.position.z += 0.12

      // Check the Z coordinate of the ball compared to the player
      if (ball.position.z > this.player.position.z && ball.position.z < this.player.position.z + 1) {
        // Compare ball's theta to player's theta
        if (ball.userData.theta <= this.player.userData.theta + 0.1 && ball.userData.theta >= this.player.userData.theta - 0.1) {
          // Compare the ball's mode with the player's mode
          if (ball.userData.mode === this.state.playerMode) {
            this.balls.remove(ball)
            this.state.score++
            this.ui.score.textContent = this.state.score
          }
        }
      }

      // Remove the skipped ball when it goes out of view
      if (ball.position.z > 13) {
        this.balls.remove(ball)
        this.state.missed++
        this.ui.missed.textContent = this.state.missed
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
    this.renderer.setClearColor(0x000000)
  }

  _loadTextures() {
    const loader = new TextureLoader()

    this.textures = {
      black05: loader.load('/black-05.png'),
      white03: loader.load('/white-03.png')
    }
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

    sceneFolder.addInput(this.tube.material.uniforms.uLinesNum, 'value', { label: 'Number of Lines', min: 5, max: 300, step: 5 })
    sceneFolder.addInput(this.tube.material.uniforms.uLinesThickness, 'value', { label: 'Lines Thickness', min: 1, max: 20, step: 0.1 })
    sceneFolder.addInput(this.tube.material.uniforms.uTorsion, 'value', { label: 'Torsion', min: -2, max: 2 })
  }

  _createTube() {
    const geom = new CylinderGeometry(5, 5, 30, 48, 50, true)
    const mat = new ShaderMaterial({
      vertexShader: require('./shaders/tube.vertex.glsl'),
      fragmentShader: require('./shaders/tube.fragment.glsl'),
      side: BackSide,
      uniforms: {
        uTime: {
          value: 0
        },
        uLinesNum: {
          value: 100
        },
        uLinesThickness: {
          value: 10
        },
        uResolution: {
          value: new Vector2(
            this.container.clientWidth,
            this.container.clientHeight
          )
        },
        uBgColor: {
          value: new Color(0, 0, 0)
        },
        uTorsion: {
          value: 2
        },
        uLinesColors: {
          value: [
            new Color(0xffffff),
            new Color(0xCCCCFF),
            new Color(0xFF00CC)
          ]
        }
      }
    })

    this.tube = new Mesh(geom, mat)

    this.tube.rotation.x = Math.PI*-0.5

    this.scene.add(this.tube)
  }

  _createPlayer() {
    const geom = new TorusGeometry(0.8, 0.15, 12, 50, Math.PI*2)
    const mat = new MeshMatcapMaterial({
      matcap: this.textures.white03
    })

    this.player = new Mesh(geom, mat)

    this.player.position.z = 4.5

    this.scene.add(this.player)
  }

  _spawnBall() {
    const geom = this.ballGeometry
    const mode = Math.random() > 0.5 ? 'dark' : 'white'
    const mat = mode === 'dark' ?
                  this.ballBlackMaterial :
                  this.ballWhiteMaterial

    const mesh = new Mesh(geom, mat)

    const theta = Math.random()*Math.PI*2 - Math.PI

    mesh.userData.theta = theta
    mesh.userData.mode = mode

    const x = Math.cos(theta) * 4
    const y = Math.sin(theta) * 4

    mesh.position.set(x, y, -4)

    this.balls.add(mesh)

    // Spawn a new ball after a certain time
    setTimeout(() => this._spawnBall(), 500 + Math.random()*1000)
  }

  _createBalls() {
    this.balls = new Group()
    this.scene.add(this.balls)

    this.ballGeometry = new SphereGeometry(0.5, 32, 32)

    this.ballBlackMaterial = new MeshMatcapMaterial({
      matcap: this.textures.black05
    })

    this.ballWhiteMaterial = new MeshMatcapMaterial({
      matcap: this.textures.white03
    })
  }

  _createClock() {
    this.clock = new Clock()
  }

  _addListeners() {
    window.addEventListener('resize', this._resizeCb, { passive: true })
    this.container.addEventListener('mousemove', this._mousemoveCb, { passive: true })
    document.addEventListener('keydown', this._keydownCb, { passive: true })
    document.addEventListener('keyup', this._keyupCb, { passive: true })
  }

  _removeListeners() {
    window.removeEventListener('resize', this._resizeCb, { passive: true })
    this.container.removeEventListener('mousemove', this._mousemoveCb, { passive: true })
    document.removeEventListener('keydown', this._keydownCb, { passive: true })
    document.removeEventListener('keyup', this._keyupCb, { passive: true })
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

    gsap.to(this.camera.position, {
      x: () => deltaX / this.container.clientWidth * -1,
      y: () => deltaY / this.container.clientHeight,
      duration: 0.9
    })
  }

  _onKeydown(e) {
    switch(e.code) {
      case 'Space':
        this.state.playerMode = 'dark'
        this.player.material.matcap = this.textures.black05
        break
    }
  }

  _onKeyup(e) {
    switch(e.code) {
      case 'Space':
        this.state.playerMode = 'white'
        this.player.material.matcap = this.textures.white03
        break
    }
  }
}

const app = new App('#app')
app.init()
