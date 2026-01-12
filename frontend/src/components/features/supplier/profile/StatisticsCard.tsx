interface StatisticsCardProps {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
  icon?: React.ReactNode;
}

export function StatisticsCard({ title, value, color, icon }: StatisticsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl md:text-2xl font-bold">{value}</div>
          <div className="text-xs md:text-sm opacity-90">{title}</div>
        </div>
        {icon && (
          <div className="text-2xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}