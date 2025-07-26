import {
  formatDate,
  getPriorityLabel,
  validateEmail,
  truncateText,
  isOverdue,
} from '../utils/helpers';
import { Priority } from '../types';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('should return "Today" for today\'s date', () => {
      const today = new Date().toISOString();
      expect(formatDate(today)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDate(yesterday.toISOString())).toBe('Yesterday');
    });

    it('should return "Tomorrow" for tomorrow\'s date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatDate(tomorrow.toISOString())).toBe('Tomorrow');
    });
  });

  describe('getPriorityLabel', () => {
    it('should return correct labels for priorities', () => {
      expect(getPriorityLabel(Priority.LOW)).toBe('Low');
      expect(getPriorityLabel(Priority.MEDIUM)).toBe('Medium');
      expect(getPriorityLabel(Priority.HIGH)).toBe('High');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very lo...');
    });

    it('should return original text if shorter than max length', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isOverdue(pastDate.toISOString())).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isOverdue(futureDate.toISOString())).toBe(false);
    });
  });
});