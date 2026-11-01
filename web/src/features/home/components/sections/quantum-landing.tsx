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
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Copy,
  Headphones,
  Layers,
  MousePointerClick,
  Wallet,
  Zap,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  BRAND_ACCENT,
  BRAND_MAIN,
  BRAND_NAME,
  getApiBase,
} from '@/components/topken/brand'
import { SetupGuide } from '@/components/topken/setup-guide'
import { TopkenMarquee } from '@/components/topken/topken-marquee'
import { ModelCard } from '@/features/pricing/components/model-card'
import { usePricingData } from '@/features/pricing/hooks/use-pricing-data'
import type { PricingModel } from '@/features/pricing/types'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useStatus } from '@/hooks/use-status'
import { getLobeIcon } from '@/lib/lobe-icon'

import { DocsLink, QuantumHeader } from './quantum-header'

import '@/components/topken/topken.css'
import './quantum-landing.css'

const SUPPORTED_MODELS = [
  { name: 'Claude', icon: <Claude.Color size={22} /> },
  { name: 'GPT', icon: <OpenAI size={22} /> },
  { name: 'Gemini', icon: <Gemini.Color size={22} /> },
  { name: 'Grok', icon: getLobeIcon('Grok', 22) },
  { name: 'DeepSeek', icon: <DeepSeek.Color size={22} /> },
  { name: 'Qwen', icon: <Qwen.Color size={22} /> },
]

/** One featured model per family, in this order, when it exists. */
const FEATURED_PATTERNS = [/claude/i, /gpt/i, /gemini/i, /deepseek/i, /grok/i]

interface QuantumLandingProps {
  isAuthenticated?: boolean
}

export function QuantumLanding(props: QuantumLandingProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { status } = useStatus()
  const { copyToClipboard } = useCopyToClipboard({ notify: false })
  const pricing = usePricingData()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'
  const apiBase = getApiBase()

  const featured = useMemo(() => {
    const picked: PricingModel[] = []
    for (const pattern of FEATURED_PATTERNS) {
      const model = pricing.models.find(
        (item) => pattern.test(item.model_name) && !picked.includes(item)
      )
      if (model) picked.push(model)
      if (picked.length === 3) break
    }
    return picked
  }, [pricing.models])

  const copyBase = async () => {
    const copied = await copyToClipboard(`${apiBase}/v1`)
    if (copied) toast.success(t('Copied to clipboard'))
    else toast.error(t('Failed to copy to clipboard'))
  }

  const checks = [
    t('One account, many AI models'),
    t('Compatible with OpenAI & Anthropic'),
    t('Works with OpenCode, Claude Code, Codex'),
    t('Cost log for every request'),
  ]

  const basics = [
    {
      title: t('What is an API?'),
      body: t(
        'ChatGPT, Claude and Gemini are AI brains. An API is the key that lets the tools on your computer talk to them for you.'
      ),
    },
    {
      title: t('Just say what you need'),
      body: t(
        'Describe the job the way you would to a person and the AI does it. Any language works.'
      ),
    },
    {
      title: t('Pay only for what you use'),
      body: t(
        'No monthly fee. Top up any amount and every request is billed by the tokens it actually uses.'
      ),
    },
  ]

  const perks = [
    { icon: Zap, title: t('Quick'), sub: t('A few minutes to set up') },
    {
      icon: MousePointerClick,
      title: t('Copy & paste'),
      sub: t('No technical skills needed'),
    },
    { icon: Layers, title: t('Many AI models'), sub: 'Claude, GPT, Gemini…' },
    { icon: Wallet, title: t('Flexible top-up'), sub: t('Pay as you go') },
  ]

  return (
    <div className='qn qx'>
      <TopkenMarquee />
      <QuantumHeader
        brandMain={BRAND_MAIN}
        brandAccent={BRAND_ACCENT}
        docsUrl={docsUrl}
        isAuthenticated={props.isAuthenticated}
      />

      <main>
        <section className='qx-hero'>
          <div className='qn-wrap qx-hero-grid'>
            <div>
              <span className='qx-pill'>
                <i aria-hidden='true' />
                {t('AI API for everyone')}
              </span>
              <h1 className='qx-title'>
                {t('One key.')}
                <br />
                <span>{t('Every AI model.')}</span>
              </h1>
              <p className='qx-desc'>
                {t(
                  'No coding required. Copy your key into the tool you already use and just tell the AI what to do. One account for Claude, GPT, Gemini, Grok and DeepSeek; pay only for what you use.'
                )}
              </p>
              <div className='qx-cta'>
                <Link
                  to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
                  className='qx-btn qx-btn-light'
                >
                  {props.isAuthenticated
                    ? t('Go to Dashboard')
                    : t('Sign up free')}
                  <ArrowRight size={16} aria-hidden='true' />
                </Link>
                <Link to='/pricing' className='qx-btn qx-btn-dark'>
                  {t('See models & pricing')}
                </Link>
              </div>
              {!props.isAuthenticated && (
                <p className='qx-note'>
                  {t('Already have an account?')}{' '}
                  <Link to='/sign-in'>{t('Go to the dashboard')}</Link>
                </p>
              )}
              <button type='button' className='qx-base' onClick={copyBase}>
                <code>{apiBase}/v1</code>
                <Copy size={14} aria-hidden='true' />
                <span className='sr-only'>{t('Copy')}</span>
              </button>
              <p className='qx-compat'>
                {t('OpenAI-compatible · Anthropic via {{base}} · Streaming', {
                  base: apiBase,
                })}
              </p>
            </div>

            <div className='qx-term' aria-hidden='true'>
              <div className='qx-term-h'>
                <span className='qx-dots'>
                  <i />
                  <i />
                  <i />
                </span>
                <span className='qx-term-tag'>POST /v1/chat/completions</span>
              </div>
              <pre>
                <span className='c'>curl</span> {apiBase}/v1/chat/completions \
                {'\n'}  -H <span className='s'>"Authorization: Bearer $TOPKENX_API_KEY"</span> \
                {'\n'}  -H <span className='s'>"Content-Type: application/json"</span> \
                {'\n'}  -d <span className='s'>'{'{'}</span>
                {'\n'}    <span className='k'>"model"</span>: <span className='s'>"claude-sonnet-4-5"</span>,
                {'\n'}    <span className='k'>"messages"</span>: [
                {'\n'}      {'{'} <span className='k'>"role"</span>: <span className='s'>"user"</span>, <span className='k'>"content"</span>: <span className='s'>"Hello {BRAND_NAME}"</span> {'}'}
                {'\n'}    ]
                {'\n'}  <span className='s'>{'}'}'</span>
              </pre>
              <div className='qx-term-f'>
                <b>200 OK</b>
                <span>stream · SSE</span>
                <span>OpenAI-compatible</span>
              </div>
            </div>
          </div>
        </section>

        <div className='qx-checks'>
          <div className='qn-wrap qx-checks-in'>
            {checks.map((item) => (
              <span key={item}>
                <Check size={14} aria-hidden='true' />
                {item}
              </span>
            ))}
          </div>
        </div>

        <section className='qx-sec'>
          <div className='qn-wrap'>
            <p className='qx-eyebrow'>{t('New to APIs?')}</p>
            <h2 className='qx-h2'>{t('No coding skills? You can still use it')}</h2>
            <p className='qx-lead'>{t('You will not write a single line of code.')}</p>
            <div className='qx-cards3'>
              {basics.map((item) => (
                <article className='qx-card' key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='qx-sec qx-center'>
          <div className='qn-wrap'>
            <p className='qx-badge'>{t('Fastest way')}</p>
            <h2 className='qx-h2 qx-big'>
              {t('Up and running in minutes')}
            </h2>
            <p className='qx-lead'>
              {t(
                'Pick the tool you use and the steps appear right below. Sign in to have your key filled in automatically.'
              )}
            </p>
            <div className='qx-perks'>
              {perks.map((item) => (
                <div className='qx-perk' key={item.title}>
                  <span>
                    <item.icon size={20} aria-hidden='true' />
                  </span>
                  <div>
                    <b>{item.title}</b>
                    <small>{item.sub}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className='qx-guide'>
              <SetupGuide apiBase={apiBase} displayKey='sk-...' />
            </div>
            <div className='qx-supported'>
              <div>
                <b>{t('Supported AI models')}</b>
                <span>
                  {t('All in one place; switch between them any time.')}
                </span>
              </div>
              <div className='qx-chips'>
                {SUPPORTED_MODELS.map((item) => (
                  <span className='qx-chip' key={item.name}>
                    {item.icon}
                    {item.name}
                  </span>
                ))}
                <Link to='/pricing' className='qx-chip'>
                  {t('and many more…')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className='qx-sec'>
            <div className='qn-wrap'>
              <p className='qx-eyebrow'>{t('Featured models')}</p>
              <div className='qx-head-row'>
                <div>
                  <h2 className='qx-h2'>{t('Pick a model for the job')}</h2>
                  <p className='qx-lead'>
                    {t(
                      'Billed by real token usage. Model IDs stay exactly as the provider names them.'
                    )}
                  </p>
                </div>
                <Link to='/pricing' className='qx-link'>
                  {t('See all models & pricing')} →
                </Link>
              </div>
              <div className='qx-models'>
                {featured.map((model) => (
                  <ModelCard
                    key={model.model_name}
                    model={model}
                    priceRate={pricing.priceRate}
                    usdExchangeRate={pricing.usdExchangeRate}
                    onClick={() => navigate({ to: '/pricing' })}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className='qx-sec'>
          <div className='qn-wrap'>
            <div className='qx-band'>
              <div>
                <h2>{t('Ready to try {{brand}}?', { brand: BRAND_NAME })}</h2>
                <p>
                  {t('Create your first API key and connect the tool you use.')}
                </p>
              </div>
              <Link
                to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
                className='qx-btn qx-btn-light'
              >
                {props.isAuthenticated
                  ? t('Go to Dashboard')
                  : t('Sign up & create an API key')}
                <ArrowRight size={16} aria-hidden='true' />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className='qn-footer'>
        <div className='qn-wrap'>
          <span className='qn-footer-links'>
            <Link to='/pricing'>{t('Models & pricing')}</Link>
            <DocsLink href={docsUrl}>{t('Docs')}</DocsLink>
            <Link to='/about'>
              <Headphones size={14} aria-hidden='true' /> {t('Support')}
            </Link>
          </span>
          <span className='qn-footer-attribution'>
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
    </div>
  )
}
