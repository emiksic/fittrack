"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import type { Meal } from "@/lib/types";

type AddMealModalState = {
  isOpen: boolean;
  editingMeal: Meal | null;
  open: () => void;
  openEdit: (meal: Meal) => void;
  close: () => void;
};

const AddMealModalContext = createContext<AddMealModalState | null>(null);

export function AddMealModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const open = useCallback(() => {
    setEditingMeal(null);
    setIsOpen(true);
  }, []);
  const openEdit = useCallback((meal: Meal) => {
    setEditingMeal(meal);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    setEditingMeal(null);
  }, []);
  const value = useMemo(
    () => ({ isOpen, editingMeal, open, openEdit, close }),
    [isOpen, editingMeal, open, openEdit, close]
  );
  return <AddMealModalContext.Provider value={value}>{children}</AddMealModalContext.Provider>;
}

export function useAddMealModal(): AddMealModalState {
  const ctx = useContext(AddMealModalContext);
  if (!ctx) throw new Error("useAddMealModal must be used within AddMealModalProvider");
  return ctx;
}
