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
import { useTranslation } from 'react-i18next'

/** Scrolling announcement strip shown above the console header. */
export function TopkenMarquee() {
  const { t } = useTranslation()
  const messages = [
    t('Topkenapi guarantees 100% official models, never modified'),
    t('One API for OpenAI · Claude · Gemini · DeepSeek · Qwen'),
    t('24/7 support: WeChat · Zalo · Telegram · Instagram'),
  ]

  return (
    <div className='tk-mq' role='note' aria-label={t('Announcements')}>
      <div className='tk-mq-in'>
        {[0, 1].map((copy) =>
          messages.map((message) => (
            <span key={`${copy}-${message}`} aria-hidden={copy === 1}>
              ✦ {message}
            </span>
          ))
        )}
      </div>
    </div>
  )
}
