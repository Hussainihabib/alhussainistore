import { useEffect, useState } from "react";
import api from "../api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");

        const response = await api.get("/admin/dashboard");

        setD(response.data);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      }
    };

    loadDashboard();
  }, []);

  // Loading State
  if (!d && !error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-brand text-lg font-semibold">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold text-red-600">
          Dashboard Error
        </h2>

        <p className="text-stone-600 mt-2">
          {error}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="btn-gold mt-5"
        >
          Retry
        </button>
      </div>
    );
  }

  // Safe fallback for backend data
  const cards = [
    [
      "TODAY'S SALES",
      `PKR ${(Number(d?.cards?.todaySales) || 0).toLocaleString()}`,
    ],
    [
      "THIS MONTH REVENUE",
      `PKR ${(Number(d?.cards?.monthRevenue) || 0).toLocaleString()}`,
    ],
    [
      "TOTAL REVENUE",
      `PKR ${(Number(d?.cards?.revenue) || 0).toLocaleString()}`,
    ],
    [
      "TOTAL ORDERS",
      Number(d?.cards?.totalOrders) || 0,
    ],
    [
      "PENDING ORDERS",
      Number(d?.cards?.pending) || 0,
    ],
    [
      "DELIVERED",
      Number(d?.cards?.delivered) || 0,
    ],
    [
      "CANCELLED",
      Number(d?.cards?.cancelled) || 0,
    ],
    [
      "LOW STOCK",
      Number(d?.cards?.lowStock) || 0,
    ],
    [
      "TOTAL CUSTOMERS",
      Number(d?.cards?.totalCustomers) || 0,
    ],
  ];

  const salesData = Array.isArray(d?.sales) ? d.sales : [];

  const statusData = Array.isArray(d?.statusCounts)
    ? d.statusCounts
    : [];

  const recentOrders = Array.isArray(d?.recentOrders)
    ? d.recentOrders
    : [];

  const topProducts = Array.isArray(d?.topProducts) ? d.topProducts : [];

  const categoryPerformance = Array.isArray(d?.categoryPerformance)
    ? d.categoryPerformance
    : [];

  const chartColors = [
    "#581845",
    "#D4AF37",
    "#457B9D",
    "#2A9D8F",
    "#E76F51",
    "#3ad214",
    "#b22121",
     
  ];

  return (
    <>
      {/* ================= PAGE TITLE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif text-brand">
            DASHBOARD
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Al-Hussaini Garments business overview
          </p>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
        {cards.map(([title, value]) => (
          <div
            className="card p-5"
            key={title}
          >
            <p className="text-xs text-stone-500 font-medium">
              {title}
            </p>

            <b className="text-xl md:text-2xl text-brand mt-2 block">
              {value}
            </b>
          </div>
        ))}
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid lg:grid-cols-2 gap-5 mt-6">

        {/* SALES CHART */}
        <div className="card p-5 h-80">
          <h3 className="font-bold mb-3">
            SALES OVERVIEW
          </h3>

          {salesData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="90%"
            >
              <LineChart data={salesData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#581845"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[85%] flex items-center justify-center text-stone-400">
              No sales data available
            </div>
          )}
        </div>

        {/* ORDER STATUS CHART */}
        <div className="card p-5 h-80">
          <h3 className="font-bold mb-3">
            ORDERS BY STATUS
          </h3>

          {statusData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="90%"
            >
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={90}
                  label
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={`status-${index}`}
                      fill={
                        chartColors[
                          index % chartColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[85%] flex items-center justify-center text-stone-400">
              No order status data available
            </div>
          )}
        </div>

      </div>

      {/* ================= TOP PRODUCTS / CATEGORY PERFORMANCE ================= */}
      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        <div className="card p-5 h-80">
          <h3 className="font-bold mb-3">TOP SELLING PRODUCTS</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalSold" fill="#581845" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[85%] flex items-center justify-center text-stone-400">
              No sales data available
            </div>
          )}
        </div>

        <div className="card p-5 h-80">
          <h3 className="font-bold mb-3">CATEGORY PERFORMANCE</h3>
          {categoryPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={categoryPerformance}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="unitsSold" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[85%] flex items-center justify-center text-stone-400">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* ================= RECENT ORDERS ================= */}
      <div className="card p-5 mt-6 overflow-x-auto">
        <h3 className="font-bold mb-4">
          RECENT ORDERS
        </h3>

        {recentOrders.length > 0 ? (
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    {order.orderId || "-"}
                  </td>

                  <td>
                    {order.customerName || "-"}
                  </td>

                  <td>
                    PKR{" "}
                    {(
                      Number(order.totalAmount) || 0
                    ).toLocaleString()}
                  </td>

                  <td>
                    <span className="text-sm">
                      {order.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-stone-400">
            No orders found yet.
          </div>
        )}
      </div>
    </>
  );
}