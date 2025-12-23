/**
 * Login and registration page logic.
 * Handles user authentication, registration, failed login attempts tracking,
 * cookie management, and high score display.
 */

// Global state
const users = JSON.parse(localStorage.getItem('users')) || [];
let failedAttempts = {};
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 300000; // lockout duration in ms (5 minutes)

// Restore saved credentials from cookies on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = getCookie('user_email');
    const savedPassword = getCookie('user_password');

    if (savedEmail && savedPassword) {
        document.getElementById('login-email').value = savedEmail;
        document.getElementById('login-password').value = savedPassword;
    }
});

// Form toggling event listeners
document.getElementById('show-register').addEventListener('click', () => {
    toggleForms('register');
});

document.getElementById('show-login').addEventListener('click', () => {
    toggleForms('login');
});

// Login form submission handler
document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (failedAttempts[email] && Date.now() < failedAttempts[email].unblockTime) {
        alert('החשבון נחסם זמנית. נסה שוב מאוחר לאחר.');
        return;
    }

    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex > -1 && users[userIndex].password === password) {
        const timestamp = new Date().toISOString();
        if (!users[userIndex].timestamps) {
            users[userIndex].timestamps = [];
        }
        users[userIndex].timestamps.push(timestamp);
        localStorage.setItem('users', JSON.stringify(users));

        setCookie('user_email', email, 12);
        setCookie('user_password', password, 12);

        localStorage.setItem('current user', JSON.stringify(users[userIndex]));
        window.location.href = 'home.html';

        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('home-page').classList.remove('hidden');
        displayHighScores(users[userIndex].highScores);
        failedAttempts[email] = null;
    } else {
        alert('אימייל או סיסמה שגויים');
        handleFailedAttempt(email);
    }
});

// Registration form submission handler
document.getElementById('register').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex > -1) {
        alert('האימייל כבר רשום במערכת');
    } else {
        users.push({ email, name, password, highScoreSnake: 0, HighScoreBall: 0});
        localStorage.setItem('users', JSON.stringify(users));
        setCookie('user_email', email, 12);
        setCookie('user_password', password, 12);
        alert('הרישום הצליח!');
        toggleForms('login');
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = password;
    }
});

/**
 * Toggles visibility between login and registration forms.
 * @param {string} form - The form to show ('login' or 'register').
 */
function toggleForms(form) {
    document.getElementById('login-form').classList.toggle('hidden', form !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', form !== 'register');
}

/**
 * Handles failed login attempts by tracking count and blocking account after MAX_ATTEMPTS.
 * @param {string} email - The email address of the failed login attempt.
 */
function handleFailedAttempt(email) {
    if (!failedAttempts[email]) {
        failedAttempts[email] = { count: 1, unblockTime: null };
    } else {
        failedAttempts[email].count++;
        if (failedAttempts[email].count >= MAX_ATTEMPTS) {
            failedAttempts[email].unblockTime = Date.now() + BLOCK_TIME;
            alert('החשבון נחסם ל-5 דקות עקב מספר ניסיונות כושלים.');
        }
    }
}

/**
 * Adds a high score to the user's score history (keeps last 10 scores).
 * @param {string} email - The user's email address.
 * @param {number} score - The score to add.
 */
function addHighScore(email, score) {
    const user = users.find(user => user.email === email);
    if (user) {
        user.highScores.push(score);
        if (user.highScores.length > 10) {
            user.highScores.shift();
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
}

/**
 * Displays user's high scores in the UI.
 * @param {Array<number>} highScores - Array of high score values.
 */
function displayHighScores(highScores) {
    const scoresContainer = document.getElementById('high-scores');
    scoresContainer.innerHTML = '';
    highScores.forEach((score, index) => {
        const scoreElement = document.createElement('p');
        scoreElement.innerText = `ציון ${index + 1}: ${score}`;
        scoresContainer.appendChild(scoreElement);
    });
}

/**
 * Sets a cookie with specified name, value, and expiration time.
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {number} hours - Hours until cookie expires.
 */
function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

/**
 * Retrieves a cookie value by name.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|null} The cookie value or null if not found.
 */
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return value;
        }
    }
    return null;
}
