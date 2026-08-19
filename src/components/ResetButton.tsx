"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Trash2 } from "lucide-react";
import { ClassId } from "@/lib/types";

interface ResetButtonProps {
  classId: ClassId;
  passcode: string;
  onResetDone: () => void;
}

export function ResetButton({ classId, passcode, onResetDone }: ResetButtonProps) {
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    onConfirm?: () => void;
    variant?: "default" | "danger" | "success";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetClass = () => {
    setModal({
      title: "学期リセット確認",
      message: `クラス ${classId} の全生徒の学習時間データをリセットします。\n\nこの操作は取り消せません。本当に実行しますか？`,
      variant: "danger",
      onConfirm: () => executeReset(false),
    });
  };

  const handleResetAll = () => {
    setModal({
      title: "全クラスリセット確認",
      message: `全クラス（2-1〜2-5）の学習時間データをリセットします。\n\nこの操作は取り消せません。本当に実行しますか？`,
      variant: "danger",
      onConfirm: () => executeReset(true),
    });
  };

  const executeReset = async (all: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-teacher-passcode": passcode,
        },
        body: JSON.stringify({ classId, all }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "リセットに失敗しました");

      setModal({
        title: "リセット完了",
        message: all
          ? "全クラスのデータをリセットしました"
          : `クラス ${classId} のデータをリセットしました`,
        variant: "success",
      });
      onResetDone();
    } catch (e: any) {
      setModal({
        title: "エラー",
        message: e.message || "リセットに失敗しました",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleResetClass}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
        >
          <Trash2 size={16} />
          このクラスをリセット
        </button>
        <button
          onClick={handleResetAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
        >
          <Trash2 size={16} />
          全クラスをリセット
        </button>
      </div>

      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
          onConfirm={modal.onConfirm}
          variant={modal.variant}
          confirmText="実行する"
          cancelText="やめる"
        />
      )}
    </>
  );
}
