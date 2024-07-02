import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import bodyGlb from '../../assets/glbs/mixamo/run/body_animation.glb'
import trouserGlb from '../../assets/glbs/trouser.glb'
import jacketGlb from '../../assets/glbs/jacket.glb'
import hairGlb from '../../assets/glbs/hair.glb'
import { castObject } from '../../utils/castObject'
import { rigClothingToSkeleton } from '../../utils/rigClothingToSkeleton'
import { claudeAutoWeight } from '../../utils/autoWeight'
import { normalRadianFromPointToSegment } from './pointToSegment'

type boneHeatArgs = {
  scene: THREE.Scene
  objects: THREE.Object3D[]
  mixers: THREE.AnimationMixer[]
  gltfLoader: GLTFLoader
}

export const boneHeat = ({
  scene,
  objects,
  mixers,
  gltfLoader,
}: boneHeatArgs) => {
  gltfLoader.load(bodyGlb, (gltf) => {
    const body = gltf.scene
    body.name = 'body'
    castObject(body)
    objects.push(body)

    console.log('gltfdf', body.clone())

    const mixer = new THREE.AnimationMixer(body)
    mixers.push(mixer)
    const action = mixer.clipAction(gltf.animations[0])
    action.timeScale = 0.2

    const helper = new THREE.SkeletonHelper(body)
    scene.add(helper)
    scene.add(body)

    const bones: THREE.Bone[] = []
    body.traverse((child) => {
      if (child instanceof THREE.Bone && child.children.length) {
        bones.push(child)
      }
    })
    const skeleton = new THREE.Skeleton(bones)

    gltfLoader.load(jacketGlb, (gltf) => {
      const jacket = gltf.scene
      jacket.name = 'jacket'
      objects.push(jacket)
      castObject(jacket)

      const skinnedJacket = autoWeight(jacket, skeleton)
      // const skinnedJacket = claudeAutoWeight(
      //   jacket.children[0] as THREE.Mesh,
      //   skeleton
      // )
      console.log('skineedMesh', skinnedJacket)
      scene.add(skinnedJacket)
    })

    gltfLoader.load(trouserGlb, (gltf) => {
      const trouser = gltf.scene
      trouser.name = 'trouser'
      objects.push(trouser)
      castObject(trouser)

      const skinnedTrouser = autoWeight(trouser, skeleton)
      // const skinnedTrouser = claudeAutoWeight(
      //   trouser.children[0] as THREE.Mesh,
      //   skeleton
      // )
      scene.add(skinnedTrouser)
    })

    setTimeout(() => {
      action.play()
    }, 1000)
  })
}

const autoWeight = (object: THREE.Object3D, skeleton: THREE.Skeleton) => {
  const mesh = object.children[0] as THREE.Mesh
  const geometry = mesh.geometry
  const material = mesh.material

  const position = geometry.attributes.position
  const skinIndices = []
  const skinWeights = []
  for (let i = 0; i < position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(position, i)
    let closestBoneIndex = -1
    let closestBoneDistance = Infinity

    for (let j = 0; j < skeleton.bones.length; j++) {
      const bone = skeleton.bones[j]
      const bonePosition = new THREE.Vector3().setFromMatrixPosition(
        bone.matrixWorld
      )
      const distance = vertex.distanceTo(bonePosition)

      if (distance < closestBoneDistance) {
        closestBoneIndex = j
        closestBoneDistance = distance
      }
    }

    skinIndices.push(closestBoneIndex, 0, 0, 0)
    skinWeights.push(1, 0, 0, 0)
  }

  geometry.setAttribute(
    'skinIndex',
    new THREE.Uint16BufferAttribute(skinIndices, 4)
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.Float32BufferAttribute(skinWeights, 4)
  )

  // create skinned mesh and skeleton
  const skinnedMesh = new THREE.SkinnedMesh(geometry, material)

  // see example from THREE.Skeleton
  const rootBone = skeleton.bones[0]
  skinnedMesh.add(rootBone)

  // bind the skeleton to the skinnedMesh
  skinnedMesh.bindMode = 'detached'
  skinnedMesh.bind(skeleton)

  return skinnedMesh
}

function findParentBone(skeleton: THREE.Skeleton, targetBone: THREE.Bone) {
  for (const bone of skeleton.bones) {
    if (bone.children.includes(targetBone)) {
      return bone
    }
  }
  return null
}

const autoWeight4 = (object: THREE.Object3D, skeleton: THREE.Skeleton) => {
  const mesh = object.children[0] as THREE.Mesh
  const geometry = mesh.geometry
  const material = mesh.material

  const position = geometry.attributes.position
  const skinIndices = []
  const skinWeights = []

  for (let i = 0; i < position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(position, i)
    let closestBoneIndex = [-1, -1]
    let closestBoneDistance = [Infinity, Infinity]
    let minDistance = Infinity

    for (let j = 0; j < skeleton.bones.length; j++) {
      const bone = skeleton.bones[j]
      const prevBone = findParentBone(skeleton, bone)

      if (!prevBone) continue

      const bonePosition = new THREE.Vector3().setFromMatrixPosition(
        bone.matrixWorld
      )
      const prevBonePosition = new THREE.Vector3().setFromMatrixPosition(
        prevBone.matrixWorld
      )

      const distance1 = vertex.distanceTo(bonePosition)
      const distance2 = vertex.distanceTo(prevBonePosition)

      const distance = distance1 + distance2

      const dotProduct = normalRadianFromPointToSegment(
        vertex,
        prevBonePosition,
        bonePosition
      )

      if (dotProduct > 1) {
        continue
      }

      if (distance < minDistance) {
        closestBoneIndex = [j, skeleton.bones.indexOf(prevBone)]
        closestBoneDistance = [
          1 - distance1 / distance,
          1 - distance2 / distance,
        ]
        minDistance = distance
        console.log(i, distance)
      }
    }

    skinIndices.push(closestBoneIndex[0], closestBoneIndex[1], 0, 0)
    skinWeights.push(closestBoneDistance[0], closestBoneDistance[1], 0, 0)
  }

  geometry.setAttribute(
    'skinIndex',
    new THREE.Uint16BufferAttribute(skinIndices, 4)
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.Float32BufferAttribute(skinWeights, 4)
  )

  // create skinned mesh and skeleton
  const skinnedMesh = new THREE.SkinnedMesh(geometry, material)

  // see example from THREE.Skeleton
  const rootBone = skeleton.bones[0]
  skinnedMesh.add(rootBone)

  // bind the skeleton to the skinnedMesh
  skinnedMesh.bindMode = 'detached'
  skinnedMesh.bind(skeleton)

  return skinnedMesh
}

const autoWeight2 = (object: THREE.Object3D, skeleton: THREE.Skeleton) => {
  const mesh = object.children[0] as THREE.Mesh
  const geometry = mesh.geometry
  const material = mesh.material

  const position = geometry.attributes.position
  const normal = geometry.attributes.normal // Get
  const skinIndices = new Uint16Array(position.count * 4)
  const skinWeights = new Float32Array(position.count * 4)

  const threshold = 0.001 // 기준값 설정, 너무 작은 값을 방지하기 위함
  const sigma = 1 // Gaussian 함수의 표준 편차

  for (let i = 0; i < position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(position, i)
    const vertexNormal = new THREE.Vector3().fromBufferAttribute(normal, i) // Get vertex normal

    // Transform vertex to world coordinates
    vertex.applyMatrix4(mesh.matrixWorld)
    vertexNormal.transformDirection(mesh.matrixWorld) // Transform the normal vector

    const weights = []

    for (let j = 0; j < skeleton.bones.length; j++) {
      const bone = skeleton.bones[j]
      const bonePosition = new THREE.Vector3().setFromMatrixPosition(
        bone.matrixWorld
      )
      const distance = vertex.distanceTo(bonePosition)

      // bone의 방향 벡터 계산 (본의 월드 매트릭스에서 방향 벡터 추출)
      const boneDirection = new THREE.Vector3()
        .setFromMatrixColumn(mesh.matrixWorld, 2)
        .normalize()
      const vertexToBoneVector = bonePosition.clone().sub(vertex).normalize()
      const dotProduct = vertexNormal.dot(vertexToBoneVector) // Calculate dot product

      // Consider only bones inside the mesh (dot product should be positive)
      // if (dotProduct > 0) {
      //   weights.push({ index: j, weight: 0 })
      //   continue
      // }

      // 사인 유사도를 이용한 각도 계산
      const angle = Math.abs(boneDirection.angleTo(vertexToBoneVector))

      // if angle is lower then 30 degrees, set weight to 0
      if (angle < THREE.MathUtils.degToRad(20)) {
        weights.push({ index: j, weight: 0 })
        continue
      }

      // const angleWeight = Math.abs(Math.sin(angle))

      // 거리의 역수에 지수 감쇠를 적용
      // const distanceWeight = Math.exp(-distance * distance)

      // Gaussian 분포와 각도 가중치를 결합한 가중치 계산
      const distanceWeight = Math.exp(-Math.pow(distance / sigma, 2) / 2)
      const weight = distanceWeight

      weights.push({ index: j, weight })
    }

    // 가장 큰 가중치를 가지는 네 개의 뼈를 선택
    weights.sort((a, b) => b.weight - a.weight)
    const selectedWeights = weights.slice(0, 4)

    selectedWeights[2].weight = 0
    selectedWeights[3].weight = 0

    // // 가중치가 기준값 이하인 경우 0으로 설정
    // selectedWeights.forEach((w) => {
    //   if (w.weight <= threshold) {
    //     w.weight = 0
    //   }
    // })

    // 가중치를 정규화하여 합이 1이 되도록 조정
    const totalWeight = selectedWeights.reduce((sum, w) => sum + w.weight, 0)
    selectedWeights.forEach((w) => (w.weight /= totalWeight))

    console.log(
      'selectedWeights',
      selectedWeights[0].weight,
      selectedWeights[1].weight,
      selectedWeights[2].weight,
      selectedWeights[3].weight
    )

    // 선택된 뼈의 인덱스와 가중치를 추가
    for (let k = 0; k < 4; k++) {
      const index = 4 * i + k
      if (k < selectedWeights.length) {
        skinIndices[index] = selectedWeights[k].index
        skinWeights[index] = selectedWeights[k].weight
      } else {
        skinIndices[index] = 0
        skinWeights[index] = 0
      }
    }
  }

  geometry.setAttribute(
    'skinIndex',
    new THREE.Uint16BufferAttribute(skinIndices, 4)
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.Float32BufferAttribute(skinWeights, 4)
  )

  // create skinned mesh and skeleton
  const skinnedMesh = new THREE.SkinnedMesh(geometry, material)
  const rootBone = skeleton.bones[0]

  // 메쉬에 스켈레톤 추가 및 바인딩
  // skinnedMesh.bindMode = 'detached'
  skinnedMesh.add(rootBone)
  skinnedMesh.bind(skeleton)

  return skinnedMesh
}

const autoWeight3 = (object: THREE.Object3D, skeleton: THREE.Skeleton) => {
  const mesh = object.children[0] as THREE.Mesh
  const geometry = mesh.geometry
  const material = mesh.material

  const position = geometry.attributes.position
  const skinIndices = new Uint16Array(position.count * 4)
  const skinWeights = new Float32Array(position.count * 4)

  const threshold = 0.001 // Weight threshold to filter out very small weights
  const sigma = 1 // Standard deviation for Gaussian distribution

  for (let i = 0; i < position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(position, i)
    const weights: { index: number; weight: number }[] = []

    for (let j = 0; j < skeleton.bones.length; j++) {
      const bone = skeleton.bones[j]
      const bonePosition = new THREE.Vector3().setFromMatrixPosition(
        bone.matrixWorld
      )
      const distance = vertex.distanceTo(bonePosition)

      // Calculate bone direction
      const boneDirection = new THREE.Vector3()
        .setFromMatrixColumn(bone.matrixWorld, 2)
        .normalize()
      const vertexToBoneVector = bonePosition.clone().sub(vertex).normalize()

      // Calculate angle weight using cosine similarity
      const cosAngle = boneDirection.dot(vertexToBoneVector)
      const angleWeight = Math.abs(cosAngle) // Use absolute value to get a positive weight

      // Combine distance weight (Gaussian) and angle weight
      const distanceWeight = Math.exp(-Math.pow(distance / sigma, 2) / 2)
      const weight = distanceWeight * angleWeight

      weights.push({ index: j, weight })
    }

    // Select the top 4 weights
    weights.sort((a, b) => b.weight - a.weight)
    const selectedWeights = weights.slice(0, 4)

    // Normalize weights, setting very small weights to 0
    selectedWeights.forEach((w) => {
      if (w.weight <= threshold) {
        w.weight = 0
      }
    })

    // Normalize remaining weights to sum to 1
    const nonZeroWeights = selectedWeights.filter((w) => w.weight > 0)
    const totalWeight = nonZeroWeights.reduce((sum, w) => sum + w.weight, 0)
    nonZeroWeights.forEach((w) => (w.weight /= totalWeight))

    // Assign weights to skinIndices and skinWeights arrays
    for (let k = 0; k < 4; k++) {
      const index = 4 * i + k
      if (k < nonZeroWeights.length) {
        skinIndices[index] = nonZeroWeights[k].index
        skinWeights[index] = nonZeroWeights[k].weight
      } else {
        skinIndices[index] = 0
        skinWeights[index] = 0
      }
    }
  }

  geometry.setAttribute(
    'skinIndex',
    new THREE.Uint16BufferAttribute(skinIndices, 4)
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.Float32BufferAttribute(skinWeights, 4)
  )

  // Create skinned mesh and skeleton
  const skinnedMesh = new THREE.SkinnedMesh(geometry, material)
  const rootBone = skeleton.bones[0]

  // Add and bind skeleton to the skinned mesh
  skinnedMesh.add(rootBone)
  skinnedMesh.bind(skeleton)

  // Replace the original mesh with the skinned mesh
  object.add(skinnedMesh)
  object.remove(mesh)
}

// const weight = Math.exp(-distance * distance)
// const weight = Math.exp(-Math.pow(distance, 1)) // 거리에 기반한 지수 함수 (Exponential Decay)
// const weight = 1 / (distance * distance + 1) // 거리에 따른 가중치
// const weight = distance > 0.5 ? 1 / distance : 1 // 고정 가중치 (Fixed Weight)
