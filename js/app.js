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

function getBeepAudio() {
  return document.getElementById("beepSound");
}

function unlockAudio() {
  const audio = getBeepAudio();
  audio.volume = settings.volume;

  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
    })
    .catch(() => {
      // Nekateri telefoni zahtevajo še en klik uporabnika.
    });
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

function playBeep(volume = settings.volume) {
  const originalAudio = getBeepAudio();

  const audio = originalAudio.cloneNode();
  audio.volume = Math.max(0, Math.min(1, volume));
  audio.currentTime = 0;

  audio.play().catch(() => {
    // Telefon/brskalnik je lahko v silent mode ali blokira autoplay.
  });
}

function shortBeep() {
  playBeep(settings.volume * 0.65);
}

function alarmBeep() {
  playBeep(settings.volume);
  setTimeout(() => playBeep(settings.volume), 260);
  setTimeout(() => playBeep(settings.volume), 520);
}

function finalAlarm() {
  alarmBeep();
  setTimeout(() => alarmBeep(), 850);
}

function testSound() {
  unlockAudio();
  alarmBeep();
  vibrate([100, 80, 100]);
}

function vibrate(pattern = 120) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function start() {
  if (timer) return;

  unlockAudio();
  shortBeep();
  vibrate(120);
  updateDisplay();

  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 3 && timeLeft > 0) {
      shortBeep();
      vibrate(60);
    }

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

  finalAlarm();
  vibrate([200, 100, 200, 100, 300]);
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
