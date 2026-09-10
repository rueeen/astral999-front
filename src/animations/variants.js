export const timings = {
  reduced: 0.12,
  shuffle: 1.2,
  cut: 0.65,
  deal: 0.55,
  dealStagger: 0.15,
  flip: 0.6,
  paragraph: 0.38,
  paragraphStagger: 0.14,
  verdict: 0.7,
}

export const ease = [0.22, 1.18, 0.36, 1]

export const shuffleVariants = {
  idle: { x: 0, rotate: 0, opacity: 1 },
  shuffle: (index) => ({
    x: [0, index % 2 ? 36 : -36, 0],
    rotate: [0, index % 2 ? 3 : -3, 0],
    opacity: [1, 0.92, 1],
  }),
  reduced: { opacity: [0.65, 1] },
}

export const cutVariants = {
  cut: { x: [0, 38, 38, 0], y: [0, 0, 5, 0], rotate: [0, 2, 2, 0] },
  reduced: { opacity: [0.55, 1] },
}

export const dealVariants = {
  hidden: { x: 0, y: -28, scale: 0.72, opacity: 0 },
  visible: (reversed) => ({
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: reversed ? 180 : 0,
    opacity: 1,
  }),
  reducedHidden: { opacity: 0 },
  reducedVisible: { opacity: 1 },
  return: { x: 0, y: -28, scale: 0.72, opacity: 0 },
}

export const flipVariants = {
  hidden: { rotateY: 0, opacity: 1 },
  visible: { rotateY: 180, opacity: 1 },
  reducedHidden: { opacity: 1 },
  reducedVisible: { opacity: 1 },
}

export const copyVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  reducedHidden: { opacity: 0 },
  reducedVisible: { opacity: 1 },
}
