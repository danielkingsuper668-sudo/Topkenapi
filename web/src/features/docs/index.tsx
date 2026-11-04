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
  BookOpen,
  Code2,
  Coins,
  KeyRound,
  Layers,
  MessageSquare,
  Rocket,
  Terminal,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { BRAND_NAME, getApiBase } from '@/components/topken/brand'
import { SupportChannelList } from '@/components/topken/support-contact'
import { PricingShell } from '@/features/pricing/components/pricing-shell'

import '@/components/topken/topken.css'
import './docs.css'

type CodeLang = 'curl' | 'python' | 'node'

function buildSamples(base: string): Record<CodeLang, string> {
  return {
    curl: `curl ${base}/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'`,
    python: `from openai import OpenAI

client = OpenAI(api_key="sk-your-key", base_url="${base}/v1")

reply = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Hello"}],
)
print(reply.choices[0].message.content)`,
    node: `import OpenAI from 'openai'

const client = new OpenAI({ apiKey: 'sk-your-key', baseURL: '${base}/v1' })

const reply = await client.chat.completions.create({
  model: 'claude-sonnet-4-5',
  messages: [{ role: 'user', content: 'Hello' }],
})
console.log(reply.choices[0].message.content)`,
  }
}

/** TopkenX documentation: where to start, key facts, API samples, errors, FAQ. */
export function DocsPage() {
  const { t } = useTranslation()
  const base = getApiBase()
  const samples = buildSamples(base)
  const [lang, setLang] = useState<CodeLang>('curl')

  const nav = [
    {
      group: t('Getting started'),
      items: [
        { id: 'start', label: t('Where to start') },
        { id: 'facts', label: t('Key facts') },
      ],
    },
    {
      group: t('Connect'),
      items: [
        { id: 'tools', label: t('Claude Code, Codex & apps') },
        { id: 'api', label: t('Call the API directly') },
      ],
    },
    {
      group: t('Account & cost'),
      items: [{ id: 'account', label: t('API keys & top-up') }],
    },
    {
      group: t('Reference'),
      items: [
        { id: 'errors', label: t('Error codes') },
        { id: 'faq', label: t('FAQ') },
      ],
    },
  ]

  const cards = [
    { icon: MessageSquare, title: t('Try chat now'), desc: t('Talk to any model in the browser, no setup.'), to: '/playground' },
    { icon: Rocket, title: t('5-minute start'), desc: t('Get a key and connect your first tool.'), to: '/dashboard/setup' },
    { icon: Terminal, title: t('Claude Code & Codex'), desc: t('Coding agents in your terminal.'), to: '/dashboard/setup' },
    { icon: Layers, title: t('Chat apps'), desc: t('Cherry Studio and other OpenAI-compatible apps.'), to: '/dashboard/setup' },
    { icon: Code2, title: t('Call the API directly'), desc: t('cURL, Python and Node.js samples.'), href: '#api' },
    { icon: Coins, title: t('Models & pricing'), desc: t('Every model and its price.'), to: '/pricing' },
  ]

  const errors = [
    ['400', t('The request is malformed: check the JSON body and the model name.')],
    ['401', t('The key is missing, wrong or disabled. Copy it again from API keys.')],
    ['403', t('Your key or group may not use this model.')],
    ['404', t('The model or address does not exist. Check the base URL ends with /v1.')],
    ['429', t('Too many requests, or your balance is used up. Wait a moment or top up.')],
    ['500 / 502 / 503', t('The upstream is busy. We retry other channels; try again shortly.')],
  ]

  const faq = [
    [t('Is it the real model?'), t('Yes: the exact model you call, never swapped, never diluted.')],
    [t('Do I need a different key per model?'), t('No. One key works with every model you have access to.')],
    [t('How is usage billed?'), t('Per token. Every call and its cost is listed in API logs.')],
    [t('Does the balance expire?'), t('No. Your balance stays until you use it.')],
  ]

  return (
    <PricingShell>
      <div className='tk-docs'>
        <aside className='tk-docs-nav' aria-label={t('Docs')}>
          {nav.map((section) => (
            <div key={section.group} className='tk-docs-group'>
              <b>{section.group}</b>
              {section.items.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </aside>

        <article className='tk-docs-main'>
          <header className='tk-docs-head'>
            <div className='tk-eyebrow'>
              <BookOpen size={15} aria-hidden='true' />
              {t('Docs')}
            </div>
            <h1>
              <span className='tk-deco' aria-hidden='true'>
                {'₊‧⁺͙͘͡★'}
              </span>
              {t('{{brand}} docs', { brand: BRAND_NAME })}
              <span className='tk-deco' aria-hidden='true'>
                {' .◥◣‿◢◤.'}
              </span>
              <span className='tk-h2-accent'>{t('AI guide')}</span>
            </h1>
            <p className='tk-docs-sub'>
              {'➥'}
              {t('Connect AI tools and call the API through {{brand}}', {
                brand: BRAND_NAME,
              })}
              <span className='tk-deco' aria-hidden='true'>
                {' ᵎ✦ᵎ '}
              </span>
              {t('Pick what you need to do below.')}
            </p>
          </header>

          <section id='start' className='tk-docs-sec'>
            <h2>{t('Where to start')}</h2>
            <div className='tk-docs-cards'>
              {cards.map((card) => {
                const body = (
                  <>
                    <card.icon size={20} aria-hidden='true' />
                    <b>{card.title}</b>
                    <span>{card.desc}</span>
                  </>
                )
                return card.to ? (
                  <Link key={card.title} to={card.to} className='tk-docs-card'>
                    {body}
                  </Link>
                ) : (
                  <a key={card.title} href={card.href} className='tk-docs-card'>
                    {body}
                  </a>
                )
              })}
            </div>
          </section>

          <section id='facts' className='tk-docs-sec'>
            <h2>{t('Key facts')}</h2>
            <div className='tk-docs-table'>
              <div>
                <span>{t('Base URL (OpenAI style)')}</span>
                <code>{`${base}/v1`}</code>
                <CopyButton value={`${base}/v1`} size='icon' />
              </div>
              <div>
                <span>{t('Base URL (Claude Code / Anthropic style)')}</span>
                <code>{base}</code>
                <CopyButton value={base} size='icon' />
              </div>
              <div>
                <span>{t('API key')}</span>
                <code>sk-…</code>
                <Link to='/keys' className='tk-docs-link'>
                  {t('Create in API keys')}
                </Link>
              </div>
              <div>
                <span>{t('Billing')}</span>
                <code>{t('Pay as you go')}</code>
                <Link to='/usage-logs' className='tk-docs-link'>
                  {t('See every call in API logs')}
                </Link>
              </div>
            </div>
          </section>

          <section id='tools' className='tk-docs-sec'>
            <h2>{t('Claude Code, Codex & apps')}</h2>
            <p>
              {t(
                'Step-by-step setup for Claude Code, Codex, CC Switch, OpenCode, Cherry Studio and other apps, with your own key filled in, is in the API setup guide.'
              )}
            </p>
            <Link to='/dashboard/setup' className='tk-btn gold'>
              <KeyRound size={15} aria-hidden='true' />
              {t('Open the API setup guide')}
            </Link>
          </section>

          <section id='api' className='tk-docs-sec'>
            <h2>{t('Call the API directly')}</h2>
            <p>
              {t(
                'TopkenX speaks the OpenAI format. Any OpenAI SDK works: set the base URL and your key, then pick a model name from Models & pricing.'
              )}
            </p>
            <div className='tk-docs-tabs' role='tablist'>
              {(['curl', 'python', 'node'] as const).map((item) => (
                <button
                  key={item}
                  type='button'
                  role='tab'
                  aria-selected={lang === item}
                  onClick={() => setLang(item)}
                >
                  {{ curl: 'cURL', python: 'Python', node: 'Node.js' }[item]}
                </button>
              ))}
            </div>
            <div className='tk-code tk-docs-code'>
              <div className='tk-lights'>
                <i />
                <i />
                <i />
                <CopyButton value={samples[lang]} size='icon' className='ms-auto' />
              </div>
              <pre>{samples[lang]}</pre>
            </div>
          </section>

          <section id='account' className='tk-docs-sec'>
            <h2>{t('API keys & top-up')}</h2>
            <ul>
              <li>{t('Create as many keys as you need; each can have its own limit and expiry.')}</li>
              <li>{t('Top up in Top up; your balance is shown on the overview.')}</li>
              <li>{t('New accounts get a free trial credit.')}</li>
            </ul>
          </section>

          <section id='errors' className='tk-docs-sec'>
            <h2>{t('Error codes')}</h2>
            <div className='tk-docs-table is-errors'>
              {errors.map(([code, text]) => (
                <div key={code}>
                  <code>{code}</code>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>

          <section id='faq' className='tk-docs-sec'>
            <h2>{t('FAQ')}</h2>
            <div className='tk-docs-faq'>
              {faq.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <p className='tk-docs-help'>{t('Still stuck? Message us:')}</p>
            <SupportChannelList />
          </section>
        </article>
      </div>
    </PricingShell>
  )
}
