"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toolbar } from "./Toolbar";
import Heading from "@tiptap/extension-heading";

type Props = {
  content: string;
  onChange: (richText: string) => Promise<void>;
};

export default function Tiptap(props: Props) {
  const { content, onChange } = props;

  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-4",
          },
        },
      }),
      Heading.configure({
        HTMLAttributes: {
          class: "text-2xl",
          levels: [1],
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "rounded-xl border min-h-40 border-input p-4 bg-back",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="flex min-h-fit w-full flex-col gap-2">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
