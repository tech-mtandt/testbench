import React, { JSX } from "react";
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText as RichTextConverter } from "@payloadcms/richtext-lexical/react";

type Props = {
  data: SerializedEditorState;
} & React.HTMLAttributes<HTMLDivElement>;

export function RichText(props: Props): JSX.Element {
  const { className, ...rest } = props;
  return <RichTextConverter {...rest} className={className} />;
}
