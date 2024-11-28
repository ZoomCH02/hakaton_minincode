async function login() {
    const loginValue = document.getElementById('login').value;
    const passwordValue = document.getElementById('password').value;

    // Очистим предыдущие сообщения об ошибках
    const errorMessage = document.querySelector('.error-message');
    errorMessage.innerHTML = '';

    // Проверка на обязательные поля
    if (!loginValue || !passwordValue) {
        errorMessage.innerHTML = '<div class="alert alert-danger">Login and password are required.</div>';
        return;
    }

    // Создаем объект с данными для отправки на сервер
    const userData = {
        login: loginValue,
        password: passwordValue
    };

    try {
        // Отправляем данные на сервер с помощью fetch
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        // Получаем ответ от сервера
        const result = await response.json();

        if (response.ok) {
            // Успешный вход
            errorMessage.innerHTML = '<div class="alert alert-success">Login successful!</div>';

            // Очищаем поля ввода
            document.getElementById('login').value = '';
            document.getElementById('password').value = '';

            // Перенаправляем пользователя на страницу профиля
            window.location.href = '/profile.html'; // Перенаправление на страницу профиля
        } else {
            // Ошибка (неверный логин или пароль)
            errorMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        // Ошибка при отправке запроса
        console.error('Error during login:', error);
        errorMessage.innerHTML = '<div class="alert alert-danger">An error occurred. Please try again later.</div>';
    }
}



async function reg() {
    const login = document.getElementById('login').value;
    const fio = document.getElementById('fio').value;
    const password = document.getElementById('password').value;
    const passwordRepeat = document.getElementById('password_repeat').value;

    const errorMessage = document.querySelector('.error-message');

    // Очистить все ошибки
    errorMessage.innerHTML = '';

    // Проверка на обязательные поля
    if (!login || !fio || !password || !passwordRepeat) {
        errorMessage.innerHTML = '<div class="alert alert-danger">Все поля обязательны для заполнения.</div>';
        return;
    }

    // Проверка на совпадение паролей
    if (password !== passwordRepeat) {
        errorMessage.innerHTML = '<div class="alert alert-danger">Пароли не совпадают.</div>';
        return;
    }

    // Данные, которые отправляем на сервер
    const userData = {
        login: login,
        fio: fio,
        password: password,
        password_repeat: passwordRepeat
    };

    try {
        // Отправка данных на сервер через fetch
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        // Обработка ответа от сервера
        const result = await response.json();

        if (response.ok) {
            // Регистрация прошла успешно
            errorMessage.innerHTML = '<div class="alert alert-success">Регистрация прошла успешно! Вы можете войти в свой аккаунт.</div>';

            // Очищаем поля ввода
            document.getElementById('login').value = '';
            document.getElementById('fio').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password_repeat').value = '';
        } else {
            // Ошибка на сервере
            errorMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        // Ошибка при отправке запроса
        console.error('Error during registration:', error);
        errorMessage.innerHTML = '<div class="alert alert-danger">Произошла ошибка при регистрации. Попробуйте позже.</div>';
    }
}
