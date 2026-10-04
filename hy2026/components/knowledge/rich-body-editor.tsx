"use client"

import type { Editor } from "@/components/kibo-ui/editor"
import {
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorClearFormatting,
  EditorFloatingMenu,
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
    <EditorProvider
      key={editorKey}
      className="relative min-h-72 w-full overflow-y-auto rounded-2xl border border-border bg-card p-3 pb-14 md:p-4"
      content={initialHtml}
      onUpdate={handleUpdate}
      placeholder="Zacznij pisać treść wpisu…"
    >
      <EditorFloatingMenu>
        <EditorNodeHeading1 hideName />
        <EditorNodeBulletList hideName />
        <EditorNodeQuote hideName />
        <EditorNodeCode hideName />
        <EditorNodeTable hideName />
      </EditorFloatingMenu>
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
  )
}
