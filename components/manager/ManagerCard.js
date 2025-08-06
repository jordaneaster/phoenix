export default function ManagerCard({ title, value, color = 'blue' }) {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${getColorClasses(color)}`}>{value}</p>
    </div>
  );
}
