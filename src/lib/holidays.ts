import type { CustomOccasion } from "@/lib/types";
import { jalaaliMonthLength } from "@/lib/jalali";

export type Occasion = {
  title: string;
  official: boolean;
  customId?: string;
};

type Mark = { m: number; d: number; title: string };

const FIXED_OFFICIAL: Mark[] = [
  { m: 1, d: 1, title: "عید نوروز" },
  { m: 1, d: 2, title: "عید نوروز" },
  { m: 1, d: 3, title: "عید نوروز" },
  { m: 1, d: 4, title: "عید نوروز" },
  { m: 1, d: 12, title: "روز جمهوری اسلامی" },
  { m: 1, d: 13, title: "روز طبیعت" },
  { m: 3, d: 14, title: "رحلت امام خمینی" },
  { m: 3, d: 15, title: "قیام ۱۵ خرداد" },
  { m: 11, d: 22, title: "پیروزی انقلاب اسلامی" },
  { m: 12, d: 29, title: "ملی شدن صنعت نفت" },
];

const FIXED_CULTURAL: Mark[] = [
  { m: 2, d: 1, title: "بزرگداشت سعدی" },
  { m: 2, d: 10, title: "روز ملی خلیج فارس" },
  { m: 2, d: 11, title: "روز کارگر" },
  { m: 2, d: 12, title: "روز معلم" },
  { m: 2, d: 25, title: "بزرگداشت فردوسی" },
  { m: 3, d: 3, title: "آزادسازی خرمشهر" },
  { m: 6, d: 1, title: "روز پزشک" },
  { m: 7, d: 8, title: "بزرگداشت مولوی" },
  { m: 7, d: 20, title: "بزرگداشت حافظ" },
  { m: 8, d: 13, title: "روز دانش‌آموز" },
  { m: 8, d: 24, title: "روز کتاب و کتابخوانی" },
  { m: 9, d: 16, title: "روز دانشجو" },
  { m: 9, d: 30, title: "شب یلدا" },
  { m: 11, d: 12, title: "آغاز دهه فجر" },
  { m: 11, d: 19, title: "روز نیروی هوایی" },
  { m: 12, d: 5, title: "روز مهندس" },
  { m: 12, d: 15, title: "روز درختکاری" },
];

/** تعطیلات قمری سال‌های ۱۴۰۴ تا ۱۴۰۶ بر اساس تقویم رسمی. */
const LUNAR: Record<number, Mark[]> = {
  1404: [
    { m: 1, d: 1, title: "شهادت امام علی (ع)" },
    { m: 1, d: 11, title: "عید سعید فطر" },
    { m: 1, d: 12, title: "تعطیل عید فطر" },
    { m: 2, d: 4, title: "شهادت امام جعفر صادق (ع)" },
    { m: 3, d: 14, title: "شهادت امام محمد باقر (ع)" },
    { m: 3, d: 17, title: "عید سعید قربان" },
    { m: 3, d: 25, title: "عید سعید غدیر خم" },
    { m: 4, d: 14, title: "تاسوعای حسینی" },
    { m: 4, d: 15, title: "عاشورای حسینی" },
    { m: 5, d: 24, title: "اربعین حسینی" },
    { m: 6, d: 1, title: "رحلت پیامبر اکرم (ص) و شهادت امام حسن مجتبی (ع)" },
    { m: 6, d: 2, title: "شهادت امام رضا (ع)" },
    { m: 6, d: 10, title: "شهادت امام حسن عسکری (ع)" },
    { m: 6, d: 19, title: "میلاد پیامبر اکرم (ص) و امام جعفر صادق (ع)" },
    { m: 9, d: 3, title: "شهادت حضرت فاطمه زهرا (س)" },
    { m: 10, d: 12, title: "ولادت امام علی (ع) و روز پدر" },
    { m: 10, d: 26, title: "مبعث پیامبر اکرم (ص)" },
    { m: 11, d: 14, title: "ولادت امام زمان (عج)" },
    { m: 12, d: 19, title: "شهادت امام علی (ع)" },
    { m: 12, d: 29, title: "عید سعید فطر" },
  ],
  1405: [
    { m: 1, d: 1, title: "عید سعید فطر" },
    { m: 1, d: 2, title: "تعطیل عید فطر" },
    { m: 1, d: 25, title: "شهادت امام جعفر صادق (ع)" },
    { m: 3, d: 6, title: "عید سعید قربان" },
    { m: 3, d: 14, title: "عید سعید غدیر خم" },
    { m: 4, d: 3, title: "تاسوعای حسینی" },
    { m: 4, d: 4, title: "عاشورای حسینی" },
    { m: 5, d: 13, title: "اربعین حسینی" },
    { m: 5, d: 21, title: "رحلت پیامبر اکرم (ص) و شهادت امام حسن مجتبی (ع)" },
    { m: 5, d: 22, title: "شهادت امام رضا (ع)" },
    { m: 5, d: 30, title: "شهادت امام حسن عسکری (ع)" },
    { m: 6, d: 8, title: "میلاد پیامبر اکرم (ص) و امام جعفر صادق (ع)" },
    { m: 8, d: 22, title: "شهادت حضرت فاطمه زهرا (س)" },
    { m: 10, d: 2, title: "ولادت امام علی (ع) و روز پدر" },
    { m: 10, d: 16, title: "مبعث پیامبر اکرم (ص)" },
    { m: 11, d: 4, title: "ولادت امام زمان (عج)" },
    { m: 12, d: 9, title: "شهادت امام علی (ع)" },
    { m: 12, d: 19, title: "عید سعید فطر" },
    { m: 12, d: 20, title: "تعطیل عید فطر" },
  ],
  1406: [
    { m: 1, d: 14, title: "شهادت امام جعفر صادق (ع)" },
    { m: 2, d: 24, title: "شهادت امام محمد باقر (ع)" },
    { m: 2, d: 27, title: "عید سعید قربان" },
    { m: 3, d: 4, title: "عید سعید غدیر خم" },
    { m: 3, d: 24, title: "تاسوعای حسینی" },
    { m: 3, d: 25, title: "عاشورای حسینی" },
    { m: 5, d: 3, title: "اربعین حسینی" },
    { m: 5, d: 11, title: "رحلت پیامبر اکرم (ص) و شهادت امام حسن مجتبی (ع)" },
    { m: 5, d: 12, title: "شهادت امام رضا (ع)" },
    { m: 5, d: 20, title: "شهادت امام حسن عسکری (ع)" },
    { m: 5, d: 29, title: "میلاد پیامبر اکرم (ص) و امام جعفر صادق (ع)" },
    { m: 8, d: 12, title: "شهادت حضرت فاطمه زهرا (س)" },
    { m: 9, d: 21, title: "ولادت امام علی (ع) و روز پدر" },
    { m: 10, d: 5, title: "مبعث پیامبر اکرم (ص)" },
    { m: 10, d: 23, title: "ولادت امام زمان (عج)" },
    { m: 11, d: 28, title: "شهادت امام علی (ع)" },
    { m: 12, d: 8, title: "عید سعید فطر" },
    { m: 12, d: 9, title: "تعطیل عید فطر" },
  ],
};

export function hasLunarYear(year: number) {
  return Object.prototype.hasOwnProperty.call(LUNAR, year);
}

function pushUnique(list: Occasion[], item: Occasion) {
  if (list.some((entry) => entry.title === item.title)) return;
  list.push(item);
}

export function dayOccasions(
  y: number,
  m: number,
  d: number,
  customs: CustomOccasion[],
): Occasion[] {
  const items: Occasion[] = [];
  for (const mark of FIXED_OFFICIAL) {
    if (mark.m === m && mark.d === d) {
      pushUnique(items, { title: mark.title, official: true });
    }
  }
  for (const mark of LUNAR[y] ?? []) {
    if (mark.m === m && mark.d === d) {
      pushUnique(items, { title: mark.title, official: true });
    }
  }
  for (const mark of FIXED_CULTURAL) {
    if (mark.m === m && mark.d === d) {
      pushUnique(items, { title: mark.title, official: false });
    }
  }
  for (const custom of customs) {
    if (custom.y === y && custom.m === m && custom.d === d && custom.title.trim()) {
      pushUnique(items, {
        title: custom.title.trim(),
        official: custom.official,
        customId: custom.id,
      });
    }
  }
  return items;
}

export function isOfficialDay(y: number, m: number, d: number, customs: CustomOccasion[]) {
  return dayOccasions(y, m, d, customs).some((item) => item.official);
}

export function monthOccasionRows(y: number, m: number, customs: CustomOccasion[]) {
  const len = jalaaliMonthLength(y, m);
  const rows: { d: number; items: Occasion[] }[] = [];
  for (let d = 1; d <= len; d += 1) {
    const items = dayOccasions(y, m, d, customs);
    if (items.length) rows.push({ d, items });
  }
  return rows;
}

export function officialDayCount(y: number, m: number, customs: CustomOccasion[]) {
  const len = jalaaliMonthLength(y, m);
  let count = 0;
  for (let d = 1; d <= len; d += 1) {
    if (isOfficialDay(y, m, d, customs)) count += 1;
  }
  return count;
}

export function nextOfficial(
  y: number,
  m: number,
  d: number,
  customs: CustomOccasion[],
) {
  let yy = y;
  let mm = m;
  let dd = d;
  for (let step = 0; step < 70; step += 1) {
    dd += 1;
    const len = jalaaliMonthLength(yy, mm);
    if (dd > len) {
      dd = 1;
      mm += 1;
      if (mm > 12) {
        mm = 1;
        yy += 1;
      }
    }
    const official = dayOccasions(yy, mm, dd, customs).filter((item) => item.official);
    if (official.length) {
      return {
        y: yy,
        m: mm,
        d: dd,
        title: official.map((item) => item.title).join("، "),
      };
    }
  }
  return null;
}
