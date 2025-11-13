import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// orders: array of orders with createdAt/created_at and totalAmount/total_amount
const SalesChart = ({ orders = [] }) => {
  // Build data for last 6 months
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("vi-VN", {
      month: "short",
      year: "numeric",
    });
    months.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label,
      total: 0,
    });
  }

  orders.forEach((order) => {
    const created = new Date(
      order.createdAt || order.created_at || order.created_at
    );
    const key = `${created.getFullYear()}-${created.getMonth() + 1}`;
    const month = months.find((m) => m.key === key);
    const amount = Number(order.totalAmount || order.total_amount || 0) || 0;
    if (month) month.total += amount;
  });

  const data = months.map((m) => ({
    name: m.label,
    revenue: Math.round(m.total),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        Doanh thu theo tháng (6 tháng)
      </h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              tickFormatter={(v) => new Intl.NumberFormat("vi-VN").format(v)}
            />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6F4E37"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
