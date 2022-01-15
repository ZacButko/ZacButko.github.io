const initialLetterStatus = [0, 0, 0, 0, 0];
const letterClasses = ["notFound", "partial", "correct"];
const defaultIncludedLetters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
var currentRow = 0;
var currentWord = "";
var letterStatus = [...initialLetterStatus];
var guessList = [];
var excludedLetters = [];
var includedLetters = defaultIncludedLetters;
var mustLetters = [];
var solution = [null, null, null, null, null];
var solutionList = words;
var wrongSpot = [];
var rightSpot = [];

const makeNewRow = (index) => {
  currentRow = Number.isInteger(index) ? index : currentRow + 1;
  var newRow = document.createElement("div");
  newRow.classList.add("wordRow");
  for (var i = 0; i < 5; i++) {
    var newLetter = document.createElement("div");
    newLetter.classList.add("letter");
    newLetter.setAttribute("onclick", `updateStatus(${i})`);
    newLetter.setAttribute("id", `row-${currentRow}-letter-${i}`);
    newRow.appendChild(newLetter);
  }
  document.getElementById("wordContainer").appendChild(newRow);
};

const updateStats = (nSolutions, included, excluded, possible) => {
  document.getElementById("nSolutions").innerHTML = Number.isInteger(nSolutions)
    ? `Number of possible solutions: ${nSolutions}`
    : "";
  document.getElementById("solutionsList").innerHTML = possible
    ? `Possible solutions: ${possible}`
    : "";
};

const reset = () => {
  // remove all existing rows
  const containerRoot = document.getElementById("wordContainer");
  while (containerRoot.firstChild) {
    containerRoot.removeChild(containerRoot.firstChild);
  }
  currentRow = 0;
  currentWord = "";
  letterStatus = [...initialLetterStatus];
  guessList = [];
  excludedLetters = [];
  includedLetters = defaultIncludedLetters;
  mustLetters = [];
  wrongSpot = [];
  rightSpot = [];
  solution = [null, null, null, null, null];
  solutionList = words;
  makeNewRow(0);
  updateStats(null, null, null, null);
  updateKeyboard();
};

const randWord = (wordList) => {
  return wordList[Math.floor(Math.random() * (wordList.length + 1))];
};

const hydrateWord = () => {
  for (var i = 0; i < 5; i++) {
    document.getElementById(`row-${currentRow}-letter-${i}`).innerHTML =
      currentWord[i] || "";
  }
};
const hydrateLetterStatus = () => {
  for (var i = 0; i < 5; i++) {
    let el = document.getElementById(`row-${currentRow}-letter-${i}`);
    el.classList.add(letterClasses[0]);
    el.classList.remove(letterClasses[1]);
    el.classList.remove(letterClasses[2]);
  }
};
const resetLetterStatus = () => {
  letterStatus = [...initialLetterStatus];
  hydrateLetterStatus();
};

const newSuggestion = () => {
  currentWord = randWord(solutionList);
  hydrateWord();
  resetLetterStatus();
};

const getEliminateList = () => {
  let lettersToExclude = [];
  solutionList.forEach((word) => {
    [...word].forEach((char) => {
      if (
        !excludedLetters.includes(char) &&
        !mustLetters.includes(char) &&
        !lettersToExclude.includes(char)
      ) {
        lettersToExclude.push(char);
      }
    });
  });
  let highestScore = 0;
  let matches = [];
  words.forEach((word) => {
    let uniqueLetters = [];
    [...word].forEach((char) => {
      if (lettersToExclude.includes(char) && !uniqueLetters.includes(char)) {
        uniqueLetters.push(char);
      }
    });
    if (uniqueLetters.length > highestScore) {
      highestScore = uniqueLetters.length;
      matches = [word];
    } else if (uniqueLetters.length === highestScore) {
      matches.push(word);
    }
  });
  return matches;
};

const eliminatePossibilities = () => {
  const possibles = getEliminateList();
  currentWord = randWord(possibles);
  hydrateWord();
  resetLetterStatus();
};

const updateStatus = (ind) => {
  // sets color classes for active letters
  let el = document.getElementById(`row-${currentRow}-letter-${ind}`);
  el.classList.remove(letterClasses[letterStatus[ind]]);
  letterStatus[ind] = (letterStatus[ind] + 1) % 3;
  el.classList.add(letterClasses[letterStatus[ind]]);
};

const updateSolutionList = () => {
  let newList = [];
  solutionList.forEach((word) => {
    let pass = true;
    [...word].forEach((char, index) => {
      if (excludedLetters.includes(char)) {
        pass = false;
      } else if (solution[index] && solution[index] !== char) {
        pass = false;
      }
    });
    if (pass) {
      newList.push(word);
    }
  });
  solutionList = newList;
};

const submitStatus = () => {
  if (currentWord.length === 5) {
    guessList.push([currentWord, letterStatus]);
    let win = true;
    for (var i = 0; i < 5; i++) {
      const letter = currentWord[i];
      const status = letterStatus[i];
      if (status === 0) {
        // letter not correct
        win = false;
        if (!excludedLetters.includes(letter)) {
          excludedLetters.push(letter);
          includedLetters = includedLetters.filter((item) => item != letter);
        }
      } else {
        if (!mustLetters.includes(letter)) {
          mustLetters.push(letter);
        }
        if (status === 2) {
          solution[i] = letter;
          if (!rightSpot.includes(letter)) {
            rightSpot.push(letter);
            wrongSpot = wrongSpot.filter((item) => item != letter);
          }
        } else {
          if (!wrongSpot.includes(letter) && !rightSpot.includes(letter)) {
            wrongSpot.push(letter);
          }
          win = false;
        }
      }
    }
    if (win) {
      document.getElementById("solutions").innerHTML = `Congratulations!!`;
    } else {
      makeNewRow();
      updateSolutionList();
      updateStats(
        solutionList.length,
        includedLetters,
        excludedLetters,
        solutionList.slice(0, Math.min(50, solutionList.length))
      );
      updateKeyboard();
      currentWord = "";
      letterStatus = [...initialLetterStatus];
    }
  }
};

const input = (char) => {
  if (char) {
    if (char === "back") {
      // only use back if current word isn't empty
      if (currentWord.length) {
        currentWord = currentWord.slice(0, currentWord.length - 1);
        hydrateWord();
        resetLetterStatus();
      }
    } else if (char === "enter") {
      // only allow submit if current word is length 5
      if (currentWord.length === 5) {
        submitStatus();
      }
    } else if (currentWord.length < 5) {
      // relying on inputs to input() to sanitize chars for us
      currentWord += char;
      hydrateWord();
      resetLetterStatus();
    }
  }
};

document.onkeydown = (e) => {
  // magic
  var char = "";
  if (/^([a-zA-Z])/.test(e.key) && e.key.length === 1) {
    // single a-z or A-Z character
    char = e.key.toLowerCase();
  } else if (e.key === "Backspace") {
    char = "back";
  } else if (e.key === "Enter") {
    char = "enter";
  }
  input(char);
};

reset();
