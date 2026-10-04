"use client"

import type { ComponentProps } from "react"
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react"

/** ShaderGradient typings lag behind the runtime props — cast keeps typecheck green. */
const gradientProps = {
  animate: "on",
  axesHelper: "off",
  bgColor1: "#000000",
  bgColor2: "#000000",
  brightness: 1.1,
  cAzimuthAngle: 180,
  cDistance: 3.6,
  cPolarAngle: 90,
  cameraZoom: 1,
  color1: "#ff5005",
  color2: "#dbba95",
  color3: "#e1cc92",
  destination: "onCanvas",
  embedMode: "off",
  envPreset: "city",
  format: "gif",
  fov: 45,
  frameRate: 10,
  gizmoHelper: "hide",
  grain: "on",
  lightType: "3d",
  pixelDensity: 1,
  positionX: -1.4,
  positionY: 0,
  positionZ: 0,
  range: "disabled",
  rangeEnd: 40,
  rangeStart: 0,
  reflection: 0.1,
  rotationX: 0,
  rotationY: 10,
  rotationZ: 50,
  shader: "defaults",
  type: "plane",
  uAmplitude: 1,
  uDensity: 1.3,
  uFrequency: 5.5,
  uSpeed: 0.2,
  uStrength: 4,
  uTime: 0,
  wireframe: false,
} as ComponentProps<typeof ShaderGradient>

export function HeroGradient() {
  return (
    <ShaderGradientCanvas
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      pixelDensity={1}
      fov={45}
    >
      <ShaderGradient {...gradientProps} />
    </ShaderGradientCanvas>
  )
}
