import { TesterCatalog } from "@/components/tester/tester-catalog"
import { getServices } from "@/lib/services"

export const metadata = { title: "Tester innowacji" }

export default async function TesterPage() {
  const inns = await getServices().innovations.list({ testRecruiting: true })

  return <TesterCatalog items={inns} />
}
