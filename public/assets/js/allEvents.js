// Функция для получения последних двух мероприятий и их отображения
async function loadLatestEvents() {
    try {
        // Отправляем запрос на сервер для получения последних двух мероприятий
        const response = await fetch('/api/events'); // Обновите URL в зависимости от вашего маршрута
        const result = await response.json();

        if (response.ok) {
            const eventsList = document.getElementById('eventsList');
            eventsList.innerHTML = ''; // Очищаем контейнер перед вставкой новых данных

            // Обрабатываем полученные мероприятия
            result.events.forEach(event => {
                // Создаем HTML-элементы для каждого мероприятия
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
                            <!-- Динамическая ссылка на страницу с подробной информацией -->
                            <a href="event-details.html?id=${event.id}" class="read-more">Узнать больше<i class="bi bi-arrow-right"></i></a>
                        </div>
                    </div>
                `;

                // Добавляем созданный элемент в контейнер
                eventsList.appendChild(eventElement);
            });
        } else {
            console.error('Ошибка при получении мероприятий:', result.message);
        }
    } catch (error) {
        console.error('Ошибка при загрузке мероприятий:', error);
    }
}

// Вызываем функцию для загрузки мероприятий после загрузки страницы
document.addEventListener('DOMContentLoaded', loadLatestEvents);
