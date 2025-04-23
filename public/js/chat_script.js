// Check if user is logged in
const token = sessionStorage.getItem('token');
const username = sessionStorage.getItem('username');

// Redirect to login if not authenticated
if (!token || !username) {
  window.location.href = 'login.html';
}

// Initialize socket connection with error handling
let socket;
try {
  socket = io('http://localhost:5000', {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    alert('Connection to chat server failed. Please try logging in again.');
    // Redirect to login page if connection fails
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';
  });
} catch (error) {
  console.error('Socket initialization error:', error);
  alert('Failed to connect to chat server.');
}

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const logoutButton = document.getElementById('logout-button');

// Function to send message
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('sendMessage', { sender: username, message });
    messageInput.value = '';
  }
}

// Display existing messages
fetch('http://localhost:5000/messages', {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  })
  .then((messages) => {
    messages.forEach((msg) => {
      addMessage(msg.message, msg.sender, msg.sender === username);
    });
    // Auto scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  })
  .catch((error) => {
    console.error('Error fetching messages:', error);
    alert('Failed to load messages. Please refresh the page or try logging in again.');
  });

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key press
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Receive message
socket.on('receiveMessage', (data) => {
  addMessage(data.message, data.sender, data.sender === username);
});

// Logout
logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Function to add a message to the chat
function addMessage(message, sender, isUser) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  if (isUser) {
    messageElement.classList.add('user');
  }
  
  // Escape HTML to prevent XSS attacks
  const escapedMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  messageElement.innerHTML = `<strong>${sender}:</strong> ${escapedMessage}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}