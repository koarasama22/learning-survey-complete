"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { CLASSES, ClassId } from "@/lib/types";
import { toHalfWidth, isValidMinutes } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BookOpen, Clock, Hash, Lock } from "lucide-react";

export function StudentForm() {
  const [classId, setClassId] = useState<ClassId | "">("");
  const [attendance, setAttendance] = useLocalStorage<string>("attendanceNumber", "");
  const [minutes, setMinutes] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 出席番号変更用
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changePassword, setChangePassword] = useState("");
  const [newAttendance, setNewAttendance] = useState("");

  const [modal, setModal] = useState<{
    title: string;
    message: string;
    onConfirm?: () => void;
    variant?: "default" | "danger" | "success";
  } | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async () => {
    const cleanAtt = toHalfWidth(attendance).trim();
    const cleanMinStr = toHalfWidth(minutes).trim();
    const cleanMin = Number(cleanMinStr);

    if (!classId) {
      setModal({ title: "入力エラー", message: "クラスを選択してください" });
      return;
    }
    if (!cleanAtt) {
      setModal({ title: "入力エラー", message: "出席番号を入力してください" });
      return;
    }
    if (!isValidMinutes(cleanMinStr)) {
      setModal({
        title: "入力エラー",
        message: "学習時間は0〜600分の半角数字で入力してください",
      });
      return;
    }

    // 直近5分以内の同一分数チェック
    const last = localStorage.getItem("lastSubmit");
    if (last) {
      try {
        const { time, mins, classId: lastClass } = JSON.parse(last);
        if (
          lastClass === classId &&
          Date.now() - time < 5 * 60 * 1000 &&
          mins === cleanMin
        ) {
          setModal({
            title: "確認",
            message: `同じ ${cleanMin} 分を5分以内に再送信しようとしています。\n本当に送信しますか？`,
            onConfirm: () => doSubmit(cleanAtt, cleanMin),
            variant: "default",
          });
          return;
        }
      } catch {
        // ignore
      }
    }

    await doSubmit(cleanAtt, cleanMin);
  };

  const doSubmit = async (att: string, mins: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          attendanceNumber: att,
          minutes: mins,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "送信に失敗しました");
      }

      localStorage.setItem(
        "lastSubmit",
        JSON.stringify({ time: Date.now(), mins, classId })
      );
      setTotal(data.totalMinutes);
      setMinutes("");
      setModal({
        title: "送信完了",
        message: `学習時間を記録しました。\n\nこれまでの合計時間: ${data.totalMinutes} 分\n送信回数: ${data.submitCount} 回`,
        variant: "success",
      });
    } catch (e: any) {
      setModal({
        title: "エラー",
        message: e.message || "送信に失敗しました。もう一度お試しください。",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // 出席番号変更
  const handleChangeAttendance = async () => {
    if (changePassword !== process.env.NEXT_PUBLIC_STUDENT_CHANGE_PASSWORD && changePassword !== "12345") {
      // クライアント側でも簡易チェック（本番はAPIで厳密に）
      setModal({ title: "エラー", message: "パスワードが違います", variant: "danger" });
      return;
    }

    const cleanNew = toHalfWidth(newAttendance).trim();
    if (!cleanNew) {
      setModal({ title: "入力エラー", message: "新しい出席番号を入力してください" });
      return;
    }

    try {
      const res = await fetch("/api/change-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: changePassword,
          newAttendanceNumber: cleanNew,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAttendance(cleanNew);
      setShowChangeForm(false);
      setChangePassword("");
      setNewAttendance("");
      setModal({
        title: "変更完了",
        message: `出席番号を ${cleanNew} に変更しました`,
        variant: "success",
      });
    } catch (e: any) {
      setModal({
        title: "エラー",
        message: e.message || "変更に失敗しました",
        variant: "danger",
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">学習時間アンケート</h1>
          <p className="text-slate-500 mt-1 text-sm">毎日の学習時間を記録しましょう</p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5 border border-slate-100">
          {/* クラス選択 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Hash size={16} />
              クラス
            </label>
            <select
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={classId}
              onChange={(e) => setClassId(e.target.value as ClassId | "")}
            >
              <option value="">選択してください</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 出席番号 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Hash size={16} />
                出席番号
              </label>
              <button
                type="button"
                onClick={() => setShowChangeForm(!showChangeForm)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Lock size={12} />
                変更する
              </button>
            </div>
            <input
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={attendance}
              onChange={(e) => setAttendance(toHalfWidth(e.target.value))}
              placeholder="例: 12"
              inputMode="numeric"
            />
          </div>

          {/* 出席番号変更フォーム */}
          {showChangeForm && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-amber-800 font-medium">出席番号の変更（パスワードが必要）</p>
              <input
                type="password"
                className="w-full border border-amber-200 rounded-lg p-2.5 text-sm"
                placeholder="パスワード"
                value={changePassword}
                onChange={(e) => setChangePassword(e.target.value)}
              />
              <input
                className="w-full border border-amber-200 rounded-lg p-2.5 text-sm"
                placeholder="新しい出席番号"
                value={newAttendance}
                onChange={(e) => setNewAttendance(toHalfWidth(e.target.value))}
                inputMode="numeric"
              />
              <button
                onClick={handleChangeAttendance}
                className="w-full bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
              >
                変更を確定
              </button>
            </div>
          )}

          {/* 学習時間 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Clock size={16} />
              学習時間（分）
            </label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg"
              value={minutes}
              onChange={(e) => setMinutes(toHalfWidth(e.target.value))}
              placeholder="0 〜 600"
            />
            <p className="text-xs text-slate-400 mt-1">全角数字は自動で半角に変換されます</p>
          </div>

          {/* 送信ボタン */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
          >
            {loading ? "送信中..." : "送信する"}
          </button>

          {/* 合計表示 */}
          {total !== null && (
            <div className="text-center py-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-700">これまでの合計時間</p>
              <p className="text-3xl font-bold text-green-800">{total} <span className="text-lg">分</span></p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          入力データは先生のみが確認できます
        </p>
      </div>

      {/* モーダル */}
      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
          onConfirm={modal.onConfirm}
          variant={modal.variant}
        />
      )}
    </div>
  );
}
