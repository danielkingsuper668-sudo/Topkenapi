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
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isLikelyHtml(value: string): boolean {
  return /<!doctype html|<html[\s>]|<head[\s>]|<body[\s>]|<style[\s>]|<script[\s>]|<\/?[a-z][\s\S]*>/i.test(
    value
  )
}

const LANG_MARKER = /<!--\s*lang:\s*([a-zA-Z-]+)\s*-->/g

function normalizeLang(code: string): string {
  const c = code.trim().toLowerCase()
  if (c === 'zhtw' || c === 'zh-tw' || c === 'zh-hk') return 'zh-tw'
  if (c === 'zhcn' || c === 'zh-cn' || c.startsWith('zh')) return 'zh'
  return c.split('-')[0]
}

/**
 * Admin-written pages (About, User Agreement, Privacy Policy) can hold one
 * block per language, each opened by a marker such as `<!-- lang:zh -->`,
 * `<!-- lang:vi -->` or `<!-- lang:en -->`. Returns the block for the current
 * UI language, falling back to Chinese, then to the first block. Content
 * without markers is returned unchanged.
 */
export function pickLocalizedContent(value: string, language?: string): string {
  const blocks = new Map<string, string>()
  const markers = [...value.matchAll(LANG_MARKER)]
  if (markers.length === 0) return value
  markers.forEach((m, i) => {
    const start = (m.index ?? 0) + m[0].length
    const end = markers[i + 1]?.index ?? value.length
    const lang = normalizeLang(m[1])
    if (!blocks.has(lang)) blocks.set(lang, value.slice(start, end).trim())
  })
  const want = normalizeLang(language ?? '')
  return (
    blocks.get(want) ??
    (want === 'zh-tw' ? blocks.get('zh') : undefined) ??
    blocks.get('zh') ??
    blocks.values().next().value ??
    value
  )
}
