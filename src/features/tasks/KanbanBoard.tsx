import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Column from "./Column";
import type { Task } from "./tasksSlice";

const COLUMNS = [
  { id: "Planned", title: "Сделать" },
  { id: "InProgress", title: "В процессе" },
  { id: "Done", title: "Сделано" },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onDragEnd,
}) => {
  // Настраиваем сенсор с задержкой, чтобы избежать случайного перетаскивания при скролле
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // активация только после смещения на 5px
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log("🚀 Drag started:", event.active.id);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <div style={{ display: "flex", gap: "16px", overflowX: "auto", padding: "4px 0" }}>
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          return (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;