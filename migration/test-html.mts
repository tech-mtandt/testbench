import { boot } from './lib/payload.mjs'
async function main(){
  const p:any = await boot()
  const lex:any = await import('@payloadcms/richtext-lexical')
  const { JSDOM } = await import('jsdom')
  console.log('exports:', ['convertHTMLToLexical','editorConfigFactory'].filter(k=>k in lex).join(', '))
  const editorConfig = await lex.editorConfigFactory.default({ config: p.config })
  const state = lex.convertHTMLToLexical({ editorConfig, html: '<p>Hello <b>world</b>.</p><ul><li>one</li><li>two</li></ul>', JSDOM })
  console.log('state type:', state?.root?.type, '| children:', state?.root?.children?.length)
  // prove it validates: create a throwaway product then delete
  const doc = await p.create({ collection:'products', data:{ title:'__html_test__', slug:'__html_test__', content: state } })
  console.log('created product with richText OK, id', doc.id)
  await p.delete({ collection:'products', id: doc.id })
  console.log('cleaned up')
}
main().then(()=>process.exit(0)).catch(e=>{console.error('ERR:', e.message);process.exit(1)})
