import { words } from "./words";

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
    var error = "";
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
          console.log(
            `${letter} marked as incorrect, but was previously indicated to be in the word`
          );
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

export { checkSubmission };
