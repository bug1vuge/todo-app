import React, { useState } from "react";
import { Modal, Tabs, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useAppDispatch } from "../../hooks";
import { updateBackground, uploadImageAndUpdateBackground } from "./settingsSlice";
import type { BackgroundSettings } from "../../api/settingsService";

const { Dragger } = Upload;

const presetColors = [
  "#0b0b2b",
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#1e3c72",
  "#2a5298",
  "#4b6cb7",
  "#182848",
  "#141e30",
  "#243b55",
  "#3a1c71",
  "#d76d77",
  "#ffaf7b",
  "#159957",
  "#155799",
  "#000428",
  "#004e92",
  "#360033",
  "#0b8793",
];

interface BackgroundSettingsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentBackground?: BackgroundSettings | null;
}

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  open,
  onClose,
  userId,
  currentBackground,
}) => {
  const dispatch = useAppDispatch();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleColorSelect = (color: string) => {
    dispatch(updateBackground({ userId, background: { type: "color", value: color } }));
    message.success("Фон обновлён");
    onClose();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await dispatch(uploadImageAndUpdateBackground({ userId, file })).unwrap();
      message.success("Фон обновлён");
      setFileList([]);
      onClose();
    } catch (error) {
      message.error("Ошибка загрузки изображения");
    } finally {
      setUploading(false);
    }
    return false;
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    fileList,
    accept: "image/*",
    beforeUpload: handleUpload,
    onChange(info: any) {
      setFileList(info.fileList);
    },
    onRemove: () => setFileList([]),
  };

  const items = [
    {
      key: "1",
      label: "Цвета",
      children: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 16 }}>
          {presetColors.map((color) => (
            <div
              key={color}
              onClick={() => handleColorSelect(color)}
              style={{
                backgroundColor: color,
                height: 40,
                borderRadius: 4,
                cursor: "pointer",
                border:
                  currentBackground?.type === "color" && currentBackground.value === color
                    ? "3px solid white"
                    : "1px solid rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      ),
    },
    {
      key: "2",
      label: "Изображение",
      children: (
        <Dragger {...uploadProps} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Нажмите или перетащите файл для загрузки</p>
          <p className="ant-upload-hint">Поддерживаются JPG, PNG, GIF. Максимальный размер 10MB.</p>
        </Dragger>
      ),
    },
  ];

  return (
    <Modal title="Настройка фона доски" open={open} onCancel={onClose} footer={null}>
      <Tabs defaultActiveKey="1" items={items} />
    </Modal>
  );
};

export default BackgroundSettingsModal;