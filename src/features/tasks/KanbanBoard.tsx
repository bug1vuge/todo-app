import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { addColumnAsync } from '../columns/columnsSlice';
import ColumnModal from '../columns/ColumnModal';
import Column from './Column';
import type { Task } from './tasksSlice';
import type { Column as ColumnType } from '../columns/columnsSlice';

interface KanbanBoardProps {
  columns: ColumnType[];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  tasks,
  onTaskClick,
  onDragEnd,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleAddColumn = async (title: string) => {
    if (!user) return;
    try {
      await dispatch(addColumnAsync({ userId: user.uid, title })).unwrap();
      message.success('Колонка добавлена');
    } catch {
      message.error('Ошибка при добавлении колонки');
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '16px',
            overflowX: 'auto',
            padding: '4px 8px 16px 4px',
            alignItems: 'flex-start',
            height: '100%',
          }}
          className="kanban-scrollbar"
        >
          {columns.map((col, index) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  flex: '0 0 calc(25% - 12px)',
                }}
              >
                <Column
                  id={col.id}
                  title={col.title}
                  tasks={columnTasks}
                  onTaskClick={onTaskClick}
                />
              </div>
            );
          })}
          <div
            style={{
              flex: '0 0 calc(25% - 12px)',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px dashed rgba(255,255,255,0.3)',
              alignSelf: 'flex-start',
              minHeight: '200px',
            }}
            onClick={() => setModalOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.border = '1px dashed rgba(255,255,255,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.border = '1px dashed rgba(255,255,255,0.3)';
            }}
          >
            <PlusOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)' }} />
          </div>
        </div>
      </DndContext>

      <ColumnModal
        open={modalOpen}
        mode="create"
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddColumn}
      />
    </>
  );
};

export default KanbanBoard;