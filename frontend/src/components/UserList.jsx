import React, { useState } from 'react';
import { Users, CheckCircle2, CircleDashed } from 'lucide-react';
import './UserList.css';

const UserList = ({ users, currentTask, onTaskUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [tempTask, setTempTask] = useState(currentTask || '');

    const handleUpdate = (e) => {
        e.preventDefault();
        if (tempTask.trim() !== '') {
            onTaskUpdate(tempTask);
            setEditing(false);
        }
    };

    return (
        <div className="glass-panel users-container">
            <div className="users-header">
                <h3 className="section-title">
                    <Users size={20} />
                    参加メンバー ({users.length}人)
                </h3>
            </div>

            <div className="my-task-section">
                <h4 className="my-task-title">自分のタスク</h4>
                {editing ? (
                    <form className="task-form" onSubmit={handleUpdate}>
                        <input
                            type="text"
                            className="task-input"
                            value={tempTask}
                            onChange={(e) => setTempTask(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="save-btn">保存</button>
                    </form>
                ) : (
                    <div className="current-task-display" onClick={() => setEditing(true)} title="クリックして編集">
                        <span className="task-text">{currentTask || 'タスクが設定されていません'}</span>
                        <span className="edit-hint">編集</span>
                    </div>
                )}
            </div>

            <div className="members-list">
                {users.map(user => (
                    <div className="member-card" key={user.id}>
                        <div className="member-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-info">
                            <div className="member-name">{user.name}</div>
                            <div className="member-task">
                                <CircleDashed size={14} className="task-icon" />
                                {user.task || 'タスクなし'}
                            </div>
                        </div>
                    </div>
                ))}
                {users.length === 0 && (
                    <div className="empty-state">
                        参加者はまだいません。
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
