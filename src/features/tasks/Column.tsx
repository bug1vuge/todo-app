import React from "react";
import { Typography } from "antd";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableTaskCard from "./SortableTaskCard";
import type { Task } from "./tasksSlice";

const { Title } = Typography;

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Стили колонки с подсветкой при наведении перетаскиваемой карточки
  const columnStyle = {
    flex: 1,
    minWidth: 300,
    
    background: isOver ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
    backdropFilter: "blur(8px)",
    borderRadius: 12,
    padding: 12,
    transition: "background 0.2s",
    border: isOver ? "2px dashed rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.3)",
  };

  return (
    <div ref={setNodeRef} style={columnStyle}>
      <Title level={4} style={{ color: "white", marginTop: 0, marginBottom: 16 }}>
        {title} ({tasks.length})
      </Title>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default Column;