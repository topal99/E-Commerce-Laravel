'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Tipe untuk data penjualan
interface SalesData {
  date: string;
  total_sales: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export default function SalesChart({ data }: SalesChartProps) {
  // Fungsi untuk memformat angka menjadi format Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Grafik Penjualan (7 Hari Terakhir)</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => `Rp ${new Intl.NumberFormat('id-ID').format(value as number)}`}
            />
            <Tooltip formatter={(value) => formatRupiah(value as number)} />
            <Legend />
            <Line type="monotone" dataKey="total_sales" name="Total Penjualan" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}