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
  Home as HomeIcon,
  Info,
  LayoutDashboard,
  Menu,
  Rocket,
  CircleUserRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/language-switcher'
import { HotlinePill, TopkenMark } from '@/components/topken/topken-brand'

/** Languages offered in the landing header: ZH · EN · VI · RU · FR · KO · JA. */
const LANDING_LANGUAGES = ['zhCN', 'en', 'vi', 'ru', 'fr', 'ko', 'ja'] as const

/** Purple infinity logo, drawn from /topkenapi-logo.png (480×244). */
export function QuantumLogo(props: { size?: number }) {
  return <TopkenMark width={props.size ?? 40} />
}

/** Docs link: in-site paths stay in the same tab, full URLs open a new one. */
export function DocsLink(props: {
  href: string
  className?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  if (!props.href.startsWith('http')) {
    return (
      <Link to={props.href} className={props.className} onClick={props.onClick}>
        {props.children}
      </Link>
    )
  }
  return (
    <a
      href={props.href}
      target='_blank'
      rel='noopener noreferrer'
      className={props.className}
      onClick={props.onClick}
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
  const closeMenu = () => setMenuOpen(false)

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
          <QuantumLogo size={40} />
          <span className='qn-brand-text tk-wordmark'>
            {props.brandMain}
            <em>{props.brandAccent}</em>
          </span>
        </Link>
        <HotlinePill className='qn-hotline' />

        <nav className='qn-nav' aria-label={t('Main navigation')}>
          <Link to='/' className='is-active'>
            {t('Home')}
          </Link>
          <Link to='/dashboard/$section' params={{ section: 'setup' }}>
            {t('API setup guide')}
          </Link>
          <Link to='/dashboard'>{t('Dashboard')}</Link>
          <Link to='/pricing'>{t('Models & pricing')}</Link>
          <DocsLink href={props.docsUrl}>{t('Docs')}</DocsLink>
          <Link to='/about'>{t('About')}</Link>
        </nav>

        <div className='qn-actions'>
          <span className='qn-lang'>
            <LanguageSwitcher variant='compact' codes={LANDING_LANGUAGES} />
          </span>
          {props.isAuthenticated ? (
            <Link
              to='/dashboard'
              className='qn-btn qn-btn-gold qn-btn-sm qn-auth-text'
            >
              {t('Go to Dashboard')}
            </Link>
          ) : (
            // Header is for returning customers; new ones sign up from the hero.
            <Link
              to='/sign-in'
              className='qn-btn qn-btn-gold qn-btn-sm qn-auth-text'
            >
              {t('Sign In')}
            </Link>
          )}
          {/* phones: one round account button instead of the wide pill */}
          <Link
            to={props.isAuthenticated ? '/dashboard' : '/sign-in'}
            className='qn-auth-icon'
            aria-label={
              props.isAuthenticated ? t('Go to Dashboard') : t('Sign In')
            }
          >
            <CircleUserRound size={21} strokeWidth={1.8} aria-hidden='true' />
          </Link>
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
          <Link to='/' onClick={closeMenu}>
            <HomeIcon size={18} aria-hidden='true' /> {t('Home')}
          </Link>
          <Link
            to='/dashboard/$section'
            params={{ section: 'setup' }}
            onClick={closeMenu}
          >
            <Rocket size={18} aria-hidden='true' /> {t('API setup guide')}
          </Link>
          <Link to='/dashboard' onClick={closeMenu}>
            <LayoutDashboard size={18} aria-hidden='true' /> {t('Dashboard')}
          </Link>
          <Link to='/pricing' onClick={closeMenu}>
            <Coins size={18} aria-hidden='true' /> {t('Models & pricing')}
          </Link>
          <DocsLink href={props.docsUrl} onClick={closeMenu}>
            <BookOpen size={18} aria-hidden='true' /> {t('Docs')}
          </DocsLink>
          <Link to='/about' onClick={closeMenu}>
            <Info size={18} aria-hidden='true' /> {t('About')}
          </Link>
          {!props.isAuthenticated && (
            <Link to='/sign-in' onClick={closeMenu}>
              <ArrowRight size={18} aria-hidden='true' /> {t('Sign In')}
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
