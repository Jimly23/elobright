export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">System overview and management statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stat Widgets */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-500 text-sm font-medium">Total Users</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">1,248</span>
            <span className="text-sm text-green-500 font-medium">+12%</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-500 text-sm font-medium">Active Exams</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">8</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-500 text-sm font-medium">Exams Taken (Today)</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">142</span>
            <span className="text-sm text-green-500 font-medium">+5%</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-500 text-sm font-medium">System Health</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-600">99.9%</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Recent User Registrations</h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
        </div>
        
        {/* Placeholder for table */}
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">John Doe</td>
                <td className="px-4 py-3">john@example.com</td>
                <td className="px-4 py-3">Student</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Jane Smith</td>
                <td className="px-4 py-3">jane@example.com</td>
                <td className="px-4 py-3">Teacher</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
