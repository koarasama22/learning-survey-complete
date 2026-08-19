import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { CLASSES } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    // 簡易認証
    const passcode = req.headers.get("x-teacher-passcode");
    const validPass =
      passcode === process.env.TEACHER_PASSCODE || passcode === "sensei2026";

    if (!validPass) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }

    const { classId } = await params;

    if (!CLASSES.includes(classId as any)) {
      return NextResponse.json({ error: "無効なクラスです" }, { status: 400 });
    }

    const db = getAdminDb();
    const snapshot = await db
      .collection("classes")
      .doc(classId)
      .collection("students")
      .get();

    const students = snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => {
        const numA = parseInt(a.attendanceNumber, 10) || 0;
        const numB = parseInt(b.attendanceNumber, 10) || 0;
        return numA - numB;
      });

    return NextResponse.json({ classId, students });
  } catch (e: any) {
    console.error("stats error:", e);
    return NextResponse.json(
      { error: "データ取得に失敗しました" },
      { status: 500 }
    );
  }
}
