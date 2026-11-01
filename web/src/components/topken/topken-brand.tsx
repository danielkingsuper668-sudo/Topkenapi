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
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

/** Purple infinity mark from /topkenapi-logo.png (480×244). */
export function TopkenMark(props: { width?: number }) {
  const width = props.width ?? 30
  return (
    <svg
      width={width}
      height={(width * 244) / 480}
      viewBox='0 0 480 244'
      aria-hidden='true'
    >
      <image href='/topkenapi-logo.png' width='480' height='244' />
    </svg>
  )
}

/** "Topken" + gold "api" wordmark, linking home. */
export function TopkenBrand(props: { className?: string; markWidth?: number }) {
  const { t } = useTranslation()
  return (
    <Link
      to='/'
      aria-label={t('Go to home')}
      className={cn('tk-brand', props.className)}
    >
      <TopkenMark width={props.markWidth} />
      <span>
        Topken<em>api</em>
      </span>
    </Link>
  )
}
