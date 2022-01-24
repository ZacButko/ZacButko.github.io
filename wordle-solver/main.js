const letterClasses = ["notFound", "partial", "correct"];
const defaultpossibleLetters = [
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
const initialState = {
  currentRow: 0,
  currentWord: "",
  letterScore: [0, 0, 0, 0, 0],
  letterStates: {
    excludedLetters: [],
    possibleLetters: [...defaultpossibleLetters],
    wrongSpot: {},
    solution: [null, null, null, null, null],
  },
  // wordList will be the most up-to-date list of possible words, matching all provided patterns
  wordList: [...words],
};
state = {};

const makeNewRow = (index) => {
  state.currentRow = Number.isInteger(index) ? index : state.currentRow + 1;
  var newRow = document.createElement("div");
  newRow.classList.add("wordRow");
  for (var i = 0; i < 5; i++) {
    var newLetter = document.createElement("div");
    newLetter.classList.add("letter");
    newLetter.setAttribute("onclick", `changeScore(${i})`);
    newLetter.setAttribute("id", `row-${state.currentRow}-letter-${i}`);
    newRow.appendChild(newLetter);
  }
  document.getElementById("wordContainer").appendChild(newRow);
};

const reset = () => {
  // resets UI
  // remove all existing rows
  const containerRoot = document.getElementById("wordContainer");
  while (containerRoot.firstChild) {
    containerRoot.removeChild(containerRoot.firstChild);
  }
  // make the first row
  makeNewRow(0);
  // reset state
  state = JSON.parse(JSON.stringify(initialState));
  // update UI
  updateUI(state);
};

const updateUI = (s) => {
  // refresh UI to match current state
  // update current word
  for (var i = 0; i < 5; i++) {
    document.getElementById(`row-${s.currentRow}-letter-${i}`).innerHTML =
      s.currentWord[i] || "";
  }
  // update letter score ui
  for (var i = 0; i < 5; i++) {
    let el = document.getElementById(`row-${s.currentRow}-letter-${i}`);
    const score = s?.letterScore[i];
    el.classList.remove(...letterClasses);
    el.classList.add(letterClasses[score]);
  }
  // updateStatsUI
  // dont show any stats if no progress has been made (no guesses, either excluce or correct)
  const showStats =
    s?.letterStates?.excludedLetters?.length ||
    Object.keys(s?.letterStates?.wrongSpot)?.length ||
    s?.letterStates?.rightSpot?.length;
  if (showStats) {
    document.getElementById("solutions").classList.remove("hidden");
    const nSolutions = s?.wordList?.length;
    var wList = s?.wordList
      .slice(0, Math.min(50, s?.wordList?.length + 1))
      .map((word) => [...word].map((char) => char.toUpperCase()).join(""));
    if (50 < s.wordList.length + 1) wList.push("...");
    document.getElementById(
      "nSolutions"
    ).innerHTML = `Number of possible solutions: ${nSolutions}`;
    document.getElementById(
      "solutionsList"
    ).innerHTML = `Possible solutions: ${wList.join(", ")}`;
  } else {
    document.getElementById("solutions").classList.add("hidden");
  }

  // handle error display
  el = document.getElementById("error");
  if (s.error) {
    el.classList.remove("hidden");
    el.innerHTML = s.error;
  } else {
    el.classList.add("hidden");
  }
};

const changeScore = (ind) => {
  // activated when user clicks on a letter, indicating that its score chould change
  // changes score from 'notFound' to 'partial' to 'correct' to 'notFound'
  // updates state, and updates ui classes for that letter
  let newScore = [...state?.letterScore];
  // updates UI
  let el = document.getElementById(`row-${state.currentRow}-letter-${ind}`);
  // remove existing class
  el.classList.remove(letterClasses[newScore[ind]]);
  // change score
  newScore[ind] = (newScore[ind] + 1) % 3;
  // add new class
  el.classList.add(letterClasses[newScore[ind]]);
  // update state
  state = { ...state, letterScore: newScore };
};

const updateWordList = (wordList, excludedLetters, solution, wrongSpot) => {
  // helper function to prune down word list based on latest rules
  let newList = [];
  wordList.forEach((word) => {
    // innocent until proven guilty
    let pass = true;
    [...word].forEach((char, index) => {
      if (excludedLetters.includes(char)) {
        // cannot include word if contains a letter we know doesn't exist
        pass = false;
      } else if (solution[index] && solution[index] !== char) {
        // cannot include word if the letters don't match our known right spots
        pass = false;
      }
    });
    // has to also include all wrong spot characters
    Object.keys(wrongSpot).forEach((char) => {
      if (!word.includes(char)) {
        // if there exists a character that must be in the word but is not in this word, fail
        pass = false;
      }
      // cannot be a word where we already know the letter is in the wrong spot
      // all the indicies that are wrong for this letter
      const indicies = wrongSpot[char];
      indicies.forEach((index) => {
        if (word[index] === char) {
          // word has this character at this index, fail
          pass = false;
        }
      });
    });
    if (pass) {
      newList.push(word);
    }
  });
  return newList;
};

const checkSubmission = (s) => {
  // will check the submission state
  // if current word has all 5 letters, we can check it
  // will add
  if (s?.currentWord?.length === 5 && words.includes(s?.currentWord)) {
    var newState = JSON.parse(JSON.stringify(s));
    var {
      currentWord,
      letterScore,
      letterStates: { excludedLetters, possibleLetters, wrongSpot, solution },
      wordList,
    } = newState;
    var win = true;
    var error = false;
    // iterate over all letters in the word, make sure they make sense
    for (var i = 0; i < 5; i++) {
      const letter = currentWord[i];
      const status = letterScore[i];
      if (status === 0) {
        // letter not correct
        win = false;
        if (
          solution.includes(letter) ||
          Object.keys(wrongSpot).includes(letter)
        ) {
          // we were told previously that this letter is correct, now saying not found
          error = `${letter} marked as incorrect, but was previously indicated to be in the word`;
        } else if (!excludedLetters.includes(letter)) {
          // first time seeing this character be excluded
          excludedLetters.push(letter);
          possibleLetters = possibleLetters.filter((item) => item != letter);
        }
      } else {
        // letter is some kind of correct
        if (excludedLetters.includes(letter)) {
          // we were told previously this letter wasn't in word, but now saying it is
          error = `${letter} was previously in the word. Cannot be missing now!`;
        }
        if (status === 2) {
          // correct letter in correct spot
          if (solution[i] && solution[i] !== letter) {
            error = `${solution[i]} was previously said to be at position ${i} in word, now saying ${letter}`;
          }
          solution[i] = letter;
        } else {
          // correct letter in wrong spot
          if (!wrongSpot[letter]) {
            // if we don't know about this letter yet, add it to wrongSpot list
            wrongSpot[letter] = [i];
          } else if (!wrongSpot[letter].includes(i)) {
            // we know the letter but found a new spot it doesn't belong
            wrongSpot[letter].push(i);
          }
          win = false;
        }
      }
    }
    if (!error && !win) {
      // check if there are solutions left
      wordList = updateWordList(wordList, excludedLetters, solution, wrongSpot);
      if (wordList?.length === 0) {
        error = "No more solutions left!";
      }
    }
    return {
      win: win,
      error: error,
      letterStates: {
        excludedLetters: excludedLetters,
        possibleLetters: possibleLetters,
        wrongSpot: wrongSpot,
        solution: solution,
      },
      wordList: wordList,
    };
  } else {
    if (!words.includes(s?.currentWord)) return { error: "Not a valid word!" };
    return {};
  }
};

const submitStatus = () => {
  // all submitting actions

  // 1. evaluate state
  const newState = checkSubmission(state);
  const { win, error } = newState;
  if (Object.keys(newState).length === 0) {
    // checkSubmission didn't run becuase state wasn't valid to run
    gtag("event", "finalize", { event_label: "pass" });
    console.debug("nothing was done");
  } else if (error) {
    // if error, show error, but don't do anything else
    gtag("event", "finalize", { event_label: "error" });
    state.error = error;
    updateUI(state);
  } else if (win) {
    // if win, show win, don't do anything else
    gtag("event", "finalize", { event_label: "win", value: state?.currentRow });
    document.getElementById("solutions").innerHTML = `Congratulations!!`;
  } else {
    // state checks out
    gtag("event", "finalize", {
      event_label: "continue",
      value: state?.currentRow,
    });
    // 3. reset most of state, but keep the results we just found
    state = { ...initialState, ...newState, currentRow: state.currentRow };
    // 2. make a new row (this bumps state.currentRow)
    makeNewRow();
    // 4. update UI to match new state
    updateUI(state);
    // 5. update keyboard with new state
    updateKeyboard(state);
  }
};

const input = (char) => {
  // handle input, either from typing or from on screen keyboard
  const word = state.currentWord;
  if (char) {
    if (char === "back") {
      // only use back if current word isn't empty
      if (word.length) {
        state.currentWord = word.slice(0, word.length - 1);
        state.letterScore = [0, 0, 0, 0, 0];
        updateUI(state);
      }
    } else if (char === "enter") {
      // only allow submit if current word is length 5
      if (word.length === 5) {
        submitStatus();
      }
    } else if (word.length < 5) {
      // relying on inputs to input() to sanitize chars for us
      state.currentWord += char;
      state.letterScore = [0, 0, 0, 0, 0];
      updateUI(state);
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

// reset application
reset();
