import React, { useState } from "react";
import { Drawer, Button, Avatar, Typography, Divider, Space, Badge, Form, Input, message, Tabs } from "antd";
import { LogoutOutlined, MailOutlined, IdcardOutlined, KeyOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { logout, updateUserEmail, updateUserPassword } from "./authSlice";
import ReauthModal from "./ReauthModal";

const { Title, Text } = Typography;

// Функция для определения, светлый ли цвет (по HEX)
const isLightColor = (hexColor: string) => {
  if (!hexColor || !hexColor.startsWith("#")) return false;
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return brightness > 128;
};

interface UserProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  user: { email?: string; uid: string } | null;
}

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ open, onClose, user }) => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);
  const [reauthVisible, setReauthVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<"email" | "password" | null>(null);
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Определяем тему на основе фона (если фон изображение – используем тёмную тему)
  const getThemeColors = () => {
    const defaultDark = {
      text: "#fff",
      textSecondary: "rgba(255,255,255,0.6)",
      background: "rgba(20,20,40,0.7)",
      cardBg: "rgba(255,255,255,0.1)",
      border: "rgba(255,255,255,0.2)",
      avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      headerBg: "rgba(0,0,0,0.5)",
    };

    if (!settings?.background) return defaultDark;

    if (settings.background.type === "image") {
      return defaultDark; // для изображений всегда тёмная тема
    }

    const bgColor = settings.background.value;
    const light = isLightColor(bgColor);

    return {
      text: light ? "#000" : "#fff",
      textSecondary: light ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)",
      background: light ? "rgba(255,255,255,0.8)" : "rgba(20,20,40,0.7)",
      cardBg: light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
      border: light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)",
      avatarGradient: light
        ? "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      headerBg: light ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.5)", // header темнее основного фона
    };
  };

  const themeColors = getThemeColors();

  const avatarLetter = user?.email ? user.email[0].toUpperCase() : "U";

  const handleLogout = async () => {
    await dispatch(logout());
    onClose();
  };

  const showReauth = (action: "email" | "password") => {
    setPendingAction(action);
    setReauthVisible(true);
  };

  const handleReauthConfirm = async (password: string) => {
    if (pendingAction === "email") {
      const values = await emailForm.validateFields();
      const result = await dispatch(updateUserEmail({ newEmail: values.newEmail, password }));
      if (updateUserEmail.fulfilled.match(result)) {
        message.success("Email успешно изменён");
        emailForm.resetFields();
      } else {
        message.error("Ошибка при смене email");
      }
    } else if (pendingAction === "password") {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error("Пароли не совпадают");
        return;
      }
      const result = await dispatch(updateUserPassword({ currentPassword: password, newPassword: values.newPassword }));
      if (updateUserPassword.fulfilled.match(result)) {
        message.success("Пароль успешно изменён");
        passwordForm.resetFields();
      } else {
        message.error("Ошибка при смене пароля");
      }
    }
    setReauthVisible(false);
    setPendingAction(null);
  };

  const items = [
    {
      key: "1",
      label: <span style={{ color: themeColors.text }}>Профиль</span>,
      children: (
        <>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Badge
              count={<div style={{ width: 12, height: 12, background: "#52c41a", borderRadius: "50%" }} />}
              offset={[-5, 5]}
            >
              <Avatar
                size={90}
                style={{
                  background: themeColors.avatarGradient,
                  border: `3px solid ${themeColors.border}`,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: 16,
                }}
              >
                {avatarLetter}
              </Avatar>
            </Badge>

            <Title level={4} style={{ color: themeColors.text, margin: "8px 0 4px", fontWeight: 600 }}>
              {user?.email || "Пользователь"}
            </Title>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
              <div style={{ background: themeColors.cardBg, padding: "4px 12px", borderRadius: 20 }}>
                <Text style={{ color: themeColors.textSecondary, fontSize: 12 }}>
                  <IdcardOutlined style={{ marginRight: 4 }} />
                  ID: {user?.uid.slice(0, 6)}...{user?.uid.slice(-4)}
                </Text>
              </div>
            </div>
          </div>

          <Divider style={{ borderColor: themeColors.border, margin: "16px 0" }} />

          <div
            style={{
              background: themeColors.cardBg,
              borderRadius: 12,
              padding: 16,
              backdropFilter: "blur(5px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <MailOutlined style={{ color: "#1890ff", fontSize: 18, marginRight: 12 }} />
              <div>
                <Text style={{ color: themeColors.textSecondary, fontSize: 12 }}>Email</Text>
                <div style={{ color: themeColors.text, fontSize: 14, wordBreak: "break-all" }}>
                  {user?.email || "не указан"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <IdcardOutlined style={{ color: "#52c41a", fontSize: 18, marginRight: 12 }} />
              <div>
                <Text style={{ color: themeColors.textSecondary, fontSize: 12 }}>UID</Text>
                <div style={{ color: themeColors.text, fontSize: 14, fontFamily: "monospace" }}>
                  {user?.uid}
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: <span style={{ color: themeColors.text }}>Безопасность</span>,
      children: (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ background: themeColors.cardBg, borderRadius: 12, padding: 16 }}>
            <Title level={5} style={{ color: themeColors.text, marginBottom: 16 }}>
              <MailOutlined /> Сменить email
            </Title>
            <Form form={emailForm} layout="vertical">
              <Form.Item
                name="newEmail"
                rules={[
                  { required: true, message: "Введите новый email" },
                  { type: "email", message: "Некорректный email" },
                ]}
              >
                <Input placeholder="Новый email" />
              </Form.Item>
              <Button type="primary" block onClick={() => showReauth("email")}>
                Обновить email
              </Button>
            </Form>
          </div>

          <div style={{ background: themeColors.cardBg, borderRadius: 12, padding: 16 }}>
            <Title level={5} style={{ color: themeColors.text, marginBottom: 16 }}>
              <KeyOutlined /> Сменить пароль
            </Title>
            <Form form={passwordForm} layout="vertical">
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: "Введите новый пароль" },
                  { min: 6, message: "Минимум 6 символов" },
                ]}
              >
                <Input.Password placeholder="Новый пароль" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: "Подтвердите пароль" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Пароли не совпадают"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Подтвердите пароль" />
              </Form.Item>
              <Button type="primary" block onClick={() => showReauth("password")}>
                Обновить пароль
              </Button>
            </Form>
          </div>

          <Divider style={{ borderColor: themeColors.border }} />

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            size="large"
            style={{
              height: 48,
              borderRadius: 24,
              fontSize: 16,
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(245, 34, 45, 0.3)",
              border: "none",
              background: "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
            }}
          >
            Выйти из аккаунта
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={
          <span style={{ color: themeColors.text, fontSize: "1.2rem", fontWeight: 500 }}>
            Личный кабинет
          </span>
        }
        placement="right"
        onClose={onClose}
        open={open}
        width={400}
        closeIcon={<ArrowRightOutlined style={{ color: themeColors.text }} />}
        styles={{
          body: {
            background: themeColors.background,
            backdropFilter: "blur(15px)",
            color: themeColors.text,
            padding: "24px 16px",
          },
          header: {
            background: themeColors.headerBg,
            backdropFilter: "blur(10px)",
            color: themeColors.text,
            borderBottom: `1px solid ${themeColors.border}`,
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <Tabs defaultActiveKey="1" items={items} />
      </Drawer>

      <ReauthModal
        open={reauthVisible}
        onCancel={() => {
          setReauthVisible(false);
          setPendingAction(null);
        }}
        onConfirm={handleReauthConfirm}
        title="Подтверждение действия"
      />
    </>
  );
};

export default UserProfileDrawer;