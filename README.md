# Todo App

Простое приложение для управления задачами с регистрацией, авторизацией и Firebase в качестве бэкенда.

## Стек технологий

- React + TypeScript  
- Redux Toolkit  
- Firebase (Authentication + Firestore + Hosting)  
- Ant Design (UI)  
- Vite (сборка)

## Структура проекта

src/
 ├─ api/            # Инициализация Firebase
 ├─ features/
 │   ├─ auth/       # Слайсы и страницы аутентификации
 │   └─ tasks/      # Логика задач и компоненты
 ├─ pages/          # Страницы Login, Register, Dashboard
 ├─ components/     # ProtectedRoute, UI компоненты
 ├─ hooks/          # Redux hooks
 └─ App.tsx         # Основной роутинг

 ## Инструкция по запуску

 1. Клонировать репозиторий:
    git clone https://github.com/bug1vuge/todo-app
 2. Переходим в папке проекта:
    cd todo-app
 3. Устанавливаем зависимости:
    npm install
 4. Ключевые команды:
    npm run dev - локальный запуск для разработки. После выполнения команды в консоли станет доступна ссылка для перехода.
    npm run build - сборка проекта.
    


