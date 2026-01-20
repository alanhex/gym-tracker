'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function AccountPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      } else {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully' })
        await update()
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' })
      } else {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/login')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete account')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  // Update state when session loads
  if (session?.user?.name && name === '') {
    setName(session.user.name)
  }
  if (session?.user?.email && email === '') {
    setEmail(session.user.email)
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>

      {/* Profile Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
        </div>

        {profileMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            profileMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg pl-11 pr-4 py-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
              />
            </div>
          </div>

          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Password Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
        </div>

        {passwordMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            passwordMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
              className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition"
            />
          </div>

          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete Account
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
