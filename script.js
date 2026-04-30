const $ = (sel) => document.querySelector(sel);

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Date line (dynamic)
const today = new Date();
$("#todayLine").textContent = `Today is ${today.toISOString().slice(0, 10)} — thanks for visiting.`;

// Email reveal
const revealBtn = $("#revealEmailBtn");
const emailText = $("#emailText");
revealBtn.addEventListener("click", () => {
  // Change if you want your real email:
  const email = "justin" + "." + "stone" + "@example.com";
  emailText.textContent = email;
  emailText.classList.add("mono");
});

// Goal Tracker (interactive + localStorage)
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

// Focus Timer (interactive)
const timeDisplay = $("#timeDisplay");
const startPauseBtn = $("#startPauseBtn");
const resetBtn = $("#resetBtn");
const minutesInput = $("#minutesInput");

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

resetBtn.addEventListener("click", () => {
  pauseTimer();
  setTimerFromInput();
});

setTimerFromInput();
