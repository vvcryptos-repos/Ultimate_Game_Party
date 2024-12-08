import { engine, Transform, MeshRenderer, Material, Entity, MeshCollider } from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'

let isElevatorActive = false
let elevatorDirection: 'up' | 'down' = 'up'
const elevatorSpeed = 15 / 10 // Velocidad: 15 metros en 10 segundos

export function setupScene() {
  // Crear elevador
  const elevator: Entity = engine.addEntity()
  Transform.create(elevator, {
    position: Vector3.create(23.3, 1.5, 22.4),
    scale: Vector3.create(3.5, 0.5, 3.5),
  })
  MeshRenderer.setCylinder(elevator)
  MeshCollider.setCylinder(elevator) // Agregar collider al elevador
  Material.setPbrMaterial(elevator, {
    albedoColor: Color4.Green(),
    metallic: 0.2,
    roughness: 0.9,
  })

  // Sistema para animar el elevador
  engine.addSystem((dt: number) => {
    if (!isElevatorActive) return

    const transform = Transform.getMutable(elevator)

    if (elevatorDirection === 'up') {
      transform.position.y += elevatorSpeed * dt
      if (transform.position.y >= 15) {
        elevatorDirection = 'down'
      }
    } else if (elevatorDirection === 'down') {
      transform.position.y -= elevatorSpeed * dt
      if (transform.position.y <= 1.5) {
        transform.position.y = 1.5
        elevatorDirection = 'up'
      }
    }
  })

  // Crear luces animadas
  const numberOfLights = 4
  const lights: Entity[] = []
  const lightColors = [Color4.Red(), Color4.Blue(), Color4.Green(), Color4.Yellow()]

  for (let i = 0; i < numberOfLights; i++) {
    const light: Entity = engine.addEntity()
    lights.push(light)

    Transform.create(light, {
      position: Vector3.create(16, 6.1, 24),
      scale: Vector3.create(4, 0.5, 4),
    })

    MeshRenderer.setSphere(light)
    Material.setPbrMaterial(light, {
      emissiveColor: lightColors[i],
      emissiveIntensity: 4,
      metallic: 1,
      roughness: 0,
    })
  }

  // Sistema para animar las luces
  engine.addSystem(() => {
    const time = Date.now() / 1000
    lights.forEach((light, index) => {
      const transform = Transform.getMutable(light)
      const radius = 4
      const speed = 1
      const phase = (index * Math.PI * 2) / numberOfLights
      transform.position.x = 16 + Math.cos(time * speed + phase) * radius
      transform.position.z = 16 + Math.sin(time * speed + phase) * radius
    })
  })
}

// Activar el elevador desde el Memory Game
export function activateElevator() {
  isElevatorActive = true
}
