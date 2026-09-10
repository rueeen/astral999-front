#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

// Deliberadamente explícito: las variantes no tienen una convención fiable.
export const SOURCE_TO_SLUG = {
  'The Fool  (1).svg': 'the-fool',
  'The Magician  (1).svg': 'the-magician',
  'The High Priestess  (1).svg': 'the-high-priestess',
  'The Empress (1).svg': 'the-empress',
  'The Lovers  (1).svg': 'the-lovers',
  'The Hermit (1).svg': 'the-hermit',
  'The Wheel of Fortune (1).svg': 'wheel-of-fortune',
  'The Star (1).svg': 'the-star',
  'The Moon (2).svg': 'the-moon',
  'The sun (1).svg': 'the-sun',
  'The Crystals.svg': 'card-back',
}

const BACKEND_SLUGS = [
  'the-fool',
  'the-magician',
  'the-high-priestess',
  'the-empress',
  'the-emperor',
  'the-hierophant',
  'the-lovers',
  'the-chariot',
  'strength',
  'the-hermit',
  'wheel-of-fortune',
  'justice',
  'the-hanged-man',
  'death',
  'temperance',
  'the-devil',
  'the-tower',
  'the-star',
  'the-moon',
  'the-sun',
  'judgement',
  'the-world',
  ...['wands', 'cups', 'swords', 'pentacles'].flatMap((suit) =>
    [
      'ace',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'page',
      'knight',
      'queen',
      'king',
    ].map((rank) => `${rank}-of-${suit}`),
  ),
]

const here = dirname(fileURLToPath(import.meta.url))
const sourceDir = resolve(process.argv[2] || here, process.argv[2] ? '' : '../src/Baraja/SVG/SVG')
const outputDir = resolve(here, '../src/Baraja/cards')
const thumbsDir = resolve(here, '../src/Baraja/thumbs')

const run = (command, args) =>
  new Promise((done, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) =>
      code === 0 ? done() : reject(new Error(`${command} terminó con código ${code}`)),
    )
  })

// Los ficheros contienen un solo path. Los extremos de todos sus comandos dan una
// caja conservadora; el margen adicional evita cortar curvas Bézier en sus tangentes.
const pathBounds = (pathData) => {
  const values = [...pathData.matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)].map(Number)
  const xs = values.filter((_, index) => index % 2 === 0)
  const ys = values.filter((_, index) => index % 2 === 1)
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
}

const tarotViewBox = ([minX, minY, maxX, maxY]) => {
  let width = maxX - minX
  let height = maxY - minY
  const safety = Math.max(width, height) * 0.005
  minX -= safety
  minY -= safety
  width += safety * 2
  height += safety * 2
  if (width / height > 2 / 3) {
    const nextHeight = width * 1.5
    minY -= (nextHeight - height) / 2
    height = nextHeight
  } else {
    const nextWidth = (height * 2) / 3
    minX -= (nextWidth - width) / 2
    width = nextWidth
  }
  return [minX, minY, width, height].map((n) => Number(n.toFixed(3))).join(' ')
}

await mkdir(outputDir, { recursive: true })
await mkdir(thumbsDir, { recursive: true })
let before = 0
let after = 0

for (const [sourceName, slug] of Object.entries(SOURCE_TO_SLUG)) {
  const input = resolve(sourceDir, sourceName)
  const original = await readFile(input, 'utf8')
  before += (await stat(input)).size
  const path = original.match(/<path\b[^>]*\bd="([\s\S]*?)"[^>]*\/?\s*>/i)
  if (!path) throw new Error(`${sourceName}: no contiene un path reconocible`)
  const viewBox = tarotViewBox(pathBounds(path[1]))
  const normalized = original
    .replace(/\s(?:width|height)="[^"]*"/g, '')
    .replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`)
    .replace(/style="[^"]*"/, '')
    .replace(/<path\s/, '<path fill="currentColor" ')
  const output = resolve(outputDir, `${slug}.svg`)
  await writeFile(output, normalized)
  // SVGO conserva intencionadamente ambos atributos necesarios para el theming.
  await run('npx', [
    '--yes',
    'svgo@3.3.2',
    '--multipass',
    '--config',
    resolve(here, 'svgo.deck.config.mjs'),
    '-i',
    output,
    '-o',
    output,
  ])
  await run('npx', [
    '--yes',
    'sharp-cli@5.2.0',
    '-i',
    output,
    '-o',
    resolve(thumbsDir, `${slug}.webp`),
    'resize',
    '300',
    '450',
    '--fit',
    'contain',
  ])
  after += (await stat(output)).size + (await stat(resolve(thumbsDir, `${slug}.webp`))).size
}

const available = new Set(Object.values(SOURCE_TO_SLUG))
const missing = BACKEND_SLUGS.filter((slug) => !available.has(slug))
console.log(`\nCartas preparadas: ${available.size - 1}`)
console.log(`Slugs sin arte (${missing.length}): ${missing.join(', ')}`)
console.log(`Peso: ${(before / 1024).toFixed(1)} KiB → ${(after / 1024).toFixed(1)} KiB`)
