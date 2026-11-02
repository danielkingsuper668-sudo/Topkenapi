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
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Copy, KeyRound, Link2, Rocket, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SectionPageLayout } from '@/components/layout'
import { BRAND_NAME, getApiBase } from '@/components/topken/brand'
import { SetupGuide } from '@/components/topken/setup-guide'
import { fetchTokenKey, getApiKeys } from '@/features/keys/api'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { requireServerSuccess } from '@/lib/server-error-message'

const SUPPORT_LINKS = [
  { name: 'Zalo', value: '0816981777', href: 'https://zalo.me/0816981777' },
  { name: 'Telegram', value: '@TOPKENAPI', href: 'https://t.me/TOPKENAPI' },
  { name: 'WeChat', value: '19866980020', href: '' },
]

/** "API setup guide": your key, your address, and step-by-step tool setup. */
export function TopkenSetupPage() {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard({ notify: false })
  const apiBase = getApiBase()

  const keysQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'api-keys'],
    queryFn: async () => {
      const result = requireServerSuccess(await getApiKeys({ p: 1, size: 10 }))
      return result.success ? (result.data?.items ?? []) : []
    },
    staleTime: 60 * 1000,
  })
  const keys = keysQuery.data ?? []
  const key = keys.find((item) => item.status === 1) ?? keys[0] ?? null
  const maskedKey = key
    ? `sk-${String(key.key).slice(0, 4)}**********${String(key.key).slice(-4)}`
    : 'sk-...'

  const resolveKey = async (): Promise<string> => {
    if (!key?.id) return 'sk-...'
    const result = await fetchTokenKey(key.id)
    const value = result.success && result.data?.key ? result.data.key : ''
    if (!value) throw new Error('key unavailable')
    return `sk-${value}`
  }

  const copy = async (getText: () => Promise<string> | string) => {
    try {
      const copied = await copyToClipboard(await getText())
      if (copied) toast.success(t('Copied to clipboard'))
      else toast.error(t('Failed to copy to clipboard'))
    } catch {
      toast.error(t('Failed to copy to clipboard'))
    }
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('API setup guide')}</SectionPageLayout.Title>
      <SectionPageLayout.Content>
        <div className='tk-setup'>
          <header className='tk-setup-hero'>
            <div className='tk-eyebrow'>
              <Rocket size={15} aria-hidden='true' />
              {t('API setup guide')}
            </div>
            <h2>
              {t('Welcome to {{brand}}: pick how you work', {
                brand: BRAND_NAME,
              })}
            </h2>
            <p>
              {t(
                'One key works with every model: Claude, GPT, Gemini, DeepSeek, Grok and more. No need to change keys when you change models.'
              )}
            </p>
            <div className='tk-help'>
              <span>{t('Need help setting up? Message us:')}</span>
              <div className='tk-help-chips'>
                {SUPPORT_LINKS.map((item) =>
                  item.href ? (
                    <a
                      key={item.name}
                      data-brand={item.name}
                      className='tk-help-chip'
                      href={item.href}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <span>{item.name}</span> {item.value}
                    </a>
                  ) : (
                    <button
                      key={item.name}
                      type='button'
                      data-brand={item.name}
                      className='tk-help-chip'
                      style={{ font: 'inherit' }}
                      onClick={() => copy(item.value)}
                    >
                      <span>{item.name}</span> {item.value}
                    </button>
                  )
                )}
              </div>
            </div>
          </header>

          <section className='tk-panel tk-keycard' aria-labelledby='tk-key-title'>
            <div className='tk-keycard-h'>
              <span className='tk-sic'>
                <KeyRound size={20} aria-hidden='true' />
              </span>
              <b id='tk-key-title'>{t('Your key')}</b>
            </div>
            <p>
              {key
                ? t('This key works with every model you have access to.')
                : t('You have no API key yet. Create one to get started.')}
            </p>
            <div className='tk-keyrow'>
              <div className='tk-keyval'>
                <KeyRound size={16} aria-hidden='true' />
                <span>{maskedKey}</span>
              </div>
              {key ? (
                <button
                  type='button'
                  className='tk-btn tk-copy-key'
                  onClick={() => copy(resolveKey)}
                >
                  <Copy size={15} aria-hidden='true' />
                  {t('Copy key')}
                </button>
              ) : (
                <Link to='/keys' className='tk-btn gold'>
                  <KeyRound size={15} aria-hidden='true' />
                  {t('Create an API key')}
                </Link>
              )}
            </div>
            <div className='tk-keyrow'>
              <div className='tk-keyval'>
                <Link2 size={16} aria-hidden='true' />
                <span>{apiBase}</span>
              </div>
              <button
                type='button'
                className='tk-btn tk-copy-addr'
                onClick={() => copy(apiBase)}
              >
                <Copy size={15} aria-hidden='true' />
                {t('Copy address')}
              </button>
            </div>
          </section>

          <section aria-labelledby='tk-where-title' className='tk-page'>
            <div className='tk-section-h'>
              <span className='tk-sic'>
                <Target size={20} aria-hidden='true' />
              </span>
              <div>
                <b id='tk-where-title'>{t('Where will you use it?')}</b>
                <span>
                  {t('Pick the place you work; we show only the steps for it.')}
                </span>
              </div>
            </div>
            <SetupGuide
              apiBase={apiBase}
              displayKey={maskedKey}
              resolveKey={key ? resolveKey : undefined}
            />
          </section>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
