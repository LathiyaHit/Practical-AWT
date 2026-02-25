const API_URL = '/api';
let tasks = [];

const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDeadline = document.getElementById('taskDeadline');
const pendingTasksList = document.getElementById('pendingTasksList');
const completedTasksList = document.getElementById('completedTasksList');
const pendingCountEl = document.getElementById('pendingCount');
const completedCountEl = document.getElementById('completedCount');

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setDefaultDate();
    taskForm.addEventListener('submit', addTask);
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    taskDeadline.value = today;
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        tasks = await response.json();
        displayTasks();
        updateStats();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function addTask(e) {
    e.preventDefault();

    if (!taskTitle.value.trim()) {
        alert('Please enter a task title');
        return;
    }

    const newTask = {
        title: taskTitle.value.trim(),
        dueDate: taskDeadline.value,
        status: 'pending'
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            taskForm.reset();
            setDefaultDate();
            loadTasks();
        }
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task');
    }
}

function displayTasks() {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    if (pendingTasks.length === 0) {
        pendingTasksList.innerHTML = '<p class="empty-message">No pending tasks</p>';
    } else {
        pendingTasksList.innerHTML = pendingTasks.map(task => createTaskHTML(task, 'pending')).join('');
    }

    if (completedTasks.length === 0) {
        completedTasksList.innerHTML = '<p class="empty-message">No completed tasks</p>';
    } else {
        completedTasksList.innerHTML = completedTasks.map(task => createTaskHTML(task, 'completed')).join('');
    }

    attachEventListeners();
}

function createTaskHTML(task, status) {
    const date = new Date(task.dueDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const buttonText = status === 'pending' ? 'Mark Complete' : 'Mark Pending';
    const buttonClass = status === 'pending' ? 'btn-complete' : 'btn-pending';

    return `
        <div class="task-item ${status === 'completed' ? 'completed' : ''}">
            <div class="task-content">
                <div class="task-name">${escapeHtml(task.title)}</div>
                <div class="task-date">Due: ${formattedDate}</div>
            </div>
            <div class="task-buttons">
                <button class="btn-move ${buttonClass}" onclick="toggleTask(${task.id})">${buttonText}</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `;
}

async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task');
    }
}

async function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task');
        }
    }
}

function updateStats() {
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;

    pendingCountEl.textContent = pendingCount;
    completedCountEl.textContent = completedCount;
}

function attachEventListeners() {
    // Event listeners are attached inline in HTML
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
