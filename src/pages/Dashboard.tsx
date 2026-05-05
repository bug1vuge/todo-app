import React, { useEffect, useState, useRef } from 'react';
import { Layout, Input, message, Button, Modal as AntModal, Spin, Dropdown } from 'antd';
import { UserOutlined, DownOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchTasks, moveTask } from '../features/tasks/tasksSlice';
import { fetchSettings } from '../features/settings/settingsSlice';
import { loadColumns } from '../features/columns/columnsSlice';
import { loadBoards, addBoard, setCurrentBoard, deleteBoard, updateBoardName } from '../features/boards/boardsSlice';
import KanbanBoard from '../features/tasks/KanbanBoard';
import TaskForm from '../features/tasks/TaskForm';
import UserProfileDrawer from '../features/auth/UserProfileDrawer';
import { type DragEndEvent } from '@dnd-kit/core';
import type { Task } from '../features/tasks/tasksSlice';
import './Dashboard.css';
import '../App.css';

const { Header, Content } = Layout;
const { confirm } = AntModal;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((s) => s.auth);
  const { tasks, status: tasksStatus } = useAppSelector((s) => s.tasks);
  const { settings } = useAppSelector((s) => s.settings);
  const { columns, loading: columnsLoading } = useAppSelector((s) => s.columns);
  const { list: boards, currentBoardId, loading: boardsLoading } = useAppSelector((s) => s.boards);

  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [openProfileDrawer, setOpenProfileDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [pendingColumnStatus, setPendingColumnStatus] = useState<string | undefined>(undefined);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [newBoardModalVisible, setNewBoardModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editBoardModalVisible, setEditBoardModalVisible] = useState(false);
  const [editBoardId, setEditBoardId] = useState<string | null>(null);
  const [editBoardName, setEditBoardName] = useState('');
  const taskRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [hasCreatedDefault, setHasCreatedDefault] = useState(false);
  const hasRestored = useRef(false); // Флаг для восстановления доски

  // Сохраняем текущую доску в localStorage при её изменении
  useEffect(() => {
    if (currentBoardId) {
      localStorage.setItem('lastBoardId', currentBoardId);
    }
  }, [currentBoardId]);

  useEffect(() => {
    if (initialized && user) dispatch(loadBoards(user.uid));
  }, [dispatch, user, initialized]);

  // Создание доски по умолчанию (только если нет досок и загрузка завершена)
  useEffect(() => {
    if (initialized && user && !boardsLoading && boards.length === 0 && !hasCreatedDefault) {
      setHasCreatedDefault(true);
      dispatch(addBoard({ userId: user.uid, name: 'Моя доска' }));
    }
  }, [initialized, user, boardsLoading, boards.length, hasCreatedDefault, dispatch]);

  // Восстанавливаем последнюю выбранную доску после загрузки списка
  useEffect(() => {
    if (!boardsLoading && boards.length > 0 && !hasRestored.current) {
      const lastBoardId = localStorage.getItem('lastBoardId');
      if (lastBoardId && boards.some(b => b.id === lastBoardId)) {
        dispatch(setCurrentBoard(lastBoardId));
      } else if (!currentBoardId) {
        // если нет сохранённой, но currentBoardId ещё не задан, берём первую
        dispatch(setCurrentBoard(boards[0].id));
      }
      hasRestored.current = true;
    }
  }, [boardsLoading, boards, dispatch, currentBoardId]);

  useEffect(() => {
    if (currentBoardId) {
      dispatch(loadColumns({ boardId: currentBoardId }));
      dispatch(fetchTasks(currentBoardId));
      dispatch(fetchSettings(currentBoardId));
    }
  }, [dispatch, currentBoardId]);

  // Debounce поиска
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) setDebouncedQuery(searchQuery);
      else setDebouncedQuery('');
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Поиск и подсветка
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setHighlightedTaskId(null);
      return;
    }
    const query = debouncedQuery.toLowerCase();
    const foundTask = tasks.find(task =>
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
    if (foundTask) {
      setHighlightedTaskId(foundTask.id);
      setTimeout(() => {
        const element = taskRefs.current.get(foundTask.id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setHighlightedTaskId(null);
    }
  }, [debouncedQuery, tasks]);

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setOpenTaskForm(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !currentBoardId) return;
    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      dispatch(moveTask({ taskId, newStatus, boardId: currentBoardId }));
    }
  };

  const handleCloseTaskForm = () => {
    setOpenTaskForm(false);
    setEditingTask(null);
    setPendingColumnStatus(undefined);
  };

  const handleAddTaskInColumn = (status: string) => {
    setPendingColumnStatus(status);
    setEditingTask(null);
    setOpenTaskForm(true);
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !user) return;
    try {
      await dispatch(addBoard({ userId: user.uid, name: newBoardName.trim() })).unwrap();
      message.success('Доска создана');
      setNewBoardModalVisible(false);
      setNewBoardName('');
    } catch {
      message.error('Ошибка создания доски');
    }
  };

  const handleSelectBoard = (boardId: string) => {
    dispatch(setCurrentBoard(boardId));
  };

  // Удаление доски через модальное окно подтверждения
  const handleDeleteBoard = (boardId: string) => {
    if (!user) return;
    confirm({
      title: 'Удалить доску?',
      icon: <ExclamationCircleOutlined />,
      content: 'Все задачи и колонки этой доски будут удалены. Отменить нельзя.',
      okText: 'Да',
      cancelText: 'Нет',
      width: 520,
      zIndex: 2000,
      onOk: async () => {
        try {
          await dispatch(deleteBoard({ userId: user.uid, boardId })).unwrap();
          message.success('Доска удалена');
        } catch {
          message.error('Ошибка удаления доски');
        }
      },
    });
  };

  const openEditModal = (boardId: string, currentName: string) => {
    setEditBoardId(boardId);
    setEditBoardName(currentName);
    setEditBoardModalVisible(true);
  };

  const handleUpdateBoardName = async () => {
    if (!user || !editBoardId) return;
    const trimmed = editBoardName.trim();
    if (!trimmed) {
      message.error('Название не может быть пустым');
      return;
    }
    try {
      await dispatch(updateBoardName({ userId: user.uid, boardId: editBoardId, newName: trimmed })).unwrap();
      message.success('Название обновлено');
      setEditBoardModalVisible(false);
      setEditBoardId(null);
      setEditBoardName('');
    } catch {
      message.error('Ошибка обновления названия');
    }
  };

  const boardMenu = (
    <div style={{ background: '#1f1f2e', borderRadius: 8, padding: '4px 0', minWidth: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      {boards.map(board => (
        <div
          key={board.id}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            color: 'white',
            transition: 'background 0.2s',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: board.id === currentBoardId ? '#1677ff' : 'transparent',
            borderRadius: '4px',
            margin: '2px 4px',
          }}
          onMouseEnter={(e) => {
            if (board.id !== currentBoardId) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            if (board.id !== currentBoardId) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div onClick={() => handleSelectBoard(board.id)} style={{ flex: 1 }}>
            {board.name}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <EditOutlined
              onClick={(e) => { e.stopPropagation(); openEditModal(board.id, board.name); }}
              style={{ color: '#fff', fontSize: 14 }}
            />
            <DeleteOutlined
              onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board.id); }}
              style={{ color: '#ff4d4f', fontSize: 14, cursor: 'pointer' }}
            />
          </div>
        </div>
      ))}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
      <div
        onClick={() => setNewBoardModalVisible(true)}
        style={{ padding: '8px 16px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 8, margin: '2px 4px' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <PlusOutlined /> Создать доску
      </div>
    </div>
  );

  const getBackgroundStyle = () => {
    if (!settings?.background) return {};
    if (settings.background.type === 'color') return { backgroundColor: settings.background.value };
    return {};
  };

  const containerStyle = { ...getBackgroundStyle(), minHeight: '100vh' };
  const isLoading = !initialized || columnsLoading || tasksStatus === 'loading' || boardsLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b0b2b' }}>
        <Spin size="large" />
      </div>
    );
  }

  const currentBoardName = boards.find(b => b.id === currentBoardId)?.name || 'Доски';

  return (
    <div className="dashboard-container" style={containerStyle}>
      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', padding: '0 54px', height: 74 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 200 }}>
            <svg style={{ width: '100%', height: '100%' }} width="231" height="44" viewBox="0 0 231 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_2001_1579)">
                <path d="M150.592 6.4483C150.592 2.95688 153.418 0.126465 156.903 0.126465H224.562C228.047 0.126465 230.874 2.95688 230.874 6.4483V37.5517C230.874 41.0432 228.047 43.8736 224.562 43.8736H156.903C153.418 43.8736 150.592 41.0432 150.592 37.5517V6.4483Z" fill="white" />
                <path d="M16.6523 24.8112H6.40739C5.89254 24.8112 5.51499 24.8972 5.27474 25.0691C5.03448 25.2067 4.88006 25.4818 4.81147 25.8945C4.77697 26.2728 4.75976 26.8059 4.75985 27.4937V37.4496C4.75985 38.1373 4.60542 38.7047 4.29658 39.1518C3.98774 39.5645 3.59306 39.8396 3.11255 39.9772C2.66629 40.1147 2.2029 40.1147 1.72238 39.9772C1.27629 39.8396 0.898779 39.5645 0.589853 39.1518C0.280928 38.7047 0.126465 38.1373 0.126465 37.4496V11.1412C0.126465 9.66253 0.332387 8.4245 0.744232 7.42717C1.19041 6.42992 1.89401 5.69056 2.85504 5.20909C3.8504 4.69323 5.17177 4.4353 6.81915 4.4353H17.785C18.6431 4.4353 19.278 4.67603 19.6899 5.1575C20.1361 5.60458 20.3592 6.1376 20.3592 6.75655C20.3592 7.37558 20.1361 7.92584 19.6899 8.40731C19.278 8.85439 18.6431 9.07793 17.785 9.07793H6.81928C6.13276 9.07793 5.63508 9.12951 5.32624 9.23269C5.05165 9.30147 4.88002 9.49062 4.81135 9.80014C4.77701 10.0753 4.75985 10.5223 4.75985 11.1412V37.4496C4.75985 38.1373 4.60542 38.7047 4.29658 39.1518C3.98774 39.5645 3.59306 39.8396 3.11255 39.9772C2.66629 40.1147 2.2029 40.1147 1.72238 39.9772C1.27629 39.8396 0.898779 39.5645 0.589853 39.1518C0.280928 38.7047 0.126465 38.1373 0.126465 37.4496V28.0096C0.126465 26.7027 0.26376 25.5678 0.538352 24.6049C0.812943 23.6077 1.20762 22.7824 1.72238 22.1289C2.23715 21.4754 2.88929 20.9939 3.67882 20.6844C4.46817 20.3405 5.3777 20.1686 6.40739 20.1686H16.6523C17.5104 20.1686 18.1454 20.4093 18.5572 20.8908C19.0034 21.3379 19.2265 21.8709 19.2265 22.49C19.2265 23.109 19.0034 23.6593 18.5572 24.1407C18.1454 24.5877 17.5104 24.8112 16.6523 24.8112ZM43.1623 39.5129H32.5568C31.0124 39.5129 29.794 39.3925 28.9016 39.1518C28.0092 38.8767 27.3571 38.4124 26.9453 37.7591C26.5335 37.1057 26.276 36.1599 26.173 34.9219C26.07 33.6839 26.0185 32.0847 26.0185 30.1245V6.49862C26.0185 5.63885 26.2416 5.00266 26.6878 4.59005C27.1683 4.14297 27.7175 3.91943 28.3354 3.91943C28.953 3.91943 29.485 4.14297 29.9313 4.59005C30.4118 5.00274 30.652 5.63893 30.652 6.49862V32.3943C30.652 33.1852 30.7207 33.7699 30.8579 34.1481C30.9953 34.492 31.2699 34.6983 31.6817 34.7671C32.0935 34.8359 32.7113 34.8703 33.535 34.8703H43.1623C44.0203 34.8703 44.6552 35.111 45.0671 35.5925C45.5133 36.0396 45.7363 36.5726 45.7363 37.1917C45.7363 37.8107 45.5133 38.3609 45.0671 38.8423C44.6552 39.2894 44.0203 39.5129 43.1623 39.5129ZM62.4827 39.6161C61.3843 39.4097 60.3547 39.1174 59.3937 38.7391C58.4671 38.3264 57.5404 37.8106 56.6137 37.1917C55.1379 36.1599 53.8508 34.8875 52.7526 33.3743C51.6543 31.8611 50.8134 30.1416 50.2299 28.2159C49.6464 26.2557 49.3547 24.1579 49.3547 21.9225C49.3547 18.4147 50.0754 15.3025 51.5169 12.5857C52.9584 9.86896 54.932 7.75397 57.4374 6.24069C59.9428 4.69318 62.7915 3.91943 65.9836 3.91943C69.1755 3.91943 72.007 4.69323 74.4782 6.24081C76.9493 7.7884 78.8885 9.92054 80.2957 12.6372C81.7029 15.3196 82.4065 18.4147 82.4065 21.9225C82.4065 24.0891 82.1319 26.1181 81.5827 28.0096C81.0336 29.901 80.2442 31.6033 79.2146 33.1165C78.1849 34.5952 76.9665 35.8676 75.5593 36.9337C74.5983 37.6558 73.6201 38.2404 72.6247 38.6875C71.6637 39.1002 70.6341 39.4097 69.5358 39.6161C68.6778 39.788 67.9913 39.6849 67.4765 39.3066C66.9617 38.9283 66.6357 38.4468 66.4983 37.8621C66.3954 37.2432 66.4984 36.6758 66.8072 36.1599C67.1505 35.6097 67.7511 35.2486 68.6091 35.0766C69.3986 34.9047 70.1193 34.6811 70.7714 34.406C71.4579 34.0965 72.1271 33.701 72.7792 33.2196C73.8432 32.4287 74.7356 31.4657 75.4563 30.3308C76.2114 29.196 76.7777 27.9236 77.1552 26.5136C77.5671 25.0692 77.773 23.5389 77.773 21.9225C77.773 19.9623 77.4813 18.174 76.8979 16.5577C76.3487 14.9414 75.5593 13.5314 74.5297 12.3277C73.5 11.1241 72.2644 10.1955 70.8229 9.5422C69.3814 8.88878 67.7683 8.56207 65.9836 8.56207C64.1988 8.56207 62.5685 8.88878 61.0927 9.5422C59.6168 10.1956 58.3469 11.1241 57.2829 12.3277C56.219 13.497 55.3953 14.907 54.8119 16.5577C54.2627 18.174 53.9881 19.9623 53.9881 21.9225C53.9881 23.5733 54.1768 25.138 54.5544 26.6167C54.9662 28.0611 55.5668 29.368 56.3563 30.5372C57.1456 31.6721 58.0895 32.6178 59.1879 33.3743C59.8743 33.8214 60.5264 34.1825 61.1442 34.4576C61.7963 34.6983 62.517 34.9047 63.3065 35.0766C64.1644 35.2486 64.765 35.6097 65.1083 36.1599C65.4515 36.6758 65.5545 37.2432 65.4172 37.8621C65.3143 38.4468 65.0054 38.9283 64.4905 39.3066C64.01 39.6849 63.3407 39.788 62.4827 39.6161ZM90.3424 5.1575C90.7253 5.75002 91.1201 6.33474 91.5265 6.91131C92.0031 7.53774 92.4666 8.17415 92.9165 8.82012C93.397 9.50794 93.929 10.2645 94.5126 11.0898C95.096 11.8808 95.7309 12.7921 96.4174 13.8239C97.1381 14.8556 97.8932 15.9389 98.6826 17.0737C99.458 18.1546 100.23 19.2379 100.999 20.3235C101.789 21.4584 102.544 22.5417 103.265 23.5734C103.982 24.5215 104.703 25.4672 105.427 26.4105C106.113 27.3047 106.731 28.1472 107.28 28.9381C107.917 29.831 108.552 30.7252 109.185 31.6206C109.741 32.4066 110.29 33.1976 110.833 33.9934C111.334 34.6961 111.831 35.4011 112.325 36.1085C112.84 36.7963 113.029 37.4669 112.892 38.1202C112.789 38.7392 112.48 39.2207 111.965 39.5646C111.485 39.9085 110.918 40.0461 110.266 39.9773C109.648 39.9085 109.099 39.513 108.619 38.7908C108.096 38.0919 107.581 37.3869 107.074 36.6759C106.531 35.9149 105.982 35.1582 105.427 34.4061C104.878 33.5808 104.26 32.6867 103.573 31.7238C102.99 30.8984 102.355 30.0386 101.669 29.1445C100.953 28.1775 100.233 27.2145 99.5063 26.2558C98.7512 25.224 97.979 24.1408 97.1896 23.006C96.4412 21.9351 95.6861 20.869 94.9243 19.8076C94.1987 18.716 93.4608 17.6326 92.7106 16.5578C91.9899 15.4918 91.3206 14.5289 90.7028 13.6691C89.8448 12.4654 89.0726 11.4165 88.3861 10.5223C87.7611 9.63322 87.1433 8.73908 86.5327 7.83999C86.0522 7.11778 85.8634 6.4472 85.9664 5.82825C86.1036 5.20922 86.4297 4.72774 86.9446 4.38384C87.4594 4.00554 88.0257 3.86797 88.6435 3.97115C89.2612 4.07432 89.8275 4.46969 90.3424 5.1575ZM111.914 7.83999C111.488 8.44415 111.059 9.046 110.627 9.6455C110.179 10.2808 109.733 10.917 109.288 11.5541C108.735 12.3077 108.186 13.0643 107.641 13.8239C107.194 14.4429 106.714 15.1135 106.199 15.8356C105.648 16.6083 105.099 17.3821 104.552 18.157C103.954 18.9673 103.353 19.7754 102.75 20.5814C102.16 21.4149 101.56 22.2404 100.948 23.0575C100.181 24.1273 99.4084 25.1934 98.6311 26.2558C97.9042 27.2486 97.1834 28.2459 96.4689 29.2476C95.8472 30.1342 95.2121 31.0113 94.5639 31.8785C93.9398 32.7337 93.3221 33.5934 92.7106 34.4577C92.1778 35.2261 91.6286 35.9828 91.0632 36.7275C90.5706 37.4189 90.0729 38.1066 89.5702 38.7907C89.0897 39.5129 88.5233 39.9084 87.8712 39.9772C87.2536 40.046 86.6873 39.9084 86.1723 39.5645C85.6918 39.2206 85.3829 38.7391 85.2457 38.1201C85.1427 37.4668 85.3486 36.7962 85.8634 36.1083C86.5842 35.0766 87.3564 33.9933 88.1801 32.8585C89.098 31.5921 90.0075 30.3196 90.9087 29.0412C91.5279 28.1652 92.1457 27.2883 92.7621 26.4104C93.4852 25.432 94.2059 24.4519 94.9243 23.4701C95.6794 22.4384 96.4517 21.3723 97.2411 20.2718C98.0387 19.1945 98.8281 18.1112 99.6093 17.022C100.363 15.9717 101.118 14.9228 101.875 13.8753C102.63 12.878 103.282 12.001 103.831 11.2444C104.378 10.4521 104.927 9.66113 105.478 8.87158C105.993 8.14938 106.474 7.49595 106.92 6.91131C107.344 6.32289 107.773 5.73827 108.207 5.1575C108.687 4.4353 109.237 4.0398 109.854 3.97102C110.506 3.90224 111.073 4.057 111.553 4.4353C112.068 4.7792 112.377 5.26068 112.48 5.87971C112.617 6.49866 112.428 7.15217 111.914 7.83999ZM142.813 7.63351C142.263 8.63085 141.732 9.62818 141.217 10.6255C140.698 11.5956 140.166 12.5586 139.621 13.5142C138.983 14.6644 138.348 15.8165 137.717 16.9704C137.132 18.0365 136.549 19.1026 135.966 20.1686C135.383 21.2346 134.764 22.3868 134.113 23.6249C133.632 24.5189 133.203 25.4818 132.825 26.5136C132.448 27.5453 132.258 28.6458 132.258 29.815V37.4496C132.258 38.1373 132.104 38.7047 131.795 39.1518C131.487 39.5645 131.092 39.8396 130.611 39.9772C130.166 40.1147 129.702 40.1147 129.221 39.9772C128.776 39.8396 128.397 39.5645 128.089 39.1518C127.78 38.7047 127.626 38.1373 127.626 37.4496V29.7634C127.626 28.4566 127.522 27.3905 127.317 26.5651C127.145 25.7398 126.871 25.0004 126.492 24.3469C126.15 23.6592 125.704 22.9542 125.154 22.232C124.639 21.4754 124.056 20.5297 123.404 19.3949C122.9 18.4775 122.385 17.5661 121.859 16.6608C121.372 15.7879 120.891 14.911 120.418 14.0301C119.933 13.0606 119.435 12.0976 118.925 11.1412C118.376 10.1095 117.741 8.92313 117.02 7.58205C116.608 6.82537 116.505 6.15475 116.711 5.57019C116.917 4.95116 117.295 4.50408 117.844 4.22895C118.393 3.91943 118.976 3.85065 119.594 4.02261C120.212 4.16017 120.727 4.62445 121.139 5.41543C121.753 6.58634 122.371 7.75559 122.992 8.92317C123.541 9.92042 124.039 10.8662 124.485 11.7604C124.966 12.6202 125.429 13.4799 125.875 14.3396C126.356 15.1994 126.871 16.1107 127.42 17.0735C128.243 18.4836 128.946 19.6528 129.531 20.5813C130.148 21.4754 130.663 22.318 131.074 23.109C131.487 23.9 131.779 24.8112 131.95 25.8429C132.156 26.8403 132.258 28.1471 132.258 29.7634V37.4496C132.258 38.1373 132.104 38.7047 131.795 39.1518C131.487 39.5645 131.092 39.8396 130.611 39.9772C130.166 40.1147 129.702 40.1147 129.221 39.9772C128.776 39.8396 128.397 39.5645 128.089 39.1518C127.78 38.7047 127.626 38.1373 127.626 37.4496V29.815C127.626 28.1987 127.848 26.7027 128.295 25.3271C128.776 23.9516 129.341 22.6619 129.994 21.4582C130.626 20.2872 131.26 19.1179 131.899 17.9505C132.482 16.8844 133.065 15.8183 133.65 14.7523C134.233 13.6862 134.884 12.5169 135.605 11.2444L136.635 9.28427L137.665 7.324L138.797 5.36385C139.209 4.60725 139.724 4.16017 140.342 4.02261C140.959 3.85065 141.526 3.91943 142.04 4.22895C142.589 4.50408 142.968 4.95116 143.174 5.57019C143.379 6.18923 143.259 6.87679 142.813 7.63351Z" fill="white" />
                <path d="M164.72 29V17.2H160.08V15H171.96V17.2H167.32V29H164.72ZM180.276 29.2C179.183 29.2 178.176 29.02 177.256 28.66C176.336 28.3 175.536 27.8 174.856 27.16C174.176 26.5067 173.649 25.7467 173.276 24.88C172.903 24 172.716 23.04 172.716 22C172.716 20.96 172.903 20.0067 173.276 19.14C173.649 18.26 174.176 17.5 174.856 16.86C175.536 16.2067 176.336 15.7 177.256 15.34C178.176 14.98 179.176 14.8 180.256 14.8C181.349 14.8 182.349 14.98 183.256 15.34C184.176 15.7 184.976 16.2067 185.656 16.86C186.336 17.5 186.863 18.26 187.236 19.14C187.609 20.0067 187.796 20.96 187.796 22C187.796 23.04 187.609 24 187.236 24.88C186.863 25.76 186.336 26.52 185.656 27.16C184.976 27.8 184.176 28.3 183.256 28.66C182.349 29.02 181.356 29.2 180.276 29.2ZM180.256 26.92C180.963 26.92 181.616 26.8 182.216 26.56C182.816 26.32 183.336 25.98 183.776 25.54C184.216 25.0867 184.556 24.5667 184.796 23.98C185.049 23.38 185.176 22.72 185.176 22C185.176 21.28 185.049 20.6267 184.796 20.04C184.556 19.44 184.216 18.92 183.776 18.48C183.336 18.0267 182.816 17.68 182.216 17.44C181.616 17.2 180.963 17.08 180.256 17.08C179.549 17.08 178.896 17.2 178.296 17.44C177.709 17.68 177.189 18.0267 176.736 18.48C176.296 18.92 175.949 19.44 175.696 20.04C175.456 20.6267 175.336 21.28 175.336 22C175.336 22.7067 175.456 23.36 175.696 23.96C175.949 24.56 176.296 25.0867 176.736 25.54C177.176 25.98 177.696 26.32 178.296 26.56C178.896 26.8 179.549 26.92 180.256 26.92ZM190.552 29V15H196.672C198.192 15 199.525 15.2933 200.672 15.88C201.819 16.4667 202.712 17.28 203.352 18.32C203.992 19.36 204.312 20.5867 204.312 22C204.312 23.4 203.992 24.6267 203.352 25.68C202.712 26.72 201.819 27.5333 200.672 28.12C199.525 28.7067 198.192 29 196.672 29H190.552ZM193.152 26.8H196.552C197.592 26.8 198.499 26.6 199.272 26.2C200.045 25.8 200.639 25.24 201.052 24.52C201.479 23.8 201.692 22.96 201.692 22C201.692 21.0267 201.479 20.1867 201.052 19.48C200.639 18.76 200.045 18.2 199.272 17.8C198.499 17.4 197.592 17.2 196.552 17.2H193.152V26.8ZM213.635 29.2C212.542 29.2 211.535 29.02 210.615 28.66C209.695 28.3 208.895 27.8 208.215 27.16C207.535 26.5067 207.009 25.7467 206.635 24.88C206.262 24 206.075 23.04 206.075 22C206.075 20.96 206.262 20.0067 206.635 19.14C207.009 18.26 207.535 17.5 208.215 16.86C208.895 16.2067 209.695 15.7 210.615 15.34C211.535 14.98 212.535 14.8 213.615 14.8C214.709 14.8 215.709 14.98 216.615 15.34C217.535 15.7 218.335 16.2067 219.015 16.86C219.695 17.5 220.222 18.26 220.595 19.14C220.969 20.0067 221.155 20.96 221.155 22C221.155 23.04 220.969 24 220.595 24.88C220.222 25.76 219.695 26.52 219.015 27.16C218.335 27.8 217.535 28.3 216.615 28.66C215.709 29.02 214.715 29.2 213.635 29.2ZM213.615 26.92C214.322 26.92 214.975 26.8 215.575 26.56C216.175 26.32 216.695 25.98 217.135 25.54C217.575 25.0867 217.915 24.5667 218.155 23.98C218.409 23.38 218.535 22.72 218.535 22C218.535 21.28 218.409 20.6267 218.155 20.04C217.915 19.44 217.575 18.92 217.135 18.48C216.695 18.0267 216.175 17.68 215.575 17.44C214.975 17.2 214.322 17.08 213.615 17.08C212.909 17.08 212.255 17.2 211.655 17.44C211.069 17.68 210.549 18.0267 210.095 18.48C209.655 18.92 209.309 19.44 209.055 20.04C208.815 20.6267 208.695 21.28 208.695 22C208.695 22.7067 208.815 23.36 209.055 23.96C209.309 24.56 209.655 25.0867 210.095 25.54C210.535 25.98 211.055 26.32 211.655 26.56C212.255 26.8 212.909 26.92 213.615 26.92Z" fill="#1677FF" />
              </g>
              <defs>
                <clipPath id="clip0_2001_1579">
                  <rect width="231" height="44" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Input placeholder="Введите название задачи" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ height: 40, width: 400, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', outline: 'none', boxShadow: 'none' }} />
          </div>
          <div style={{ marginLeft: 50 }}>
            <button onClick={() => setOpenProfileDrawer(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20 }}><UserOutlined /></button>
          </div>
        </Header>

        <div style={{ padding: '16px 34px 0 34px', marginBottom: 8 }}>
          <Dropdown dropdownRender={() => boardMenu} trigger={['click']}>
            <Button style={{ background: 'transparent', border: 'none', color: 'white', padding: 0, fontSize: '1rem' }}>
              Текущая доска - {currentBoardName} <DownOutlined />
            </Button>
          </Dropdown>
        </div>

        <Content style={{ padding: '34px 34px', height: '100%' }}>
          <KanbanBoard columns={columns} tasks={tasks} onTaskClick={handleTaskClick} onDragEnd={handleDragEnd} searchQuery={debouncedQuery} highlightedTaskId={highlightedTaskId} onAddTask={handleAddTaskInColumn} taskRefs={taskRefs} />
        </Content>
      </Layout>

      <TaskForm open={openTaskForm} onClose={handleCloseTaskForm} userId={user?.uid ?? ''} boardId={currentBoardId!} editingTask={editingTask} defaultStatus={pendingColumnStatus} />
      <UserProfileDrawer open={openProfileDrawer} onClose={() => setOpenProfileDrawer(false)} user={user} />
      <AntModal title="Создать доску" open={newBoardModalVisible} onOk={handleCreateBoard} onCancel={() => setNewBoardModalVisible(false)} okText="Создать" cancelText="Отмена">
        <Input placeholder="Название доски" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onPressEnter={handleCreateBoard} />
      </AntModal>
      <AntModal title="Редактировать доску" open={editBoardModalVisible} onOk={handleUpdateBoardName} onCancel={() => setEditBoardModalVisible(false)} okText="Сохранить" cancelText="Отмена">
        <Input placeholder="Название доски" value={editBoardName} onChange={(e) => setEditBoardName(e.target.value)} onPressEnter={handleUpdateBoardName} />
      </AntModal>
    </div>
  );
};

export default Dashboard;