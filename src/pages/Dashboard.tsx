import React, { useEffect, useState } from 'react';
import { Layout, Button, message, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchTasks, moveTask } from '../features/tasks/tasksSlice';
import { fetchSettings } from '../features/settings/settingsSlice';
import { loadColumns } from '../features/columns/columnsSlice';
import KanbanBoard from '../features/tasks/KanbanBoard';
import TaskForm from '../features/tasks/TaskForm';
import BackgroundSettingsModal from '../features/settings/BackgroundSettingsModal';
import UserProfileDrawer from '../features/auth/UserProfileDrawer';
import { type DragEndEvent } from '@dnd-kit/core';
import type { Task } from '../features/tasks/tasksSlice';
import './Dashboard.css';

const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((s) => s.auth);
  const { tasks, status: tasksStatus } = useAppSelector((s) => s.tasks);
  const { settings, status: settingsStatus } = useAppSelector((s) => s.settings);
  const { columns, loading: columnsLoading } = useAppSelector((s) => s.columns);

  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [openBackgroundModal, setOpenBackgroundModal] = useState(false);
  const [openProfileDrawer, setOpenProfileDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Загружаем колонки, задачи и настройки только один раз после инициализации авторизации
  useEffect(() => {
    if (initialized && user) {
      if (columnsLoading === false && columns.length === 0) {
        // загружаем колонки, если они ещё не загружены и массив пуст (не было дефолтных)
        dispatch(loadColumns(user.uid));
      }
      if (tasksStatus === 'idle') {
        dispatch(fetchTasks(user.uid));
      }
      if (settingsStatus === 'idle') {
        dispatch(fetchSettings(user.uid));
      }
    }
  }, [dispatch, user, initialized, columnsLoading, columns.length, tasksStatus, settingsStatus]);

  useEffect(() => {
    if (tasksStatus === 'failed') {
      message.error('Не удалось загрузить задачи. Попробуйте обновить страницу.');
    }
  }, [tasksStatus]);

  const handleTaskClick = (task: Task) => {
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

  const getBackgroundStyle = () => {
    if (!settings?.background) return {};
    if (settings.background.type === 'color') {
      return { backgroundColor: settings.background.value };
    }
    if (settings.background.type === 'image') {
      return {
        backgroundImage: `url(${settings.background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    return {};
  };

  const containerStyle = {
    ...getBackgroundStyle(),
    minHeight: '100vh',
  };

  // Показываем спиннер, пока загружаются колонки или задачи (но не включаем индикатор, если уже есть данные)
  const isLoading = !initialized || columnsLoading || tasksStatus === 'loading';

  if (isLoading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Загрузка колонок и задач..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={containerStyle}>
      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
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
              style={{ color: 'white', marginLeft: 8 }}
            />
          </div>
        </Header>
        <Content style={{ padding: 24, height: '100%' }}>
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onDragEnd={handleDragEnd}
          />
        </Content>
      </Layout>
      <TaskForm
        open={openTaskForm}
        onClose={handleCloseTaskForm}
        userId={user?.uid ?? ''}
        editingTask={editingTask}
      />
      <BackgroundSettingsModal
        open={openBackgroundModal}
        onClose={() => setOpenBackgroundModal(false)}
        userId={user?.uid ?? ''}
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