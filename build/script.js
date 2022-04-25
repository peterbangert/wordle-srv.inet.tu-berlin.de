import { WORDS_EN } from "./words_en.js";
import { WORDS_DE } from "./words_de.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let Language = 'en';
let HardMode = false;
let rightGuessString = WORDS_EN[Math.floor(Math.random() * WORDS_EN.length)]
let WORDS = WORDS_EN
let hardModeCorrectGuesses = ['','','','','']; 
let hardModeHints = []; 



$(document).ready(function () {

    $('.l8n-button').click(function () {

        const l8n_dropdown = document.getElementById('l8n');
        for (let i = 0; i < l8n_dropdown.children.length; i++) {
            l8n_dropdown.children[i].style.backgroundColor = "white";
        }

        this.style.backgroundColor = "gray";

        switch (this.id) {
            case 'en':
                rightGuessString = WORDS_EN[Math.floor(Math.random() * WORDS_EN.length)]
                WORDS = WORDS_EN
                Language = 'en';
                removeDEKeys();
                break;
            case 'de':
                rightGuessString = WORDS_DE[Math.floor(Math.random() * WORDS_DE.length)]
                WORDS = WORDS_DE
                Language = 'de';
                addDEkeys();
                break;
        }
    });

    $('#hard-mode').click(function() {
        if (HardMode == false) {
            this.style.backgroundColor = '#F73D4B';
            HardMode = true;
        } else {
            this.style.backgroundColor = '#C50E1F';
            HardMode = false;
        }
    });
});

function addDEkeys() {
    document.querySelectorAll('.de-button').forEach(e => e.removeAttribute("hidden"));    
}

function removeDEKeys() {
    document.querySelectorAll('.de-button').forEach(e => e.setAttribute("hidden", ""));    
}

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!")
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }

    // Hard Mode check
    if (HardMode) {
        for (let i = 0; i < 5; i++) {
            let letter = currentGuess[i]
            if (hardModeCorrectGuesses[i] != '' && hardModeCorrectGuesses[i] != letter){
                toastr.error("Hard Mode: Invalid Guess, must use previously guesses Letters!")
                return
            }
        }
        for (let i = 0; i < hardModeHints.length; i++) {
            if (!currentGuess.includes(hardModeHints[i])) {
                toastr.error("Hard Mode: Invalid Guess, must use previously guesses Hints!")
                return
            }
        }

    }
    hardModeHints = [];
    

    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green'
                hardModeCorrectGuesses[i] = letter;
            } else {
                // shade box yellow
                letterColor = 'yellow'
                hardModeHints.push(letter);
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = null;
    if (Language == 'en') {
        found = pressedKey.match(/[a-z]/gi);  

    } else if (Language == 'de') {
        found = pressedKey.match(/[a-z]/gi); 
        if (!found) {
            found = 'äöüß'.includes(pressedKey);
        } 

    } else {
        found == none;
    }

    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

initBoard();