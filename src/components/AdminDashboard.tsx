"use client";

import { useState, useEffect, useCallback } from "react";
import { ClassId, CLASSES, StudentData } from "@/lib/types";
import { StatsTable } from "./StatsTable";
import { Charts } from "./Charts";
import { ResetButton } from "./ResetButton";
import { Modal } from "./Modal";
import { Lock, RefreshCw, BarChart3, Table2, LogOut } from "lucide-react";

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [inputPasscode, setInputPasscode] = useState("");
  const [activeClass, setActiveClass] = useState<ClassId>("2-1");
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"table" | "chart">("table");
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    variant?: "default" | "danger" | "success";
  } | null>(null);

  // セッション復元
  useEffect(() => {
    const saved = sessionStorage.getItem("teacherAuth");
    if (saved === "true") {
      setAuthenticated(true);
      setPasscode(sessionStorage.getItem("teacherPasscode") || "");
    }
  }, []);

  const fetchStats = useCallback(async (classId: ClassId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats/${classId}`, {
        headers: {
          "x-teacher-passcode": passcode || sessionStorage.getItem("teacherPasscode") || "",
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem("teacherAuth");
          setModal({ title: "認証エラー", message: "再度ログインしてください", variant: "danger" });
          return;
        }
        throw new Error("データ取得に失敗しました");
      }
      const data = await res.json();
      setStudents(data.students || []);
    } catch (e: any) {
      setModal({ title: "エラー", message: e.message, variant: "danger" });
    } finally {
      setLoading(false);
    }
  }, [passcode]);

  useEffect(() => {
    if (authenticated) {
      fetchStats(activeClass);
    }
  }, [authenticated, activeClass, fetchStats]);

  const handleLogin = async () => {
    // 簡易チェック（本番はAPIで検証）
    if (inputPasscode === "sensei2026" || inputPasscode === process.env.NEXT_PUBLIC_TEACHER_PASSCODE) {
      setAuthenticated(true);
      setPasscode(inputPasscode);
      sessionStorage.setItem("teacherAuth", "true");
      sessionStorage.setItem("teacherPasscode", inputPasscode);
    } else {
      setModal({ title: "認証失敗", message: "パスコードが正しくありません", variant: "danger" });
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPasscode("");
    sessionStorage.removeItem("teacherAuth");
    sessionStorage.removeItem("teacherPasscode");
  };

  // ===== ログイン画面 =====
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 text-white mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">先生用管理画面</h1>
            <p className="text-sm text-slate-500 mt-1">パスコードを入力してください</p>
          </div>

          <input
            type="password"
            className="w-full border border-slate-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="パスコード"
            value={inputPasscode}
            onChange={(e) => setInputPasscode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition"
          >
            ログイン
          </button>
        </div>

        {modal && (
          <Modal
            title={modal.title}
            message={modal.message}
            onClose={() => setModal(null)}
            variant={modal.variant}
          />
        )}
      </div>
    );
  }

  // ===== ダッシュボード =====
  return (
    <div className="min-h-screen bg-slate-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">学習時間 集計画面</h1>
            <p className="text-xs text-slate-500">先生専用ダッシュボード</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStats(activeClass)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="更新"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut size={16} />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* クラスタブ */}
        <div className="flex flex-wrap gap-2">
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveClass(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeClass === c
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 表示切り替え */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setView("table")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "table" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Table2 size={16} />
              一覧
            </button>
            <button
              onClick={() => setView("chart")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "chart" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BarChart3 size={16} />
              グラフ
            </button>
          </div>

          <ResetButton
            classId={activeClass}
            passcode={passcode}
            onResetDone={() => fetchStats(activeClass)}
          />
        </div>

        {/* コンテンツ */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <RefreshCw className="animate-spin inline-block mb-2" size={24} />
            <p>読み込み中...</p>
          </div>
        ) : view === "table" ? (
          <StatsTable students={students} />
        ) : (
          <Charts students={students} classId={activeClass} />
        )}
      </main>

      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
          variant={modal.variant}
        />
      )}
    </div>
  );
}
