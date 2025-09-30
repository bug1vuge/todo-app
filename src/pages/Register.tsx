import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { register } from "../features/auth/authSlice";

const Register: React.FC = () => {
  const dispatch = useAppDispatch(); // Redux dispatch для вызова Thunk действий
  const status = useAppSelector((s) => s.auth.status); // Статус авторизации (idle/loading/succeeded/failed)
  const navigate = useNavigate(); // Хук для навигации после успешной регистрации

  // Функция обработки отправки формы
  const onFinish = async (values: { email: string; password: string }) => {
    const res = await dispatch(register(values)); // Диспатчим Thunk register

    // Проверяем результат через тип действия
    // TS игнорируется, так как тип payload в Thunk может быть string | undefined
    // @ts-ignore
    if (res.type === "auth/register/fulfilled") {
      message.success("Аккаунт создан"); // Всплывающее уведомление о успешной регистрации
      navigate("/"); // Перенаправление на главную страницу
    } else {
      // @ts-ignore
      message.error(res.payload ?? "Ошибка регистрации"); // Всплывающее уведомление при ошибке
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <Card title="Регистрация">
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
            rules={[
              { required: true, message: "Введите пароль" },
              { min: 6, message: "Минимум 6 символов" }, // Проверка длины пароля
            ]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          {/* Кнопка регистрации */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"} // Показ спиннера при загрузке
              block
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          {/* Ссылка на страницу входа */}
          <Form.Item>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
