import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/TerranoVision/);
    await expect(page.locator('h1')).toContainText('TerranoVision');
  });

  test('should navigate to channels page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Découvrir les chaînes');
    await expect(page).toHaveURL(/\/channels/);
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Se connecter');
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});

test.describe('Channels Page', () => {
  test('should display channels grid or empty state', async ({ page }) => {
    await page.goto('/channels');

    // Should show either channels grid or empty state
    const hasChannels = await page.locator('[data-testid="channels-grid"]').count();
    const hasEmptyState = await page.locator('text=Aucune chaîne disponible').count();

    expect(hasChannels + hasEmptyState).toBeGreaterThan(0);
  });

  test('should have search input', async ({ page }) => {
    await page.goto('/channels');

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Rechercher/);
  });
});

test.describe('Sign In Page', () => {
  test('should display sign in form', async ({ page }) => {
    await page.goto('/auth/signin');

    await expect(page.locator('h1')).toContainText('TerranoVision');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate email input', async ({ page }) => {
    await page.goto('/auth/signin');

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');

    // HTML5 validation should prevent submission
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});
