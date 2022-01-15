const rows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "back"],
];
const makeKeyboard = () => {
  var keyboard = document.getElementById("keyboard");
  rows.forEach((row) => {
    var newRow = document.createElement("div");
    newRow.classList.add("keyboard-row");
    row.forEach((char) => {
      var letter = document.createElement("div");
      letter.classList.add("keyboard-letter", "unknown");
      letter.innerHTML = char;
      letter.setAttribute("onclick", `input("${char}")`);
      letter.setAttribute("id", `keyboard-letter-${char}`);
      newRow.appendChild(letter);
    });
    keyboard.appendChild(newRow);
  });
};

const updateKeyboard = () => {
  rows.forEach((row) => {
    row.forEach((char) => {
      el = document.getElementById(`keyboard-letter-${char}`);
      if (wrongSpot.includes(char)) {
        el.classList.remove("unknown", "correct", "excluded");
        el.classList.add("partial");
      } else if (rightSpot.includes(char)) {
        el.classList.remove("unknown", "partial", "excluded");
        el.classList.add("correct");
      } else if (excludedLetters.includes(char)) {
        el.classList.remove("unknown", "partial", "correct");
        el.classList.add("excluded");
      } else {
        el.classList.remove("partial", "correct", "excluded");
        el.classList.add("uknown");
      }
    });
  });
};

makeKeyboard();
