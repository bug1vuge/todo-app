import React from "react";
import { Card, Tag } from "antd";
import type { Task } from "./tasksSlice";

const priorityColors = {
  Low: "green",
  Medium: "gold",
  High: "red",
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <Card
      size="small"
      style={{
        cursor: "pointer",
        background: "rgba(255,255,255,0.15)",
        borderColor: "rgba(255,255,255,0.3)",
        color: "white",
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 500 }}>{task.title}</span>
        <Tag color={priorityColors[task.priority]} style={{ marginLeft: 8 }}>
          {task.priority}
        </Tag>
      </div>
      {task.description && (
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
          {task.description.substring(0, 50)}
          {task.description.length > 50 && "..."}
        </div>
      )}
    </Card>
  );
};

export default TaskCard;