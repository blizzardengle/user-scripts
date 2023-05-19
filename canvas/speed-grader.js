// ==UserScript==
// @name         Canvas Speed Grader Tweaks
// @namespace    Canvas
// @version      1.1
// @description  Adds various tweaks to the speed grader: Modifies styles, auto award full points to response questions, and so on.
// @author       Christopher Keers
// @match        https://*.instructure.com/courses/*/gradebook/speed_grader*
// @run-at       document-start
// @require      https://blizzardengle.github.io/user-scripts/require/user-scripts.js
// ==/UserScript==

class CanvasSpeedGrader {

    constructor() {
        UserScript.waitFor('#iframe_holder')
            .then((iframeHolder) => {
                const callback = UserScript.debounce(this.respondToChanges, 100, this);
                UserScript.observe(iframeHolder, callback);
            });
    }

    addAutoGradeAssignmentResponseButton(body) {
        const wrapper = body.querySelector('[data-automation="sdk-grading"]');
        if (!wrapper) { return; }

        const buttonOriginal = body.querySelector('[data-automation="sdk-update-grade-button"]');
        if (!buttonOriginal) { return; }

        const buttonFullPoints = UserScript.createElement('button', {
            attrs: {
                type: 'button'
            },
            classes: 'btn btn-primary',
            innerHTML: 'Update Essay Questions to Full Points',
            listeners: [
                ['click', this.updateAssignmentResponseScores.bind(null, body, buttonOriginal)]
            ]
        });

        buttonOriginal.parentElement.after(buttonFullPoints);
    }

    addAutoGradeQuizResponseButton(body) {
        const buttonContainer = body.querySelector('#update_scores .button-container');
        if (!buttonContainer) { return; }

        const buttonOriginal = buttonContainer.querySelector('button.update-scores');
        if (!buttonOriginal) { return; }

        const buttonFullPoints = UserScript.createElement('button', {
            attrs: {
                type: 'button'
            },
            classes: 'btn btn-primary',
            innerHTML: 'Update Essay Questions to Full Points',
            listeners: [
                ['click', this.updateQuizResponseScores.bind(null, body, buttonOriginal)]
            ]
        });

        buttonContainer.appendChild(buttonFullPoints);
    }

    addSpeedGraderStyles(body) {
        const css = 'https://blizzardengle.github.io/user-scripts/canvas/css/speed-grader.css';
        UserScript.addStylesheet(css, { doc: body.ownerDocument });
    }

    respondToChanges(type, iframeHolder) {
        if (type !== 'childList') { return; }
        const iframe = iframeHolder.querySelector('#speedgrader_iframe');
        const waitUntilLoaded = () => {
            const body = iframe.contentDocument.querySelector('body.quizzes-speedgrader');
            if (body) {
                this.addSpeedGraderStyles(body);
                this.addAutoGradeQuizResponseButton(body);
                this.addAutoGradeAssignmentResponseButton(body);
            }
            iframe.removeEventListener('load', waitUntilLoaded);
        };
        iframe.addEventListener('load', waitUntilLoaded);
    }

    updateAssignmentResponseScores(body, button) {
        const regions = body.querySelectorAll('[data-automation="sdk-grading-result-wrapper"]');
        if (!regions) { return; }

        let changes = false;

        regions.forEach((region) => {
            const question = region.querySelector('div.fs-mask');
            if (question) {
                if (!question.innerText.includes('/')) { return; }
                const buttons = question.querySelectorAll('button');
                for (let i = 0; i < buttons.length; i++) {
                    if (buttons[i].innerText.includes('correct')) {
                        buttons[i].click();
                        changes = true;
                        break;
                    }
                }
            }
        });

        if (!changes) { return; }
        button.click();
    }

    updateQuizResponseScores(body, button) {
        const regions = body.querySelectorAll('div[role="region"]');
        if (!regions) { return; }

        let changes = false;

        regions.forEach((region) => {
            const question = region.querySelector('.question.essay_question');
            if (question) {
                let points = question.querySelector('.question_points');
                points = parseInt(points.innerText.replace(/\D/g, ''), 10);
                if (!points) { return; }
                const hiddenInput = question.querySelector('.question_input_hidden');
                const visibleInput = question.querySelector('.question_input');
                if (!hiddenInput || !visibleInput) { return; }
                hiddenInput.value = points;
                visibleInput.value = points;
                changes = true;
            }
        });

        if (!changes) { return; }
        button.click();
    }

}

// eslint-disable-next-line no-new
new CanvasSpeedGrader();
