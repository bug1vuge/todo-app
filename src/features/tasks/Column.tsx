import React, { useState } from 'react';
import { Typography, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateColumnTitleAsync } from '../columns/columnsSlice';
import ColumnModal from '../columns/ColumnModal';
import SortableTaskCard from './SortableTaskCard';
import type { Task } from './tasksSlice';

const { Title } = Typography;

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks, onTaskClick }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { setNodeRef, isOver } = useDroppable({ id });
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = async (newTitle: string) => {
    if (newTitle === title || !user) return;
    try {
      await dispatch(updateColumnTitleAsync({ userId: user.uid, columnId: id, newTitle })).unwrap();
      message.success('Название обновлено');
    } catch {
      message.error('Ошибка при обновлении названия');
    }
  };

  const columnStyle: React.CSSProperties = {
    background: isOver ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: 12,
    padding: 12,
    transition: 'background 0.2s, border 0.2s',
    border: isOver ? '2px dashed rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.3)',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '200px',
  };

  return (
    <>
      <div ref={setNodeRef} style={columnStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <Title level={5} style={{ color: 'white', margin: 0, fontSize: '1rem' }}>
            {title}
          </Title>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setModalOpen(true)}
            style={{ color: 'white', padding: '0 4px', height: 'auto' }}
            size="small"
          />
        </div>

        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </SortableContext>

        <div style={{ marginTop: 'auto', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          {tasks.length === 0 && 'Нет задач'}
          {tasks.length === 1 && '1 задача'}
          {tasks.length > 1 && `${tasks.length} задач`}
        </div>
      </div>

      <ColumnModal
        open={modalOpen}
        mode="edit"
        initialTitle={title}
        columnId={id}
        userId={user?.uid}
        onClose={() => setModalOpen(false)}
        onConfirm={handleEdit}
      />
    </>
  );
};

export default Column;