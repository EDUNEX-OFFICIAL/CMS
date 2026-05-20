"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type RichTextEditorProps = {
  value: Record<string, unknown> | null;
  onChange: (value: Record<string, unknown>) => void;
};

const emptyDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value ?? emptyDoc,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value ?? emptyDoc);
    if (current !== next) {
      editor.commands.setContent(value ?? emptyDoc);
    }
  }, [editor, value]);

  return <EditorContent editor={editor} />;
}
