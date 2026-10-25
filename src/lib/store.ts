import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jalaaliMonthLength, shiftMonth as moveMonth, todayJalaali } from "@/lib/jalali";
import { dayContext } from "@/lib/leave-math";
import type { CustomOccasion, Employee, Leave, LeaveKind } from "@/lib/types";

type PersonInput = Omit<Employee, "id">;

type LeaveInput = {
  employeeId: string;
  y: number;
  m: number;
  d: number;
  portion: 0.5 | 1;
  kind: LeaveKind;
};

type Desk = {
  employees: Employee[];
  leaves: Leave[];
  customs: CustomOccasion[];
  thursdayOff: boolean;
  selectedId: string | null;
  viewY: number;
  viewM: number;
  addEmployee: (input: PersonInput) => void;
  updateEmployee: (id: string, input: PersonInput) => void;
  removeEmployee: (id: string) => void;
  setLeave: (input: LeaveInput) => void;
  clearLeave: (employeeId: string, y: number, m: number, d: number) => void;
  addCustom: (input: Omit<CustomOccasion, "id">) => void;
  removeCustom: (id: string) => void;
  setThursdayOff: (value: boolean) => void;
  select: (id: string) => void;
  setView: (y: number, m: number) => void;
  shiftMonth: (delta: number) => void;
  goToday: (y: number, m: number) => void;
  resetSample: (y: number, m: number) => void;
};

function leaveId(employeeId: string, y: number, m: number, d: number) {
  return `${employeeId}-${y}-${m}-${d}`;
}

function makeLeave(
  employeeId: string,
  y: number,
  m: number,
  d: number,
  kind: LeaveKind,
  portion: 0.5 | 1 = 1,
): Leave {
  return { id: leaveId(employeeId, y, m, d), employeeId, y, m, d, kind, portion };
}

export function sampleEmployees(): Employee[] {
  return [
    { id: "e1", name: "سارا محمدی", role: "مدیر منابع انسانی", hire: { y: 1399, m: 7, d: 1 } },
    { id: "e2", name: "علی رضایی", role: "کارشناس مالی", hire: { y: 1401, m: 2, d: 15 } },
    { id: "e3", name: "نسترن کاظمی", role: "طراح محصول", hire: { y: 1402, m: 9, d: 1 } },
    { id: "e4", name: "مهدی حسینی", role: "برنامه‌نویس", hire: { y: 1400, m: 4, d: 10 } },
    { id: "e5", name: "زهرا احمدی", role: "پشتیبان مشتریان", hire: { y: 1403, m: 1, d: 20 } },
    { id: "e6", name: "امیر نوری", role: "سرپرست فروش", hire: { y: 1398, m: 11, d: 5 } },
  ];
}

const LEGACY_SAMPLE_LEAVE_IDS = [
  "e1-1405-1-8",
  "e1-1405-4-6",
  "e1-1405-6-7",
  "e1-1405-7-5",
  "e1-1405-7-15",
  "e2-1405-2-6",
  "e2-1405-2-14",
  "e2-1405-5-4",
  "e2-1405-7-6",
  "e2-1405-7-7",
  "e3-1405-4-16",
  "e3-1405-6-14",
  "e3-1405-7-12",
  "e4-1405-5-18",
  "e4-1405-6-21",
  "e4-1405-7-18",
  "e4-1405-7-21",
  "e5-1405-2-14",
  "e5-1405-7-13",
  "e5-1405-7-25",
  "e5-1405-7-27",
  "e6-1405-4-6",
  "e6-1405-5-4",
  "e6-1405-7-29",
];

const SAMPLE_PLAN: Array<{
  id: string;
  delta: number;
  nth: number;
  kind: LeaveKind;
  portion: 0.5 | 1;
}> = [
  { id: "e1", delta: 0, nth: 0, kind: "annual", portion: 1 },
  { id: "e1", delta: 0, nth: 4, kind: "annual", portion: 0.5 },
  { id: "e1", delta: -1, nth: 2, kind: "annual", portion: 1 },
  { id: "e1", delta: -3, nth: 1, kind: "annual", portion: 1 },
  { id: "e2", delta: 0, nth: 1, kind: "annual", portion: 1 },
  { id: "e2", delta: 0, nth: 2, kind: "annual", portion: 1 },
  { id: "e2", delta: -1, nth: 5, kind: "annual", portion: 1 },
  { id: "e2", delta: -2, nth: 3, kind: "annual", portion: 1 },
  { id: "e3", delta: 0, nth: 3, kind: "sick", portion: 1 },
  { id: "e3", delta: -1, nth: 1, kind: "annual", portion: 1 },
  { id: "e3", delta: -2, nth: 6, kind: "sick", portion: 1 },
  { id: "e4", delta: 0, nth: 6, kind: "annual", portion: 0.5 },
  { id: "e4", delta: 0, nth: 8, kind: "annual", portion: 1 },
  { id: "e4", delta: -1, nth: 4, kind: "annual", portion: 1 },
  { id: "e5", delta: 0, nth: 5, kind: "unpaid", portion: 1 },
  { id: "e5", delta: 0, nth: 9, kind: "annual", portion: 0.5 },
  { id: "e5", delta: -1, nth: 2, kind: "annual", portion: 1 },
  { id: "e6", delta: 0, nth: 7, kind: "annual", portion: 1 },
  { id: "e6", delta: -1, nth: 0, kind: "annual", portion: 1 },
  { id: "e6", delta: -4, nth: 3, kind: "annual", portion: 1 },
];

function workdays(employee: Employee, y: number, m: number) {
  const len = jalaaliMonthLength(y, m);
  const days: number[] = [];
  for (let d = 1; d <= len; d += 1) {
    if (dayContext(employee, y, m, d, [], [], false).workable) days.push(d);
  }
  return days;
}

export function sampleLeaves(today = todayJalaali()): Leave[] {
  const byId = new Map(sampleEmployees().map((person) => [person.id, person]));
  const used = new Set<string>();
  const leaves: Leave[] = [];
  for (const item of SAMPLE_PLAN) {
    const person = byId.get(item.id);
    if (!person) continue;
    const { y, m } = moveMonth(today.jy, today.jm, item.delta);
    if (y < person.hire.y || (y === person.hire.y && m < person.hire.m)) continue;
    const days = workdays(person, y, m);
    if (!days.length) continue;
    let pick = days[Math.min(item.nth, days.length - 1)]!;
    const taken = (day: number) => used.has(`${item.id}-${y}-${m}-${day}`);
    if (taken(pick)) {
      const free = days.find((day) => !taken(day));
      if (free === undefined) continue;
      pick = free;
    }
    used.add(`${item.id}-${y}-${m}-${pick}`);
    leaves.push(makeLeave(item.id, y, m, pick, item.kind, item.portion));
  }
  return leaves;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readEmployees(value: unknown): Employee[] | null {
  if (!Array.isArray(value)) return null;
  const people: Employee[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const hire = item.hire;
    if (
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      !isRecord(hire) ||
      typeof hire.y !== "number" ||
      typeof hire.m !== "number" ||
      typeof hire.d !== "number"
    ) {
      return null;
    }
    people.push({
      id: item.id,
      name: item.name,
      role: typeof item.role === "string" ? item.role : "",
      hire: { y: hire.y, m: hire.m, d: hire.d },
    });
  }
  return people;
}

function readLeaves(value: unknown): Leave[] {
  if (!Array.isArray(value)) return [];
  const leaves: Leave[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const kind = item.kind;
    const portion = item.portion;
    if (
      typeof item.id !== "string" ||
      typeof item.employeeId !== "string" ||
      typeof item.y !== "number" ||
      typeof item.m !== "number" ||
      typeof item.d !== "number" ||
      (kind !== "annual" && kind !== "sick" && kind !== "unpaid") ||
      (portion !== 0.5 && portion !== 1)
    ) {
      continue;
    }
    leaves.push({
      id: item.id,
      employeeId: item.employeeId,
      y: item.y,
      m: item.m,
      d: item.d,
      kind,
      portion,
    });
  }
  return leaves;
}

function isLegacySample(employees: Employee[], leaves: Leave[], customs: CustomOccasion[]) {
  if (customs.length > 0) return false;
  const ids = employees.map((person) => person.id).sort().join(",");
  if (ids !== "e1,e2,e3,e4,e5,e6") return false;
  if (leaves.length !== LEGACY_SAMPLE_LEAVE_IDS.length) return false;
  const have = new Set(leaves.map((leave) => leave.id));
  return LEGACY_SAMPLE_LEAVE_IDS.every((id) => have.has(id));
}

function mergeSaved(persisted: unknown, current: Desk): Desk {
  if (!isRecord(persisted)) return current;
  const employees = readEmployees(persisted.employees);
  if (!employees) return current;
  const leaves = readLeaves(persisted.leaves);
  const customs = Array.isArray(persisted.customs)
    ? persisted.customs.filter((item): item is CustomOccasion => {
        if (!isRecord(item)) return false;
        return (
          typeof item.id === "string" &&
          typeof item.y === "number" &&
          typeof item.m === "number" &&
          typeof item.d === "number" &&
          typeof item.title === "string" &&
          typeof item.official === "boolean"
        );
      })
    : [];
  const today = todayJalaali();
  const legacy = isLegacySample(employees, leaves, customs);
  const viewY = typeof persisted.viewY === "number" ? persisted.viewY : current.viewY;
  const viewM = typeof persisted.viewM === "number" ? persisted.viewM : current.viewM;
  return {
    ...current,
    employees,
    leaves: legacy ? sampleLeaves(today) : leaves,
    customs,
    thursdayOff: typeof persisted.thursdayOff === "boolean" ? persisted.thursdayOff : current.thursdayOff,
    selectedId: typeof persisted.selectedId === "string" ? persisted.selectedId : employees[0]?.id ?? null,
    viewY: legacy ? today.jy : viewY,
    viewM: legacy ? today.jm : viewM,
  };
}

function cleanPerson(input: PersonInput): PersonInput {
  return {
    name: input.name.trim().replace(/\s+/g, " "),
    role: input.role.trim().replace(/\s+/g, " "),
    hire: input.hire,
  };
}

const bootToday = todayJalaali();

export const useDesk = create<Desk>()(
  persist(
    (set) => ({
      employees: sampleEmployees(),
      leaves: sampleLeaves(),
      customs: [],
      thursdayOff: false,
      selectedId: "e1",
      viewY: bootToday.jy,
      viewM: bootToday.jm,
      addEmployee: (input) =>
        set((state) => {
          const id = crypto.randomUUID();
          return {
            employees: [...state.employees, { ...cleanPerson(input), id }],
            selectedId: id,
          };
        }),
      updateEmployee: (id, input) =>
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === id ? { ...cleanPerson(input), id } : employee,
          ),
        })),
      removeEmployee: (id) =>
        set((state) => {
          const employees = state.employees.filter((employee) => employee.id !== id);
          return {
            employees,
            leaves: state.leaves.filter((leave) => leave.employeeId !== id),
            selectedId: state.selectedId === id ? (employees[0]?.id ?? null) : state.selectedId,
          };
        }),
      setLeave: (input) =>
        set((state) => {
          const employee = state.employees.find((item) => item.id === input.employeeId);
          if (!employee) return state;
          const ctx = dayContext(
            employee,
            input.y,
            input.m,
            input.d,
            state.leaves,
            state.customs,
            state.thursdayOff,
          );
          if (!ctx.workable) return state;
          const portion: 0.5 | 1 = input.portion === 0.5 ? 0.5 : 1;
          const next = makeLeave(input.employeeId, input.y, input.m, input.d, input.kind, portion);
          return {
            leaves: [...state.leaves.filter((leave) => leave.id !== next.id), next],
          };
        }),
      clearLeave: (employeeId, y, m, d) =>
        set((state) => ({
          leaves: state.leaves.filter((leave) => leave.id !== leaveId(employeeId, y, m, d)),
        })),
      addCustom: (input) =>
        set((state) => {
          const title = input.title.trim();
          const len = jalaaliMonthLength(input.y, input.m);
          if (!title || input.d < 1 || input.d > len) return state;
          return {
            customs: [
              ...state.customs,
              {
                id: crypto.randomUUID(),
                y: input.y,
                m: input.m,
                d: input.d,
                title,
                official: input.official,
              },
            ],
          };
        }),
      removeCustom: (id) =>
        set((state) => ({
          customs: state.customs.filter((item) => item.id !== id),
        })),
      setThursdayOff: (value) => set({ thursdayOff: value }),
      select: (id) => set({ selectedId: id }),
      setView: (y, m) => set({ viewY: y, viewM: m }),
      shiftMonth: (delta) =>
        set((state) => {
          const next = moveMonth(state.viewY, state.viewM, delta);
          return { viewY: next.y, viewM: next.m };
        }),
      goToday: (y, m) => set({ viewY: y, viewM: m }),
      resetSample: (y, m) =>
        set({
          employees: sampleEmployees(),
          leaves: sampleLeaves(),
          customs: [],
          thursdayOff: false,
          selectedId: "e1",
          viewY: y,
          viewM: m,
        }),
    }),
    {
      name: "rokhsat-desk",
      skipHydration: true,
      merge: mergeSaved,
      partialize: (state) => ({
        employees: state.employees,
        leaves: state.leaves,
        customs: state.customs,
        thursdayOff: state.thursdayOff,
        selectedId: state.selectedId,
        viewY: state.viewY,
        viewM: state.viewM,
      }),
    },
  ),
);
