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
import { Claude, DeepSeek, Gemini, OpenAI, Qwen } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Coins,
  Headphones,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'

import { DocsLink, QuantumHeader } from './quantum-header'
import { QuantumPromptBox } from './quantum-prompt-box'
import heroCube2000 from '../../assets/hero-cube-2000.webp'
import heroCube3840 from '../../assets/hero-cube-3840.webp'

import './quantum-landing.css'

// Brand: "topken" (cream) + "api" (champagne gold)
const BRAND_MAIN = 'Topken'
const BRAND_ACCENT = 'api'
const BRAND = `${BRAND_MAIN}${BRAND_ACCENT}`

// Translation keys (English = key). Sub-labels stay English like the mockup.
const HIGHLIGHTS = [
  { icon: Zap, titleKey: 'Blazing fast', sub: 'Ultra Fast' },
  { icon: ShieldCheck, titleKey: 'High stability', sub: 'High Uptime' },
  { icon: Coins, titleKey: 'Optimized cost', sub: 'Cost Effective' },
  { icon: Settings, titleKey: 'Easy integration', sub: 'Easy Integration' },
  { icon: Headphones, titleKey: 'Round-the-clock support', sub: '24/7 Support' },
]

const MODELS = [
  { name: 'OpenAI', icon: <OpenAI size={30} /> },
  { name: 'Claude', icon: <Claude.Color size={30} /> },
  { name: 'Gemini', icon: <Gemini.Color size={30} /> },
  { name: 'DeepSeek', icon: <DeepSeek.Color size={30} /> },
  { name: 'Qwen', icon: <Qwen.Color size={30} /> },
]

const REASONS = [
  {
    icon: Rocket,
    titleKey: 'Outstanding performance',
    descKey: 'Smooth, high-speed AI experience',
  },
  {
    icon: ShieldCheck,
    titleKey: 'Strong security',
    descKey: 'Safe and reliable data protection',
  },
  {
    icon: TrendingUp,
    titleKey: 'Flexible & scalable',
    descKey: 'Scale easily as you grow',
  },
  {
    icon: Headphones,
    titleKey: 'Professional support',
    descKey: 'With you around the clock',
  },
]

interface QuantumLandingProps {
  isAuthenticated?: boolean
}

export function QuantumLanding(props: QuantumLandingProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  return (
    <div className='qn'>
      <QuantumHeader
        brandMain={BRAND_MAIN}
        brandAccent={BRAND_ACCENT}
        docsUrl={docsUrl}
        isAuthenticated={props.isAuthenticated}
      />

      <main>
        <section className='qn-hero'>
          <div className='qn-wrap qn-hero-grid'>
            <div>
              <span className='qn-pill qn-fade'>
                <Sparkles aria-hidden='true' />
                {t('Next-generation AI API platform')}
              </span>
              <h1 className='qn-title qn-fade qn-d1'>
                {BRAND_MAIN}
                <span className='qn-gold-text'>{BRAND_ACCENT}</span>
              </h1>
              <p className='qn-sub qn-fade qn-d2'>
                {t('Connect every AI,')} <span>{t('with just one API')}</span>
              </p>
              <p className='qn-desc qn-fade qn-d3'>
                {t(
                  'Experience the power of OpenAI, Claude, Gemini, DeepSeek, Qwen and many other AI models with outstanding performance and optimized costs.'
                )}
              </p>
              <div className='qn-fade qn-d4'>
                <QuantumPromptBox isAuthenticated={props.isAuthenticated} />
              </div>
              <div className='qn-cta qn-fade qn-d4'>
                <Link
                  to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
                  className='qn-btn qn-btn-gold'
                >
                  <Rocket aria-hidden='true' />
                  {props.isAuthenticated
                    ? t('Go to Dashboard')
                    : t('Get started now')}
                  <ArrowRight aria-hidden='true' />
                </Link>
                <DocsLink href={docsUrl} className='qn-btn qn-btn-ghost'>
                  <BookOpen aria-hidden='true' />
                  {t('Docs')}
                  <ArrowRight aria-hidden='true' />
                </DocsLink>
              </div>
            </div>

            <div className='qn-visual qn-visual-img qn-fade qn-d3' aria-hidden='true'>
              <img
                className='qn-hero-img'
                src={heroCube2000}
                srcSet={`${heroCube2000} 2000w, ${heroCube3840} 3840w`}
                sizes='(min-width: 1024px) 60vw, 116vw'
                width={3840}
                height={2576}
                alt=''
                fetchPriority='high'
                decoding='async'
              />
            </div>
          </div>

          <div className='qn-wrap'>
            <div className='qn-highlights'>
              {HIGHLIGHTS.map((item) => (
                <div className='qn-hl' key={item.titleKey}>
                  <item.icon aria-hidden='true' />
                  <div>
                    <b>{t(item.titleKey)}</b>
                    <span>{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className='qn-models'>
              {MODELS.map((m) => (
                <div className='qn-model' key={m.name}>
                  <span className='qn-model-icon'>{m.icon}</span>
                  {m.name}
                </div>
              ))}
              <div className='qn-model'>
                <Link to='/pricing' className='qn-more'>
                  {t('and many more…')}
                  <ChevronRight size={16} aria-hidden='true' />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className='qn-why'>
          <div className='qn-wrap'>
            <div className='qn-why-head'>
              <h2>
                <Trans
                  i18nKey='Why choose <1>{{brand}}</1>?'
                  values={{ brand: BRAND }}
                  components={{ 1: <em /> }}
                />
              </h2>
            </div>
            <p className='qn-why-sub'>{t('Why Choose Us?')}</p>
            <div className='qn-cards'>
              {REASONS.map((item) => (
                <div className='qn-card' key={item.titleKey}>
                  <item.icon aria-hidden='true' />
                  <div>
                    <h3>{t(item.titleKey)}</h3>
                    <p>{t(item.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className='qn-footer'>
        <div className='qn-wrap'>
          <span>
            © {new Date().getFullYear()} {BRAND}
          </span>
          <span className='qn-footer-links'>
            <Link to='/pricing'>{t('Pricing')}</Link>
            <DocsLink href={docsUrl}>{t('Docs')}</DocsLink>
            <Link to='/about'>{t('Support')}</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
