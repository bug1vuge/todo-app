import React from "react";
import { Modal, message } from "antd";
import { useAppDispatch } from "../../hooks";
import { updateBackground } from "./settingsSlice";
import type { BackgroundSettings } from "../../api/settingsService";

const presetColors = [
  "#0b0b2b", "#1a1a2e", "#16213e", "#0f3460", "#1e3c72",
  "#2a5298", "#4b6cb7", "#182848", "#141e30", "#243b55",
  "#3a1c71", "#d76d77", "#ffaf7b", "#159957", "#155799",
  "#000428", "#004e92", "#360033", "#0b8793",
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

  const handleColorSelect = async (color: string) => {
    try {
      await dispatch(updateBackground({ userId, background: { type: "color", value: color } })).unwrap();
      message.success("Фон обновлён");
      onClose();
    } catch {
      message.error("Ошибка обновления фона");
    }
  };

  return (
    <Modal title="Настройка фона доски" open={open} onCancel={onClose} footer={null}>
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
    </Modal>
  );
};

export default BackgroundSettingsModal;