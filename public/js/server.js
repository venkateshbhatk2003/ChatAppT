const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// SQL Server Configuration
const config = {
  user: 'chatAppAdmin', // Replace with your SQL Server username
  password: 'venkatesh3002@galaxe', // Replace with your SQL Server password
  server: 'DESKTOP-U46NUM5\\SQLEXPRESS', // Replace with your SQL Server host
  database: 'ChatAppDB', // Replace with your database name
  options: {
    encrypt: false, // For Azure SQL
    trustServerCertificate: true, // For self-signed certificates
  },
  port: 1433
};

// Database connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// Handle initial connection errors
poolConnect.catch(err => {
  console.error('Database connection failed:', err);
});

const JWT_SECRET = 'your-secret-key'; // Consider using environment variables for this

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    await poolConnect; // Ensure pool is connected
    
    // Check if username exists - Using parameterized query to prevent SQL injection
    const userCheckResult = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');
    
    if (userCheckResult.recordset.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, hashedPassword)
      .query('INSERT INTO Users (username, password) VALUES (@username, @password)');
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    await poolConnect; // Ensure pool is connected
    
    // Find user - Using parameterized query
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');
    
    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Fetch messages endpoint - protected route
app.get('/messages', authenticateToken, async (req, res) => {
  try {
    await poolConnect; // Ensure pool is connected
    
    const result = await pool.request()
    .query('SELECT sender, message, timestamp FROM Messages ORDER BY timestamp ASC');
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Socket.io middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Invalid token'));
    }
    socket.user = decoded;
    next();
  });
});

// Socket.io for real-time communication
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('sendMessage', async (data) => {
    const { sender, message } = data;

    // Validate message
    if (!message || message.trim() === '') {
      return;
    }

    try {
      await poolConnect; // Ensure pool is connected
      
      // Save message - Using parameterized query
      await pool.request()
    .input('sender', sql.NVarChar, sender)
    .input('message', sql.NVarChar, message)
    .query('INSERT INTO Messages (sender, message, timestamp) VALUES (@sender, @message, GETDATE())');

      // Broadcast message to all clients
      io.emit('receiveMessage', { 
        sender, 
        message, 
        timestamp: new Date() 
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Serve static files from public directory
app.use(express.static('public'));

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server shutdown gracefully
process.on('SIGINT', async () => {
  try {
    await pool.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database connection:', err);
    process.exit(1);
  }
});