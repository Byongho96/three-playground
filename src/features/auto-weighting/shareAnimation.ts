import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import bodyGlb from '../../assets/glbs/mixamo/run/body_animation.glb'
// import jacketGlb from '../../assets/glbs/mixamo/rigged/jacket-rigged.glb'
// import trouserGlb from '../../assets/glbs/mixamo/rigged/trouser-rigged.glb'
import setBlenderGlb from '../../assets/glbs/mixamo/set-skeleton-blender-weight.glb'
import { castObject } from '../../utils/castObject'

type shareAnimationArgs = {
  scene: THREE.Scene
  objects: THREE.Object3D[]
  mixers: THREE.AnimationMixer[]
  gltfLoader: GLTFLoader
}

// 하나의 애니메이션 클립 공유
const animationClips: { [key: string]: THREE.AnimationClip } = {}

export const shareAnimation = ({
  scene,
  objects,
  mixers,
  gltfLoader,
}: shareAnimationArgs) => {
  gltfLoader.load(bodyGlb, (gltf) => {
    const body = gltf.scene
    body.name = 'body'
    castObject(body)
    objects.push(body)

    body.traverse((child) => {
      if (child instanceof THREE.Bone && child.name !== 'face_Adult001') {
        child.scale.setScalar(0.5)
        console.log(child.name)
      }
    })

    const bodyMixer = new THREE.AnimationMixer(body)
    mixers.push(bodyMixer)
    animationClips['bow'] = gltf.animations[0]

    // const helper = new THREE.SkeletonHelper(body)
    // scene.add(helper)
    scene.add(body)

    playAnimation(mixers)
  })

  // gltfLoader.load(jacketGlb, function (gltf) {
  //   const jacket = gltf.scene
  //   jacket.name = 'jacket'
  //   castObject(jacket)
  //   objects.push(jacket)

  //   const jacketMixer = new THREE.AnimationMixer(jacket)
  //   mixers.push(jacketMixer)

  //   scene.add(jacket)
  //   playAnimation(mixers)
  // })

  // gltfLoader.load(trouserGlb, function (gltf) {
  //   const trouser = gltf.scene
  //   trouser.name = 'trouser'
  //   castObject(trouser)
  //   objects.push(trouser)

  //   const trouserMixer = new THREE.AnimationMixer(trouser)
  //   mixers.push(trouserMixer)

  //   scene.add(trouser)
  //   playAnimation(mixers)
  // })

  gltfLoader.load(setBlenderGlb, function (gltf) {
    const set = gltf.scene
    set.name = 'set'
    castObject(set)
    objects.push(set)

    const trouserMixer = new THREE.AnimationMixer(set)
    mixers.push(trouserMixer)

    scene.add(set)
    playAnimation(mixers)
  })
}

function playAnimation(mixers: THREE.AnimationMixer[]) {
  mixers.forEach((mixer) => {
    mixer.clipAction(animationClips['bow']).reset().fadeIn(0.5).play()
  })
}

// import * as THREE from 'three'
// import { GLTFLoader } from 'three/examples/jsm/Addons.js'
// import bodyGlb from '../../assets/glbs/character_body.glb'
// import trouserGlb from '../../assets/glbs/trouser_rigging.glb'
// import hairGlb from '../../assets/glbs/hair_rigging.glb'
// import jacketGlb from '../../assets/glbs/jacket_rigging.glb'
// import { castObject } from '../../utils/castObject'

// type shareAnimationArgs = {
//   scene: THREE.Scene
//   objects: THREE.Object3D[]
//   mixers: THREE.AnimationMixer[]
//   gltfLoader: GLTFLoader
// }

// // 하나의 애니메이션 클립 공유
// const animationClips: { [key: string]: THREE.AnimationClip } = {}

// export const shareAnimation = ({
//   scene,
//   objects,
//   mixers,
//   gltfLoader,
// }: shareAnimationArgs) => {
//   gltfLoader.load(bodyGlb, (gltf) => {
//     const body = gltf.scene
//     body.name = 'body'
//     castObject(body)
//     objects.push(body)

//     // body.traverse((child) => {
//     //   if (child instanceof THREE.Bone && child.name !== 'face_Adult001') {
//     //     child.scale.setScalar(0.5)
//     //     console.log(child.name)
//     //   }
//     // })

//     const bodyMixer = new THREE.AnimationMixer(body)
//     mixers.push(bodyMixer)
//     animationClips['bow'] = gltf.animations[0]

//     const helper = new THREE.SkeletonHelper(body)
//     scene.add(helper)
//     scene.add(body)

//     body.position.x -= 1.5
//     // playAnimation(mixers)
//     console.log('body', body)

//     gltfLoader.load(hairGlb, function (gltf) {
//       const hair = gltf.scene
//       hair.name = 'hair'
//       castObject(hair)
//       objects.push(hair)

//       const hairMixer = new THREE.AnimationMixer(hair)
//       mixers.push(hairMixer)

//       body.add(hair)
//       // playAnimation(mixers)
//     })
//   })

//   gltfLoader.load(jacketGlb, function (gltf) {
//     const jacket = gltf.scene
//     jacket.name = 'jacket'
//     castObject(jacket)
//     objects.push(jacket)

//     const jacketMixer = new THREE.AnimationMixer(jacket)
//     const helper = new THREE.SkeletonHelper(jacket)
//     scene.add(helper)
//     mixers.push(jacketMixer)

//     scene.add(jacket)
//     // playAnimation(mixers)
//   })

//   gltfLoader.load(trouserGlb, function (gltf) {
//     const trouser = gltf.scene
//     trouser.name = 'trouser'
//     castObject(trouser)
//     objects.push(trouser)

//     const trouserMixer = new THREE.AnimationMixer(trouser)
//     const helper = new THREE.SkeletonHelper(trouser)
//     scene.add(helper)
//     mixers.push(trouserMixer)

//     trouser.position.x += 1.5
//     scene.add(trouser)
//     // playAnimation(mixers)
//   })
// }

// function playAnimation(mixers: THREE.AnimationMixer[]) {
//   mixers.forEach((mixer) => {
//     mixer.clipAction(animationClips['bow']).reset().fadeIn(0.5).play()
//   })
// }
