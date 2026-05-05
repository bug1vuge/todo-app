import React, { useState, useEffect } from 'react';
import { Modal, Input, message, Button, Space } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../hooks';
import { deleteColumnWithTasks } from './columnsSlice';

const { confirm } = Modal;

interface ColumnModalProps {
  open: boolean;
  initialTitle?: string;
  mode: 'create' | 'edit';
  columnId?: string;
  boardId: string;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

const ColumnModal: React.FC<ColumnModalProps> = ({
  open,
  initialTitle = '',
  mode,
  columnId,
  boardId,
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

  const handleDelete = () => {
    if (!columnId || !boardId) return;
    confirm({
      title: 'Удалить колонку?',
      icon: <ExclamationCircleOutlined />,
      content: 'Все задачи из этой колонки будут перемещены в колонку «Сделать». Отменить нельзя.',
      okText: 'Да',
      cancelText: 'Нет',
      width: 520,
      zIndex: 2000,
      onOk: async () => {
        try {
          await dispatch(deleteColumnWithTasks({ boardId, columnId })).unwrap();
          message.success('Колонка удалена, задачи перемещены в "Сделать"');
          onClose();
        } catch {
          message.error('Ошибка при удалении колонки');
        }
      },
    });
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
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Удалить колонку
            </Button>
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