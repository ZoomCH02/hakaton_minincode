// Получаем параметр orgid из URL
const urlParams = new URLSearchParams(window.location.search);
const orgId = urlParams.get("orgid"); // Например, orgid=1

if (!orgId) {
  console.error("ID организации не найден в URL");
} else {
  // Загружаем данные по ID организации
  fetch(`/api/organizations/${orgId}`)
    .then((response) => response.json()) // Преобразуем в объект
    .then((data) => {
      // Обновляем элементы страницы
      document.getElementById("name").textContent = data.organization.name;
      document.getElementById("contact_info").textContent =
        data.organization.contact_info;
      document.getElementById("description").textContent =
        data.organization.description;
      document.getElementById("address").textContent =
        data.organization.address;
      document
        .querySelectorAll("#img")
        .forEach((img) => (img.src = data.organization.img));
    })
    .catch((error) => {
      console.error("Ошибка загрузки данных:", error);
    });

  // Функция загрузки данных и отрисовки мероприятий
  function renderEvents() {
    fetch(`/api/organizations/${orgId}`)
      .then((response) => response.json())
      .then((data) => {
        const events = data.events; // Получаем массив мероприятий
        const eventList = document.getElementById("eventList"); // Контейнер для мероприятий

        // Очищаем контейнер перед добавлением новых элементов
        eventList.innerHTML = "";

        // Перебираем мероприятия и создаем элементы
        events.forEach((event) => {
          const eventDiv = document.createElement("div");
          eventDiv.classList.add("event");

          // Добавляем содержимое мероприятия
          eventDiv.innerHTML = `
              <h3 style="margin-top: 10px">${event.title}</h3>
              <p>${event.description}</p>
              <a href="event-details.html?id=${event.id}" class="read-more linka">Узнать больше <i class="bi bi-arrow-right"></i></a>
            `;

          // Добавляем мероприятие в контейнер
          eventList.appendChild(eventDiv);
        });
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных:", error);
      });
  }

  // Вызываем функцию при загрузке страницы
  document.addEventListener("DOMContentLoaded", renderEvents);

  // Функция загрузки данных и отрисовки новостей
  function renderNews() {
    fetch(`/api/organizations/${orgId}`)
      .then((response) => response.json())
      .then((data) => {
        const news = data.news; // Получаем массив новостей
        const newsList = document.getElementById("newsList"); // Контейнер для новостей

        // Очищаем контейнер перед добавлением новых элементов
        newsList.innerHTML = "";

        // Перебираем новости и создаем элементы
        news.forEach((item) => {
          const newsDiv = document.createElement("div");
          newsDiv.classList.add("event");

          // Добавляем содержимое новости
          newsDiv.innerHTML = `
              <h3 style="margin-top: 10px">${item.title}</h3>
              <p>${item.content}</p>
            `;

          // Добавляем новость в контейнер
          newsList.appendChild(newsDiv);
        });
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных:", error);
      });
  }

  // Вызываем функцию при загрузке страницы
  document.addEventListener("DOMContentLoaded", renderNews);
}
