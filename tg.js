const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const TELEGRAM_TOKEN = "7350253513:AAFsLGBsht0yh1QoVyZH-qdwUzkl1DetCpo"; // Ваш токен
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const users = []; // Хранилище для chatId пользователей

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (!users.includes(chatId)) {
    users.push(chatId); // Добавляем пользователя, если он ещё не зарегистрирован
    console.log(`Пользователь зарегистрирован: ${chatId}`);
    bot.sendMessage(chatId, "Вы зарегистрированы для получения уведомлений!");
  } else {
    bot.sendMessage(chatId, "Вы уже зарегистрированы.");
  }
});

// Эндпоинт для отправки уведомлений
app.post("/send-message", (req, res) => {
  const { name, description, org } = req.body;

  if (!name || !description || !org) {
    return res.status(400).send("Некорректные данные.");
  }

  const message = `Новое образовательное мероприятие:\n\n*Название*: ${name}\n*Описание*: ${description} \n*Айди организации*: ${org}`;

  if (users.length === 0) {
    console.log("Нет зарегистрированных пользователей.");
    return res.status(200).send("Нет зарегистрированных пользователей.");
  }

  // Отправляем сообщение всем зарегистрированным пользователям
  users.forEach((chatId) => {
    bot
      .sendMessage(chatId, message, { parse_mode: "Markdown" })
      .then(() => console.log(`Сообщение отправлено пользователю: ${chatId}`))
      .catch((err) =>
        console.error(`Ошибка отправки пользователю ${chatId}:`, err)
      );
  });

  res
    .status(200)
    .send("Сообщение отправлено всем зарегистрированным пользователям.");
});

// Обработчик ошибок Telegram Bot API
bot.on("polling_error", (error) => {
  console.error("Ошибка опроса Telegram API:", error);
});

// Запуск сервера
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
