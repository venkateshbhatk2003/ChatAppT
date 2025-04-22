document.addEventListener('DOMContentLoaded', function() {


  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Get form values
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
  
    // Input validation
    const errors = [];
    
    // Email validation
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Username validation
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    // Password validation
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    // Special character check
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    
    if (!(hasSpecialChar && hasNumber && hasUpperCase)) {
      errors.push('Password must include at least one special character, one number, and one uppercase letter');
    }
    
    // Password match validation
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    // Display errors if any
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
  
    // Store user data in sessionStorage
    sessionStorage.setItem(`user_${username}`, password); // Store user data with username as key
    
    
    // Simulate successful sign-up
    alert('Sign up successful! Please log in.');
    window.location.href = 'login.html'; // Redirect to login page
  });
});

// Email validation function
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}