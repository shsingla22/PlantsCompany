/* ThePlantsCompany · Home Plant Systems — interactions */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- theme toggle ---------- */
  const themeToggle = $("#themeToggle");
  const storedTheme = (() => {
    try { return localStorage.getItem("tpc-theme"); } catch { return null; }
  })();
  if (storedTheme === "dark" || (!storedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.dataset.theme = "dark";
  }
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("tpc-theme", next); } catch { /* private mode */ }
  });

  /* ---------- nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#navBurger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("is-open"))
  );

  /* ---------- cursor glow ---------- */
  const glow = $(".cursor-glow");
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    });
  } else {
    glow.style.display = "none";
  }

  /* ---------- reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- animated counters ---------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        counterObserver.unobserve(el);
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const duration = 1600;
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => counterObserver.observe(el));

  /* ---------- hero sensor chips drift ---------- */
  const heroMoisture = $("#heroMoisture");
  setInterval(() => {
    heroMoisture.textContent = `${58 + Math.round(Math.random() * 8)}%`;
  }, 2600);

  /* ---------- tilt cards ---------- */
  $$(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      card.style.transform = `perspective(800px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  /* ---------- plant finder quiz ---------- */
  const finderSteps = $$(".finder__step");
  const finderBar = $("#finderBar");
  const answers = {};
  let step = 0;

  const MATCHES = [
    { if: { pets: "yes", light: "low" }, emoji: "🌿", name: "Boston Fern", latin: "Nephrolepis exaltata", why: "Lush, pet-safe, and perfectly happy away from harsh sun. Loves a misting — pair it with Terra Sense to nail the humidity.", badges: ["Pet safe", "Low light", "Humidity lover"] },
    { if: { pets: "yes", light: "bright" }, emoji: "🌴", name: "Parlor Palm", latin: "Chamaedorea elegans", why: "A graceful, non-toxic palm that soaks up bright rooms and forgives busy weeks. The gentle giant of pet households.", badges: ["Pet safe", "Bright light", "Air purifying"] },
    { if: { pets: "yes" }, emoji: "🕷️", name: "Spider Plant", latin: "Chlorophytum comosum", why: "Cheerful, prolific, and completely pet-safe. It even sends out baby plantlets you can gift to friends.", badges: ["Pet safe", "Easy care", "Makes babies"] },
    { if: { care: "low", light: "low" }, emoji: "🪴", name: "ZZ Plant", latin: "Zamioculcas zamiifolia", why: "Glossy, sculptural, and nearly indestructible. It stores water in its rhizomes and thrives on wholesome neglect.", badges: ["Set & forget", "Low light", "Drought proof"] },
    { if: { care: "low" }, emoji: "🐍", name: "Snake Plant", latin: "Sansevieria trifasciata", why: "Architectural leaves, air-purifying credentials, and a watering schedule you can measure in weeks. The ultimate starter plant.", badges: ["Set & forget", "Any light", "Air purifying"] },
    { if: { care: "high", light: "medium" }, emoji: "🦚", name: "Calathea Orbifolia", latin: "Goeppertia orbifolia", why: "Hand-painted leaves that fold up each night. She's dramatic — but with your devotion and a humidity assist, she's a showstopper.", badges: ["Statement", "Humidity lover", "Rewards care"] },
    { if: { light: "bright", care: "high" }, emoji: "🎻", name: "Fiddle Leaf Fig", latin: "Ficus lyrata", why: "The icon. Give it your brightest corner and steady attention, and it'll grow into the centerpiece of your home.", badges: ["Statement", "Bright light", "Tree-sized"] },
    { if: { light: "bright" }, emoji: "🌵", name: "Echeveria", latin: "Echeveria elegans", why: "A rosette of sea-glass green that adores sunbeams and asks for water only when the soil is bone dry.", badges: ["Sun lover", "Tiny footprint", "Easy care"] },
    { if: { light: "low" }, emoji: "💚", name: "Golden Pothos", latin: "Epipremnum aureum", why: "Trailing vines that thrive nearly anywhere and root from a cutting in plain water. Generous, forgiving, and lovely on a shelf.", badges: ["Low light", "Trailing", "Easy care"] },
    { if: {}, emoji: "🌱", name: "Monstera Deliciosa", latin: "Monstera deliciosa", why: "The beloved split-leaf classic. Fast-growing, dramatic, and happiest with weekly check-ins — a perfect match for you.", badges: ["Statement", "Fast grower", "Classic"] },
  ];

  const showStep = (n) => {
    step = n;
    finderSteps.forEach((s, i) => s.classList.toggle("is-active", i === n));
    finderBar.style.width = `${((n) / (finderSteps.length - 1)) * 100 || 5}%`;
  };

  const renderMatch = () => {
    const match = MATCHES.find((m) =>
      Object.entries(m.if).every(([k, v]) => answers[k] === v)
    );
    const plant = PLANTS.find((p) => p.name === match.name);
    $("#finderMatch").innerHTML = `
      ${plant ? `<img class="match__photo" src="${plant.img}" alt="${match.name} (${match.latin})" />` : `<span class="match__emoji">${match.emoji}</span>`}
      <h3>${match.emoji} ${match.name}</h3>
      <p class="match__latin">${match.latin}</p>
      <p>${match.why}</p>
      <div class="match__badges">${match.badges.map((b) => `<span class="badge">${b}</span>`).join("")}</div>
      ${plant ? `
      <div class="match__shop">
        <a class="btn btn--primary" href="${plant.buy.amazon}" target="_blank" rel="noopener noreferrer">🛒 Shop on Amazon</a>
        <a class="btn btn--ghost" href="${plant.buy.etsy}" target="_blank" rel="noopener noreferrer">Find on Etsy</a>
      </div>` : ""}
    `;
  };

  $$(".option").forEach((btn) =>
    btn.addEventListener("click", () => {
      answers[btn.dataset.key] = btn.dataset.value;
      if (step === finderSteps.length - 2) renderMatch();
      showStep(step + 1);
    })
  );
  $("#finderRestart").addEventListener("click", () => {
    Object.keys(answers).forEach((k) => delete answers[k]);
    showStep(0);
  });
  showStep(0);

  /* ---------- catalog ---------- */
  const shopLinks = (query) => ({
    amazon: `https://www.amazon.com/s?k=${encodeURIComponent(query + " live plant")}`,
    etsy: `https://www.etsy.com/search?q=${encodeURIComponent(query + " live plant")}`,
  });

  const PLANTS = [
    { emoji: "🌱", name: "Monstera Deliciosa", latin: "Monstera deliciosa", img: "assets/img/monstera.jpg", buy: shopLinks("monstera deliciosa"), tags: ["statement"], tint: ["#dcefe0", "#eef3e2"], water: "Weekly", light: "Bright, indirect", pets: false, desc: "The split-leaf celebrity. Fast-growing and dramatic, with fenestrated leaves that get bolder every year." },
    { emoji: "🐍", name: "Snake Plant", latin: "Sansevieria trifasciata", img: "assets/img/snake-plant.jpg", buy: shopLinks("snake plant sansevieria"), tags: ["easy", "low-light"], tint: ["#e6ecd8", "#f2efe0"], water: "Every 3 weeks", light: "Any", pets: false, desc: "Upright, architectural, indestructible. Filters the air while you forget it exists." },
    { emoji: "💚", name: "Golden Pothos", latin: "Epipremnum aureum", img: "assets/img/pothos.jpg", buy: shopLinks("golden pothos"), tags: ["easy", "low-light"], tint: ["#ddeede", "#eff2e0"], water: "Weekly", light: "Low to bright", pets: false, desc: "Trailing vines for shelves and hooks. Roots from a cutting in a glass of water." },
    { emoji: "🕷️", name: "Spider Plant", latin: "Chlorophytum comosum", img: "assets/img/spider-plant.jpg", buy: shopLinks("spider plant"), tags: ["easy", "pet-safe"], tint: ["#e2f0e4", "#f4f1e4"], water: "Weekly", light: "Medium", pets: true, desc: "Cheerful arching ribbons that shoot out baby plantlets. Completely safe for cats and dogs." },
    { emoji: "🌿", name: "Boston Fern", latin: "Nephrolepis exaltata", img: "assets/img/boston-fern.jpg", buy: shopLinks("boston fern"), tags: ["pet-safe", "low-light"], tint: ["#dcefdc", "#ecf2e0"], water: "2× a week", light: "Indirect", pets: true, desc: "A cascade of soft fronds that loves humidity. Happiest in bathrooms and shaded porches." },
    { emoji: "🎻", name: "Fiddle Leaf Fig", latin: "Ficus lyrata", img: "assets/img/fiddle-leaf-fig.jpg", buy: shopLinks("fiddle leaf fig"), tags: ["statement"], tint: ["#e4eedb", "#f2f0e0"], water: "Weekly", light: "Bright", pets: false, desc: "Violin-shaped leaves on a tree that can reach your ceiling. Demanding, but worth every ray." },
    { emoji: "🦚", name: "Calathea Orbifolia", latin: "Goeppertia orbifolia", img: "assets/img/calathea.jpg", buy: shopLinks("calathea orbifolia"), tags: ["statement", "pet-safe", "low-light"], tint: ["#def0e8", "#eef2e4"], water: "Weekly", light: "Low, indirect", pets: true, desc: "Silver-striped leaves that fold up at night like praying hands. A living piece of art." },
    { emoji: "🌴", name: "Parlor Palm", latin: "Chamaedorea elegans", img: "assets/img/parlor-palm.jpg", buy: shopLinks("parlor palm"), tags: ["easy", "pet-safe", "low-light"], tint: ["#e0eedd", "#f1f2e2"], water: "Every 10 days", light: "Low to medium", pets: true, desc: "A Victorian favorite: soft, feathery, pet-safe, and content in the corner you thought was hopeless." },
    { emoji: "🪴", name: "ZZ Plant", latin: "Zamioculcas zamiifolia", img: "assets/img/zz-plant.jpg", buy: shopLinks("zz plant"), tags: ["easy", "low-light"], tint: ["#e3edd9", "#f2f1e1"], water: "Every 3 weeks", light: "Low to bright", pets: false, desc: "Glossy, waxy, water-storing. The plant that thrives on the least attention of all." },
    { emoji: "📿", name: "String of Pearls", latin: "Senecio rowleyanus", img: "assets/img/string-of-pearls.jpg", buy: shopLinks("string of pearls"), tags: ["statement"], tint: ["#e2efe2", "#f3f1e3"], water: "Every 2 weeks", light: "Bright", pets: false, desc: "Beads of green tumbling from the pot like a living necklace. A sun-drenched shelf's best friend." },
    { emoji: "🌵", name: "Echeveria", latin: "Echeveria elegans", img: "assets/img/echeveria.jpg", buy: shopLinks("echeveria succulent"), tags: ["easy"], tint: ["#e7f0e0", "#f5f1e2"], water: "Every 3 weeks", light: "Direct sun", pets: false, desc: "Sea-glass rosettes that ask only for sunshine and restraint with the watering can." },
    { emoji: "🍑", name: "Peperomia", latin: "Peperomia obtusifolia", img: "assets/img/peperomia.jpg", buy: shopLinks("peperomia obtusifolia"), tags: ["easy", "pet-safe"], tint: ["#e1efdf", "#f2f2e1"], water: "Every 10 days", light: "Medium", pets: true, desc: "Compact, rubbery leaves in endless varieties. Desk-sized, pet-safe, and quietly charming." },
  ];

  const catalogGrid = $("#catalogGrid");
  catalogGrid.innerHTML = PLANTS.map(
    (p, i) => `
    <button class="plant-card" data-tags="${p.tags.join(" ")}" data-index="${i}" style="--tint-a:${p.tint[0]};--tint-b:${p.tint[1]}">
      <span class="plant-card__art">
        <img src="${p.img}" alt="${p.name} (${p.latin})" loading="lazy" />
      </span>
      <span class="plant-card__body">
        <h3>${p.name}</h3>
        <span class="plant-card__latin">${p.latin}</span>
        <span class="plant-card__meta">
          ${p.pets ? '<span class="badge">🐾 Pet safe</span>' : '<span class="badge badge--warn">⚠ Keep from pets</span>'}
          <span class="badge">💧 ${p.water}</span>
        </span>
      </span>
    </button>`
  ).join("");

  $$(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      $$(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const filter = chip.dataset.filter;
      $$(".plant-card").forEach((card) => {
        const show = filter === "all" || card.dataset.tags.split(" ").includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    })
  );

  /* ---------- plant modal ---------- */
  const modal = $("#plantModal");
  const modalBody = $("#modalBody");
  let lastFocused = null;

  const openModal = (plant) => {
    lastFocused = document.activeElement;
    modalBody.innerHTML = `
      <img class="modal__photo" src="${plant.img}" alt="${plant.name} (${plant.latin})" />
      <h3 id="modalTitle">${plant.emoji} ${plant.name}</h3>
      <p class="modal__latin">${plant.latin}</p>
      <p>${plant.desc}</p>
      <dl class="modal__care">
        <div><dt>💧 Watering</dt><dd>${plant.water}</dd></div>
        <div><dt>☀️ Light</dt><dd>${plant.light}</dd></div>
        <div><dt>🐾 Pets</dt><dd>${plant.pets ? "Safe for pets" : "Keep out of reach"}</dd></div>
        <div><dt>🤖 Our pick</dt><dd>${plant.tags.includes("easy") ? "Terra Sense" : "Aqua Loop + Terra Sense"}</dd></div>
      </dl>
      <div class="modal__shop">
        <a class="btn btn--primary" href="${plant.buy.amazon}" target="_blank" rel="noopener noreferrer">🛒 Shop on Amazon</a>
        <a class="btn btn--ghost" href="${plant.buy.etsy}" target="_blank" rel="noopener noreferrer">Find on Etsy</a>
      </div>
    `;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal__close").focus();
  };
  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };
  catalogGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".plant-card");
    if (card) openModal(PLANTS[+card.dataset.index]);
  });
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* ---------- live dashboard ---------- */
  const gaugeFill = $("#gaugeFill");
  const gaugeScore = $("#gaugeScore");
  const gaugeEmoji = $("#gaugeEmoji");
  const advice = $("#dashAdvice");
  const CIRCUMFERENCE = 2 * Math.PI * 92;
  gaugeFill.style.strokeDasharray = CIRCUMFERENCE;

  const controls = {
    moisture: { input: $("#ctlMoisture"), out: $("#outMoisture"), ideal: 55, tolerance: 30 },
    light: { input: $("#ctlLight"), out: $("#outLight"), ideal: 60, tolerance: 35 },
    humidity: { input: $("#ctlHumidity"), out: $("#outHumidity"), ideal: 50, tolerance: 35 },
  };

  const MOODS = [
    [85, "🌿", "Perfect balance — your plant is humming. 🎶", false],
    [65, "🙂", "Pretty comfy. A small tweak and it's paradise.", false],
    [45, "😕", "Your plant is coping, not thriving. Check the sliders in the red.", true],
    [0, "🥀", "Stress mode! This is when Terra Sense would gently ping you.", true],
  ];

  const updateDash = () => {
    let score = 100;
    const complaints = [];
    for (const [key, c] of Object.entries(controls)) {
      const val = +c.input.value;
      c.out.textContent = `${val}%`;
      c.input.style.setProperty("--fill", `${val}%`);
      const deviation = Math.abs(val - c.ideal);
      const penalty = Math.max(0, deviation - 10) / c.tolerance;
      score -= Math.min(penalty, 1) * 33;
      if (penalty > 0.55) complaints.push(val > c.ideal ? `too much ${key}` : `not enough ${key}`);
    }
    score = Math.max(0, Math.round(score));
    gaugeScore.textContent = score;
    gaugeFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - score / 100);
    gaugeFill.style.stroke = score > 65 ? "#3a7d52" : score > 40 ? "#d9a441" : "#c96f4a";
    const mood = MOODS.find(([min]) => score >= min);
    gaugeEmoji.textContent = mood[1];
    gaugeEmoji.style.transform = `scale(${1 + score / 400})`;
    advice.textContent = complaints.length
      ? `${mood[2]} (${complaints.join(", ")})`
      : mood[2];
    advice.classList.toggle("is-warn", mood[3]);
  };
  Object.values(controls).forEach((c) => c.input.addEventListener("input", updateDash));
  updateDash();

  /* ---------- watering calculator ---------- */
  const CALC = {
    succulent: { base: 14, ml: 60, note: "Let the soil dry out completely between drinks — soggy roots are the one thing it can't forgive." },
    tropical: { base: 7, ml: 250, note: "Water when the top 3 cm of soil feels dry. It likes rhythm more than volume." },
    fern: { base: 3, ml: 200, note: "Keep the soil consistently moist (never soggy) and mist often — it dreams of rainforests." },
    herb: { base: 2, ml: 150, note: "Herbs drink fast in a sunny window. Check daily in high summer." },
  };
  const POT_FACTOR = { small: 0.6, medium: 1, large: 1.6 };
  const calcInputs = ["calcPlant", "calcPot", "calcSeason"].map((id) => $(`#${id}`));

  const updateCalc = () => {
    const [plant, pot, season] = calcInputs.map((el) => el.value);
    const cfg = CALC[plant];
    const winter = season === "winter";
    const days = Math.round(cfg.base * (winter ? 1.8 : 1));
    const ml = Math.round(cfg.ml * POT_FACTOR[pot] * (winter ? 0.7 : 1));
    const dropCount = Math.max(1, Math.min(6, Math.round(ml / 80)));
    $("#calcDrops").innerHTML = Array.from(
      { length: dropCount },
      (_, i) => `<span style="animation-delay:${i * 0.08}s">💧</span>`
    ).join("");
    $("#calcText").innerHTML =
      `About <strong>${ml} ml</strong> every <strong>${days === 1 ? "day" : `${days} days`}</strong>. ${cfg.note}`;
  };
  calcInputs.forEach((el) => el.addEventListener("change", updateCalc));
  updateCalc();

  /* ---------- testimonials carousel ---------- */
  const quotes = $$(".quote");
  const dots = $$(".quotes__dot");
  let quoteIndex = 0;
  let quoteTimer;

  const showQuote = (i) => {
    quoteIndex = i;
    quotes.forEach((q, j) => q.classList.toggle("is-active", j === i));
    dots.forEach((d, j) => d.classList.toggle("is-active", j === i));
  };
  const autoAdvance = () => {
    quoteTimer = setInterval(() => showQuote((quoteIndex + 1) % quotes.length), 6000);
  };
  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      clearInterval(quoteTimer);
      showQuote(i);
      autoAdvance();
    })
  );
  autoAdvance();

  /* ---------- plantscape studio ---------- */
  // ratio = viewBox width/height; Safari can report naturalWidth 0 for SVG
  // images, so sizes are never derived from the loaded image.
  const STICKERS = [
    { id: "monstera", label: "Monstera", kind: "floor", scale: 0.42, ratio: 220 / 260 },
    { id: "rubber-plant", label: "Rubber plant", kind: "floor", scale: 0.44, ratio: 190 / 260 },
    { id: "bird-of-paradise", label: "Bird of paradise", kind: "floor", scale: 0.5, ratio: 200 / 290 },
    { id: "palm", label: "Areca palm", kind: "floor", scale: 0.48, ratio: 240 / 270 },
    { id: "snake-plant", label: "Snake plant", kind: "floor", scale: 0.3, ratio: 160 / 230 },
    { id: "olive-tree", label: "Olive tree", kind: "floor", scale: 0.55, ratio: 210 / 290 },
    { id: "fern-hanging", label: "Hanging fern", kind: "hang", scale: 0.28, ratio: 200 / 240 },
    { id: "pothos-hanging", label: "Hanging pothos", kind: "hang", scale: 0.3, ratio: 180 / 250 },
    { id: "cactus-trio", label: "Desert trio", kind: "accent", scale: 0.14, ratio: 240 / 150 },
  ];
  const stickerById = {};
  STICKERS.forEach((s) => {
    s.src = `assets/stickers/${s.id}.svg`;
    s.img = new Image();
    s.img.onload = () => render();
    s.img.src = s.src;
    stickerById[s.id] = s;
  });

  const EXAMPLES = [
    { id: "living-room", title: "Cozy living room", img: "assets/img/rooms/living-room.jpg" },
    { id: "bedroom", title: "Calm bedroom", img: "assets/img/rooms/bedroom.jpg" },
    { id: "empty-room", title: "Blank canvas", img: "assets/img/rooms/empty-room.jpg" },
    { id: "deck", title: "Backyard deck", img: "assets/img/rooms/deck.jpg" },
  ];

  const studioUpload = $("#studioUpload");
  const studioWork = $("#studioWork");
  const stage = $("#studioStage");
  const canvas = $("#studioCanvas");
  const ctx = canvas.getContext("2d");
  const beforeLayer = $("#beforeLayer");
  const beforeImg = $("#beforeImg");
  const compareRange = $("#compareRange");
  const selBar = $("#selBar");

  let baseImg = null;
  let aiImg = null; // photorealistic AI makeover, drawn instead of baseImg
  let placed = [];
  let selected = -1;
  let plantDensity = "medium";
  let lightLevel = "medium";

  /* light analysis: mean luminance blended with highlight strength (windows,
     sky) separates dim corners from bright rooms with dark floors.
     Each level carries a wide species pool; generations sample from it so
     suggestions and renders vary instead of repeating the same few plants. */
  const LIGHT_INFO = {
    low: {
      label: "Low light",
      desc: "low",
      pool: [
        "ZZ plant", "snake plant", "golden pothos", "marble queen pothos",
        "parlor palm", "cast iron plant", "Chinese evergreen (aglaonema)",
        "red-tinged aglaonema", "peace lily", "heartleaf philodendron",
        "dracaena", "silver satin scindapsus",
      ],
    },
    medium: {
      label: "Medium, indirect light",
      desc: "medium indirect",
      pool: [
        "calathea orbifolia", "rattlesnake calathea", "boston fern",
        "spider plant", "watermelon peperomia", "monstera adansonii",
        "dieffenbachia", "anthurium with red blooms", "prayer plant",
        "dracaena marginata", "hoya", "philodendron brasil",
      ],
    },
    bright: {
      label: "Bright light",
      desc: "bright",
      pool: [
        "monstera deliciosa", "fiddle-leaf fig", "bird of paradise",
        "burgundy rubber plant", "croton with colourful leaves",
        "echeveria and mixed succulents", "string of pearls", "jade plant",
        "olive tree", "areca palm", "yucca", "alocasia",
        "ponytail palm", "small citrus tree",
      ],
    },
  };
  const samplePool = (pool, n) => {
    const copy = [...pool];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  };

  const analyzeLight = (img) => {
    const off = document.createElement("canvas");
    off.width = off.height = 64;
    const c = off.getContext("2d");
    c.drawImage(img, 0, 0, 64, 64);
    const d = c.getImageData(0, 0, 64, 64).data;
    const lum = [];
    for (let i = 0; i < d.length; i += 4) {
      lum.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
    }
    lum.sort((a, b) => a - b);
    const mean = lum.reduce((s, v) => s + v, 0) / lum.length;
    const p95 = lum[Math.floor(lum.length * 0.95)];
    const score = mean * 0.6 + p95 * 0.4;
    return score < 120 ? "low" : score < 150 ? "medium" : "bright";
  };

  const showLightInsight = () => {
    const info = LIGHT_INFO[lightLevel];
    const recs = samplePool(info.pool, 4).map((p) => p.replace(/\s*\(.*\)|\s+with .*/g, ""));
    const el = $("#lightInsight");
    el.innerHTML = `☀️ <strong>Light check: ${info.label}.</strong> Plants that will thrive here: ${recs.join(", ")}.`;
    el.hidden = false;
  };

  const HANDLE = 14;

  const bbox = (p) => {
    const w = p.h * p.s.ratio;
    return { x: p.x - w / 2, y: p.y - p.h / 2, w, h: p.h };
  };

  const render = (showSel = true) => {
    if (!baseImg) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(aiImg || baseImg, 0, 0, canvas.width, canvas.height);
    for (const p of placed) {
      if (!p.s.img.complete) continue; // redrawn by the sticker's onload
      const b = bbox(p);
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.flip) ctx.scale(-1, 1);
      ctx.drawImage(p.s.img, -b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    if (showSel && selected >= 0 && placed[selected]) {
      const b = bbox(placed[selected]);
      ctx.save();
      ctx.strokeStyle = "#3a7d52";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12);
      ctx.setLineDash([]);
      ctx.fillStyle = "#3a7d52";
      ctx.beginPath();
      ctx.arc(b.x + b.w + 6, b.y + b.h + 6, HANDLE / 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const setSelected = (i) => {
    selected = i;
    selBar.hidden = i < 0;
    render();
  };

  // canvas always adopts the aspect ratio of whatever image it displays —
  // AI models can return a different aspect than the upload, and stretching
  // the result onto the original ratio visibly distorts it
  const sizeCanvasTo = (img) => {
    const maxW = 1400;
    const scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
  };

  const loadBase = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      baseImg = img;
      sizeCanvasTo(img);
      beforeImg.src = src;
      placed = [];
      aiImg = null;
      $("#undoAiBtn").hidden = true;
      lightLevel = analyzeLight(img);
      showLightInsight();
      setSelected(-1);
      compareRange.value = 0;
      updateCompare();
      studioUpload.hidden = true;
      studioWork.hidden = false;
      render();
      resolve();
    };
    img.src = src;
  });

  const addSticker = (s, opts = {}) => {
    const h = (opts.h ?? s.scale) * canvas.height;
    const w = h * s.ratio;
    let x, y;
    if (opts.x != null) {
      x = opts.x * canvas.width;
      y = opts.y * canvas.height;
    } else if (s.kind === "hang") {
      x = canvas.width * (0.25 + Math.random() * 0.5);
      y = h / 2 - canvas.height * 0.02;
    } else {
      x = canvas.width * (0.3 + Math.random() * 0.4);
      y = canvas.height * 0.96 - h / 2;
    }
    // keep within frame horizontally
    x = Math.max(w * 0.25, Math.min(canvas.width - w * 0.25, x));
    placed.push({ s, x, y, h, flip: !!opts.flip });
    setSelected(placed.length - 1);
  };

  const beautify = () => {
    placed = [];
    const side = Math.random() < 0.5 ? 1 : 0; // 1 = tall plant on right
    const jitter = () => (Math.random() - 0.5) * 0.04;
    const floors = STICKERS.filter((s) => s.kind === "floor");
    const pickFloor = (not) => {
      let s = floors[Math.floor(Math.random() * floors.length)];
      if (not.includes(s)) s = floors[(floors.indexOf(s) + 2) % floors.length];
      return s;
    };
    const tall = pickFloor([]);
    const medium = pickFloor([tall]);
    const hang = Math.random() < 0.5 ? stickerById["fern-hanging"] : stickerById["pothos-hanging"];
    const otherHang = hang.id === "fern-hanging" ? stickerById["pothos-hanging"] : stickerById["fern-hanging"];

    const tallH = 0.5;
    addSticker(tall, { x: (side ? 0.9 : 0.1) + jitter(), y: 0.97 - tallH / 2, h: tallH, flip: !!side });
    const hangH = 0.28;
    addSticker(hang, { x: (side ? 0.16 : 0.84) + jitter(), y: hangH / 2 - 0.02, h: hangH });
    if (plantDensity !== "low") {
      const medH = 0.32;
      addSticker(medium, { x: (side ? 0.08 : 0.92) + jitter(), y: 0.97 - medH / 2, h: medH, flip: !side });
      if (canvas.width / canvas.height > 1.15 || plantDensity === "high") {
        addSticker(stickerById["cactus-trio"], { x: 0.5 + jitter() * 3, y: 0.94, h: 0.11 });
      }
    }
    if (plantDensity === "high") {
      const extra = pickFloor([tall, medium]);
      const exH = 0.26;
      addSticker(extra, { x: 0.32 + jitter(), y: 0.98 - exH / 2, h: exH, flip: !!side });
      addSticker(otherHang, { x: (side ? 0.36 : 0.64) + jitter(), y: 0.26 / 2 - 0.02, h: 0.26 });
    }
    setSelected(-1);
  };

  /* palette + example thumbs */
  $("#stickerPalette").innerHTML = STICKERS.map(
    (s) => `<button class="palette-item" data-id="${s.id}"><img src="${s.src}" alt="" />${s.label}</button>`
  ).join("");
  $("#stickerPalette").addEventListener("click", (e) => {
    const btn = e.target.closest(".palette-item");
    if (btn) addSticker(stickerById[btn.dataset.id]);
  });

  $("#exampleThumbs").innerHTML = EXAMPLES.map(
    (ex, i) => `<button class="example-thumb" data-i="${i}"><img src="${ex.img}" alt="${ex.title}" loading="lazy" /><span>${ex.title}</span></button>`
  ).join("");

  const loadExample = (i) => loadBase(EXAMPLES[i].img);
  $("#exampleThumbs").addEventListener("click", (e) => {
    const btn = e.target.closest(".example-thumb");
    if (btn) loadExample(+btn.dataset.i);
  });

  /* upload */
  const dropzone = $("#dropzone");
  const fileInput = $("#fileInput");
  const readFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => loadBase(reader.result);
    reader.readAsDataURL(file);
  };
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fileInput.click(); });
  fileInput.addEventListener("change", () => readFile(fileInput.files[0]));
  ["dragover", "dragenter"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("is-drag"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("is-drag"); })
  );
  dropzone.addEventListener("drop", (e) => readFile(e.dataTransfer.files[0]));

  /* ---- AI Beautify (Gemini image editing, bring-your-own-key) ---- */
  const GEMINI_DEFAULT_MODEL = "gemini-3.1-flash-image";
  const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash-image";
  const DENSITY_PROMPT = {
    low: "a few (2 or 3) realistic potted plants",
    medium: "4 to 6 realistic potted plants",
    high: "8 or more realistic potted plants, layered at different heights",
  };
  // Kept short and positively phrased: long negative instructions ("never
  // place on curtains") make edit models attend to those very objects. The
  // prompt never describes the scene's light; its one mention of lighting
  // is the instruction to leave it unchanged. Species are sampled across
  // the whole palette each run so results vary.
  const ALL_SPECIES = [...LIGHT_INFO.low.pool, ...LIGHT_INFO.medium.pool, ...LIGHT_INFO.bright.pool];
  const buildAiPrompt = () => {
    const species = samplePool(ALL_SPECIES, 5).join(", ");
    return (
      `Add ${DENSITY_PROMPT[plantDensity]} to this photo. ` +
      "This is a small, careful edit: keep everything else exactly as it is — the architecture, walls, " +
      "windows, furniture, floor, colours, lighting, exposure and camera angle must stay unchanged. " +
      `Use varied species, for example ${species}. Mix leaf shapes, ` +
      "sizes and colours, including at least one variegated or colourful variety. " +
      "Give each plant a different stylish pot — ceramic, terracotta, woven basket, stoneware or " +
      "matte black — chosen to match the room's palette. " +
      "Place each plant only where it would truly stand: on open floor, a tabletop, a shelf or a " +
      "windowsill with free space, at realistic scale, grounded with a soft natural shadow, keeping " +
      "walkways, seating and views clear. " +
      "The result should look like a professionally styled photograph of the exact same room."
    );
  };
  const aiPanel = $("#aiPanel");
  const aiError = $("#aiError");
  const aiBusy = $("#aiBusy");

  const baseAsJpeg = () => {
    // original photo only (no stickers/selection), capped for upload size
    const off = document.createElement("canvas");
    const scale = Math.min(1, 1024 / Math.max(baseImg.naturalWidth, baseImg.naturalHeight));
    off.width = Math.round(baseImg.naturalWidth * scale);
    off.height = Math.round(baseImg.naturalHeight * scale);
    off.getContext("2d").drawImage(baseImg, 0, 0, off.width, off.height);
    return off.toDataURL("image/jpeg", 0.87).split(",")[1];
  };
  const b64ToBlob = (b64, type) => {
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type });
  };

  const getGeminiModel = () => {
    try { return localStorage.getItem("tpc-gemini-model") || GEMINI_DEFAULT_MODEL; } catch { return GEMINI_DEFAULT_MODEL; }
  };

  // each generate(key) resolves to an image src (data: or blob: URL)
  const generateGemini = async (key) => {
    const call = (model) => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: baseAsJpeg() } },
              { text: buildAiPrompt() },
            ],
          }],
        }),
      }
    );
    let res = await call(getGeminiModel());
    if (res.status === 404 && getGeminiModel() !== GEMINI_FALLBACK_MODEL) {
      // chosen model not available on this key/region — fall back
      res = await call(GEMINI_FALLBACK_MODEL);
    }
    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      const reason = detail?.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 || res.status === 403) {
        throw Object.assign(new Error(`That key was rejected (${reason}). Please paste a valid Gemini API key.`), { badKey: true });
      }
      if (res.status === 429) throw new Error("The free quota for this key is used up right now — try again in a minute.");
      throw new Error(`The AI service returned an error: ${reason}`);
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
    if (!imgPart) {
      const text = parts.find((p) => p.text)?.text;
      throw new Error(text ? `The model replied without an image: ${text.slice(0, 140)}` : "The model returned no image — please try again.");
    }
    const inline = imgPart.inlineData || imgPart.inline_data;
    return `data:${inline.mimeType || inline.mime_type || "image/png"};base64,${inline.data}`;
  };

  const HF_CLIENT_URL = "https://cdn.jsdelivr.net/npm/@huggingface/inference@4/+esm";
  const HF_DEFAULT_MODEL = "black-forest-labs/FLUX.1-Kontext-dev";
  const getHfModel = () => {
    try { return localStorage.getItem("tpc-hf-model") || HF_DEFAULT_MODEL; } catch { return HF_DEFAULT_MODEL; }
  };
  const generateHf = async (key) => {
    let InferenceClient;
    try {
      ({ InferenceClient } = await import(HF_CLIENT_URL));
    } catch {
      throw new Error("Could not load the Hugging Face client — check your connection and try again.");
    }
    const model = getHfModel();
    try {
      const client = new InferenceClient(key);
      const blob = await client.imageToImage({
        provider: "auto",
        model,
        inputs: b64ToBlob(baseAsJpeg(), "image/jpeg"),
        parameters: { prompt: buildAiPrompt() },
      });
      return URL.createObjectURL(blob);
    } catch (err) {
      const msg = String(err?.message || err);
      if (/gated|must be authorized|access request|license/i.test(msg)) {
        throw new Error(`${model} is a gated model — open huggingface.co/${model}, accept its license with your account, then try again (or switch the model to Qwen Image Edit 2509).`);
      }
      if (/401|invalid|credential|unauthorized/i.test(msg)) {
        throw Object.assign(new Error("That token was rejected. Paste a valid Hugging Face token with 'Inference Providers' permission."), { badKey: true });
      }
      if (/402|credit|quota|exceeded/i.test(msg)) {
        throw new Error("This Hugging Face account is out of free inference credits for now — try again later or add billing on hf.co.");
      }
      throw new Error(`Hugging Face returned an error: ${msg.slice(0, 160)}`);
    }
  };

  const AI_PROVIDERS = {
    gemini: {
      label: "Google Gemini",
      keyName: "tpc-gemini-key",
      placeholder: "Paste your Gemini API key",
      link: "https://aistudio.google.com/apikey",
      linkText: "aistudio.google.com/apikey",
      generate: generateGemini,
    },
    hf: {
      label: "Hugging Face",
      keyName: "tpc-hf-key",
      placeholder: "Paste your Hugging Face token (hf_…)",
      link: "https://huggingface.co/settings/tokens",
      linkText: "huggingface.co/settings/tokens",
      generate: generateHf,
    },
  };
  let aiProvider = (() => {
    try { return localStorage.getItem("tpc-ai-provider") || "gemini"; } catch { return "gemini"; }
  })();
  if (!AI_PROVIDERS[aiProvider]) aiProvider = "gemini";

  const getAiKey = () => {
    try { return localStorage.getItem(AI_PROVIDERS[aiProvider].keyName) || ""; } catch { return ""; }
  };
  const syncProviderUI = () => {
    const p = AI_PROVIDERS[aiProvider];
    $$('input[name="aiProvider"]').forEach((r) => { r.checked = r.value === aiProvider; });
    $("#aiKeyInput").placeholder = p.placeholder;
    const link = $("#aiKeyLink");
    link.href = p.link;
    link.textContent = p.linkText;
    $("#aiStep1").firstChild.textContent = aiProvider === "hf"
      ? "Get a free token (with “Inference Providers” permission) at "
      : "Get a free key at ";
    $("#hfModelRow").hidden = aiProvider !== "hf";
    $("#hfModelSelect").value = getHfModel();
    $("#geminiModelRow").hidden = aiProvider !== "gemini";
    $("#geminiModelSelect").value = getGeminiModel();
  };
  $("#hfModelSelect").addEventListener("change", (e) => {
    try { localStorage.setItem("tpc-hf-model", e.target.value); } catch { /* ignore */ }
  });
  $("#geminiModelSelect").addEventListener("change", (e) => {
    try { localStorage.setItem("tpc-gemini-model", e.target.value); } catch { /* ignore */ }
  });
  $$('input[name="aiProvider"]').forEach((r) =>
    r.addEventListener("change", () => {
      aiProvider = r.value;
      try { localStorage.setItem("tpc-ai-provider", aiProvider); } catch { /* ignore */ }
      aiError.hidden = true;
      $("#aiKeyInput").value = "";
      syncProviderUI();
    })
  );
  syncProviderUI();

  const showAiError = (msg) => {
    aiError.textContent = msg;
    aiError.hidden = false;
    aiPanel.hidden = false;
  };

  const aiBeautify = async () => {
    const key = getAiKey();
    if (!key) {
      aiError.hidden = true;
      aiPanel.hidden = false;
      $("#aiKeyInput").focus();
      return;
    }
    aiPanel.hidden = true;
    aiBusy.hidden = false;
    try {
      const src = await AI_PROVIDERS[aiProvider].generate(key);
      const result = new Image();
      result.onload = () => {
        aiImg = result;
        sizeCanvasTo(result);
        placed = [];
        setSelected(-1);
        $("#undoAiBtn").hidden = false;
        aiBusy.hidden = true;
        compareRange.value = 50;
        updateCompare();
        render();
      };
      result.onerror = () => { aiBusy.hidden = true; showAiError("Could not decode the AI image — please try again."); };
      result.src = src;
    } catch (err) {
      if (err?.badKey) {
        try { localStorage.removeItem(AI_PROVIDERS[aiProvider].keyName); } catch { /* ignore */ }
      }
      aiBusy.hidden = true;
      showAiError(err?.message || "Something went wrong talking to the AI service.");
    }
  };

  $("#aiBtn").addEventListener("click", aiBeautify);
  $("#aiGoBtn").addEventListener("click", () => {
    const key = $("#aiKeyInput").value.trim();
    if (!key) { showAiError(`Paste your ${AI_PROVIDERS[aiProvider].label} key first.`); return; }
    try { localStorage.setItem(AI_PROVIDERS[aiProvider].keyName, key); } catch { /* private mode: works for this page view only */ }
    aiBeautify();
  });
  $("#aiCancelBtn").addEventListener("click", () => { aiPanel.hidden = true; });
  $("#undoAiBtn").addEventListener("click", () => {
    aiImg = null;
    sizeCanvasTo(baseImg);
    placed = [];
    setSelected(-1);
    $("#undoAiBtn").hidden = true;
    compareRange.value = 0;
    updateCompare();
    render();
  });

  /* toolbar */
  $$(".density__opt").forEach((btn) =>
    btn.addEventListener("click", () => {
      plantDensity = btn.dataset.density;
      $$(".density__opt").forEach((b) => b.classList.toggle("is-active", b === btn));
    })
  );
  $("#stickerBtn").addEventListener("click", () => {
    aiPanel.hidden = true;
    if (aiImg) { aiImg = null; $("#undoAiBtn").hidden = true; }
    beautify();
  });
  $("#clearBtn").addEventListener("click", () => { placed = []; setSelected(-1); });
  $("#newPhotoBtn").addEventListener("click", () => {
    studioWork.hidden = true;
    studioUpload.hidden = false;
    fileInput.value = "";
  });
  $("#downloadBtn").addEventListener("click", () => {
    render(false);
    const a = document.createElement("a");
    a.download = "my-plantscape.jpg";
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.click();
    render();
  });

  /* compare slider — inline styles, not var()-in-clip-path, for Safari */
  const divider = $(".studio__divider");
  const updateCompare = () => {
    const v = +compareRange.value;
    const clip = `inset(0 ${100 - v}% 0 0)`;
    beforeLayer.style.clipPath = clip;
    beforeLayer.style.webkitClipPath = clip;
    divider.style.left = `${v}%`;
    stage.classList.toggle("is-comparing", v > 2);
    compareRange.style.setProperty("--fill", `${v}%`);
  };
  compareRange.addEventListener("input", updateCompare);

  /* canvas interaction */
  const canvasPoint = (e) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };
  let mode = null; // "drag" | "resize"
  let grab = null;

  canvas.addEventListener("pointerdown", (e) => {
    const pt = canvasPoint(e);
    if (selected >= 0 && placed[selected]) {
      const b = bbox(placed[selected]);
      const hx = b.x + b.w + 6, hy = b.y + b.h + 6;
      if (Math.hypot(pt.x - hx, pt.y - hy) < HANDLE * 1.6) {
        mode = "resize";
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    for (let i = placed.length - 1; i >= 0; i--) {
      const b = bbox(placed[i]);
      if (pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h) {
        setSelected(i);
        mode = "drag";
        grab = { dx: pt.x - placed[i].x, dy: pt.y - placed[i].y };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    setSelected(-1);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!mode || selected < 0) return;
    const pt = canvasPoint(e);
    const p = placed[selected];
    if (mode === "drag") {
      p.x = pt.x - grab.dx;
      p.y = pt.y - grab.dy;
    } else {
      const newH = Math.max(canvas.height * 0.05, (pt.y - p.y) * 2 - 12);
      p.h = Math.min(canvas.height * 1.1, newH);
    }
    render();
  });
  const endPointer = () => { mode = null; grab = null; };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("wheel", (e) => {
    if (selected < 0) return;
    e.preventDefault();
    const p = placed[selected];
    p.h = Math.max(canvas.height * 0.05, Math.min(canvas.height * 1.1, p.h * (e.deltaY < 0 ? 1.06 : 0.94)));
    render();
  }, { passive: false });

  /* selection toolbar */
  const withSel = (fn) => { if (selected >= 0 && placed[selected]) { fn(placed[selected]); render(); } };
  $("#selBigger").addEventListener("click", () => withSel((p) => { p.h = Math.min(canvas.height * 1.1, p.h * 1.12); }));
  $("#selSmaller").addEventListener("click", () => withSel((p) => { p.h = Math.max(canvas.height * 0.05, p.h * 0.88); }));
  $("#selFlip").addEventListener("click", () => withSel((p) => { p.flip = !p.flip; }));
  $("#selDelete").addEventListener("click", () => {
    if (selected >= 0) { placed.splice(selected, 1); setSelected(-1); }
  });
  addEventListener("keydown", (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selected >= 0 && !/input|select|textarea/i.test(e.target.tagName)) {
      placed.splice(selected, 1);
      setSelected(-1);
    }
  });

  // test/automation hooks
  window.tpcStudio = { loadExample, hasAi: () => !!aiImg, getLight: () => lightLevel, exportDataURL: () => { render(false); const d = canvas.toDataURL("image/jpeg", 0.9); render(); return d; } };

  /* ---------- newsletter ---------- */
  $("#ctaForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.hidden = true;
    $("#ctaDone").hidden = false;
  });

  /* ---------- footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- hero parallax ---------- */
  if (matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const leaves = $$(".leaf");
    addEventListener("pointermove", (e) => {
      const dx = (e.clientX / innerWidth - 0.5) * 2;
      const dy = (e.clientY / innerHeight - 0.5) * 2;
      leaves.forEach((leaf, i) => {
        const depth = (i + 1) * 5;
        leaf.style.translate = `${dx * depth}px ${dy * depth}px`;
      });
    });
  }
})();
