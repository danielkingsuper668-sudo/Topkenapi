/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useState } from 'react'

export type ConsolePalette = 'bronze' | 'navy'

const PALETTE_STORAGE_KEY = 'tk-palette'

function readPalette(): ConsolePalette {
  try {
    return localStorage.getItem(PALETTE_STORAGE_KEY) === 'navy'
      ? 'navy'
      : 'bronze'
  } catch {
    return 'bronze'
  }
}

/**
 * Turns on the console skin while the calling layout is mounted (the
 * landing page keeps its own colours) and applies the saved palette:
 * bronze + circuit (default) or grey violet.
 */
export function useConsoleTheme() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('tk-violet')
    root.classList.toggle('tk-navy', readPalette() === 'navy')
    return () => root.classList.remove('tk-violet', 'tk-navy')
  }, [])
}

/** Header control state for switching between the two console palettes. */
export function useConsolePalette() {
  const [palette, setPalette] = useState<ConsolePalette>(readPalette)

  const choose = (next: ConsolePalette) => {
    setPalette(next)
    document.documentElement.classList.toggle('tk-navy', next === 'navy')
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, next)
    } catch {
      // Not remembered: the default palette returns next visit.
    }
  }

  return { palette, choose }
}
