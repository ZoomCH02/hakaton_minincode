// Подключаем необходимые библиотеки
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');  // Подключаем body-parser
const sqlite3 = require('sqlite3').verbose();  // Подключаем sqlite3

// Создаем приложение express
const app = express();

// Указываем папку, в которой хранятся статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Настроим body-parser для обработки данных из форм
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Создаем или открываем базу данных SQLite
const db = new sqlite3.Database('./db.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Получить всех пользователей
app.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM users'; // SQL-запрос для получения всех пользователей
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Отправляем данные в формате JSON
    });
});

// Получить пользователя по ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(row);
    });
});

// Получить все организации
app.get('/api/organizations', (req, res) => {
    const query = 'SELECT * FROM organizations'; // SQL-запрос для получения всех организаций
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Отправляем данные в формате JSON
    });
});


// Получить организацию по ID
app.get('/api/organizations/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM organizations WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json(row);
    });
});


// Получить все мероприятия
app.get('/api/events', (req, res) => {
    const query = 'SELECT * FROM events'; // SQL-запрос для получения всех мероприятий
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Отправляем данные в формате JSON
    });
});


// Получить мероприятие по ID
app.get('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM events WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(row);
    });
});


// Получить все кружки
app.get('/api/clubs', (req, res) => {
    const query = 'SELECT * FROM clubs'; // SQL-запрос для получения всех кружков
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Отправляем данные в формате JSON
    });
});


// Получить кружок по ID
app.get('/api/clubs/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM clubs WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Club not found' });
        }
        res.json(row);
    });
});


// Получить все новости
app.get('/api/news', (req, res) => {
    const query = 'SELECT * FROM news'; // SQL-запрос для получения всех новостей
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Отправляем данные в формате JSON
    });
});


// Получить новость по ID
app.get('/api/news/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM news WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json(row);
    });
});





// Указываем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
