import React, { useState, useEffect } from 'react';
import { Modal, Input, message, Button, Space, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../hooks';
import { deleteColumnWithTasks } from './columnsSlice';

interface ColumnModalProps {
  open: boolean;
  initialTitle?: string;
  mode: 'create' | 'edit';
  columnId?: string;
  userId?: string;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

const ColumnModal: React.FC<ColumnModalProps> = ({
  open,
  initialTitle = '',
  mode,
  columnId,
  userId,
  onClose,
  onConfirm,
}) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
    }
  }, [open, initialTitle]);

  const handleOk = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      message.warning('Название не может быть пустым');
      return;
    }
    onConfirm(trimmed);
    onClose();
  };

  const handleDelete = async () => {
    if (!columnId || !userId) return;
    try {
      await dispatch(deleteColumnWithTasks({ columnId, userId })).unwrap();
      message.success('Колонка удалена, задачи перемещены в "Сделать"');
      onClose();
    } catch {
      message.error('Ошибка при удалении колонки');
    }
  };

  const titleText = mode === 'create' ? 'Создание колонки' : 'Редактирование колонки';

  return (
    <Modal
      title={titleText}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Сохранить"
      cancelText="Отмена"
      destroyOnClose
      footer={(
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {mode === 'edit' && (
            <Popconfirm
              title="Удалить колонку?"
              description="Все задачи из этой колонки будут перемещены в колонку «Сделать». Отменить нельзя."
              onConfirm={handleDelete}
              okText="Да"
              cancelText="Нет"
            >
              <Button danger icon={<DeleteOutlined />}>Удалить колонку</Button>
            </Popconfirm>
          )}
          <Space>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="primary" onClick={handleOk}>Сохранить</Button>
          </Space>
        </div>
      )}
    >
      <Input
        placeholder="Введите название колонки"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onPressEnter={handleOk}
        autoFocus
      />
    </Modal>
  );
};

export default ColumnModal;