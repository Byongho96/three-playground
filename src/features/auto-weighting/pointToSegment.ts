import * as THREE from 'three'

export function distanceFromPointToSegment(
  point: THREE.Vector3,
  segmentStart: THREE.Vector3,
  segmentEnd: THREE.Vector3
): number {
  const segmentVector = segmentEnd.clone().sub(segmentStart)
  const pointVector = point.clone().sub(segmentStart)
  const segmentLengthSquared = segmentVector.lengthSq()
  const t = Math.max(
    0,
    Math.min(1, pointVector.dot(segmentVector) / segmentLengthSquared)
  )
  const projection = segmentStart.clone().add(segmentVector.multiplyScalar(t))
  const distance = point.distanceTo(projection)
  return distance
}

export function normalRadianFromPointToSegment(
  point: THREE.Vector3,
  segmentStart: THREE.Vector3,
  segmentEnd: THREE.Vector3
): number {
  const segmentVector = segmentEnd.clone().sub(segmentStart).normalize()
  const pointVector = point.clone().sub(segmentStart).normalize()
  const dotProduct = segmentVector.dot(pointVector)
  return Math.abs(dotProduct)
}
