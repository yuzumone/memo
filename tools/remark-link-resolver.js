import { visit } from 'unist-util-visit';

/**
 * A remark plugin that resolves Hugo's `relref` shortcodes by directly
 * manipulating the Markdown AST to create proper link nodes.
 */
export default function remarkLinkResolver(options) {
  const { fileMap } = options;
  if (!fileMap) {
    console.error('[remark-link-resolver] Fatal: fileMap option is missing!');
    return;
  }

  // Regex to find [text]({{< relref "path" >}})
  const HUGO_RELREF_LINK = /\[([^\]]+?)\]\(\s*\{\{\s*(?:<|%|&lt;)\s*relref\s+["'“”]([^"'“”]+?)["'“”]\s*(?:>|%|&gt;)\s*\}\}\s*\)/g;

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      // Don't run on nodes that are already inside a link
      if (!parent || parent.type === 'link') return;

      const text = node.value;
      if (typeof text !== 'string' || !HUGO_RELREF_LINK.test(text)) {
        return;
      }

      const newChildren = [];
      let lastIndex = 0;
      let match;

      // Reset regex state before using exec in a loop
      HUGO_RELREF_LINK.lastIndex = 0;

      while ((match = HUGO_RELREF_LINK.exec(text)) !== null) {
        // 1. Add the plain text before the match
        if (match.index > lastIndex) {
          newChildren.push({
            type: 'text',
            value: text.slice(lastIndex, match.index),
          });
        }

        // 2. Create and add the new link node from the match
        const linkText = match[1];
        const fileName = match[2];
        const slug = fileMap.get(fileName);

        if (slug) {
          newChildren.push({
            type: 'link',
            url: slug,
            children: [{ type: 'text', value: linkText }],
          });
        } else {
          // If link can't be resolved, create a text node with a warning.
          console.warn(`[remark-link-resolver] Could not resolve relref for: "${fileName}".`);
          newChildren.push({
            type: 'text',
            value: `[${linkText} (unresolved link: ${fileName})]`,
          });
        }

        lastIndex = HUGO_RELREF_LINK.lastIndex;
      }

      // If there were no matches, exit.
      if (lastIndex === 0) {
        return;
      }
  
      // 3. Add any remaining text after the last match
      if (text.length > lastIndex) {
        newChildren.push({
          type: 'text',
          value: text.slice(lastIndex),
        });
      }

      // 4. Replace the original text node with the new array of nodes
      parent.children.splice(index, 1, ...newChildren);

      // Tell visit to skip the nodes we just added
      return visit.SKIP;
    });
  };
}
