import React, { useEffect, useState } from "react";
import { Layout, Button, message } from "antd";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearTasks, fetchTasks } from "../features/tasks/tasksSlice";
import TaskList from "../features/tasks/TaskList";
import TaskForm from "../features/tasks/TaskForm";
import { logout } from "../features/auth/authSlice";

const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  // Получаем пользователя и статус инициализации из authSlice
  const { user, initialized } = useAppSelector((s) => s.auth);

  // Получаем статус задач из tasksSlice
  const tasksStatus = useAppSelector((s) => s.tasks.status);

  // Состояние для управления открытием формы добавления/редактирования задачи
  const [open, setOpen] = useState(false);

  // Загрузка задач при инициализации компонента
  useEffect(() => {
    // Проверяем, что пользователь авторизован и статус задач "idle"
    if (initialized && user && tasksStatus === "idle") {
      dispatch(fetchTasks(user.uid)); // Диспатчим thunk для получения задач
    }
  }, [dispatch, user, initialized, tasksStatus]);

  // Обработчик выхода из аккаунта
  const handleLogout = async () => {
    await dispatch(logout()); // Логаут через Firebase
    dispatch(clearTasks());   // Очистка задач из Redux
    message.info("Вы вышли"); // Всплывающее уведомление об успешном выходе
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Хедер приложения */}
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}
      >
        {/* Логотип */}
        <div className="logo" style={{ fontSize: 20, fontWeight: "bold" }}>Todo App</div>

        {/* Кнопки управления */}
        <div>
          {/* Кнопка открытия формы добавления задачи */}
          <Button
            type="primary"
            onClick={() => setOpen(true)}
            style={{ marginRight: 8 }}
          >
            Добавить задачу
          </Button>

          {/* Кнопка выхода из аккаунта */}
          <Button onClick={handleLogout}>Выйти</Button>
        </div>
      </Header>

      {/* Основной контент */}
      <Content style={{ padding: 24 }}>
        {/* Список задач с индикатором загрузки */}
        <TaskList loading={tasksStatus === "loading"} />
      </Content>

      {/* Форма для добавления или редактирования задачи */}
      <TaskForm open={open} onClose={() => setOpen(false)} userId={user?.uid ?? ""} />
    </Layout>
  );
};

export default Dashboard;
