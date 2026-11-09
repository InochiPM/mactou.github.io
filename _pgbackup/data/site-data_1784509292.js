/* ==========================================================
   Macuta Archive — SITE DATA
   This is the only file you need to edit to grow the site.

   To add a character: add an entry to a family's `characters`
   array and drop its images into /img.
   To add a family: add an entry to `families`.
   Image paths are relative to the site root, e.g. "img/foo.png".
   ========================================================== */

window.SITE = {
  title: "Macuta 档",
  logo: "img/logo/rogo.png",
  tagline:
    "An archive of Macloid & Macuta artwork — user-made UTAU designs collected over the years. Some families are still singing; others live on only here.",
  footerNote: "Macuta档 — a fan-kept archive. All artwork © original artists.",

  families: [
    {
      id: "mcne",
      name: "Mc音",
      status: "inactive", // "active" | "retired"
      logo: "img/logo/mcne_rogo.png", // e.g. "img/mackne-logo.png" — null shows a placeholder
      desc: "6 characters · Mcne series",
      about:
        "Six Voicebanks, Only one of which has a voicebank. Disscontinued as their Creator has left the Fandom.",
      characters: [
        {
          id: "nono",
          name: "Mcne Nono",
          series: "Mc Series",
          status: "inactive",
          icon: "img/icons/nono_icon.png", // face icon shown in family view (null → falls back to badge)
          hoverColor: "#5cb85c",
          mainArt: "img/char/mcne/nono_stand.png",
          bio: "Short bio — who Nono is, their personality, and where the design came from. A couple of sentences is plenty; the artwork does the talking.",
          voicebank: {
            "Release year": "2024",
            Family: "Mc音",
            Series: "Mc",
            Engine: "UTAU",
            Voice: "AZUSA",
            Status: "Abandoned/Not-Maintained",
          },
          credits: [
            { role: "Designer", name: "AZUSA TUNES", url: "#" },
            { role: "Concept art", name: "AZUSA TUNES", url: "#" },
            { role: "Badge", name: "AZUSA TUNES", url: "#" },
            { role: "Reworked-Art", name: "Unknown", url: "#" },
          ],
          downloads: [
            { label: "↓ Voicebank ZIP", url: "#", primary: true },
            { label: "↓ Art pack", url: "#" },
          ],
          gallery: [
            { img: "img/char/mcne/Nono_concept.png", caption: "concept art" },
            { img: "img/char/mcne/badge/Nono_badge.png", caption: "badge art" },
          ],
        },
        {
          id: "roro",
          name: "Mcne Roro",
          series: "Mc Series",
          status: "inactive",
          icon: "img/icons/roro_icon.png", // face icon shown in family view (null → falls back to badge)
          badge: "img/badge-roro.png",
          hoverColor: "#57a8c7",
          mainArt: "img/roro-concept.webp",
          bio: "Short bio for Roro.",
          voicebank: { Series: "][", Engine: "UTAU", Status: "maintained" },
          credits: [{ role: "Design", name: "artist name", url: "#" }],
          downloads: [{ label: "↓ Voicebank ZIP", url: "#", primary: true }],
          gallery: [
            { img: "img/roro-concept.webp", caption: "concept art" },
            { img: "img/badge-roro.png", caption: "badge art" },
          ],
        },
        {
          id: "fufu",
          name: "Mcne Fufu",
          series: "Mc Series",
          status: "active",
          icon: "img/icons/fufu_icon.png", // face icon shown in family view (null → falls back to badge)
          badge: "img/badge-fufu.png",
          hoverColor: "#d9483e",
          mainArt: "img/fufu-concept.webp",
          bio: "Short bio for Fufu.",
          voicebank: { Series: "][e", Engine: "UTAU", Status: "maintained" },
          credits: [{ role: "Design", name: "artist name", url: "#" }],
          downloads: [{ label: "↓ Voicebank ZIP", url: "#", primary: true }],
          gallery: [
            { img: "img/fufu-concept.webp", caption: "reference sheet" },
            { img: "img/badge-fufu.png", caption: "badge art" },
          ],
        },
        {
          id: "suzu",
          name: "Mcne Suzu",
          series: "Mc Series",
          status: "active",
          icon: "img/icons/suzu_icon.png", // face icon shown in family view (null → falls back to badge)
          badge: "img/badge-suzu.png",
          hoverColor: "#e07a80",
          mainArt: "img/suzu-concept.webp",
          bio: "Short bio for Suzu.",
          voicebank: { Series: "][", Engine: "UTAU", Status: "maintained" },
          credits: [{ role: "Design", name: "artist name", url: "#" }],
          downloads: [{ label: "↓ Voicebank ZIP", url: "#", primary: true }],
          gallery: [
            { img: "img/suzu-concept.webp", caption: "reference sheet" },
            { img: "img/badge-suzu.png", caption: "badge art" },
          ],
        },
        {
          id: "yaya",
          name: "Mcne Yaya",
          series: "Mc Series",
          status: "active",
          icon: "img/icons/empty_icon.png", // face icon shown in family view (null → falls back to badge)
          badge: "img/badge-yaya.png",
          hoverColor: "#f0ad2e",
          mainArt: null, // no main art yet — page shows a placeholder slot
          bio: "Short bio for Yaya.",
          voicebank: { Series: "][ GS", Engine: "UTAU", Status: "maintained" },
          credits: [{ role: "Design", name: "artist name", url: "#" }],
          downloads: [],
          gallery: [{ img: "img/badge-yaya.png", caption: "badge art" }],
        },
        {
          id: "nene",
          name: "Mcne Nene",
          series: "Mc Series",
          status: "active",
          icon: "img/icons/nene_icon.png", // face icon shown in family view (null → falls back to badge)
          badge: "img/badge-nene.png",
          hoverColor: "#7048d6",
          mainArt: null,
          bio: "Short bio for Nene.",
          voicebank: { Series: "][", Engine: "UTAU", Status: "maintained" },
          credits: [{ role: "Design", name: "artist name", url: "#" }],
          downloads: [],
          gallery: [{ img: "img/badge-nene.png", caption: "badge art" }],
        },
      ],
    },
    {
      id: "makune",
      name: "MAKU音",
      status: "retired",
      logo: null,
      desc: "4 characters · abandoned, preserved here",
      about: "A retired lineage, archived exactly as it was left.",
      characters: [
        {
          id: "makune-character",
          name: "MAKU音 character",
          series: "original series",
          status: "retired",
          icon: null, // face icon shown in family view (null → falls back to badge)
          badge: null,
          mainArt: "img/reference-art.png",
          bio: "Bio for this retired character.",
          voicebank: { Status: "retired" },
          credits: [],
          downloads: [],
          gallery: [{ img: "img/reference-art.png", caption: "reference art" }],
        },
      ],
    },
    {
      id: "makne",
      name: "MAK音",
      status: "retired",
      logo: null,
      desc: "2 characters · abandoned, preserved here",
      about: "Art pending scan.",
      characters: [],
    },
  ],

  // About page content.
  about: {
    kicker: "ABOUT THE MACUTA ARCHIVE",
    heading: "Keeping Macloids In Our Hearts",
    intro:
      "This is a personal, fan-kept archive of Macloid & Macuta artwork — user-made UTAU designs collected over the years. Many of these families were passion projects; some have long since been abandoned. This site keeps their art somewhere safe, exactly as it was left.",
    cards: [
      {
        icon: "♪",
        title: "What's a Macloid?",
        text: "User-made voicebanks for UTAU, each with their own design, badge, and family lineage — made by fans, voiced by fans.",
      },
      {
        icon: "✎",
        title: "Why an archive?",
        text: "Old sites go down, download links rot, artists move on. Collecting the artwork in one place keeps retired families from disappearing entirely.",
      },
      {
        icon: "✉",
        title: "Something missing?",
        text: "If you have art, badges, or info from a family that isn't here — or you're an artist who wants credit fixed or work removed — please reach out.",
      },
    ],
    collector: {
      kicker: "THE CURATOR/CREATOR",
      heading: "InochiPM: The Maker, Lover & Archivalist",
      text: "As a Creator and maker of Macloids and Mactau, I've been collecting images, artwork and whatnot. For many years I've seen plenty of Macloids & Macuta come and go. The one's I've personally collected will be on this website for Archival purposes only.",
      img: "img/inochi/sns_icon.png",
      buttons: [
        { label: "Contact", url: "inochipm@icloud.com" },
        { label: "Submit artwork", url: "inochipm@icloud.com" },
      ],
    },
    policy: {
      kicker: "© COPYRIGHT, CREDIT & TAKEDOWN POLICY",
      text: "Every piece here belongs to its original artist and is credited wherever the artist is known. Eahc piece of artwork was recorvered from the internet and/or from my personal collection. Nothing is for sale, nothing is official, No voicebanks will be provided unless permission was aquired. If your work is here and you would like it credited differently — taken down — or otherwise, one message and it's done. No questions asked.",
    },
  },

  // "Recently added" strip on the landing page.
  recentlyAdded: [
    { img: "img/nono-concept.webp", caption: "Mcne Nono — concept art", family: "mcne", character: "nono" },
    { img: "img/suzu-concept.webp", caption: "Mcne Suzu — reference sheet", family: "mcne", character: "suzu" },
    { img: "img/roro-concept.webp", caption: "Mcne Roro — concept art", family: "mcne", character: "roro" },
    { img: "img/fufu-concept.webp", caption: "Mcne Fufu — reference sheet", family: "mcne", character: "fufu" },
  ],
  recentlyAddedDate: "updated · jul 2026",
};
