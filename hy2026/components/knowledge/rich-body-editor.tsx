"use client"

import type { Editor } from "@/components/kibo-ui/editor"
import {
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorClearFormatting,
  EditorFormatBold,
  EditorFormatCode,
  EditorFormatItalic,
  EditorFormatStrike,
  EditorFormatSubscript,
  EditorFormatSuperscript,
  EditorFormatUnderline,
  EditorLinkSelector,
  EditorNodeBulletList,
  EditorNodeCode,
  EditorNodeHeading1,
  EditorNodeHeading2,
  EditorNodeHeading3,
  EditorNodeOrderedList,
  EditorNodeQuote,
  EditorNodeTable,
  EditorNodeTaskList,
  EditorNodeText,
  EditorProvider,
  EditorSelector,
  EditorTableColumnAfter,
  EditorTableColumnBefore,
  EditorTableColumnDelete,
  EditorTableColumnMenu,
  EditorTableDelete,
  EditorTableFix,
  EditorTableGlobalMenu,
  EditorTableHeaderColumnToggle,
  EditorTableHeaderRowToggle,
  EditorTableMenu,
  EditorTableMergeCells,
  EditorTableRowAfter,
  EditorTableRowBefore,
  EditorTableRowDelete,
  EditorTableRowMenu,
  EditorTableSplitCell,
} from "@/components/kibo-ui/editor"

export function RichBodyEditor({
  initialHtml,
  onHtmlChange,
  editorKey,
}: {
  initialHtml: string
  onHtmlChange: (html: string) => void
  editorKey: string
}) {
  const handleUpdate = ({ editor }: { editor: Editor }) => {
    onHtmlChange(editor.getHTML())
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <EditorProvider
        key={editorKey}
        className="most-editor relative min-h-72 w-full [&_.ProseMirror]:min-h-56 [&_.ProseMirror]:px-3 [&_.ProseMirror]:pt-14 [&_.ProseMirror]:pb-14 [&_.ProseMirror]:outline-none md:[&_.ProseMirror]:px-4"
        content={initialHtml}
        onUpdate={handleUpdate}
        placeholder="Zacznij pisać treść wpisu…"
      >
        {/* Fixed insert bar above content — FloatingMenu overlays first line on mobile. */}
        <div
          className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-0.5 border-b border-border bg-card/95 px-1.5 py-1.5 backdrop-blur-sm"
          role="toolbar"
          aria-label="Wstawianie bloków"
        >
          <EditorNodeText hideName />
          <EditorNodeHeading1 hideName />
          <EditorNodeBulletList hideName />
          <EditorNodeOrderedList hideName />
          <EditorNodeQuote hideName />
          <EditorNodeCode hideName />
          <EditorNodeTable hideName />
        </div>
        <EditorBubbleMenu>
          <EditorSelector title="Tekst">
            <EditorNodeText />
            <EditorNodeHeading1 />
            <EditorNodeHeading2 />
            <EditorNodeHeading3 />
            <EditorNodeBulletList />
            <EditorNodeOrderedList />
            <EditorNodeTaskList />
            <EditorNodeQuote />
            <EditorNodeCode />
          </EditorSelector>
          <EditorSelector title="Format">
            <EditorFormatBold />
            <EditorFormatItalic />
            <EditorFormatUnderline />
            <EditorFormatStrike />
            <EditorFormatCode />
            <EditorFormatSuperscript />
            <EditorFormatSubscript />
          </EditorSelector>
          <EditorLinkSelector />
          <EditorClearFormatting />
        </EditorBubbleMenu>
        <EditorTableMenu>
          <EditorTableColumnMenu>
            <EditorTableColumnBefore />
            <EditorTableColumnAfter />
            <EditorTableColumnDelete />
          </EditorTableColumnMenu>
          <EditorTableRowMenu>
            <EditorTableRowBefore />
            <EditorTableRowAfter />
            <EditorTableRowDelete />
          </EditorTableRowMenu>
          <EditorTableGlobalMenu>
            <EditorTableHeaderColumnToggle />
            <EditorTableHeaderRowToggle />
            <EditorTableDelete />
            <EditorTableMergeCells />
            <EditorTableSplitCell />
            <EditorTableFix />
          </EditorTableGlobalMenu>
        </EditorTableMenu>
        <EditorCharacterCount.Words>Słowa: </EditorCharacterCount.Words>
      </EditorProvider>
    </div>
  )
}
