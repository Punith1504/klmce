import { test, expect } from '@playwright/test';

test.describe('Choice-Based Credit System (CBCS) High-Concurrency Registration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Authenticate as a standard Student
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@klmce.edu');
    await page.fill('input[name="password"]', 'StudentPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/student/dashboard');
  });

  test('should gracefully handle race conditions (409 Conflict) when physical capacity is exhausted', async ({ page }) => {
    // Navigate to the CBCS selection portal
    await page.goto('/student/academics/registration');

    // 1. Setup API Route MOCKING Engine
    // We explicitly hijack the outbound POST request and force it to fail.
    // This simulates the exact microsecond another student takes the final physical seat in the database.
    await page.route('**/api/v1/academics/registration', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'WAITLIST_FULL',
          message: 'The selected course CS401 has reached maximum physical capacity.'
        })
      });
    });

    // 2. Select the highly contested course (e.g., Advanced Machine Learning)
    const courseCard = page.locator('[data-course-id="CS401"]');
    await courseCard.click(); 
    
    // Attempt to lock in the registration
    const submitButton = page.locator('button:has-text("Enroll Now")');
    await submitButton.click();

    // 3. Assert Frontend Error Boundary rendering
    // The Next.js framework should intercept the 409 and render the specific UI fail-state
    const errorBoundary = page.locator('.course-error-boundary');
    await expect(errorBoundary).toBeVisible();
    await expect(errorBoundary).toContainText('Course Full');
    await expect(errorBoundary).toContainText('CS401 has reached maximum physical capacity');

    // 4. Assert System Locking mechanisms
    // The enrollment button MUST be disabled to prevent the student from spamming the backend database
    await expect(submitButton).toBeDisabled();
    
    // Verify the visual cue: The specific course card physically flashes red
    await expect(courseCard).toHaveClass(/border-rose-500/);
  });
});
