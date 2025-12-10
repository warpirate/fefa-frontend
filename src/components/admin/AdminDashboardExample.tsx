'use client';

import React from 'react';
import { 
  MdShoppingCart as ShoppingCart,
  MdPeople as Users,
  MdStar as Star,
  MdTrendingUp as TrendingUp,
  MdInventory as Package,
  MdAttachMoney as Money,
  MdSchedule as Schedule,
  MdCheckCircle as CheckCircle
} from 'react-icons/md';

const AdminDashboardExample = () => {
  const stats = [
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: ShoppingCart,
      iconType: 'primary'
    },
    {
      title: 'Active Users',
      value: '5,678',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      iconType: 'success'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+15%',
      changeType: 'positive',
      icon: Money,
      iconType: 'warning'
    },
    {
      title: 'Products',
      value: '234',
      change: '+3%',
      changeType: 'positive',
      icon: Package,
      iconType: 'info'
    }
  ];

  const recentOrders = [
    { id: '#1234', customer: 'John Doe', amount: '$299.99', status: 'delivered', date: '2024-01-15' },
    { id: '#1235', customer: 'Jane Smith', amount: '$149.99', status: 'processing', date: '2024-01-15' },
    { id: '#1236', customer: 'Bob Johnson', amount: '$89.99', status: 'shipped', date: '2024-01-14' },
    { id: '#1237', customer: 'Alice Brown', amount: '$199.99', status: 'pending', date: '2024-01-14' },
    { id: '#1238', customer: 'Charlie Wilson', amount: '$399.99', status: 'delivered', date: '2024-01-13' }
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="admin-card admin-slide-in-down">
        <div className="admin-card-header">
          <h1 className="admin-heading-1 script-font">Dashboard Overview</h1>
          <p className="admin-text-lg">Welcome back! Here's what's happening with your jewelry business today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`admin-stat-card admin-slide-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`admin-stat-icon ${stat.iconType}`}>
                <IconComponent />
              </div>
              <div className="admin-stat-value">{stat.value}</div>
              <div className="admin-stat-label">{stat.title}</div>
              <div className={`admin-stat-change ${stat.changeType}`}>
                <TrendingUp className="inline w-3 h-3 mr-1" />
                {stat.change} from last month
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="admin-card admin-slide-in-left">
          <div className="admin-card-header">
            <h3 className="admin-heading-3">Recent Orders</h3>
            <p className="admin-text-sm">Latest customer orders and their status</p>
          </div>
          <div className="admin-card-body p-0">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.id}</td>
                      <td>{order.customer}</td>
                      <td className="font-semibold">{order.amount}</td>
                      <td>
                        <span className={`admin-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="admin-text-sm">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="admin-card-footer">
            <button className="admin-btn admin-btn-primary admin-btn-mobile-full">
              View All Orders
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card admin-slide-in-right">
          <div className="admin-card-header">
            <h3 className="admin-heading-3">Quick Actions</h3>
            <p className="admin-text-sm">Common administrative tasks</p>
          </div>
          <div className="admin-card-body">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button className="admin-btn admin-btn-primary">
                <Package className="w-4 h-4 mr-2" />
                Add Product
              </button>
              <button className="admin-btn admin-btn-secondary">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </button>
              <button className="admin-btn admin-btn-accent">
                <Star className="w-4 h-4 mr-2" />
                View Reviews
              </button>
              <button className="admin-btn admin-btn-ghost">
                <Schedule className="w-4 h-4 mr-2" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="admin-card admin-fade-in">
        <div className="admin-card-header">
          <h3 className="admin-heading-3">Performance Metrics</h3>
          <p className="admin-text-sm">Key performance indicators for your business</p>
        </div>
        <div className="admin-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <div className="admin-stat-icon success mx-auto mb-4">
                <CheckCircle />
              </div>
              <div className="admin-stat-value">98.5%</div>
              <div className="admin-stat-label">Order Completion Rate</div>
              <div className="admin-stat-change positive">+2.1% from last month</div>
            </div>
            <div className="text-center">
              <div className="admin-stat-icon warning mx-auto mb-4">
                <Star />
              </div>
              <div className="admin-stat-value">4.8/5</div>
              <div className="admin-stat-label">Average Rating</div>
              <div className="admin-stat-change positive">+0.2 from last month</div>
            </div>
            <div className="text-center">
              <div className="admin-stat-icon info mx-auto mb-4">
                <TrendingUp />
              </div>
              <div className="admin-stat-value">23%</div>
              <div className="admin-stat-label">Growth Rate</div>
              <div className="admin-stat-change positive">+5% from last month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Showcase */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-heading-3">Button Styles Showcase</h3>
          <p className="admin-text-sm">Different button styles available in the admin theme</p>
        </div>
        <div className="admin-card-body">
          <div className="flex flex-wrap gap-4">
            <button className="admin-btn admin-btn-primary">Primary Button</button>
            <button className="admin-btn admin-btn-accent">Accent Button</button>
            <button className="admin-btn admin-btn-secondary">Secondary Button</button>
            <button className="admin-btn admin-btn-success">Success Button</button>
            <button className="admin-btn admin-btn-danger">Danger Button</button>
            <button className="admin-btn admin-btn-ghost">Ghost Button</button>
          </div>
        </div>
      </div>

      {/* Status Badges Showcase */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-heading-3">Status Badges Showcase</h3>
          <p className="admin-text-sm">Different status indicators for orders and items</p>
        </div>
        <div className="admin-card-body">
          <div className="flex flex-wrap gap-4">
            <span className="admin-badge status-active">Active</span>
            <span className="admin-badge status-inactive">Inactive</span>
            <span className="admin-badge status-pending">Pending</span>
            <span className="admin-badge status-processing">Processing</span>
            <span className="admin-badge status-shipped">Shipped</span>
            <span className="admin-badge status-delivered">Delivered</span>
            <span className="admin-badge status-cancelled">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardExample;
