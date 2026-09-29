import { test, expect } from '@playwright/test';

test.describe('KLMCE ERP Zero-Trust E2E Test Suite', () => {

  // ==========================================
  // Test 1: Multi-Factor Authentication Gateway
  // ==========================================
  test('MFA Gateway: 2-Step Login Process with Role-based Redirection', async ({ page }) => {
    // 1. Intercept the initial login POST to mock an MFA challenge response
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 202, // Accepted - MFA Required
        contentType: 'application/json',
        body: JSON.stringify({
          challenge_token: "mock-mfa-challenge-jwt",
          requires_mfa: true,
        }),
      });
    });

    // 2. Intercept the TOTP verification POST to mock successful authentication
    await page.route('**/api/v1/auth/verify-mfa', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: "mock-access-token",
          role: "INSTITUTION_ADMIN"
        }),
        // Simulate Set-Cookie for HttpOnly JWT transmission
        headers: { 'Set-Cookie': 'refresh_token=mock_refresh; HttpOnly; Secure' }
      });
    });

    // 3. Execute the UI sequence
    await page.goto('/auth/login');
    
    // Fill initial credentials
    await page.fill('input[type="email"]', 'admin@klmce.edu');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Assert that the UI transitioned to the MFA challenge screen
    await expect(page.locator('text=Two-Factor Authentication')).toBeVisible();

    // Inject the 6-digit TOTP code (assuming a 6-input array structure)
    const totpInputs = page.locator('input[maxLength="1"]');
    await expect(totpInputs).toHaveCount(6);
    
    const mockCode = '123456';
    for (let i = 0; i < 6; i++) {
      await totpInputs.nth(i).fill(mockCode[i]);
    }
    
    // Ensure automatic submission or click submit
    await page.click('button:has-text("Verify Device")');

    // Assert successful redirection to the Admin dashboard based on decoded role
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  // ==========================================
  // Test 2: Drag-and-Drop Optimistic Rollback
  // ==========================================
  test('Optimistic UI Rollback: Catching PostgreSQL GiST Collision', async ({ page }) => {
    // Intercept the Timetable API to simulate a PostgreSQL 409 Exclusion Violation
    await page.route('**/api/v1/timetable/slots', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: "probs/timetable-collision",
          title: "Scheduling Conflict",
          status: 409,
          detail: "Database physical constraint violated: Prof. Turing is already booked at this time."
        }),
      });
    });

    await page.goto('/admin/timetable');

    // Wait for TanStack query hydration (mocked or live)
    await expect(page.locator('text=Unassigned Blocks')).toBeVisible();

    // Identify the draggable card and the destination matrix cell
    const draggableBlock = page.locator('div[data-rfd-draggable-id="drag-1"]');
    const destinationCell = page.locator('td[data-rfd-droppable-id="Monday|09:00:00|10:00:00"]');

    // Execute physical mouse drag-and-drop
    await draggableBlock.hover();
    await page.mouse.down();
    await destinationCell.hover();
    await page.mouse.up();

    // The UI should optimistically place it in the matrix momentarily
    await expect(destinationCell.locator('text=CS101')).toBeVisible();

    // ⚡ Assert Rollback: The API returns 409, forcing the React state to revert
    // The block must physically snap back to the sidebar
    const sidebar = page.locator('div[data-rfd-droppable-id="sidebar"]');
    await expect(sidebar.locator('text=CS101')).toBeVisible();
    await expect(destinationCell.locator('text=CS101')).not.toBeVisible();

    // Assert the RFC 7807 Toast Error is mapped accurately to the UI
    const toast = page.locator('text=Scheduling Conflict');
    await expect(toast).toBeVisible();
    await expect(page.locator('text=Database physical constraint violated')).toBeVisible();
  });

  // ==========================================
  // Test 3: Zero-Trust PWA Service Worker
  // ==========================================
  test('Service Worker Strict NetworkOnly Override in Airplane Mode', async ({ page, context }) => {
    // 1. Block the scan endpoint at the network layer to simulate full offline status
    await page.route('**/api/v1/attendance/scan', (route) => route.abort('internetdisconnected'));

    await page.goto('/student/scanner');

    // 2. Bypass the hardware camera loop by directly invoking the JS submission handler 
    // or simulating a mock QR decode payload. We'll execute a fetch from the browser context.
    
    // Evaluate the fetch directly in the browser context to ensure the Service Worker intercepts it
    const fetchResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/v1/attendance/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qr_payload: "mock-offline-token",
            latitude: 28.6139,
            longitude: 77.2090
          })
        });
        return { success: true, status: response.status };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    });

    // 3. Assert Zero-Trust Override:
    // If the Workbox background sync queue intercepted this (which is default PWA behavior), 
    // the fetch might artificially succeed (200 OK via mock offline sync).
    // Because we explicitly set `NetworkOnly`, the fetch MUST fail entirely when offline.
    
    expect(fetchResult.success).toBeFalsy();
    expect(fetchResult.error).toContain('Failed to fetch');

    // UI Assertion: Ensure the React error state triggers 
    // (Assuming the UI is mocked to trigger the exact error when fetch fails)
    // await expect(page.locator('text=Scan Failed')).toBeVisible();
  });

});
