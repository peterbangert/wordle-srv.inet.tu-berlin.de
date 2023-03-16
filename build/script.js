import { WORDS_EN } from "./words_en.js";
import { WORDS_DE } from "./words_de.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let Language = 'en';
let HardMode = false;
let WORDS = WORDS_EN;
let WORD = 'hello';
let hardModeCorrectGuesses = ['','','','','']; 
let hardModeHints = []; 
let lossCondition = 'Loss'
let winCondition = 'Win'
let guessCondition = 'Guess'
let timeoutCondition = 'Timeout'
let resignCondition = 'Resign'
let easyModeTimeLimit = 60 * 5
let hardModeTimeLimit = 60 * 3
let timeLimit = easyModeTimeLimit
let GameStarted = false
let refreshIntervalId = ''
let confidenceLevel = 5

let user_name = ''
let user_id = ''




$(document).ready(function () {

    initBoard()
    
    $('.l8n-button').click(function () {

        const l8n_dropdown = document.getElementById('l8n');
        for (let i = 0; i < l8n_dropdown.children.length; i++) {
            l8n_dropdown.children[i].style.backgroundColor = "white";
        }

        this.style.backgroundColor = "gray";

        switch (this.id) {
            case 'en':
                Language = 'en';
                WORDS = WORDS_EN
                removeDEKeys();
                break;
            case 'de':
                Language = 'de';
                WORDS = WORDS_DE
                addDEkeys();
                break;
        }

    });

    $('#hard-mode').click(function() {
        if (GameStarted) {
            toastr.error("Game mode cannot be changed mid-game");
        } else {

            if (HardMode == false) {
                this.style.backgroundColor = '#F73D4B';
                HardMode = true;
                var display = document.querySelector('#time');
                timeLimit = hardModeTimeLimit
                var display = document.querySelector('#time');
                display.textContent = "03:00"
            } else {
                this.style.backgroundColor = '#C50E1F';
                HardMode = false;
                var display = document.querySelector('#time');
                timeLimit = easyModeTimeLimit
                var display = document.querySelector('#time');
                display.textContent = "05:00"
            }
        }
    });

    $('#start-game').click(function() {



        startGame();
    });

    $('#resign-game').click(function() {

        submit("", guessesRemaining, resignCondition)
        endGame()
        
    });
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


    $('#user-info-submit').click(function() {

        closeForm();
        
    });

    $('#confidence-level-submit').click(function() {
        confidenceLevel = document.getElementById("confidenceLevelSlider").value
        $('#confidenceLevelForm').hide();
        checkGuess();
        
        
    });

    $('#confidenceLevelForm').hide();

});

function getWord() {

    $.ajax({
        type: "GET",
        url: "/api/v1/word",
        data: {
            "language": Language
        },
        success: function (result) {
            WORD = result
            console.log("Success, word is ", result)
        },
        error: function (result) {
            console.log(result);
        }
    });
    WORD = WORD
}

function submit(guess, guessesRemaining, condition){


    $.ajax({
        type: "POST",
        url: "/api/v1/submit",
        data: {
            "name": user_name,
            "id": user_id,
            "condition": condition,
            "word": WORD,
            "guesses_remaining": guessesRemaining,
            "guess": guess,
            "hard_mode": HardMode,
            "confidence_level": confidenceLevel 
        },
        success: function (result) {
            
            console.log("Submission succesful: ", result)
        },
        error: function (result) {
            console.log(result);
        }
    });

}
function openForm() {

    var form = document.getElementById("myForm");
    form.style.display = "block";
    form.style.bottom = (window.innerHeight/2 - form.offsetHeight/2).toString() + "px";
    form.style.right = (window.innerWidth/2 - form.offsetWidth/2).toString() + "px"; 
  }
  
function closeForm() {
    
    user_id = document.getElementById("user_id").value
    user_name = document.getElementById("user_name").value

    if ( isNaN(parseInt(user_id, 10))){
        toastr.error("ID must be numeric value, please reload page and try again");   
        return;
    }
    document.getElementById("myForm").style.display = "none";
}

function getConfidenceScore() { 

    $('#confidenceLevelForm').show()
    var form = document.getElementById("confidenceLevelForm");
    form.style.bottom = (window.innerHeight/2 - form.offsetHeight/2).toString() + "px";
    form.style.right = (window.innerWidth/2 - form.offsetWidth/2).toString() + "px"; 
    
    var slider = document.getElementById("confidenceLevelSlider");
    var output = document.getElementById("confidenceLevelSliderValue");
    output.innerHTML = slider.value;

    slider.oninput = function() {
    output.innerHTML = this.value;
    }

}


function startGame() {
    
    getWord();
    clearBoard();
    initBoard();
    GameStarted = true;
    var display = document.querySelector('#time');
    if (HardMode) {
        display.textContent = "03:00"
    } else {
        display.textContent = "05:00"
    }
    
    startTimer(timeLimit, display);
    document.querySelector('#start-game').setAttribute("hidden", "");    
    document.querySelector('#resign-game').removeAttribute("hidden");    
  
}

function endGame() {

    GameStarted = false;
    clearInterval(refreshIntervalId);
    document.querySelector('#start-game').removeAttribute("hidden");    
    document.querySelector('#resign-game').setAttribute("hidden", "");    

}

function clearBoard() {

    nextLetter = 0
    guessesRemaining = NUMBER_OF_GUESSES;
    currentGuess = [];
    hardModeCorrectGuesses = ['','','','','']; 
    hardModeHints = []; 
    nextLetter = 0;
    const board = document.getElementById("game-board");
    //document.querySelectorAll('.keyboard-button').forEach(e => e.style.backgroundColor = "buttonface");    
    $('.keyboard-button').css( 'all', 'revert');
    $('.keyboard-button').removeAttr("style");
    board.innerHTML = '';
}

function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    refreshIntervalId = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
            submit(guess, guessesRemaining, timeoutCondition)
            toastr.error("Time Ran out! Restarting")
            endGame()
        }
    }, 1000);
}



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
    let rightGuess = Array.from(WORD)

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

    if (guessString === WORD) {
        toastr.success("You guessed right! Game over!")
        submit(winCondition)
        guessesRemaining = 0
        endGame();
        return
    } else {
        guessesRemaining -= 1;

        if (guessesRemaining === 0) {
            submit(currentGuess, guessesRemaining, lossCondition)
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${WORD}"`)
            endGame();
        } else {
            submit(currentGuess, guessesRemaining, guessCondition)
        }
        
        currentGuess = [];
        nextLetter = 0;


    }
}

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }

    if ($('#user_id').is(':focus') ||  $('#user_name').is(':focus')) {
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
        if ($('#user_id').is(':focus') ||  $('#user_name').is(':focus')) {
            return
        }
        deleteLetter()
        return
    }

    if (pressedKey === "Submit" ||  pressedKey === "Enter") {
        if (!GameStarted) { 
            toastr.error("Please Start Game first")
            return
        }
        getConfidenceScore()
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




openForm()