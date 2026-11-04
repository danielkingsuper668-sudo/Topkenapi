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
import { ArrowRight, Check } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'

const PIECE = 52
const TOLERANCE = 6

function randomTarget(trackWidth: number) {
  const min = trackWidth * 0.4
  const max = trackWidth - PIECE - 8
  return Math.round(min + Math.random() * (max - min))
}

/**
 * Slide-to-fit puzzle shown before sign-in and sign-up. It is a visual
 * speed bump only; the server-side bot check is Cloudflare Turnstile.
 */
function SliderPuzzle(props: { onPass: () => void }) {
  const { t } = useTranslation()
  const trackRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<{ x: number; left: number } | null>(null)
  const [left, setLeft] = useState(0)
  const [target, setTarget] = useState<number | null>(null)
  const [state, setState] = useState<'idle' | 'fail' | 'ok'>('idle')

  const width = () => trackRef.current?.clientWidth ?? 300
  useLayoutEffect(() => {
    setTarget(randomTarget(trackRef.current?.clientWidth ?? 300))
  }, [])
  const goal = target ?? 0

  const onDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (state === 'ok') return
    event.currentTarget.setPointerCapture(event.pointerId)
    startRef.current = { x: event.clientX, left }
    setState('idle')
  }
  const onMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!startRef.current) return
    const next = startRef.current.left + event.clientX - startRef.current.x
    setLeft(Math.min(Math.max(next, 0), width() - PIECE))
  }
  const onUp = () => {
    if (!startRef.current) return
    startRef.current = null
    if (Math.abs(left - goal) <= TOLERANCE) {
      setState('ok')
      window.setTimeout(props.onPass, 450)
      return
    }
    setState('fail')
    window.setTimeout(() => {
      setLeft(0)
      setTarget(randomTarget(width()))
      setState('idle')
    }, 500)
  }

  return (
    <div className='tk-slide' data-state={state}>
      <div className='tk-slide-pic' ref={trackRef}>
        <span className='tk-slide-hole' style={{ left: goal }} />
        <span className='tk-slide-piece' style={{ left }} />
      </div>
      <div className='tk-slide-track'>
        <span className='tk-slide-fill' style={{ width: left + PIECE / 2 }} />
        <span className='tk-slide-hint'>
          {state === 'ok' ? t('Verified') : t('Slide to fit the piece')}
        </span>
        <button
          type='button'
          className='tk-slide-knob'
          style={{ left }}
          aria-label={t('Slide to fit the piece')}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {state === 'ok' ? (
            <Check size={18} aria-hidden='true' />
          ) : (
            <ArrowRight size={18} aria-hidden='true' />
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Wraps a submit action: the first call opens the puzzle, and the action
 * runs once the puzzle is solved. Later calls on the same page run directly.
 */
export function useSliderCheck() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const passedRef = useRef(false)
  const pendingRef = useRef<(() => void) | null>(null)

  const gate = (action: () => void) => {
    if (passedRef.current) {
      action()
      return
    }
    pendingRef.current = action
    setOpen(true)
  }

  const dialog = (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={t('Security check')}
      description={t('Drag the slider so the piece fits the gap')}
      contentClassName='tk-slide-dialog sm:max-w-md'
    >
      {open && (
        <SliderPuzzle
          onPass={() => {
            passedRef.current = true
            setOpen(false)
            pendingRef.current?.()
            pendingRef.current = null
          }}
        />
      )}
    </Dialog>
  )

  return { gate, dialog }
}
