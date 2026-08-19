import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 全角数字を半角に変換 */
export function toHalfWidth(str: string): string {
  return str.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  ).replace(/[−ー－]/g, "-");
}

/** 学習時間が有効かチェック */
export function isValidMinutes(value: string | number): boolean {
  const num = Number(toHalfWidth(String(value)));
  return !isNaN(num) && num >= 0 && num <= 600;
}
