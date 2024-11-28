// Функция для получения организаций (для фильтра)
async function loadOrganizations() {
    try {
        const response = await fetch('/api/organizations'); // Запрос на получение списка организаций
        const result = await response.json();

        if (response.ok) {
            const orgSelect = document.getElementById('organizationFilter');
            result.organizations.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.name;
                orgSelect.appendChild(option);
            });
        } else {
            console.error('Ошибка при получении организаций:', result.message);
        }
    } catch (error) {
        console.error('Ошибка при загрузке организаций:', error);
    }
}

// Функция для загрузки мероприятий с учетом фильтров
async function loadLatestEvents() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedOrg = document.getElementById('organizationFilter').value;

    try {
        // Отправляем запрос с параметрами поиска и фильтра по организации
        const response = await fetch(`/api/events?search=${searchQuery}&organization_id=${selectedOrg}`);
        const result = await response.json();

        if (response.ok) {
            const eventsList = document.getElementById('eventsList');
            eventsList.innerHTML = ''; // Очищаем контейнер перед вставкой новых данных

            // Обрабатываем полученные мероприятия
            result.events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('col-lg-6');
                eventElement.setAttribute('data-aos', 'fade-up');
                eventElement.setAttribute('data-aos-delay', '100'); // или настраиваем задержку индивидуально

                eventElement.innerHTML = `
                    <div class="service-card d-flex">
                        <div class="icon flex-shrink-0">
                            <i class="bi bi-activity"></i>
                        </div>
                        <div>
                            <h3>${event.title}</h3>
                            <p>${event.description}</p>
                            <a href="event-details.html?id=${event.id}" class="read-more">Узнать больше<i class="bi bi-arrow-right"></i></a>
                        </div>
                    </div>
                `;

                eventsList.appendChild(eventElement);
            });
        } else {
            console.error('Ошибка при получении мероприятий:', result.message);
        }
    } catch (error) {
        console.error('Ошибка при загрузке мероприятий:', error);
    }
}

// Функция для обработки изменения в поиске или фильтре
function handleFilterChange() {
    loadLatestEvents(); // Загружаем мероприятия при изменении фильтров
}

// Вызываем функцию для загрузки мероприятий и организаций после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    loadOrganizations(); // Загружаем список организаций
    loadLatestEvents();  // Загружаем мероприятия

    // Добавляем обработчики событий для фильтров
    document.getElementById('searchInput').addEventListener('input', handleFilterChange);
    document.getElementById('organizationFilter').addEventListener('change', handleFilterChange);
});
