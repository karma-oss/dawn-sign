'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: '📊' },
  { href: '/contacts', label: 'コンタクト', icon: '👥' },
  { href: '/templates', label: 'テンプレート', icon: '📄' },
  { href: '/matrix', label: '同意マトリクス', icon: '📋' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b p-4">
        <h1 className="text-xl font-bold">DAWN SIGN</h1>
        <p className="text-xs text-gray-500">電子同意書管理</p>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              pathname === item.href
                ? 'bg-gray-100 font-medium text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
            data-karma-action={`navigate-${item.label}`}
            data-karma-context="sidebar-navigation"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
            data-karma-action="sign-out"
            data-karma-test-id="signout-btn"
          >
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  )
}
