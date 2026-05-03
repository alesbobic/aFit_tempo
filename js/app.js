let timer = null;
let phase = "work";
let timeLeft = 30;
let currentRound = 1;

let settings = {
  work: 30,
  rest: 10,
  rounds: 8,
  volume: 1
};

function beepAudio() {
  return document.getElementById("beepSound");
}

function unlockAudio() {
  const audio = beepAudio();
  audio.volume = settings.volume;

  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
    })
    .catch(() => {
      // iPhone lahko zahteva še en klik ali izklop silent mode.
    });
}

function playBeep(volume = settings.volume) {
  const base = beepAudio();
  const sound = base.cloneNode();
  sound.volume = Math.max(0, Math.min(1, volume));
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function alarmBeep() {
  playBeep(settings.volume);
  setTimeout(() => playBeep(settings.volume), 260);
  setTimeout(() => playBeep(settings.volume), 520);
}

function flashScreen() {
  document.body.classList.add("flash");
  setTimeout(() => {
    document.body.classList.remove("flash");
  }, 350);
}

function flashRestPeriod() {
  flashScreen();
  setTimeout(flashScreen, 500);
  setTimeout(flashScreen, 1000);
}

function vibrate(pattern = 120) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function loadSettings() {
  const saved = localStorage.getItem("afitTempoSettings");

  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
  }

  document.getElementById("workInput").value = settings.work;
  document.getElementById("restInput").value = settings.rest;
  document.getElementById("roundsInput").value = settings.rounds;
  document.getElementById("volumeInput").value = settings.volume;
}

function saveSettings() {
  settings.work = Number(document.getElementById("workInput").value);
  settings.rest = Number(document.getElementById("restInput").value);
  settings.rounds = Number(document.getElementById("roundsInput").value);
  settings.volume = Number(document.getElementById("volumeInput").value);

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

function start() {
  if (timer) return;

  unlockAudio();
  playBeep(settings.volume);
  vibrate(120);
  updateDisplay();

  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 3 && timeLeft > 0) {
      playBeep(settings.volume * 0.65);
      flashScreen();
      vibrate(60);
    }

    if (timeLeft <= 0) {
      alarmBeep();
      vibrate([100, 80, 100]);

      if (phase === "work") {
        phase = "rest";
        timeLeft = settings.rest;
        flashRestPeriod();
      } else {
        currentRound++;

        if (currentRound > settings.rounds) {
          finishWorkout();
          return;
        }

        phase = "work";
        timeLeft = settings.work;
        flashScreen();
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
  document.body.classList.remove("flash");
  updateDisplay();
}

function finishWorkout() {
  pause();

  document.getElementById("phase").textContent = "KONEC";
  document.getElementById("time").textContent = "00:00";
  document.getElementById("round").textContent = "Trening zaključen";

  alarmBeep();
  setTimeout(alarmBeep, 900);
  flashRestPeriod();
  vibrate([200, 100, 200, 100, 300]);
}

function testSound() {
  unlockAudio();
  alarmBeep();
  flashRestPeriod();
  vibrate([100, 80, 100]);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

loadSettings();
reset();
