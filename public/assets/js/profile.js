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
        } else {
            // Ошибка, если не удалось получить данные
            errorMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        errorMessage.innerHTML = '<div class="alert alert-danger">An error occurred. Please try again later.</div>';
    }
}

// Вызовем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchUserProfile);
