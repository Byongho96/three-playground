import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import bodyGlb from '../../assets/glbs/mixamo/run/body_animation.glb'
import trouserGlb from '../../assets/glbs/trouser.glb'
import jacketGlb from '../../assets/glbs/jacket.glb'
import hairGlb from '../../assets/glbs/hair.glb'
import { castObject } from '../../utils/castObject'

type addMeshArgs = {
  scene: THREE.Scene
  objects: THREE.Object3D[]
  mixers: THREE.AnimationMixer[]
  gltfLoader: GLTFLoader
}

export const addMesh = ({
  scene,
  objects,
  mixers,
  gltfLoader,
}: addMeshArgs) => {
  gltfLoader.load(bodyGlb, (gltf) => {
    const body = gltf.scene
    const mixer = new THREE.AnimationMixer(body)
    castObject(body)

    scene.add(body)
    objects.push(body)
    mixers.push(mixer)
    const action = mixer.clipAction(gltf.animations[0])
    action.play()

    gltfLoader.load(hairGlb, (gltf) => {
      const hair = gltf.scene
      hair.name = 'hair'
      objects.push(hair)
      castObject(hair)

      hair.position.z -= 0.005
      body.traverse((child) => {
        if (child.name === 'Ctrl_Head') {
          child.attach(hair)
        }
      })
    })

    gltfLoader.load(trouserGlb, (gltf) => {
      const trouser = gltf.scene
      trouser.name = 'trouser'
      objects.push(trouser)
      castObject(trouser)

      body.traverse((child) => {
        if (child.name === 'mixamorigHips') {
          child.attach(trouser)
        }
      })
    })

    gltfLoader.load(jacketGlb, (gltf) => {
      const jacket = gltf.scene
      jacket.name = 'jacket'
      objects.push(jacket)
      castObject(jacket)

      body.traverse((child) => {
        if (child.name === 'mixamorigSpine') {
          child.attach(jacket)
        }
      })
    })
  })
}
