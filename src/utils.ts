// Strip numeric prefixes from path segments (e.g., "1-virtuoso" -> "virtuoso")
export function stripNumericPrefix(segment: string): string {
  return segment.replace(/^\d{14}-/, '')
}
