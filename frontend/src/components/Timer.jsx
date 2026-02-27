import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';
import './Timer.css';

const Timer = ({ state, onToggle, onReset, onSwitchMode }) => {
    const { mode, timeRemaining, isRunning } = state;
    const [rotation, setRotation] = useState(0);

    // マックスの時間を設定(秒)
    const maxTime = mode === 'work' ? 25 * 60 : 5 * 60;

    // プログレスの割合を計算 (0 to 1)
    const progress = 1 - (timeRemaining / maxTime);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    useEffect(() => {
        // 動作中なら少しずつ回転アニメーションをつける等も可能
        if (isRunning) {
            setRotation(prev => prev + 0.1);
        }
    }, [isRunning, timeRemaining]);

    const dashArray = 2 * Math.PI * 120; // 半径 120
    const dashOffset = dashArray * (1 - progress);

    return (
        <div className="glass-panel timer-container">
            <div className="timer-header">
                <h3 className="mode-title">
                    {mode === 'work' ? (
                        <><Briefcase size={20} /> Focus Time</>
                    ) : (
                        <><Coffee size={20} /> Break Time</>
                    )}
                </h3>
                <span className={`status-badge ${isRunning ? 'active' : 'idle'}`}>
                    {isRunning ? 'Running' : 'Paused'}
                </span>
            </div>

            <div className="timer-circle-wrapper">
                <svg className="timer-svg" width="280" height="280" viewBox="0 0 280 280">
                    <defs>
                        <linearGradient id="gradientWork" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary-light)" />
                            <stop offset="100%" stopColor="var(--color-primary)" />
                        </linearGradient>
                        <linearGradient id="gradientBreak" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f7c99e" />
                            <stop offset="100%" stopColor="#f2a65a" />
                        </linearGradient>

                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <circle
                        className="timer-bg"
                        cx="140"
                        cy="140"
                        r="120"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        className="timer-progress"
                        cx="140"
                        cy="140"
                        r="120"
                        stroke={mode === 'work' ? "url(#gradientWork)" : "url(#gradientBreak)"}
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 140 140)"
                        filter="url(#glow)"
                    />
                </svg>

                <div className="timer-display">
                    <div className="time">{formatTime(timeRemaining)}</div>
                </div>
            </div>

            <div className="timer-controls">
                <button
                    className="control-btn play-pause"
                    onClick={onToggle}
                    title={isRunning ? "Pause" : "Start"}
                >
                    {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
                <button
                    className="control-btn reset"
                    onClick={onReset}
                    title="Reset Timer"
                >
                    <RotateCcw size={24} />
                </button>
            </div>

            <div className="timer-switcher">
                <button
                    className={`switch-btn ${mode === 'work' ? 'active' : ''}`}
                    onClick={() => onSwitchMode('work')}
                >
                    Focus
                </button>
                <button
                    className={`switch-btn ${mode === 'break' ? 'active' : ''}`}
                    onClick={() => onSwitchMode('break')}
                >
                    Break
                </button>
            </div>
        </div>
    );
};

export default Timer;
