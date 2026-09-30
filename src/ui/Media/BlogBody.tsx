/* eslint-disable @next/next/no-img-element */
import type { SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";
import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { ComponentProps } from "react";
import { fileUrl } from "@/cms/read";

type Node = SerializedLexicalNode & { children?: Node[]; headerState?: number; colSpan?: number; rowSpan?: number };
type UploadDoc = { url?: string | null; legacySrc?: string | null; alt?: string | null; mimeType?: string | null; filename?: string | null };

const isHeaderRow = (row: Node) => !!row.children?.length && row.children.every((c) => (c.headerState ?? 0) > 0);

/**
 * Blog post rich text. Images and tables render as plain HTML, the way the imported
 * posts looked on the old site (legacy image paths, unstyled tables with a <thead>).
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const doc = typeof node.value === "object" ? (node.value as UploadDoc) : null;
    const src = fileUrl(doc);
    if (!doc || !src) return null;
    if (doc.mimeType && !doc.mimeType.startsWith("image"))
      return (
        <p>
          <a href={src} rel="noopener noreferrer">
            {doc.filename}
          </a>
        </p>
      );
    return (
      <p>
        <img src={src} alt={doc.alt ?? ""} />
      </p>
    );
  },
  table: ({ node, nodesToJSX }) => {
    const rows = ((node as Node).children ?? []) as Node[];
    const head = rows.length > 1 && isHeaderRow(rows[0]) ? [rows[0]] : [];
    return (
      <table>
        {head.length > 0 && <thead>{nodesToJSX({ nodes: head })}</thead>}
        <tbody>{nodesToJSX({ nodes: rows.slice(head.length) })}</tbody>
      </table>
    );
  },
  tablerow: ({ node, nodesToJSX }) => <tr>{nodesToJSX({ nodes: (node as Node).children ?? [] })}</tr>,
  tablecell: ({ node, nodesToJSX }) => {
    const n = node as Node;
    const Tag = (n.headerState ?? 0) > 0 ? "th" : "td";
    // Cells hold paragraphs in the editor; the old site had bare text in cells.
    const nodes = (n.children ?? []).flatMap((c) => (c.type === "paragraph" ? (c.children ?? []) : [c]));
    return (
      <Tag colSpan={n.colSpan && n.colSpan > 1 ? n.colSpan : undefined} rowSpan={n.rowSpan && n.rowSpan > 1 ? n.rowSpan : undefined}>
        {nodesToJSX({ nodes })}
      </Tag>
    );
  },
});

export default function BlogBody({ data, className }: { data: ComponentProps<typeof RichText>["data"]; className?: string }) {
  return <RichText data={data} className={className} converters={converters} />;
}
