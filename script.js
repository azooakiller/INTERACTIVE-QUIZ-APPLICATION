/*
  ================================================
  SCRIPT.JS — JS MASTERY QUIZ
  ================================================
  This file controls how everything WORKS.
  Think of it like the "brain" of our quiz.

  HOW THE QUIZ FLOWS:
  1. User sees difficulty screen → picks Easy/Medium/Hard
  2. startQuiz()  → filters & shuffles questions
  3. showQuestion() → displays one question + 4 answers
  4. User clicks an answer → selectAnswer() runs
  5. "Next" button → moves to next question
  6. After all questions → showScore() shows results
  ================================================
*/


/* ─────────────────────────────────────────────────
   STEP 1: THE QUESTION BANK
   All 20 questions are stored here as an array
   of objects. Each object has:
     q          → the question text
     answers    → 4 choices
     correct    → index (0-3) of the right answer
     difficulty → "easy", "medium", or "hard"
───────────────────────────────────────────────── */
const ALL_QUESTIONS = [
    {
        q: "What is the correct syntax to output 'Hello World' in JavaScript?",
        answers: ["print('Hello World')", "console.log('Hello World')", "echo 'Hello World'", "response.write('Hello World')"],
        correct: 1,          // "console.log" is at index 1
        difficulty: "easy"
    },
    {
        q: "Which keyword declares a variable that cannot be reassigned?",
        answers: ["var", "let", "const", "static"],
        correct: 2,          // "const" is at index 2
        difficulty: "easy"
    },
    {
        q: "What does DOM stand for?",
        answers: ["Document Object Model", "Data Object Mode", "Digital Ordinance Model", "Desktop Orientation Module"],
        correct: 0,
        difficulty: "easy"
    },
    {
        q: "Which array method creates a new array by running a function on each element?",
        answers: ["forEach()", "filter()", "map()", "reduce()"],
        correct: 2,
        difficulty: "easy"
    },
    {
        q: "What is the output of: 2 + '2' in JavaScript?",
        answers: ["4", "22", "NaN", "Error"],
        correct: 1,          // 2 + '2' = "22" because JS converts 2 to a string
        difficulty: "medium"
    },
    {
        q: "Which symbol starts a single-line comment in JavaScript?",
        answers: ["//", ",", "#", "**"],
        correct: 0,
        difficulty: "easy"
    },
    {
        q: "How do you check if two values are equal in BOTH value AND type?",
        answers: ["==", "=", "===", "!="],
        correct: 2,          // === is "strict equality"
        difficulty: "easy"
    },
    {
        q: "Which event fires when the user clicks an HTML element?",
        answers: ["onchange", "onmouseclick", "onmouseover", "onclick"],
        correct: 3,
        difficulty: "easy"
    },
    {
        q: "What does 'NaN' stand for?",
        answers: ["Not a Null", "Not a Number", "New and Native", "None of Above"],
        correct: 1,
        difficulty: "easy"
    },
    {
        q: "Which function converts a string like '42' into the number 42?",
        answers: ["Integer.parse()", "parseInt()", "parseInteger()", "toInt()"],
        correct: 1,
        difficulty: "easy"
    },
    {
        q: "What is a closure in JavaScript?",
        answers: [
            "A loop that closes automatically",
            "A function that remembers variables from its outer scope",
            "A way to end a function",
            "A CSS block scope"
        ],
        correct: 1,
        difficulty: "hard"
    },
    {
        q: "Which array method removes the LAST element and returns it?",
        answers: ["shift()", "splice()", "pop()", "delete()"],
        correct: 2,
        difficulty: "medium"
    },
    {
        q: "What does typeof null return in JavaScript?",
        answers: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correct: 2,          // This is a famous JS bug — null returns 'object'
        difficulty: "hard"
    },
    {
        q: "Which of these is NOT a JavaScript data type?",
        answers: ["Symbol", "BigInt", "Float", "Undefined"],
        correct: 2,          // JS has Number, not Float
        difficulty: "medium"
    },
    {
        q: "What does Array.prototype.reduce() do?",
        answers: [
            "Removes elements from the array",
            "Filters elements from the array",
            "Combines all elements into one single value",
            "Sorts the array"
        ],
        correct: 2,
        difficulty: "hard"
    },
    {
        q: "What does 'use strict' do in JavaScript?",
        answers: [
            "Enables strict CSS rules",
            "Catches common coding mistakes and throws errors",
            "Locks variable types",
            "Disables console.log"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        q: "Which method converts a JSON string into a JavaScript object?",
        answers: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"],
        correct: 0,
        difficulty: "medium"
    },
    {
        q: "What is the main difference between '==' and '===' in JavaScript?",
        answers: [
            "No difference at all",
            "'==' checks type too, '===' does not",
            "'===' checks both value AND type; '==' only checks value",
            "'==' is faster than '==='"
        ],
        correct: 2,
        difficulty: "medium"
    },
    {
        q: "Which keywords handle errors in JavaScript?",
        answers: ["catch", "try", "finally", "All of the above"],
        correct: 3,
        difficulty: "medium"
    },
    {
        q: "What is event bubbling?",
        answers: [
            "An event travels from the child element up to parent elements",
            "An event travels from parent down to child elements",
            "A type of memory leak",
            "A CSS animation effect"
        ],
        correct: 0,
        difficulty: "hard"
    }
];


/* ─────────────────────────────────────────────────
   STEP 2: GRAB HTML ELEMENTS
   We find each important HTML element once and save
   it in a variable so we don't have to search for it
   every single time we need it.
───────────────────────────────────────────────── */
const questionElement     = document.getElementById("question-text");
const answerButtons       = document.getElementById("answer-buttons");
const nextButton          = document.getElementById("next-btn");
const scoreElement        = document.getElementById("score");
const totalQuestionsEl    = document.getElementById("total-questions");
const quizBox             = document.getElementById("quiz-box");
const resultBox           = document.getElementById("result-box");
const progressBar         = document.getElementById("progress-bar");
const questionCountText   = document.getElementById("question-count");
const difficultyScreen    = document.getElementById("difficulty-screen");
const timerText           = document.getElementById("timer-text");
const timerCircle         = document.getElementById("timer-circle");
const timeoutMsg          = document.getElementById("timeout-msg");
const resultMessage       = document.getElementById("result-message");


/* ─────────────────────────────────────────────────
   STEP 3: GAME STATE VARIABLES
   These variables remember what's happening right now.
   They change as the player goes through the quiz.
───────────────────────────────────────────────── */
let questions            = [];    // the filtered + shuffled list for this round
let currentQuestionIndex = 0;    // which question we're on (0 = first)
let score                = 0;    // how many correct answers so far
let timerInterval        = null; // stores the timer so we can stop it
let timeLeft             = 30;   // seconds remaining for the current question
const TIMER_SECONDS      = 30;   // constant: each question gets 30 seconds


/* ─────────────────────────────────────────────────
   HELPER: shuffle an array into random order
   Uses the Fisher-Yates algorithm — a classic method.
   Example: [1,2,3,4] might become [3,1,4,2]
───────────────────────────────────────────────── */
function shuffle(array) {
    // Go through the array from the end to the start
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 up to i
        const randomIndex = Math.floor(Math.random() * (i + 1));
        // Swap the current item with the random item
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
}


/* ─────────────────────────────────────────────────
   STEP 4: START QUIZ
   Called when the user picks a difficulty (Easy/Medium/Hard).
   Filters questions, shuffles them, then shows the first one.
───────────────────────────────────────────────── */
function startQuiz(difficulty) {

    // --- Filter: which difficulties are allowed? ---
    // Easy   → only easy questions
    // Medium → easy + medium questions
    // Hard   → all questions (easy + medium + hard)
    const allowed = {
        easy:   ["easy"],
        medium: ["easy", "medium"],
        hard:   ["easy", "medium", "hard"]
    };

    // Keep only questions whose difficulty is in the allowed list
    let filtered = ALL_QUESTIONS.filter(function(q) {
        return allowed[difficulty].includes(q.difficulty);
    });

    // Shuffle the filtered list, then take the first 10
    questions = shuffle(filtered).slice(0, 10);

    // Reset scores and index back to the start
    currentQuestionIndex = 0;
    score = 0;

    // Hide the difficulty screen, show the quiz
    difficultyScreen.style.display = "none";
    quizBox.style.display = "block";
    resultBox.style.display = "none";

    // Set the Next button label
    nextButton.innerHTML = "Next &#8594;";

    // Show the first question
    showQuestion();
}


/* ─────────────────────────────────────────────────
   STEP 5: SHOW A QUESTION
   Displays the current question and its 4 answer buttons.
   Also resets and starts the 30-second timer.
───────────────────────────────────────────────── */
function showQuestion() {

    // Clean up whatever was on screen before
    resetState();

    // Get the current question object from our array
    let currentQuestion = questions[currentQuestionIndex];

    // Human-readable question number (index 0 → "Question 1")
    let questionNumber = currentQuestionIndex + 1;

    // --- Update the question text ---
    questionElement.innerHTML = currentQuestion.q;

    // --- Update "X of 10 Questions" counter ---
    questionCountText.innerHTML = `${questionNumber} of ${questions.length} Questions`;

    // --- Update progress bar width ---
    // Example: question 3 of 10 → 30% wide
    let progressPercent = (questionNumber / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // --- Build the answer buttons ---
    // First, shuffle this question's answers so they appear in random order
    let shuffledAnswers = shuffle([...currentQuestion.answers.map(function(text, index) {
        return { text: text, isCorrect: index === currentQuestion.correct };
    })]);

    // Create one button for each answer
    shuffledAnswers.forEach(function(answer) {
        const button = document.createElement("button"); // make a <button>
        button.innerHTML = answer.text;                  // put the answer text inside
        button.classList.add("btn");                     // apply the .btn CSS style

        // Store whether this is the correct answer (hidden from the user)
        if (answer.isCorrect) {
            button.dataset.correct = "true";
        }

        // When clicked, run selectAnswer()
        button.addEventListener("click", selectAnswer);

        // Add the button to the page
        answerButtons.appendChild(button);
    });

    // --- Start the 30-second countdown timer ---
    startTimer();
}


/* ─────────────────────────────────────────────────
   HELPER: Reset State
   Clears the old question's answer buttons and hides
   the Next button so we start fresh for each question.
───────────────────────────────────────────────── */
function resetState() {
    // Hide the Next button (it will reappear after an answer is chosen)
    nextButton.style.display = "none";

    // Clear the "time's up" message
    timeoutMsg.innerHTML = "";

    // Remove the red "danger" class from the timer
    timerCircle.classList.remove("danger");

    // Delete all old answer buttons from the page
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}


/* ─────────────────────────────────────────────────
   STEP 6: TIMER
   Counts down from 30 to 0.
   If time runs out → shows correct answer automatically.
───────────────────────────────────────────────── */
function startTimer() {
    // Stop any timer that might still be running from before
    clearInterval(timerInterval);

    // Reset the seconds back to 30
    timeLeft = TIMER_SECONDS;
    timerText.innerHTML = timeLeft;

    // setInterval runs the function inside every 1000ms (1 second)
    timerInterval = setInterval(function() {
        timeLeft--;                           // subtract 1 second
        timerText.innerHTML = timeLeft;       // update the display

        // When 10 seconds remain, turn the timer red (warning!)
        if (timeLeft <= 10) {
            timerCircle.classList.add("danger");
        }

        // When time hits 0, handle the timeout
        if (timeLeft <= 0) {
            clearInterval(timerInterval);     // stop the timer
            handleTimeout();
        }
    }, 1000); // runs every 1 second
}


/* ─────────────────────────────────────────────────
   HELPER: Handle Timeout
   Called when the 30 seconds run out.
   Highlights the correct answer and shows "Time's up!"
───────────────────────────────────────────────── */
function handleTimeout() {
    // Show the correct answer by highlighting it green
    Array.from(answerButtons.children).forEach(function(button) {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;  // disable all buttons so user can't click
    });

    // Show the timeout message
    timeoutMsg.innerHTML = "⏰ Time's up!";

    // Show the Next button so the player can continue
    nextButton.style.display = "block";
}


/* ─────────────────────────────────────────────────
   STEP 7: HANDLE AN ANSWER CLICK
   Called when the user clicks one of the 4 answer buttons.
   - Stops the timer
   - Marks the clicked button green (correct) or red (wrong)
   - Shows the correct answer if the user was wrong
   - Reveals the Next button
───────────────────────────────────────────────── */
function selectAnswer(e) {
    // Stop the countdown — the user already answered
    clearInterval(timerInterval);

    const clickedButton = e.target;  // the button that was clicked

    // Check if this is the correct answer
    const isCorrect = clickedButton.dataset.correct === "true";

    if (isCorrect) {
        clickedButton.classList.add("correct"); // green
        score++;                                // add a point
    } else {
        clickedButton.classList.add("incorrect"); // red
    }

    // After answering, show ALL buttons' states:
    //   - correct answer → green
    //   - other buttons  → disabled (can't click again)
    Array.from(answerButtons.children).forEach(function(button) {
        if (button.dataset.correct === "true") {
            button.classList.add("correct"); // always highlight the right answer
        }
        button.disabled = true; // lock all buttons
    });

    // Show the Next button so the player can move on
    nextButton.style.display = "block";
}


/* ─────────────────────────────────────────────────
   STEP 8: NEXT BUTTON CLICK
   When the player clicks "Next →":
   - Move to the next question, OR
   - Show the final score if this was the last question
───────────────────────────────────────────────── */
nextButton.addEventListener("click", function() {
    currentQuestionIndex++; // move forward by one question

    if (currentQuestionIndex < questions.length) {
        // There are more questions left — show the next one
        showQuestion();
    } else {
        // We've finished all questions — show the score
        showScore();
    }
});


/* ─────────────────────────────────────────────────
   STEP 9: SHOW FINAL SCORE
   Hides the quiz, shows the result screen,
   and displays a message based on how well they did.
───────────────────────────────────────────────── */
function showScore() {
    // Stop any running timer
    clearInterval(timerInterval);

    // Hide the quiz, show the result box
    quizBox.style.display = "none";
    resultBox.style.display = "block";

    // Fill in the score numbers
    scoreElement.innerHTML = score;
    totalQuestionsEl.innerHTML = questions.length;

    // Calculate percentage and pick a motivational message
    let percentage = (score / questions.length) * 100;

    if (percentage >= 80) {
        resultMessage.innerHTML = "🌟 Excellent work! You're a JS pro!";
    } else if (percentage >= 50) {
        resultMessage.innerHTML = "👍 Good effort! Keep practising!";
    } else {
        resultMessage.innerHTML = "📚 Don't give up — review the basics!";
    }
}
