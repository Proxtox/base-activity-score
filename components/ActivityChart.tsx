'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MonthlyData } from '@/lib/types';
interface ActivityChartProps { data: MonthlyData[]; }
export default function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">No monthly activity data available</div>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={6}>
          <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#27272a' }} tickLine={{ stroke: '#27272a' }} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#27272a' }} tickLine={{ stroke: '#27272a' }} />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} cursor={{ fill: 'rgba(0, 82, 255, 0.1)' }} />
          <Bar dataKey="txs" fill="#0052FF" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}