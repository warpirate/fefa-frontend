'use client';

import { useState, useEffect } from 'react';
import { 
  MdAdd,
  MdSearch as Search,
  MdFilterList as Filter,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdVisibility as Eye,
  MdPerson as User,
  MdEmail as Mail,
  MdPhone as Phone,
  MdCalendarToday as Calendar,
  MdSwapVert as ArrowUpDown,
  MdMoreHoriz as MoreHorizontal,
  MdSecurity as Shield,
  MdVerifiedUser as ShieldCheck,
  MdRefresh as Refresh,
  MdError as ErrorIcon
} from 'react-icons/md';
import adminService from '../../../services/adminService';
import ViewModal from '../../../components/admin/ViewModal';
import EditModal from '../../../components/admin/EditModal';
import AddUserModal from '../../../components/admin/AddUserModal';

const roles = ['All', 'user', 'admin', 'super_admin'];
const statuses = ['All', 'Active', 'Inactive'];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getAllUsers({
        search: searchTerm,
        role: selectedRole === 'All' ? null : selectedRole,
        status: selectedStatus === 'All' ? null : selectedStatus.toLowerCase()
      });
      
      if (result.success) {
        setUsers(result.data.map(adminService.formatUserForDisplay));
      } else {
        setError(result.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const result = await adminService.deleteUser(id);
      
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
      } else {
        alert(result.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadUsers();
  };

  // Handle view user
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    // Convert display format back to edit format
    const editUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      profileImage: user.profileImage
    };
    setSelectedUser(editUser);
    setEditModalOpen(true);
  };

  // Handle save user changes
  const handleSaveUser = async (updatedData: any) => {
    try {
      setEditLoading(true);
      
      const result = await adminService.updateUser(selectedUser.id, updatedData);
      
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? { ...user, ...updatedData } : user
        ));
        setEditModalOpen(false);
        setSelectedUser(null);
        alert('User updated successfully!');
      } else {
        console.error('Update failed:', result.error);
        alert(result.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setEditLoading(false);
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setAddModalOpen(false);
    setSelectedUser(null);
  };

  // Handle add user success
  const handleAddUserSuccess = () => {
    loadUsers();
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = !searchTerm || 
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm));
      const matchesRole = selectedRole === 'All' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'All' || 
                           (selectedStatus === 'Active' && user.status === 'active') ||
                           (selectedStatus === 'Inactive' && user.status === 'inactive');
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (sortBy === 'lastLogin' || sortBy === 'createdAt') {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <ShieldCheck className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and their permissions
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading users...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage user accounts and their permissions
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ErrorIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading users</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and their permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <MdAdd className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
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
                  placeholder="Search users..."
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
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role === 'super_admin' ? 'Super Admin' : 
                         role === 'admin' ? 'Admin' : 
                         role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRole('All');
                      setSelectedStatus('All');
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

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">
                            {user.role === 'super_admin' ? 'Super Admin' : 
                             user.role === 'admin' ? 'Admin' : 
                             user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </span>
                        <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {user.orderCount} orders • ₹{user.totalSpent.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteLoading === user.id}
                      className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                      title="Delete User"
                    >
                      {deleteLoading === user.id ? (
                        <Refresh className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
                    onClick={() => toggleSort('firstName')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>User</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('firstName')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('totalSpent')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Total Spent</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('totalSpent')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('lastLogin')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Last Login</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('lastLogin')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {user.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">
                        {user.role === 'super_admin' ? 'Super Admin' : 
                         user.role === 'admin' ? 'Admin' : 
                         user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.orderCount} orders
                    </div>
                    <div className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{user.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteLoading === user.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete User"
                      >
                        {deleteLoading === user.id ? (
                          <Refresh className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Modals */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        data={selectedUser}
        onEdit={() => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
        type="user"
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        data={selectedUser}
        onSave={handleSaveUser}
        type="user"
        loading={editLoading}
      />

      <AddUserModal
        isOpen={addModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleAddUserSuccess}
      />
    </div>
  );
}
