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
import { useRef } from 'react'

import heroCube2000 from '../../assets/hero-cube-2000.webp'
import heroCube3840 from '../../assets/hero-cube-3840.webp'

/** Sparkle spots over the render: [left %, top %, delay s]. */
const SPARKLES: [number, number, number][] = [
  [30, 24, 0],
  [70, 20, 0.8],
  [22, 58, 1.4],
  [78, 46, 0.4],
  [60, 12, 1.9],
]

/**
 * The glass-cube hero render brought to life: it floats, the infinity mark
 * breathes, light sweeps across the glass, a spark rides the orbit and the
 * stars twinkle. With a mouse, the cube tilts toward the pointer.
 */
export function HeroCube() {
  const artRef = useRef<HTMLDivElement>(null)

  const tilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !artRef.current) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    artRef.current.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`
  }

  return (
    <div
      className='qg-visual'
      aria-hidden='true'
      onPointerMove={tilt}
      onPointerLeave={() => {
        if (artRef.current) artRef.current.style.transform = ''
      }}
    >
      <div ref={artRef} className='qg-art'>
        <div className='qg-art-float'>
          <img
            src={heroCube2000}
            srcSet={`${heroCube2000} 2400w, ${heroCube3840} 3840w`}
            sizes='(min-width: 1024px) 3840px, 110vw'
            width={2400}
            height={1350}
            alt=''
            fetchPriority='high'
            decoding='async'
          />
          <span className='qg-art-glow' />
          <span className='qg-art-sweep' />
        </div>
        <span className='qg-art-orb' />
        {SPARKLES.map(([left, top, delay]) => (
          <span
            key={`${left}-${top}`}
            className='qg-art-spark'
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  )
}
