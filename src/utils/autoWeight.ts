import * as THREE from 'three'

export function claudeAutoWeight(mesh: THREE.Mesh, skeleton: THREE.Skeleton) {
  const geometry = mesh.geometry
  const material = mesh.material
  const bones = skeleton.bones

  // Create skinning data
  const skinIndices = []
  const skinWeights = []

  // For each vertex in the mesh
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(position, i)
    const influences = calculateHeatInfluences(vertex, bones)

    // Sort influences by weight and take top 4 (THREE.js limitation)
    influences.sort((a, b) => b.weight - a.weight)
    influences.length = Math.min(influences.length, 4)

    // Normalize weights
    const totalWeight = influences.reduce((sum, inf) => sum + inf.weight, 0)
    influences.forEach((inf) => (inf.weight /= totalWeight))

    // Add to skinning data
    const indices = new THREE.Vector4()
    const weights = new THREE.Vector4()

    for (let j = 0; j < 4; j++) {
      if (j < influences.length) {
        indices.setComponent(j, influences[j].index)
        weights.setComponent(j, influences[j].weight)
      } else {
        indices.setComponent(j, 0)
        weights.setComponent(j, 0)
      }
    }

    skinIndices.push(indices)
    skinWeights.push(weights)
  }

  // Create new geometry with skinning data
  // const skinnedGeometry = new THREE.BufferGeometry().fromGeometry(geometry)
  geometry.setAttribute(
    'skinIndex',
    new THREE.BufferAttribute(new Float32Array(skinIndices.length * 4), 4)
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.BufferAttribute(new Float32Array(skinWeights.length * 4), 4)
  )

  const skinnedMesh = new THREE.SkinnedMesh(geometry, material)

  // see example from THREE.Skeleton
  const rootBone = skeleton.bones[0]
  skinnedMesh.add(rootBone)

  // bind the skeleton to the skinnedMesh
  skinnedMesh.bindMode = 'detached'
  skinnedMesh.bind(skeleton)

  // Create and return skinned mesh
  return skinnedMesh
}

function calculateHeatInfluences(vertex: THREE.Vector3, bones: THREE.Bone[]) {
  const influences = []

  for (let i = 0; i < bones.length; i++) {
    const bone = bones[i]
    const distance = vertex.distanceTo(bone.position)
    const weight = 1 / (distance * distance) // Inverse square law as a simple heat model

    influences.push({ index: i, weight: weight })
  }

  return influences
}
