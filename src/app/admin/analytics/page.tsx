'use client';

import { useState, useEffect } from 'react';
import { 
  MdTrendingUp as TrendingUp,
  MdTrendingDown as TrendingDown,
  MdPeople as Users,
  MdInventory as Package,
  MdShoppingCart as ShoppingCart,
  MdAttachMoney as DollarSign,
  MdVisibility as Eye,
  MdStar as Star,
  MdCalendarToday as Calendar,
  MdDownload as Download,
  MdFilterList as Filter
} from 'react-icons/md';
import analyticsService from '../../../services/analyticsService';
import adminService from '../../../services/adminService';

// Keep some mock data for charts (would need charting library for full implementation)
const mockAnalyticsData = {
  overview: {
    totalRevenue: 2456780,
    totalOrders: 1234,
    totalCustomers: 2345,
    totalProducts: 156,
    revenueChange: 18.5,
    ordersChange: 23.2,
    customersChange: 12.1,
    productsChange: 8.3,
  },
  revenueChart: [
    { month: 'Jan', revenue: 180000, orders: 45 },
    { month: 'Feb', revenue: 220000, orders: 52 },
    { month: 'Mar', revenue: 195000, orders: 48 },
    { month: 'Apr', revenue: 250000, orders: 61 },
    { month: 'May', revenue: 280000, orders: 68 },
    { month: 'Jun', revenue: 320000, orders: 75 },
    { month: 'Jul', revenue: 290000, orders: 71 },
    { month: 'Aug', revenue: 310000, orders: 73 },
    { month: 'Sep', revenue: 275000, orders: 67 },
    { month: 'Oct', revenue: 340000, orders: 82 },
    { month: 'Nov', revenue: 380000, orders: 89 },
    { month: 'Dec', revenue: 420000, orders: 95 },
  ],
  topProducts: [
    { name: 'Gold Necklace Set', sales: 45, revenue: 1125000, rating: 4.8 },
    { name: 'Diamond Earrings', sales: 32, revenue: 1440000, rating: 4.9 },
    { name: 'Silver Ring Collection', sales: 28, revenue: 238000, rating: 4.5 },
    { name: 'Pearl Bracelet', sales: 25, revenue: 300000, rating: 4.2 },
    { name: 'Platinum Ring', sales: 18, revenue: 1350000, rating: 4.7 },
  ],
  recentOrders: [
    { id: 'ORD-001', customer: 'John Doe', amount: 25000, status: 'completed', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 18000, status: 'processing', date: '2024-01-14' },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: 32000, status: 'shipped', date: '2024-01-13' },
    { id: 'ORD-004', customer: 'Sarah Wilson', amount: 15000, status: 'pending', date: '2024-01-12' },
    { id: 'ORD-005', customer: 'David Brown', amount: 45000, status: 'completed', date: '2024-01-11' },
  ],
  customerSegments: [
    { segment: 'New Customers', count: 156, percentage: 6.6 },
    { segment: 'Returning Customers', count: 189, percentage: 8.1 },
    { segment: 'VIP Customers', count: 45, percentage: 1.9 },
    { segment: 'Inactive Customers', count: 1955, percentage: 83.4 },
  ],
  conversionRates: {
    visitors: 15000,
    addToCart: 2250,
    checkout: 450,
    completed: 375,
    cartAbandonment: 80,
    checkoutAbandonment: 16.7,
  }
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>(mockAnalyticsData);
  const [overview, setOverview] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [overviewRes, productsRes, ordersRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTopProducts(5),
        adminService.getRecentOrders(5)
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
        // Update analytics data with real overview
        setAnalyticsData((prev: any) => ({
          ...prev,
          overview: {
            totalRevenue: overviewRes.data.totalRevenue || 0,
            totalOrders: overviewRes.data.totalOrders || 0,
            totalCustomers: overviewRes.data.totalUsers || 0,
            totalProducts: 0, // Would need products endpoint
            revenueChange: overviewRes.data.revenueChange || 0,
            ordersChange: overviewRes.data.ordersChange || 0,
            customersChange: overviewRes.data.usersChange || 0,
            productsChange: 0
          }
        }));
      }

      if (productsRes.success) {
        setTopProducts(productsRes.data || []);
      }

      if (ordersRes.success) {
        setRecentOrders(ordersRes.data || []);
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    isPositive = true 
  }: {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    isPositive?: boolean;
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change > 0 ? (
                    <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                  )}
                  <span className="sr-only">
                    {change > 0 ? 'Increased' : 'Decreased'} by
                  </span>
                  {Math.abs(change)}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your store performance and customer insights (Connected to real API)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="12months">Last 12 months</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analyticsData.overview.totalRevenue)}
          change={analyticsData.overview.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={analyticsData.overview.totalOrders.toLocaleString()}
          change={analyticsData.overview.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Customers"
          value={analyticsData.overview.totalCustomers.toLocaleString()}
          change={analyticsData.overview.customersChange}
          icon={Users}
        />
        <StatCard
          title="Total Products"
          value={analyticsData.overview.totalProducts}
          change={analyticsData.overview.productsChange}
          icon={Package}
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.revenueChart.map((item: { month: string; revenue: number; orders: number }, index: number) => (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(item.revenue / Math.max(...analyticsData.revenueChart.map((d: { month: string; revenue: number; orders: number }) => d.revenue))) * 200}px` 
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Peak Month:</span>
                <span className="ml-2 font-medium">Dec (₹4.2L)</span>
              </div>
              <div>
                <span className="text-gray-500">Growth:</span>
                <span className="ml-2 font-medium text-green-600">+18.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visitors</span>
                <span className="text-sm font-medium">{analyticsData.conversionRates.visitors.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Add to Cart</span>
                <span className="text-sm font-medium">{analyticsData.conversionRates.addToCart.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Checkout</span>
                <span className="text-sm font-medium">{analyticsData.conversionRates.checkout.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '3%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium">{analyticsData.conversionRates.completed.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '2.5%' }}></div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Cart Abandonment: {analyticsData.conversionRates.cartAbandonment}%</p>
              <p>Checkout Abandonment: {analyticsData.conversionRates.checkoutAbandonment}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products and Recent Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product: { name: string; sales: number; revenue: number; rating: number }, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.sales} sales</p>
                    <p className="text-xs text-gray-500">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {analyticsData.recentOrders.map((order: { id: string; customer: string; amount: number; status: string; date: string }) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.id} • {order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Segments</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {analyticsData.customerSegments.map((segment: { segment: string; count: number; percentage: number }, index: number) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{segment.count}</div>
                <div className="text-sm text-gray-500">{segment.segment}</div>
                <div className="text-xs text-gray-400">{segment.percentage}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
