import { KnowledgeEditor } from "@/components/knowledge/knowledge-editor"

export const metadata = { title: "Nowy wpis wiki" }

export default function PanelWiedzaNowyPage() {
  return <KnowledgeEditor mode="create" />
}
