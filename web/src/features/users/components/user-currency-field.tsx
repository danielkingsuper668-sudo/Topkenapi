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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { api } from '@/lib/api'

type UserCurrencyFieldProps = {
  userId: number
}

function readCurrency(setting: unknown): string {
  try {
    const parsed =
      typeof setting === 'string' && setting ? JSON.parse(setting) : setting
    const value = (parsed as { currency?: unknown } | null)?.currency
    return typeof value === 'string' ? value.toUpperCase() : ''
  } catch {
    return ''
  }
}

/**
 * The currency a customer's prices and balance are shown in. The server fixes
 * it on first use (China IP or non-Vietnamese UI: ¥, Vietnamese UI: ₫); an
 * admin can change it here. "Not set yet" lets the next visit choose again.
 * Saves on change, separately from the rest of the form.
 */
export function UserCurrencyField({ userId }: UserCurrencyFieldProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get(`/api/user/${userId}`)
      .then((res) => {
        if (!cancelled) setValue(readCurrency(res.data?.data?.setting))
      })
      .catch(() => {
        /* the field stays at "not set" */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const save = async (next: string) => {
    const previous = value
    setValue(next)
    setSaving(true)
    try {
      const res = await api.put(`/api/user/${userId}/currency`, {
        currency: next,
      })
      if (res.data?.success === false) throw new Error(res.data?.message)
      toast.success(t('Display currency saved'))
    } catch (error) {
      setValue(previous)
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : t('Could not save the display currency')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='space-y-2'>
      <label htmlFor={`user-currency-${userId}`} className='text-sm font-medium'>
        {t('Display currency')}
      </label>
      <select
        id={`user-currency-${userId}`}
        className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
        value={value}
        disabled={loading || saving}
        onChange={(e) => void save(e.target.value)}
      >
        <option value=''>{t('Not set yet (decided on next visit)')}</option>
        <option value='CNY'>{t('¥ CNY')}</option>
        <option value='VND'>{t('₫ VND')}</option>
      </select>
      <p className='text-muted-foreground text-xs'>
        {t(
          "This customer's prices, balance and payment methods use this currency. It is set automatically on first use and saved immediately when changed here."
        )}
      </p>
    </div>
  )
}
