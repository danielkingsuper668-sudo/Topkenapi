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
import { ExternalLink, MessageCircle, Send } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { cn } from '@/lib/utils'

type SupportChannel = {
  name: string
  value: string
  href?: string
  color: string
  icon: React.ReactNode
}

const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    name: 'WeChat',
    value: '19866980020',
    color: '#07c160',
    icon: <MessageCircle size={19} aria-hidden='true' />,
  },
  {
    name: 'Telegram',
    value: '@topkenx',
    href: 'https://t.me/topkenx',
    color: '#229ed9',
    icon: <Send size={18} aria-hidden='true' />,
  },
  {
    name: 'Zalo',
    value: '0816981777',
    href: 'https://zalo.me/0816981777',
    color: '#0068ff',
    icon: <b className='tk-cic-letter'>Z</b>,
  },
]

/** WeChat / Zalo / Telegram rows with copy and open actions. */
export function SupportChannelList() {
  const { t } = useTranslation()
  return (
    <div className='tk-clist'>
      {SUPPORT_CHANNELS.map((channel) => (
        <div className='tk-crow' key={channel.name}>
          <span className='tk-cic' style={{ background: channel.color }}>
            {channel.icon}
          </span>
          <div className='tk-ctx'>
            <b>{channel.name}</b>
            <span>{channel.value}</span>
          </div>
          <CopyButton
            value={channel.value}
            variant='outline'
            className='tk-sq'
            aria-label={`${t('Copy')} ${channel.name}`}
          />
          {channel.href && (
            <a
              className='tk-sq tk-sq-link'
              href={channel.href}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={`${t('Open')} ${channel.name}`}
            >
              <ExternalLink size={15} aria-hidden='true' />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

/** "Contact support" card used on the overview page. */
export function SupportContactCard() {
  const { t } = useTranslation()
  return (
    <section className='tk-panel tk-ct' aria-labelledby='tk-ct-title'>
      <h3 id='tk-ct-title'>{t('Contact support')}</h3>
      <p className='tk-ct-sub'>
        {t('Online 24/7, reach us on your favourite app')}
      </p>
      <SupportChannelList />
    </section>
  )
}

const FAB_SIZE = 54
const FAB_MARGIN = 16
const FAB_STORAGE_KEY = 'tk-fab'

type FabPosition = { side: 'left' | 'right'; y: number | null }

function readSavedFabPosition(): FabPosition {
  try {
    const saved = JSON.parse(localStorage.getItem(FAB_STORAGE_KEY) ?? 'null')
    if (saved && (saved.side === 'left' || saved.side === 'right')) {
      return { side: saved.side, y: typeof saved.y === 'number' ? saved.y : null }
    }
  } catch {
    // Storage can be unavailable (private mode); fall back to the default spot.
  }
  return { side: 'right', y: null }
}

/**
 * Floating contact button: tap to open the support panel, hold and drag to
 * move it; it snaps to the nearest side and remembers its place.
 */
export function SupportFab() {
  const { t } = useTranslation()
  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    x: number
    y: number
    left: number
    top: number
    moved: boolean
  } | null>(null)
  const [position, setPosition] = useState<FabPosition>(readSavedFabPosition)
  const [open, setOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [, forceLayout] = useState(0)
  // Animate moves only after the first placement, so a page change never
  // shows the button sliding in from the top-left corner.
  const [ready, setReady] = useState(false)

  const placeFab = useCallback(() => {
    const fab = fabRef.current
    if (!fab) return
    const maxY = window.innerHeight - FAB_SIZE - FAB_MARGIN
    const y =
      position.y == null
        ? maxY - 20
        : Math.min(Math.max(position.y, FAB_MARGIN + 56), maxY)
    fab.style.left = `${position.side === 'left' ? FAB_MARGIN : window.innerWidth - FAB_SIZE - FAB_MARGIN}px`
    fab.style.top = `${y}px`
  }, [position])

  const placePanel = useCallback(() => {
    const fab = fabRef.current
    const panel = panelRef.current
    if (!fab || !panel) return
    const rect = fab.getBoundingClientRect()
    const width = panel.offsetWidth
    const height = panel.offsetHeight
    let x = position.side === 'left' ? rect.left : rect.right - width
    x = Math.min(Math.max(x, FAB_MARGIN), window.innerWidth - width - FAB_MARGIN)
    let y = rect.top - height - 10
    if (y < FAB_MARGIN) {
      y = Math.min(rect.bottom + 10, window.innerHeight - height - FAB_MARGIN)
    }
    panel.style.left = `${x}px`
    panel.style.top = `${Math.max(FAB_MARGIN, y)}px`
  }, [position.side])

  useLayoutEffect(() => {
    placeFab()
    if (open) placePanel()
  })

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const onResize = () => forceLayout((n) => n + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDocPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (fabRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDocPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDocPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    const onOpenRequest = () => setOpen(true)
    window.addEventListener('tk:open-support', onOpenRequest)
    return () => window.removeEventListener('tk:open-support', onOpenRequest)
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const fab = event.currentTarget
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      left: fab.offsetLeft,
      top: fab.offsetTop,
      moved: false,
    }
    fab.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < 6) return
    if (!drag.moved) {
      drag.moved = true
      setDragging(true)
      setOpen(false)
    }
    const fab = event.currentTarget
    fab.style.left = `${Math.min(Math.max(drag.left + dx, 4), window.innerWidth - FAB_SIZE - 4)}px`
    fab.style.top = `${Math.min(Math.max(drag.top + dy, 4), window.innerHeight - FAB_SIZE - 4)}px`
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    setDragging(false)
    if (!drag.moved) {
      setOpen((value) => !value)
      return
    }
    const fab = event.currentTarget
    const next: FabPosition = {
      side:
        fab.offsetLeft + FAB_SIZE / 2 < window.innerWidth / 2 ? 'left' : 'right',
      y: fab.offsetTop,
    }
    try {
      localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Position just won't be remembered.
    }
    setPosition(next)
  }

  return (
    <>
      <button
        ref={fabRef}
        type='button'
        className={cn('tk-fab', ready && 'is-ready', dragging && 'is-drag')}
        aria-expanded={open}
        aria-controls='tk-fab-panel'
        aria-label={t('Contact support')}
        title={t('Hold and drag to move')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragRef.current = null
          setDragging(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen((value) => !value)
          }
        }}
      >
        <MessageCircle size={24} aria-hidden='true' />
      </button>
      <div
        ref={panelRef}
        id='tk-fab-panel'
        className='tk-fabp'
        role='dialog'
        aria-label={t('Contact support')}
        hidden={!open}
      >
        <div className='tk-fabp-hd'>
          <b>{t('Contact support')}</b>
          <span>{t('Online 24/7, reach us on your favourite app')}</span>
        </div>
        <SupportChannelList />
        <p className='tk-hint'>{t('Hold and drag to move')}</p>
      </div>
    </>
  )
}
