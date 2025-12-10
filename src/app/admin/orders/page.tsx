'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MdSearch as Search,
  MdFilterList as Filter,
  MdVisibility as Eye,
  MdInventory as Package,
  MdPerson as User,
  MdCalendarToday as Calendar,
  MdAttachMoney as DollarSign,
  MdSwapVert as ArrowUpDown,
  MdMoreHoriz as MoreHorizontal
} from 'react-icons/md';

// Mock data - replace with actual API calls
const orders = [
  {
    id: 'ORD-001',
    orderNumber: 'FEFA-2024-001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 98765 43210'
    },
    items: [
      { name: 'Gold Necklace Set', quantity: 1, price: 25000 },
      { name: 'Silver Ring', quantity: 2, price: 8500 }
    ],
    total: 42000,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St, Mumbai, Maharashtra 400001',
      phone: '+91 98765 43210'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
  },
  {
    id: 'ORD-002',
    orderNumber: 'FEFA-2024-002',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91 98765 43211'
    },
    items: [
      { name: 'Diamond Earrings', quantity: 1, price: 45000 }
    ],
    total: 45000,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      name: 'Jane Smith',
      address: '456 Park Ave, Delhi, Delhi 110001',
      phone: '+91 98765 43211'
    },
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
  },
  {
    id: 'ORD-003',
    orderNumber: 'FEFA-2024-003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+91 98765 43212'
    },
    items: [
      { name: 'Pearl Bracelet', quantity: 1, price: 12000 },
      { name: 'Gold Chain', quantity: 1, price: 18000 }
    ],
    total: 30000,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Net Banking',
    shippingAddress: {
      name: 'Mike Johnson',
      address: '789 Oak St, Bangalore, Karnataka 560001',
      phone: '+91 98765 43212'
    },
    createdAt: '2024-01-13T11:20:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
  },
  {
    id: 'ORD-004',
    orderNumber: 'FEFA-2024-004',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+91 98765 43213'
    },
    items: [
      { name: 'Silver Pendant', quantity: 1, price: 6500 }
    ],
    total: 6500,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'COD',
    shippingAddress: {
      name: 'Sarah Wilson',
      address: '321 Pine St, Chennai, Tamil Nadu 600001',
      phone: '+91 98765 43213'
    },
    createdAt: '2024-01-12T16:10:00Z',
    updatedAt: '2024-01-12T16:10:00Z',
  },
  {
    id: 'ORD-005',
    orderNumber: 'FEFA-2024-005',
    customer: {
      name: 'David Brown',
      email: 'david@example.com',
      phone: '+91 98765 43214'
    },
    items: [
      { name: 'Platinum Ring', quantity: 1, price: 75000 }
    ],
    total: 75000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      name: 'David Brown',
      address: '654 Elm St, Hyderabad, Telangana 500001',
      phone: '+91 98765 43214'
    },
    createdAt: '2024-01-11T13:25:00Z',
    updatedAt: '2024-01-12T10:45:00Z',
  },
];

const statuses = ['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses = ['All', 'pending', 'paid', 'failed', 'refunded'];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      const matchesPaymentStatus = selectedPaymentStatus === 'All' || order.paymentStatus === selectedPaymentStatus;
      
      return matchesSearch && matchesStatus && matchesPaymentStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage customer orders and track their status
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {paymentStatuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('All');
                      setSelectedPaymentStatus('All');
                    }}
                    className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {order.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-900">
                        ₹{order.total.toLocaleString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="More Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('orderNumber')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Order</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('orderNumber')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('total')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Total</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('total')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('createdAt')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Date</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('createdAt')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {order.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items[0]?.name}
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="More Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
