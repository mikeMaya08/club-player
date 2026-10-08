const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'BR', 'DIV', 'SPAN'])

/** Keeps a small set of formatting tags from coach notes and drops everything else (including attributes). */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const clean = (node: Element) => {
    for (const child of Array.from(node.children)) {
      clean(child)
      if (!ALLOWED.has(child.tagName)) {
        child.replaceWith(...Array.from(child.childNodes))
      } else {
        for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name)
      }
    }
  }
  clean(doc.body)
  return doc.body.innerHTML
}
