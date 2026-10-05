import { test, expect } from '@playwright/test';

test.describe('Admissions Kanban Operations', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Authenticate as Institution Admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@klmce.edu');
    await page.fill('input[name="password"]', 'SuperSecret123!');
    await page.click('button[type="submit"]');
    
    // Wait for the secure redirect to resolve
    await page.waitForURL('/admin/dashboard');
  });

  test('should execute Optimistic UI drag-and-drop and verify backend state machine mutation', async ({ page }) => {
    // Navigate directly to the Kanban board
    await page.goto('/admin/admissions/board');

    // 1. Setup API Interception Engine
    // Spy on the outbound TanStack Query network request to verify the exact payload sent to FastAPI
    const patchRequestPromise = page.waitForRequest(
      request => request.url().includes('/api/v1/admissions/applicants/') && request.method() === 'PATCH'
    );

    // 2. Dynamic Locators for Kanban layout
    const registeredColumn = page.locator('[data-column-id="REGISTERED"]');
    const provisionalColumn = page.locator('[data-column-id="PROVISIONAL"]');
    
    // Isolate the first applicant card living inside the 'Registered' swimlane
    const applicantCard = registeredColumn.locator('.applicant-card').first();
    const applicantName = await applicantCard.innerText();

    // 3. Execute Playwright's native Drag-and-Drop hardware simulation
    await applicantCard.dragTo(provisionalColumn);

    // 4. Assert Frontend: Optimistic UI Engine
    // The UI should instantaneously snap the card to the new column without waiting for the network
    await expect(provisionalColumn).toContainText(applicantName);
    await expect(registeredColumn).not.toContainText(applicantName);

    // 5. Assert Backend: Network Payload Integrity
    const patchRequest = await patchRequestPromise;
    const patchPayload = patchRequest.postDataJSON();
    
    // Validate that the correct State Machine transition flag was dispatched
    expect(patchPayload.status).toBe('PROVISIONAL');

    // 6. Assert Toast Notification Rendering
    const toast = page.locator('.toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Status Updated');
  });
});
