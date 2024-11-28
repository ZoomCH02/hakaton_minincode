async function fetchUserProfile() {
    const errorMessage = document.querySelector('.error-message');

    try {
        const response = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            // Отображаем информацию о пользователе
            document.getElementById('login').innerText = `Логин: ${result.login}`;
            document.getElementById('name').innerText = `Имя: ${result.name}`;
            document.getElementById('role').innerText = `Роль: ${result.role}`;
            document.getElementById('contact-info').innerText = `Контактная информация: ${result.contact_info}`;

            // Получаем мероприятия, на которые записан пользователь
            await fetchUserEvents();
        } else if (response.status === 401) {
            // Если ошибка 401 (неавторизованный), перенаправляем на страницу login.html
            window.location.href = '/login.html';
        } else {
            // Ошибка, если не удалось получить данные
            errorMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        errorMessage.innerHTML = '<div class="alert alert-danger">An error occurred. Please try again later.</div>';
    }
}

async function fetchUserEvents() {
    const eventsContainer = document.getElementById('eventContainer'); // Предполагаем, что у вас есть контейнер для отображения мероприятий

    try {
        const response = await fetch('/api/user/events', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            // Очистим контейнер перед отображением новых данных
            eventsContainer.innerHTML = "";

            if (result.events && result.events.length > 0) {
                // Отображаем все мероприятия
                console.log(result.events);
                result.events.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('row'); // Добавляем класс 'row'
                    eventElement.classList.add('gy-4'); // Добавляем класс 'gy-4'

                    // Форматируем дату
                    const formattedDate = formatDate(event.event_date);

                    eventElement.innerHTML = `
                        <h3><b>${event.title}</b></h3>
                        <h4><b>Описание:</b> ${event.description}</h4>
                        <h4><b>Организатор:</b> ${event.organizer || "Не указано"}</h4>
                        <h4><b>Дата:</b> ${formattedDate}</h4>
                        <h4><b>Место:</b> ${event.location}</h4>
                    `;
                    eventsContainer.appendChild(eventElement);
                });
            } else {
                eventsContainer.innerHTML = '<p>Вы не записаны на мероприятия.</p>';
            }
        } else if (response.status === 401) {
            // Если ошибка 401 (неавторизованный), перенаправляем на страницу login.html
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error fetching user events:', error);
    }
}

// Функция для форматирования даты в нужный формат
function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0'); // день (2 цифры)
    const month = String(date.getMonth() + 1).padStart(2, '0'); // месяц (2 цифры)
    const year = date.getFullYear(); // год (4 цифры)

    const hours = String(date.getHours()).padStart(2, '0'); // часы (2 цифры)
    const minutes = String(date.getMinutes()).padStart(2, '0'); // минуты (2 цифры)

    return `${day}.${month}.${year}, ${hours}:${minutes}`; // формат: dd.mm.yyyy, hh:mm
}

// Вызовем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchUserProfile);
