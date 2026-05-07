import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { useAppDispatch } from '../../hooks';
import { addMemberToBoard } from './boardsSlice';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ open, onClose, boardId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleAdd = async () => {
    if (!email.trim()) {
      message.error('Введите email пользователя');
      return;
    }
    setLoading(true);
    try {
      await dispatch(addMemberToBoard({ boardId, email: email.trim() })).unwrap();
      message.success('Пользователь добавлен к доске');
      setEmail('');
      onClose();
    } catch (err: any) {
      message.error(err.message || 'Ошибка добавления пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Добавить пользователя к доске"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Отмена</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleAdd}>Добавить</Button>,
      ]}
    >
      <Input
        placeholder="Email пользователя"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onPressEnter={handleAdd}
        autoFocus
      />
      <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
        Введите email зарегистрированного пользователя. После добавления он сможет полностью управлять доской.
      </div>
    </Modal>
  );
};

export default AddMemberModal;