document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-messages';
  errorContainer.style.color = 'red';
  errorContainer.style.margin = '10px 0';
  loginForm.parentNode.insertBefore(errorContainer, loginForm.nextSibling);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.innerHTML = ''; // Clear previous errors
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Basic validation
    if (!username || username.length < 3) {
      errorContainer.innerHTML = '<div>• Username must be at least 3 characters</div>';
      return;
    }
    
    if (!password || password.length < 8) {
      errorContainer.innerHTML = '<div>• Password must be at least 8 characters</div>';
      return;
    }

    try {
      // Show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      // Send login request
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      const data = await response.json(); // Parse JSON response

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Success - store username and redirect
      sessionStorage.setItem('username', data.username);
      window.location.href = 'landing.html'; // Redirect to chat page
      
    } catch (error) {
      console.error('Login error:', error);
      errorContainer.innerHTML = `<div>• ${error.message || 'Connection error. Please try again.'}</div>`;
    }
  });
});