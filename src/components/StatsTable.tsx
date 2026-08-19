"use client";

import { StudentData } from "@/lib/types";

interface StatsTableProps {
  students: StudentData[];
}

export function StatsTable({ students }: StatsTableProps) {
  const sorted = [...students].sort((a, b) => {
    const numA = parseInt(a.attendanceNumber, 10) || 0;
    const numB = parseInt(b.attendanceNumber, 10) || 0;
    return numA - numB;
  });

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
        データがありません
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">出席番号</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">送信回数</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">合計（分）</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">平均（分）</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">
                最終送信
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const avg =
                s.submitCount > 0 ? Math.round(s.totalMinutes / s.submitCount) : 0;
              return (
                <tr
                  key={s.attendanceNumber}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {s.attendanceNumber}番
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{s.submitCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-700">
                    {s.totalMinutes}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{avg}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                    {s.lastSubmittedAt
                      ? new Date(s.lastSubmittedAt).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
