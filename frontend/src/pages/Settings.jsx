import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  UserIcon, BellIcon, ClockIcon, MoonIcon, SunIcon,
  ShieldIcon, TrashIcon, SaveIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUser } from '../store/slices/authSlice';
import useTheme from '../hooks/useTheme';
import { userService } from '../services';

const SECTIONS = [
  { id: 'profile',      label: 'Profile',       icon: UserIcon },
  { id: 'appearance',   label: 'Appearance',    icon: MoonIcon },
  { id: 'pomodoro',     label: 'Pomodoro',      icon: ClockIcon },
  { id: 'notifications',label: 'Notifications', icon: BellIcon },
  { id: 'security',     label: 'Security',      icon: ShieldIcon },
  { id: 'danger',       label: 'Danger Zone',   icon: TrashIcon },
];

export default function Settings() {
  const dispatch     = useDispatch();
  const queryClient  = useQueryClient();
  const user         = useSelector(s => s.auth.user);
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState('profile');

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [pomSettings, setPomSettings] = useState({
    workDuration:  user?.preferences?.pomodoroSettings?.workDuration  || 25,
    shortBreak:    user?.preferences?.pomodoroSettings?.shortBreak    || 5,
    longBreak:     user?.preferences?.pomodoroSettings?.longBreak     || 15,
    sessionsUntilLong: user?.preferences?.pomodoroSettings?.sessionsUntilLong || 4,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: '',
  });

  const profileMutation = useMutation({
    mutationFn: () => userService.updateProfile(profile),
    onSuccess: (res) => {
      dispatch(updateUser(res.data));
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const prefMutation = useMutation({
    mutationFn: (prefs) => userService.updatePreferences(prefs),
    onSuccess: () => toast.success('Preferences saved!'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => userService.changePassword(passwords),
    onSuccess: () => {
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to change password'),
  });

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <nav className="w-48 flex-shrink-0 space-y-1">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
              section === id
                ? 'bg-primary-600/20 text-primary-400 font-medium'
                : 'text-zinc-400 hover:bg-zinc-800'
            } ${id === 'danger' ? 'text-red-400 hover:bg-red-900/20 mt-4' : ''}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <motion.div
        key={section}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 card p-6 space-y-6"
      >
        {section === 'profile' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white text-lg">Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold text-white">
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={profile.email} onChange={e => setProfile(f => ({ ...f, email: e.target.value }))} />
            </div>
            <button onClick={() => profileMutation.mutate()} className="btn btn-primary gap-2" disabled={profileMutation.isPending}>
              <SaveIcon className="w-4 h-4" />
              {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {section === 'appearance' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white text-lg">Appearance</h2>
            <div>
              <label className="label">Theme</label>
              <div className="flex gap-3 mt-2">
                {[
                  { key: 'dark',   label: 'Dark',   icon: MoonIcon },
                  { key: 'light',  label: 'Light',  icon: SunIcon  },
                  { key: 'system', label: 'System', icon: MoonIcon },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => { setTheme(key); prefMutation.mutate({ theme: key }); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      theme === key
                        ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === 'pomodoro' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white text-lg">🍅 Pomodoro Settings</h2>
            {[
              { key: 'workDuration',      label: 'Work Duration (min)',        min: 5,  max: 90  },
              { key: 'shortBreak',        label: 'Short Break (min)',           min: 1,  max: 30  },
              { key: 'longBreak',         label: 'Long Break (min)',            min: 5,  max: 60  },
              { key: 'sessionsUntilLong', label: 'Sessions until Long Break',  min: 1,  max: 10  },
            ].map(({ key, label, min, max }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={min} max={max}
                    value={pomSettings[key]}
                    onChange={e => setPomSettings(f => ({ ...f, [key]: Number(e.target.value) }))}
                    className="flex-1 accent-primary-600"
                  />
                  <span className="text-white font-mono w-8 text-center">{pomSettings[key]}</span>
                </div>
              </div>
            ))}
            <button
              onClick={() => prefMutation.mutate({ pomodoroSettings: pomSettings })}
              className="btn btn-primary gap-2"
              disabled={prefMutation.isPending}
            >
              <SaveIcon className="w-4 h-4" />
              {prefMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}

        {section === 'security' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white text-lg">Change Password</h2>
            {[
              { key: 'currentPassword',    label: 'Current Password',  placeholder: 'Current password' },
              { key: 'newPassword',        label: 'New Password',      placeholder: 'New password (8+ chars)' },
              { key: 'confirmNewPassword', label: 'Confirm Password',  placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="password"
                  className="input"
                  placeholder={placeholder}
                  value={passwords[key]}
                  onChange={e => setPasswords(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <button
              onClick={() => passwordMutation.mutate()}
              className="btn btn-primary gap-2"
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}

        {section === 'notifications' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-white text-lg">Notifications</h2>
            {[
              { key: 'taskReminders',   label: 'Task Reminders',       desc: 'Get notified before tasks are due' },
              { key: 'habitReminders',  label: 'Habit Reminders',      desc: 'Daily reminders for incomplete habits' },
              { key: 'streakAlerts',    label: 'Streak Alerts',        desc: 'Don\'t break your streaks' },
              { key: 'weeklyReport',    label: 'Weekly Report',        desc: 'Email summary every Sunday' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={user?.preferences?.notifications?.[key] !== false}
                  onChange={e => prefMutation.mutate({ notifications: { [key]: e.target.checked } })}
                  className="w-4 h-4 rounded border-zinc-600 text-primary-500 bg-zinc-800"
                />
              </div>
            ))}
          </div>
        )}

        {section === 'danger' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-red-400 text-lg">Danger Zone</h2>
            <div className="border border-red-900/50 rounded-xl p-4 bg-red-900/10">
              <p className="font-medium text-white">Delete Account</p>
              <p className="text-sm text-zinc-400 mt-1 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you absolutely sure? This cannot be undone.')) {
                    userService.deleteAccount().then(() => window.location.href = '/login');
                  }
                }}
                className="btn btn-danger"
              >
                <TrashIcon className="w-4 h-4" />
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
