import { test as base, type Locator } from '@playwright/test';

type ApplicationFields = {
  fullName?: string;
  email?: string;
  role?: 'QA Engineer' | 'QA Lead' | 'SDET';
};

type Application = {
  fullName: Locator;
  email: Locator;
  role: Locator;
  submit: Locator;
  fill: (data: ApplicationFields) => Promise<void>;
};

export const CONFIRMATION = 'Application submitted. Confirmation QA-1001';
export const DUPLICATE_MESSAGE = 'An application with this email already exists';

export function uniqueEmail(prefix = 'applicant') {
  return `${prefix}-${crypto.randomUUID()}@example.com`;
}

export const test = base.extend<{ application: Application }>({
  application: async ({ page }, use) => {
    await page.goto('/');

    const fullName = page.getByLabel('Full name');
    const email = page.getByLabel('Email');
    const role = page.getByLabel('Role');
    const submit = page.getByRole('button', { name: 'Submit application' });

    await use({
      fullName,
      email,
      role,
      submit,
      fill: async (data) => {
        if (data.fullName !== undefined) {
          await fullName.fill(data.fullName);
        }
        if (data.email !== undefined) {
          await email.fill(data.email);
        }
        if (data.role !== undefined) {
          await role.selectOption(data.role);
        }
      },
    });
  },
});

export { expect } from '@playwright/test';
