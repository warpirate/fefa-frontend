'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import '@/styles/components/account/Orders.css';

export default function OrdersPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Mock order data
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 2599,
      items: [
        {
          id: 1,
          name: 'Alpana Sunburst Elegance Drops Earrings',
          image: '/images/earrings.png',
          price: 1079,
          quantity: 1,
          size: 'One Size'
        },
        {
          id: 2,
          name: 'Pashmina Rimsha Dangler Earrings',
          image: '/images/earrings.png',
          price: 959,
          quantity: 1,
          size: 'One Size'
        }
      ],
      shippingAddress: '123 Main Street, City, State 12345',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 1899,
      items: [
        {
          id: 3,
          name: 'Gold Stud Earrings with Textured Finish',
          image: '/images/earrings.png',
          price: 1899,
          quantity: 1,
          size: 'One Size'
        }
      ],
      shippingAddress: '123 Main Street, City, State 12345',
      trackingNumber: 'TRK987654321'
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'processing',
      total: 3299,
      items: [
        {
          id: 4,
          name: 'Silver Choker with Floral Motifs',
          image: '/images/necklaces.png',
          price: 1499,
          quantity: 1,
          size: '16 inches'
        },
        {
          id: 5,
          name: 'Traditional Indian Jewelry Set',
          image: '/images/necklaces.png',
          price: 1799,
          quantity: 1,
          size: 'One Size'
        }
      ],
      shippingAddress: '123 Main Street, City, State 12345',
      trackingNumber: null
    },
    {
      id: 'ORD-004',
      date: '2023-12-28',
      status: 'cancelled',
      total: 899,
      items: [
        {
          id: 6,
          name: 'Alpana Lotus Blossom Studs',
          image: '/images/earrings.png',
          price: 899,
          quantity: 1,
          size: 'One Size'
        }
      ],
      shippingAddress: '123 Main Street, City, State 12345',
      trackingNumber: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-processing';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-script text-primary mb-2 sm:mb-4">My Orders</h1>
              <p className="text-dark-gray text-base sm:text-lg px-4">
                Track and manage your jewelry orders
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="orders-filter-tabs mb-6 sm:mb-8">
              <button
                className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('all')}
              >
                All Orders ({orders.length})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'processing' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('processing')}
              >
                Processing ({orders.filter(o => o.status === 'processing').length})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'shipped' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('shipped')}
              >
                Shipped ({orders.filter(o => o.status === 'shipped').length})
              </button>
              <button
                className={`filter-tab ${selectedFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('delivered')}
              >
                Delivered ({orders.filter(o => o.status === 'delivered').length})
              </button>
            </div>

            {/* Orders List */}
            <div className="orders-container">
              {filteredOrders.length === 0 ? (
                <div className="empty-orders">
                  <div className="empty-icon">📦</div>
                  <h3 className="empty-title">No orders found</h3>
                  <p className="empty-description">
                    {selectedFilter === 'all' 
                      ? "You haven't placed any orders yet." 
                      : `No ${selectedFilter} orders found.`
                    }
                  </p>
                  <Button href="/collections" className="mt-4">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    {/* Order Header */}
                    <div className="order-header">
                      <div className="order-info">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <p className="order-date">Placed on {formatDate(order.date)}</p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="order-total">₹{order.total.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <div className="item-image">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <div className="item-details">
                            <h4 className="item-name">{item.name}</h4>
                            <p className="item-size">Size: {item.size}</p>
                            <p className="item-quantity">Qty: {item.quantity}</p>
                          </div>
                          <div className="item-price">
                            <p className="price">₹{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="order-actions">
                      <div className="order-details">
                        <p className="shipping-address">
                          <strong>Shipping to:</strong> {order.shippingAddress}
                        </p>
                        {order.trackingNumber && (
                          <p className="tracking-number">
                            <strong>Tracking:</strong> {order.trackingNumber}
                          </p>
                        )}
                      </div>
                      <div className="action-buttons">
                        <Button
                          variant="outline"
                          className="action-btn"
                          onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        >
                          {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" className="action-btn">
                            Reorder
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button variant="outline" className="action-btn">
                            Track Package
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder === order.id && (
                      <div className="order-expanded">
                        <div className="expanded-section">
                          <h4>Order Timeline</h4>
                          <div className="timeline">
                            <div className="timeline-item completed">
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <p className="timeline-title">Order Placed</p>
                                <p className="timeline-date">{formatDate(order.date)}</p>
                              </div>
                            </div>
                            <div className={`timeline-item ${order.status === 'processing' ? 'current' : order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <p className="timeline-title">Processing</p>
                                <p className="timeline-date">
                                  {order.status === 'processing' ? 'In Progress' : formatDate(order.date)}
                                </p>
                              </div>
                            </div>
                            <div className={`timeline-item ${order.status === 'shipped' ? 'current' : order.status === 'delivered' ? 'completed' : ''}`}>
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <p className="timeline-title">Shipped</p>
                                <p className="timeline-date">
                                  {order.status === 'shipped' ? 'In Transit' : order.status === 'delivered' ? formatDate(order.date) : 'Pending'}
                                </p>
                              </div>
                            </div>
                            <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <p className="timeline-title">Delivered</p>
                                <p className="timeline-date">
                                  {order.status === 'delivered' ? formatDate(order.date) : 'Pending'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
