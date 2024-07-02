import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import useDefaultRender from './hooks/useDefaultRenderer'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { disposeObject } from './utils/disposeObject'
import { addMesh } from './features/auto-weighting/addMesh'
import { shareAnimation } from './features/auto-weighting/shareAnimation'
import './App.css'
import { boneHeat } from './features/auto-weighting/boneHeat'
import { animationGroup } from './features/auto-weighting/animationGroup'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { sceneRef, isRenderReady } = useDefaultRender({ canvasRef })

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !isRenderReady) return

    scene.background = new THREE.Color(0x333333)

    const gltfLoader = new GLTFLoader()
    const mixers: THREE.AnimationMixer[] = []
    const objects: THREE.Object3D[] = []

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(0, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.receiveShadow = true
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    // addMesh({ scene, objects, mixers, gltfLoader }) // Case 1. Add mesh
    // shareAnimation({ scene, objects, mixers, gltfLoader }) // Case 2. Share animation
    boneHeat({ scene, objects, mixers, gltfLoader }) // Case 3. Bone heat
    // animationGroup({ scene, objects, mixers, gltfLoader }) // Case 4. Animation group

    let animationFrameId: number
    const clock = new THREE.Clock()
    const draw = function renderCanvas() {
      const delta = clock.getDelta()
      mixers.forEach((mixer) => {
        mixer.update(delta)
      })
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      objects.forEach((object) => {
        disposeObject(object)
      })
      animationFrameId && cancelAnimationFrame(animationFrameId)
    }
  }, [isRenderReady])

  return <canvas ref={canvasRef} />
}

export default App
