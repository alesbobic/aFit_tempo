let timer = null;
let phase = "work";
let timeLeft = 30;
let currentRound = 1;

let settings = {
  work: 30,
  rest: 10,
  rounds: 8
};

function loadSettings() {
  const saved = localStorage.getItem("afitTempoSettings");

  if (saved) {
    settings = JSON.parse(saved);
  }

  document.getElementById("workInput").value = settings.work;
  document.getElementById("restInput").value = settings.rest;
  document.getElementById("roundsInput").value = settings.rounds;
}

function saveSettings() {
  settings.work = Number(document.getElementById("workInput").value);
  settings.rest = Number(document.getElementById("restInput").value);
  settings.rounds = Number(document.getElementById("roundsInput").value);

  localStorage.setItem("afitTempoSettings", JSON.stringify(settings));
  reset();
}

function updateDisplay() {
  const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const sec = String(timeLeft % 60).padStart(2, "0");

  document.getElementById("time").textContent = `${min}:${sec}`;
  document.getElementById("phase").textContent =
    phase === "work" ? "DELO" : "POČITEK";
  document.getElementById("round").textContent =
    `Krog ${currentRound} / ${settings.rounds}`;

  document.body.classList.toggle("rest-mode", phase === "rest");
}

/* 🔊 Osnovni pisk (z glasnostjo) */
function beep(duration = 200, frequency = 600, volume = 0.5) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = frequency;
  osc.type = "sine";

  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  setTimeout(() => {
    osc.stop();
    ctx.close();
  }, duration);
}

/* 🚨 Močan alarm za konec intervala */
function alarmBeep() {
  beep(200, 800, 0.9);

  setTimeout(() => beep(200, 700, 0.9), 250);
  setTimeout(() => beep(300, 600, 1), 500);
}

/* 📳 Vibracija */
function vibrate(pattern = 120) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function start() {
  if (timer) return;

  beep(200, 700);
  vibrate(120);
  updateDisplay();

  timer = setInterval(() => {
    timeLeft--;

    // zadnje 3 sekunde
    if (timeLeft <= 3 && timeLeft > 0) {
      beep(100, 900, 0.6);
      vibrate(60);
    }

    // konec intervala
    if (timeLeft <= 0) {
      alarmBeep();
      vibrate([100, 80, 100]);

      if (phase === "work") {
        phase = "rest";
        timeLeft = settings.rest;
      } else {
        currentRound++;

        if (currentRound > settings.rounds) {
          finishWorkout();
          return;
        }

        phase = "work";
        timeLeft = settings.work;
      }
    }

    updateDisplay();
  }, 1000);
}

function pause() {
  clearInterval(timer);
  timer = null;
}

function reset() {
  pause();
  phase = "work";
  currentRound = 1;
  timeLeft = settings.work;
  updateDisplay();
}

function finishWorkout() {
  pause();

  document.getElementById("phase").textContent = "KONEC";
  document.getElementById("time").textContent = "00:00";
  document.getElementById("round").textContent = "Trening zaključen";

  // močnejši zaključni alarm
  alarmBeep();
  setTimeout(() => alarmBeep(), 600);

  vibrate([200, 100, 200, 100, 300]);
}

/* 🖥 Fullscreen */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

loadSettings();
reset();