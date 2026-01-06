'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MdArrowBack as ArrowLeft,
  MdPerson as User,
  MdEmail as Mail,
  MdInventory as Package,
  MdStar as Star,
  MdCheckCircle as CheckCircle,
  MdCancel as XCircle,
  MdDelete as Trash2,
  MdCalendarToday as Calendar
} from 'react-icons/md';
import adminService from '../../../../services/adminService';

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: Array<{url: string; isPrimary?: boolean}>;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isApproved: boolean;
  isVerified: boolean;
  helpful: {
    count: number;
    users: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function ReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;
  
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all reviews and find the specific one
      const result = await adminService.getAllReviews({ limit: 1000 });
      
      if (result.success) {
        const foundReview = result.data.find((r: Review) => r._id === reviewId);
        if (foundReview) {
          setReview(foundReview);
        } else {
          setError('Review not found');
        }
      } else {
        setError(result.error || 'Failed to load review');
      }
    } catch (err) {
      setError('Failed to load review');
      console.error('Error loading review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!review) return;
    
    try {
      setProcessing(true);
      const result = await adminService.approveReview(review._id);
      
      if (result.success) {
        setReview({ ...review, isApproved: true });
        alert('Review approved successfully');
      } else {
        alert(result.error || 'Failed to approve review');
      }
    } catch (err) {
      alert('Failed to approve review');
      console.error('Error approving review:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!review) return;
    
    try {
      setProcessing(true);
      const result = await adminService.rejectReview(review._id);
      
      if (result.success) {
        setReview({ ...review, isApproved: false });
        alert('Review unapproved successfully');
      } else {
        alert(result.error || 'Failed to unapprove review');
      }
    } catch (err) {
      alert('Failed to unapprove review');
      console.error('Error unapproving review:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!review || !confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    try {
      setProcessing(true);
      const result = await adminService.deleteReview(review._id);
      
      if (result.success) {
        alert('Review deleted successfully');
        router.push('/admin/reviews');
      } else {
        alert(result.error || 'Failed to delete review');
      }
    } catch (err) {
      alert('Failed to delete review');
      console.error('Error deleting review:', err);
    } finally {
      setProcessing(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Review not found'}</p>
        </div>
        <Link
          href="/admin/reviews"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reviews
        </Link>
      </div>
    );
  }

  const productImage = review.product.images?.find(img => img.isPrimary)?.url || review.product.images?.[0]?.url;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/reviews"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              Submitted on {new Date(review.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {review.isApproved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approved
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Pending
              </>
            )}
          </span>
          {review.isVerified && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              ✓ Verified Purchase
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Review Content</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {/* Product Info */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={review.product.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <Link
                    href={`/product/${review.product.slug}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                  >
                    {review.product.name}
                  </Link>
                  <div className="flex items-center mt-2">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">{review.rating} out of 5</span>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-gray-900">{review.title}</h4>
              </div>

              {/* Review Comment */}
              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Review Images</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Helpful Count */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 mr-1" />
                  <span>{review.helpful?.count || 0} people found this helpful</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Customer</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {review.user.profileImage ? (
                    <img
                      src={review.user.profileImage}
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.user.firstName} {review.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{review.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Meta */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Review Information</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Created: {new Date(review.createdAt).toLocaleString()}</span>
                </div>
                {review.updatedAt !== review.createdAt && (
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Updated: {new Date(review.updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Actions</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3">
                {!review.isApproved ? (
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : 'Approve Review'}
                  </button>
                ) : (
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : 'Unapprove Review'}
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  disabled={processing}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Delete Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
