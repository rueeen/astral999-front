import { useReducedMotion } from 'motion/react'

export default function useMotionPreference(override) {
  const systemPreference = useReducedMotion()
  const reduced = override ?? systemPreference

  return { durationMultiplier: reduced ? 0 : 1, allowMovement: !reduced }
}
