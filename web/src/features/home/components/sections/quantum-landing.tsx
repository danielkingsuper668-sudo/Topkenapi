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
import {
  ArrowRight,
  Boxes,
  ChevronRight,
  Coins,
  Headphones,
  KeyRound,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { BRAND_ACCENT, BRAND_MAIN, BRAND_NAME } from '@/components/topken/brand'
import { MODEL_MAKERS } from '@/components/topken/model-makers'
import { getLobeIcon } from '@/lib/lobe-icon'
import {
  SupportChannelList,
  SupportFab,
} from '@/components/topken/support-contact'

import { HeroCube } from './hero-cube'
import { QuantumHeader } from './quantum-header'

import '@/components/topken/topken.css'
import './quantum-landing.css'


/** Switches the page tokens to black-brown + champagne gold while mounted. */
function useGoldTheme() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('tk-gold')
    return () => root.classList.remove('tk-gold')
  }, [])
}

interface QuantumLandingProps {
  isAuthenticated?: boolean
}

export function QuantumLanding(props: QuantumLandingProps) {
  const { t } = useTranslation()
  useGoldTheme()
  const docsUrl = '/docs'

  const highlights = [
    { icon: Zap, title: t('Fast'), sub: t('Streaming, fast first token') },
    {
      icon: ShieldCheck,
      title: t('Reliable'),
      sub: t('Automatic retries across channels'),
    },
    { icon: Coins, title: t('Flexible pricing'), sub: t('Pay only for what you use') },
    { icon: Layers, title: t('Easy setup'), sub: 'Claude Code · Codex' },
    {
      icon: Headphones,
      title: t('24/7 support'),
      sub: 'WeChat · Telegram · Zalo',
    },
  ]

  const reasons = [
    {
      icon: ShieldCheck,
      title: t('Real models'),
      body: t('Exactly the model you call — never swapped or diluted'),
    },
    {
      icon: KeyRound,
      title: t('Key control'),
      body: t('Set limits and models per key, disable any time'),
    },
    {
      icon: TrendingUp,
      title: t('Clear usage'),
      body: t('Every call logged, costs visible in real time'),
    },
    {
      icon: UserRound,
      title: t('Real people'),
      body: t('Support in Chinese, Vietnamese and English'),
    },
  ]

  return (
    <div className='qn qg'>
      <QuantumHeader
        brandMain={BRAND_MAIN}
        brandAccent={BRAND_ACCENT}
        docsUrl={docsUrl}
        isAuthenticated={props.isAuthenticated}
      />

      <main>
        <section className='qg-hero'>
          <div className='qn-wrap qg-grid'>
            <div className='qg-text'>
              <Link
                to='/dashboard/$section'
                params={{ section: 'setup' }}
                className='qg-pill'
              >
                <Sparkles size={16} aria-hidden='true' />
                {t('Next-generation AI API platform')}
                <ArrowRight size={15} aria-hidden='true' className='qg-pill-go' />
              </Link>
              <h1 className='qg-title'>
                {BRAND_MAIN}
                <span>{BRAND_ACCENT}</span>
              </h1>
              <p className='qg-sub'>
                {t('Connect every AI,')} <span>{t('with just one API')}</span>
              </p>
              <p className='qg-desc'>
                {t(
                  'One key for OpenAI, Claude, Gemini, DeepSeek, Qwen and more. OpenAI-compatible: change one URL and go. Pay only for what you use.'
                )}
              </p>
              <div className='qg-cta'>
                <Link
                  to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
                  className='qg-btn qg-gold qg-lg'
                >
                  <Rocket size={17} aria-hidden='true' />
                  {props.isAuthenticated ? t('Go to Dashboard') : t('Sign up free')}
                  <ArrowRight size={16} aria-hidden='true' />
                </Link>
                <Link to='/pricing' className='qg-btn qg-ghost qg-lg'>
                  <Boxes size={17} aria-hidden='true' />
                  {t('View models & pricing')}
                  <ArrowRight size={16} aria-hidden='true' />
                </Link>
              </div>
            </div>
            <HeroCube />
          </div>

          <div className='qn-wrap'>
            <div className='qg-hls'>
              {highlights.map((item) => (
                <div className='qg-hl' key={item.title}>
                  <item.icon size={26} strokeWidth={1.5} aria-hidden='true' />
                  <div>
                    <b>{item.title}</b>
                    <span>{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className='qg-models'>
              {MODEL_MAKERS.map((item) => (
                <div className='qg-model' key={item.name}>
                  <span className='qg-model-ic'>{getLobeIcon(item.icon, 26)}</span>
                  {item.name}
                </div>
              ))}
              <Link to='/pricing' className='qg-model qg-more'>
                {t('More models')}
                <ChevronRight size={15} aria-hidden='true' />
              </Link>
            </div>
          </div>
        </section>

        <section className='qg-sec'>
          <div className='qn-wrap'>
            <div className='qg-sh'>
              <h2>
                <Trans
                  i18nKey='Why choose <1>{{brand}}</1>?'
                  values={{ brand: BRAND_NAME }}
                  components={{ 1: <em /> }}
                />
              </h2>
            </div>
            <p className='qg-shs'>Why Choose Us?</p>
            <div className='qg-cards'>
              {reasons.map((item) => (
                <div className='qg-card' key={item.title}>
                  <item.icon size={30} strokeWidth={1.4} aria-hidden='true' />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='qg-sec qg-contact' id='contact'>
          <div className='qn-wrap'>
            <div className='qg-sh'>
              <h2>{t('Contact us')}</h2>
            </div>
            <p className='qg-shs'>
              {t('Online 24/7, reach us on your favourite app')}
            </p>
            <SupportChannelList />
          </div>
        </section>
      </main>

      <footer className='qg-footer'>
        <div className='qn-wrap'>
          <span className='qg-attr'>
            {t('Powered by')}{' '}
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
            >
              New API
            </a>{' '}
            © QuantumNous · AGPLv3
          </span>
        </div>
      </footer>

      <SupportFab />
    </div>
  )
}
