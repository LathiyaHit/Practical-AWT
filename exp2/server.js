const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data', 'tasks.json');

function readTasks() {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeTasks(tasks) {
    fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2));
}

app.get('/api/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { title, dueDate, status } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title required' });
    }

    const tasks = readTasks();
    const newTask = {
        id: Date.now(),
        title: title,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        status: status || 'pending',
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status, title, dueDate } = req.body;

    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    if (status) tasks[taskIndex].status = status;
    if (title) tasks[taskIndex].title = title;
    if (dueDate) tasks[taskIndex].dueDate = dueDate;

    writeTasks(tasks);
    res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    let tasks = readTasks();

    tasks = tasks.filter(t => t.id !== parseInt(id));
    writeTasks(tasks);
    res.json({ message: 'Task deleted' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
