/**
 * Discovery entry for the optional GPU investigation bundle.
 * Composition is owned by {@link ../cordis.patch.yml}.
 * @module @deepseek-ai/dsh-gpu-investigation-bundle
 */

/** Cordis plugin name for Loader diagnostics. */
export const name = 'gpu-investigation-bundle'

/** No Host runtime behavior; the patch mounts tools and Client UI. */
export function apply(): void {}
