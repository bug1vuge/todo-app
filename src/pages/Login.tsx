import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { login } from "../features/auth/authSlice";

const Login: React.FC = () => {
  const dispatch = useAppDispatch(); // Redux dispatch для вызова Thunk действий
  const status = useAppSelector((s) => s.auth.status); // Статус авторизации (idle/loading/succeeded/failed)
  const navigate = useNavigate(); // Хук для навигации после успешного входа

  // Функция обработки отправки формы
  const onFinish = async (values: { email: string; password: string }) => {
    const res = await dispatch(login(values)); // Диспатчим Thunk login

    // Проверяем результат через тип действия
    // TS игнорируется, так как тип payload в Thunk может быть string | undefined
    // @ts-ignore
    if (res.type === "auth/login/fulfilled") {
      message.success("Вы вошли"); // Всплывающее уведомление о успешном входе
      navigate("/"); // Перенаправление на главную страницу
    } else {
      // @ts-ignore
      message.error(res.payload ?? "Ошибка входа"); // Всплывающее уведомление при ошибке
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <Card title="Вход">
        <Form layout="vertical" onFinish={onFinish} style={{ width: 300 }}>
          {/* Поле для ввода email */}
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Введите email" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          {/* Поле для ввода пароля */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          {/* Кнопка входа */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"} // Показ спиннера при загрузке
              block
            >
              Войти
            </Button>
          </Form.Item>

          {/* Ссылка на страницу регистрации */}
          <Form.Item>
            Нет аккаунта? <Link to="/register">Регистрация</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
