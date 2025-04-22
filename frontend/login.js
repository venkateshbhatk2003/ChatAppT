document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = sessionStorage.getItem('token');
    if (token) {
      window.location.href = 'index.html'; // Redirect to chat if already logged in
    }
  
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
    
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
    
      // Basic validation
      if (!username) {
        alert('Username is required.');
        return;
      }
    
      if (!password) {
        alert('Password is required.');
        return;
      }
    
      try {
        // Send login request to the backend
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      
        if (response.ok) {
          const data = await response.json();
          sessionStorage.setItem('username', username); // Store username for chat page
          sessionStorage.setItem('token', data.token); // Store JWT token
          window.location.href = 'index.html'; // Redirect to chat page
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Login failed. Invalid username or password.');
        }
      } catch (error) {
        alert('Network error. Please try again later.');
        console.error('Login error:', error);
      }
    });
  });