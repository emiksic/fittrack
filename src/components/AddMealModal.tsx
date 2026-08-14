"use client";

import { useState } from "react";
import { useAddMealModal } from "@/context/AddMealModalContext";
import { useFitnessData } from "@/context/FitnessDataContext";
import { COLORS, FONT_DISPLAY } from "@/lib/theme";

const EMPTY_FORM = { name: "", calories: "", protein: "", carbs: "", fat: "" };

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: COLORS.inputBg,
  border: `1px solid ${COLORS.inputBorder}`,
  color: COLORS.text,
  padding: "11px 12px",
  borderRadius: 10,
  fontSize: 14,
};

export default function AddMealModal() {
  const { isOpen, close } = useAddMealModal();
  const { addMeal } = useFitnessData();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    close();
    setForm(EMPTY_FORM);
    setError(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !Number(form.calories)) {
      setError(true);
      return;
    }
    const result = await addMeal({
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    });
    if (!result.ok) {
      setError(true);
      return;
    }
    handleClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
      onClick={handleClose}
    >
      <div
        style={{ background: "#161616", border: `1px solid ${COLORS.inputBorder}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, marginBottom: 18 }}>Add meal</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="Food name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Calories (kcal)"
            value={form.calories}
            onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
            style={inputStyle}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <input
              type="number"
              placeholder="Protein (g)"
              value={form.protein}
              onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={form.carbs}
              onChange={(e) => setForm((f) => ({ ...f, carbs: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Fat (g)"
              value={form.fat}
              onChange={(e) => setForm((f) => ({ ...f, fat: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>
        {error && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 10 }}>Enter a name and calories.</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <div
            onClick={handleClose}
            style={{
              flex: 1,
              textAlign: "center",
              padding: 12,
              borderRadius: 10,
              background: COLORS.inputBg,
              border: `1px solid ${COLORS.inputBorder}`,
              color: "#c9c9c9",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </div>
          <div
            onClick={handleSubmit}
            style={{
              flex: 1,
              textAlign: "center",
              padding: 12,
              borderRadius: 10,
              background: COLORS.accent,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </div>
        </div>
      </div>
    </div>
  );
}
