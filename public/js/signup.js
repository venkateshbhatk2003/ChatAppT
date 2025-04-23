document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Input validation (same as before)
    const errors = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      // Send signup request to Java backend (port 8080)
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      const data = await response.text();
      
      if (response.ok) {
        alert('Signup successful! Please login.');
        window.location.href = 'login.html';
      } else {
        alert(data || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Connection error. Try again.');
    }
  });
});