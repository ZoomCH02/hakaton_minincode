// Функция для проверки, вошел ли пользователь
function checkUserLogin() {
  fetch("/api/user", {
    method: "GET",
    credentials: "same-origin", // Для использования сессий
  })
    .then((response) => {
      // Если пользователь не авторизован, ответ будет с кодом 401 (Unauthorized)
      if (response.status === 401) {
        window.location.href = "login.html"; // Перенаправление на страницу входа
      } else {
        return response.json();
      }
    })
    .then((data) => {
      if (data) {
        loadUserProfile(data); // Загружаем профиль, если пользователь авторизован
      }
    })
    .catch((error) => {
      console.error("Ошибка при проверке авторизации:", error);
      window.location.href = "login.html"; // Если возникла ошибка, перенаправляем на вход
    });
}

// Функция для получения информации о пользователе и отображения данных на странице
function loadUserProfile(data) {
  // Если запрос успешен, отображаем данные о пользователе
  document.getElementById("login").innerText = `Логин: ${data.login}`;
  document.getElementById("name").innerText = `Имя: ${data.name}`;
  document.getElementById("role").innerText = `Роль: ${data.role}`;
  document.getElementById(
    "contact-info"
  ).innerText = `Контактная информация: ${data.contact_info}`;

  // Получаем ID организации
  loadOrganizationId();
}

function loadOrganizationId() {
  fetch("/api/user/organization", {
    method: "GET",
    credentials: "same-origin", // Для того чтобы использовать сессии
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.organizationId) {
        loadOrganizationData(data.organizationId); // Передаем ID организации в функцию загрузки данных
      }
    })
    .catch((error) => {
      console.error("Ошибка получения ID организации:", error);
    });
}

function loadOrganizationData(organizationId) {
  fetch(`/api/organizations/${organizationId}`)
    .then((response) => response.json())
    .then((data) => {
      // Заполнение новостей
      const newsContainer = document.getElementById("news");
      data.news.forEach((news) => {
        const newsCard = document.createElement("div");
        newsCard.classList.add("card-org");
        newsCard.dataset.id = news.id;
        newsCard.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0">${news.title}</h2>
                <i class="bi bi-trash3-fill" style="color: red; font-size: 24px; cursor: pointer" title="Удалить новость" onclick="addDeleteButtonListener(${news.id}, 'news')"></i>
              </div>
              <p style="margin-top: 10px; color: #555; font-size: 16px">${news.content}</p>
            `;
        newsContainer.appendChild(newsCard);
      });

      // Заполнение кружков
      const circlesContainer = document.getElementById("circles");
      data.events.forEach((event) => {
        if (event.isEvent === 0) {
          // Если это кружок
          const circleCard = document.createElement("div");
          circleCard.classList.add("card-org");
          circleCard.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0">${event.title}</h2>
            <i class="bi bi-trash3-fill" style="color: red; font-size: 24px; cursor: pointer" onclick="addDeleteButtonListener(${event.id}, 'e')" title="Удалить кружок"></i>
          </div>
          <p style="margin-top: 10px; color: #555; font-size: 16px">${event.description}</p>
        `;
          circlesContainer.appendChild(circleCard);
        }
      });

      // Заполнение мероприятий
      const eventsContainer = document.getElementById("events");
      data.events.forEach((event) => {
        if (event.isEvent === 1) {
          // Если это мероприятие
          const eventCard = document.createElement("div");
          eventCard.classList.add("card-org");
          eventCard.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0">${event.title}</h2>
            <i class="bi bi-trash3-fill" style="color: red; font-size: 24px; cursor: pointer" onclick="addDeleteButtonListener(${event.id}, 'e')" title="Удалить мероприятие"></i>
          </div>
          <p style="margin-top: 10px; color: #555; font-size: 16px">${event.description}</p>
        `;
          eventsContainer.appendChild(eventCard);
        }
      });
    })
    .catch((error) => {
      console.error("Ошибка загрузки данных организации:", error);
    });
}

// Метод для сбора данных из модального окна "Добавить новость"
function collectNewsData() {
  const title = document.getElementById("newsTitle").value.trim();
  const content = document.getElementById("newsContent").value.trim();
  return { title, content };
}

// Метод для сбора данных из модального окна "Добавить кружок"
function collectCircleData() {
  const title = document.getElementById("circleTitle").value.trim();
  const description = document.getElementById("circleDescription").value.trim();
  const schedule = document.getElementById("circleSched").value.trim();
  return { title, description, schedule };
}

// Метод для сбора данных из модального окна "Добавить мероприятие"
function collectEventData() {
  const title = document.getElementById("eventTitle").value.trim();
  const description = document.getElementById("eventDescription").value.trim();
  const location = document.getElementById("eventLocal").value.trim();
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value.trim();
  return { title, description, location, date, time };
}

// Функция для получения ID организации текущего пользователя
function getOrganizationId() {
  return fetch("/api/user/organization", {
    method: "GET",
    credentials: "same-origin", // Для того чтобы использовать сессии
  })
    .then((response) => response.json())
    .then((data) => data.organizationId)
    .catch((error) => {
      console.error("Ошибка получения ID организации:", error);
      return null;
    });
}

// Пример обработки отправки формы для новостей
document.getElementById("addNewsForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const newsData = collectNewsData();
  console.log("Collected News Data:", newsData);

  // Получаем ID организации
  getOrganizationId().then((organizationId) => {
    if (organizationId) {
      // Добавляем organizationId в данные
      newsData.organization_id = organizationId;

      // Отправка данных на сервер
      fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          // После успешного добавления данных обновляем карточки
          window.location.reload();
        })
        .catch((error) => console.error("Error:", error));
    } else {
      console.error("Не удалось получить ID организации");
    }
  });
});

// Пример обработки отправки формы для кружков
document
  .getElementById("addCircleForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const circleData = collectCircleData();
    console.log("Collected Circle Data:", circleData);

    // Получаем ID организации
    getOrganizationId().then((organizationId) => {
      if (organizationId) {
        // Добавляем organizationId в данные
        circleData.organization_id = organizationId;

        // Отправка данных на сервер
        fetch("/api/events_c", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(circleData),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            // После успешного добавления данных обновляем карточки
            window.location.reload();
          })
          .catch((error) => console.error("Error:", error));
      } else {
        console.error("Не удалось получить ID организации");
      }
    });
  });

// Пример обработки отправки формы для мероприятий
document
  .getElementById("addEventForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const eventData = collectEventData();
    console.log("Collected Event Data:", eventData);

    // Получаем ID организации
    getOrganizationId().then((organizationId) => {
      if (organizationId) {
        // Добавляем organizationId в данные
        eventData.organization_id = organizationId;

        // Отправка данных на сервер
        fetch("/api/events_e", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            // После успешного добавления данных обновляем карточки
            window.location.reload();
          })
          .catch((error) => console.error("Error:", error));
      } else {
        console.error("Не удалось получить ID организации");
      }
    });
  });

function addDeleteButtonListener(itemCardId, type) {
  const itemId = itemCardId; // Получаем ID элемента из data-атрибута

  if (itemId) {
    if (type == "news") {
      // Запрос на удаление элемента с сервером
      fetch(`/api/deleteNews/${itemId}`, {
        // Исправлено: добавлены кавычки вокруг URL
        method: "DELETE",
        credentials: "same-origin",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("Новость удалена");
            window.location.reload();
          } else {
            console.error("Ошибка при удалении новости");
          }
        })
        .catch((error) => {
          console.error("Ошибка:", error);
        });
    } else if (type == "e") {
      // Запрос на удаление элемента с сервером
      fetch(`/api/deleteEvent/${itemId}`, {
        // Исправлено: добавлены кавычки вокруг URL
        method: "DELETE",
        credentials: "same-origin",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("Новость удалена");
            window.location.reload();
          } else {
            console.error("Ошибка при удалении новости");
          }
        })
        .catch((error) => {
          console.error("Ошибка:", error);
        });
    }
  }
}

// Загружаем профиль пользователя при загрузке страницы, предварительно проверив авторизацию
window.onload = checkUserLogin;
