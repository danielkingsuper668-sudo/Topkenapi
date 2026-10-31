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
import { useEffect, useRef, useState } from 'react'

import {
  consumePendingPrompt,
  findModelByHint,
  type PendingPrompt,
} from '@/lib/pending-prompt'

import type { ModelOption } from '../types'

type UsePendingPromptOptions = {
  /** True once models and saved messages have loaded. */
  isReady: boolean
  models: ModelOption[]
  currentModel: string
  onModelChange: (model: string) => void
  onSend: (text: string) => void
}

/**
 * Sends a prompt typed on the landing page once the Playground is ready.
 * Phase 1 switches to the hinted model (if any); phase 2 sends after the
 * config update has landed, so the request uses the chosen model.
 */
export function usePendingPrompt(options: UsePendingPromptOptions) {
  const [pending, setPending] = useState<PendingPrompt | null>(null)
  const targetModel = useRef<string | undefined>(undefined)
  const consumed = useRef(false)
  const { isReady, models, currentModel, onModelChange, onSend } = options

  useEffect(() => {
    if (!isReady || consumed.current) return
    consumed.current = true
    const prompt = consumePendingPrompt()
    if (!prompt) return
    const match = findModelByHint(models, prompt.modelHint)
    targetModel.current = match
    if (match && match !== currentModel) onModelChange(match)
    setPending(prompt)
  }, [isReady, models, currentModel, onModelChange])

  useEffect(() => {
    if (!pending) return
    if (targetModel.current && targetModel.current !== currentModel) return
    setPending(null)
    onSend(pending.text)
  }, [pending, currentModel, onSend])
}
