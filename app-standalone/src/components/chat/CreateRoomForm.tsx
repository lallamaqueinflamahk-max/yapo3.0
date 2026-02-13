"use client";

import { useState } from "react";

interface CreateRoomFormProps {
  onCreate: (name: string, type: "private" | "group") => void;
  onCancel: () => void;
}

export default function CreateRoomForm({ onCreate, onCancel }: CreateRoomFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"private" | "group">("group");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, type);
    setName("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-yapo-blue/20 bg-yapo-white p-4"
    >
      <label htmlFor="room-name" className="mb-2 block text-sm font-medium text-yapo-blue/90">
        Nombre de la sala
      </label>
      <input
        id="room-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Trabajo, Equipo, General"
        className="mb-3 w-full rounded-xl border-2 border-yapo-blue/30 px-4 py-2 text-base focus:border-yapo-blue focus:outline-none"
        autoComplete="off"
      />
      <div className="mb-3 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="room-type"
            checked={type === "group"}
            onChange={() => setType("group")}
            className="text-yapo-blue"
          />
          <span className="text-sm">Grupal</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="room-type"
            checked={type === "private"}
            onChange={() => setType("private")}
            className="text-yapo-blue"
          />
          <span className="text-sm">Privado</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border-2 border-yapo-blue/30 bg-yapo-white py-2 text-sm font-medium text-yapo-blue active:scale-[0.98]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 rounded-xl bg-yapo-red py-2 text-sm font-semibold text-yapo-white active:scale-[0.98] disabled:opacity-50"
        >
          Crear
        </button>
      </div>
    </form>
  );
}
