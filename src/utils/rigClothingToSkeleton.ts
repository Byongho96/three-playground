import * as THREE from 'three'

/**
 * Assigns bone weights to the vertices of a clothing mesh based on proximity to the bones of a skeleton.
 * @param object - The clothing mesh object.
 * @param skeleton - The skeleton to rig the clothing mesh to.
 */
function rigClothingToSkeleton(
  object: THREE.Mesh,
  skeleton: THREE.Skeleton
): THREE.SkinnedMesh {
  const geometry = object.geometry as THREE.BufferGeometry
  const material = object.material

  // Create skinWeight and skinIndex attributes if they don't exist
  if (!geometry.attributes.skinWeight) {
    geometry.setAttribute(
      'skinWeight',
      new THREE.BufferAttribute(
        new Float32Array(geometry.attributes.position.count * 4),
        4
      )
    )
  }
  if (!geometry.attributes.skinIndex) {
    geometry.setAttribute(
      'skinIndex',
      new THREE.BufferAttribute(
        new Uint16Array(geometry.attributes.position.count * 4),
        4
      )
    )
  }

  const positionAttr = geometry.attributes.position
  const skinWeightAttr = geometry.attributes.skinWeight
  const skinIndexAttr = geometry.attributes.skinIndex

  const position = new THREE.Vector3()
  const bonePosition = new THREE.Vector3()

  const boneCount = skeleton.bones.length
  const vertexCount = positionAttr.count

  for (let i = 0; i < vertexCount; i++) {
    position.fromBufferAttribute(positionAttr, i)

    let totalWeight = 0
    const weights = new Array<number>(boneCount).fill(0)

    for (let j = 0; j < boneCount; j++) {
      const bone = skeleton.bones[j]
      bonePosition.setFromMatrixPosition(bone.matrixWorld)

      const distance = position.distanceTo(bonePosition)
      const weight = Math.max(0, 1 - distance / 10) // Adjust the divisor for influence range

      weights[j] = weight
      totalWeight += weight
    }

    for (let j = 0; j < boneCount; j++) {
      weights[j] /= totalWeight
    }

    const sortedIndices = weights
      .map((w, idx) => [w, idx] as [number, number])
      .sort((a, b) => b[0] - a[0])
      .slice(0, 4)

    for (let j = 0; j < 4; j++) {
      skinWeightAttr.setXYZW(
        i,
        j === 0 ? sortedIndices[j][0] : 0,
        j === 1 ? sortedIndices[j][0] : 0,
        j === 2 ? sortedIndices[j][0] : 0,
        j === 3 ? sortedIndices[j][0] : 0
      )
      skinIndexAttr.setXYZW(
        i,
        j === 0 ? sortedIndices[j][1] : 0,
        j === 1 ? sortedIndices[j][1] : 0,
        j === 2 ? sortedIndices[j][1] : 0,
        j === 3 ? sortedIndices[j][1] : 0
      )
    }
  }

  geometry.attributes.skinWeight.needsUpdate = true
  geometry.attributes.skinIndex.needsUpdate = true

  // see example from THREE.Skeleton
  const skinnedMesh = new THREE.SkinnedMesh(geometry, material)
  const rootBone = skeleton.bones[0]
  skinnedMesh.add(rootBone)

  // bind the skeleton to the skinnedMesh
  skinnedMesh.bindMode = 'detached'
  skinnedMesh.bind(skeleton)

  return skinnedMesh
  // console.log('Clothing rigged to skeleton successfully.')
}

export { rigClothingToSkeleton }
