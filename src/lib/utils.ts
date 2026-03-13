import { format, differenceInMonths, startOfMonth, addMonths, getDaysInMonth, differenceInDays } from "date-fns";
import { MONTH_NAMES, type Locale } from "@/i18n/translations";

export function generatePayments(
  startDate: Date,
  endDate: Date,
  monthlyAmount: number
): Array<{ monthLabel: string; dueDate: Date; amount: number }> {
  const payments: Array<{ monthLabel: string; dueDate: Date; amount: number }> = [];
  let current = startOfMonth(startDate);
  const end = startOfMonth(endDate);

  while (current <= end) {
    const monthLabel = format(current, "MMMM yyyy");
    const dueDate = new Date(current.getFullYear(), current.getMonth(), 1);
    payments.push({ monthLabel, dueDate, amount: monthlyAmount });
    current = addMonths(current, 1);
  }

  return payments;
}

export function formatDateRange(startDate: Date, endDate: Date, locale: Locale): string {
  const months = MONTH_NAMES[locale];
  const startMonth = months[startDate.getMonth()];
  const endMonth = months[endDate.getMonth()];
  const startStr = `${startMonth} ${startDate.getDate()} ${startDate.getFullYear()}`;
  const endStr = `${endMonth} ${endDate.getDate()} ${endDate.getFullYear()}`;
  const totalMonths = differenceInMonths(endDate, startDate);
  const monthWord = locale === "ar" ? "أشهر" : "months";
  return `${startStr} → ${endStr} · ${totalMonths} ${monthWord}`;
}

export function getDaysLeftInMonth(): number {
  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  return daysInMonth - now.getDate();
}

export function getCurrentMonthName(locale: Locale): string {
  const months = MONTH_NAMES[locale];
  return months[new Date().getMonth()];
}

export function calculateFee(
  feeType: string | null,
  feeValue: number | null,
  monthlyAmount: number
): number {
  if (!feeType || feeValue == null) return 0;
  if (feeType === "percentage") return (feeValue / 100) * monthlyAmount;
  return feeValue;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u0600-\u06FF]+/g, (match) => match) // keep Arabic
    .replace(/[^\w\u0600-\u06FF\s-]/g, "") // remove special chars except Arabic
    .replace(/[\s_]+/g, "-") // spaces/underscores to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim hyphens
}

export async function uniqueSlug(
  baseSlug: string,
  model: { findFirst: (args: any) => Promise<any> },
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 0;
  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    const where: any = { slug: candidate };
    if (excludeId) where.id = { not: excludeId };
    const existing = await model.findFirst({ where });
    if (!existing) return candidate;
    counter++;
  }
}
