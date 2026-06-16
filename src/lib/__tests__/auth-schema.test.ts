import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth-schema';

describe('signInSchema', () => {
  it('passes with valid email and password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes('email'));
      expect(emailError).toBeDefined();
      // Arabic message for invalid email
      expect(emailError?.message).toContain('بريد');
    }
  });

  it('fails with empty email', () => {
    const result = signInSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes('email'));
      expect(emailError).toBeDefined();
    }
  });

  it('fails with short password (less than 6 chars)', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find((i) => i.path.includes('password'));
      expect(passwordError).toBeDefined();
      expect(passwordError?.message).toContain('6');
    }
  });

  it('fails with empty password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('fails with missing fields', () => {
    const result = signInSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('fails with password exactly 5 characters', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('passes with password exactly 6 characters', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });
});

describe('signUpSchema', () => {
  const validInput = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('passes with valid input', () => {
    const result = signUpSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('fails with mismatched passwords', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      confirmPassword: 'Different1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      expect(confirmError).toBeDefined();
      expect(confirmError?.message).toContain('متطابقتين');
    }
  });

  it('fails with short name (less than 2 chars)', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      name: 'A',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('name'));
      expect(nameError).toBeDefined();
    }
  });

  it('fails with name exceeding 100 chars', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      name: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('fails with invalid email', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      email: 'not-email',
    });
    expect(result.success).toBe(false);
  });

  it('fails with password less than 8 chars', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    expect(result.success).toBe(false);
  });

  it('fails with password missing uppercase letter', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasUppercaseError = result.error.issues.some((i) =>
        i.path.includes('password') && i.message.includes('كبير')
      );
      expect(hasUppercaseError).toBe(true);
    }
  });

  it('fails with password missing lowercase letter', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      password: 'PASSWORD1',
      confirmPassword: 'PASSWORD1',
    });
    expect(result.success).toBe(false);
  });

  it('fails with password missing number', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      password: 'Password',
      confirmPassword: 'Password',
    });
    expect(result.success).toBe(false);
  });

  it('fails with missing required fields', () => {
    const result = signUpSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('fails with empty confirmPassword', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid phone number format', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      phone: '96512345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string for phone', () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      phone: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('forgotPasswordSchema', () => {
  it('passes with valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('fails with empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('passes with valid password and matching confirm', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPass1',
      confirmPassword: 'NewPass1',
    });
    expect(result.success).toBe(true);
  });

  it('fails with mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPass1',
      confirmPassword: 'Different1',
    });
    expect(result.success).toBe(false);
  });

  it('fails with weak password', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });
});
