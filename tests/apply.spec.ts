import { test, expect, CONFIRMATION, DUPLICATE_MESSAGE } from './fixtures';

test.describe('Job application', () => {
  test('submits a valid application and shows confirmation', async ({ application, page }) => {
    await application.fill({
      fullName: 'Ling Shen',
      email: 'ling.shen@example.com',
      role: 'QA Engineer',
    });
    await application.submit.click();

    await expect(page.getByText(CONFIRMATION)).toBeVisible();
  });

  test('shows all required messages when the form is empty', async ({ application, page }) => {
    await application.submit.click();

    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Role is required')).toBeVisible();
    await expect(page.getByText(CONFIRMATION)).toBeHidden();
  });

  test('shows validation errors for a missing name and invalid email', async ({ application, page }) => {
    await application.fill({
      email: 'not-an-email',
      role: 'QA Lead',
    });
    await application.submit.click();

    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Enter a valid email')).toBeVisible();
    await expect(page.getByText(CONFIRMATION)).toBeHidden();
  });

  test('treats whitespace-only name as empty', async ({ application, page }) => {
    await application.fill({
      fullName: '   ',
      email: 'ada@example.com',
      role: 'SDET',
    });
    await application.submit.click();

    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText(CONFIRMATION)).toBeHidden();
  });

  test('shows an error when role is not selected', async ({ application, page }) => {
    await application.fill({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    await application.submit.click();

    await expect(page.getByText('Role is required')).toBeVisible();
    await expect(page.getByText(CONFIRMATION)).toBeHidden();
  });

  test('rejects an email that already applied', async ({ application, page }) => {
    await application.fill({
      fullName: 'Alex Rivera',
      email: 'applied@example.com',
      role: 'SDET',
    });
    await application.submit.click();

    await expect(page.getByText(DUPLICATE_MESSAGE)).toBeVisible();
    await expect(page.getByText(CONFIRMATION)).toBeHidden();
  });

  test('rejects a duplicate email regardless of letter case', async ({ application, page }) => {
    await application.fill({
      fullName: 'Alex Rivera',
      email: 'Applied@Example.com',
      role: 'QA Engineer',
    });
    await application.submit.click();

    await expect(page.getByText(DUPLICATE_MESSAGE)).toBeVisible();
    await expect(page.getByText(CONFIRMATION)).toBeHidden();
  });

  test('allows a successful submit after the applicant fixes validation errors', async ({ application, page }) => {
    await application.fill({
      email: 'not-an-email',
      role: 'QA Lead',
    });
    await application.submit.click();
    await expect(page.getByText('Full name is required')).toBeVisible();

    await application.fill({
      fullName: 'Grace Hopper',
      email: 'grace.hopper@example.com',
    });
    await application.submit.click();

    await expect(page.getByText(CONFIRMATION)).toBeVisible();
  });
});
