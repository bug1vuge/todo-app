import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { register } from "../features/auth/authSlice";
import { db } from "../api/firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Auth.css";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    const result = await dispatch(register(values));
    if (register.fulfilled.match(result)) {
      const userData = result.payload; // { uid: string, email?: string }
      if (userData && userData.uid) {
        await setDoc(doc(db, "usersMeta", userData.uid), { email: userData.email });
      }
      message.success("Аккаунт создан");
      navigate("/");
    } else {
      const errorMsg = (result.payload as string) ?? "Ошибка регистрации";
      message.error(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <Card className="login-card">
          <div className="login-header">
            <h2>Создайте аккаунт</h2>
            <p>Зарегистрируйтесь, чтобы начать</p>
          </div>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" rules={[{ required: true, message: "Введите email" }]}>
              <Input placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Введите пароль" },
                { min: 6, message: "Минимум 6 символов" },
              ]}
            >
              <Input.Password placeholder="Пароль" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={status === "loading"} block size="large">
                Зарегистрироваться
              </Button>
            </Form.Item>
            <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Register;