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
import { ArrowLeft, Headphones, ShieldCheck, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/language-switcher'
import { BRAND_ACCENT, BRAND_MAIN } from '@/components/topken/brand'
import { TopkenBrand } from '@/components/topken/topken-brand'
import { useConsoleTheme } from '@/components/topken/use-console-theme'
import heroCube2000 from '@/features/home/assets/hero-cube-2000.webp'

import '@/components/topken/console-skin.css'
import '@/components/topken/topken.css'
import './auth-layout.css'

// Same language list as the landing header, so the choice carries over.
const AUTH_LANGUAGES = ['zhCN', 'en', 'vi', 'ru', 'fr', 'ko', 'ja'] as const

type AuthLayoutProps = {
  children: React.ReactNode
}

/**
 * Sign-in / sign-up shell: glass form card over the black-gold backdrop.
 * Phones get a slim cube banner above the card; wide screens show the cube
 * and three promises beside the card.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  useConsoleTheme()

  const promises = [
    {
      icon: ShieldCheck,
      title: t('Real models'),
      sub: t('Exactly the model you call — never swapped or diluted'),
    },
    {
      icon: Wallet,
      title: t('Flexible pricing'),
      sub: t('Pay only for what you use'),
    },
    {
      icon: Headphones,
      title: t('24/7 support'),
      sub: 'WeChat · Telegram · Zalo',
    },
  ]

  return (
    <div className='tk-auth'>
      <header className='tk-auth-bar'>
        <TopkenBrand markWidth={36} className='tk-auth-brand' />
        <div className='tk-auth-actions'>
          <LanguageSwitcher variant='compact' codes={AUTH_LANGUAGES} />
          <Link to='/' className='tk-auth-back' aria-label={t('Back to Home')}>
            <ArrowLeft size={15} aria-hidden='true' />
            <span className='tk-auth-back-label'>{t('Back to Home')}</span>
          </Link>
        </div>
      </header>

      <main className='tk-auth-main'>
        <section className='tk-auth-side'>
          <div className='tk-auth-art' aria-hidden='true'>
            <img src={heroCube2000} alt='' width={2400} height={1350} />
          </div>
          <div className='tk-auth-pitch'>
            <p className='tk-auth-title'>
              {BRAND_MAIN}
              <em>{BRAND_ACCENT}</em>
            </p>
            <p className='tk-auth-sub'>
              {t('Connect every AI,')} <span>{t('with just one API')}</span>
            </p>
            <ul className='tk-auth-list'>
              {promises.map((item) => (
                <li key={item.title}>
                  <item.icon size={18} aria-hidden='true' />
                  <div>
                    <b>{item.title}</b>
                    <span>{item.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='tk-auth-card'>{children}</section>
      </main>

      <p className='tk-attr tk-auth-attr'>
        {t('Powered by')}{' '}
        <a
          href='https://github.com/QuantumNous/new-api'
          target='_blank'
          rel='noopener noreferrer'
        >
          New API
        </a>{' '}
        © QuantumNous · AGPLv3
      </p>
    </div>
  )
}
