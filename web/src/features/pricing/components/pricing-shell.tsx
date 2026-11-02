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
import { AuthenticatedLayout, PublicLayout } from '@/components/layout'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Pricing pages keep the console sidebar for signed-in users and the public
 * header for visitors.
 */
export function PricingShell(props: {
  children: React.ReactNode
  /** Adds the public layout's centered container (model details pages). */
  contained?: boolean
}) {
  const signedIn = useAuthStore((state) => Boolean(state.auth.user))

  if (signedIn) {
    return (
      <AuthenticatedLayout>
        <div className='h-full overflow-y-auto'>
          {props.contained ? (
            <div className='container px-4 py-6'>{props.children}</div>
          ) : (
            props.children
          )}
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={props.contained ? undefined : false}>
      {props.children}
    </PublicLayout>
  )
}
