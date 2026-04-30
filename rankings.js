/* global $ */
if (typeof $ === 'undefined') var $ = (sel) => document.querySelector(sel);

// Generic vote board factory
function createVoteBoard({
  storageKey,
  listEl,
  totalEl,
  resetBtn,
  options,
}) {
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
    if (!listEl) return;

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

  resetBtn?.addEventListener("click", () => {
    if (!confirm("Reset votes?")) return;
    state = options.map(o => ({ ...o, votes: 0 }));
    save(state);
    render();
  });

  render();
}

// ---- Beer Rankings ----
// Feel free to edit this list to your favorites
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

// ---- Best Sport Vote ----
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
