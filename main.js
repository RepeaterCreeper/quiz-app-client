/**
 * Will return a number between min and max.
 * 
 * @param {Number} min 
 * @param {Number} max
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) +
    min); //The maximum is exclusive and the minimum is inclusive
}

/**
 * Will randomize questions
 * 
 * @param {array of object} questions 
 */
function randomizeQuestion(questions) {
    let temporaryStorage = [];
    while (questions.length > 0) {
        let randomIndex = getRandomInt(0, questions.length - 1);
        temporaryStorage.push(questions[randomIndex]);
        questions.splice(randomIndex, 1);
    }
    
    return temporaryStorage;
}

/**
 * Checks the Quiz by looping through all radio buttons and comparing with questions object.
 * @param {array of object} questions 
 */
function checkQuiz(questions) {
    // Initialize variables
    let score = 0,
        confirmedContinue = false;

    // Loop through each question once.
    for (let question in questions) {
        let questionChoices = document.querySelector(`[name='question_${question}']`), // radio button
            hasSelected = document.querySelector(`[name='question_${question}']:checked`) === null ? false : true, // check if there is a radio button selected
            questionChoiceValue = null, // radio button value
            isCorrect = false;

        // Check if selected and add filler value, else take the value of the radio selected.
        if (!hasSelected) {
            if (!confirmedContinue) {
                if (confirm("Are you sure you want to submit?")) {
                    // Add bg-danger to parent of radio button's card-header.
                    questionChoices.closest(".card").querySelector(".card-header").classList.add("bg-danger");
                    questionChoiceValue = "no answer";
                    confirmedContinue = true;
                } else {
                    break;
                }
            } else {
                questionChoiceValue = "no answer"
            }
        } else {
            document.querySelector(`[name='question_${question}']:checked`).setAttribute("checked", true);
            questionChoiceValue = document.querySelector(`[name='question_${question}']:checked`).value;
        }

        // Get the grand parent element of the radio button.
        let parentCard = questionChoices.closest(".card");

        isCorrect = questions[question]["answer"] === questionChoiceValue;

        if (isCorrect) {
            // Add bg-success to radio element grand parent's card-header.
            parentCard.querySelector(".card-header").classList.add("bg-success");

            // increment score
            score++;

            // append a footer to the card.
            parentCard.innerHTML += `<div class="card-footer bg-success">
                Your answer is correct.
            </div>`;
        } else {
            let ans = questions[question]["answer"];

            questionChoices.closest(".card").querySelector(".card-header").classList.add("bg-danger");
            parentCard.innerHTML += `<div class="card-footer bg-danger">
                Your answer is incorrect (${questionChoiceValue}). The correct answer was: ${ans}
            </div>`;
        }
    }

    console.log(`${score} / ${questions.length} | ${Math.floor((score / questions.length) * 100)}%`);
}

/**
 * Will return question name/content and also its choices.
 */
function retrieveQuizData() {
    let data = {
        name: document.querySelector("#quiz-name").value,
        questions: document.querySelector("#question-data").value.trim()
    }

    // TODO: Validation of Data

    let lines = data.questions.split("\n");

    // Question array, this is the final destination for all question for output.
    let questions = [];

    // Question object.
    let question = {
        question: "",
        choices: [],
        answer: null
    };

    // true or false value that will determine if a question has been detected.
    let questionDetermined = false;

    // formatting rule. E.g: A) or A.
    // used for detecting choices
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    // Iterate through all lines
    for (let i = 0, length = lines.length; i < length; i++) {
        // If there is no question content, then this line will be used as the value for
        // question content.
        if (!questionDetermined) {
            question["question"] = lines[i];
            questionDetermined = true;
        } else if (letters.indexOf(lines[i].charAt(0)) > -1 && (lines[i].charAt(1) === "." || lines[i].charAt(
                1) === ")")) { // If a question is determined, check if this is a choice.
            question["choices"].push(lines[i].slice(3))
        } else { 
            // if both question and choices are determined, then we can assume the next line is also a question.
            // therefore repeating the entire process.

            question["answer"] = question["choices"][getRandomInt(0, question["choices"].length - 1)];

            questions.push(question);

            question = {
                question: "",
                choices: []
            };

            question["question"] = lines[i];
        }
    }

    generateQuestions(randomizeQuestion(questions));
}

/**
 * Output the question object to HTML
 * 
 * @param {array of object} questions 
 */
function generateQuestions(questions) {
    let questionHTML = "";

    for (let i = 0; i < questions.length; i++) {
        let choices = "";

        for (let j = 0; j < questions[i]["choices"].length; j++) {
            let choiceTemplate = `<div class="form-check">
                <input class="form-check-input" type="radio" name="question_${i}" id="choice_${i}_${j}" value="${questions[i]["choices"][j]}">
                <label class="form-check-label" for="choice_${i}_${j}">
                    ${questions[i]["choices"][j]}
                </label>
            </div>`;

            choices += choiceTemplate;
        }

        let questionTemplate = `<div class="col-sm-6">
            <div class="card">
                <div class="card-header">
                    <h1><span id="question-number">${i + 1}</span>. <span>CATEGORY</span></h1>
                </div>
                <div class="card-body">
                    <p id="question-text">${questions[i]["question"]}</p>
                    <div id="choices-container">
                        ${choices}
                    </div>
                </div>
                <small>Answer is: ${questions[i]["answer"]}</small>
            </div>
        </div>`;

        questionHTML += questionTemplate
    }

    questionHTML += `<div class="col-sm-12">
        <button class="btn btn-success" id="submitQuizBtn">Submit Quiz</button>
    </div>`;

    document.querySelector("#question-container").innerHTML = questionHTML;

    document.querySelector("#submitQuizBtn").addEventListener("click", function() {
        checkQuiz(questions);
    });
}