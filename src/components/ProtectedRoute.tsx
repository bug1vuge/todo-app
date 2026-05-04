import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd"; // добавляем спиннер
import { useAppSelector } from "../hooks";
import "../App.css";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, initialized } = useAppSelector((s) => s.auth);

  if (!initialized) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
        <Spin size="large" tip="Загрузка..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;