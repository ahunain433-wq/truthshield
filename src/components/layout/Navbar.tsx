import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HomeIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/button'
import type { User } from '@/types'

const Navbar: React.FC = () => {
  const { currentUser, userData, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const handleLogout = async () => {
    try {
      await logout()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
    // TODO: Implement actual theme switching
  }

  // Navigation items for authenticated users
  const navigation = currentUser ? [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Upload', href: '/upload', icon: ArrowUpTrayIcon },
    { name: 'Analysis', href: '/analysis', icon: ShieldCheckIcon },
    { name: 'Legal Guidance', href: '/legal', icon: DocumentTextIcon },
    ...(userData?.role === 'admin' ? [{ name: 'Admin', href: '/admin', icon: CogIcon }] : [])
  ] : []

  const NavItem: React.FC<{ item: typeof navigation[0] }> = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        clsx(
          'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg mx-1 transition-all duration-200',
          isActive
            ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
        )
      }
      onClick={() => setMobileMenuOpen(false)}
    >
      <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
      {item.name}
    </NavLink>
  )

  const UserMenu: React.FC = () => (
    <div className="flex items-center space-x-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <MoonIcon className="h-5 w-5" />
        ) : (
          <SunIcon className="h-5 w-5" />
        )}
      </button>

      {/* Desktop User Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-gray-700">
            {userData?.fullName || currentUser?.displayName || currentUser?.email}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {userData?.role || 'User'}
          </span>
        </div>

        <div className="relative">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="h-8 w-8 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold border-2 border-gray-200">
              {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          size="sm"
        >
          Logout
        </Button>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          <span className="sr-only">Open main menu</span>
          {mobileMenuOpen ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-blue-700 hover:text-blue-800 transition-colors duration-200"
            >
              <img src="/icons/logo.png" alt="TruthShield logo" className="h-8 w-auto" />
              <span>TruthShield</span>
            </Link>
            </div>

            {/* Desktop Navigation Links */}
            {currentUser && (
              <div className="hidden md:ml-6 md:flex md:space-x-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Right side items */}
          {currentUser ? (
            <UserMenu />
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && currentUser && (
          <div className="md:hidden border-t border-gray-200 animate-slide-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}

              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-gray-200 mt-3">
                <div className="flex items-center space-x-3 mb-3">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="h-10 w-10 rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold border-2 border-gray-200">
                      {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {userData?.fullName || currentUser?.displayName || currentUser?.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userData?.role || 'User'}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full p-2"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar