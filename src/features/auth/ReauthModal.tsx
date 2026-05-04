import React, { useState } from "react";
import { Modal, Input, Form, message } from "antd";

interface ReauthModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
}

const ReauthModal: React.FC<ReauthModalProps> = ({
  open,
  onCancel,
  onConfirm,
  title,
}) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!password) {
      message.error("Введите пароль");
      return;
    }
    setLoading(true);
    try {
      await onConfirm(password);
      setPassword("");
      onCancel(); // закрываем после успеха
    } catch (error) {
      // ошибка уже обработана в onConfirm (показывает message.error)
      console.error(error);
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
      destroyOnClose
    >
      <Form>
        <Form.Item label="Текущий пароль" required>
          <Input.Password
            placeholder="Введите ваш текущий пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            onPressEnter={handleOk}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReauthModal;