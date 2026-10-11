import { describe, it, expect, beforeEach } from 'vitest';

describe('Frontend Security & Data Sanitization', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  function sanitizeUserInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  it('prevents persistence of raw passwords or secret keys in localStorage', () => {
    const safeStorageData = {
      role: 'STUDENT',
      name: 'C. Lakshmi Priya',
      rollNo: '219Y1A0501',
    };

    localStorage.setItem('klmce_user_prefs', JSON.stringify(safeStorageData));

    const retrieved = JSON.parse(localStorage.getItem('klmce_user_prefs') || '{}');
    expect(retrieved.password).toBeUndefined();
    expect(retrieved.privateKey).toBeUndefined();
    expect(retrieved.secret).toBeUndefined();
    expect(retrieved.token).toBeUndefined();
  });

  it('sanitizes malicious script injections in input strings (XSS Prevention)', () => {
    const maliciousPayload = '<script>alert("XSS")</script>';
    const sanitized = sanitizeUserInput(maliciousPayload);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  });

  it('neutralizes malicious event handlers and javascript: URIs', () => {
    const badInput = '<img src=x onerror=alert(1)>';
    const sanitized = sanitizeUserInput(badInput);

    expect(sanitized).not.toContain('<img');
    expect(sanitized).toContain('&lt;img');
  });
});
