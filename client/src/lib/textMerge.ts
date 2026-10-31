/** Span of `base` that was replaced to produce `next`. */
export type DiffSpan = {
  start: number
  end: number
  text: string
}

/** Common-prefix / common-suffix diff between two strings. */
export function diffSpan(base: string, next: string): DiffSpan {
  let start = 0
  const minLen = Math.min(base.length, next.length)
  while (start < minLen && base[start] === next[start]) start += 1

  let endBase = base.length
  let endNext = next.length
  while (
    endBase > start &&
    endNext > start &&
    base[endBase - 1] === next[endNext - 1]
  ) {
    endBase -= 1
    endNext -= 1
  }

  return { start, end: endBase, text: next.slice(start, endNext) }
}

function spansOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && b.start < a.end
}

/**
 * Merge local + remote when both diverged from `base`.
 * Non-overlapping edits both apply; overlapping regions prefer `remote`
 * (caller should re-emit if local still differs).
 */
export function threeWayMerge(
  base: string,
  local: string,
  remote: string,
): string {
  if (local === remote) return local
  if (local === base) return remote
  if (remote === base) return local

  const localDiff = diffSpan(base, local)
  const remoteDiff = diffSpan(base, remote)

  if (spansOverlap(localDiff, remoteDiff)) {
    return remote
  }

  // Apply later-in-document patch first so earlier indices stay valid.
  const patches = [localDiff, remoteDiff].sort((a, b) => b.start - a.start)
  let result = base
  for (const patch of patches) {
    result =
      result.slice(0, patch.start) + patch.text + result.slice(patch.end)
  }
  return result
}
