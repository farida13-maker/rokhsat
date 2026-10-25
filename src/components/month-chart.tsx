import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { faDays } from "@/lib/jalali";

export type Slice = { name: string; value: number; fill: string };

function Tip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl bg-ink px-3 py-2 text-sm text-card shadow-card">
      {item?.name} · {faDays(Number(item?.value ?? 0))} روز
    </div>
  );
}

export function MonthChart({ slices }: { slices: Slice[] }) {
  const data = slices.filter((slice) => slice.value > 0);
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted">برای این ماه نموداری نیست.</p>;
  }
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={74}
            paddingAngle={2}
            stroke="var(--color-card)"
            isAnimationActive={false}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.fill} />
            ))}
          </Pie>
          <Tooltip content={<Tip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
