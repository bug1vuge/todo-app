import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { addTask, updateTask } from "./tasksSlice";

// Интерфейс пропсов для компонента TaskForm
interface TaskFormProps {
  open: boolean; // флаг, открыта ли модальная форма
  onClose: () => void; // функция закрытия модалки
  userId: string; // id пользователя для новой задачи
  taskToEdit?: { // если передан — форма для редактирования
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
  };
}

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, taskToEdit }) => {
  const dispatch = useAppDispatch(); // подключение к Redux для диспатча действий
  const user = useAppSelector((s) => s.auth.user); // получение текущего пользователя из состояния
  const [form] = Form.useForm(); // создание экземпляра формы Ant Design

  // useEffect отвечает за инициализацию полей формы при открытии модалки
  useEffect(() => {
    if (!open) {
      // если форма закрыта — сбрасываем поля
      form.resetFields();
      return;
    }

    if (taskToEdit) {
      // если редактируем задачу — заполняем поля текущими данными
      form.setFieldsValue({
        title: taskToEdit.title,
        description: taskToEdit.description,
        priority: taskToEdit.priority,
      });
    } else {
      // если создаём новую задачу — очищаем форму
      form.resetFields();
    }
  }, [taskToEdit, form, open]);

  // Функция отправки формы
  const handleSubmit = async () => {
    try {
      // валидируем все поля формы
      const values = await form.validateFields();

      if (!user) return; // если нет пользователя — выходим

      if (taskToEdit) {
        // редактирование существующей задачи
        await dispatch(
          updateTask({
            id: taskToEdit.id,
            updates: {
              title: values.title,
              description: values.description,
              priority: values.priority,
            },
          })
        ).unwrap(); // unwrap позволяет отловить ошибку через try/catch

        message.success("Задача успешно отредактирована"); // уведомление об успехе
      } else {
        // создание новой задачи
        await dispatch(
          addTask({
            title: values.title,
            description: values.description,
            priority: values.priority,
            userId: user.uid,
          })
        ).unwrap();

        message.success("Задача успешно создана"); // уведомление об успехе
      }

      form.resetFields(); // очищаем форму
      onClose(); // закрываем модалку
    } catch (error: any) {
      // обработка ошибок: отображаем сообщение пользователю
      message.error(error?.message || "Не удалось сохранить задачу");
    }
  };

  return (
    <Modal
      title={taskToEdit ? "Редактировать задачу" : "Новая задача"} // заголовок зависит от режима
      open={open} // состояние открытия модалки
      onCancel={onClose} // закрытие при клике на крестик
      destroyOnHidden // очищает содержимое при закрытии
      forceRender // принудительно рендерит содержимое, чтобы message и useForm корректно работали
      footer={[
        <Button key="cancel" onClick={onClose}>
          Отмена
        </Button>,
        <Button key="ok" type="primary" onClick={handleSubmit}>
          {taskToEdit ? "Сохранить" : "Добавить"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {/* Поле для ввода названия задачи */}
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input />
        </Form.Item>

        {/* Поле для ввода описания задачи */}
        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* Выбор приоритета задачи */}
        <Form.Item
          name="priority"
          label="Приоритет"
          initialValue="medium"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "low", label: "Низкий" },
              { value: "medium", label: "Средний" },
              { value: "high", label: "Высокий" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;
