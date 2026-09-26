export type Gender = "Female" | "Male";

export type NeuralVoice = {
  id: string;
  name: string;
  lang: "en-US" | "en-GB";
  gender: Gender;
  grade: string;
};

export type Language = {
  code: string;
  name: string;
  region: string;
  nativeName: string;
  sample: string;
  neural: boolean;
};

export const LANGUAGES: Language[] = [
  {
    code: "en-US",
    name: "English",
    region: "United States",
    nativeName: "English",
    sample:
      "The room was still except for the rain on the glass, and a voice that had nowhere else to go.",
    neural: true,
  },
  {
    code: "en-GB",
    name: "English",
    region: "United Kingdom",
    nativeName: "English",
    sample:
      "Good evening. This is a quiet hour, spoken slowly, as if the words themselves were made of weather.",
    neural: true,
  },
  {
    code: "es-ES",
    name: "Spanish",
    region: "Spain",
    nativeName: "Español",
    sample: "La lluvia cae suave sobre el tejado, y la noche aprende a escuchar.",
    neural: false,
  },
  {
    code: "es-MX",
    name: "Spanish",
    region: "Mexico",
    nativeName: "Español",
    sample: "Buenas noches. Hay una voz que camina despacio por la casa.",
    neural: false,
  },
  {
    code: "fr-FR",
    name: "French",
    region: "France",
    nativeName: "Français",
    sample: "Le silence des bibliothèques a une musique à lui, si l'on sait l'entendre.",
    neural: false,
  },
  {
    code: "de-DE",
    name: "German",
    region: "Germany",
    nativeName: "Deutsch",
    sample: "Der Wind bewegt die Kiefern wie eine langsame Tide.",
    neural: false,
  },
  {
    code: "it-IT",
    name: "Italian",
    region: "Italy",
    nativeName: "Italiano",
    sample: "La sera entra in punta di piedi e lascia le parole sul tavolo.",
    neural: false,
  },
  {
    code: "pt-BR",
    name: "Portuguese",
    region: "Brazil",
    nativeName: "Português",
    sample: "A cidade respira baixo depois da chuva, e alguém ainda fala com carinho.",
    neural: false,
  },
  {
    code: "pt-PT",
    name: "Portuguese",
    region: "Portugal",
    nativeName: "Português",
    sample: "Há um rio antigo na voz, e ele não tem pressa de chegar ao mar.",
    neural: false,
  },
  {
    code: "nl-NL",
    name: "Dutch",
    region: "Netherlands",
    nativeName: "Nederlands",
    sample: "De avond valt zacht, als een jas over de schouders van de straat.",
    neural: false,
  },
  {
    code: "pl-PL",
    name: "Polish",
    region: "Poland",
    nativeName: "Polski",
    sample: "Deszcz pisze po szybie litery, których nikt nie musi czytać.",
    neural: false,
  },
  {
    code: "sv-SE",
    name: "Swedish",
    region: "Sweden",
    nativeName: "Svenska",
    sample: "Ljuset stannar kvar i fönstret en stund efter att dagen har gått.",
    neural: false,
  },
  {
    code: "nb-NO",
    name: "Norwegian",
    region: "Norway",
    nativeName: "Norsk",
    sample: "Det er stille i huset, men stemmen finner likevel veien.",
    neural: false,
  },
  {
    code: "da-DK",
    name: "Danish",
    region: "Denmark",
    nativeName: "Dansk",
    sample: "Aftenen lægger sig over byen som et tæppe, der stadig er varmt.",
    neural: false,
  },
  {
    code: "fi-FI",
    name: "Finnish",
    region: "Finland",
    nativeName: "Suomi",
    sample: "Metsä kuuntelee, kun joku puhuu hiljaa lumen keskellä.",
    neural: false,
  },
  {
    code: "ru-RU",
    name: "Russian",
    region: "Russia",
    nativeName: "Русский",
    sample: "Вечер держит паузу, и голос идёт по ней осторожно.",
    neural: false,
  },
  {
    code: "uk-UA",
    name: "Ukrainian",
    region: "Ukraine",
    nativeName: "Українська",
    sample: "Ніч стоїть біля вікна і слухає, як дощ читає вголос.",
    neural: false,
  },
  {
    code: "el-GR",
    name: "Greek",
    region: "Greece",
    nativeName: "Ελληνικά",
    sample: "Η φωνή περπατά αργά στο δωμάτιο, σαν να μη θέλει να ξυπνήσει το φως.",
    neural: false,
  },
  {
    code: "tr-TR",
    name: "Turkish",
    region: "Turkey",
    nativeName: "Türkçe",
    sample: "Akşam pencereye yaslanır ve sözler yavaşça odaya girer.",
    neural: false,
  },
  {
    code: "ar-SA",
    name: "Arabic",
    region: "Arabic",
    nativeName: "العربية",
    sample: "المساء يجلس قرب النافذة، والصوت يمرّ ببطء كأنه ضوء خافت.",
    neural: false,
  },
  {
    code: "he-IL",
    name: "Hebrew",
    region: "Israel",
    nativeName: "עברית",
    sample: "הלילה עומד בפתח, והקול מדבר כמו מישהו שחוזר הביתה.",
    neural: false,
  },
  {
    code: "hi-IN",
    name: "Hindi",
    region: "India",
    nativeName: "हिन्दी",
    sample: "बारिश की आवाज़ छत पर है, और कमरे में एक धीमी सी बात चल रही है।",
    neural: false,
  },
  {
    code: "ja-JP",
    name: "Japanese",
    region: "Japan",
    nativeName: "日本語",
    sample: "雨音だけが残って、言葉はゆっくりと部屋を横切っていく。",
    neural: false,
  },
  {
    code: "ko-KR",
    name: "Korean",
    region: "Korea",
    nativeName: "한국어",
    sample: "창문에 빗소리가 머물고, 목소리는 그 사이를 천천히 지나간다.",
    neural: false,
  },
  {
    code: "zh-CN",
    name: "Chinese",
    region: "Simplified",
    nativeName: "中文",
    sample: "雨停了一会儿，声音还在房间里慢慢走着。",
    neural: false,
  },
  {
    code: "zh-TW",
    name: "Chinese",
    region: "Traditional",
    nativeName: "中文",
    sample: "夜晚把燈調暗，讓句子自己找到路。",
    neural: false,
  },
  {
    code: "th-TH",
    name: "Thai",
    region: "Thailand",
    nativeName: "ไทย",
    sample: "ฝนค่อย ๆ พูดบนหลังคา และห้องนี้ตั้งใจฟัง",
    neural: false,
  },
  {
    code: "vi-VN",
    name: "Vietnamese",
    region: "Vietnam",
    nativeName: "Tiếng Việt",
    sample: "Đêm ngồi xuống bên cửa sổ, để giọng nói đi chậm qua căn phòng.",
    neural: false,
  },
  {
    code: "id-ID",
    name: "Indonesian",
    region: "Indonesia",
    nativeName: "Bahasa Indonesia",
    sample: "Hujan merapikan malam, dan sebuah suara berjalan pelan di lorong.",
    neural: false,
  },
  {
    code: "cs-CZ",
    name: "Czech",
    region: "Czechia",
    nativeName: "Čeština",
    sample: "Večer si sedá ke stolu a čte nahlas to, co den nechal nedopovězené.",
    neural: false,
  },
  {
    code: "hu-HU",
    name: "Hungarian",
    region: "Hungary",
    nativeName: "Magyar",
    sample: "Az eső a tetőn beszél, a szoba pedig csendben válaszol.",
    neural: false,
  },
  {
    code: "ro-RO",
    name: "Romanian",
    region: "Romania",
    nativeName: "Română",
    sample: "Seara își așază palma pe geam și ascultă cum trece o voce.",
    neural: false,
  },
  {
    code: "ca-ES",
    name: "Catalan",
    region: "Catalonia",
    nativeName: "Català",
    sample: "La nit s'atura al llindar i deixa que les paraules respirin.",
    neural: false,
  },
];

export const NEURAL_VOICES: NeuralVoice[] = [
  { id: "af_heart", name: "Heart", lang: "en-US", gender: "Female", grade: "A" },
  { id: "af_bella", name: "Bella", lang: "en-US", gender: "Female", grade: "A-" },
  { id: "af_nicole", name: "Nicole", lang: "en-US", gender: "Female", grade: "B-" },
  { id: "af_aoede", name: "Aoede", lang: "en-US", gender: "Female", grade: "C+" },
  { id: "af_kore", name: "Kore", lang: "en-US", gender: "Female", grade: "C+" },
  { id: "af_sarah", name: "Sarah", lang: "en-US", gender: "Female", grade: "C+" },
  { id: "af_alloy", name: "Alloy", lang: "en-US", gender: "Female", grade: "C" },
  { id: "af_nova", name: "Nova", lang: "en-US", gender: "Female", grade: "C" },
  { id: "af_sky", name: "Sky", lang: "en-US", gender: "Female", grade: "C-" },
  { id: "af_jessica", name: "Jessica", lang: "en-US", gender: "Female", grade: "D" },
  { id: "af_river", name: "River", lang: "en-US", gender: "Female", grade: "D" },
  { id: "am_michael", name: "Michael", lang: "en-US", gender: "Male", grade: "C+" },
  { id: "am_fenrir", name: "Fenrir", lang: "en-US", gender: "Male", grade: "C+" },
  { id: "am_puck", name: "Puck", lang: "en-US", gender: "Male", grade: "C+" },
  { id: "am_echo", name: "Echo", lang: "en-US", gender: "Male", grade: "D" },
  { id: "am_eric", name: "Eric", lang: "en-US", gender: "Male", grade: "D" },
  { id: "am_liam", name: "Liam", lang: "en-US", gender: "Male", grade: "D" },
  { id: "am_onyx", name: "Onyx", lang: "en-US", gender: "Male", grade: "D" },
  { id: "am_adam", name: "Adam", lang: "en-US", gender: "Male", grade: "F+" },
  { id: "am_santa", name: "Santa", lang: "en-US", gender: "Male", grade: "D-" },
  { id: "bf_emma", name: "Emma", lang: "en-GB", gender: "Female", grade: "B-" },
  { id: "bf_isabella", name: "Isabella", lang: "en-GB", gender: "Female", grade: "C" },
  { id: "bf_alice", name: "Alice", lang: "en-GB", gender: "Female", grade: "D" },
  { id: "bf_lily", name: "Lily", lang: "en-GB", gender: "Female", grade: "D" },
  { id: "bm_george", name: "George", lang: "en-GB", gender: "Male", grade: "C" },
  { id: "bm_fable", name: "Fable", lang: "en-GB", gender: "Male", grade: "C" },
  { id: "bm_daniel", name: "Daniel", lang: "en-GB", gender: "Male", grade: "D" },
  { id: "bm_lewis", name: "Lewis", lang: "en-GB", gender: "Male", grade: "D+" },
];

export const DEFAULT_PROMPT = LANGUAGES[0]!.sample;
export const MAX_PROMPT_CHARS = 4000;

export function languageByCode(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
}

export function neuralVoicesFor(lang: string): NeuralVoice[] {
  const normalized = normalizeLang(lang);
  return NEURAL_VOICES.filter((v) => normalizeLang(v.lang) === normalized);
}

export function normalizeLang(code: string): string {
  return code.replaceAll("_", "-");
}

export function primaryLang(code: string): string {
  return normalizeLang(code).split("-")[0]?.toLowerCase() ?? "";
}

export function voiceMatchesLanguage(voiceLang: string, selected: string): boolean {
  const voice = normalizeLang(voiceLang).toLowerCase();
  const pick = normalizeLang(selected).toLowerCase();
  if (voice === pick) return true;
  if (voice.startsWith(`${pick}-`)) return true;
  const voiceParts = voice.split("-");
  const pickParts = pick.split("-");
  if ((pickParts[0] === "en" || pickParts[0] === "zh" || pickParts[0] === "pt" || pickParts[0] === "es") && pickParts[1] && voiceParts[1]) {
    return voiceParts[0] === pickParts[0] && voiceParts[1] === pickParts[1];
  }
  return voiceParts[0] === pickParts[0];
}

export function displayLanguageName(code: string): string {
  const known = languageByCode(code);
  if (known) return `${known.name} · ${known.region}`;
  try {
    const lang = new Intl.DisplayNames(["en"], { type: "language" });
    return lang.of(primaryLang(code)) ?? code;
  } catch {
    return code;
  }
}

export function mergeLanguagesFromVoices(voiceLangs: string[]): Language[] {
  const extra: Language[] = [];
  const seen = new Set(LANGUAGES.map((l) => l.code.toLowerCase()));
  for (const raw of voiceLangs) {
    const code = normalizeLang(raw);
    if (!code || seen.has(code.toLowerCase())) continue;
    const primary = primaryLang(code);
    if (LANGUAGES.some((l) => l.code.toLowerCase() === code.toLowerCase())) continue;
    if (LANGUAGES.some((l) => primaryLang(l.code) === primary && !code.includes("-"))) continue;
    seen.add(code.toLowerCase());
    extra.push({
      code,
      name: displayLanguageName(code),
      region: code,
      nativeName: code,
      sample: DEFAULT_PROMPT,
      neural: primary === "en",
    });
  }
  return [...LANGUAGES, ...extra];
}
