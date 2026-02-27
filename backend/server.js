const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 開発用なので全てのオリジンを許可
    methods: ["GET", "POST"]
  }
});

// タイマーの状態管理
let timerState = {
  mode: 'work', // 'work' or 'break'
  timeRemaining: 25 * 60, // 25分
  isRunning: false,
};

// ユーザーリストの管理
// key: socketId, value: { id, name, task }
const users = new Map();

// タイマー設定
const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

// タイマーのカウントダウン処理
setInterval(() => {
  if (timerState.isRunning && timerState.timeRemaining > 0) {
    timerState.timeRemaining -= 1;
    io.emit('timerUpdate', timerState); // 毎秒全体に送信
  } else if (timerState.isRunning && timerState.timeRemaining === 0) {
    // 状態を切り替える
    if (timerState.mode === 'work') {
      timerState.mode = 'break';
      timerState.timeRemaining = BREAK_TIME;
    } else {
      timerState.mode = 'work';
      timerState.timeRemaining = WORK_TIME;
    }
    // 状態が切り替わった時は自動的に止めるか続けるか。今回は自動で停止する
    timerState.isRunning = false;
    io.emit('timerUpdate', timerState);
  }
}, 1000);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 初回接続時に現在のタイマー状態とユーザーリストを送信
  socket.emit('timerUpdate', timerState);
  socket.emit('usersUpdate', Array.from(users.values()));

  // ユーザーが参加した時の処理
  socket.on('join', ({ name, task }) => {
    users.set(socket.id, { id: socket.id, name, task });
    io.emit('usersUpdate', Array.from(users.values()));
  });

  // タスクの更新
  socket.on('updateTask', (task) => {
    const user = users.get(socket.id);
    if (user) {
      user.task = task;
      users.set(socket.id, user);
      io.emit('usersUpdate', Array.from(users.values()));
    }
  });

  // タイマーの操作
  socket.on('startTimer', () => {
    timerState.isRunning = true;
    io.emit('timerUpdate', timerState);
  });

  socket.on('pauseTimer', () => {
    timerState.isRunning = false;
    io.emit('timerUpdate', timerState);
  });

  socket.on('resetTimer', () => {
    timerState.isRunning = false;
    timerState.mode = 'work';
    timerState.timeRemaining = WORK_TIME;
    io.emit('timerUpdate', timerState);
  });
  
  // モードを強制切替する操作
  socket.on('switchMode', (mode) => {
    timerState.isRunning = false;
    timerState.mode = mode;
    timerState.timeRemaining = mode === 'work' ? WORK_TIME : BREAK_TIME;
    io.emit('timerUpdate', timerState);
  });

  // 切断時の処理
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);
    io.emit('usersUpdate', Array.from(users.values()));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
