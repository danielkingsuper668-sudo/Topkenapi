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
import { useNavigate } from '@tanstack/react-router'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Textarea } from '@/components/ui/textarea'
import { savePendingPrompt } from '@/lib/pending-prompt'

// `hint` is matched against model ids in the Playground (gpt-4o, claude-…)
const VENDORS = [
  { label: 'Auto', hint: undefined },
  { label: 'OpenAI', hint: 'gpt' },
  { label: 'Claude', hint: 'claude' },
  { label: 'Gemini', hint: 'gemini' },
  { label: 'DeepSeek', hint: 'deepseek' },
  { label: 'Qwen', hint: 'qwen' },
] as const

const EXAMPLE_KEYS = [
  'Write a product launch email',
  'Explain this code step by step',
  'Translate a paragraph into English',
] as const

interface QuantumPromptBoxProps {
  isAuthenticated?: boolean
}

export function QuantumPromptBox(props: QuantumPromptBoxProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [vendor, setVendor] = useState<string>('Auto')

  const submit = (value: string) => {
    const prompt = value.trim()
    if (!prompt) return
    const hint = VENDORS.find((v) => v.label === vendor)?.hint
    savePendingPrompt({ text: prompt, modelHint: hint })
    if (props.isAuthenticated) {
      void navigate({ to: '/playground' })
    } else {
      void navigate({ to: '/sign-in', search: { redirect: '/playground' } })
    }
  }

  return (
    <form
      className='qn-prompt'
      onSubmit={(e) => {
        e.preventDefault()
        submit(text)
      }}
    >
      <label htmlFor='qn-prompt-input' className='sr-only'>
        {t('Ask any AI model')}
      </label>
      <div className='qn-prompt-box'>
        <Sparkles className='qn-prompt-icon' aria-hidden='true' />
        <Textarea
          id='qn-prompt-input'
          className='qn-prompt-input'
          rows={1}
          maxLength={4000}
          value={text}
          placeholder={t('Type an instruction, e.g. "Summarize this article"…')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit(text)
            }
          }}
        />
        <button
          type='submit'
          className='qn-prompt-send'
          disabled={!text.trim()}
          aria-label={t('Send')}
        >
          <ArrowUp aria-hidden='true' />
        </button>
      </div>

      <div className='qn-prompt-row' role='radiogroup' aria-label={t('Model')}>
        {VENDORS.map((v) => (
          <button
            key={v.label}
            type='button'
            role='radio'
            aria-checked={vendor === v.label}
            className='qn-chip'
            onClick={() => setVendor(v.label)}
          >
            {v.label === 'Auto' ? t('Auto') : v.label}
          </button>
        ))}
      </div>

      <div className='qn-prompt-row qn-prompt-examples'>
        {EXAMPLE_KEYS.map((key) => (
          <button
            key={key}
            type='button'
            className='qn-example'
            onClick={() => setText(t(key))}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </form>
  )
}
