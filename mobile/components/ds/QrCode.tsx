import Svg, { Path } from 'react-native-svg'

/** Deterministic decorative QR (ported from the prototype's qrSvg) — a
 *  faithful-looking code with finder patterns; not a real scannable payload. */
function buildPath(): string {
  const N = 29
  const on = (i: number, j: number): boolean => {
    const finder = (a: number, b: number) =>
      i >= a && i < a + 7 && j >= b && j < b + 7 &&
      !(((i - a === 1 || i - a === 5) && j - b >= 1 && j - b <= 5) ||
        ((j - b === 1 || j - b === 5) && i - a >= 1 && i - a <= 5))
    if (i < 7 && j < 7) return finder(0, 0)
    if (i < 7 && j >= N - 7) return finder(0, N - 7)
    if (i >= N - 7 && j < 7) return finder(N - 7, 0)
    if ((i < 8 && (j === 7 || (j >= N - 8 && j === N - 8))) || (j < 8 && (i === 7 || i === N - 8))) return false
    if (i === 6) return j % 2 === 0
    if (j === 6) return i % 2 === 0
    if (i >= N - 9 && i < N - 4 && j >= N - 9 && j < N - 4) {
      const a = i - (N - 9), b = j - (N - 9)
      return a === 0 || a === 4 || b === 0 || b === 4 || (a === 2 && b === 2)
    }
    return (i * 31 + j * 17 + ((i * j) % 5) * 13) % 9 < 4
  }
  let d = ''
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      if (on(i, j)) d += `M${j} ${i}h1v1h-1z`
  return d
}

const PATH = buildPath()

export function QrCode({ size = 170, color = '#101828' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 29 29">
      <Path d={PATH} fill={color} />
    </Svg>
  )
}
