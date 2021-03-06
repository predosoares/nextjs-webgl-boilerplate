import GUI from 'lil-gui'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

import Experience from 'experiences/shared/core/Experience'
import Debug from 'experiences/shared/utils/Debug'
import Resources from 'experiences/shared/utils/Resources'
import Time from 'experiences/shared/utils/Time'

export default class Fox {
  experience: Experience
  scene: THREE.Scene
  resources: Resources
  time: Time
  debug: Debug
  debugFolder: GUI
  resource: GLTF
  model: THREE.Group
  animation: {
    mixer: THREE.AnimationMixer
    actions: Record<string, THREE.AnimationAction>
    play: (name: string) => void | null
  }

  constructor(experience: Experience) {
    this.experience = experience
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.debug = this.experience.debug

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('fox')
    }

    // Setup
    this.resource = this.resources.items.foxModel as GLTF

    this.setModel()
    this.setAnimation()
  }

  setModel(): void {
    this.model = this.resource.scene
    this.model.scale.set(0.02, 0.02, 0.02)
    this.scene.add(this.model)

    this.model.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
  }

  setAnimation(): void {
    this.animation = {
      mixer: new THREE.AnimationMixer(this.model),
      actions: {},
      play: null,
    }

    this.animation.play = (name: string): void => {
      const newAction = this.animation.actions[name]
      const oldAction = this.animation.actions.current

      newAction.reset()
      newAction.play()
      newAction.crossFadeFrom(oldAction, 1, false)

      this.animation.actions.current = newAction
    }

    this.animation.actions.idle = this.animation.mixer.clipAction(
      this.resource.animations[0],
    )
    this.animation.actions.walking = this.animation.mixer.clipAction(
      this.resource.animations[1],
    )
    this.animation.actions.running = this.animation.mixer.clipAction(
      this.resource.animations[2],
    )

    this.animation.actions.current = this.animation.actions.idle
    this.animation.actions.current.play()

    // Debug
    if (this.debug.active) {
      const debugObject = {
        playIdle: () => {
          this.animation.play('idle')
        },
        playWalking: () => {
          this.animation.play('walking')
        },
        playRunning: () => {
          this.animation.play('running')
        },
      }
      this.debugFolder.add(debugObject, 'playIdle')
      this.debugFolder.add(debugObject, 'playWalking')
      this.debugFolder.add(debugObject, 'playRunning')
    }
  }

  update(): void {
    this.animation.mixer.update(this.time.delta * 0.001)
  }
}
