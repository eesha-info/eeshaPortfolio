/**
 * Offline, best-effort Roman → Devanagari transliteration for guest names
 * (e.g. "Rohit" → "रोहित", "Shaheen Khala" → "शाहीन ख़ाला").
 *
 * English spellings of Indian names are ambiguous (a/aa, i/ee, t/ट), so this
 * is a suggestion: the share panel lets the host correct it before sending.
 * Runs entirely in the browser — names are never sent anywhere.
 */

/** Common names, titles and relations whose spelling rules can't guess. */
const WORDS: Record<string, string> = {
  // relations & honorifics
  bhai: "भाई", bhaiya: "भैया", bhaijaan: "भाईजान", bhabhi: "भाभी", didi: "दीदी", baji: "बाजी", apa: "आपा",
  khala: "ख़ाला", khalu: "ख़ालू", mama: "मामा", mami: "मामी", chacha: "चाचा", chachi: "चाची",
  phupha: "फूफा", phuphi: "फूफी", phupho: "फूफो", nana: "नाना", nani: "नानी", dada: "दादा", dadi: "दादी",
  abbu: "अब्बू", ammi: "अम्मी", abba: "अब्बा", amma: "अम्मा", uncle: "अंकल", aunty: "आंटी", auntie: "आंटी",
  sahab: "साहब", saheb: "साहब", sahib: "साहिब", ji: "जी", jee: "जी", begum: "बेगम", miyan: "मियाँ",
  family: "परिवार", and: "और", sir: "सर", madam: "मैडम", mrs: "मिसेज़", mr: "मिस्टर", dr: "डॉ.",
  // frequent name parts
  kumar: "कुमार", kumari: "कुमारी", singh: "सिंह", prasad: "प्रसाद", yadav: "यादव", sharma: "शर्मा",
  verma: "वर्मा", gupta: "गुप्ता", mishra: "मिश्रा", jha: "झा", sinha: "सिन्हा", khan: "ख़ान", ansari: "अंसारी",
  ali: "अली", ahmad: "अहमद", ahmed: "अहमद", mohammad: "मोहम्मद", mohammed: "मोहम्मद", muhammad: "मुहम्मद",
  md: "मो.", hussain: "हुसैन", husain: "हुसैन", hasan: "हसन", hassan: "हसन", rahman: "रहमान", rehman: "रहमान",
  alam: "आलम", imran: "इमरान", irfan: "इरफ़ान", salman: "सलमान", faisal: "फ़ैसल", farhan: "फ़रहान",
  shaheen: "शाहीन", shahin: "शाहीन", ayesha: "आयशा", aisha: "आयशा", fatima: "फ़ातिमा", zainab: "ज़ैनब",
  sana: "सना", nazia: "नाज़िया", rukhsar: "रुख़सार", eesha: "ईशा", isha: "ईशा", shabistan: "शबिस्तां",
  alok: "आलोक", amit: "अमित", rahul: "राहुल", rajan: "राजन", raj: "राज", ravi: "रवि", vikas: "विकास",
  vivek: "विवेक", anand: "आनंद", ashok: "अशोक", manoj: "मनोज", sanjay: "संजय", ajay: "अजय", vijay: "विजय",
  rakesh: "राकेश", mukesh: "मुकेश", suresh: "सुरेश", ramesh: "रमेश", dinesh: "दिनेश", mahesh: "महेश",
  pooja: "पूजा", priya: "प्रिया", neha: "नेहा", anjali: "अंजलि", sunita: "सुनीता", anita: "अनीता",
  rajesh: "राजेश", danish: "दानिश", zeeshan: "ज़ीशान", faizan: "फ़ैज़ान", gulnaz: "गुलनाज़", anwar: "अनवर",
  javed: "जावेद", shahid: "शाहिद", sajid: "साजिद", wasim: "वसीम", nadeem: "नदीम", parveen: "परवीन",
  rubina: "रुबीना", shabana: "शबाना", tabassum: "तबस्सुम", naseem: "नसीम", rizwan: "रिज़वान", arif: "आरिफ़",
  rohit: "रोहित", mohit: "मोहित", sumit: "सुमित", ankit: "अंकित", nitin: "नितिन", sachin: "सचिन",
  aman: "अमन", arman: "अरमान", karan: "करण", arjun: "अर्जुन", krishna: "कृष्णा", ram: "राम", shyam: "श्याम",
};

const CONS: [string, string][] = [
  ["ksh", "क्ष"], ["chh", "छ"], ["shh", "श"], ["kh", "ख"], ["gh", "घ"], ["ch", "च"], ["jh", "झ"], ["th", "थ"],
  ["dh", "ध"], ["ph", "फ"], ["bh", "भ"], ["sh", "श"], ["gn", "ग्न"], ["k", "क"], ["g", "ग"], ["c", "क"],
  ["j", "ज"], ["t", "त"], ["d", "द"], ["n", "न"], ["p", "प"], ["b", "ब"], ["m", "म"], ["y", "य"],
  ["r", "र"], ["l", "ल"], ["v", "व"], ["w", "व"], ["s", "स"], ["h", "ह"], ["f", "फ़"], ["z", "ज़"],
  ["q", "क़"], ["x", "क्स"],
];

/** [roman, independent vowel, matra] — longest first */
const VOWELS: [string, string, string][] = [
  ["aa", "आ", "ा"], ["ai", "ऐ", "ै"], ["au", "औ", "ौ"], ["ee", "ई", "ी"], ["ii", "ई", "ी"],
  ["oo", "ऊ", "ू"], ["uu", "ऊ", "ू"], ["ei", "ए", "े"], ["ou", "औ", "ौ"],
  ["a", "अ", ""], ["i", "इ", "ि"], ["u", "उ", "ु"], ["e", "ए", "े"], ["o", "ओ", "ो"],
];

const HALANT = "्";

function match<T extends [string, ...string[]]>(word: string, at: number, table: T[]): T | undefined {
  return table.find(([r]) => word.startsWith(r, at));
}

function translitWord(raw: string): string {
  const word = raw.toLowerCase();
  if (WORDS[word]) return WORDS[word];
  if (!/^[a-z]+$/.test(word)) return raw;

  let out = "";
  let i = 0;
  let prevCons = false; // last unit was a consonant still carrying its inherent "a"
  let afterVowel = false; // last unit was a vowel sound (incl. an inherent "a")

  while (i < word.length) {
    const v = match(word, i, VOWELS);
    if (v) {
      const [r, indep, matra] = v;
      const atEnd = i + r.length === word.length;
      if (prevCons) {
        // word-final "a"/"i" after a consonant are usually long in names: Rekha → रेखा, Nani → नानी
        if (atEnd && r === "a") out += "ा";
        else if (atEnd && r === "i") out += "ी";
        else out += matra;
      } else {
        out += indep;
      }
      prevCons = false;
      afterVowel = true;
      i += r.length;
      continue;
    }

    const c = match(word, i, CONS);
    if (!c) {
      out += word[i];
      prevCons = afterVowel = false;
      i += 1;
      continue;
    }
    const [r, dev] = c;
    const next = i + r.length;
    const nextIsCons = next < word.length && !match(word, next, VOWELS);

    // n / m after a vowel and before another consonant → anusvara (Sanjay → संजय, Ambar → अंबर)
    if (afterVowel && nextIsCons && ((r === "n" && /^[kgcjtdpb]/.test(word.slice(next))) || (r === "m" && /^[bp]/.test(word.slice(next))))) {
      out += "ं";
      prevCons = afterVowel = false;
      i = next;
      continue;
    }

    // a consonant cluster becomes a conjunct via halant (Preeti → प्रीति)
    out += dev + (nextIsCons ? HALANT : "");
    prevCons = !nextIsCons;
    afterVowel = false;
    i = next;
  }
  return out;
}

/** "Rohit Kumar" → "रोहित कुमार". Text already in Devanagari is returned unchanged. */
export function toDevanagari(text: string): string {
  if (!/[A-Za-z]/.test(text)) return text;
  return text.replace(/[A-Za-z]+/g, (w) => translitWord(w));
}

export const hasLatin = (text: string) => /[A-Za-z]/.test(text);
