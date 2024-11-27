// Подключаем библиотеку express
const express = require('express');
const path = require('path');

// Создаем приложение express
const app = express();

// Указываем папку, в которой хранятся статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Настроим маршрут по умолчанию, чтобы загружать index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Указываем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
