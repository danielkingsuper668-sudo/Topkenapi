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
import { Languages, Check, ChevronDown } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  INTERFACE_LANGUAGE_OPTIONS,
  normalizeInterfaceLanguage,
} from '@/i18n/languages'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

type LanguageSwitcherProps = {
  /** Limit and order the languages shown; defaults to all interface languages. */
  codes?: readonly string[]
  /** `icon` (default): globe icon button. `compact`: flag + short code + chevron. */
  variant?: 'icon' | 'compact'
  className?: string
}

export function LanguageSwitcher(props: LanguageSwitcherProps = {}) {
  const { i18n, t } = useTranslation()
  const user = useAuthStore((s) => s.auth.user)
  const currentLanguage = normalizeInterfaceLanguage(i18n.language)
  const handleChangeLanguage = useCallback(
    async (code: string) => {
      await i18n.changeLanguage(code)
      if (user) {
        try {
          await api.put('/api/user/self', { language: code })
        } catch {
          // Best-effort persistence; don't block the UI on failure
        }
      }
    },
    [i18n, user]
  )

  const options = props.codes
    ? props.codes.flatMap((code) =>
        INTERFACE_LANGUAGE_OPTIONS.filter((lang) => lang.code === code)
      )
    : INTERFACE_LANGUAGE_OPTIONS
  const current = INTERFACE_LANGUAGE_OPTIONS.find(
    (lang) => lang.code === currentLanguage
  )

  return (
    <DropdownMenu modal={false}>
      {props.variant === 'compact' ? (
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              className={cn('h-9 gap-1.5 px-2.5', props.className)}
            />
          }
        >
          <span aria-hidden='true'>{current?.flag}</span>
          <span className='text-sm font-medium'>{current?.short}</span>
          <ChevronDown className='size-3.5 opacity-70' aria-hidden='true' />
          <span className='sr-only'>{t('Change language')}</span>
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              className={cn('h-9 w-9', props.className)}
            />
          }
        >
          <Languages className='size-[1.2rem]' />
          <span className='sr-only'>{t('Change language')}</span>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent align='end'>
        {options.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChangeLanguage(lang.code)}
          >
            {props.variant === 'compact' && (
              <span aria-hidden='true'>{lang.flag}</span>
            )}
            {lang.label}
            <Check
              size={14}
              className={cn(
                'ms-auto',
                currentLanguage !== lang.code && 'hidden'
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
