document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-messages';
  errorContainer.style.color = 'red';
  errorContainer.style.margin = '10px 0';
  signupForm.parentNode.insertBefore(errorContainer, signupForm.nextSibling);

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.innerHTML = ''; // Clear previous errors
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Input validation
    const errors = [];
    
    if (!username) {
      errors.push('Username is required');
    } else if (username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (errors.length > 0) {
      errorContainer.innerHTML = errors.map(err => `<div>• ${err}</div>`).join('');
      return;
    }

    try {
      // Show loading state
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing up...';

      // Send signup request
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Signup failed with unknown error');
      }

      // Success handling
      alert('Signup successful! Please login.');
      window.location.href = 'login.html';
      
    } catch (error) {
      console.error('Signup error:', error);
      errorContainer.innerHTML = `<div>• ${error.message || 'Connection error. Please try again.'}</div>`;
    }
  });
});