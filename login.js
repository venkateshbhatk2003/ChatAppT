document.addEventListener('DOMContentLoaded', function() {
  // No need to pre-fill the username field with email
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (username.length < 3) {
      alert('Please enter a valid username (at least 3 characters)');
      return;
    }
    
    if (password.length < 8) {
      alert('Please enter a valid password (at least 8 characters)');
      return;
    }
    
    // Check if user exists in sessionStorage
    const storedPassword = sessionStorage.getItem(`user_${username}`);
    
    if (storedPassword && storedPassword === password) {
      // Successful login
      sessionStorage.setItem('username', username); // Store username for the session
      alert('Login successful!');
      window.location.href = 'landing.html'; // Redirect to home page
    } else {
      alert('Incorrect username or password. Please try again.');
    }
  });
});