import React from 'react';

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color = 'primary' }) => (
  <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-2">
    <div className="flex justify-between items-center text-text-secondary">
      <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      <span className={`material-symbols-outlined text-${color}-500`}>{icon}</span>
    </div>
    <span className="text-3xl font-black">{value}</span>
  </div>
);
