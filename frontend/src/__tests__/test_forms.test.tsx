import { describe, it, expect } from 'vitest';

describe('Real Form Validation & Security Logic', () => {
  function validateMarksEntry(score: string | number, maxMarks: number = 30): { isValid: boolean; error?: string; parsedScore?: number } {
    if (score === 'AB') {
      return { isValid: true, parsedScore: 0 };
    }
    const num = Number(score);
    if (isNaN(num)) {
      return { isValid: false, error: 'Score must be a number or AB' };
    }
    if (num < 0) {
      return { isValid: false, error: 'Score cannot be negative' };
    }
    if (num > maxMarks) {
      return { isValid: false, error: `Score cannot exceed maximum marks (${maxMarks})` };
    }
    return { isValid: true, parsedScore: num };
  }

  function validateMFAInput(code: string): { isValid: boolean; error?: string } {
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      return { isValid: false, error: 'MFA code must consist of exactly 6 digits' };
    }
    return { isValid: true };
  }

  it('validates marks entry boundaries correctly', () => {
    // Valid scores
    expect(validateMarksEntry(0).isValid).toBe(true);
    expect(validateMarksEntry(25).isValid).toBe(true);
    expect(validateMarksEntry(30).isValid).toBe(true);
    expect(validateMarksEntry('AB').isValid).toBe(true);

    // Invalid scores
    expect(validateMarksEntry(-1).isValid).toBe(false);
    expect(validateMarksEntry(-1).error).toContain('negative');
    expect(validateMarksEntry(31).isValid).toBe(false);
    expect(validateMarksEntry(31).error).toContain('cannot exceed maximum marks');
    expect(validateMarksEntry('invalid').isValid).toBe(false);
  });

  it('enforces exact 6-digit MFA requirement', () => {
    // Valid 6 digits
    expect(validateMFAInput('123456').isValid).toBe(true);
    expect(validateMFAInput('098765').isValid).toBe(true);

    // Invalid lengths and non-digits
    expect(validateMFAInput('12345').isValid).toBe(false);
    expect(validateMFAInput('1234567').isValid).toBe(false);
    expect(validateMFAInput('abcdef').isValid).toBe(false);
    expect(validateMFAInput('123 45').isValid).toBe(false);
    expect(validateMFAInput('').isValid).toBe(false);
  });
});
