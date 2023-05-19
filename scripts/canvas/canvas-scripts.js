class CanvasScripts {

    isCalendar() {
        if (document.getElementById('calendar-app')) {
            return true;
        }
        return false;
    }

    isCourse() {
        if (document.getElementById('content')) {
            return window.location.href.includes('course');
        }
        return false;
    }

    isDashboard() {
        if (document.getElementById('dashboard')) {
            return true;
        }
        return false;
    }

    isGradebook() {
        if (document.getElementById('gradebook_wrapper')) {
            return true;
        }
        return false;
    }

    isInbox() {
        if (document.querySelector('.conversations .messaging-wrapper')) {
            return true;
        }
        return false;
    }

    isSpeedGrader() {
        if (document.getElementById('submissions_container')) {
            return window.location.href.includes('speed_grader');
        }
        return false;
    }

    getAppDiv() {
        return document.getElementById('application') || document.body;
    }

}

const CanvasScript = new CanvasScripts();
window.CanvasScript = CanvasScript;
