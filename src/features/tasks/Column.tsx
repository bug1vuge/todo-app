import React, { useState, useRef, useEffect } from 'react';
import { Typography, Button, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
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
  searchQuery: string;
  highlightedTaskId: string | null;
  onAddTask: () => void;
  taskRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  searchQuery,
  highlightedTaskId,
  onAddTask,
  taskRefs,
}) => {
  const dispatch = useAppDispatch();
  const { currentBoardId } = useAppSelector((s) => s.boards);
  const { setNodeRef, isOver } = useDroppable({ id });
  const [modalOpen, setModalOpen] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  const handleEdit = async (newTitle: string) => {
    if (newTitle === title || !currentBoardId) return;
    try {
      await dispatch(updateColumnTitleAsync({ boardId: currentBoardId, columnId: id, newTitle })).unwrap();
      message.success('Название обновлено');
    } catch {
      message.error('Ошибка при обновлении названия');
    }
  };

  useEffect(() => {
    if (highlightedTaskId && tasks.some(t => t.id === highlightedTaskId) && columnRef.current) {
      columnRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightedTaskId, tasks]);

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
    <div ref={columnRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
        Задач в колонке: {tasks.length}
      </div>

      <div ref={setNodeRef} style={columnStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                ref={(el) => {
                  if (el) taskRefs.current.set(task.id, el);
                  else taskRefs.current.delete(task.id);
                }}
              >
                <SortableTaskCard
                  task={task}
                  onClick={() => onTaskClick(task)}
                  isHighlighted={highlightedTaskId === task.id}
                  searchQuery={searchQuery}
                />
              </div>
            ))}
          </div>
        </SortableContext>

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onAddTask}
          style={{
            marginTop: 12,
            width: '100%',
            background: 'rgba(255,255,255,0.1)',
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'white',
          }}
        >
          Добавить задачу
        </Button>
      </div>

      <ColumnModal
        open={modalOpen}
        mode="edit"
        initialTitle={title}
        columnId={id}
        boardId={currentBoardId!}
        onClose={() => setModalOpen(false)}
        onConfirm={handleEdit}
      />
    </div>
  );
};

export default Column;