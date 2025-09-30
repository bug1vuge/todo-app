import React, { useState } from "react";
import { List, Button, Tag, Radio, Input, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { removeTask, updateTask, type Task } from "./tasksSlice";
import TaskForm from "./TaskForm";

const { Search } = Input;

const TaskList: React.FC<{ loading?: boolean }> = ({ loading }) => {
  const tasks = useAppSelector((s) => s.tasks.items); // получаем все задачи из Redux
  const dispatch = useAppDispatch(); // получаем dispatch для отправки действий

  // Локальное состояние для редактируемой задачи
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // Фильтр задач: все, активные или выполненные
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  // Строка поиска
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Фильтруем задачи по выбранному фильтру
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active" && task.completed) return false;
    if (filter === "completed" && !task.completed) return false;
    return true;
  });

  // Фильтруем задачи по поисковому запросу
  const searchedTasks = filteredTasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.description?.toLowerCase().includes(query) ?? false)
    );
  });

  // Переключение статуса выполнения задачи
  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      // Обновляем задачу в Redux
      await dispatch(updateTask({ id, updates: { completed: !completed } })).unwrap();
      // Показ сообщения об успешной операции
      message.success(completed ? "Задача возобновлена" : "Задача выполнена");
    } catch {
      // Сообщение об ошибке
      message.error("Не удалось изменить статус задачи");
    }
  };

  // Удаление задачи
  const handleDelete = async (id: string) => {
    try {
      // Отправляем действие удаления в Redux
      await dispatch(removeTask(id)).unwrap();
      // Показ сообщения об успешной операции
      message.success("Задача успешно удалена");
    } catch {
      // Сообщение об ошибке
      message.error("Не удалось удалить задачу");
    }
  };

  return (
    <>
      {/* Панель фильтров и поиска */}
      <div className="top-panel" style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)}>
          <Radio.Button value="all">Все</Radio.Button>
          <Radio.Button value="active">Активные</Radio.Button>
          <Radio.Button value="completed">Выполненные</Radio.Button>
        </Radio.Group>
        <Search
          className="top-panel__search"
          placeholder="Поиск задач..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      {/* Список задач */}
      <List
        loading={loading} // отображение спиннера при загрузке
        bordered
        dataSource={searchedTasks} // данные для отображения
        renderItem={(task) => {
          const createdStr = task.createdAt
            ? new Date(task.createdAt).toLocaleString("ru-RU")
            : "—"; // форматирование даты создания задачи
          return (
            <List.Item
              key={task.id}
              actions={[
                // Кнопка переключения статуса
                <Button key="toggle" size="small" onClick={() => toggleComplete(task.id, task.completed)}>
                  {task.completed ? "Возобновить" : "Выполнить"}
                </Button>,
                // Кнопка редактирования
                <Button key="edit" size="small" onClick={() => setEditingTask(task)}>
                  Редактировать
                </Button>,
                // Кнопка удаления
                <Button key="delete" size="small" danger onClick={() => handleDelete(task.id)}>
                  Удалить
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <>
                    {task.title}{" "}
                    {task.priority && (
                      <Tag
                        color={task.priority === "high" ? "red" : task.priority === "medium" ? "blue" : "green"}
                      >
                        {task.priority}
                      </Tag>
                    )}
                  </>
                }
                description={
                  <>
                    <div>{task.description}</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#888" }}>Создано: {createdStr}</div>
                  </>
                }
              />
            </List.Item>
          );
        }}
      />

      {/* Форма редактирования задачи */}
      {editingTask && (
        <TaskForm
          open={!!editingTask} // модалка открыта, если есть редактируемая задача
          onClose={() => setEditingTask(null)} // закрытие модалки
          userId={editingTask.userId} // передаем userId для TaskForm
          taskToEdit={editingTask} // передаем задачу для редактирования
        />
      )}
    </>
  );
};

export default TaskList;
