'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  let { resolvedTheme, setTheme } = useTheme()
  let [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = resolvedTheme ?? 'light'
  const isDark = currentTheme === 'dark'
  const nextMode = isDark ? 'light' : 'dark'
  const iconClass = 'absolute inset-0 m-auto h-5 w-5 transition-all'
  const visibleIcon = 'rotate-0 scale-100 opacity-100'
  const hiddenIcon = 'rotate-90 scale-0 opacity-0'

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label={`Activate ${nextMode} mode`}
      onClick={() => setTheme(nextMode)}
      className="relative hover:bg-accent/10"
    >
      <Sun className={cn(iconClass, isDark ? hiddenIcon : visibleIcon)} />
      <Moon className={cn(iconClass, isDark ? visibleIcon : hiddenIcon)} />
    </Button>
  )
}
