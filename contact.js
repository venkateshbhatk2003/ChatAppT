document.addEventListener('DOMContentLoaded', function() {

  // Check if the user is logged in
  const username = sessionStorage.getItem('username');
  if (!username) {
    // Redirect to login page if not logged in
    alert('Please log in to access the home page.');
    window.location.href = 'login.html';
    return;
  }
  // Load user data from sessionStorage
 
  const email = sessionStorage.getItem('email');
  
  // Pre-fill the form if the user is logged in
  if (username) {
    document.getElementById('contact-name').value = username;
  }
  
  if (email) {
    document.getElementById('contact-email').value = email;
  }
  
  // Character counter for message
  const messageTextarea = document.getElementById('contact-message');
  const charCount = document.getElementById('char-count');
  const MAX_CHARS = 500;
  
  messageTextarea.addEventListener('input', function() {
    const currentLength = this.value.length;
    charCount.textContent = currentLength;
    
    if (currentLength > MAX_CHARS) {
      charCount.style.color = '#d93025';
    } else {
      charCount.style.color = '#777';
    }
  });
  
  // Form validation
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    clearErrors();
    
    // Get form values
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value.trim();
    
    // Validate inputs
    let isValid = true;
    
    // Validate name
    if (name === '') {
      displayError('name-error', 'Please enter your name');
      isValid = false;
    } else if (name.length < 2) {
      displayError('name-error', 'Name must be at least 2 characters');
      isValid = false;
    }
    
    // Validate email
    if (email === '') {
      displayError('email-error', 'Please enter your email');
      isValid = false;
    } else if (!validateEmail(email)) {
      displayError('email-error', 'Please enter a valid email address');
      isValid = false;
    }
    
    // Validate subject
    if (subject === '') {
      displayError('subject-error', 'Please select a subject');
      isValid = false;
    }
    
    // Validate message
    if (message === '') {
      displayError('message-error', 'Please enter your message');
      isValid = false;
    } else if (message.length < 10) {
      displayError('message-error', 'Message must be at least 10 characters');
      isValid = false;
    } else if (message.length > MAX_CHARS) {
      displayError('message-error', `Message cannot exceed ${MAX_CHARS} characters`);
      isValid = false;
    }
    
    // If form is valid, submit it
    if (isValid) {
      // In a real app, this would send data to a server
      // For demonstration, we'll just show a success message
      alert('Thank you for your message! We will get back to you soon.');
      contactForm.reset();
      charCount.textContent = '0';
    }
  });
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
});

// Display error message
function displayError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Clear all error messages
function clearErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(function(element) {
    element.textContent = '';
  });
}

// Email validation function
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Logout function
function logout() {
  // Clear session data
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = 'login.html';
}