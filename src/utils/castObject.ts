import * as THREE from 'three'

export const castObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh
      m.castShadow = true
    }
  })
}
