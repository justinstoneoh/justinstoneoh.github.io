// app.js — combined script (script.js + rankings.js)

const $ = (sel) => document.querySelector(sel);

// ── Utilities ──────────────────────────────────────────────────────────────

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Date line ──────────────────────────────────────────────────────────────

const todayLine = $("#todayLine");
if (todayLine) {
  const today = new Date();
  todayLine.textContent = `Today is ${today.toISOString().slice(0, 10)} — thanks for visiting.`;
}

// ── Email reveal ───────────────────────────────────────────────────────────

const revealBtn = $("#revealEmailBtn");
const emailText = $("#emailText");
if (revealBtn && emailText) {
  revealBtn.addEventListener("click", () => {
    const email = "justin" + "." + "stone" + "@example.com";
    emailText.textContent = email;
    emailText.classList.add("mono");
  });
}

// ── Goal Tracker ───────────────────────────────────────────────────────────

const goalForm = $("#goalForm");
const goalInput = $("#goalInput");
const goalList = $("#goalList");
const progressText = $("#progressText");
const clearGoalsBtn = $("#clearGoalsBtn");

const STORAGE_KEY = "justin_goals_v1";

function loadGoals() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}

function saveGoals(goals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

if (goalForm && goalInput && goalList && progressText && clearGoalsBtn) {
  let goals = loadGoals();

  function renderGoals() {
    goalList.innerHTML = "";

    if (goals.length === 0) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="pill">Tip</span> Add a goal above to get started.`;
      goalList.appendChild(li);
      progressText.textContent = "0% complete";
      return;
    }

    const doneCount = goals.filter(g => g.done).length;
    const pct = Math.round((doneCount / goals.length) * 100);
    progressText.textContent = `${pct}% complete (${doneCount}/${goals.length})`;

    goals.forEach((goal) => {
      const li = document.createElement("li");
      li.className = goal.done ? "done" : "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!goal.done;
      checkbox.addEventListener("change", () => {
        goal.done = checkbox.checked;
        saveGoals(goals);
        renderGoals();
      });

      const text = document.createElement("div");
      text.style.flex = "1";
      text.textContent = goal.text;

      const del = document.createElement("button");
      del.className = "button secondary small";
      del.type = "button";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        goals = goals.filter(g => g.id !== goal.id);
        saveGoals(goals);
        renderGoals();
      });

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(del);
      goalList.appendChild(li);
    });
  }

  goalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = goalInput.value.trim();
    if (!text) return;

    goals.unshift({ id: crypto.randomUUID(), text, done: false });
    goalInput.value = "";
    saveGoals(goals);
    renderGoals();
  });

  clearGoalsBtn.addEventListener("click", () => {
    if (!confirm("Clear all goals?")) return;
    goals = [];
    saveGoals(goals);
    renderGoals();
  });

  renderGoals();
}

// ── Focus Timer ────────────────────────────────────────────────────────────

const timeDisplay = $("#timeDisplay");
const startPauseBtn = $("#startPauseBtn");
const timerResetBtn = $("#resetBtn");
const minutesInput = $("#minutesInput");

if (timeDisplay && startPauseBtn && timerResetBtn && minutesInput) {
  let timerSeconds = Number(minutesInput.value) * 60;
  let timerInterval = null;

  function setTimerFromInput() {
    const mins = Math.max(1, Math.min(180, Number(minutesInput.value || 25)));
    minutesInput.value = String(mins);
    timerSeconds = mins * 60;
    timeDisplay.textContent = formatMMSS(timerSeconds);
  }

  minutesInput.addEventListener("change", () => {
    if (timerInterval) return;
    setTimerFromInput();
  });

  function startTimer() {
    if (timerInterval) return;
    startPauseBtn.textContent = "Pause";

    timerInterval = setInterval(() => {
      timerSeconds -= 1;
      timeDisplay.textContent = formatMMSS(timerSeconds);

      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        startPauseBtn.textContent = "Start";
        timeDisplay.textContent = "00:00";
        alert("Timer complete. Nice work.");
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!timerInterval) return;
    clearInterval(timerInterval);
    timerInterval = null;
    startPauseBtn.textContent = "Start";
  }

  startPauseBtn.addEventListener("click", () => {
    if (timerInterval) pauseTimer();
    else startTimer();
  });

  timerResetBtn.addEventListener("click", () => {
    pauseTimer();
    setTimerFromInput();
  });

  setTimerFromInput();
}

// ── Vote Board Factory ─────────────────────────────────────────────────────

function createVoteBoard({ storageKey, listEl, totalEl, resetBtn, options }) {
  if (!listEl) return;

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !Array.isArray(saved)) return options.map(o => ({ ...o, votes: 0 }));
      const map = new Map(saved.map(x => [x.id, x]));
      return options.map(o => ({ ...o, votes: Number(map.get(o.id)?.votes || 0) }));
    } catch {
      return options.map(o => ({ ...o, votes: 0 }));
    }
  }

  function save(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  let state = load();

  function totalVotes() {
    return state.reduce((sum, o) => sum + (o.votes || 0), 0);
  }

  function render() {
    const total = totalVotes();
    if (totalEl) totalEl.textContent = `Total votes: ${total}`;

    const sorted = [...state].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    listEl.innerHTML = "";

    sorted.forEach((opt, idx) => {
      const pct = total === 0 ? 0 : Math.round((opt.votes / total) * 100);

      const item = document.createElement("div");
      item.className = "vote-item";
      item.innerHTML = `
        <div class="vote-top">
          <div>
            <div class="vote-title">#${idx + 1} — ${opt.label}</div>
            <div class="micro">${opt.votes} votes • ${pct}%</div>
          </div>
          <div class="row" style="margin:0;">
            <button class="button small" data-vote="${opt.id}" type="button">Vote</button>
          </div>
        </div>
        <div class="vote-bar" aria-hidden="true"><div style="width:${pct}%"></div></div>
      `;
      listEl.appendChild(item);
    });

    listEl.querySelectorAll("button[data-vote]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-vote");
        const found = state.find(x => x.id === id);
        if (!found) return;
        found.votes += 1;
        save(state);
        render();
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("Reset votes?")) return;
      state = options.map(o => ({ ...o, votes: 0 }));
      save(state);
      render();
    });
  }

  render();
}

// ── Beer Rankings ──────────────────────────────────────────────────────────

createVoteBoard({
  storageKey: "justin_beer_rank_v1",
  listEl: $("#beerList"),
  totalEl: $("#beerTotalText"),
  resetBtn: $("#beerResetBtn"),
  options: [
    { id: "budlight", label: "Bud Light" },
    { id: "millerlite", label: "Miller Lite" },
    { id: "coorslight", label: "Coors Light" },
    { id: "modelo", label: "Modelo" },
    { id: "guinness", label: "Guinness" },
    { id: "heineken", label: "Heineken" },
  ],
});

// ── Best Sport Vote ────────────────────────────────────────────────────────

createVoteBoard({
  storageKey: "justin_best_sport_v1",
  listEl: $("#sportList"),
  totalEl: $("#sportTotalText"),
  resetBtn: $("#sportResetBtn"),
  options: [
    { id: "football", label: "Football" },
    { id: "basketball", label: "Basketball" },
    { id: "baseball", label: "Baseball" },
    { id: "soccer", label: "Soccer" },
    { id: "hockey", label: "Hockey" },
    { id: "mma", label: "MMA / Boxing" },
  ],
});

// ── X-Pulse Tracker (Conspiracy Theories) ─────────────────────────────────

const theoryContainer = document.getElementById("theory-container");
if (theoryContainer) {
  const theories = [
    {
      rank: 1,
      title: "CIA Double-Header: JFK & MLK",
      claim: "CIA orchestrated the assassinations to preserve the military-industrial complex and suppress civil rights movements.",
      whyTrending: "Final 2026 declassification deadline met with heavy redactions, fueling 'Deep State' narratives.",
      metric: "3.5B Impressions"
    },
    {
      rank: 2,
      title: "Flat Earth & The Ice Wall",
      claim: "The Earth is a plane; Antarctica is an 'Ice Wall' guarded by global militaries to hide the edge.",
      whyTrending: "Surge in high-altitude balloon footage and viral 'laser tests' shared on social feeds.",
      metric: "2.2B Hashtag Views"
    },
    {
      rank: 3,
      title: "Moon Landing Hoax (Artemis Era)",
      claim: "Apollo landings were faked. If 2026 tech struggles to return to the moon, 1969 tech couldn't have done it.",
      whyTrending: "Delays in NASA's Artemis III mission compared to rapid China lunar progress.",
      metric: "1.5B Impressions"
    },
    {
      rank: 4,
      title: "Helen Keller 'History Skepticism'",
      claim: "Helen Keller was a political puppet; claims it was physically impossible for her to write books or fly planes.",
      whyTrending: "Gen Z/Alpha creators using AI to 'debunk' historical logistics for viral engagement.",
      metric: "800M Views"
    },
    {
      rank: 5,
      title: "Aliens & Missing Scientists",
      claim: "Extraterrestrials are real and collaborating with humans; recent scientist disappearances are 'extra-planetary transfers.'",
      whyTrending: "2026 Congressional hearings regarding Non-Human Intelligence (NHI) and UAP sightings.",
      metric: "4B+ Combined Mentions"
    }
  ];

  theories.forEach(t => {
    const col = document.createElement("div");
    col.className = "xpulse-card card";
    col.innerHTML = `
      <div class="xpulse-header">
        <span class="xpulse-rank">#${t.rank} Trending</span>
        <span class="micro">Updated: April 2026</span>
      </div>
      <h3>${t.title}</h3>
      <p>${t.claim}</p>
      <p><strong>The 2026 Trigger:</strong> ${t.whyTrending}</p>
      <div class="xpulse-metric"><strong>Viral Metric:</strong> ${t.metric}</div>
    `;
    theoryContainer.appendChild(col);
  });
}
