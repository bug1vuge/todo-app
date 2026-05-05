import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import type { Task } from './tasksSlice';

interface SortableTaskCardProps {
  task: Task;
  onClick: () => void;
  isHighlighted: boolean;
  searchQuery: string;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onClick, isHighlighted, searchQuery }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
    boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.3)' : 'none',
    ...(isHighlighted ? { backgroundColor: 'rgba(255, 255, 0, 0.3)', borderRadius: 8, transition: 'background 0.2s' } : {}),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} searchQuery={searchQuery} />
    </div>
  );
};

export default SortableTaskCard;