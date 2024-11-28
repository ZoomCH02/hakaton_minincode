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

// Маршрут для получения информации о текущем пользователе
app.get('/api/user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Получаем данные о пользователе из сессии
    const user = req.session.user;

    // Запрашиваем информацию о пользователе из базы данных (например, имя и контактные данные)
    const query = 'SELECT * FROM users WHERE id = ?';

    db.get(query, [user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user information' });
        }

        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Отправляем информацию о пользователе
        res.json({
            id: row.id,
            login: row.login,
            name: row.name,
            role: row.role,
            contact_info: row.contact_info,  // Допустим, у пользователя есть поле с контактной информацией
        });
    });
});

// Маршрут для получения всех мероприятий, на которые записан пользователь
app.get('/api/user/events', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    // SQL-запрос для получения всех мероприятий, на которые записан пользователь
    const query = `
        SELECT events.*
        FROM events
        JOIN userOnEvent ON events.id = userOnEvent.eid
        WHERE userOnEvent.uid = ?`;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если мероприятия найдены, возвращаем их в формате JSON
        res.json({ events: rows });
    });
});

// Маршрут для получения последних двух мероприятий
app.get('/api/latest-events', (req, res) => {
    // SQL-запрос для получения двух ближайших мероприятий, которые еще не произошли
    const query = `
        SELECT * FROM events
        WHERE event_date >= CURRENT_TIMESTAMP
        ORDER BY event_date ASC
        LIMIT 2
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если мероприятия найдены, возвращаем их в формате JSON
        if (rows.length > 0) {
            res.json({ events: rows });
        } else {
            res.json({ message: 'Нет ближайших мероприятий.' });
        }
    });
});

// Маршрут для получения мероприятия по ID
app.get('/api/events', (req, res) => {
    // Здесь ваш запрос к базе данных для получения информации о мероприятии
    const query = `
    SELECT * FROM events`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если мероприятия найдены, возвращаем их в формате JSON
        if (rows.length > 0) {
            res.json({ events: rows });
        } else {
            res.json({ message: 'Нет ближайших мероприятий.' });
        }
    });
});

// Маршрут для получения мероприятия по ID
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id; // Получаем ID мероприятия из URL

    // Здесь ваш запрос к базе данных для получения информации о мероприятии
    const query = `
    SELECT *    
    FROM events
    JOIN organizations o ON o.id = events.organization_id
    WHERE events.id = ?;`;

    db.get(query, [eventId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(row); // Отправляем данные мероприятия
    });
});

// Маршрут для регистрации пользователя на мероприятие
app.post('/api/events/:eventId/register', (req, res) => {
    // Получаем userId из сессии (предполагается, что userId сохранен в сессии при логине)
    const userId = req.session.user ? req.session.user.id : null;
    const { eventId } = req.params; // Получаем eventId из параметра маршрута

    if (!userId) {
        return res.status(401).json({ message: 'auth plz' });
    }

    // Сначала проверяем, есть ли уже запись о данном пользователе на мероприятии
    const checkQuery = `SELECT * FROM userOnEvent WHERE uid = ? AND eid = ?`;

    db.get(checkQuery, [userId, eventId], (err, row) => {
        if (err) {
            console.error('Ошибка при проверке записи пользователя на мероприятие:', err);
            return res.status(500).json({ error: 'Ошибка при проверке записи' });
        }

        // Если запись уже существует, возвращаем ошибку с кодом 400
        if (row) {
            return res.status(400).json({ message: 'Вы уже записаны на это мероприятие' });
        }

        // Запрос для вставки записи в таблицу userOnEvent, если пользователя еще нет
        const query = `INSERT INTO userOnEvent (uid, eid) VALUES (?, ?)`;

        db.run(query, [userId, eventId], function (err) {
            if (err) {
                console.error('Ошибка при добавлении пользователя на мероприятие:', err);
                return res.status(500).json({ error: 'Ошибка при записи на мероприятие' });
            }

            // Возвращаем успешный ответ
            res.status(200).json({ message: 'Пользователь успешно записан на мероприятие' });
        });
    });
});



// Маршрут для получения организации по ID, её новостей и мероприятий
app.get('/api/organizations/:id', (req, res) => {
    const { id } = req.params;  // Получаем ID из параметров URL

    // SQL-запрос для получения организации по ID
    const organizationQuery = 'SELECT * FROM organizations WHERE id = ?';
    db.get(organizationQuery, [id], (err, organizationRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если организация не найдена
        if (!organizationRow) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Запрашиваем новости организации
        const newsQuery = 'SELECT * FROM news WHERE organization_id = ?';
        db.all(newsQuery, [id], (err, newsRows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Запрашиваем мероприятия организации
            const eventsQuery = 'SELECT * FROM events WHERE organization_id = ?';
            db.all(eventsQuery, [id], (err, eventsRows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Возвращаем организацию, её новости и мероприятия в формате JSON
                res.json({
                    organization: organizationRow,
                    news: newsRows,
                    events: eventsRows
                });
            });
        });
    });
});


// Маршрут для получения организации по ID
app.get('/api/organizations', (req, res) => {
    const query = 'SELECT * FROM organizations';

    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если организации не найдены
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No organizations found' });
        }

        // Возвращаем все организации в формате JSON
        res.json({ organizations: rows });
    });
});


// Указываем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
