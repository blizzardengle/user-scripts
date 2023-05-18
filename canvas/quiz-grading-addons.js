// ==UserScript==
// @name         Quiz Grading Addons
// @namespace    Canvas
// @version      1.0
// @description  Adds a button to immediately award full points to all open response questions in a quiz.
// @author       Christopher Keers
// @match        https://*.instructure.com/courses/*/gradebook/speed_grader*
// @run-at       document-start
// @require      https://blizzardengle.github.io/user-scripts/require/user-scripts.js
// ==/UserScript==

const addAutoGradeButton = (body, questions) => {
    const buttonContainer = body.querySelector('#update_scores .button-container');
    if (!buttonContainer) { return; }

    const buttonOriginal = buttonContainer.querySelector('button.update-scores');
    if (!buttonOriginal) { return; }
    const originalSubmit = buttonOriginal;

    const buttonFullPoints = document.createElement('button');
    buttonFullPoints.type = 'button';
    buttonFullPoints.classList.add('btn');
    buttonFullPoints.classList.add('btn-primary');
    buttonFullPoints.innerHTML = 'Update Essay Questions to Full Points';
    buttonFullPoints.addEventListener('click', updateScores.bind(null, questions, originalSubmit));

    buttonContainer.appendChild(buttonFullPoints);
};

const hookQuiz = (iframe) => {
    const body = iframe.contentDocument.querySelector('body.quizzes-speedgrader');
    if (!body) { return; }

    const regions = body.querySelectorAll('div[role="region"]');
    if (!regions) { return; }

    const questions = [];
    regions.forEach((region) => {
        const question = region.querySelector('.question.essay_question');
        if (question) {
            questions.push(question);
        }
    });

    if (questions.length < 1) { return; }

    const css = 'https://blizzardengle.github.io/user-scripts/canvas/css/quiz-grading-addons.css';
    // eslint-disable-next-line no-undef
    UserScript.addStylesheet(css, { doc: body.ownerDocument });

    addAutoGradeButton(body, questions);
};

const updateScores = (questions, originalSubmit) => {
    questions.forEach((question) => {
        let points = question.querySelector('.question_points');
        points = parseInt(points.innerText.replace(/\D/g, ''), 10);
        if (!points) { return; }
        const hiddenInput = question.querySelector('.question_input_hidden');
        const visibleInput = question.querySelector('.question_input');
        if (!hiddenInput || !visibleInput) { return; }
        hiddenInput.value = points;
        visibleInput.value = points;
    });
    originalSubmit.click();
};

window.addEventListener('load', () => {
    const iframeHolder = document.getElementById('iframe_holder');

    const callback = (mutationList, observer) => {
        mutationList.forEach((mutation) => {
            if (mutation.type !== 'childList') { return; }
            const iframe = iframeHolder.querySelector('#speedgrader_iframe');
            if (!iframe) { return; }
            if (iframe.getAttribute('processed')) { return; }
            iframe.setAttribute('processed', true);

            const loadCallback = () => {
                hookQuiz(iframe);
                iframe.removeEventListener('load', loadCallback);
            };

            iframe.addEventListener('load', loadCallback);
        });
    };

    const observer = new MutationObserver(callback);

    observer.observe(iframeHolder, { childList: true });
});
