"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

type AddMealModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const AddMealModalContext = createContext<AddMealModalState | null>(null);

export function AddMealModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <AddMealModalContext.Provider value={value}>{children}</AddMealModalContext.Provider>;
}

export function useAddMealModal(): AddMealModalState {
  const ctx = useContext(AddMealModalContext);
  if (!ctx) throw new Error("useAddMealModal must be used within AddMealModalProvider");
  return ctx;
}
