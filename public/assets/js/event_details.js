// Функция для загрузки данных мероприятия по ID из URL
async function loadEventDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id"); // Получаем ID мероприятия

  if (!eventId) {
    console.error("Не указан ID мероприятия");
    return;
  }

  try {
    // Запрос на сервер для получения данных мероприятия
    const response = await fetch(`/api/events/${eventId}`);
    const event = await response.json();
    console.log(event);
    if (response.ok) {
      if (event.isEvent == 1) {
        // Заполняем страницу данными о мероприятии
        document.getElementById("event_title").innerText = event.title;
        document.getElementById("event_description").innerText =
          event.description;
        document.getElementById("event_date").innerText = formatDate(
          event.event_date
        );
        document.getElementById("event_location").innerText = event.location;
        document.getElementById("event_org").innerText = event.name;
      } else if (event.isEvent == 0) {
        document.getElementById("event_title").innerText = event.title;
        document.getElementById("event_description").innerText =
          event.description;
        document.getElementById("event_date").innerText = event.event_date;

        document.getElementById("event_location").innerText = event.address;
        document.getElementById("event_org").innerText = event.name;
      }
    } else {
      console.error("Ошибка при получении данных мероприятия:", event.message);
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных мероприятия:", error);
  }
}

// Форматирование даты
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

// Функция для записи пользователя на мероприятие
// Функция для записи пользователя на мероприятие
async function addUserToEvent(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Убираем userId из тела запроса, поскольку оно извлекается с сервера из сессии
      body: JSON.stringify({}),
    });

    if (response.ok) {
      // Если всё успешно, перенаправляем на страницу профиля
      alert("Вы успешно записаны на мероприятие!");
      window.location.href = "profile.html"; // Перенаправляем на страницу профиля
    } else if (response.status === 401) {
      // Если ошибка 401 (Unauthorized), перенаправляем на страницу логина
      alert("Необходима авторизация. Пожалуйста, войдите в систему.");
      window.location.href = "login.html"; // Перенаправляем на страницу входа
    } else if (response.status === 400) {
      // Если ошибка 400 (пользователь уже записан)
      const result = await response.json();
      alert(result.message || "Ошибка при записи на мероприятие");
    } else {
      // Для других ошибок
      alert("Ошибка при записи на мероприятие");
    }
  } catch (error) {
    console.error("Ошибка при записи:", error);
    alert("Произошла ошибка при записи на мероприятие");
  }
}

// Обработчик для кнопки "Записаться"
document
  .getElementById("addEventToUser")
  .addEventListener("click", function (e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");
    if (eventId) {
      addUserToEvent(eventId);
    } else {
      alert("Не указан ID мероприятия");
    }
  });

// Вызов функции при загрузке страницы
document.addEventListener("DOMContentLoaded", loadEventDetails);
