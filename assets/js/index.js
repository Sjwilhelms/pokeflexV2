const gameIntro = document.getElementById("gameIntro");
const gameContainer = document.getElementById("gameContainer");
const timeDisplay = document.getElementById("timeDisplay");
const scoreboard = document.getElementById("scoreboard");
const usedIndex = [];
const wrongAnswers = [];
const spriteDisplay = document.getElementById("pokemonSprite");
let playing = false;
let score = 0;
let timeLeft = 60;
let timerInterval;

const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
  button.addEventListener('touchstart', function() {
    this.classList.add('touch-active');
  });
  
  button.addEventListener('touchend', function() {
    this.classList.remove('touch-active');
  });
});

fetchWrong()

/** start the game, close the introduction and fetch a pokemon */
function start() {
    // get the pokemon data when the game starts
    fetchData();
    startTimer();
    playing = true;
    score = 0;
    scoreboard.textContent = `You've guessed correctly ${score} times`;
    timeLeft = 60;
    gameIntro.classList.add("hide");
    gameContainer.classList.remove("hide");
    
}
/** timer function */
function startTimer() {
    timeDisplay.textContent = `You've got ${timeLeft} seconds left!`;
    timeDisplay.style.display = "block"
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = `You've got ${timeLeft} seconds left!`;
        if (timeLeft <= 0) {
            end();
        }
    }, 1000)
}
/** end the game and publish the results */
function end() {
    playing = false;
    clearInterval(timerInterval);
    gameContainer.classList.add("hide");
    gameIntro.classList.remove("hide");
    if (score >= 20) {
        gameIntro.innerHTML = `
        <h3>Well done!</h3>
        <p id="analysis">You got ${score} pokemon correct in 60 seconds</p>
        <p><a href="https://github.com/Sjwilhelms" target="_blank">Find me on Github</a></p>
        <p id="reward"><a href="https://www.youtube.com/watch?v=xMk8wuw7nek" target="_blank">You've earned a poke-reward...</a></p>
        <button id="playAgain" class="btn" onclick="start()">Let's Go Again!</button>
        
    `}
    else {
        gameIntro.innerHTML = `
        <h3>That's too bad!</h3>
        <p id="analysis">You got ${score} pokemon correct in 60 seconds</p>
        <p><a href="https://github.com/Sjwilhelms" target="_blank">Find me on Github</a></p>
        <p id="reward">No poke-reward for you this time...</p>
        <button id="playAgain" class="btn" onclick="start()">Let's Go Again!</button>
    `}
}
async function fetchWrong() {
    try {
        // APi call to fetch 150 pokemon for wrong answers
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=150&offset=0`);
        // check if the response is ok
        if (!response.ok) {
            throw new Error("Failed to fetch wrong answers");
        }
        // parse response data
        const data = await response.json();
        // populate global wrongAnswers array
        wrongAnswers.push(...data.results);
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchData() {
    try {
        // use a random number to select the pokemon
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * 150) + 1;
        }
        while (usedIndex.includes(randomIndex));
        usedIndex.push(randomIndex);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomIndex}`);
        // get the data
        if (!response.ok) {
            throw new Error("Pokemon failed to load");
        }
        // parse response data
        const correctData = await response.json();
        const pokemonSprite = correctData.sprites.front_default;
        pokemonName = correctData.name;
        console.log(pokemonName);

        // display the sprite
        const imgElement = document.getElementById("pokemonSprite");
        imgElement.src = pokemonSprite;
        imgElement.style.display = "block";

        // select three random incorrect answers
        const threeWrongAnswers = getThreeWrongAnswers(pokemonName);

        // combine pokemonName with threeWrongAnswers and shuffle
        const choices = shuffleArray([pokemonName, ...threeWrongAnswers]);

        // Map choices to buttons
        const buttons = document.querySelectorAll(".choiceButton");
        buttons.forEach((button, index) => {
            button.textContent = choices[index]; // Set button text
            button.dataset.correct = choices[index] === pokemonName; // Add a data attribute to indicate correctness

            // Add click event listener
            button.onclick = () => checkAnswer(button, pokemonName);
            
        });



    }
    // catch any errors
    catch (error) {
        console.error(error);
    }
}

function getThreeWrongAnswers(pokemonName) {
    const filteredWrongAnswers = wrongAnswers.filter(pokemon => pokemon.name !== pokemonName);
    const shuffled = shuffleArray(filteredWrongAnswers);
    return shuffled.slice(0, 3).map(pokemon => {
        return pokemon.name;
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function checkAnswer(button) {
    if (!playing) return; // Prevent interaction if the game is not active

    const isCorrect = button.dataset.correct === "true";
    if (isCorrect) {
        score++;
        resultBody.textContent = `The correct answer was ${pokemonName}`;
        scoreboard.textContent = `You've guessed correctly ${score} times`;
        resultBody.style.display = "block";
        scoreboard.style.display = "block";
    } else {
        resultBody.textContent = `The correct answer was ${pokemonName}`;
        scoreboard.textContent = `You've guessed correctly ${score} times`;
        resultBody.style.display = "block";
        scoreboard.style.display = "block";
    }

    // Load the next question
    
    fetchData();
}