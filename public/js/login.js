document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (username.length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }
    
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      // Send credentials to Java backend (port 8080)
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      const data = await response.text(); // Java returns plain text
      
      if (response.ok) {
        // 1. Store username for session
        sessionStorage.setItem('username', username);
        
        // 2. Connect to Node.js chat server (port 5000)
        const socket = io('http://localhost:5000');
        
        // 3. Emit 'join' event to Node.js
        socket.emit('join', { username });
        
        // 4. Redirect to chat page
        window.location.href = 'chat.html';
      } else {
        alert(data || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Connection error. Try again.');
    }
  });
});