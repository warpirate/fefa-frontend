'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import './admin.css';
import { 
  MdDashboard as LayoutDashboard,
  MdInventory as Package,
  MdGridOn as Collections,
  MdFolderOpen as FolderOpen,
  MdCardGiftcard as Gift,
  MdImage as Image,
  MdShoppingCart as ShoppingCart,
  MdPeople as Users,
  MdStar as Star,
  MdBarChart as BarChart3,
  MdSettings as Settings,
  MdMenu as Menu,
  MdClose as X,
  MdLogout as LogOut,
  MdNotifications as Notifications,
  MdSearch as Search,
  MdAccountCircle as AccountCircle
} from 'react-icons/md';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Collections', href: '/admin/collections', icon: Collections },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Occasions', href: '/admin/occasions', icon: Gift },
  { name: 'Banners', href: '/admin/banners', icon: Image },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutInProgress, setIsLogoutInProgress] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedSidebarState !== null) {
      setSidebarCollapsed(JSON.parse(savedSidebarState));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element;
        if (!target.closest('[data-user-menu]')) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !isLogoutInProgress) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, isLogoutInProgress, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--soft-pink-100)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--soft-pink-100)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">Go to Home</Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsLogoutInProgress(true);
      await logout();
      // Redirect to home page after successful logout
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails and redirect to home page
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutInProgress(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen admin-fade-in" style={{ backgroundColor: 'var(--soft-pink-100)' }}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-out ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-all duration-300 ease-out backdrop-blur-sm" 
          onClick={closeSidebar} 
        />
        <div className={`relative flex w-72 sm:w-80 flex-col bg-white shadow-2xl transform transition-all duration-300 ease-out admin-slide-in-left ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Mobile header */}
          <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4" style={{ backgroundColor: 'var(--primary)' }}>
            <h1 className="text-lg sm:text-xl font-bold text-white script-font">FEFA Admin</h1>
            <button
              onClick={closeSidebar}
              className="text-white hover:text-gray-200 p-1 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Mobile search */}
          <div className="px-3 sm:px-4 py-3 border-b border-gray-200 admin-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-300 hover:border-gray-400 transform hover:scale-105 focus:scale-105"
              />
            </form>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 space-y-1 px-2 py-3 sm:py-4 overflow-y-auto admin-sidebar-scroll">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`admin-nav-item group flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isActive
                      ? 'text-white shadow-md border-l-4 border-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                  style={{ 
                    backgroundColor: isActive ? 'var(--accent)' : ''
                  }}
                  onClick={closeSidebar}
                >
                  <item.icon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile user info and logout */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4">
            <div className="flex items-center px-2 py-2 mb-2">
              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                <span className="text-xs font-medium text-white">
                  {user?.firstName?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              ) : (
              <LogOut className="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              )}
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-out admin-sidebar-transition ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-xl backdrop-blur-sm">
          {/* Desktop header */}
          <div className="flex h-16 items-center px-4" style={{ backgroundColor: 'var(--primary)' }}>
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <h1 className="text-xl font-bold text-white script-font">FEFA Admin</h1>
                <button
                  type="button"
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-md transition-colors"
                  onClick={toggleSidebar}
                  title="Collapse sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <button
                  type="button"
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-md transition-colors"
                  onClick={toggleSidebar}
                  title="Expand sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop search */}
          {!sidebarCollapsed && (
            <div className="px-4 py-4 border-b border-gray-200 admin-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all duration-300 hover:border-gray-400 transform hover:scale-105 focus:scale-105"
                />
              </form>
            </div>
          )}

          {/* Desktop navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto admin-sidebar-scroll">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`admin-nav-item group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isActive
                      ? 'text-white shadow-md border-l-4 border-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  } ${sidebarCollapsed ? 'sidebar-tooltip' : ''}`}
                  style={{ 
                    backgroundColor: isActive ? 'var(--accent)' : ''
                  }}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && <span className="sidebar-text">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Desktop user info and logout */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center px-2 py-2 mb-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                    <span className="text-xs font-medium text-white">
                      {user?.firstName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                      {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                    </p>
                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  ) : (
                  <LogOut className="mr-3 h-5 w-5" />
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                  <span className="text-xs font-medium text-white">
                    {user?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed sidebar-tooltip"
                  title="Logout"
                >
                  {isLoggingOut ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Top bar */}
        <div className="admin-topbar sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-gray-200 bg-white px-3 sm:px-4 lg:px-6 xl:px-8 shadow-sm backdrop-blur-sm">
          {/* Mobile menu button */}
          <button
            type="button"
            className="admin-btn-mobile -m-2 p-2 sm:-m-2.5 sm:p-2.5 text-gray-600 lg:hidden hover:bg-gray-100 rounded-md transition-all duration-300 transform hover:scale-110 active:scale-95"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200" />
          </button>

          {/* Spacer to push content to the right */}
          <div className="flex-1"></div>

          {/* Right side controls */}
          <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
            {/* Search - responsive */}
            <div className="hidden md:flex items-center admin-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search-input block w-48 lg:w-64 xl:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all duration-300 hover:border-gray-400 transform hover:scale-105 focus:scale-105"
                />
              </form>
            </div>

            {/* Notifications */}
            <button className="admin-notification-bell relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95">
              <Notifications className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200" />
              {notifications.length > 0 && (
                <span className="admin-notification-badge absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative admin-user-menu" data-user-menu>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`admin-user-button flex items-center gap-x-2 sm:gap-x-3 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-transparent ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700 hover:border-gray-600' : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200'}`}
              >
                <div className="admin-user-avatar h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center ring-2 ring-gray-100 transition-transform duration-200 hover:scale-110" style={{ backgroundColor: 'var(--accent)' }}>
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <span className={`text-sm font-medium block ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {user?.email || 'admin@fefajewelry.com'}
                  </span>
                </div>
                <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <div className={`admin-user-dropdown absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 z-50 border animate-dropdownSlideIn ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                      {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className={`flex w-full items-center px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {isLoggingOut ? (
                      <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <LogOut className="mr-3 h-4 w-4" />
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-4 sm:py-6" style={{ backgroundColor: 'var(--soft-pink-100)' }}>
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
