// Binary rain: a still grid of 0s and 1s, and over each column a dark cover with a fading window that falls.
// The digits never move, so a spot brightens once as a drop passes and then fades: nothing flickers.
// At the foot, a pile of settled digits stands as tall as the context window is full.

const WIDTH = 1600
const HEIGHT = 1000
const COLUMN = 32
const ROW = 29
const COLUMNS = WIDTH / COLUMN
const ROWS = Math.ceil(HEIGHT / ROW)
const TRAIL = 460
const GROUND = '#020a05'

/** A repeatable number in [0, 1), so every build draws the same rain. */
function unit(a: number, b: number): number {
  let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 1, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)

  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const digit = (column: number, row: number): string => (unit(column, row) < 0.5 ? '0' : '1')
const centre = (column: number): number => column * COLUMN + COLUMN / 2
const baseline = (row: number): number => (row + 1) * ROW - 6

/** One line of the grid: the digits of `columns`, each set at its own column. */
function line(row: number, columns: number[], className: string): string {
  if (columns.length === 0) {
    return ''
  }

  const xs = columns.map(centre).join(' ')
  const digits = columns.map(column => digit(column, row)).join('')

  return `<text class="${className}" y="${baseline(row)}" x="${xs}">${digits}</text>`
}

function cover(column: number): string {
  // Where the drop rests with motion off, how long one fall takes, and how far into it the drop starts.
  const rest = Math.round(120 + unit(column, 101) * 1100)
  const seconds = (11 + unit(column, 102) * 13).toFixed(1)
  const delay = (unit(column, 103) * 24).toFixed(1)

  return (
    `<g transform="translate(${column * COLUMN} 0)">` +
    `<g class="drop" transform="translate(0 ${rest})" style="animation-duration:${seconds}s;animation-delay:-${delay}s">` +
    `<rect y="-2400" width="${COLUMN}" height="${2400 - TRAIL}" fill="${GROUND}" fill-opacity="0.9"/>` +
    `<rect y="${-TRAIL}" width="${COLUMN}" height="${TRAIL}" fill="url(#fade)"/>` +
    `<rect y="2" width="${COLUMN}" height="2400" fill="${GROUND}" fill-opacity="0.9"/>` +
    `</g></g>`
  )
}

/** How many rows of settled digits a column holds: the fill, with a ragged top. */
function settled(column: number, percent: number): number {
  if (percent <= 0) {
    return 0
  }

  const ragged = (percent / 100) * ROWS + (unit(column, 201) - 0.5) * 3

  return Math.min(ROWS, Math.max(1, Math.round(ragged)))
}

/** The pile's color: green while there is room, amber as it runs short, red near the top. */
function pileColor(percent: number): string {
  if (percent >= 90) {
    return '#ff6b5e'
  }

  return percent >= 75 ? '#f2c14a' : '#8dffb0'
}

/** The whole scene, with the pile at `percent` (0 to 100) of the window's height. */
export function scene(percent: number): string {
  const all = Array.from({ length: COLUMNS }, (_, column) => column)
  const heights = all.map(column => settled(column, percent))
  let grid = ''
  let covers = ''
  let pile = ''

  for (let row = 0; row < ROWS; row++) {
    grid += line(row, all, 'rain')
    pile += line(
      row,
      all.filter(column => ROWS - row <= (heights[column] ?? 0)),
      'pile',
    )
  }

  for (const column of all) {
    covers += cover(column)
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice">` +
    `<style>` +
    `text{font-family:monospace;font-size:22px;text-anchor:middle}` +
    `.rain{fill:#3df07a}` +
    `.pile{fill:${pileColor(percent)};fill-opacity:0.8}` +
    `.drop{animation-name:fall;animation-timing-function:linear;animation-iteration-count:infinite}` +
    `@keyframes fall{from{transform:translateY(-40px)}to{transform:translateY(${HEIGHT + TRAIL + 40}px)}}` +
    `</style>` +
    `<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${GROUND}" stop-opacity="0.9"/>` +
    `<stop offset="0.75" stop-color="${GROUND}" stop-opacity="0.45"/>` +
    `<stop offset="1" stop-color="${GROUND}" stop-opacity="0"/>` +
    `</linearGradient></defs>` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${GROUND}"/>` +
    grid +
    covers +
    pile +
    `</svg>`
  )
}
