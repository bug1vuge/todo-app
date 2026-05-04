// import React, { useEffect, useState } from "react";
// import { Layout, Button, message } from "antd";
// import { UserOutlined } from "@ant-design/icons";
// import { useAppDispatch, useAppSelector } from "../hooks";
// import { clearTasks, fetchTasks, moveTask } from "../features/tasks/tasksSlice";
// import { fetchSettings } from "../features/settings/settingsSlice";
// import KanbanBoard from "../features/tasks/KanbanBoard";
// import TaskForm from "../features/tasks/TaskForm";
// import BackgroundSettingsModal from "../features/settings/BackgroundSettingsModal";
// import { logout } from "../features/auth/authSlice";
// import { type DragEndEvent } from "@dnd-kit/core";
// import "./Dashboard.css";

// const { Header, Content } = Layout;

// const Dashboard: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const { user, initialized } = useAppSelector((s) => s.auth);
//   const { tasks, status: tasksStatus } = useAppSelector((s) => s.tasks);
//   const { settings, status: settingsStatus } = useAppSelector((s) => s.settings);
//   const [openTaskForm, setOpenTaskForm] = useState(false);
//   const [openBackgroundModal, setOpenBackgroundModal] = useState(false);
//   const [editingTask, setEditingTask] = useState<any | null>(null);

//   useEffect(() => {
//     if (initialized && user) {
//       if (tasksStatus === "idle") {
//         dispatch(fetchTasks(user.uid));
//       }
//       if (settingsStatus === "idle") {
//         dispatch(fetchSettings(user.uid));
//       }
//     }
//   }, [dispatch, user, initialized, tasksStatus, settingsStatus]);

//   const handleLogout = async () => {
//     await dispatch(logout());
//     dispatch(clearTasks());
//     message.info("Вы вышли");
//   };

//   const handleTaskClick = (task: any) => {
//     setEditingTask(task);
//     setOpenTaskForm(true);
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over) return;

//     const taskId = active.id as string;
//     const newStatus = over.id as string;

//     const task = tasks.find((t) => t.id === taskId);
//     if (task && task.status !== newStatus) {
//       dispatch(moveTask({ taskId, newStatus }));
//     }
//   };

//   const handleCloseTaskForm = () => {
//     setOpenTaskForm(false);
//     setEditingTask(null);
//   };

//   // Определяем класс контейнера: если есть пользовательский фон – скрываем градиент
//   const containerClass = settings?.background ? "dashboard-container custom-background" : "dashboard-container";

//   // Стили для пользовательского фона
//   const backgroundStyle = settings?.background?.type === "color"
//     ? { backgroundColor: settings.background.value }
//     : settings?.background?.type === "image"
//     ? { backgroundImage: `url(${settings.background.value})`, backgroundSize: "cover", backgroundPosition: "center" }
//     : {};

//   return (
//     <div className={containerClass} style={backgroundStyle}>
//       <Layout style={{ minHeight: "100vh", background: "transparent" }}>
//         <Header
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             background: "rgba(0,0,0,0.3)",
//             backdropFilter: "blur(8px)",
//           }}
//         >
//           <div style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
//             Todo App
//           </div>
//           <div>
//             <Button
//               type="primary"
//               onClick={() => setOpenBackgroundModal(true)}
//               style={{ marginRight: 8 }}
//             >
//               Изменить фон
//             </Button>
//             <Button
//               type="primary"
//               onClick={() => setOpenTaskForm(true)}
//               style={{ marginRight: 8 }}
//             >
//               Добавить задачу
//             </Button>
//             <Button
//               type="text"
//               icon={<UserOutlined />}
//               onClick={handleLogout} // пока просто выход, потом сделаем профиль
//               style={{ color: "white" }}
//             />
//           </div>
//         </Header>
//         <Content style={{ padding: 24 }}>
//           <KanbanBoard
//             tasks={tasks}
//             onTaskClick={handleTaskClick}
//             onDragEnd={handleDragEnd}
//           />
//         </Content>
//       </Layout>
//       <TaskForm
//         open={openTaskForm}
//         onClose={handleCloseTaskForm}
//         userId={user?.uid ?? ""}
//         editingTask={editingTask}
//       />
//       <BackgroundSettingsModal
//         open={openBackgroundModal}
//         onClose={() => setOpenBackgroundModal(false)}
//         userId={user?.uid ?? ""}
//         currentBackground={settings?.background}
//       />
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState } from "react";
import { Layout, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchTasks, moveTask } from "../features/tasks/tasksSlice";
import { fetchSettings } from "../features/settings/settingsSlice";
import KanbanBoard from "../features/tasks/KanbanBoard";
import TaskForm from "../features/tasks/TaskForm";
import BackgroundSettingsModal from "../features/settings/BackgroundSettingsModal";
import UserProfileDrawer from "../features/auth/UserProfileDrawer";
import { type DragEndEvent } from "@dnd-kit/core";
import "./Dashboard.css";

const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((s) => s.auth);
  const { tasks, status: tasksStatus } = useAppSelector((s) => s.tasks);
  const { settings, status: settingsStatus } = useAppSelector((s) => s.settings);
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [openBackgroundModal, setOpenBackgroundModal] = useState(false);
  const [openProfileDrawer, setOpenProfileDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  useEffect(() => {
    if (initialized && user) {
      if (tasksStatus === "idle") {
        dispatch(fetchTasks(user.uid));
      }
      if (settingsStatus === "idle") {
        dispatch(fetchSettings(user.uid));
      }
    }
  }, [dispatch, user, initialized, tasksStatus, settingsStatus]);

  const handleTaskClick = (task: any) => {
    setEditingTask(task);
    setOpenTaskForm(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      dispatch(moveTask({ taskId, newStatus }));
    }
  };

  const handleCloseTaskForm = () => {
    setOpenTaskForm(false);
    setEditingTask(null);
  };

  // Определяем класс контейнера и стили фона
  const containerClass = settings?.background ? "dashboard-container custom-background" : "dashboard-container";
  const backgroundStyle = settings?.background?.type === "color"
    ? { backgroundColor: settings.background.value }
    : settings?.background?.type === "image"
    ? { backgroundImage: `url(${settings.background.value})`, backgroundSize: "cover", backgroundPosition: "center" }
    : {};

  return (
    <div className={containerClass} style={backgroundStyle}>
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
            Todo App
          </div>
          <div>
            <Button
              type="primary"
              onClick={() => setOpenBackgroundModal(true)}
              style={{ marginRight: 8 }}
            >
              Изменить фон
            </Button>
            <Button
              type="primary"
              onClick={() => setOpenTaskForm(true)}
              style={{ marginRight: 8 }}
            >
              Добавить задачу
            </Button>
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => setOpenProfileDrawer(true)}
              style={{ color: "white", marginLeft: 8 }}
            />
          </div>
        </Header>
        <Content style={{ padding: 24 }}>
          <KanbanBoard
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onDragEnd={handleDragEnd}
          />
        </Content>
      </Layout>
      <TaskForm
        open={openTaskForm}
        onClose={handleCloseTaskForm}
        userId={user?.uid ?? ""}
        editingTask={editingTask}
      />
      <BackgroundSettingsModal
        open={openBackgroundModal}
        onClose={() => setOpenBackgroundModal(false)}
        userId={user?.uid ?? ""}
        currentBackground={settings?.background}
      />
      <UserProfileDrawer
        open={openProfileDrawer}
        onClose={() => setOpenProfileDrawer(false)}
        user={user}
      />
    </div>
  );
};

export default Dashboard;