import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('[data-karma-test-id="email-input"]')).toBeVisible()
    await expect(page.locator('[data-karma-test-id="password-input"]')).toBeVisible()
    await expect(page.locator('[data-karma-test-id="submit-btn"]')).toBeVisible()
  })
})

test.describe('Sign page - token validation', () => {
  test('should show error for invalid token', async ({ page }) => {
    await page.goto('/sign/invalid-token-12345')
    await expect(page.getByText('無効なリンクです')).toBeVisible({ timeout: 10000 })
  })

  test('should handle missing token gracefully', async ({ page }) => {
    await page.goto('/sign/')
    await expect(page).toHaveURL(/\/sign\//)
  })
})

test.describe('Security - XSS prevention', () => {
  test('should not execute script in sign page', async ({ page }) => {
    const xssToken = '<script>alert("xss")</script>'
    await page.goto(`/sign/${encodeURIComponent(xssToken)}`)
    // Should show error, not execute script
    const alerts: string[] = []
    page.on('dialog', (dialog) => {
      alerts.push(dialog.message())
      dialog.dismiss()
    })
    await page.waitForTimeout(2000)
    expect(alerts).toHaveLength(0)
  })
})

test.describe('Security - SQL injection prevention', () => {
  test('should handle SQL injection in token', async ({ page }) => {
    await page.goto("/sign/' OR 1=1 --")
    // Should not crash, should show invalid token
    await page.waitForTimeout(3000)
    // Page should load without server error
    expect(page.url()).toContain('/sign/')
  })
})

test.describe('Sign page - expired token', () => {
  test('should handle expired token via API', async ({ request }) => {
    const response = await request.get('/api/sign/verify?token=expired-fake-token')
    expect(response.status()).toBe(404)
  })
})

test.describe('API - unauthorized access', () => {
  test('should reject unauthenticated contact API access', async ({ request }) => {
    const response = await request.get('/api/contacts')
    expect(response.status()).toBe(401)
  })

  test('should reject unauthenticated template API access', async ({ request }) => {
    const response = await request.get('/api/templates')
    expect(response.status()).toBe(401)
  })

  test('should reject sign submit without token', async ({ request }) => {
    const response = await request.post('/api/sign/submit', {
      data: { signature_data: 'test' },
    })
    expect(response.status()).toBe(400)
  })
})
