/**
 * Home page logic: navigation and leaderboard rendering.
 * Handles game navigation, sidebar toggling, user logout, and leaderboard display.
 */

// Load leaderboard when page loads
document.addEventListener("DOMContentLoaded", () => {
    loadLeaderboard();
    displayUserName();
});

/**
 * Navigates to the specified game page.
 * @param {string} url - The URL of the game page to open.
 */
function openGame(url) {
    window.location.href = url;
}

/**
 * Toggles the sidebar menu visibility.
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.querySelector('.hamburger').classList.toggle('open');
}

/**
 * Logs out the current user and redirects to login page.
 */
function logout() {
    localStorage.removeItem("current user");
    alert("התנתקת בהצלחה");
    window.location.href = "login.html";
}

/**
 * Loads and displays the leaderboard with user scores from localStorage.
 * Sorts users by their best score (max of HighScoreBall and HighScoreDodge).
 */
function loadLeaderboard() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const tbody = document.getElementById("leaderboard-body");

    const rows = users
        .map(u => {
            const score1 = Number.isFinite(u.HighScoreBall) ? u.HighScoreBall : 0;
            const score2 = Number.isFinite(u.HighScoreDodge) ? u.HighScoreDodge : 0;
            const best = Math.max(score1, score2);
            const lastLogin = Array.isArray(u.timestamps) && u.timestamps.length > 0
                ? new Date(u.timestamps[u.timestamps.length - 1]).toLocaleString()
                : "—";
            return { name: u.name || "—", score1, score2, best, lastLogin };
        })
        .sort((a, b) => b.best - a.best)
        .map(u => `
            <tr>
                <td>${u.name}</td>
                <td>${u.score1}</td>
                <td>${u.score2}</td>
                <td>${u.lastLogin}</td>
            </tr>
        `)
        .join("");

    tbody.innerHTML = rows;
}

/**
 * Displays the current user's name in the header.
 */
function displayUserName() {
    const currentUser = JSON.parse(localStorage.getItem("current user"));
    const header = document.getElementById("header");
    if (currentUser && currentUser.name) {
        header.textContent = `🎮 Let's Start Playing, ${currentUser.name}! 🎮`;
    }
}
