import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Timer from './components/Timer'
import UserList from './components/UserList'
import './App.css'
import { Leaf } from 'lucide-react'

// Backend URL (環境変数がなければローカルホストを使用)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
const socket = io(BACKEND_URL)

function App() {
  const [joined, setJoined] = useState(false)
  const [name, setName] = useState('')
  const [task, setTask] = useState('')
  const [goal, setGoal] = useState('')
  const [timerState, setTimerState] = useState({ mode: 'work', timeRemaining: 25 * 60, isRunning: false })
  const [users, setUsers] = useState([])

  useEffect(() => {
    socket.on('timerUpdate', (state) => {
      setTimerState(state)
      // モードに合わせてテーマを変更する
      if (state.mode === 'break') {
        document.body.classList.add('mode-break')
      } else {
        document.body.classList.remove('mode-break')
      }
    })

    socket.on('usersUpdate', (updatedUsers) => {
      setUsers(updatedUsers)
    })

    return () => {
      socket.off('timerUpdate')
      socket.off('usersUpdate')
    }
  }, [])

  // 再接続時の処理（タブを長時間開いていると切断されるため）
  useEffect(() => {
    const onConnect = () => {
      if (joined && name) {
        socket.emit('join', { name, task, goal })
      }
    }

    socket.on('connect', onConnect)

    return () => {
      socket.off('connect', onConnect)
    }
  }, [joined, name, task, goal])

  const handleJoin = (e) => {
    e.preventDefault()
    if (!name.trim() || !task.trim()) return

    socket.emit('join', { name, task, goal })
    setJoined(true)
  }

  const handleTaskUpdate = (newTask) => {
    setTask(newTask)
    socket.emit('updateTask', newTask)
  }

  const handleGoalUpdate = (newGoal) => {
    setGoal(newGoal)
    socket.emit('updateGoal', newGoal)
  }

  const toggleTimer = () => {
    if (timerState.isRunning) {
      socket.emit('pauseTimer')
    } else {
      socket.emit('startTimer')
    }
  }

  const resetTimer = () => {
    socket.emit('resetTimer')
  }

  const switchMode = (mode) => {
    socket.emit('switchMode', mode)
  }

  if (!joined) {
    return (
      <div className="login-container">
        <div className="glass-panel login-panel animate-fade-in">
          <div className="login-header">
            <Leaf className="logo-icon" size={48} />
            <h1>Shared Pomodoro</h1>
            <p>みんなで時間を共有して集中しましょう</p>
          </div>

          <form onSubmit={handleJoin} className="login-form">
            <div className="form-group">
              <label>ニックネーム</label>
              <input
                type="text"
                placeholder="あなたのお名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label>今のタスク</label>
              <input
                type="text"
                placeholder="何に取り組みますか？"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>今周期の目標 (任意)</label>
              <input
                type="text"
                placeholder="今周期の目標を書き込んでください"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <button type="submit" className="join-btn">参加する</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container animate-fade-in">
      <header className="app-header">
        <div className="logo">
          <Leaf className="logo-icon" size={32} />
          <h2>Shared Pomodoro</h2>
        </div>
        <div className="user-profile">
          <span className="profile-name">{name}</span>
          <span className="profile-badge">Online</span>
        </div>
      </header>

      <main className="main-content">
        <div className="timer-section">
          <Timer
            state={timerState}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onSwitchMode={switchMode}
          />
        </div>

        <div className="users-section">
          <UserList
            users={users}
            currentTask={task}
            currentGoal={goal}
            onTaskUpdate={handleTaskUpdate}
            onGoalUpdate={handleGoalUpdate}
          />
        </div>
      </main>
    </div>
  )
}

export default App
