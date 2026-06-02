import { useState } from "react";
// This custom hook manages the state and behavior of a confirmation dialog. It provides functions to open and close the dialog, as well as to handle the confirmation action. The `openDialog` function accepts a configuration object that can include properties like `title`, `message`, and an `onConfirm` callback function that will be executed when the user confirms the action. The hook returns the current state of the dialog, its configuration, and the functions to control it.
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
