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
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  KeyRound,
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  Repeat,
  Sparkles,
  Tag,
  TerminalSquare,
} from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SectionPageLayout } from '@/components/layout'
import { SupportContactCard } from '@/components/topken/support-contact'
import { getUserQuotaDates } from '@/features/dashboard/api'
import {
  useAnnouncements,
  useApiInfo,
} from '@/features/dashboard/hooks/use-status-data'
import { getPreviewText } from '@/features/dashboard/lib'
import type { AnnouncementItem } from '@/features/dashboard/types'
import { fetchTokenKey, getApiKeys } from '@/features/keys/api'
import { getUserLogs } from '@/features/usage-logs/api'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useStatus } from '@/hooks/use-status'
import { toIntlLocale } from '@/i18n/languages'
import { getUserModels } from '@/lib/api'
import { formatNumber } from '@/lib/format'
import { handleServerError } from '@/lib/handle-server-error'
import { ROLE } from '@/lib/roles'
import { requireServerSuccess } from '@/lib/server-error-message'
import { computeTimeRange } from '@/lib/time'
import { useAuthStore } from '@/stores/auth-store'

import { AnnouncementDetailModal } from './announcement-detail-dialog'
import { PerformanceHealthPanel } from './performance-health-panel'

const GUIDE_STORAGE_KEY = 'tk_overview_guide_hidden'
const CONSUME_LOG_TYPE = 2

function normalizeEndpoint(sourceUrl?: string): string {
  const base = (sourceUrl?.trim() || window.location.origin).replace(/\/+$/, '')
  if (base.endsWith('/v1/chat/completions')) return base
  if (base.endsWith('/v1')) return `${base}/chat/completions`
  return `${base}/v1/chat/completions`
}

function buildCurl(endpoint: string, apiKey: string, model: string): string {
  return [
    `curl ${endpoint} \\`,
    '  -H "Content-Type: application/json" \\',
    `  -H "Authorization: Bearer ${apiKey}" \\`,
    `  -d '{"model":"${model}","messages":[{"role":"user","content":"Hi"}]}'`,
  ].join('\n')
}

/** Announcement type → price-board tag (success = cut, warning/error = rise). */
function getPriceTag(type?: AnnouncementItem['type']) {
  if (type === 'success') return { cls: 'down', icon: ArrowDown, label: 'Price cut' }
  if (type === 'warning' || type === 'error')
    return { cls: 'up', icon: ArrowUp, label: 'Price rise' }
  return { cls: 'new', icon: Sparkles, label: 'New' }
}

export function TopkenOverview() {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const stepsId = useId()
  const user = useAuthStore((state) => state.auth.user)
  const { status } = useStatus()
  const { items: apiInfoItems } = useApiInfo()
  const { items: announcements, loading: announcementsLoading } =
    useAnnouncements()
  const { copyToClipboard } = useCopyToClipboard({ notify: false })
  const [copying, setCopying] = useState(false)
  const [openAnnouncement, setOpenAnnouncement] =
    useState<AnnouncementItem | null>(null)
  const [guideHidden, setGuideHidden] = useState(() => {
    try {
      return localStorage.getItem(GUIDE_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const remainQuota = Number(user?.quota ?? 0)
  const usedQuota = Number(user?.used_quota ?? 0)
  const requestCount = Number(user?.request_count ?? 0)

  const keysQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'api-keys'],
    queryFn: async () => {
      const result = requireServerSuccess(await getApiKeys({ p: 1, size: 10 }))
      return result.success ? (result.data?.items ?? []) : []
    },
    staleTime: 60 * 1000,
  })

  const modelsQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'user-models'],
    queryFn: async () => {
      const result = requireServerSuccess(await getUserModels())
      return result.success ? (result.data ?? []) : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const dayRange = useMemo(() => computeTimeRange(1), [])
  const requestsQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'tk-requests', dayRange.start_timestamp],
    queryFn: async () => {
      const result = requireServerSuccess(
        await getUserQuotaDates({
          start_timestamp: dayRange.start_timestamp,
          end_timestamp: dayRange.end_timestamp,
          default_time: 'hour',
        })
      )
      return (result.data ?? []).reduce(
        (total, item) => total + (Number(item.count) || 0),
        0
      )
    },
    staleTime: 60 * 1000,
  })

  const latencyQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'tk-latency'],
    queryFn: async () => {
      const now = Math.floor(Date.now() / 1000)
      const result = await getUserLogs({
        p: 1,
        page_size: 50,
        type: CONSUME_LOG_TYPE,
        start_timestamp: now - 3600,
        end_timestamp: now,
      })
      const items = (result.data?.items ?? []) as { use_time?: number }[]
      if (!items.length) return null
      const total = items.reduce((sum, log) => sum + (log.use_time || 0), 0)
      return total / items.length
    },
    staleTime: 60 * 1000,
  })

  const keys = keysQuery.data ?? []
  const preferredKey = keys.find((key) => key.status === 1) ?? keys[0] ?? null
  const endpoint = normalizeEndpoint(apiInfoItems[0]?.url)
  const baseUrl = endpoint.replace(/\/chat\/completions$/, '')
  const model = modelsQuery.data?.[0] ?? 'gpt-4o-mini'
  const maskedKey = preferredKey
    ? `sk-••••••••${String(preferredKey.key).slice(-4)}`
    : 'sk-...'
  const docsUrl = (status?.docs_link as string) || ''

  const steps = [
    {
      title: t('Create an API key'),
      description: t('Create a key for your app or service'),
      to: '/keys' as const,
      icon: KeyRound,
      done: Boolean(preferredKey),
    },
    {
      title: t('Add credits'),
      description: t('Keep enough balance before going live'),
      to: '/wallet' as const,
      icon: CreditCard,
      done: remainQuota > 0 || usedQuota > 0,
    },
    {
      title: t('Send a request'),
      description: t('Verify with the Playground or your client'),
      to: '/playground' as const,
      icon: TerminalSquare,
      done: requestCount > 0,
    },
  ]

  const toggleGuide = () => {
    const next = !guideHidden
    setGuideHidden(next)
    try {
      localStorage.setItem(GUIDE_STORAGE_KEY, next ? '1' : '0')
    } catch {
      // Preference just won't persist.
    }
  }

  const copyText = async (text: string) => {
    const copied = await copyToClipboard(text)
    if (copied) toast.success(t('Copied to clipboard'))
    else toast.error(t('Failed to copy to clipboard'))
  }

  const copyRequest = async () => {
    if (!preferredKey?.id || copying) return
    setCopying(true)
    try {
      const result = await fetchTokenKey(preferredKey.id)
      const key = result.success && result.data?.key ? result.data.key : ''
      if (!key) {
        handleServerError(result, t('Failed to copy to clipboard'))
        return
      }
      await copyText(buildCurl(endpoint, `sk-${key}`, model))
    } catch (error) {
      handleServerError(error, t('Failed to copy to clipboard'))
    } finally {
      setCopying(false)
    }
  }

  const sortedAnnouncements = [...announcements]
    .sort(
      (a, b) =>
        new Date(b.publishDate ?? 0).getTime() -
        new Date(a.publishDate ?? 0).getTime()
    )
    .slice(0, 8)

  const latency = latencyQuery.data
  const hasBalance = remainQuota > 0

  return (
    <div className='tk-page'>
      <div className='tk-grid'>
        <section className='tk-panel tk-guide' aria-labelledby='tk-g-title'>
          <div className='tk-eyebrow'>
            <ListChecks size={15} aria-hidden='true' />
            {t('Get started in 1 minute')}
          </div>
          <h2 id='tk-g-title'>
            {t('Connect')} <em>Topkenapi</em>
          </h2>
          <p className='tk-d'>
            {t(
              'Pick the tool you use; copy the endpoint and your API key and you are ready.'
            )}
          </p>
          <div className='tk-clients'>
            <Link to='/keys' className='tk-client rec'>
              <span className='tk-cl-ic'>
                <Repeat size={20} aria-hidden='true' />
              </span>
              <span className='tk-cl-tx'>
                <b>
                  CC Switch <i className='tk-badge'>{t('Recommended')}</i>
                </b>
                <span>Claude Code · Codex · Gemini CLI</span>
              </span>
              <ChevronRight size={16} aria-hidden='true' />
            </Link>
            <Link to='/keys' className='tk-client'>
              <span className='tk-cl-ic' style={{ background: '#d0546b' }}>
                <MessageSquare size={20} aria-hidden='true' />
              </span>
              <span className='tk-cl-tx'>
                <b>Cherry Studio</b>
                <span>{t('Desktop AI chat app')}</span>
              </span>
              <ChevronRight size={16} aria-hidden='true' />
            </Link>
            <button
              type='button'
              className='tk-client'
              onClick={() => copyText(baseUrl)}
            >
              <span className='tk-cl-ic' style={{ background: '#6f63e8' }}>
                <MoreHorizontal size={20} aria-hidden='true' />
              </span>
              <span className='tk-cl-tx'>
                <b>{t('Other tools')}</b>
                <span>{t('Cursor · Chatbox · LobeChat: copy the endpoint')}</span>
              </span>
              <Copy size={16} aria-hidden='true' />
            </button>
          </div>
          <div className='tk-acts'>
            <button
              type='button'
              className='tk-btn'
              aria-expanded={!guideHidden}
              aria-controls={stepsId}
              onClick={toggleGuide}
            >
              <ChevronUp
                size={16}
                aria-hidden='true'
                style={{ transform: guideHidden ? 'rotate(180deg)' : undefined }}
              />
              {guideHidden ? t('Show setup guide') : t('Hide setup guide')}
            </button>
            {docsUrl && (
              <a
                className='tk-more'
                href={docsUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('View other integration methods')}
                <ExternalLink size={14} aria-hidden='true' />
              </a>
            )}
          </div>
          <ol className='tk-steps' id={stepsId} hidden={guideHidden}>
            {steps.map((step, index) => (
              <li key={step.to} className={step.done ? 'tk-step done' : 'tk-step'}>
                <span className='tk-dot'>
                  {step.done && <Check size={16} aria-hidden='true' />}
                  <span className='sr-only'>
                    {step.done ? t('Completed') : t('Pending')}
                  </span>
                </span>
                <Link to={step.to} className='tk-scard'>
                  <span className='tk-sic'>
                    <step.icon size={18} aria-hidden='true' />
                  </span>
                  <span className='tk-stx'>
                    <b>
                      <em>{index + 1}.</em> {step.title}
                    </b>
                    <span>{step.description}</span>
                  </span>
                  <ChevronRight size={18} aria-hidden='true' />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className='tk-panel' aria-labelledby='tk-r-title'>
          <div className='tk-rq-h'>
            <span className='tk-sic'>
              <TerminalSquare size={18} aria-hidden='true' />
            </span>
            <div>
              <b id='tk-r-title'>{t('First API request')}</b>
              <span>
                {preferredKey
                  ? t('Your first key is already filled in')
                  : t('Create an API key to fill in this request')}
              </span>
            </div>
            {preferredKey ? (
              <button
                type='button'
                className='tk-btn sm'
                onClick={copyRequest}
                disabled={copying}
              >
                <Copy size={15} aria-hidden='true' />
                {t('Copy')}
              </button>
            ) : (
              <Link to='/keys' className='tk-btn sm'>
                <KeyRound size={15} aria-hidden='true' />
                {t('Create an API key')}
              </Link>
            )}
          </div>
          <div className='tk-code'>
            <div className='tk-lights' aria-hidden='true'>
              <i />
              <i />
              <i />
            </div>
            <pre>
              <span className='f'>curl</span>{' '}
              <span className='s'>{endpoint}</span> \{'\n'}
              {'  '}-H <span className='s'>"Content-Type: application/json"</span>{' '}
              \{'\n'}
              {'  '}-H <span className='s'>"Authorization: Bearer {maskedKey}"</span>{' '}
              \{'\n'}
              {'  '}-d{' '}
              <span className='s'>
                '{`{"model":"${model}","messages":[{"role":"user","content":"Hi"}]}`}'
              </span>
            </pre>
          </div>
          <div className='tk-chips'>
            <span className='tk-chip'>
              <i />
              {t('Route online')}
            </span>
            <span className={preferredKey ? 'tk-chip' : 'tk-chip bad'}>
              <i />
              {preferredKey ? t('Key configured') : t('No API key yet')}
            </span>
            <span className={hasBalance ? 'tk-chip warn' : 'tk-chip bad'}>
              <i />
              {hasBalance ? t('Balance OK') : t('Balance depleted')}
            </span>
          </div>
        </section>
      </div>

      <div className='tk-grid2'>
        <section className='tk-panel tk-board' aria-labelledby='tk-pb-title'>
          <div className='tk-pb-h'>
            <span className='tk-sic'>
              <Tag size={18} aria-hidden='true' />
            </span>
            <div className='tk-pb-tx'>
              <b id='tk-pb-title'>{t('Price updates')}</b>
              <span>
                {t('Market prices change often; the latest notice here applies')}
              </span>
            </div>
            <Link to='/pricing' className='tk-btn sm'>
              {t('Full price list')}
              <ChevronRight size={15} aria-hidden='true' />
            </Link>
          </div>
          {sortedAnnouncements.length > 0 ? (
            <ol className='tk-plist'>
              {sortedAnnouncements.map((item, index) => {
                const tag = getPriceTag(item.type)
                const date = item.publishDate ? new Date(item.publishDate) : null
                return (
                  <li key={item.id ?? `announcement-${index}`}>
                    <button
                      type='button'
                      className='tk-prow'
                      onClick={() => setOpenAnnouncement(item)}
                    >
                      <span className='tk-pd'>
                        {date
                          ? date.toLocaleDateString(locale, {
                              month: '2-digit',
                              day: '2-digit',
                            })
                          : '—'}
                      </span>
                      <span className='tk-pbody'>
                        <span className={`tk-pt ${tag.cls}`}>
                          <tag.icon size={13} aria-hidden='true' />
                          {t(tag.label)}
                        </span>
                        <span className='tk-pm'>
                          {getPreviewText(item.content, 120)}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className='tk-empty'>
              {announcementsLoading
                ? t('Loading')
                : t('No price updates at the moment')}
            </p>
          )}
        </section>

        <div className='tk-side'>
          <div className='tk-squares'>
            <div className='tk-sqc'>
              <div className='tk-sic'>
                <Activity size={18} aria-hidden='true' />
              </div>
              <span className='tk-lbl'>{t('Requests (24h)')}</span>
              <b>
                {requestsQuery.data == null
                  ? '—'
                  : formatNumber(requestsQuery.data, locale)}
              </b>
              <small>
                {t('Total')} {formatNumber(requestCount, locale)}
              </small>
            </div>
            <div className='tk-sqc'>
              <div className='tk-sic'>
                <Clock size={18} aria-hidden='true' />
              </div>
              <span className='tk-lbl'>{t('Avg. latency')}</span>
              <b>
                {latency == null ? (
                  '—'
                ) : (
                  <>
                    {formatNumber(Math.round(latency * 10) / 10, locale)}
                    <i>s</i>
                  </>
                )}
              </b>
              <small>{t('Last hour')}</small>
            </div>
          </div>
          <SupportContactCard />
        </div>
      </div>

      <AnnouncementDetailModal
        open={openAnnouncement !== null}
        onOpenChange={(open) => {
          if (!open) setOpenAnnouncement(null)
        }}
        announcement={openAnnouncement}
      />
    </div>
  )
}

/** Overview route: Topkenapi panels, plus gateway health for admins. */
export function TopkenOverviewPage() {
  const { t } = useTranslation()
  const isAdmin = useAuthStore(
    (state) => (state.auth.user?.role ?? 0) >= ROLE.ADMIN
  )
  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Overview')}</SectionPageLayout.Title>
      <SectionPageLayout.Content>
        <TopkenOverview />
        {isAdmin && (
          <div className='mt-4'>
            <PerformanceHealthPanel />
          </div>
        )}
        <p className='tk-attr'>
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
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
