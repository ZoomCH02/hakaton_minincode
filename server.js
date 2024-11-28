// Подключаем необходимые библиотеки
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');  // Подключаем body-parser
const sqlite3 = require('sqlite3').verbose();  // Подключаем sqlite3
const session = require('express-session'); // Подключаем express-session
const bcrypt = require('bcrypt'); // Подключаем bcrypt для хэширования паролей

// Создаем приложение express
const app = express();

// Указываем папку, в которой хранятся статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Настроим body-parser для обработки данных из форм
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Настройка сессий
app.use(session({
    secret: 'ASdsgrgsdt4wsgfgDFgRsdfDSFsefgdhrYhfh', // Секретный ключ для шифрования сессии
    resave: false, // Не сохранять сессию, если она не изменялась
    saveUninitialized: true, // Сохранять сессию, даже если она пустая
    cookie: {
        httpOnly: true, // Защита от доступа к cookie через JavaScript
        secure: false, // Установите в true, если используете HTTPS
    }
}));

// Создаем или открываем базу данных SQLite
const db = new sqlite3.Database('./db.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Маршрут для регистрации
app.post('/api/register', async (req, res) => {
    const { login, fio, password, password_repeat } = req.body;

    if (!login || !fio || !password || !password_repeat) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }

    if (password !== password_repeat) {
        return res.status(400).json({ message: 'Пароли не совпадают' });
    }

    try {
        // Проверим, существует ли пользователь с таким логином
        const checkQuery = 'SELECT * FROM users WHERE login = ?';
        db.get(checkQuery, [login], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
            }

            // Хэшируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // Сохраняем нового пользователя в базу данных
            const insertQuery = 'INSERT INTO users (login, password, name, role) VALUES (?, ?, ?, ?)';
            db.run(insertQuery, [login, hashedPassword, fio, "student"], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
            });
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации' });
    }
});

// Маршрут для входа
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    // Проверка на наличие логина и пароля в запросе
    if (!login || !password) {
        return res.status(400).json({ message: 'Login and password are required' });
    }

    // SQL-запрос для поиска пользователя по логину
    const query = 'SELECT * FROM users WHERE login = ?';

    db.get(query, [login], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если пользователь с таким логином не найден
        if (!row) {
            return res.status(401).json({ message: 'Invalid login or password' });
        }

        try {
            // Проверяем правильность пароля, сравнив хэшированный пароль с введенным
            const match = await bcrypt.compare(password, row.password);

            if (!match) {
                return res.status(401).json({ message: 'Invalid login or password' });
            }

            // Сохраняем данные пользователя в сессии
            req.session.user = {
                id: row.id,
                login: row.login
            };

            res.json({ message: 'Login successful', user: req.session.user });

        } catch (err) {
            // Если произошла ошибка при сравнении паролей
            return res.status(500).json({ error: 'Error during password comparison' });
        }
    });
});


// Пример защищенного маршрута, доступного только после входа
app.get('/api/protected', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({ message: 'This is a protected route', user: req.session.user });
});

// Указываем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
