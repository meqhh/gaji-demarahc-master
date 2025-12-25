import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Senin", value: 400 },
  { name: "Selasa", value: 300 },
  { name: "Rabu", value: 600 },
  { name: "Kamis", value: 850 },
  { name: "Jumat", value: 550 },
  { name: "Sabtu", value: 650 },
  { name: "Minggu", value: 750 },
];

export default function Chart() {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#d291e4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
