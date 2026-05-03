let timer = null;
let phase = "work";
let timeLeft = 30;
let currentRound = 1;

let settings = {
  work: 30,
  rest: 10,
  rounds: 8
};

/* 🔓 unlock zvoka (iPhone fix) */
function unlockAudio() {
  document.querySelectorAll("audio").forEach(a => {
    a.play().then(() => {
      a.pause();
      a.currentTime = 0;
    }).catch(()=>{});
  });
}

/* 🔊 play helper */
function play(id) {
  const base = document.getElementById(id);
  const a = base.cloneNode();
  a.play().catch(()=>{});
}

/* 🎵 zvoki */
function soundWork() { play("workSound"); }
function soundRest() { play("restSound"); }
function soundEnd() { play("endSound"); }

/* test */
function testSound() {
  unlockAudio();
  soundWork();
  setTimeout(soundRest, 400);
  setTimeout(soundEnd, 900);
}

function updateDisplay() {
  const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const sec = String(timeLeft % 60).padStart(2, "0");

  document.getElementById("time").textContent = `${min}:${sec}`;
  document.getElementById("phase").textContent =
    phase === "work" ? "DELO" : "POČITEK";
  document.getElementById("round").textContent =
    `Krog ${currentRound} / ${settings.rounds}`;
}

function start() {
  if (timer) return;

  unlockAudio();
  soundWork();

  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {

      if (phase === "work") {
        phase = "rest";
        timeLeft = settings.rest;
        soundRest();

      } else {
        currentRound++;

        if (currentRound > settings.rounds) {
          finishWorkout();
          return;
        }

        phase = "work";
        timeLeft = settings.work;
        soundWork();
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

  soundEnd();
}

function saveSettings() {
  settings.work = Number(document.getElementById("workInput").value);
  settings.rest = Number(document.getElementById("restInput").value);
  settings.rounds = Number(document.getElementById("roundsInput").value);

  reset();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

reset();