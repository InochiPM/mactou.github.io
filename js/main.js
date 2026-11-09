/* ==========================================================
   Macuta Archive — page renderer
   Reads SITE from data/site-data.js and builds each page.
   You shouldn't need to edit this to add content.
   ========================================================== */

(function () {
  const SITE = window.SITE;
  const qs = new URLSearchParams(location.search);

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // Normalize link targets: bare email addresses become mailto: links
  function href(url) {
    if (!url) return "#";
    if (/^[^\s@\/]+@[^\s@\/]+\.[^\s@\/]+$/.test(url)) return "mailto:" + url;
    return url;
  }

  /* ---------- Font Awesome icons ----------
     An icon value can be "fa-solid fa-heart", a pasted
     <i class="fa-solid fa-heart"></i>, or plain text / emoji ("✎").
     In any text you can also write {fa-solid fa-heart} to drop an
     icon inline. Browse free icons: https://fontawesome.com/search?ic=free */
  const ICON_TAG = /^<i\s+class=["']([^"']+)["'][^>]*>\s*<\/i>$/i;
  function faClass(v) {
    const raw = String(v ?? "").trim();
    const m = raw.match(ICON_TAG);
    const cls = (m ? m[1] : raw).trim();
    const parts = cls.split(/\s+/);
    return cls && /\bfa-/.test(cls) && parts.every((t) => /^fa[a-z0-9-]*$/i.test(t)) ? cls : null;
  }
  function icon(v) {
    if (v == null || v === "") return "";
    const cls = faClass(v);
    return cls ? `<i class="${esc(cls)}" aria-hidden="true"></i>` : esc(v);
  }
  const SHORTCODE = /\{\s*((?:fa[a-z0-9-]*\s+)*fa-[a-z0-9-]+(?:\s+fa[a-z0-9-]*)*)\s*\}|<i\s+class=["']((?:fa[a-z0-9-]*\s*)+)["'][^>]*>\s*<\/i>/gi;
  // escape text, but turn {fa-solid fa-heart} into a real icon
  function rich(text) {
    const str = String(text ?? "");
    let out = "", last = 0;
    str.replace(SHORTCODE, (m, a, b, off) => {
      out += esc(str.slice(last, off)) + `<i class="${esc((a || b).trim())}" aria-hidden="true"></i>`;
      last = off + m.length;
      return m;
    });
    return out + esc(str.slice(last));
  }
  // text with icon codes removed (for tab titles, alt text, link previews)
  function plain(text) {
    return String(text ?? "").replace(SHORTCODE, "").replace(/\s{2,}/g, " ").trim();
  }
  const withIcon = (ic, label) => (ic ? icon(ic) + " " : "") + rich(label);

  /* ---------- image protection ----------
     Settings live in `protection` in site-data.js (or the editor's
     "Image protection" page). Anything missing uses these defaults.
     The watermark is your own picture (square or rectangle — a
     transparent PNG looks best), repeated across the art and tilted. */
  const PROTECT_DEFAULTS = {
    watermark: true,
    image: null,          // e.g. "img/watermark/watermark.png"
    size: 140,            // width of each repeated mark, in px (height follows its shape)
    spacing: 48,          // space between marks, in px
    angle: -30,           // tilt in degrees
    opacity: 0.25,
    stagger: true,        // offset every other row, like bricks
    text: "© " + plain(SITE.title || "") + " · do not repost", // used only when no image is set
    color: "#ffffff",     // text watermark color
    fontSize: 16,
    on: { lightbox: true, mainArt: true, gallery: false, home: false },
    noRightClick: true,
    rightClickMessage: "Right-click is turned off — all artwork © its original artists.",
    blockShortcuts: true,
    noDrag: true,
  };
  const PROTECT = Object.assign({}, PROTECT_DEFAULTS, SITE.protection || {});
  PROTECT.on = Object.assign({}, PROTECT_DEFAULTS.on, (SITE.protection || {}).on || {});

  // One repeating tile: the mark (or two, staggered) with the gap around it.
  // Resolves to { url, size } for CSS, or null.
  function watermarkTile(p) {
    const gap = Math.max(0, +p.spacing || 0);
    if (p.image) {
      return new Promise((resolve) => {
        const im = new Image();
        im.onload = () => {
          const w = Math.max(8, +p.size || 140);
          const h = Math.max(1, Math.round((w * im.naturalHeight) / im.naturalWidth));
          const tw = w + gap, th = h + gap, rows = p.stagger !== false ? 2 : 1;
          try {
            const k = 2; // draw at 2x so it stays crisp on Retina screens
            const c = document.createElement("canvas");
            c.width = tw * k; c.height = th * rows * k;
            const g = c.getContext("2d");
            const put = (x, y) => g.drawImage(im, x * k, y * k, w * k, h * k);
            put(gap / 2, gap / 2);
            if (rows === 2) { put(gap / 2 + tw / 2, th + gap / 2); put(gap / 2 - tw / 2, th + gap / 2); }
            resolve({ url: `url("${c.toDataURL("image/png")}")`, size: `${tw}px ${th * rows}px` });
          } catch (e) {
            // canvas blocked (e.g. opened as a file:// page) — fall back to the plain image, no gaps
            resolve({ url: `url("${im.src}")`, size: `${w}px ${h}px` });
          }
        };
        im.onerror = () => resolve(null);
        im.src = new URL(p.image, location.href).href;
      });
    }
    const text = String(p.text || "").trim();
    if (!text) return Promise.resolve(null);
    const size = Math.max(6, +p.fontSize || 16);
    const tw = [...text].reduce((w, ch) => w + (ch.codePointAt(0) >= 0x2e80 ? 1 : 0.62) * size, 0);
    const W = Math.round(tw + gap), Hrow = Math.round(size * 1.4 + gap), rows = p.stagger !== false ? 2 : 1;
    const color = /^#[0-9a-f]{6}$/i.test(p.color || "") ? p.color : "#ffffff";
    const n = parseInt(color.slice(1), 16);
    const light = ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
    const xml = text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const t = (x, y) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Roboto, Helvetica, Arial, sans-serif" font-size="${size}" font-weight="700" fill="${color}" stroke="${light ? "#000" : "#fff"}" stroke-opacity=".5" stroke-width="${Math.max(0.6, size / 22).toFixed(2)}" paint-order="stroke">${xml}</text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hrow * rows}">` +
      t(W / 2, Hrow / 2) + (rows === 2 ? t(W, Hrow * 1.5) + t(0, Hrow * 1.5) : "") + `</svg>`;
    return Promise.resolve({ url: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`, size: `${W}px ${Hrow * rows}px` });
  }
  // Wrap an <img> so the watermark sits exactly on top of it
  function wm(imgHtml, area) {
    if (!PROTECT.watermark || !PROTECT.on[area]) return imgHtml;
    return `<span class="wm">${imgHtml}</span>`;
  }
  function setupProtection() {
    const root = document.documentElement;
    if (PROTECT.watermark) {
      root.style.setProperty("--wm-opacity", String(Math.min(1, Math.max(0.02, +PROTECT.opacity || 0.25))));
      root.style.setProperty("--wm-angle", (+PROTECT.angle || 0) + "deg");
      watermarkTile(PROTECT).then((tile) => {
        if (!tile) return;
        root.style.setProperty("--wm-tile", tile.url);
        root.style.setProperty("--wm-size", tile.size);
      });
    }
    if (PROTECT.noRightClick) {
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (PROTECT.rightClickMessage) protectNotice(PROTECT.rightClickMessage, e.clientX, e.clientY);
      }, true);
    }
    if (PROTECT.blockShortcuts) {
      document.addEventListener("keydown", (e) => {
        const mod = e.ctrlKey || e.metaKey, c = e.code;
        const devtools = e.key === "F12" ||
          (mod && e.shiftKey && ["KeyI", "KeyJ", "KeyC", "KeyK"].includes(c)) ||   // inspect / console
          (e.metaKey && e.altKey && ["KeyI", "KeyJ", "KeyC", "KeyU"].includes(c));  // Mac: ⌥⌘I etc.
        const saveOrSource = mod && !e.shiftKey && ["KeyU", "KeyS", "KeyP"].includes(c); // view source / save / print
        if (devtools || saveOrSource) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    }
    if (PROTECT.noDrag) {
      root.classList.add("no-img-drag");
      document.addEventListener("dragstart", (e) => { if (e.target.tagName === "IMG") e.preventDefault(); }, true);
    }
  }
  let noticeTimer = null;
  function protectNotice(msg, x, y) {
    let n = document.getElementById("protect-notice");
    if (!n) { n = document.createElement("div"); n.id = "protect-notice"; document.body.appendChild(n); }
    n.textContent = msg;
    n.style.left = Math.max(8, Math.min(x + 12, window.innerWidth - 300)) + "px";
    n.style.top = Math.max(8, Math.min(y + 12, window.innerHeight - 60)) + "px";
    n.classList.add("show");
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => n.classList.remove("show"), 1800);
  }

  function findFamily(id) {
    return SITE.families.find((f) => f.id === id);
  }

  // Popup viewer for artwork
  function openLightbox(src, caption) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <div class="lightbox-box">
        <button class="lightbox-close" type="button" aria-label="Close">×</button>
        ${wm(`<img src="${src}" alt="${esc(plain(caption) || "artwork")}">`, "lightbox")}
        ${caption ? `<div class="lightbox-caption">${rich(caption)}</div>` : ""}
      </div>`;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const close = () => { lb.remove(); document.removeEventListener("keydown", onKey); };
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.classList.contains("lightbox-close")) close();
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(lb);
  }

  // Attach lightbox to any .lightbox-open element inside root
  function wireLightbox(root) {
    root.querySelectorAll(".lightbox-open").forEach((el) => {
      el.addEventListener("click", () =>
        openLightbox(el.dataset.img, el.dataset.caption));
    });
  }

  function allCharacters() {
    return SITE.families.flatMap((f) =>
      f.characters.map((c) => ({ family: f, char: c }))
    );
  }

  // Update <title>, meta description, and OG tags for dynamic pages
  function setMeta(title, desc, image) {
    title = plain(title); desc = plain(desc);
    document.title = title;
    const set = (sel, val) => {
      const el = document.querySelector(sel);
      if (el && val) el.setAttribute("content", val);
    };
    set('meta[name="description"]', desc);
    set('meta[property="og:title"]', title);
    set('meta[property="og:description"]', desc);
    if (image) set('meta[property="og:image"]', image);
  }

  // Built-in status pills. Add your own (or recolor these) via a
  // `statuses` section in site-data.js — see the comment there.
  const STATUS_STYLES = Object.assign(
    {
      active:       { label: "active",         fg: "#2e7d43", bg: "#e9f4ec" }, // maintained
      inactive:     { label: "inactive",       fg: "#8a6d1f", bg: "#f8f1dd" }, // not maintained, still downloadable
      unmaintained: { label: "unmaintained",   fg: "#a35c1e", bg: "#fbe9da" },
      archived:     { label: "archived",       fg: "#5a6b8a", bg: "#e8edf5" }, // preserved here only
      retired:      { label: "retired",        fg: "#8a6d1f", bg: "#f8f1dd" },
      lost:         { label: "lost media",     fg: "#b03a3a", bg: "#fbe3e3" }, // art/voicebank missing
    },
    SITE.statuses || {}
  );

  function pill(status) {
    const s = STATUS_STYLES[status] ||
      { label: status || "unknown", fg: "#6f6a66", bg: "#efece8" };
    return `<span class="pill" style="color:${s.fg};background:${s.bg}">${esc(s.label)}</span>`;
  }

  /* ---------- shared chrome ---------- */

  function header(active) {
    const links = [
      ["index.html", "Home"],
      ["families.html", "Families"],
      ["about.html", "About"],
    ];
    return `
      <header class="site-header">
        <a class="logo" href="index.html"><img src="${SITE.logo}" alt="${esc(plain(SITE.title))}"></a>
        <nav class="site-nav">
          ${links.map(([href, label]) =>
            `<a href="${href}"${label === active ? ' class="active"' : ""}>${withIcon((SITE.navIcons || {})[label], label)}</a>`
          ).join("")}
        </nav>
      </header>`;
  }

  function footer() {
    const famCount = SITE.families.length;
    const charCount = allCharacters().length;
    return `
      <footer class="site-footer">
        <span>${rich(SITE.footerNote)}</span>
        <span class="stats">${famCount} families · ${charCount} characters${SITE.established ? " · " + rich(SITE.established) : ""}</span>
      </footer>`;
  }

  /* ---------- landing ---------- */

  function renderHome(root) {
    // Optional image behind the home page's centered content column.
    root.style.backgroundImage = SITE.pageBackground
      ? `url("${String(SITE.pageBackground).replace(/["\\\\\n\r]/g, "")}")`
      : "";
    root.style.backgroundSize = SITE.pageBackground ? "cover" : "";
    root.style.backgroundPosition = SITE.pageBackground ? "center top" : "";
    const recent = SITE.recentlyAdded.map((r) => `
      <div class="art-item">
        <a class="art-frame" href="character.html?family=${r.family}&id=${r.character}">
          ${wm(`<img src="${r.img}" alt="${esc(plain(r.caption))}">`, "home")}
        </a>
        <span class="art-caption">${rich(r.caption)}</span>
      </div>`).join("");

    // Random spotlight: any character with main art
    const pool = allCharacters().filter(({ char }) => char.mainArt);
    const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;

    const spotlight = pick ? `
      <div class="spotlight">
        ${wm(`<img src="${pick.char.mainArt}" alt="${esc(plain(pick.char.name))}">`, "home")}
        <div class="spotlight-body">
          <span class="kicker">RANDOM SPOTLIGHT ↻</span>
          <h3>${rich(pick.char.name)}</h3>
          <p>${rich(pick.char.bio)}</p>
          <a href="character.html?family=${pick.family.id}&id=${pick.char.id}" style="font-size:14px;font-weight:600">Visit their page →</a>
        </div>
      </div>` : "";

    root.innerHTML = `
      ${header("Home")}
      <div class="hero">
        <img class="hero-logo" src="${SITE.logo}" alt="${esc(plain(SITE.title))}">
        <p>${rich(SITE.tagline)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="families.html">Browse families</a>
          <a class="btn btn-outline" href="about.html">About the collection</a>
        </div>
      </div>
      <div class="section">
        <div class="section-head">
          <h2>Recently added</h2>
          <span class="meta">${rich(SITE.recentlyAddedDate)}</span>
        </div>
        <div class="art-grid">${recent}</div>
      </div>
      ${spotlight}
      ${footer()}`;
  }

  /* ---------- families ---------- */

  function renderFamilies(root) {
    const cards = SITE.families.map((f) => {
      const banner = f.logo
        ? `<img src="${f.logo}" alt="${esc(plain(f.name))} logo">`
        : `<span class="placeholder">${rich(f.name)} family logo</span>`;
      const members = f.characters.slice(0, 4).map((c) => {
        const src = c.icon || c.badge;
        return src ? `<img${c.icon ? ' class="face"' : ""} src="${src}" alt="${esc(plain(c.name))}">` : "";
      }).join("");
      const extra = f.characters.length > 4
        ? `<span class="more">+${f.characters.length - 4}</span>` : "";
      const membersRow = f.characters.length
        ? `<div class="members">${members}${extra}</div>`
        : `<div class="members"><span class="more">art pending scan</span></div>`;
      return `
        <a class="family-card" href="family.html?id=${f.id}">
          <div class="banner">${banner}</div>
          <div class="body">
            <div class="title-row"><h2>${rich(f.name)}</h2>${pill(f.status)}</div>
            ${membersRow}
            <span class="desc">${rich(f.desc)}</span>
            <span class="btn ${f.status === "active" ? "btn-primary" : "btn-outline"} btn-sm" style="align-self:flex-start">View family →</span>
          </div>
        </a>`;
    }).join("");

    root.innerHTML = `
      ${header("Families")}
      <div class="page-intro">
        <h1>Families</h1>
        <p>Each family is a user-made lineage of designs. Pick one to meet its characters — retired families are archived exactly as they were left.</p>
      </div>
      <div class="family-grid">${cards}</div>
      ${footer()}`;
  }

  /* ---------- family page ---------- */

  function renderFamily(root) {
    const fam = findFamily(qs.get("id")) || SITE.families[0];
    const cards = fam.characters.map((c) => {
      // Face icon preferred; falls back to badge if no icon set yet
      const art = c.icon
        ? `<img class="face" src="${c.icon}" alt="${esc(plain(c.name))} icon">`
        : c.badge
        ? `<img src="${c.badge}" alt="${esc(plain(c.name))} badge">`
        : `<span class="mono" style="font-size:11px;color:var(--text-faint)">icon pending</span>`;
      const hover = c.hoverColor
        ? ` style="--hover-color:${c.hoverColor};--hover-shadow:${hexToShadow(c.hoverColor)}"` : "";
      return `
        <a class="badge-card" href="character.html?family=${fam.id}&id=${c.id}"${hover}>
          <div class="badge-img">${art}</div>
          <div>
            <div class="name">${rich(c.name)}</div>
            <div class="series">${rich(c.series)}</div>
          </div>
        </a>`;
    }).join("");

    root.innerHTML = `
      ${header("Families")}
      <div class="page-intro" style="padding-bottom:12px">
        <span class="breadcrumb"><a href="families.html">Families</a> / ${rich(fam.name)}</span>
        <h1 style="margin-top:6px">${rich(fam.name)}</h1>
        <p style="margin-top:8px">${rich(fam.about)}</p>
      </div>
      <div class="badge-grid">${cards ||
        '<p style="color:var(--text-faint);font-family:var(--mono);font-size:13px">No characters archived yet.</p>'}</div>
      ${footer()}`;
    setMeta(`${fam.name} — ${SITE.title}`, fam.about, fam.logo);
  }

  /* ---------- character page ---------- */

  function renderCharacter(root) {
    const fam = findFamily(qs.get("family")) || SITE.families[0];
    const idx = Math.max(0, fam.characters.findIndex((c) => c.id === qs.get("id")));
    const c = fam.characters[idx];
    if (!c) { root.innerHTML = header("Families") + '<div class="page-intro"><h1>Character not found</h1></div>' + footer(); return; }

    const thumbs = [c.mainArt, c.badge, ...c.gallery.map((g) => g.img)]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);

    const mainArt = c.mainArt
      ? wm(`<img id="char-main-img" src="${c.mainArt}" alt="${esc(plain(c.name))} art">`, "mainArt")
      : `<span class="mono" style="font-size:12px;color:var(--text-faint)">art pending scan</span>`;

    const thumbHtml = thumbs.map((t, i) => `
      <div class="char-thumb${i === 0 ? " selected" : ""}" data-src="${t}">
        <img src="${t}" alt="thumbnail">
      </div>`).join("");

    const vbRows = Object.entries(c.voicebank || {}).map(([k, v]) =>
      `<span class="k">${rich(k)}</span><span>${rich(v)}</span>`).join("");

    const creditRows = (c.credits || []).map((cr) =>
      `<span>${withIcon(cr.icon, cr.role)} — <a href="${href(cr.url)}">${rich(cr.name)}</a></span>`).join("");

    const dls = (c.downloads || []).map((d) =>
      `<a class="btn ${d.primary ? "btn-primary" : "btn-outline"}" style="font-size:14px;padding:12px 24px" href="${href(d.url)}">${withIcon(d.icon, d.label)}</a>`).join("");

    const gallery = (c.gallery || []).map((g) => `
      <div class="art-item">
        <button class="art-frame lightbox-open" data-img="${g.img}" data-caption="${esc(g.caption)}" type="button">
          ${wm(`<img src="${g.img}" alt="${esc(plain(g.caption))}">`, "gallery")}
        </button>
        <span class="art-caption">${rich(g.caption)}</span>
      </div>`).join("");

    const prev = fam.characters[(idx - 1 + fam.characters.length) % fam.characters.length];
    const next = fam.characters[(idx + 1) % fam.characters.length];
    const pager = fam.characters.length > 1 ? `
      <div class="char-pager">
        <a href="character.html?family=${fam.id}&id=${prev.id}">← ${rich(prev.name)}</a>
        <a href="character.html?family=${fam.id}&id=${next.id}">${rich(next.name)} →</a>
      </div>` : "";

    root.innerHTML = `
      ${header("Families")}
      <div class="char-head">
        <span class="breadcrumb"><a href="families.html">Families</a> / <a href="family.html?id=${fam.id}">${rich(fam.name)}</a> / ${rich(c.name)}</span>
        <div class="char-title">
          ${c.badge ? `<img src="${c.badge}" alt="${esc(plain(c.name))} badge">` : ""}
          <h1>${rich(c.name)}</h1>
          ${pill(c.status)}
        </div>
      </div>
      <div class="char-layout">
        <div class="char-media">
          <div class="char-main-art">${mainArt}</div>
          <div class="char-thumbs">${thumbHtml}</div>
        </div>
        <div class="char-info">
          <p class="char-bio">${rich(c.bio)}</p>
          ${vbRows ? `
          <div class="info-table">
            <div class="table-head">VOICEBANK INFO</div>
            <div class="rows">${vbRows}</div>
          </div>` : ""}
          ${creditRows ? `
          <div class="info-table">
            <div class="table-head">CREDITS</div>
            <div class="list">${creditRows}</div>
          </div>` : ""}
          ${dls ? `<div class="char-downloads">${dls}</div>` : ""}
        </div>
      </div>
      ${gallery ? `
      <div class="char-gallery">
        <h2>Artwork</h2>
        <div class="art-grid">${gallery}</div>
      </div>` : ""}
      ${pager}
      ${footer()}`;

    setMeta(`${c.name} — ${SITE.title}`, c.bio, c.mainArt || c.badge);

    // thumbnail click → swap main image
    root.querySelectorAll(".char-thumb").forEach((th) => {
      th.addEventListener("click", () => {
        const img = document.getElementById("char-main-img");
        if (img) img.src = th.dataset.src;
        root.querySelectorAll(".char-thumb").forEach((t) => t.classList.remove("selected"));
        th.classList.add("selected");
      });
    });

    // gallery squares (and main art) → popup viewer
    wireLightbox(root);
    const mainImg = document.getElementById("char-main-img");
    if (mainImg) {
      mainImg.style.cursor = "zoom-in";
      mainImg.addEventListener("click", () =>
        openLightbox(mainImg.src, plain(c.name)));
    }
  }

  /* ---------- about ---------- */

  function renderAbout(root) {
    const a = SITE.about;

    const cards = (a.cards || []).map((c) => `
      <div class="about-card">
        ${c.icon ? `<span class="icon">${icon(c.icon)}</span>` : ""}
        <h2>${rich(c.title)}</h2>
        <p>${rich(c.text)}</p>
      </div>`).join("");

    const col = a.collector;
    const collector = col ? `
      <div class="collector">
        <img src="${col.img}" alt="the collector's favorite">
        <div class="collector-body">
          <span class="kicker">${rich(col.kicker)}</span>
          <h2>${rich(col.heading)}</h2>
          <p>${rich(col.text)}</p>
          <div class="actions">
            ${(col.buttons || []).map((b) =>
              `<a class="btn btn-outline" href="${href(b.url || b.mailto)}">${withIcon(b.icon, b.label)}</a>`).join("")}
          </div>
        </div>
      </div>` : "";

    const policy = a.policy ? `
      <div class="policy">
        <span class="kicker">${rich(a.policy.kicker)}</span>
        <p>${rich(a.policy.text)}</p>
      </div>` : "";

    // Badge parade — every character badge in the archive, linking home
    const badges = allCharacters()
      .filter(({ char }) => char.badge)
      .map(({ family, char }) => `
        <a href="character.html?family=${family.id}&id=${char.id}" title="${esc(plain(char.name))}">
          <img src="${char.badge}" alt="${esc(plain(char.name))} badge">
        </a>`).join("");

    const artCount = allCharacters()
      .reduce((n, { char }) => n + (char.gallery || []).length, 0);
    const stats = `
      <div class="about-stats">
        <span>${SITE.families.length} families</span>
        <span>${allCharacters().length} characters</span>
        <span>${artCount} pieces of art</span>
        ${SITE.established ? `<span>${rich(SITE.established)}</span>` : ""}
      </div>`;

    root.innerHTML = `
      ${header("About")}
      <div class="about-hero">
        <span class="kicker">${rich(a.kicker)}</span>
        <h1>${rich(a.heading)}</h1>
        <p>${rich(a.intro)}</p>
        <div class="badge-row">${badges}</div>
      </div>
      ${stats}
      <div class="section">
        <div class="section-head">
          <h2>The archive, in short</h2>
          <span class="meta">macloids 101</span>
        </div>
        <div class="about-cards">${cards}</div>
      </div>
      ${collector}
      ${policy}
      ${footer()}`;
  }

  function hexToShadow(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, .15)`;
  }

  /* ---------- boot ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    setupProtection();
    const root = document.getElementById("app");
    if (!root) return;
    const page = root.dataset.page;
    ({ home: renderHome, families: renderFamilies, family: renderFamily,
       character: renderCharacter, about: renderAbout }[page] || renderHome)(root);
  });
})();
