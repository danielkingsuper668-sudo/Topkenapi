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
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { RichContent } from '@/components/rich-content'
import { BRAND_NAME } from '@/components/topken/brand'
import { Button } from '@/components/ui/button'
import { useAnnouncements } from '@/features/dashboard/hooks/use-status-data'
import type { AnnouncementItem } from '@/features/dashboard/types'

const SEEN_STORAGE_KEY = 'tk-ann-seen'

/** One popup per full page load, even if the console layout remounts. */
let shownThisPageLoad = false

/** Identity of an announcement; editing its content makes it new again. */
function announcementKey(item: AnnouncementItem): string {
  return `${item.id ?? ''}|${item.publishDate ?? ''}|${item.content.length}|${item.content.slice(0, 40)}`
}

function readSeenKeys(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(SEEN_STORAGE_KEY) ?? '[]'
    )
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function saveSeenKeys(keys: string[]) {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(keys.slice(-50)))
  } catch {
    // Not remembered: the notice may show again next time.
  }
}

/**
 * Login notices: each page load shows the next announcement (set in
 * System settings → Announcements) the visitor has not seen yet. Once all
 * are seen, or after "Don't show again", nothing pops up until a new one is
 * published.
 */
export function AnnouncementPopup() {
  const { t } = useTranslation()
  const { items, loading } = useAnnouncements()
  const [current, setCurrent] = useState<AnnouncementItem | null>(null)

  useEffect(() => {
    if (loading || shownThisPageLoad || items.length === 0) return
    const seen = readSeenKeys()
    const next = items.find(
      (item) => item.content && !seen.includes(announcementKey(item))
    )
    if (!next) return
    shownThisPageLoad = true
    saveSeenKeys([...seen, announcementKey(next)])
    setCurrent(next)
  }, [items, loading])

  const dontShowAgain = () => {
    const seen = readSeenKeys()
    const all = items.map(announcementKey).filter((key) => !seen.includes(key))
    saveSeenKeys([...seen, ...all])
    setCurrent(null)
  }

  return (
    <Dialog
      open={current !== null}
      onOpenChange={(open) => {
        if (!open) setCurrent(null)
      }}
      title={t('Notice from {{brand}}', { brand: BRAND_NAME })}
      titleClassName='tk-ann-eyebrow'
      contentClassName='tk-ann sm:max-w-xl'
      footerClassName='tk-ann-foot'
      footer={
        <>
          <Button
            variant='ghost'
            className='tk-ann-skip'
            onClick={dontShowAgain}
          >
            {t("Don't show again")}
          </Button>
          <Button
            variant='outline'
            render={<Link to='/pricing' />}
            onClick={() => setCurrent(null)}
          >
            {t('View pricing')}
          </Button>
          <Button
            render={<Link to='/dashboard/$section' params={{ section: 'setup' }} />}
            onClick={() => setCurrent(null)}
          >
            {t('Start now')}
            <ArrowRight aria-hidden='true' />
          </Button>
        </>
      }
    >
      {current && (
        <RichContent breaks content={current.content} className='tk-ann-body' />
      )}
    </Dialog>
  )
}
