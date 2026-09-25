import { JSDOM } from 'jsdom'

/** Returns a (html)->Lexical converter bound to the project's editor config. */
export async function makeHtmlToLexical(payload: any) {
  const lex: any = await import('@payloadcms/richtext-lexical')
  const editorConfig = await lex.editorConfigFactory.default({ config: payload.config })
  const empty = () => ({
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [] }] },
  })
  return (html?: unknown) => {
    const s = (html ?? '').toString().trim()
    if (!s || s === 'null') return empty()
    try {
      const state = lex.convertHTMLToLexical({ editorConfig, html: s, JSDOM })
      return state?.root?.children?.length ? state : empty()
    } catch {
      return empty()
    }
  }
}
