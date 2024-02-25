const gameObject = document.getElementById("game");

const firstOptionShown = new CustomEvent("optionshown", {detail: {order: 1, }, });
const secondOptionShown = new CustomEvent("optionshown", {detail: {order: 2, }, });
const thirdOptionShown = new CustomEvent("optionshown", {detail: {order: 3, }, });

const optionChecked = new CustomEvent("optionchecked");

const incrementQuestion = new CustomEvent("incrementquestion");
const nextQuestion = new CustomEvent("nextquestion");

const endGame = new CustomEvent("endgame");

let questions;
let currentQuestion = 0;
let correctAnswer;
let score = 0;

let firstOptionCompleted = false;
let secondOptionCompleted = false;
let thirdOptionCompleted = false;

function closeDialog(){
    document.getElementById("option-information-dialog").close();
    document.querySelector(".showcase-option").classList.remove("starting-position");
    document.querySelector(".showcase-option").classList.remove("showcase-option");
    if (!firstOptionCompleted){
        firstOptionCompleted = true;
        gameObject.dispatchEvent(firstOptionShown);
    } else if (!secondOptionCompleted){
        secondOptionCompleted = true;
        gameObject.dispatchEvent(secondOptionShown);
    } else if (!thirdOptionCompleted){
        thirdOptionCompleted = true;
        gameObject.dispatchEvent(thirdOptionShown);
    } else {
        console.log("normal game");
    }
}

function closeAnswerDialog(){
    document.getElementById("answer-dialog").close();
}

function gameStart() {
    document.getElementById("start-screen").style = "display: none;";
    document.getElementById("game").style="display: flex;"
}

function showDialog(optionValue){
    sectionName = "option-"+ optionValue + "-section";
    setTimeout(() => document.getElementById(sectionName).querySelector("label").classList.add("showcase-option"), 500);
    setTimeout(() => document.getElementById("option-information-dialog").showModal(), 2000);
}

function roundStart(){
    document.querySelectorAll("label").forEach((label) => {label.classList.add("starting-position")});
    correctAnswer = questions[currentQuestion]["correct-answer"];
    questions[currentQuestion].options.forEach((opt) => {document.getElementById("option-"+ opt.value + "-section").querySelector("label").querySelector(".opt-text").textContent = opt.label; document.getElementById("option-"+ opt.value + "-section").querySelector("label").setAttribute("data-option", opt.option)});
    showDialog(1);
}

function toggleCheck(){
    document.getElementById("answer-button").dispatchEvent(optionChecked);
}

function checkAnswer(){
    let checkedValue = 0;
    document.querySelectorAll("input[name='quiz']").forEach((opt) => {if (opt.checked) {
        checkedValue = opt.value;
    }});

    if (checkedValue == correctAnswer){
        ++score;
        document.getElementById("answer-dialog").querySelector("h2").textContent = "Correct!";
        document.getElementById("answer-dialog").querySelector("p").textContent = "Current score: " + score;
    } else {
        document.getElementById("answer-dialog").querySelector("h2").textContent = "Incorrect!"
        document.getElementById("answer-dialog").querySelector("p").textContent = "The correct answer was " + correctAnswer + "!\n Current score: " + score;
    }

    document.getElementById("game").dispatchEvent(incrementQuestion);

    document.getElementById("answer-dialog").showModal();
}

async function getQuestions(){
    let response = await fetch("./questions.json", {method: "GET", headers: {"Content-Type": "application/json"}, mode: "cors",});
    questions = await response.json();
}

function handleIncrementQuestion() {
    ++currentQuestion;
    if(currentQuestion == questions.length){
        //put in the state to end the game
        document.getElementById("answer-button").textContent = "End";
        document.getElementById("answer-button").setAttribute("onclick", "handleGameEnd()");
    } else {
        //put it in the state to go to the next question when the button is pushed
        document.getElementById("answer-button").textContent = "Next";
        document.getElementById("answer-button").setAttribute("onclick", "handleNextQuestion()");
    }
}

function handleNextQuestion(){
    gameObject.dispatchEvent(nextQuestion);
}

function generalReset(){
    document.getElementById("answer-button").textContent = "Choose Answer";
    document.getElementById("answer-button").setAttribute("onclick", "checkAnswer()");
    document.getElementById("answer-button").toggleAttribute("disabled");
    document.querySelectorAll("input[type='radio']").forEach((opt) => {opt.checked = false});

    firstOptionCompleted = false;
    secondOptionCompleted = false;
    thirdOptionCompleted = false;
}

function gotoNextQuestion(){
    roundStart();

    generalReset();
}

function handleGameEnd(){
    gameObject.dispatchEvent(endGame);
}

function gameEnd(){
    document.getElementById("start-screen").style = "display: flex;";
    gameObject.style="display: none;";

    generalReset();
    currentQuestion = 0;
}

async function gameLoop(){
    gameStart();
    gameObject.addEventListener("optionshown", (e) => {if (e.detail.order == 1){setTimeout(showDialog(2), 500);} else if (e.detail.order == 2){setTimeout(showDialog(3), 500);} else {/*show the buttons for showing the dialog again*/console.log("hello");}});
    gameObject.addEventListener("incrementquestion", (e) => {handleIncrementQuestion()});
    gameObject.addEventListener("nextquestion", (e) => {gotoNextQuestion()})
    gameObject.addEventListener("endgame", (e)=> {gameEnd()});
    /* 
        Must use () [arrow functions] OR function name plain - because otherwise it invokes the function
    */
    getQuestions().then(() => roundStart());

    document.getElementById("answer-button").addEventListener("optionchecked", (e)=>{e.target.removeAttribute("disabled");});
}