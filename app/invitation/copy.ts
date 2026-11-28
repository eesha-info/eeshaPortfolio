/**
 * All human-readable text for the invitation, per language.
 * Arabic / Urdu lines (Bismillah, ayah, salam, dua) live in the component
 * and are identical in every language.
 */

export type Lang = "en" | "hi";

export type EventCopy = {
  title: string;
  day: string;
  date: string;
  time: string;
  about: string;
  venueLabel: string;
  venueName: string;
  venueArea: string;
};

export type Copy = {
  lang: Lang;
  groom: string;
  bride: string;
  defaultGuest: string;
  scenes: string[];
  siteUrl: string;

  gate: { aria: string; nameA: string; nameB: string; hint: string };

  names: {
    bismillahTr: string;
    ayahTr: string;
    lead: string;
    groomOrigin: [string, string];
    brideOrigin: [string, string];
    with: string;
    inshallah: string;
    scroll: string;
    scrollAria: string;
  };

  letter: {
    kicker: string;
    openAria: string;
    tapSeal: string;
    dear: (guest: string) => [string, string];
    body1: [string, string, string];
    body2: string;
    signOff: string;
    family: string;
  };

  date: {
    kicker: string;
    day: string;
    time: string;
    countdownTitle: string;
    units: [string, string, string, string];
    timerAria: string;
    done: string;
    addToCalendar: string;
  };

  events: {
    kicker: string;
    title: string;
    carouselAria: string;
    prevAria: string;
    nextAria: string;
    hint: string;
    slideLabel: (i: number, n: number) => string;
    tapForDetails: string;
    showDetails: string;
    closeAria: string;
    onwards: (time: string) => string;
    directions: string;
    addToCalendar: string;
    items: Record<"nikah" | "reception", EventCopy>;
  };

  rsvp: {
    kicker: string;
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    attendLegend: string;
    yes: string;
    no: string;
    guests: string;
    fewerAria: string;
    moreAria: string;
    noteLabel: string;
    notePlaceholder: string;
    send: string;
    thanks: (name: string) => string;
    thanksFallback: string;
    thanksBody: string;
    edit: string;
    message: (o: { name: string; yes: boolean; count: number; note: string }) => string;
    contactLabel: string;
    call: string;
    contactMessage: string;
  };

  dua: {
    kicker: string;
    shukriya: string;
    translation: string;
    note: string;
    from: string;
    family: string;
  };

  share: {
    title: string;
    sub: string;
    label: string;
    placeholder: string;
    /** label for the editable Devanagari spelling (Hindi page only) */
    hiNameLabel: string;
    clearAria: string;
    share: string;
    copy: string;
    copied: string;
    copyFailed: string;
    sheetTitle: string;
    text: (name: string) => string;
  };
};

/* ─────────────────────────── English ─────────────────────────── */

const EN_GROOM = "Mohammad Eesha";
const EN_BRIDE = "Shabistan Shahin";

export const en: Copy = {
  lang: "en",
  groom: EN_GROOM,
  bride: EN_BRIDE,
  defaultGuest: "Guest",
  scenes: ["Names", "Letter", "Date", "Events", "RSVP", "Dua"],
  siteUrl: "https://mdeesha.in/invitation",

  gate: {
    aria: "Open the invitation",
    nameA: "Eesha",
    nameB: "Shabistan",
    hint: "Tap the doors to open",
  },

  names: {
    bismillahTr: "In the name of Allah, the Most Beneficent, the Most Merciful",
    ayahTr: "“And We created you in pairs.” — Surah An-Naba, 78:8",
    lead: "With the blessings of Almighty Allah, we cordially invite you to grace the auspicious Nikah ceremony of",
    groomOrigin: ["Ward No. 14, Maheshua ·", "Madhepura, Bihar"],
    brideOrigin: ["Phulwari Sharif ·", "Patna, Bihar"],
    with: "with",
    inshallah: "Insha Allah",
    scroll: "Scroll",
    scrollAria: "Continue to your letter",
  },

  letter: {
    kicker: "A letter for",
    openAria: "Open your letter",
    tapSeal: "Tap the seal to open",
    dear: () => ["Dear ", ","],
    body1: [
      "With hearts full of gratitude to Almighty Allah, we joyfully invite you and your family to share in a moment we have long prayed for — the Nikah of our beloved ",
      " with ",
      ".",
    ],
    body2:
      "Your presence will bring us joy, and your duas will be the most precious gift as two hearts and two families become one.",
    signOff: "With love & duas,",
    family: "Family & Friends",
  },

  date: {
    kicker: "Save the date",
    day: "Monday",
    time: "at 7:00 p.m. · Insha Allah",
    countdownTitle: "Counting the moments until the Nikah",
    units: ["Days", "Hours", "Minutes", "Seconds"],
    timerAria: "Time remaining until the Nikah",
    done: "Alhamdulillah — the blessed day is here!",
    addToCalendar: "Add to my calendar",
  },

  events: {
    kicker: "Please join us for",
    title: "The Celebrations",
    carouselAria: "Events — swipe to see each one",
    prevAria: "Previous event",
    nextAria: "Next event",
    hint: "Swipe for each event · tap a tag for details",
    slideLabel: (i, n) => `${i} of ${n}`,
    tapForDetails: "Tap for details",
    showDetails: "Show details",
    closeAria: "Close details",
    onwards: (time) => `${time} onwards`,
    directions: "Directions",
    addToCalendar: "Add to calendar",
    items: {
      nikah: {
        title: "Nikah Ceremony",
        day: "Monday",
        date: "15 March 2027",
        time: "7:00 pm",
        about: "The blessed union, solemnised with duas and joy",
        venueLabel: "Venue",
        venueName: "Deewan E Khas Marriage Hall",
        venueArea: "Sadar Colony, Phulwari Sharif, Patna, Bihar 801505",
      },
      reception: {
        title: "Reception",
        day: "Thursday",
        date: "18 March 2027",
        time: "7:00 pm",
        about: "An evening of dinner and celebration with family & friends",
        venueLabel: "Venue",
        venueName: "Ward No. 14, Maheshua",
        venueArea: "District Madhepura, Bihar",
      },
    },
  },

  rsvp: {
    kicker: "Kindly reply",
    title: "Will you join us?",
    nameLabel: "Your name",
    namePlaceholder: "Full name",
    attendLegend: "Will you attend?",
    yes: "Joyfully accept",
    no: "Regretfully decline",
    guests: "Number of guests",
    fewerAria: "Fewer guests",
    moreAria: "More guests",
    noteLabel: "A dua or message for the couple (optional)",
    notePlaceholder: "May Allah bless you both…",
    send: "Send RSVP",
    thanks: (name) => `Thank you, ${name}!`,
    thanksFallback: "dear guest",
    thanksBody: "Your reply has been prepared in WhatsApp — just press send.",
    edit: "Edit reply",
    message: ({ name, yes, count, note }) =>
      [
        "Assalamu Alaikum! 🌙",
        `RSVP — Nikah of ${EN_GROOM} & ${EN_BRIDE}`,
        "",
        `Name: ${name}`,
        `Attending: ${yes ? "Joyfully accepts ✅" : "Regretfully declines"}`,
        ...(yes ? [`Number of guests: ${count}`] : []),
        ...(note ? ["", `Dua / message: ${note}`] : []),
      ].join("\n"),
    contactLabel: "For any queries, reach us at",
    call: "Call",
    contactMessage: `Assalamu Alaikum! Regarding the Nikah of ${EN_GROOM} & ${EN_BRIDE} —`,
  },

  dua: {
    kicker: "With love and gratitude",
    shukriya: "Shukriya",
    translation: "“May Allah bless you both, shower His blessings upon you, and unite you in goodness.”",
    note: "Your presence and duas will make our joy complete",
    from: "With best compliments from",
    family: "Family & Friends",
  },

  share: {
    title: "Forward this invitation",
    sub: "Add the guest’s name to personalise their letter",
    label: "Guest name",
    placeholder: "Guest name, e.g. Shaheen Khala",
    hiNameLabel: "",
    clearAria: "Clear name",
    share: "Share",
    copy: "Copy link",
    copied: "Link copied!",
    copyFailed: "Couldn’t copy — select the link above instead.",
    sheetTitle: "Nikah Invitation",
    text: (name) => {
      const hello = name ? `Assalamu Alaikum ${name}! ` : "Assalamu Alaikum! ";
      return `${hello}You are cordially invited to the Nikah of ${EN_GROOM} with ${EN_BRIDE} — Monday, 15th March 2027, Insha Allah. Open your invitation:`;
    },
  },
};

/* ─────────────────────────── हिंदी ─────────────────────────── */

const HI_GROOM = "मोहम्मद ईशा";
const HI_BRIDE = "शबिस्तां शाहीन";

export const hi: Copy = {
  lang: "hi",
  groom: HI_GROOM,
  bride: HI_BRIDE,
  defaultGuest: "मेहमान",
  scenes: ["नाम", "पत्र", "तारीख़", "समारोह", "जवाब", "दुआ"],
  siteUrl: "https://mdeesha.in/invitation/hin",

  gate: {
    aria: "निमंत्रण खोलें",
    nameA: "ईशा",
    nameB: "शबिस्तां",
    hint: "खोलने के लिए दरवाज़ों पर टैप करें",
  },

  names: {
    bismillahTr: "अल्लाह के नाम से, जो बड़ा मेहरबान, निहायत रहम वाला है",
    ayahTr: "“और हमने तुम्हें जोड़ों में पैदा किया।” — सूरह अन-नबा, 78:8",
    lead: "अल्लाह तआला की रहमत और बरकत से, हम आपको सादर आमंत्रित करते हैं — इस मुबारक निकाह समारोह में",
    groomOrigin: ["वार्ड नं. 14, महेशुआ ·", "मधेपुरा, बिहार"],
    brideOrigin: ["फुलवारी शरीफ़ ·", "पटना, बिहार"],
    with: "संग",
    inshallah: "इंशा अल्लाह",
    scroll: "आगे देखें",
    scrollAria: "अपने पत्र पर जाएँ",
  },

  letter: {
    kicker: "सप्रेम आमंत्रण पत्र",
    openAria: "अपना पत्र खोलें",
    tapSeal: "पत्र खोलने के लिए मुहर पर टैप करें",
    dear: () => ["प्रिय ", ","],
    body1: [
      "अल्लाह तआला का शुक्र अदा करते हुए, हम बड़ी ख़ुशी के साथ आपको और आपके परिवार को उस मुबारक लम्हे में शामिल होने का न्योता देते हैं, जिसकी हमने बरसों दुआ की है — हमारे प्रिय ",
      " का निकाह ",
      " के साथ।",
    ],
    body2:
      "आपकी मौजूदगी हमारी ख़ुशी बढ़ाएगी, और जब दो दिल और दो परिवार एक हो रहे हैं, तब आपकी दुआएँ हमारे लिए सबसे क़ीमती तोहफ़ा होंगी।",
    signOff: "मोहब्बत और दुआओं के साथ,",
    family: "परिवार एवं मित्रगण",
  },

  date: {
    kicker: "तारीख़ याद रखें",
    day: "सोमवार",
    time: "शाम 7:00 बजे · इंशा अल्लाह",
    countdownTitle: "निकाह तक के पल गिन रहे हैं",
    units: ["दिन", "घंटे", "मिनट", "सेकंड"],
    timerAria: "निकाह तक बचा हुआ समय",
    done: "अल्हम्दुलिल्लाह — मुबारक दिन आ गया!",
    addToCalendar: "मेरे कैलेंडर में जोड़ें",
  },

  events: {
    kicker: "आप सादर आमंत्रित हैं",
    title: "समारोह",
    carouselAria: "समारोह — हर एक देखने के लिए स्वाइप करें",
    prevAria: "पिछला समारोह",
    nextAria: "अगला समारोह",
    hint: "हर समारोह के लिए स्वाइप करें · विवरण के लिए टैग पर टैप करें",
    slideLabel: (i, n) => `${n} में से ${i}`,
    tapForDetails: "विवरण के लिए टैप करें",
    showDetails: "विवरण देखें",
    closeAria: "विवरण बंद करें",
    onwards: (time) => `${time} से`,
    directions: "रास्ता देखें",
    addToCalendar: "कैलेंडर में जोड़ें",
    items: {
      nikah: {
        title: "निकाह समारोह",
        day: "सोमवार",
        date: "15 मार्च 2027",
        time: "शाम 7:00 बजे",
        about: "दुआओं और ख़ुशियों के साथ एक मुबारक बंधन",
        venueLabel: "स्थान",
        venueName: "दीवान-ए-ख़ास मैरिज हॉल",
        venueArea: "सदर कॉलोनी, फुलवारी शरीफ़, पटना, बिहार 801505",
      },
      reception: {
        title: "रिसेप्शन",
        day: "गुरुवार",
        date: "18 मार्च 2027",
        time: "शाम 7:00 बजे",
        about: "परिवार और दोस्तों के साथ दावत और जश्न की एक शाम",
        venueLabel: "स्थान",
        venueName: "वार्ड नं. 14, महेशुआ",
        venueArea: "ज़िला मधेपुरा, बिहार",
      },
    },
  },

  rsvp: {
    kicker: "कृपया जवाब दें",
    title: "क्या आप तशरीफ़ लाएँगे?",
    nameLabel: "आपका नाम",
    namePlaceholder: "पूरा नाम",
    attendLegend: "क्या आप आएँगे?",
    yes: "ज़रूर आएँगे",
    no: "माफ़ी, नहीं आ पाएँगे",
    guests: "मेहमानों की संख्या",
    fewerAria: "मेहमान कम करें",
    moreAria: "मेहमान बढ़ाएँ",
    noteLabel: "दूल्हा-दुल्हन के लिए दुआ या संदेश (वैकल्पिक)",
    notePlaceholder: "अल्लाह आप दोनों को बरकत दे…",
    send: "जवाब भेजें",
    thanks: (name) => `शुक्रिया, ${name}!`,
    thanksFallback: "प्रिय मेहमान",
    thanksBody: "आपका जवाब WhatsApp में तैयार है — बस भेजें दबाएँ।",
    edit: "जवाब बदलें",
    message: ({ name, yes, count, note }) =>
      [
        "अस्सलामु अलैकुम! 🌙",
        `जवाब — ${HI_GROOM} और ${HI_BRIDE} का निकाह`,
        "",
        `नाम: ${name}`,
        `आएँगे: ${yes ? "ज़रूर ✅" : "माफ़ी, नहीं आ पाएँगे"}`,
        ...(yes ? [`मेहमानों की संख्या: ${count}`] : []),
        ...(note ? ["", `दुआ / संदेश: ${note}`] : []),
      ].join("\n"),
    contactLabel: "किसी भी जानकारी के लिए संपर्क करें",
    call: "कॉल करें",
    contactMessage: `अस्सलामु अलैकुम! ${HI_GROOM} और ${HI_BRIDE} के निकाह के बारे में —`,
  },

  dua: {
    kicker: "मोहब्बत और शुक्रिया के साथ",
    shukriya: "शुक्रिया",
    translation:
      "“अल्लाह आप दोनों को बरकत दे, आप पर अपनी रहमतें नाज़िल करे, और आप दोनों को ख़ैर के साथ जोड़े रखे।”",
    note: "आपकी मौजूदगी और दुआएँ हमारी ख़ुशी को मुकम्मल करेंगी",
    from: "शुभकामनाओं सहित",
    family: "परिवार एवं मित्रगण",
  },

  share: {
    title: "यह निमंत्रण भेजें",
    sub: "पत्र को ख़ास बनाने के लिए मेहमान का नाम लिखें",
    label: "मेहमान का नाम",
    placeholder: "नाम अंग्रेज़ी या हिंदी में, जैसे Rohit",
    hiNameLabel: "हिंदी में नाम — ग़लत हो तो यहाँ सुधारें",
    clearAria: "नाम हटाएँ",
    share: "शेयर करें",
    copy: "लिंक कॉपी करें",
    copied: "लिंक कॉपी हो गया!",
    copyFailed: "कॉपी नहीं हो सका — ऊपर दिया लिंक चुनें।",
    sheetTitle: "निकाह निमंत्रण",
    text: (name) => {
      const hello = name ? `अस्सलामु अलैकुम ${name}! ` : "अस्सलामु अलैकुम! ";
      return `${hello}आपको ${HI_GROOM} और ${HI_BRIDE} के निकाह में सादर आमंत्रित किया जाता है — सोमवार, 15 मार्च 2027, इंशा अल्लाह। अपना निमंत्रण खोलें:`;
    },
  },
};

export const COPY: Record<Lang, Copy> = { en, hi };
