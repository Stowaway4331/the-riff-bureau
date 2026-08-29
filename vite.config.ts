import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * The WebGL spec restricts shader source to the GLSL ES character set and
 * requires compilation to fail on any character outside it, comments included.
 * A single typographic dash or curly quote in a comment is enough to break the
 * shader, and the only symptom is an opaque "Fragment shader is not compiled"
 * at runtime. Catch it at import time instead.
 *
 * Reads from disk rather than inspecting `code`, because by the time a `?raw`
 * import reaches transform it is a single-line JS string literal and every
 * reported line number would be 1.
 */
function assertAsciiShaders() {
  return {
    name: 'assert-ascii-shaders',
    enforce: 'pre' as const,
    transform(_code: string, id: string) {
      const file = id.split('?')[0]
      if (!/\.(glsl|vert|frag)$/.test(file)) return null

      const bad: string[] = []
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const hits = line.match(/[^\x00-\x7F]/g)
          if (hits) {
            const chars = [...new Set(hits)]
              .map((c) => `${c} (U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')})`)
              .join(', ')
            bad.push(`  line ${i + 1}: ${chars}\n    ${line.trim()}`)
          }
        })

      if (bad.length) {
        throw new Error(
          `Non-ASCII characters in ${file.split(/[\/]/).pop()}:\n${bad.join('\n')}\n\n` +
            'WebGL requires shader source to be pure ASCII, including comments.\n' +
            'Replace typographic dashes/quotes with ASCII equivalents.',
        )
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [assertAsciiShaders(), react()],
})
