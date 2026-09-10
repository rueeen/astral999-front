const svgUrls = import.meta.glob('./Baraja/cards/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})
const svgSources = import.meta.glob('./Baraja/cards/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw',
})
const thumbnailUrls = import.meta.glob('./Baraja/thumbs/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
})

const bySlug = (assets) =>
  Object.fromEntries(
    Object.entries(assets).map(([path, asset]) => [
      path
        .split('/')
        .at(-1)
        .replace(/\.(svg|webp)$/, ''),
      asset,
    ]),
  )

export const cardSvgUrls = bySlug(svgUrls)
export const cardSvgSources = bySlug(svgSources)
export const cardThumbnailUrls = bySlug(thumbnailUrls)
export const cardBackImage = cardSvgUrls['card-back']
