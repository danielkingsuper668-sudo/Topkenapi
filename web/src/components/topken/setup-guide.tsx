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
import { ArrowLeftRight, Check, Copy, MessageSquare, Terminal } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

import { BRAND_NAME } from './brand'

type GuideCode = { label: string; text: string }
type GuideStep = { title: string; description: string; codes?: GuideCode[] }
type GuideTool = {
  id: string
  title: string
  description: string
  tone: 'teal' | 'violet' | 'amber'
  icon: React.ReactNode
  steps: GuideStep[]
}

/** Placeholders replaced in every code sample. */
const KEY_TOKEN = '{KEY}'
const BASE_TOKEN = '{BASE}'

function fillCode(text: string, base: string, key: string): string {
  return text.replaceAll(BASE_TOKEN, base).replaceAll(KEY_TOKEN, key)
}

function useGuideTools(): GuideTool[] {
  const { t } = useTranslation()
  return [
    {
      id: 'opencode',
      title: 'VS Code / OpenCode',
      description: t('Type in the terminal: the main way in, made for people who code.'),
      tone: 'teal',
      icon: <Terminal size={22} aria-hidden='true' />,
      steps: [
        {
          title: t('Install OpenCode (command-line version)'),
          description: t(
            'Open a terminal (in VS Code: Terminal → New Terminal) and run the command for your system.'
          ),
          codes: [
            { label: 'macOS / Linux', text: 'curl -fsSL https://opencode.ai/install | bash' },
            { label: 'Windows', text: 'npm install -g opencode-ai' },
          ],
        },
        {
          title: t('Add {{brand}} to OpenCode', { brand: BRAND_NAME }),
          description: t(
            'Save this as ~/.config/opencode/opencode.json (create the folder if it does not exist).'
          ),
          codes: [
            {
              label: 'opencode.json',
              text: `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "topkenx": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "${BRAND_NAME}",
      "options": {
        "baseURL": "${BASE_TOKEN}/v1",
        "apiKey": "${KEY_TOKEN}"
      },
      "models": {
        "claude-sonnet-4-5": {},
        "gpt-5": {},
        "deepseek-chat": {}
      }
    }
  }
}`,
            },
          ],
        },
        {
          title: t('Type opencode and press Enter'),
          description: t(
            'Type /models to pick a model, then simply say what you need done.'
          ),
          codes: [{ label: 'Terminal', text: 'opencode' }],
        },
      ],
    },
    {
      id: 'claude-code',
      title: 'Claude Code · Codex · CC Switch',
      description: t(
        'Use Claude Code, Codex (ChatGPT app) and Gemini CLI, or switch with CC Switch in one tap.'
      ),
      tone: 'violet',
      icon: <ArrowLeftRight size={22} aria-hidden='true' />,
      steps: [
        {
          title: t('Claude Code: point it at {{brand}}', { brand: BRAND_NAME }),
          description: t(
            'Run these lines, then start claude as usual. On Windows, open a new PowerShell window afterwards.'
          ),
          codes: [
            {
              label: 'macOS / Linux',
              text: `export ANTHROPIC_BASE_URL="${BASE_TOKEN}"\nexport ANTHROPIC_AUTH_TOKEN="${KEY_TOKEN}"\nclaude`,
            },
            {
              label: 'Windows (PowerShell)',
              text: `setx ANTHROPIC_BASE_URL "${BASE_TOKEN}"\nsetx ANTHROPIC_AUTH_TOKEN "${KEY_TOKEN}"`,
            },
          ],
        },
        {
          title: t('Codex: add a provider'),
          description: t(
            'Add this to ~/.codex/config.toml and set the TOPKENX_API_KEY environment variable to your key.'
          ),
          codes: [
            {
              label: 'config.toml',
              text: `model_provider = "topkenx"
model = "gpt-5"

[model_providers.topkenx]
name = "${BRAND_NAME}"
base_url = "${BASE_TOKEN}/v1"
env_key = "TOPKENX_API_KEY"
wire_api = "responses"`,
            },
            {
              label: 'macOS / Linux',
              text: `export TOPKENX_API_KEY="${KEY_TOKEN}"`,
            },
          ],
        },
        {
          title: t('CC Switch: one tap'),
          description: t(
            'In CC Switch, add a custom provider, paste the address and key below, then switch to it.'
          ),
          codes: [
            { label: t('Address'), text: BASE_TOKEN },
            { label: t('API key'), text: KEY_TOKEN },
          ],
        },
      ],
    },
    {
      id: 'chat-apps',
      title: t('Cherry Studio & chat apps'),
      description: t(
        'A chat window on your computer: Cherry Studio, Chatbox, LobeChat, no commands needed.'
      ),
      tone: 'amber',
      icon: <MessageSquare size={22} aria-hidden='true' />,
      steps: [
        {
          title: t('Add an OpenAI-compatible provider'),
          description: t(
            'In Settings → Model providers, add a new provider of type OpenAI (compatible).'
          ),
        },
        {
          title: t('Paste the address and your key'),
          description: t(
            'Fill in the API address and API key, then fetch the model list and pick a model.'
          ),
          codes: [
            { label: t('API address'), text: `${BASE_TOKEN}/v1` },
            { label: t('API key'), text: KEY_TOKEN },
          ],
        },
        {
          title: t('Start chatting'),
          description: t(
            'Open a new chat, choose a model at the top and type your request in any language.'
          ),
        },
      ],
    },
  ]
}

interface SetupGuideProps {
  /** Public API base, e.g. https://topkenx.com */
  apiBase: string
  /** Key text shown inside samples (masked or a placeholder). */
  displayKey: string
  /** Returns the real key for copying; samples copy displayKey without it. */
  resolveKey?: () => Promise<string>
}

/** Tool picker + numbered steps with copyable commands. */
export function SetupGuide(props: SetupGuideProps) {
  const { t } = useTranslation()
  const tools = useGuideTools()
  const [toolId, setToolId] = useState(tools[0].id)
  const { copyToClipboard } = useCopyToClipboard({ notify: false })
  const tool = tools.find((item) => item.id === toolId) ?? tools[0]

  const copyCode = async (text: string) => {
    let key = props.displayKey
    if (text.includes(KEY_TOKEN) && props.resolveKey) {
      try {
        key = await props.resolveKey()
      } catch {
        toast.error(t('Failed to copy to clipboard'))
        return
      }
    }
    const copied = await copyToClipboard(fillCode(text, props.apiBase, key))
    if (copied) toast.success(t('Copied to clipboard'))
    else toast.error(t('Failed to copy to clipboard'))
  }

  return (
    <div className='tk-guide-tools'>
      <div className='tk-tools' role='radiogroup' aria-label={t('Where will you use it?')}>
        {tools.map((item) => {
          const selected = item.id === tool.id
          return (
            <button
              key={item.id}
              type='button'
              role='radio'
              aria-checked={selected}
              className={`tk-tool tk-tone-${item.tone}${selected ? ' is-on' : ''}`}
              onClick={() => setToolId(item.id)}
            >
              <span className='tk-tool-ic'>{item.icon}</span>
              <span className='tk-tool-check' aria-hidden='true'>
                {selected && <Check size={14} />}
              </span>
              <b>{item.title}</b>
              <span>{item.description}</span>
            </button>
          )
        })}
      </div>

      <ol className='tk-gsteps'>
        {tool.steps.map((step, index) => (
          <li key={step.title} className='tk-gstep'>
            <span className='tk-gnum'>{index + 1}</span>
            <div className='tk-gbody'>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
              {step.codes?.map((code) => (
                <div className='tk-gcode' key={code.label}>
                  <div className='tk-gcode-h'>
                    <span>{code.label}</span>
                    <button
                      type='button'
                      className='tk-gcopy'
                      onClick={() => copyCode(code.text)}
                    >
                      <Copy size={14} aria-hidden='true' />
                      {t('Copy')}
                    </button>
                  </div>
                  <pre>{fillCode(code.text, props.apiBase, props.displayKey)}</pre>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
