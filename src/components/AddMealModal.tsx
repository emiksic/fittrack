"use client";

import { useEffect, useState } from "react";
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
  const { isOpen, editingMeal, close } = useAddMealModal();
  const { addMeal, updateMeal } = useFitnessData();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(false);
  const [description, setDescription] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [aiEstimated, setAiEstimated] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingMeal) {
      setForm({
        name: editingMeal.name,
        calories: String(editingMeal.calories),
        protein: String(editingMeal.protein),
        carbs: String(editingMeal.carbs),
        fat: String(editingMeal.fat),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(false);
    setDescription("");
    setEstimateError(null);
    setAiEstimated(false);
  }, [isOpen, editingMeal]);

  if (!isOpen) return null;

  const handleClose = () => {
    close();
  };

  const handleEstimate = async () => {
    if (!description.trim()) return;
    setEstimating(true);
    setEstimateError(null);
    const res = await fetch("/api/meals/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEstimateError(data.error || "Could not estimate meal.");
      setEstimating(false);
      return;
    }
    setForm({
      name: data.name,
      calories: String(data.calories),
      protein: String(data.protein),
      carbs: String(data.carbs),
      fat: String(data.fat),
    });
    setAiEstimated(true);
    setEstimating(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !Number(form.calories)) {
      setError(true);
      return;
    }
    const payload = {
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };
    const result = editingMeal ? await updateMeal({ ...editingMeal, ...payload }) : await addMeal(payload);
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
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, marginBottom: 18 }}>
          {editingMeal ? "Edit meal" : "Add meal"}
        </div>

        {!editingMeal && (
          <>
            <div style={{ background: COLORS.inputBg, border: `1px solid ${COLORS.inputBorder}`, borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 10 }}>Describe your meal</div>
              <textarea
                placeholder="150g piletina, pola tanjura riže"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                style={{ ...inputStyle, background: "#141414", resize: "none", fontFamily: "inherit" }}
              />
              <div
                onClick={estimating || !description.trim() ? undefined : handleEstimate}
                style={{
                  marginTop: 10,
                  background: COLORS.accent,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: 10,
                  borderRadius: 10,
                  textAlign: "center",
                  cursor: estimating || !description.trim() ? "default" : "pointer",
                  opacity: estimating || !description.trim() ? 0.6 : 1,
                }}
              >
                {estimating ? "Thinking…" : "Estimate with AI"}
              </div>
              {estimateError && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 8 }}>{estimateError}</div>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: COLORS.border }} />
              <div style={{ fontSize: 11, color: COLORS.textFaint }}>or fill in manually</div>
              <div style={{ flex: 1, height: 1, background: COLORS.border }} />
            </div>
          </>
        )}

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
        {aiEstimated && (
          <div style={{ color: COLORS.green, fontSize: 12, marginTop: 10 }}>AI estimated — edit any field if needed.</div>
        )}
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
