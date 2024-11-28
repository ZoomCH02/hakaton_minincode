@echo off
REM Генерация SSH-ключей
ssh-keygen -t rsa -f ~/.ssh/id_rsa -N ""

REM Установка SSH-туннеля
start /B ssh -R 80:127.0.0.1:3000 localhost.run

REM Запуск сервера с помощью npm
start /B npm run dev

REM Ожидание завершения процессов
wait
