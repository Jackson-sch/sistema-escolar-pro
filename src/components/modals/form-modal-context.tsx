"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

interface FormModalContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  setOnSubmit: (submit?: () => void) => void;
  triggerSubmit: () => void;
}

const FormModalContext = createContext<FormModalContextType | undefined>(
  undefined,
);

export function FormModalProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const onSubmitRef = useRef<(() => void) | undefined>(undefined);

  const setOnSubmit = useCallback((submit?: () => void) => {
    onSubmitRef.current = submit;
  }, []);

  const triggerSubmit = useCallback(() => {
    if (onSubmitRef.current) {
      onSubmitRef.current();
    }
  }, []);

  return (
    <FormModalContext.Provider
      value={{ isDirty, setIsDirty, setOnSubmit, triggerSubmit }}
    >
      {children}
    </FormModalContext.Provider>
  );
}

export function useFormModal() {
  const context = useContext(FormModalContext);
  if (context === undefined) {
    throw new Error("useFormModal debe usarse dentro de un FormModalProvider");
  }
  return context;
}
