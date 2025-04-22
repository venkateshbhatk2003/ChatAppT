document.addEventListener('DOMContentLoaded', function() {
  // Check if the user is logged in
  const username = sessionStorage.getItem('username');
  if (!username) {
    // Redirect to login page if not logged in
    alert('Please log in to access the home page.');
    window.location.href = 'login.html';
    return;
  }

  // Display the username
  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    usernameElement.textContent = username;
  }

  // Logout functionality
  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('username'); // Clear the stored username
    window.location.href = 'login.html'; // Redirect to login page
  });
});