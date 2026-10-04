/** Map free-text Małopolska locations to powiat / city-county keys used in seed. */
const LOCATION_TO_COUNTY: Record<string, string> = {
  kraków: "m. Kraków",
  krakow: "m. Kraków",
  "m. kraków": "m. Kraków",
  "m. krakow": "m. Kraków",
  tarnów: "m. Tarnów",
  tarnow: "m. Tarnów",
  "nowy sącz": "nowosądecki",
  "nowy sacz": "nowosądecki",
  limanowa: "limanowski",
  olkusz: "olkuski",
  wadowice: "wadowicki",
  myślenice: "myślenicki",
  myslenice: "myślenicki",
  oświęcim: "oświęcimski",
  oswiecim: "oświęcimski",
  chrzanów: "chrzanowski",
  chrzanow: "chrzanowski",
  bochnia: "bocheński",
  brzesko: "brzeski",
  gorlice: "gorlicki",
  proszowice: "proszowicki",
  miechów: "miechowski",
  miechow: "miechowski",
  suski: "suski",
  tatrzański: "tatrzański",
  nowotarski: "nowotarski",
  wielicki: "wielicki",
}

export function normalizeCounty(input?: string): string | undefined {
  if (!input?.trim()) return undefined
  const key = input.trim().toLowerCase()
  if (LOCATION_TO_COUNTY[key]) return LOCATION_TO_COUNTY[key]
  // already a county-like value
  if (key.endsWith("ski") || key.endsWith("cki") || key.startsWith("m.")) {
    return input.trim()
  }
  return input.trim()
}

export function countyLabel(county: string): string {
  if (county.startsWith("m.")) return county
  if (county === "Kraków" || county === "Tarnów") return `m. ${county}`
  return county.startsWith("powiat") ? county : `powiat ${county}`
}

/** Powiaty / miasta na prawach powiatu używane w filtrach katalogu. */
export const MALOPOLSKA_COUNTIES = [
  "m. Kraków",
  "m. Tarnów",
  "myślenicki",
  "nowosądecki",
  "olkuski",
  "wadowicki",
  "limanowski",
] as const
