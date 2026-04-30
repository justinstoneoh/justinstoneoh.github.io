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

// ---- Fun Stuff: Reaction Time Game ----
const reactionBox = $("#reactionBox");
const reactionStartBtn = $("#reactionStartBtn");
const reactionResetBtn = $("#reactionResetBtn");
const reactionResult = $("#reactionResult");

let reactionTimeout = null;
let reactionStartTime = null;
let reactionState = "idle"; // idle | waiting | go

function reactionReset() {
  if (reactionTimeout) clearTimeout(reactionTimeout);
  reactionTimeout = null;
  reactionStartTime = null;
  reactionState = "idle";
  reactionBox.className = "reaction-box";
  reactionBox.textContent = "Press Start";
  reactionResult.textContent = "Result: —";
}

reactionStartBtn?.addEventListener("click", () => {
  reactionReset();
  reactionState = "waiting";
  reactionBox.className = "reaction-box wait";
  reactionBox.textContent = "Wait for green...";

  const delay = 1200 + Math.random() * 2500; // 1.2s - 3.7s
  reactionTimeout = setTimeout(() => {
    reactionState = "go";
    reactionStartTime = performance.now();
    reactionBox.className = "reaction-box go";
    reactionBox.textContent = "CLICK!";
  }, delay);
});

reactionResetBtn?.addEventListener("click", reactionReset);

reactionBox?.addEventListener("click", () => {
  if (reactionState === "waiting") {
    reactionBox.className = "reaction-box too-soon";
    reactionBox.textContent = "Too soon!";
    reactionResult.textContent = "Result: Too soon — press Start to try again.";
    reactionState = "idle";
    if (reactionTimeout) clearTimeout(reactionTimeout);
    reactionTimeout = null;
    return;
  }

  if (reactionState === "go") {
    const ms = Math.round(performance.now() - reactionStartTime);
    reactionResult.textContent = `Result: ${ms} ms`;
    reactionBox.className = "reaction-box";
    reactionBox.textContent = "Press Start";
    reactionState = "idle";
  }
});

// ---- Fun Stuff: Number Guessing Game ----
const guessForm = $("#guessForm");
const guessInput = $("#guessInput");
const guessFeedback = $("#guessFeedback");
const guessStats = $("#guessStats");
const newGameBtn = $("#newGameBtn");

let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

function newGame() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  if (guessInput) guessInput.value = "";
  if (guessFeedback) guessFeedback.textContent = "New game started. Guess a number 1–100.";
  if (guessStats) guessStats.textContent = "Attempts: 0";
}

newGameBtn?.addEventListener("click", newGame);

guessForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = Number(guessInput.value);
  if (!val || val < 1 || val > 100) {
    guessFeedback.textContent = "Enter a valid number between 1 and 100.";
    return;
  }

  attempts += 1;
  guessStats.textContent = `Attempts: ${attempts}`;

  if (val === secretNumber) {
    guessFeedback.textContent = `Correct! The number was ${secretNumber}. You got it in ${attempts} tries.`;
  } else if (val < secretNumber) {
    guessFeedback.textContent = "Too low. Try again.";
  } else {
    guessFeedback.textContent = "Too high. Try again.";
  }
});

// ---- Fun Stuff: Daily Challenge Generator ----
const challengeBtn = $("#challengeBtn");
const challengeText = $("#challengeText");

const challenges = [
  "Write down 3 goals for next week and do the smallest step for one of them (2 minutes).",
  "Do a 10-minute focus session: phone away, one task only.",
  "Send one message to a classmate/friend to check in.",
  "Improve this website: add one new project card with a link to a repo.",
  "Learn one new shortcut or command and use it 5 times today.",
  "Go for a 10-minute walk and come back to finish one task."
];

challengeBtn?.addEventListener("click", () => {
  const pick = challenges[Math.floor(Math.random() * challenges.length)];
  const date = new Date().toISOString().slice(0, 10);
  challengeText.textContent = `Challenge (${date}): ${pick}`;
});
