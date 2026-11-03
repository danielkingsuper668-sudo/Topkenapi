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
import { createFileRoute, redirect } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'
import '@/components/topken/topken.css'
import { TopkenSetupContent } from '@/features/dashboard/components/overview/topken-setup'
import { useAuthStore } from '@/stores/auth-store'

/** Docs: signed-in users get the console setup guide, visitors a public copy. */
export const Route = createFileRoute('/docs/')({
  beforeLoad: () => {
    if (useAuthStore.getState().auth.user) {
      throw redirect({
        to: '/dashboard/$section',
        params: { section: 'setup' },
      })
    }
  },
  component: () => (
    <PublicLayout>
      <div className='mx-auto w-full max-w-5xl px-4 py-8'>
        <TopkenSetupContent visitor />
      </div>
    </PublicLayout>
  ),
})
