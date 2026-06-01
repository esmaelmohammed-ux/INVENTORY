import { useState } from "react";

const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const openDialog = (dialogConfig) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setConfig({});
  };

  const handleConfirm = () => {
    config.onConfirm?.();
    closeDialog();
  };

  return {
    isOpen,
    config,
    openDialog,
    closeDialog,
    handleConfirm,
  };
};

export default useConfirmDialog;
