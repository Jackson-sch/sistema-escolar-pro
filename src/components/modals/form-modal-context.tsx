"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface FormModalContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

const FormModalContext = createContext<FormModalContextType | undefined>(
  undefined,
);

export function FormModalProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <FormModalContext.Provider value={{ isDirty, setIsDirty }}>
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
