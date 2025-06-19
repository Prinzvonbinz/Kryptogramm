const sentences = [
  "Ich liebe Schokolade", "Heute ist ein guter Tag", "Programmieren macht Spaß",
  "Der Himmel ist blau", "Lernen ist wichtig", "ChatGPT hilft mir",
  "Es regnet draußen", "Zeit ist kostbar", "Ich bin bereit", "Freunde sind wichtig",
  "Wissen ist Macht", "Gute Musik macht glücklich", "Die Sonne scheint hell",
  "Bücher sind Schätze", "Ehrlichkeit ist wichtig", "Gemeinsam sind wir stark",
  "Kaffee am Morgen", "Jeder Tag ist ein Geschenk", "Vertrauen ist die Basis",
  "Ich habe Hunger", "Frühstück ist fertig", "Der Hund bellt laut",
  "Die Katze schläft", "Meine Familie ist toll", "Ich mag Mathematik",
  "Sport hält fit", "Atmen nicht vergessen", "Heute wird ein guter Tag",
  "Träume nicht dein Leben", "Mach dein Leben zum Traum",
  "Ein Lächeln kostet nichts", "Wichtig und Richtig", "Alle meine Entchen", "Auf der Heide blüht"
];

let level = 0;
let lives = 3;
let currentSentence = "";
let encrypted = "";
let hints = [];
let currentHintIndex = 0;

const levelCounter = document.getElementById("level-counter");
const livesDisplay = document.getElementById("lives");
const cryptogramDisplay = document.getElementById("cryptogram-display");
const hintDisplay = document.getElementById("hint");
const inputSection = document.getElementById("input-section");
const checkButton = document.getElementById("check-button");

function shuffleAlphabet() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ".split("");
  const shuffled = alphabet.slice().sort(() => Math.random() - 0.5);
  return Object.fromEntries(alphabet.map((letter, i) => [letter, shuffled[i]]));
}

function encrypt(sentence, key) {
  return sentence.toUpperCase().split("").map(char => {
    return key[char] || char;
  }).join("");
}

function generateHints(key, sentence) {
  const used = new Set();
  const hints = [];
  for (const char of sentence.toUpperCase()) {
    if (/[A-ZÄÖÜ]/.test(char) && !used.has(char)) {
      used.add(char);
      hints.push(`${key[char]} = ${char}`);
    }
  }
  return hints;
}

function startLevel() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
  const key = shuffleAlphabet();
  encrypted = encrypt(currentSentence, key);
  hints = generateHints(key, currentSentence);
  currentHintIndex = 0;

  cryptogramDisplay.innerText = encrypted;
  hintDisplay.innerText = `Tipp: ${hints[0] || "—"}`;
  levelCounter.innerText = `Level: ${level}`;
  renderInputs(encrypted);
  updateLives();
  saveProgress();
}

function renderInputs(text) {
  inputSection.innerHTML = "";

  const words = text.split(" ");
  for (const word of words) {
    const wordGroup = document.createElement("div");
    wordGroup.classList.add("word-group");

    for (const char of word) {
      const letterBox = document.createElement("div");
      letterBox.classList.add("letter-box");

      const input = document.createElement("input");
      input.maxLength = 1;
      input.disabled = !/[A-ZÄÖÜ]/.test(char);
      if (!input.disabled) input.dataset.original = char;

      const letterChar = document.createElement("div");
      letterChar.classList.add("letter-char");
      letterChar.innerText = char;

      letterBox.appendChild(input);
      letterBox.appendChild(letterChar);
      wordGroup.appendChild(letterBox);
    }

    inputSection.appendChild(wordGroup);
  }
}

function checkSolution() {
  const inputs = inputSection.querySelectorAll("input");
  let guess = "";
  inputs.forEach(input => {
    guess += input.disabled ? "" : input.value.toUpperCase();
  });

  // Rekonstruiere verschlüsselten Satz (inkl. Leerzeichen)
  const expected = currentSentence.toUpperCase().replace(/[^A-ZÄÖÜ]/g, "");
  if (guess === expected) {
    level++;
    lives = 3;
    startLevel();
  } else {
    lives--;
    updateLives();
    if (lives <= 0) {
      alert("Game Over! Fortschritt wird zurückgesetzt.");
      level = 0;
      lives = 3;
    }
    startLevel();
  }
}

function updateLives() {
  livesDisplay.innerText = "❤️".repeat(lives);
}

function saveProgress() {
  localStorage.setItem("krypto-level", level);
  localStorage.setItem("krypto-lives", lives);
}

function loadProgress() {
  level = parseInt(localStorage.getItem("krypto-level")) || 0;
  lives = parseInt(localStorage.getItem("krypto-lives")) || 3;
}

checkButton.addEventListener("click", checkSolution);

// Swipe für Tippwechsel
let touchStartX = 0;
document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});
document.addEventListener("touchend", (e) => {
  const deltaX = e.changedTouches[0].screenX - touchStartX;
  if (deltaX < -50) {
    currentHintIndex = (currentHintIndex + 1) % hints.length;
    hintDisplay.innerText = `Tipp: ${hints[currentHintIndex] || "—"}`;
  }
});

loadProgress();
startLevel();
