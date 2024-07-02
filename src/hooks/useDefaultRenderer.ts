import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { DefaultRenderer } from '../libs/DefaultRenderer'
import { DefaultCamera } from '../libs/DefaultCamera'
import { disposeObject } from '../utils/disposeObject'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

type TDefaultRenderProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

/**
 * Set Default render data
 */
const useDefaultRender = ({ canvasRef }: TDefaultRenderProps) => {
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<DefaultCamera | null>(null)
  const [isRenderReady, setIsRenderReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const renderer = new DefaultRenderer({ canvas, antialias: true })
    rendererRef.current = renderer

    const camera = new DefaultCamera({ canvas })
    cameraRef.current = camera
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas)

    // draw canvas
    const clock = new THREE.Clock()
    const draw = function renderCanvas() {
      const delta = clock.getDelta()
      renderer.render(scene, camera)
      renderer.setAnimationLoop(draw)
      controls.update(delta)
    }

    draw()

    // Add event listener for resizing
    const handleSize = function resizeCameraRenderer() {
      camera.setDefaultAspect()
      camera.updateProjectionMatrix()
      renderer.setDefaultSize()
      renderer.render(scene, camera)
    }

    handleSize()

    window.addEventListener('resize', handleSize)
    setIsRenderReady(true)

    // Dispose the resources
    return () => {
      sceneRef.current = null
      rendererRef.current = null
      cameraRef.current = null

      scene.remove(camera)
      scene.children.forEach((child) => disposeObject(child))
      renderer.dispose()
      window.removeEventListener('resize', handleSize)

      renderer.setAnimationLoop(null)
      setIsRenderReady(false)
    }
  }, [])

  return { sceneRef, rendererRef, cameraRef, isRenderReady }
}

export default useDefaultRender
