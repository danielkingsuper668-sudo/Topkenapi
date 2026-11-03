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
import { useTranslation } from 'react-i18next'

import { TopkenBrand } from '@/components/topken/topken-brand'
import { useConsoleTheme } from '@/components/topken/use-console-theme'
import '@/components/topken/console-skin.css'

import '@/components/topken/topken.css'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  useConsoleTheme()

  return (
    <div className='relative grid h-svh max-w-none overflow-hidden'>
      {/* Soft violet glow, matching the console palette */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_85%_8%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_70%),radial-gradient(ellipse_55%_40%_at_0%_100%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_70%)]'
      />
      <div className='absolute top-4 left-4 z-10 sm:top-8 sm:left-8'>
        <TopkenBrand markWidth={40} className='text-xl' />
      </div>
      <div className='container flex items-center pt-16 sm:pt-0'>
        <div className='sm:border-border sm:bg-card/70 mx-auto flex w-full flex-col justify-center space-y-2 px-4 py-8 sm:w-[480px] sm:rounded-2xl sm:border sm:p-8 sm:shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)] sm:backdrop-blur'>
          {children}
        </div>
      </div>
      <p className='tk-attr absolute inset-x-0 bottom-3 m-0'>
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
