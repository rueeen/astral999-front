const deckAssets = import.meta.glob('./Baraja/*.png', {
  eager: true,
  import: 'default',
})

export const majorArcanaImages = Object.fromEntries(
  Object.entries(deckAssets)
    .filter(([path]) => !path.endsWith('/Card Back.png'))
    .map(([path, url]) => [Number(path.match(/\/(\d+)_/)?.[1]), url]),
)

export const cardBackImage = deckAssets['./Baraja/Card Back.png']
