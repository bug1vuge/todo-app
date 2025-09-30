import React from "react";
import { Navigate } from "react-router-dom"; // Для перенаправления на другой маршрут
import { useAppSelector } from "../hooks"; // Хук для доступа к состоянию Redux
import "../App.css"; // Подключение стилей

// Интерфейс пропсов: ProtectedRoute ожидает дочерние элементы
interface Props {
  children: React.ReactNode;
}

// Компонент защищённого маршрута
const ProtectedRoute: React.FC<Props> = ({ children }) => {
  // Получаем пользователя и статус инициализации из Redux состояния auth
  const { user, initialized } = useAppSelector((s) => s.auth);

  // Если данные auth ещё не загружены, показываем экран загрузки
  if (!initialized) {
    return (
      <div className="loader-overlay">
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) return <Navigate to="/login" replace />;

  // Если пользователь авторизован, отображаем дочерние компоненты маршрута
  return <>{children}</>;
};

export default ProtectedRoute;
