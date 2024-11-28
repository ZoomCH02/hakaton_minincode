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
    document.getElementById("contact-info").innerText = `Контактная информация: ${data.contact_info}`;
  
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
          newsCard.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0">${news.title}</h2>
                <i class="bi bi-trash3-fill" style="color: red; font-size: 24px; cursor: pointer" title="Удалить новость"></i>
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
            <i class="bi bi-trash3-fill" style="color: red; font-size: 24px; cursor: pointer" title="Удалить кружок"></i>
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
            <i class="bi bi-trash3-fill" style="color: red; font-size: 24px; cursor: pointer" title="Удалить мероприятие"></i>
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
  
  // Загружаем профиль пользователя при загрузке страницы, предварительно проверив авторизацию
  window.onload = checkUserLogin;
  