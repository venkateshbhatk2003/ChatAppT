const express = require('express');
const { Server } = require('socket.io');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// SQL Server Configuration (same as before)
const config = {
  user: 'chatAppAdmin',
  password: 'venkatesh3002@galaxe',
  server: 'localhost',
  database: 'ChatAppDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Database connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Username required'));
  }
  socket.username = username;
  next();
});

// Socket.IO Connection Handler
io.on('connection', async (socket) => {
  console.log(`${socket.username} connected`);

  // Join user to their room
  socket.join(socket.username);

  // Message Handler
  socket.on('sendMessage', async (data) => {
    if (!data.message?.trim()) return;

    try {
      await poolConnect;
      await pool.request()
        .input('sender', sql.NVarChar, socket.username)
        .input('message', sql.NVarChar, data.message.trim())
        .query(`
          INSERT INTO Messages (sender, message, timestamp) 
          VALUES (@sender, @message, GETDATE())
        `);

      // Broadcast to all clients
      io.emit('receiveMessage', {
        sender: socket.username,
        message: data.message.trim(),
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  // Disconnect Handler
  socket.on('disconnect', () => {
    console.log(`${socket.username} disconnected`);
  });
});

// GET Messages Endpoint (no auth required)
app.get('/messages', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .query(`
        SELECT sender, message, timestamp 
        FROM Messages 
        ORDER BY timestamp ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Node.js chat server running on port ${PORT}`);
});