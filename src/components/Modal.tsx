"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "success";
}

export function Modal({
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "キャンセル",
  variant = "default",
}: ModalProps) {
  // Escキーで閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const confirmColor =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : variant === "success"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-3 pr-8">{title}</h2>
        <p className="text-gray-600 whitespace-pre-wrap mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          {onConfirm ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-white font-medium transition",
                  confirmColor
                )}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={cn(
                "px-6 py-2.5 rounded-xl text-white font-medium transition",
                confirmColor
              )}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
