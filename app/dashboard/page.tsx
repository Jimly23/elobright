export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome to your personal dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sample Widget */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Exams Taken</span>
          <span className="text-3xl font-bold text-gray-900">12</span>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Average Score</span>
          <span className="text-3xl font-bold text-gray-900">85%</span>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Certifications</span>
          <span className="text-3xl font-bold text-gray-900">2</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
          No recent activity to display
        </div>
      </div>
    </div>
  );
}
