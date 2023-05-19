// ==UserScript==
// @name         Quiz Grading Addons
// @namespace    Canvas
// @version      1.0
// @description  Adds various tweaks to the speed grader: Modifies styles, auto award full points to response questions, and so on.
// @author       Christopher Keers
// @match        https://*.instructure.com/courses/*/gradebook/speed_grader*
// @run-at       document-start
// @require      {{CDN_URL}}/require/user-scripts.js
// ==/UserScript==

class CanvasSpeedGrader {

    constructor() {
        UserScript.waitFor('#iframe_holder')
            .then((iframeHolder) => {
                const callback = UserScript.debounce(this.respondToChanges, 100, this);
                UserScript.observe(iframeHolder, callback);
            });
    }

    addAutoGradeResponseButton(body) {
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
                ['click', this.updateScores.bind(null, body, buttonOriginal)]
            ]
        });

        buttonContainer.appendChild(buttonFullPoints);
    }

    addSpeedGraderStyles(body) {
        const css = '{{CDN_URL}}/canvas/css/speed-grader.css';
        UserScript.addStylesheet(css, { doc: body.ownerDocument });
    }

    respondToChanges(type, iframeHolder) {
        if (type !== 'childList') { return; }
        const iframe = iframeHolder.querySelector('#speedgrader_iframe');
        const waitUntilLoaded = () => {
            const body = iframe.contentDocument.querySelector('body.quizzes-speedgrader');
            if (body) {
                this.addSpeedGraderStyles(body);
                this.addAutoGradeResponseButton(body);
            }
            iframe.removeEventListener('load', waitUntilLoaded);
        };
        iframe.addEventListener('load', waitUntilLoaded);
    }

    updateScores(body, button) {
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
