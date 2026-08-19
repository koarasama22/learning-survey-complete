import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { CLASSES } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const passcode = req.headers.get("x-teacher-passcode");
    const validPass =
      passcode === process.env.TEACHER_PASSCODE || passcode === "sensei2026";

    if (!validPass) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }

    const body = await req.json();
    const { classId, all = false } = body;

    const targetClasses = all ? [...CLASSES] : [classId];

    if (!all && !CLASSES.includes(classId)) {
      return NextResponse.json({ error: "無効なクラスです" }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date().toISOString();

    for (const cid of targetClasses) {
      const snapshot = await db
        .collection("classes")
        .doc(cid)
        .collection("students")
        .get();

      if (snapshot.empty) continue;

      // バッチは500件制限があるため分割
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = db.batch();
        const chunk = docs.slice(i, i + 400);
        chunk.forEach((doc) => {
          batch.update(doc.ref, {
            times: [],
            totalMinutes: 0,
            submitCount: 0,
            lastSubmittedAt: null,
            updatedAt: now,
          });
        });
        await batch.commit();
      }
    }

    return NextResponse.json({
      success: true,
      message: all ? "全クラスをリセットしました" : `クラス ${classId} をリセットしました`,
    });
  } catch (e: any) {
    console.error("reset error:", e);
    return NextResponse.json(
      { error: "リセットに失敗しました" },
      { status: 500 }
    );
  }
}
