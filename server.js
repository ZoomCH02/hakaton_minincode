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

// Указываем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
