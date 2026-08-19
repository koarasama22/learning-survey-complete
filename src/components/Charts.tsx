"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StudentData } from "@/lib/types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

interface ChartsProps {
  students: StudentData[];
  classId: string;
}

export function Charts({ students, classId }: ChartsProps) {
  // 合計時間ランキング（上位15名）
  const ranking = [...students]
    .filter((s) => s.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 15)
    .map((s) => ({
      name: `${s.attendanceNumber}番`,
      total: s.totalMinutes,
      count: s.submitCount,
    }));

  // 送信回数の分布
  const countDistribution = [
    { name: "1回", value: students.filter((s) => s.submitCount === 1).length },
    { name: "2-3回", value: students.filter((s) => s.submitCount >= 2 && s.submitCount <= 3).length },
    { name: "4-6回", value: students.filter((s) => s.submitCount >= 4 && s.submitCount <= 6).length },
    { name: "7回以上", value: students.filter((s) => s.submitCount >= 7).length },
  ].filter((d) => d.value > 0);

  // 全体サマリー
  const totalAll = students.reduce((sum, s) => sum + s.totalMinutes, 0);
  const avgAll =
    students.length > 0
      ? Math.round(totalAll / students.filter((s) => s.submitCount > 0).length) || 0
      : 0;
  const activeStudents = students.filter((s) => s.submitCount > 0).length;

  return (
    <div className="space-y-8">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">合計時間</p>
          <p className="text-2xl font-bold text-blue-800">{totalAll}</p>
          <p className="text-xs text-blue-500">分</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
          <p className="text-xs text-green-600 font-medium">平均時間</p>
          <p className="text-2xl font-bold text-green-800">{avgAll}</p>
          <p className="text-xs text-green-500">分/人</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
          <p className="text-xs text-amber-600 font-medium">提出者数</p>
          <p className="text-2xl font-bold text-amber-800">{activeStudents}</p>
          <p className="text-xs text-amber-500">人</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
          <p className="text-xs text-purple-600 font-medium">クラス</p>
          <p className="text-2xl font-bold text-purple-800">{classId}</p>
          <p className="text-xs text-purple-500">対象</p>
        </div>
      </div>

      {/* 棒グラフ */}
      {ranking.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-700 mb-4">合計時間ランキング（上位）</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ranking} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                formatter={(value: number) => [`${value} 分`, "合計"]}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 円グラフ */}
      {countDistribution.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-700 mb-4">送信回数の分布</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={countDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}人`}
              >
                {countDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {ranking.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          まだデータがありません
        </div>
      )}
    </div>
  );
}
