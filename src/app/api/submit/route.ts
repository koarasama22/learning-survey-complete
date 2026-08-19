import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { CLASSES } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classId, attendanceNumber, minutes } = body;

    if (!classId || !attendanceNumber || minutes == null) {
      return NextResponse.json(
        { error: "必須項目（クラス・出席番号・学習時間）が不足しています" },
        { status: 400 }
      );
    }

    if (!CLASSES.includes(classId)) {
      return NextResponse.json({ error: "無効なクラスです" }, { status: 400 });
    }

    const mins = Number(minutes);
    if (isNaN(mins) || mins < 0 || mins > 600) {
      return NextResponse.json(
        { error: "学習時間は0〜600分で入力してください" },
        { status: 400 }
      );
    }

    const att = String(attendanceNumber).trim();
    if (!att) {
      return NextResponse.json({ error: "出席番号が無効です" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db
      .collection("classes")
      .doc(classId)
      .collection("students")
      .doc(att);

    const snap = await docRef.get();
    const now = new Date().toISOString();

    if (!snap.exists) {
      await docRef.set({
        attendanceNumber: att,
        times: [mins],
        totalMinutes: mins,
        submitCount: 1,
        lastSubmittedAt: now,
        updatedAt: now,
      });
    } else {
      // arrayUnion は重複値を追加しないため、明示的に配列を更新
      const data = snap.data()!;
      const newTimes = [...(data.times || []), mins];
      await docRef.update({
        times: newTimes,
        totalMinutes: FieldValue.increment(mins),
        submitCount: FieldValue.increment(1),
        lastSubmittedAt: now,
        updatedAt: now,
      });
    }

    const updated = (await docRef.get()).data();
    return NextResponse.json({
      success: true,
      totalMinutes: updated?.totalMinutes ?? mins,
      submitCount: updated?.submitCount ?? 1,
    });
  } catch (e: any) {
    console.error("submit error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
