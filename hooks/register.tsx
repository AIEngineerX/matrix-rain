import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { scene } from './scene'

const SCENE_NAME = 'matrix-rain'
// The pile grows in steps, so the scene is redrawn only when the fill moves this far.
const STEP = 2

const fill = atom({ plugin: 'matrix-rain', key: 'fill' } as const, 0)

// Phosphor green on near-black: a look made for the dark alone.
const { theme, problems } = makeColors({
  label: 'Matrix rain',
  only: 'dark',
  roles: { accent: '#22c55e', danger: '#e5484d', success: '#4ade80', warning: '#d9a514', pro: '#2dd4bf' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#030a06',
        'surface-1': '#07120b',
        'surface-2': '#0b1a10',
        'surface-3': '#0e2015',
        'text-primary': '#d6ffe0',
        'text-secondary': '#9be3ad',
        'text-muted': '#74b987',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 4, tint: '#030a06', opacity: 0.7 } },
}

/** Reads how full the context window is and keeps it, in steps; a fresh or just-compacted window reads empty. */
async function measure($: EngineInterface): Promise<void> {
  const { context } = await $.session.usage()
  const stepped = Math.min(100, Math.round((context.percent ?? 0) / STEP) * STEP)

  await update($, fill, () => stepped)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await measure($)
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  // Each block of a reply passes here, after the response that the fill is measured from.
  on('session.append', { door: 'response' }, async ($, e, next) => {
    // A reply is never held back for the pile: a failed reading leaves the last one standing.
    await measure($).catch(error => $.ui.log(String(error)))

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.scene !== SCENE_NAME || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const percent = await read($, fill)

    return (
      <Svg
        source={scene(percent)}
        alt={`Columns of green binary digits raining slowly, with a pile at the foot ${percent} percent of the way up`}
      />
    )
  })
}
