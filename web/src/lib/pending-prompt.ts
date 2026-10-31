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

/**
 * A prompt typed on the public landing page, handed over to the Playground
 * (possibly after sign-in). Stored in sessionStorage so it survives the
 * sign-in redirect but not a new browser session.
 */
export type PendingPrompt = {
  text: string
  /** Lower-case vendor hint such as `gpt`, `claude`, `gemini`. */
  modelHint?: string
}

const STORAGE_KEY = 'newapi:pending-prompt'
const MAX_LENGTH = 4000

export function savePendingPrompt(prompt: PendingPrompt): void {
  const text = prompt.text.trim().slice(0, MAX_LENGTH)
  if (!text) return
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ text, modelHint: prompt.modelHint })
    )
  } catch {
    // Storage may be unavailable (private mode); the prompt is simply dropped.
  }
}

/** Read and remove the pending prompt, so it is only sent once. */
export function consumePendingPrompt(): PendingPrompt | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(STORAGE_KEY)
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as Record<string, unknown>
    if (typeof record.text !== 'string' || !record.text.trim()) return null
    return {
      text: record.text.slice(0, MAX_LENGTH),
      modelHint:
        typeof record.modelHint === 'string' ? record.modelHint : undefined,
    }
  } catch {
    return null
  }
}

/** Pick the first model whose id or label contains the hint. */
export function findModelByHint(
  models: ReadonlyArray<{ value: string; label: string }>,
  hint?: string
): string | undefined {
  if (!hint) return undefined
  const needle = hint.toLowerCase()
  return models.find(
    (m) =>
      m.value.toLowerCase().includes(needle) ||
      m.label.toLowerCase().includes(needle)
  )?.value
}
