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

import { useConsolePalette } from './use-console-theme'

/** Two swatches in the console header: bronze + circuit, or grey violet. */
export function PaletteSwitch() {
  const { t } = useTranslation()
  const { palette, choose } = useConsolePalette()

  return (
    <div className='tk-palette' role='group' aria-label={t('Color theme')}>
      <button
        type='button'
        className='is-bronze'
        aria-pressed={palette === 'bronze'}
        aria-label={t('Bronze')}
        title={t('Bronze')}
        onClick={() => choose('bronze')}
      />
      <button
        type='button'
        className='is-navy'
        aria-pressed={palette === 'navy'}
        aria-label={t('Grey violet')}
        title={t('Grey violet')}
        onClick={() => choose('navy')}
      />
    </div>
  )
}
