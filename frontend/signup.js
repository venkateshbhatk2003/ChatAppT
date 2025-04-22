document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
  
    // Validate inputs
    if (!username) {
      alert('Username is required.');
      return;
    }
  
    if (username.length < 3) {
      alert('Username must be at least 3 characters long.');
      return;
    }
  
    if (!password) {
      alert('Password is required.');
      return;
    }
  
    if (password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    try {
      // Send signup request to the backend
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Account created successfully! You can now login.');
        window.location.href = 'login.html';
      } else {
        alert(data.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please try again later.');
      console.error('Signup error:', error);
    }
  });