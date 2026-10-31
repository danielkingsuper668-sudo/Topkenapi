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
  BookOpen,
  Coins,
  Headphones,
  Home as HomeIcon,
  Layers,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/language-switcher'

/** Languages offered in the landing header: ZH · EN · FR · VI · RU · KO. */
const LANDING_LANGUAGES = ['zhCN', 'en', 'fr', 'vi', 'ru', 'ko'] as const

/** Purple infinity logo (pure SVG, no image file needed). */
export function QuantumLogo(props: { size?: number }) {
  const size = props.size ?? 40
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox='0 0 120 66'
      fill='none'
      aria-hidden='true'
    >
      <defs>
        <linearGradient id='qn-logo-g' x1='0' y1='0' x2='120' y2='0'>
          <stop offset='0' stopColor='#a855f7' />
          <stop offset='1' stopColor='#5b6cf6' />
        </linearGradient>
      </defs>
      <path
        d='M33 9C18.6 9 9 19.7 9 33s9.6 24 24 24c11 0 18.6-7.6 27-17.5C68.4 49.4 76 57 87 57c14.4 0 24-10.7 24-24S101.4 9 87 9C76 9 68.4 16.6 60 26.5 51.6 16.6 44 9 33 9Z'
        stroke='url(#qn-logo-g)'
        strokeWidth='14'
        strokeLinejoin='round'
      />
    </svg>
  )
}

/** External-or-internal docs link (docs URL comes from system settings). */
export function DocsLink(props: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  const isExternal = props.href.startsWith('http')
  return (
    <a
      href={props.href}
      target={isExternal ? '_blank' : undefined}
      rel='noopener noreferrer'
      className={props.className}
    >
      {props.children}
    </a>
  )
}

interface QuantumHeaderProps {
  brandMain: string
  brandAccent: string
  docsUrl: string
  isAuthenticated?: boolean
}

export function QuantumHeader(props: QuantumHeaderProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={scrolled ? 'qn-header is-scrolled' : 'qn-header'}>
      <div className='qn-wrap qn-header-inner'>
        <Link
          to='/'
          className='qn-brand'
          aria-label={`${props.brandMain}${props.brandAccent}`}
        >
          <QuantumLogo size={44} />
          <span className='qn-brand-text'>
            {props.brandMain}
            <em>{props.brandAccent}</em>
          </span>
        </Link>

        <nav className='qn-nav' aria-label={t('Main navigation')}>
          <Link to='/' className='is-active'>
            <HomeIcon size={16} aria-hidden='true' /> {t('Home')}
          </Link>
          <Link to='/rankings'>{t('API & Models')}</Link>
          <Link to='/pricing'>{t('Pricing')}</Link>
          <DocsLink href={props.docsUrl}>{t('Docs')}</DocsLink>
          <Link to='/about'>{t('Support')}</Link>
        </nav>

        <div className='qn-actions'>
          <span className='qn-lang'>
            <LanguageSwitcher variant='compact' codes={LANDING_LANGUAGES} />
          </span>
          {props.isAuthenticated ? (
            <Link to='/dashboard' className='qn-btn qn-btn-gold qn-btn-sm'>
              {t('Go to Dashboard')}
            </Link>
          ) : (
            <>
              <Link
                to='/sign-in'
                className='qn-btn qn-btn-ghost qn-btn-sm qn-signin'
              >
                {t('Sign In')}
              </Link>
              <Link to='/sign-up' className='qn-btn qn-btn-gold qn-btn-sm'>
                {t('Sign Up')}
              </Link>
            </>
          )}
          <button
            type='button'
            className='qn-burger'
            aria-label={t('Open menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className='qn-mobile-menu' aria-label={t('Main navigation')}>
          <Link to='/' onClick={() => setMenuOpen(false)}>
            <HomeIcon size={18} aria-hidden='true' /> {t('Home')}
          </Link>
          <Link to='/rankings' onClick={() => setMenuOpen(false)}>
            <Layers size={18} aria-hidden='true' /> {t('API & Models')}
          </Link>
          <Link to='/pricing' onClick={() => setMenuOpen(false)}>
            <Coins size={18} aria-hidden='true' /> {t('Pricing')}
          </Link>
          <DocsLink href={props.docsUrl}>
            <BookOpen size={18} aria-hidden='true' /> {t('Docs')}
          </DocsLink>
          <Link to='/about' onClick={() => setMenuOpen(false)}>
            <Headphones size={18} aria-hidden='true' /> {t('Support')}
          </Link>
          {!props.isAuthenticated && (
            <Link to='/sign-in' onClick={() => setMenuOpen(false)}>
              <ArrowRight size={18} aria-hidden='true' /> {t('Sign In')}
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
