import {
    engine,
    Transform,
    Material,
    MeshRenderer,
    MeshCollider,
    pointerEventsSystem,
    InputAction,
    Entity,
  } from '@dcl/sdk/ecs'
  import { Vector3, Color4 } from '@dcl/sdk/math'
  import { updateMessage } from './ui'
  import { activateElevator } from './scene'
  
  export class MemoryGame {
    private cubes: Entity[] = []
    private cubeColors: Color4[] = []
    private isLocked: boolean[] = []
    private firstSelectedIndex: number = -1
    private score: number = 0
    private canSelect: boolean = true
    private resetQueue: { first: number; second: number; elapsed: number }[] = []
  
    constructor() {
      const memoryBasePosition = Vector3.create(8, 0.5, 24)
      const spacing = 2
      const colors = [
        Color4.Red(),
        Color4.Blue(),
        Color4.Green(),
        Color4.Yellow(),
        Color4.create(1, 0, 1, 1), // Magenta
        Color4.create(0, 1, 1, 1), // Cyan
        Color4.create(0.5, 0.5, 0.5, 1), // Gray
        Color4.create(0, 0.5, 0.5, 1), // Teal
      ]
  
      this.cubeColors = [...colors, ...colors]
      this.shuffleArray(this.cubeColors)
  
      for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 8)
        const col = i % 8
        const position = Vector3.add(memoryBasePosition, Vector3.create(col * spacing, 0, row * spacing))
  
        const cube: Entity = engine.addEntity()
        this.cubes.push(cube)
        this.isLocked[i] = false
  
        Transform.create(cube, { position, scale: Vector3.create(1, 1, 1) })
        MeshRenderer.setBox(cube)
        MeshCollider.setBox(cube)
        Material.setPbrMaterial(cube, { albedoColor: Color4.White() })
  
        this.setupCubeClick(cube, i)
      }
  
      engine.addSystem((dt) => this.update(dt))
    }
  
    private shuffleArray(array: Color4[]): void {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
    }
  
    private setupCubeClick(cube: Entity, index: number): void {
      pointerEventsSystem.onPointerDown(
        {
          entity: cube,
          opts: { button: InputAction.IA_PRIMARY, hoverText: 'Reveal' },
        },
        () => {
          if (!this.canSelect || this.isLocked[index]) return
  
          if (this.firstSelectedIndex === -1) {
            this.firstSelectedIndex = index
            Material.setPbrMaterial(cube, { albedoColor: this.cubeColors[index] })
          } else if (this.firstSelectedIndex !== index) {
            Material.setPbrMaterial(cube, { albedoColor: this.cubeColors[index] })
            this.checkMatch(this.firstSelectedIndex, index)
          }
        }
      )
    }
  
    private checkMatch(first: number, second: number): void {
      this.canSelect = false
  
      const firstColor = this.cubeColors[first]
      const secondColor = this.cubeColors[second]
  
      const colorsMatch =
        firstColor.r === secondColor.r &&
        firstColor.g === secondColor.g &&
        firstColor.b === secondColor.b &&
        firstColor.a === secondColor.a
  
      if (colorsMatch) {
        this.isLocked[first] = true
        this.isLocked[second] = true
        this.score++
  
        updateMessage(`Pairs found: ${this.score}/8`)
  
        if (this.score === 8) {
          this.handleVictory()
        }
  
        this.resetSelection()
      } else {
        this.resetQueue.push({ first, second, elapsed: 0 })
      }
    }
  
    private resetSelection(): void {
      this.firstSelectedIndex = -1
      this.canSelect = true
    }
  
    private handleVictory(): void {
      updateMessage('Congratulations! Elevator is now active.')
      activateElevator()
    }
  
    private update(dt: number): void {
      for (let i = this.resetQueue.length - 1; i >= 0; i--) {
        const resetItem = this.resetQueue[i]
        resetItem.elapsed += dt
  
        if (resetItem.elapsed >= 0.5) {
          Material.setPbrMaterial(this.cubes[resetItem.first], { albedoColor: Color4.White() })
          Material.setPbrMaterial(this.cubes[resetItem.second], { albedoColor: Color4.White() })
          this.resetQueue.splice(i, 1)
          this.resetSelection()
        }
      }
    }
  }
  
  export function setupMemoryGame() {
    new MemoryGame()
  }
  