// Подключаем необходимые библиотеки
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser"); // Подключаем body-parser
const sqlite3 = require("sqlite3").verbose(); // Подключаем sqlite3
const session = require("express-session"); // Подключаем express-session
const bcrypt = require("bcrypt"); // Подключаем bcrypt для хэширования паролей

// Создаем приложение express
const app = express();

// Указываем папку, в которой хранятся статические файлы
app.use(express.static(path.join(__dirname, "public")));

// Настроим body-parser для обработки данных из форм
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Настройка сессий
app.use(
  session({
    secret: "ASdsgrgsdt4wsgfgDFgRsdfDSFsefgdhrYhfh", // Секретный ключ для шифрования сессии
    resave: false, // Не сохранять сессию, если она не изменялась
    saveUninitialized: true, // Сохранять сессию, даже если она пустая
    cookie: {
      httpOnly: true, // Защита от доступа к cookie через JavaScript
      secure: false, // Установите в true, если используете HTTPS
    },
  })
);

// Создаем или открываем базу данных SQLite
const db = new sqlite3.Database("./db.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Маршрут для регистрации
app.post("/api/register", async (req, res) => {
  const { login, fio, password, password_repeat } = req.body;

  if (!login || !fio || !password || !password_repeat) {
    return res
      .status(400)
      .json({ message: "Все поля обязательны для заполнения" });
  }

  if (password !== password_repeat) {
    return res.status(400).json({ message: "Пароли не совпадают" });
  }

  try {
    // Проверим, существует ли пользователь с таким логином
    const checkQuery = "SELECT * FROM users WHERE login = ?";
    db.get(checkQuery, [login], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким логином уже существует" });
      }

      // Хэшируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Сохраняем нового пользователя в базу данных
      const insertQuery =
        "INSERT INTO users (login, password, name, role) VALUES (?, ?, ?, ?)";
      db.run(
        insertQuery,
        [login, hashedPassword, fio, "student"],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res
            .status(201)
            .json({ message: "Пользователь успешно зарегистрирован" });
        }
      );
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Произошла ошибка при регистрации" });
  }
});

// Маршрут для входа
app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  // Проверка на наличие логина и пароля в запросе
  if (!login || !password) {
    return res.status(400).json({ message: "Login and password are required" });
  }

  // SQL-запрос для поиска пользователя по логину
  const query = "SELECT * FROM users WHERE login = ?";

  db.get(query, [login], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Если пользователь с таким логином не найден
    if (!row) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    try {
      // Проверяем правильность пароля, сравнив хэшированный пароль с введенным
      const match = await bcrypt.compare(password, row.password);

      if (!match) {
        return res.status(401).json({ message: "Invalid login or password" });
      }

      // Сохраняем данные пользователя в сессии
      req.session.user = {
        id: row.id,
        login: row.login,
        role: row.role,
      };

      res.json({ message: "Login successful", user: req.session.user });
    } catch (err) {
      // Если произошла ошибка при сравнении паролей
      return res
        .status(500)
        .json({ error: "Error during password comparison" });
    }
  });
});

// Пример защищенного маршрута, доступного только после входа
app.get("/api/protected", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({ message: "This is a protected route", user: req.session.user });
});

app.get("/users-with-telegram", (req, res) => {
  const query = `SELECT login, name, telegram FROM users WHERE telegram IS NOT NULL AND telegram != ''`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Database query failed" });
      return;
    }

    res.status(200).json(rows);
  });
});

// Маршрут для получения информации о текущем пользователе
app.get("/api/user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Получаем данные о пользователе из сессии
  const user = req.session.user;

  // Запрашиваем информацию о пользователе из базы данных (например, имя и контактные данные)
  const query = "SELECT * FROM users WHERE id = ?";

  db.get(query, [user.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching user information" });
    }

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    // Отправляем информацию о пользователе
    res.json({
      id: row.id,
      login: row.login,
      name: row.name,
      role: row.role,
      contact_info: row.contact_info, // Допустим, у пользователя есть поле с контактной информацией
    });
  });
});

// Маршрут для получения всех мероприятий, на которые записан пользователь
app.get("/api/user/events", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.session.user.id;

  // SQL-запрос для получения всех мероприятий, на которые записан пользователь
  const query = `
    SELECT events.*, organizations.name, organizations.address
    FROM events
    JOIN userOnEvent ON events.id = userOnEvent.eid
    JOIN organizations ON events.organization_id=organizations.id
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
app.get("/api/latest-events", (req, res) => {
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
      res.json({ message: "Нет ближайших мероприятий." });
    }
  });
});

app.get("/api/events", (req, res) => {
  let { search, organization_id, isEvent } = req.query;
  let query = "SELECT * FROM events WHERE 1=1";
  const params = [];

  // Фильтрация по названию мероприятия
  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  // Фильтрация по организации
  if (organization_id) {
    query += " AND organization_id = ?";
    params.push(organization_id);
  }

  // Фильтрация по типу мероприятия
  if (isEvent !== undefined) {
    query += " AND isEvent = ?";
    params.push(isEvent);
  }

  query += " ORDER BY event_date ASC"; // Сортируем по дате мероприятия

  console.log("Формируем запрос:", query);
  console.log("Параметры запроса:", params);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Ошибка при выполнении запроса:", err.message);
      return res.status(500).json({ error: err.message });
    }

    // Логируем результат запроса
    console.log("Результат запроса:", rows);

    res.json({ events: rows });
  });
});

// Маршрут для получения мероприятия по ID
app.get("/api/events/:id", (req, res) => {
  const eventId = req.params.id; // Получаем ID мероприятия из URL

  // Здесь ваш запрос к базе данных для получения информации о мероприятии
  const query = `
    SELECT *    
    FROM events
    JOIN organizations o ON o.id = events.organization_id
    WHERE events.id = ?`;

  db.get(query, [eventId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(row); // Отправляем данные мероприятия
  });
});

// Маршрут для регистрации пользователя на мероприятие
app.post("/api/events/:eventId/register", (req, res) => {
  // Получаем userId из сессии (предполагается, что userId сохранен в сессии при логине)
  const userId = req.session.user ? req.session.user.id : null;
  const { eventId } = req.params; // Получаем eventId из параметра маршрута

  if (!userId) {
    return res.status(401).json({ message: "auth plz" });
  }

  // Сначала проверяем, есть ли уже запись о данном пользователе на мероприятии
  const checkQuery = `SELECT * FROM userOnEvent WHERE uid = ? AND eid = ?`;

  db.get(checkQuery, [userId, eventId], (err, row) => {
    if (err) {
      console.error(
        "Ошибка при проверке записи пользователя на мероприятие:",
        err
      );
      return res.status(500).json({ error: "Ошибка при проверке записи" });
    }

    // Если запись уже существует, возвращаем ошибку с кодом 400
    if (row) {
      return res
        .status(400)
        .json({ message: "Вы уже записаны на это мероприятие" });
    }

    // Запрос для вставки записи в таблицу userOnEvent, если пользователя еще нет
    const query = `INSERT INTO userOnEvent (uid, eid) VALUES (?, ?)`;

    db.run(query, [userId, eventId], function (err) {
      if (err) {
        console.error(
          "Ошибка при добавлении пользователя на мероприятие:",
          err
        );
        return res
          .status(500)
          .json({ error: "Ошибка при записи на мероприятие" });
      }

      // Возвращаем успешный ответ
      res
        .status(200)
        .json({ message: "Пользователь успешно записан на мероприятие" });
    });
  });
});

// Маршрут для получения организации по ID, её новостей и мероприятий
app.get("/api/organizations/:id", (req, res) => {
  const { id } = req.params; // Получаем ID из параметров URL

  // SQL-запрос для получения организации по ID
  const organizationQuery = "SELECT * FROM organizations WHERE id = ?";
  db.get(organizationQuery, [id], (err, organizationRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Если организация не найдена
    if (!organizationRow) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Запрашиваем новости организации
    const newsQuery = "SELECT * FROM news WHERE organization_id = ?";
    db.all(newsQuery, [id], (err, newsRows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Запрашиваем мероприятия организации
      const eventsQuery = "SELECT * FROM events WHERE organization_id = ?";
      db.all(eventsQuery, [id], (err, eventsRows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Возвращаем организацию, её новости и мероприятия в формате JSON
        res.json({
          organization: organizationRow,
          news: newsRows,
          events: eventsRows,
        });
      });
    });
  });
});

// Маршрут для получения организации по ID
app.get("/api/organizations", (req, res) => {
  const query = "SELECT * FROM organizations";

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Если организации не найдены
    if (rows.length === 0) {
      return res.status(404).json({ message: "No organizations found" });
    }

    // Возвращаем все организации в формате JSON
    res.json({ organizations: rows });
  });
});

// Маршрут для получения ID организации текущего пользователя
app.get("/api/user/organization", (req, res) => {
  const userId = req.session.user.id; // Извлекаем userId из сессии

  if (!userId) {
    return res.status(401).json({ error: "Не авторизован" });
  }

  // Запрос к базе данных для получения ID организации
  const query = `
      SELECT orgid FROM userOnOrg WHERE uid = ? LIMIT 1
    `;

  db.get(query, [userId], (err, results) => {
    console.log(results);
    console.log(userId);
    if (err) {
      return res
        .status(500)
        .json({ error: "Ошибка при получении организации" });
    }

    if (!results) {
      return res.status(404).json({ error: "Организация не найдена" });
    }

    // Возвращаем ID организации
    res.json({ organizationId: results.orgid });
  });
});

// Маршрут для получения новостей организации
app.get("/api/organizations/:id/news", (req, res) => {
  const organizationId = req.params.id;

  // SQL-запрос для получения новостей конкретной организации
  const query =
    "SELECT * FROM news WHERE organization_id = ? ORDER BY created_at DESC";

  db.all(query, [organizationId], (err, rows) => {
    if (err) {
      console.error("Ошибка при получении новостей:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({ news: rows });
  });
});

app.post("/api/news", (req, res) => {
  const { title, content, organization_id } = req.body;

  if (!title || !content || !organization_id) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const query = `INSERT INTO news (title, content, organization_id) VALUES (?, ?, ?)`;

  db.run(query, [title, content, organization_id], function (err) {
    if (err) {
      console.error("Error adding news:", err.message);
      return res.status(500).json({ error: "Failed to add news" });
    }

    // Отправляем сообщение в Telegram
    fetch("http://localhost:3001/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: title,
        description: content,
        org: organization_id
      }),
    })
      .then(() => console.log("Telegram notification sent"))
      .catch((error) =>
        console.error("Failed to send Telegram notification:", error)
      );

    res
      .status(201)
      .json({ message: "News added successfully", newsId: this.lastID });
  });
});

app.post("/api/events_c", (req, res) => {
  const { title, description, schedule, organization_id } = req.body;

  if (!title || !description || !schedule || !organization_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `INSERT INTO events (title, description, event_date, isEvent, organization_id) VALUES (?, ?, ?, ?, ?)`;

  db.run(
    query,
    [title, description, schedule, 0, organization_id],
    function (err) {
      if (err) {
        console.error("Error adding circle:", err.message);
        return res.status(500).json({ error: "Failed to add circle" });
      }

      // Отправляем сообщение в Telegram
      fetch("http://localhost:3001/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          description: description,
          org: organization_id,
        }),
      })
        .then(() => console.log("Telegram notification sent"))
        .catch((error) =>
          console.error("Failed to send Telegram notification:", error)
        );

      res
        .status(201)
        .json({ message: "Circle added successfully", circleId: this.lastID });
    }
  );
});

app.post("/api/events_e", (req, res) => {
  const { title, description, location, date, time, organization_id } =
    req.body;

  if (
    !title ||
    !description ||
    !location ||
    !date ||
    !time ||
    !organization_id
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `INSERT INTO events (title, description, location, event_date, isEvent, organization_id) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(
    query,
    [title, description, location, date + " " + time, 1, organization_id],
    function (err) {
      if (err) {
        console.error("Error adding event:", err.message);
        return res.status(500).json({ error: "Failed to add event" });
      }

      // Отправляем сообщение в Telegram
      fetch("http://localhost:3001/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          description: description,
          org: organization_id,
        }),
      })
        .then(() => console.log("Telegram notification sent"))
        .catch((error) =>
          console.error("Failed to send Telegram notification:", error)
        );

      res
        .status(201)
        .json({ message: "Event added successfully", eventId: this.lastID });
    }
  );
});

// Маршрут для удаления новости
app.delete("/api/deleteNews/:id", (req, res) => {
  const newsId = req.params.id; // Получаем ID новости из параметра маршрута

  // SQL-запрос на удаление новости по ID
  const query = "DELETE FROM news WHERE id = ?";

  db.run(query, [newsId], function (err) {
    if (err) {
      console.error("Ошибка при удалении новости:", err.message);
      return res.status(500).json({ error: "Ошибка при удалении новости" });
    }

    // Проверяем, сколько строк было затронуто
    if (this.changes === 0) {
      return res.status(404).json({ message: "Новость не найдена" });
    }

    res.json({ success: true, message: "Новость удалена" });
  });
});

// Маршрут для удаления мер
app.delete("/api/deleteEvent/:id", (req, res) => {
  const newsId = req.params.id; // Получаем ID новости из параметра маршрута

  // SQL-запрос на удаление новости по ID
  const query = "DELETE FROM events WHERE id = ?";

  db.run(query, [newsId], function (err) {
    if (err) {
      console.error("Ошибка при удалении новости:", err.message);
      return res.status(500).json({ error: "Ошибка при удалении новости" });
    }

    // Проверяем, сколько строк было затронуто
    if (this.changes === 0) {
      return res.status(404).json({ message: "Новость не найдена" });
    }

    res.json({ success: true, message: "Новость удалена" });
  });
});

app.get("/api/admin/getStudents", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  if (req.session.user.role != "admin") {
    return res.status(401).json({ message: "Не достаточно привелегий" });
  }

  db.all("SELECT * FROM users WHERE role='student'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.send(row);
  });
});

app.get("/api/admin/getModerators", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  if (req.session.user.role != "admin") {
    return res.status(401).json({ message: "Не достаточно привелегий" });
  }

  db.all("SELECT * FROM users WHERE role='moderator'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.send(row);
  });
});

app.get("/api/admin/deliteModerator", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  if (req.session.user.role != "admin") {
    return res.status(401).json({ message: "Не достаточно привелегий" });
  }

  db.run(
    "UPDATE users set role='student' WHERE id=?",
    [req.query.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.send({ status: "OK" });
    }
  );
});

app.get("/api/admin/addModerator", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  if (req.session.user.role != "admin") {
    return res.status(401).json({ message: "Не достаточно привелегий" });
  }

  db.run(
    "UPDATE users set role='moderator' WHERE id=?",
    [req.query.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.send({ status: "OK" });
    }
  );
});

app.post("/api/admin/createOrg", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  var d = req.body;
  d.name, d.description, d.category, d.latetude, d.longetude, d.img;
  db.run(
    "INSERT INTO organizations (name,description,category,latetude,longetude,img,verified) VALUES (?,?,?,?,?,?,0)",
    [d.name, d.description, d.category, d.latetude, d.longetude, d.img],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      db.run(
        "INSERT INTO userOnOrg (uid,orgid) VALUES (?,?)",
        [req.session.user.id, this.lastID],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          } else {
            res.send({ status: "OK" });
          }
        }
      );
    }
  );
});

app.get("/api/admin/getOrgForModeration", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  if (
    req.session.user.role != "admin" &&
    req.session.user.role != "moderator"
  ) {
    return res.status(401).json({ message: "Не достаточно привелегий" });
  }

  db.all("SELECT * FROM organizations WHERE verified=0", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.send(row);
  });
});

app.get("/api/admin/getOrgVerefy", (req, res) => {
  db.all("SELECT * FROM organizations WHERE verified=1", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.send(row);
  });
});

app.post("/api/admin/updateOrg", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  if (
    req.session.user.role != "admin" &&
    req.session.user.role != "moderator"
  ) {
    return res.status(401).json({ message: "Не достаточно привелегий" });
  }

  var b = req.body;

  if (b.col == "verified") {
    if (b.val == 1) {
      db.run(
        `
           UPDATE users 
            SET role = 'organization' 
            WHERE id IN (SELECT uid FROM userOnOrg WHERE userOnOrg.orgid = ?)
           `,
        [b.id],
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else {
      db.run(
        `
       UPDATE users 
        SET role = 'student' 
        WHERE id IN (SELECT uid FROM userOnOrg WHERE userOnOrg.orgid = ?)
       `,
        [b.id],
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  }

  db.run(
    "UPDATE organizations SET " + b.col + "=? WHERE id=?",
    [b.val, b.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      } else {
        res.send({ status: "OK" });
      }
    }
  );
});

app.get("/api/admin/getStatistic", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "auth plz" });
  }

  if (
    req.session.user.role != "admin" &&
    req.session.user.role != "moderator"
  ) {
    return res.status(401).json({ message: "Не достаточно привелегий" });
  }

  const rowOrg = await new Promise((resolve, reject) => {
    db.all("SELECT created_at FROM organizations", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });

  const evnts = await new Promise((resolve, reject) => {
    db.all("SELECT event_date FROM events", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });

  dayeOrg = {};
  for (var el of rowOrg) {
    var date = new Date(el.created_at);
    var day = date.toLocaleDateString("ru-RU");
    if (!dayeOrg[day]) {
      dayeOrg[day] = 1;
    } else {
      dayeOrg[day] += 1;
    }
  }

  dayeEvents = {};
  for (var el of evnts) {
    var date = new Date(el.event_date);
    var day = date.toLocaleDateString("ru-RU");
    if (!dayeEvents[day]) {
      dayeEvents[day] = 1;
    } else {
      dayeEvents[day] += 1;
    }
  }

  res.send({ dayeEvents: dayeEvents, dayeOrg: dayeOrg });
});

// Указываем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
