// Функция для добавления кнопки "Выйти" в навигацию, если пользователь авторизован
function checkUserAndChangeNav() {
    fetch("/api/user", {
        method: "GET",
        credentials: "same-origin", // Отправляем cookie с запросом для проверки сессии
    })
        .then(response => {
            if (!response.ok) {
                // Если статус ответа не 200, значит пользователь не авторизован
                return null; // Просто возвращаем null, чтобы не добавлять кнопку
            }
            return response.json(); // Получаем информацию о пользователе
        })
        .then(data => {
            if (data) {
                // Если данные о пользователе получены, добавляем кнопку "Выйти"
                changeNav();
            }
        })
        .catch(error => {
            console.error("Ошибка при запросе информации о пользователе:", error);
        });
}

// Функция для добавления кнопки "Выйти" в навигацию
function changeNav() {
    try {
        const nav = document.getElementById("navBar");
        if (nav) { // Проверяем, существует ли элемент
            nav.innerHTML += `<a id="logOrProfBut" onclick="logout()" class="btn-getstarted" href="./login.html"><b>Выйти</b></a>`
        } else {
            console.log("Навигационная панель не найдена.");
        }
    } catch (error) {
        console.log("Ошибка при добавлении кнопки выхода:", error);
    }
}

// Функция для выхода из аккаунта
function logout() {
    fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin", // Обеспечивает отправку cookies с запросом
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Выход успешен") {
                alert("Вы успешно вышли из системы!");
                window.location.href = "/login.html"; // Перенаправляем на страницу входа
            } else {
                alert("Ошибка при выходе: " + data.message);
            }
        })
        .catch(error => {
            console.error("Ошибка при запросе на сервер:", error);
            alert("Ошибка при выходе из системы");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    checkUserAndChangeNav(); // Вызываем функцию сразу после загрузки страницы
});
