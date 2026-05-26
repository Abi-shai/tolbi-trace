/**
 * Combine class names — mirrors the web cn() utility
 * NativeWind handles merging automatically, this just filters falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
