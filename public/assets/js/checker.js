// Функция для проверки авторизации пользователя
async function checkUserAuth() {
    try {
        const response = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status); // Логируем статус ответа

        if (response.status === 401) {
            console.log("User is not authorized (401)");
            updateAuthButton('Войти', '/login.html');
        } else if (response.ok) {
            const user = await response.json();
            console.log('User data:', user); // Логируем данные пользователя
            updateAuthButton('Профиль', './profile.html');
        } else {
            console.error('Error checking authorization:', response.status);
        }
    } catch (error) {
        console.error('Error checking user authorization:', error);
        updateAuthButton('Войти', '/login.html');
    }
}


// Функция для обновления кнопки в зависимости от статуса авторизации
function updateAuthButton(buttonText, buttonLink) {
    const button = document.getElementById('logOrProfBut');
    if (!button) {
        console.error('Button with id "logOrProfBut" not found');
        return;
    }
    button.innerHTML = `<b>${buttonText}</b>`; // Меняем текст
    button.setAttribute('href', buttonLink); // Меняем ссылку
}


// Проверяем авторизацию при загрузке страницы
document.addEventListener('DOMContentLoaded', checkUserAuth);
