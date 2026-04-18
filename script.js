/*
  ================================================
  SCRIPT.JS — JS MASTERY QUIZ
  ================================================
  This file controls how everything WORKS.
  Think of it like the "brain" of our quiz.

  HOW THE QUIZ FLOWS (step by step):
  1. Page loads → startQuiz() runs automatically
  2. startQuiz()   → shuffles questions, shows first one
  3. showQuestion() → displays the question + 4 answers + timer
  4. User clicks an answer → selectAnswer() runs
  5. User clicks "Next" → next question or final score
  6. showScore()   → shows result screen at the end
  ================================================
*/


/* ─────────────────────────────────────────────────
   STEP 1: THE QUESTION BANK
   All questions are stored here as an array of objects.
   Each object has:
     q       → the question text
     answers → 4 possible choices (as an array)
     correct → the INDEX of the right answer (0, 1, 2, or 3)
───────────────────────────────────────────────── */
const ALL_QUESTIONS = [
    {
        q: "What is the correct syntax to output 'Hello World' in JavaScript?",
        answers: ["print('Hello World')", "console.log('Hello World')", "echo 'Hello World'", "response.write('Hello World')"],
        correct: 1   // "console.log" is at position 1 (counting from 0)
    },
    {
        q: "Which keyword declares a variable that cannot be reassigned?",
        answers: ["var", "let", "const", "static"],
        correct: 2   // "const" is at position 2
    },
    {
        q: "What does DOM stand for?",
        answers: ["Document Object Model", "Data Object Mode", "Digital Ordinance Model", "Desktop Orientation Module"],
        correct: 0
    },
    {
        q: "Which array method creates a new array by running a function on each element?",
        answers: ["forEach()", "filter()", "map()", "reduce()"],
        correct: 2
    },
    {
        q: "What is the output of: 2 + '2' in JavaScript?",
        answers: ["4", "22", "NaN", "Error"],
        correct: 1   // JS turns the number 2 into a string and joins them: "22"
    },
    {
        q: "Which symbol starts a single-line comment in JavaScript?",
        answers: ["//", ",", "#", "**"],
        correct: 0
    },
    {
        q: "How do you check if two values are equal in BOTH value AND type?",
        answers: ["==", "=", "===", "!="],
        correct: 2   // === is called "strict equality"
    },
    {
        q: "Which event fires when the user clicks an HTML element?",
        answers: ["onchange", "onmouseclick", "onmouseover", "onclick"],
        correct: 3
    },
    {
        q: "What does 'NaN' stand for?",
        answers: ["Not a Null", "Not a Number", "New and Native", "None of Above"],
        correct: 1
    },
    {
        q: "Which function converts a string like '42' into the number 42?",
        answers: ["Integer.parse()", "parseInt()", "parseInteger()", "toInt()"],
        correct: 1
    },
    {
        q: "Which array method removes the LAST element and returns it?",
        answers: ["shift()", "splice()", "pop()", "delete()"],
        correct: 2
    },
    {
        q: "What does typeof null return in JavaScript?",
        answers: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correct: 2   // Famous JS quirk — null wrongly returns 'object'
    },
    {
        q: "Which of these is NOT a JavaScript data type?",
        answers: ["Symbol", "BigInt", "Float", "Undefined"],
        correct: 2   // JS uses "Number", not "Float"
    },
    {
        q: "What does 'use strict' do in JavaScript?",
        answers: [
            "Enables strict CSS rules",
            "Catches common coding mistakes and throws errors",
            "Locks variable types",
            "Disables console.log"
        ],
        correct: 1
    },
    {
        q: "Which method converts a JSON string into a JavaScript object?",
        answers: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"],
        correct: 0
    },
    {
        q: "What is the main difference between '==' and '===' in JavaScript?",
        answers: [
            "No difference at all",
            "'==' checks type too, '===' does not",
            "'===' checks both value AND type; '==' only checks value",
            "'==' is faster than '==='"
        ],
        correct: 2
    },
    {
        q: "Which keywords handle errors in JavaScript?",
        answers: ["catch", "try", "finally", "All of the above"],
        correct: 3
    },
    {
        q: "What is event bubbling?",
        answers: [
            "An event travels from the child element up to parent elements",
            "An event travels from parent down to child elements",
            "A type of memory leak",
            "A CSS animation effect"
        ],
        correct: 0
    },
    {
        q: "What does Array.prototype.reduce() do?",
        answers: [
            "Removes elements from the array",
            "Filters elements from the array",
            "Combines all elements into one single value",
            "Sorts the array"
        ],
        correct: 2
    },
    {
        q: "What is a closure in JavaScript?",
        answers: [
            "A loop that closes automatically",
            "A function that remembers variables from its outer scope",
            "A way to end a function",
            "A CSS block scope"
        ],
        correct: 1
    }
];


/* ─────────────────────────────────────────────────
   STEP 2: GRAB HTML ELEMENTS
   We find each HTML element once and save it in a
   variable. This is faster than searching every time.
───────────────────────────────────────────────── */
const questionElement   = document.getElementById("question-text");
const answerButtons     = document.getElementById("answer-buttons");
const nextButton        = document.getElementById("next-btn");
const scoreElement      = document.getElementById("score");
const totalQuestionsEl  = document.getElementById("total-questions");
const quizBox           = document.getElementById("quiz-box");
const resultBox         = document.getElementById("result-box");
const progressBar       = document.getElementById("progress-bar");
const questionCountText = document.getElementById("question-count");
const timerText         = document.getElementById("timer-text");
const timerCircle       = document.getElementById("timer-circle");
const timeoutMsg        = document.getElementById("timeout-msg");
const resultMessage     = document.getElementById("result-message");


/* ─────────────────────────────────────────────────
   STEP 3: GAME STATE VARIABLES
   These remember what is happening right now.
   They update as the player goes through the quiz.
───────────────────────────────────────────────── */
let questions            = [];   // the shuffled list of questions for this round
let currentQuestionIndex = 0;   // which question we are on (0 = first)
let score                = 0;   // how many correct answers so far
let timerInterval        = null;// holds the timer so we can stop it later
let timeLeft             = 30;  // seconds left for the current question
const TIMER_SECONDS      = 30;  // each question gets 30 seconds (constant)


/* ─────────────────────────────────────────────────
   HELPER: shuffle()
   Puts an array into a random order.
   Uses the Fisher-Yates method — a simple classic.
   Example: [1, 2, 3, 4] might become [3, 1, 4, 2]
───────────────────────────────────────────────── */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Pick any random position from 0 up to i
        const randomIndex = Math.floor(Math.random() * (i + 1));
        // Swap the item at i with the item at randomIndex
        let temp = array[i];
        array[i] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array;
}


/* ─────────────────────────────────────────────────
   STEP 4: startQuiz()
   Runs once when the page loads.
   Shuffles ALL_QUESTIONS, picks the first 10,
   and shows the first question.
───────────────────────────────────────────────── */
function startQuiz() {
    // Reset score and question index back to zero
    currentQuestionIndex = 0;
    score = 0;

    // Copy ALL_QUESTIONS into a new array, shuffle it, then take 10
    questions = shuffle([...ALL_QUESTIONS]).slice(0, 10);

    // Make sure the quiz is visible and the result screen is hidden
    quizBox.style.display = "block";
    resultBox.style.display = "none";

    // Show the first question
    showQuestion();
}


/* ─────────────────────────────────────────────────
   STEP 5: showQuestion()
   Displays the current question and its 4 answer buttons.
   Also starts the 30-second timer.
───────────────────────────────────────────────── */
function showQuestion() {
    // Clear buttons and hide Next from the previous question
    resetState();

    // Get the current question object
    let currentQuestion = questions[currentQuestionIndex];

    // Question number for display (index 0 → "1")
    let questionNumber = currentQuestionIndex + 1;

    // Put the question text on the page
    questionElement.innerHTML = currentQuestion.q;

    // Update "1 of 10 Questions" text
    questionCountText.innerHTML = `${questionNumber} of ${questions.length} Questions`;

    // Update progress bar — e.g. question 3 of 10 = 30% width
    let progressPercent = (questionNumber / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Build shuffled answer objects: { text, isCorrect }
    let answerObjects = currentQuestion.answers.map(function(text, index) {
        return {
            text: text,
            isCorrect: index === currentQuestion.correct  // true or false
        };
    });
    let shuffledAnswers = shuffle(answerObjects);

    // Create one <button> for each answer and add it to the page
    shuffledAnswers.forEach(function(answer) {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");

        // Mark the correct answer with a hidden data attribute
        // data-correct="true" is invisible to the user
        if (answer.isCorrect) {
            button.dataset.correct = "true";
        }

        // When this button is clicked, run selectAnswer()
        button.addEventListener("click", selectAnswer);

        answerButtons.appendChild(button);
    });

    // Start the 30-second timer for this question
    startTimer();
}


/* ─────────────────────────────────────────────────
   HELPER: resetState()
   Cleans up between questions:
   - Hides the Next button
   - Clears "Time's up!" message
   - Removes the red danger style from timer
   - Deletes all old answer buttons
───────────────────────────────────────────────── */
function resetState() {
    nextButton.style.display = "none";
    timeoutMsg.innerHTML = "";
    timerCircle.classList.remove("danger");

    // Keep removing the first button until none are left
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}


/* ─────────────────────────────────────────────────
   STEP 6: startTimer()
   Counts down from 30 to 0, once per second.
   Turns red at 10 seconds. Auto-moves on at 0.
───────────────────────────────────────────────── */
function startTimer() {
    // Stop any old timer that might still be running
    clearInterval(timerInterval);

    // Reset seconds to 30
    timeLeft = TIMER_SECONDS;
    timerText.innerHTML = timeLeft;

    // setInterval calls the function below every 1000ms (1 second)
    timerInterval = setInterval(function() {
        timeLeft--;                         // remove 1 second
        timerText.innerHTML = timeLeft;     // update the number on screen

        // At 10 seconds, add the "danger" class → timer turns red
        if (timeLeft <= 10) {
            timerCircle.classList.add("danger");
        }

        // At 0 seconds, stop the timer and auto-reveal the answer
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}


/* ─────────────────────────────────────────────────
   HELPER: handleTimeout()
   Called when time runs out.
   Highlights the correct answer and shows "Time's up!"
───────────────────────────────────────────────── */
function handleTimeout() {
    // Go through every answer button
    Array.from(answerButtons.children).forEach(function(button) {
        if (button.dataset.correct === "true") {
            button.classList.add("correct"); // highlight right answer green
        }
        button.disabled = true;              // lock all buttons
    });

    timeoutMsg.innerHTML = "⏰ Time's up!";
    nextButton.style.display = "block";      // show Next so player can continue
}


/* ─────────────────────────────────────────────────
   STEP 7: selectAnswer()
   Runs when the user clicks one of the 4 answers.
   - Stops the timer
   - Colours the clicked button green or red
   - Always reveals the correct answer
   - Shows the Next button
───────────────────────────────────────────────── */
function selectAnswer(e) {
    clearInterval(timerInterval);       // stop the countdown

    const clickedButton = e.target;     // which button was clicked?
    const isCorrect = clickedButton.dataset.correct === "true";

    if (isCorrect) {
        clickedButton.classList.add("correct"); // green
        score++;                                 // earn a point
    } else {
        clickedButton.classList.add("incorrect"); // red
    }

    // Lock all buttons and highlight the correct one
    Array.from(answerButtons.children).forEach(function(button) {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    nextButton.style.display = "block"; // show Next button
}


/* ─────────────────────────────────────────────────
   STEP 8: Next Button Click
   Moves to the next question, or shows score at the end.
───────────────────────────────────────────────── */
nextButton.addEventListener("click", function() {
    currentQuestionIndex++;                          // go to next question

    if (currentQuestionIndex < questions.length) {
        showQuestion();                              // more questions left
    } else {
        showScore();                                 // all done!
    }
});


/* ─────────────────────────────────────────────────
   STEP 9: showScore()
   Hides the quiz and shows the final result screen.
   Picks a motivational message based on the score.
───────────────────────────────────────────────── */
function showScore() {
    clearInterval(timerInterval);

    quizBox.style.display = "none";
    resultBox.style.display = "block";

    scoreElement.innerHTML = score;
    totalQuestionsEl.innerHTML = questions.length;

    // Work out percentage and pick a message
    let percentage = (score / questions.length) * 100;

    if (percentage >= 80) {
        resultMessage.innerHTML = "🌟 Excellent! You're a JS pro!";
    } else if (percentage >= 50) {
        resultMessage.innerHTML = "👍 Good effort! Keep practising!";
    } else {
        resultMessage.innerHTML = "📚 Don't give up — review the basics!";
    }
}


/* ─────────────────────────────────────────────────
   START!
   This one line kicks everything off when the page loads.
───────────────────────────────────────────────── */
startQuiz();
