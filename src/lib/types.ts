export type LeaveKind = "annual" | "sick" | "unpaid";

export type Employee = {
  id: string;
  name: string;
  role: string;
  hire: { y: number; m: number; d: number };
};

export type Leave = {
  id: string;
  employeeId: string;
  y: number;
  m: number;
  d: number;
  portion: 0.5 | 1;
  kind: LeaveKind;
};

export type CustomOccasion = {
  id: string;
  y: number;
  m: number;
  d: number;
  title: string;
  official: boolean;
};

export const MONTHLY_ALLOWANCE = 2.5;

export const KIND_LABEL: Record<LeaveKind, string> = {
  annual: "استحقاقی",
  sick: "استعلاجی",
  unpaid: "بدون حقوق",
};

export const ROLES = [
  "مدیر",
  "سرپرست",
  "کارشناس منابع انسانی",
  "کارشناس مالی",
  "حسابدار",
  "برنامه‌نویس",
  "طراح محصول",
  "پشتیبان مشتریان",
  "کارشناس فروش",
  "کارمند اداری",
];
