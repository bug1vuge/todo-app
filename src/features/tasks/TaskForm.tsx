import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Radio, Space, message } from "antd";
import { useAppDispatch } from "../../hooks";
import { addTask, updateTask, deleteTask } from "./tasksSlice";

const priorityOptions = [
  { value: "Low", color: "green", label: "Не горит" },
  { value: "Medium", color: "gold", label: "Стоило бы начать" },
  { value: "High", color: "red", label: "Горит!" },
];

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  editingTask?: any | null;
}

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  userId,
  editingTask,
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && editingTask) {
      form.setFieldsValue({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ priority: "Low" });
    }
  }, [open, editingTask, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Гарантируем, что description не undefined
      const taskData = {
        title: values.title,
        description: values.description || "",
        priority: values.priority,
      };

      if (editingTask) {
        await dispatch(
          updateTask({
            id: editingTask.id,
            ...taskData,
          })
        ).unwrap();
        message.success("Задача обновлена");
      } else {
        await dispatch(
          addTask({
            userId,
            ...taskData,
            status: "Planned",
          })
        ).unwrap();
        message.success("Задача создана");
      }
      onClose();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      message.error("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    setLoading(true);
    try {
      await dispatch(deleteTask(editingTask.id)).unwrap();
      message.success("Задача удалена");
      onClose();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      message.error("Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingTask ? "Редактировать задачу" : "Новая задача"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Название задачи" />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} placeholder="Описание (необязательно)" />
        </Form.Item>

        <Form.Item name="priority" label="Приоритет">
          <Radio.Group>
            <Space direction="horizontal">
              {priorityOptions.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                  <span style={{ color: opt.color }}>⬤</span> {opt.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          {editingTask && (
            <Button danger onClick={handleDelete} loading={loading} style={{ marginRight: 8 }}>
              Удалить
            </Button>
          )}
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editingTask ? "Сохранить" : "Создать"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;