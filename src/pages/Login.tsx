import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { login } from "../features/auth/authSlice";
import "./Auth.css"; 

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    const res = await dispatch(login(values));

    // @ts-ignore (упрощённо для учебного проекта)
    if (res.type === "auth/login/fulfilled") {
      message.success("Вы успешно вошли");
      navigate("/");
    } else {
      // @ts-ignore
      message.error(res.payload ?? "Ошибка входа");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <Card className="login-card">
          <div className="login-header">
            <h2>Добро пожаловать!</h2>
            <p>Войдите, чтобы продолжить</p>
          </div>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Введите email" }]}
            >
              <Input placeholder="Email" size="large" autoComplete="off"/>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password placeholder="Пароль" autoComplete="off" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={status === "loading"}
                block
                size="large"
              >
                Войти
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginBottom: 0, color: '#fff' }}>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;