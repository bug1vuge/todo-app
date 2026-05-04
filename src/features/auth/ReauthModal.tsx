import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";

interface ReauthModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
}

const ReauthModal: React.FC<ReauthModalProps> = ({ open, onCancel, onConfirm, title }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onConfirm(values.password);
      form.resetFields();
      onCancel();
    } catch (error: any) {
      message.error(error.message || "Ошибка подтверждения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Подтвердить"
      cancelText="Отмена"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="password"
          label="Введите текущий пароль"
          rules={[{ required: true, message: "Пожалуйста, введите пароль" }]}
        >
          <Input.Password placeholder="Текущий пароль" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReauthModal;