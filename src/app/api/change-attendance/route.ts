import { NextRequest, NextResponse } from "next/server";

/**
 * 出席番号変更はクライアント側の localStorage のみを更新する仕様。
 * サーバー側ではパスワード検証のみ行い、実際のデータ移動はしない。
 * （出席番号は生徒端末に紐づくため）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, newAttendanceNumber } = body;

    const validPassword =
      password === process.env.STUDENT_CHANGE_PASSWORD || password === "12345";

    if (!validPassword) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 401 }
      );
    }

    const att = String(newAttendanceNumber || "").trim();
    if (!att) {
      return NextResponse.json(
        { error: "新しい出席番号を入力してください" },
        { status: 400 }
      );
    }

    // パスワードOKなら成功を返す（実際の保存はクライアントの localStorage）
    return NextResponse.json({
      success: true,
      newAttendanceNumber: att,
    });
  } catch (e: any) {
    console.error("change-attendance error:", e);
    return NextResponse.json(
      { error: "変更に失敗しました" },
      { status: 500 }
    );
  }
}
