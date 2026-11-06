/**
 * Browser entry: register the GPU memory investigation sidebar tab.
 */

import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { MemoryInvestigationView } from './MemoryInvestigationView.tsx'
import { en, es, de, fr, ja, NS, pt, ru, zh } from './locales.ts'

export { NS }
export type { GpuInvestigationKey } from './locales.ts'
export { MemoryInvestigationView } from './MemoryInvestigationView.tsx'

/** Client inject list for the Cordis loader. */
export const inject = [
  'locale',
  'sidebarRightTabs',
  'slots',
]

/**
 * Register locale dictionaries and the sidebar investigation tab.
 * @param ctx - Browser plugin context.
 * @returns Disposer.
 */
export function apply(ctx: Context): () => void {
  const id = '@deepseek-ai/dsh-client-ui-gpu-investigation'
  ctx.effect(() => ctx.locale.register(NS, { zh, en, ja, es, fr, de, ru, pt }), 'gpu-investigation: locale')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.sidebarRightTabs.register({
    id,
    kind: 'gpu-memory-investigation',
    title: () => t('tab.title'),
    guide: [{
      id: 'open',
      order: 70,
      title: () => t('tab.title'),
      description: () => t('tab.description'),
    }],
  }), 'gpu-investigation: sidebar tab')
  ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab',
    key: id,
    locale: NS,
    inject: () => ({}),
  }, MemoryInvestigationView))
  return () => undefined
}
