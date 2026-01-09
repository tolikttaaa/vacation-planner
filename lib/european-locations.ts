import type { LocationConfig } from "./types"

// European countries with their subdivisions from Nager.Date API
export const EUROPEAN_LOCATIONS: LocationConfig[] = [
  // Albania
  { id: "al", name: "Albania", countryCode: "AL", weekendDays: [0, 6], color: "", type: "country" },

  // Andorra
  { id: "ad", name: "Andorra", countryCode: "AD", weekendDays: [0, 6], color: "", type: "country" },

  // Austria
  { id: "at", name: "Austria", countryCode: "AT", weekendDays: [0, 6], color: "", type: "country" },
  {
    id: "at-1",
    name: "Austria — Burgenland",
    countryCode: "AT",
    regionCode: "AT-1",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-2",
    name: "Austria — Carinthia",
    countryCode: "AT",
    regionCode: "AT-2",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-3",
    name: "Austria — Lower Austria",
    countryCode: "AT",
    regionCode: "AT-3",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-4",
    name: "Austria — Upper Austria",
    countryCode: "AT",
    regionCode: "AT-4",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-5",
    name: "Austria — Salzburg",
    countryCode: "AT",
    regionCode: "AT-5",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-6",
    name: "Austria — Styria",
    countryCode: "AT",
    regionCode: "AT-6",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-7",
    name: "Austria — Tyrol",
    countryCode: "AT",
    regionCode: "AT-7",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-8",
    name: "Austria — Vorarlberg",
    countryCode: "AT",
    regionCode: "AT-8",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "at-9",
    name: "Austria — Vienna",
    countryCode: "AT",
    regionCode: "AT-9",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },

  // Belarus
  { id: "by", name: "Belarus", countryCode: "BY", weekendDays: [0, 6], color: "", type: "country" },

  // Belgium
  { id: "be", name: "Belgium", countryCode: "BE", weekendDays: [0, 6], color: "", type: "country" },

  // Bosnia and Herzegovina
  { id: "ba", name: "Bosnia and Herzegovina", countryCode: "BA", weekendDays: [0, 6], color: "", type: "country" },

  // Bulgaria
  { id: "bg", name: "Bulgaria", countryCode: "BG", weekendDays: [0, 6], color: "", type: "country" },

  // Croatia
  { id: "hr", name: "Croatia", countryCode: "HR", weekendDays: [0, 6], color: "", type: "country" },

  // Cyprus
  { id: "cy", name: "Cyprus", countryCode: "CY", weekendDays: [0, 6], color: "", type: "country" },

  // Czech Republic
  { id: "cz", name: "Czech Republic", countryCode: "CZ", weekendDays: [0, 6], color: "", type: "country" },

  // Denmark
  { id: "dk", name: "Denmark", countryCode: "DK", weekendDays: [0, 6], color: "", type: "country" },

  // Estonia
  { id: "ee", name: "Estonia", countryCode: "EE", weekendDays: [0, 6], color: "", type: "country" },

  // Finland
  { id: "fi", name: "Finland", countryCode: "FI", weekendDays: [0, 6], color: "", type: "country" },

  // France
  { id: "fr", name: "France", countryCode: "FR", weekendDays: [0, 6], color: "", type: "country" },
  {
    id: "fr-als",
    name: "France — Alsace",
    countryCode: "FR",
    regionCode: "FR-A",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "fr-mos",
    name: "France — Moselle",
    countryCode: "FR",
    regionCode: "FR-57",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },

  // Germany
  { id: "de", name: "Germany", countryCode: "DE", weekendDays: [0, 6], color: "", type: "country" },
  {
    id: "de-bw",
    name: "Germany — Baden-Württemberg",
    countryCode: "DE",
    regionCode: "DE-BW",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-by",
    name: "Germany — Bavaria",
    countryCode: "DE",
    regionCode: "DE-BY",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-be",
    name: "Germany — Berlin",
    countryCode: "DE",
    regionCode: "DE-BE",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-bb",
    name: "Germany — Brandenburg",
    countryCode: "DE",
    regionCode: "DE-BB",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-hb",
    name: "Germany — Bremen",
    countryCode: "DE",
    regionCode: "DE-HB",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-hh",
    name: "Germany — Hamburg",
    countryCode: "DE",
    regionCode: "DE-HH",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-he",
    name: "Germany — Hesse",
    countryCode: "DE",
    regionCode: "DE-HE",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-mv",
    name: "Germany — Mecklenburg-Vorpommern",
    countryCode: "DE",
    regionCode: "DE-MV",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-ni",
    name: "Germany — Lower Saxony",
    countryCode: "DE",
    regionCode: "DE-NI",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-nw",
    name: "Germany — North Rhine-Westphalia",
    countryCode: "DE",
    regionCode: "DE-NW",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-rp",
    name: "Germany — Rhineland-Palatinate",
    countryCode: "DE",
    regionCode: "DE-RP",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-sl",
    name: "Germany — Saarland",
    countryCode: "DE",
    regionCode: "DE-SL",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-sn",
    name: "Germany — Saxony",
    countryCode: "DE",
    regionCode: "DE-SN",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-st",
    name: "Germany — Saxony-Anhalt",
    countryCode: "DE",
    regionCode: "DE-ST",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-sh",
    name: "Germany — Schleswig-Holstein",
    countryCode: "DE",
    regionCode: "DE-SH",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "de-th",
    name: "Germany — Thuringia",
    countryCode: "DE",
    regionCode: "DE-TH",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },

  // Greece
  { id: "gr", name: "Greece", countryCode: "GR", weekendDays: [0, 6], color: "", type: "country" },

  // Hungary
  { id: "hu", name: "Hungary", countryCode: "HU", weekendDays: [0, 6], color: "", type: "country" },

  // Iceland
  { id: "is", name: "Iceland", countryCode: "IS", weekendDays: [0, 6], color: "", type: "country" },

  // Ireland
  { id: "ie", name: "Ireland", countryCode: "IE", weekendDays: [0, 6], color: "", type: "country" },

  // Italy
  { id: "it", name: "Italy", countryCode: "IT", weekendDays: [0, 6], color: "", type: "country" },

  // Latvia
  { id: "lv", name: "Latvia", countryCode: "LV", weekendDays: [0, 6], color: "", type: "country" },

  // Liechtenstein
  { id: "li", name: "Liechtenstein", countryCode: "LI", weekendDays: [0, 6], color: "", type: "country" },

  // Lithuania
  { id: "lt", name: "Lithuania", countryCode: "LT", weekendDays: [0, 6], color: "", type: "country" },

  // Luxembourg
  { id: "lu", name: "Luxembourg", countryCode: "LU", weekendDays: [0, 6], color: "", type: "country" },

  // Malta
  { id: "mt", name: "Malta", countryCode: "MT", weekendDays: [0, 6], color: "", type: "country" },

  // Moldova
  { id: "md", name: "Moldova", countryCode: "MD", weekendDays: [0, 6], color: "", type: "country" },

  // Monaco
  { id: "mc", name: "Monaco", countryCode: "MC", weekendDays: [0, 6], color: "", type: "country" },

  // Montenegro
  { id: "me", name: "Montenegro", countryCode: "ME", weekendDays: [0, 6], color: "", type: "country" },

  // Netherlands
  { id: "nl", name: "Netherlands", countryCode: "NL", weekendDays: [0, 6], color: "", type: "country" },

  // North Macedonia
  { id: "mk", name: "North Macedonia", countryCode: "MK", weekendDays: [0, 6], color: "", type: "country" },

  // Norway
  { id: "no", name: "Norway", countryCode: "NO", weekendDays: [0, 6], color: "", type: "country" },

  // Poland
  { id: "pl", name: "Poland", countryCode: "PL", weekendDays: [0, 6], color: "", type: "country" },

  // Portugal
  { id: "pt", name: "Portugal", countryCode: "PT", weekendDays: [0, 6], color: "", type: "country" },

  // Romania
  { id: "ro", name: "Romania", countryCode: "RO", weekendDays: [0, 6], color: "", type: "country" },

  // Russia
  { id: "ru", name: "Russia", countryCode: "RU", weekendDays: [0, 6], color: "", type: "country" },

  // San Marino
  { id: "sm", name: "San Marino", countryCode: "SM", weekendDays: [0, 6], color: "", type: "country" },

  // Serbia
  { id: "rs", name: "Serbia", countryCode: "RS", weekendDays: [0, 6], color: "", type: "country" },

  // Slovakia
  { id: "sk", name: "Slovakia", countryCode: "SK", weekendDays: [0, 6], color: "", type: "country" },

  // Slovenia
  { id: "si", name: "Slovenia", countryCode: "SI", weekendDays: [0, 6], color: "", type: "country" },

  // Spain
  { id: "es", name: "Spain", countryCode: "ES", weekendDays: [0, 6], color: "", type: "country" },
  {
    id: "es-an",
    name: "Spain — Andalusia",
    countryCode: "ES",
    regionCode: "ES-AN",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-ar",
    name: "Spain — Aragon",
    countryCode: "ES",
    regionCode: "ES-AR",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-as",
    name: "Spain — Asturias",
    countryCode: "ES",
    regionCode: "ES-AS",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-cn",
    name: "Spain — Canary Islands",
    countryCode: "ES",
    regionCode: "ES-CN",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-cb",
    name: "Spain — Cantabria",
    countryCode: "ES",
    regionCode: "ES-CB",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-cl",
    name: "Spain — Castile and León",
    countryCode: "ES",
    regionCode: "ES-CL",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-cm",
    name: "Spain — Castilla-La Mancha",
    countryCode: "ES",
    regionCode: "ES-CM",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-ct",
    name: "Spain — Catalonia",
    countryCode: "ES",
    regionCode: "ES-CT",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-ex",
    name: "Spain — Extremadura",
    countryCode: "ES",
    regionCode: "ES-EX",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-ga",
    name: "Spain — Galicia",
    countryCode: "ES",
    regionCode: "ES-GA",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-ib",
    name: "Spain — Balearic Islands",
    countryCode: "ES",
    regionCode: "ES-IB",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-ri",
    name: "Spain — La Rioja",
    countryCode: "ES",
    regionCode: "ES-RI",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-md",
    name: "Spain — Madrid",
    countryCode: "ES",
    regionCode: "ES-MD",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-mc",
    name: "Spain — Murcia",
    countryCode: "ES",
    regionCode: "ES-MC",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-nc",
    name: "Spain — Navarre",
    countryCode: "ES",
    regionCode: "ES-NC",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-pv",
    name: "Spain — Basque Country",
    countryCode: "ES",
    regionCode: "ES-PV",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "es-vc",
    name: "Spain — Valencia",
    countryCode: "ES",
    regionCode: "ES-VC",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },

  // Sweden
  { id: "se", name: "Sweden", countryCode: "SE", weekendDays: [0, 6], color: "", type: "country" },

  // Switzerland
  { id: "ch", name: "Switzerland", countryCode: "CH", weekendDays: [0, 6], color: "", type: "country" },
  {
    id: "ch-ag",
    name: "Switzerland — Aargau",
    countryCode: "CH",
    regionCode: "CH-AG",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ai",
    name: "Switzerland — Appenzell Innerrhoden",
    countryCode: "CH",
    regionCode: "CH-AI",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ar",
    name: "Switzerland — Appenzell Ausserrhoden",
    countryCode: "CH",
    regionCode: "CH-AR",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-be",
    name: "Switzerland — Bern",
    countryCode: "CH",
    regionCode: "CH-BE",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-bl",
    name: "Switzerland — Basel-Landschaft",
    countryCode: "CH",
    regionCode: "CH-BL",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-bs",
    name: "Switzerland — Basel-Stadt",
    countryCode: "CH",
    regionCode: "CH-BS",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-fr",
    name: "Switzerland — Fribourg",
    countryCode: "CH",
    regionCode: "CH-FR",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ge",
    name: "Switzerland — Geneva",
    countryCode: "CH",
    regionCode: "CH-GE",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-gl",
    name: "Switzerland — Glarus",
    countryCode: "CH",
    regionCode: "CH-GL",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-gr",
    name: "Switzerland — Graubünden",
    countryCode: "CH",
    regionCode: "CH-GR",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ju",
    name: "Switzerland — Jura",
    countryCode: "CH",
    regionCode: "CH-JU",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-lu",
    name: "Switzerland — Lucerne",
    countryCode: "CH",
    regionCode: "CH-LU",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ne",
    name: "Switzerland — Neuchâtel",
    countryCode: "CH",
    regionCode: "CH-NE",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-nw",
    name: "Switzerland — Nidwalden",
    countryCode: "CH",
    regionCode: "CH-NW",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ow",
    name: "Switzerland — Obwalden",
    countryCode: "CH",
    regionCode: "CH-OW",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-sg",
    name: "Switzerland — St. Gallen",
    countryCode: "CH",
    regionCode: "CH-SG",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-sh",
    name: "Switzerland — Schaffhausen",
    countryCode: "CH",
    regionCode: "CH-SH",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-so",
    name: "Switzerland — Solothurn",
    countryCode: "CH",
    regionCode: "CH-SO",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-sz",
    name: "Switzerland — Schwyz",
    countryCode: "CH",
    regionCode: "CH-SZ",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-tg",
    name: "Switzerland — Thurgau",
    countryCode: "CH",
    regionCode: "CH-TG",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ti",
    name: "Switzerland — Ticino",
    countryCode: "CH",
    regionCode: "CH-TI",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-ur",
    name: "Switzerland — Uri",
    countryCode: "CH",
    regionCode: "CH-UR",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-vd",
    name: "Switzerland — Vaud",
    countryCode: "CH",
    regionCode: "CH-VD",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-vs",
    name: "Switzerland — Valais",
    countryCode: "CH",
    regionCode: "CH-VS",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-zg",
    name: "Switzerland — Zug",
    countryCode: "CH",
    regionCode: "CH-ZG",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "ch-zh",
    name: "Switzerland — Zürich",
    countryCode: "CH",
    regionCode: "CH-ZH",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },

  // Turkey
  { id: "tr", name: "Turkey", countryCode: "TR", weekendDays: [0, 6], color: "", type: "country" },

  // Ukraine
  { id: "ua", name: "Ukraine", countryCode: "UA", weekendDays: [0, 6], color: "", type: "country" },

  // United Kingdom (main entry with ISO code GB)
  { id: "gb", name: "United Kingdom", countryCode: "GB", weekendDays: [0, 6], color: "", type: "country" },
  {
    id: "gb-eng",
    name: "United Kingdom — England",
    countryCode: "GB",
    regionCode: "GB-ENG",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "gb-nir",
    name: "United Kingdom — Northern Ireland",
    countryCode: "GB",
    regionCode: "GB-NIR",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "gb-sct",
    name: "United Kingdom — Scotland",
    countryCode: "GB",
    regionCode: "GB-SCT",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },
  {
    id: "gb-wls",
    name: "United Kingdom — Wales",
    countryCode: "GB",
    regionCode: "GB-WLS",
    weekendDays: [0, 6],
    color: "",
    type: "region",
  },

  // Vatican City
  { id: "va", name: "Vatican City", countryCode: "VA", weekendDays: [0, 6], color: "", type: "country" },
]

// Helper to get location by ID
export function getLocationById(id: string): LocationConfig | undefined {
  return EUROPEAN_LOCATIONS.find((loc) => loc.id === id)
}

// Helper to group locations by country
export function getLocationsByCountry(): Map<string, LocationConfig[]> {
  const grouped = new Map<string, LocationConfig[]>()

  for (const location of EUROPEAN_LOCATIONS) {
    const countryName = location.name.split(" — ")[0]
    if (!grouped.has(countryName)) {
      grouped.set(countryName, [])
    }
    grouped.get(countryName)!.push(location)
  }

  return grouped
}
