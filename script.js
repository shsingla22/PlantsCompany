/* Verdure · Home Plant Systems — interactions */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- theme toggle ---------- */
  const themeToggle = $("#themeToggle");
  const storedTheme = (() => {
    try { return localStorage.getItem("verdure-theme"); } catch { return null; }
  })();
  if (storedTheme === "dark" || (!storedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.dataset.theme = "dark";
  }
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("verdure-theme", next); } catch { /* private mode */ }
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
    $("#finderMatch").innerHTML = `
      <span class="match__emoji">${match.emoji}</span>
      <h3>${match.name}</h3>
      <p class="match__latin">${match.latin}</p>
      <p>${match.why}</p>
      <div class="match__badges">${match.badges.map((b) => `<span class="badge">${b}</span>`).join("")}</div>
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
  const PLANTS = [
    { emoji: "🌱", name: "Monstera Deliciosa", latin: "Monstera deliciosa", tags: ["statement"], tint: ["#dcefe0", "#eef3e2"], water: "Weekly", light: "Bright, indirect", pets: false, desc: "The split-leaf celebrity. Fast-growing and dramatic, with fenestrated leaves that get bolder every year." },
    { emoji: "🐍", name: "Snake Plant", latin: "Sansevieria trifasciata", tags: ["easy", "low-light"], tint: ["#e6ecd8", "#f2efe0"], water: "Every 3 weeks", light: "Any", pets: false, desc: "Upright, architectural, indestructible. Filters the air while you forget it exists." },
    { emoji: "💚", name: "Golden Pothos", latin: "Epipremnum aureum", tags: ["easy", "low-light"], tint: ["#ddeede", "#eff2e0"], water: "Weekly", light: "Low to bright", pets: false, desc: "Trailing vines for shelves and hooks. Roots from a cutting in a glass of water." },
    { emoji: "🕷️", name: "Spider Plant", latin: "Chlorophytum comosum", tags: ["easy", "pet-safe"], tint: ["#e2f0e4", "#f4f1e4"], water: "Weekly", light: "Medium", pets: true, desc: "Cheerful arching ribbons that shoot out baby plantlets. Completely safe for cats and dogs." },
    { emoji: "🌿", name: "Boston Fern", latin: "Nephrolepis exaltata", tags: ["pet-safe", "low-light"], tint: ["#dcefdc", "#ecf2e0"], water: "2× a week", light: "Indirect", pets: true, desc: "A cascade of soft fronds that loves humidity. Happiest in bathrooms and shaded porches." },
    { emoji: "🎻", name: "Fiddle Leaf Fig", latin: "Ficus lyrata", tags: ["statement"], tint: ["#e4eedb", "#f2f0e0"], water: "Weekly", light: "Bright", pets: false, desc: "Violin-shaped leaves on a tree that can reach your ceiling. Demanding, but worth every ray." },
    { emoji: "🦚", name: "Calathea Orbifolia", latin: "Goeppertia orbifolia", tags: ["statement", "pet-safe", "low-light"], tint: ["#def0e8", "#eef2e4"], water: "Weekly", light: "Low, indirect", pets: true, desc: "Silver-striped leaves that fold up at night like praying hands. A living piece of art." },
    { emoji: "🌴", name: "Parlor Palm", latin: "Chamaedorea elegans", tags: ["easy", "pet-safe", "low-light"], tint: ["#e0eedd", "#f1f2e2"], water: "Every 10 days", light: "Low to medium", pets: true, desc: "A Victorian favorite: soft, feathery, pet-safe, and content in the corner you thought was hopeless." },
    { emoji: "🪴", name: "ZZ Plant", latin: "Zamioculcas zamiifolia", tags: ["easy", "low-light"], tint: ["#e3edd9", "#f2f1e1"], water: "Every 3 weeks", light: "Low to bright", pets: false, desc: "Glossy, waxy, water-storing. The plant that thrives on the least attention of all." },
    { emoji: "📿", name: "String of Pearls", latin: "Senecio rowleyanus", tags: ["statement"], tint: ["#e2efe2", "#f3f1e3"], water: "Every 2 weeks", light: "Bright", pets: false, desc: "Beads of green tumbling from the pot like a living necklace. A sun-drenched shelf's best friend." },
    { emoji: "🌵", name: "Echeveria", latin: "Echeveria elegans", tags: ["easy"], tint: ["#e7f0e0", "#f5f1e2"], water: "Every 3 weeks", light: "Direct sun", pets: false, desc: "Sea-glass rosettes that ask only for sunshine and restraint with the watering can." },
    { emoji: "🍑", name: "Peperomia", latin: "Peperomia obtusifolia", tags: ["easy", "pet-safe"], tint: ["#e1efdf", "#f2f2e1"], water: "Every 10 days", light: "Medium", pets: true, desc: "Compact, rubbery leaves in endless varieties. Desk-sized, pet-safe, and quietly charming." },
  ];

  const catalogGrid = $("#catalogGrid");
  catalogGrid.innerHTML = PLANTS.map(
    (p, i) => `
    <button class="plant-card" data-tags="${p.tags.join(" ")}" data-index="${i}" style="--tint-a:${p.tint[0]};--tint-b:${p.tint[1]}">
      <span class="plant-card__art">${p.emoji}</span>
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
      <span class="modal__emoji">${plant.emoji}</span>
      <h3 id="modalTitle">${plant.name}</h3>
      <p class="modal__latin">${plant.latin}</p>
      <p>${plant.desc}</p>
      <dl class="modal__care">
        <div><dt>💧 Watering</dt><dd>${plant.water}</dd></div>
        <div><dt>☀️ Light</dt><dd>${plant.light}</dd></div>
        <div><dt>🐾 Pets</dt><dd>${plant.pets ? "Safe for pets" : "Keep out of reach"}</dd></div>
        <div><dt>🤖 Verdure pick</dt><dd>${plant.tags.includes("easy") ? "Terra Sense" : "Aqua Loop + Terra Sense"}</dd></div>
      </dl>
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
