import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch } from "./hooks";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./api/firebase";
import { setUser, clearUser, setLoading } from "./features/auth/authSlice";
import { ConfigProvider } from 'antd'; // добавили ConfigProvider, Input (для типа), theme

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLoading());

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email ?? undefined }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorTextPlaceholder: 'rgba(255, 255, 255, 1)', 
        },
        components: {
          Input: {
            activeBorderColor: 'transparent',
            hoverBorderColor: 'transparent',
            activeShadow: 'none',
          },
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
};

export default App;