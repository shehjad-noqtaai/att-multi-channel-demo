// Server-side Portable Text token resolution. resolveTokens is async; PT
// React serializers are sync. We walk every block → every span and replace
// `span.text` with the merged result before handing the blocks to
// <PortableText>.

import type {MergeField, MinimalBrief} from '@studio/personalization/generate/tokens'
import {mergeText} from '../sanity/tokens'
import type {PortableTextBlock, PortableTextSpan} from '../types'

/**
 * mergeBlocks — pre-resolve {{token}} occurrences inside every text-bearing
 * span of every block. Non-block content (images, embeds) is passed through.
 */
export async function mergeBlocks(
  blocks: PortableTextBlock[] | undefined,
  brief: MinimalBrief,
  mergeFields: MergeField[],
): Promise<PortableTextBlock[]> {
  if (!blocks || blocks.length === 0) return []
  const out: PortableTextBlock[] = []
  for (const block of blocks) {
    if (block?._type !== 'block' || !Array.isArray(block.children)) {
      out.push(block)
      continue
    }
    const mergedChildren: PortableTextSpan[] = []
    for (const span of block.children) {
      if (span?._type === 'span' && typeof span.text === 'string') {
        mergedChildren.push({
          ...span,
          text: await mergeText(span.text, brief, mergeFields),
        })
      } else {
        mergedChildren.push(span)
      }
    }
    out.push({...block, children: mergedChildren})
  }
  return out
}
