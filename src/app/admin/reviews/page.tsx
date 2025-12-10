'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MdSearch as Search,
  MdFilterList as Filter,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdVisibility as Eye,
  MdStar as Star,
  MdPerson as User,
  MdInventory as Package,
  MdCalendarToday as Calendar,
  MdSwapVert as ArrowUpDown,
  MdMoreHoriz as MoreHorizontal,
  MdCheckCircle as CheckCircle,
  MdCancel as XCircle,
  MdAccessTime as Clock
} from 'react-icons/md';

// Mock data - replace with actual API calls
const reviews = [
  {
    id: '1',
    product: {
      id: '1',
      name: 'Gold Necklace Set',
      image: '/images/products/necklace-1.jpg',
      slug: 'gold-necklace-set'
    },
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      profileImage: '/images/users/john.jpg'
    },
    rating: 5,
    title: 'Absolutely beautiful!',
    comment: 'The necklace is even more beautiful in person. The quality is excellent and it arrived perfectly packaged. Highly recommended!',
    status: 'approved',
    isVerified: true,
    helpful: 12,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    product: {
      id: '2',
      name: 'Silver Ring Collection',
      image: '/images/products/ring-1.jpg',
      slug: 'silver-ring-collection'
    },
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      profileImage: '/images/users/jane.jpg'
    },
    rating: 4,
    title: 'Good quality',
    comment: 'Nice ring, good quality. The delivery was fast and the packaging was secure.',
    status: 'approved',
    isVerified: true,
    helpful: 8,
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    product: {
      id: '3',
      name: 'Diamond Earrings',
      image: '/images/products/earrings-1.jpg',
      slug: 'diamond-earrings'
    },
    customer: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      profileImage: '/images/users/mike.jpg'
    },
    rating: 5,
    title: 'Stunning earrings!',
    comment: 'These earrings are absolutely gorgeous. The diamonds sparkle beautifully and the craftsmanship is top-notch. Worth every penny!',
    status: 'pending',
    isVerified: true,
    helpful: 15,
    createdAt: '2024-01-13T11:20:00Z',
    updatedAt: '2024-01-13T11:20:00Z',
  },
  {
    id: '4',
    product: {
      id: '4',
      name: 'Pearl Bracelet',
      image: '/images/products/bracelet-1.jpg',
      slug: 'pearl-bracelet'
    },
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      profileImage: '/images/users/sarah.jpg'
    },
    rating: 2,
    title: 'Not as expected',
    comment: 'The pearls look cheap and the bracelet is too small. Not worth the money.',
    status: 'rejected',
    isVerified: false,
    helpful: 3,
    createdAt: '2024-01-12T16:10:00Z',
    updatedAt: '2024-01-12T16:10:00Z',
  },
  {
    id: '5',
    product: {
      id: '5',
      name: 'Gold Chain',
      image: '/images/products/chain-1.jpg',
      slug: 'gold-chain'
    },
    customer: {
      name: 'David Brown',
      email: 'david@example.com',
      profileImage: '/images/users/david.jpg'
    },
    rating: 4,
    title: 'Nice chain',
    comment: 'Good quality gold chain. The length is perfect and it looks elegant.',
    status: 'approved',
    isVerified: true,
    helpful: 6,
    createdAt: '2024-01-11T13:25:00Z',
    updatedAt: '2024-01-11T13:25:00Z',
  },
  {
    id: '6',
    product: {
      id: '6',
      name: 'Silver Pendant',
      image: '/images/products/pendant-1.jpg',
      slug: 'silver-pendant'
    },
    customer: {
      name: 'Alice Green',
      email: 'alice@example.com',
      profileImage: '/images/users/alice.jpg'
    },
    rating: 5,
    title: 'Perfect gift!',
    comment: 'Bought this as a gift and the recipient loved it. Beautiful design and excellent quality.',
    status: 'pending',
    isVerified: true,
    helpful: 9,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
  },
];

const statuses = ['All', 'pending', 'approved', 'rejected'];
const ratings = ['All', '5', '4', '3', '2', '1'];

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = 
        review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || review.status === selectedStatus;
      const matchesRating = selectedRating === 'All' || review.rating.toString() === selectedRating;
      
      return matchesSearch && matchesStatus && matchesRating;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage customer reviews and ratings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  Rating
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>
                      {rating === 'All' ? 'All Ratings' : `${rating} Star${rating !== '1' ? 's' : ''}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Reviews ({filteredReviews.length})
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {filteredReviews.map((review) => (
            <li key={review.id} className="p-6">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    className="h-16 w-16 rounded-lg object-cover"
                    src={review.product.image}
                    alt={review.product.name}
                  />
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Product and Customer Info */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {review.product.name}
                        </Link>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          {review.customer.name}
                          {review.isVerified && (
                            <span className="ml-1 text-green-600" title="Verified Purchase">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating and Title */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {review.title}
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {review.comment}
                      </p>

                      {/* Review Meta */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {review.helpful} helpful
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusIcon(review.status)}
                        <span className="ml-1">
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          title="Reject"
                        >
                          Reject
                        </button>
                        <Link
                          href={`/admin/reviews/${review.id}`}
                          className="text-blue-600 hover:text-blue-800"
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
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
