'use client';

import { useState, useEffect } from 'react';
import { 
  MdPeople as Users,
  MdInventory as Package,
  MdShoppingCart as ShoppingCart,
  MdAttachMoney as DollarSign,
  MdTrendingUp as TrendingUp,
  MdVisibility as Eye,
  MdStar as Star,
  MdCalendarToday as Calendar,
  MdRefresh as Refresh,
  MdError as ErrorIcon
} from 'react-icons/md';
import adminService from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeBanners: 0,
    pendingReviews: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, ordersRes, usersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentOrders(4),
        adminService.getRecentUsers(3)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (ordersRes.success) {
        setRecentOrders(ordersRes.data);
      }

      if (usersRes.success) {
        setRecentUsers(usersRes.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Format stats for display
  const formattedStats = [
  {
    name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
    change: '+12%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
    change: '+8%',
    changeType: 'positive',
    icon: Package,
  },
  {
    name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
    change: '+23%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
    change: '+18%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active Banners',
      value: stats.activeBanners.toLocaleString(),
    change: '+2',
    changeType: 'positive',
    icon: Eye,
  },
  {
    name: 'Pending Reviews',
      value: stats.pendingReviews.toLocaleString(),
    change: '-3',
    changeType: 'negative',
    icon: Star,
  },
];

  // Format recent orders for display
  const formatOrder = (order: any) => ({
    id: order.orderNumber || order._id,
    customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unknown Customer',
    amount: `₹${order.totalAmount?.toLocaleString() || '0'}`,
    status: order.status || 'Pending',
    date: new Date(order.createdAt).toLocaleDateString(),
  });

  // Format recent users for display
  const formatUser = (user: any) => ({
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
    email: user.email || 'No email',
    joinDate: new Date(user.createdAt).toLocaleDateString(),
    orders: user.orderCount || 0,
  });

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ErrorIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Refresh className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between admin-slide-in-down">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold script-font admin-heading-1" style={{ color: 'var(--primary)' }}>Dashboard</h1>
          <p className="mt-1 text-sm sm:text-base admin-text" style={{ color: 'var(--dark-gray)' }}>
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="admin-btn admin-btn-primary mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Refresh className="h-4 w-4 mr-2 transition-transform duration-200 hover:rotate-180" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {formattedStats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-5 sm:py-6"
          >
            <dt>
              <div className="absolute rounded-md p-2 sm:p-3" style={{ backgroundColor: 'var(--accent)' }}>
                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="ml-14 sm:ml-20 text-xs font-medium leading-tight" style={{ color: 'var(--dark-gray)' }}>
                {stat.name}
              </p>
            </dt>
            <dd className="ml-14 sm:ml-20 flex items-baseline flex-wrap gap-1 sm:gap-2">
              <p className="text-base sm:text-lg font-semibold leading-tight" style={{ color: 'var(--primary)' }}>{stat.value}</p>
              <p
                className={`flex items-baseline text-xs font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp className="h-3 w-3 flex-shrink-0 self-center mr-1" />
                <span className="sr-only">
                  {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                </span>
                <span>{stat.change}</span>
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-3 py-4 sm:px-4 sm:py-5 lg:p-6">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 script-font" style={{ color: 'var(--primary)' }}>Recent Orders</h3>
            <div className="flow-root">
              <ul className="-my-3 sm:-my-5 divide-y divide-gray-200">
                {recentOrders.map((order) => {
                  const formattedOrder = formatOrder(order);
                  return (
                  <li key={formattedOrder.id} className="py-3 sm:py-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {formattedOrder.customer}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {formattedOrder.id} • {formattedOrder.date}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{formattedOrder.amount}</p>
                        <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formattedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          formattedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          formattedOrder.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formattedOrder.status}
                        </span>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-4 sm:mt-6">
              <a
                href="/admin/orders"
                className="w-full flex justify-center items-center px-3 py-2 sm:px-4 border shadow-sm text-xs sm:text-sm font-medium rounded-md text-white transition-all hover:opacity-90"
                style={{ 
                  borderColor: 'var(--primary)', 
                  backgroundColor: 'var(--primary)' 
                }}
              >
                View all orders
              </a>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-3 py-4 sm:px-4 sm:py-5 lg:p-6">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 script-font" style={{ color: 'var(--primary)' }}>Recent Users</h3>
            <div className="flow-root">
              <ul className="-my-3 sm:-my-5 divide-y divide-gray-200">
                {recentUsers.map((user, index) => {
                  const formattedUser = formatUser(user);
                  return (
                  <li key={index} className="py-3 sm:py-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {formattedUser.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {formattedUser.email}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs sm:text-sm text-gray-500">{formattedUser.joinDate}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {formattedUser.orders} orders
                        </p>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-4 sm:mt-6">
              <a
                href="/admin/users"
                className="w-full flex justify-center items-center px-3 py-2 sm:px-4 border shadow-sm text-xs sm:text-sm font-medium rounded-md text-white transition-all hover:opacity-90"
                style={{ 
                  borderColor: 'var(--primary)', 
                  backgroundColor: 'var(--primary)' 
                }}
              >
                View all users
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
