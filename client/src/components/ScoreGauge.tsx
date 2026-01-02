import { Cell, Pie, PieChart, ResponsiveContainer, Label } from "recharts";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export function ScoreGauge({ score, label, size = 200 }: ScoreGaugeProps) {
  const data = [
    { name: "score", value: score },
    { name: "remainder", value: 100 - score },
  ];

  // Color logic based on score
  const getColor = (val: number) => {
    if (val >= 90) return "hsl(142, 71%, 45%)"; // Green
    if (val >= 70) return "hsl(45, 93%, 47%)";  // Yellow/Orange
    return "hsl(0, 84%, 60%)";                  // Red
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size / 2 + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={size * 0.35}
            outerRadius={size * 0.5}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-0 right-0 text-center -mt-2 transform translate-y-2">
        <div className="text-4xl font-bold font-display" style={{ color }}>{score}</div>
        {label && <div className="text-sm text-muted-foreground mt-1">{label}</div>}
      </div>
    </div>
  );
}
