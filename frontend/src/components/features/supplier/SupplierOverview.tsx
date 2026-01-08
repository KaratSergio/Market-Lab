'use client';

interface User {
  id: string;
  email: string;
  roles?: string[];
  companyName?: string;
  phone?: string;
}

export function SupplierOverview({ user }: { user: User }) {
  //! mock data
  const stats = [
    { label: 'Total Products', value: '24', change: '+2 this week' },
    { label: 'Active Orders', value: '8', change: '3 pending' },
    { label: 'Monthly Revenue', value: '$4,280', change: '+12.5%' },
    { label: 'Customer Rating', value: '4.8/5', change: 'Based on 42 reviews' },
  ];

  const recentActivities = [
    { id: 1, action: 'New order received', time: '2 hours ago' },
    { id: 2, action: 'Product "Premium Widget" updated', time: '1 day ago' },
    { id: 3, action: 'Review added to "Basic Kit"', time: '2 days ago' },
    { id: 4, action: 'Profile information updated', time: '3 days ago' },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Update inventory for Q2', priority: 'High', due: 'Tomorrow' },
    { id: 2, task: 'Respond to customer inquiries', priority: 'Medium', due: 'In 2 days' },
    { id: 3, task: 'Review supplier agreement', priority: 'Low', due: 'Next week' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.companyName || user?.email}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-green-600 text-sm mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Tasks */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                <div className="text-blue-600 font-medium">Add New Product</div>
                <div className="text-blue-400 text-sm mt-1">Create listing</div>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
                <div className="text-green-600 font-medium">View Orders</div>
                <div className="text-green-400 text-sm mt-1">Manage requests</div>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                <div className="text-purple-600 font-medium">Analytics</div>
                <div className="text-purple-400 text-sm mt-1">View reports</div>
              </button>
              <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
                <div className="text-orange-600 font-medium">Messages</div>
                <div className="text-orange-400 text-sm mt-1">3 unread</div>
              </button>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {task.priority}
                      </span>
                      <span className="text-gray-500 text-sm">Due: {task.due}</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Mark as done
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}