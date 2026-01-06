import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
    it('should merge class names', () => {
        const result = cn('foo', 'bar');
        expect(result).toBe('foo bar');
    });

    it('should handle conditional class names', () => {
        const isActive = false;
        const result = cn('foo', isActive && 'bar', 'baz');
        expect(result).toBe('foo baz');
    });

    it('should handle undefined and null values', () => {
        const result = cn('foo', undefined, null, 'bar');
        expect(result).toBe('foo bar');
    });

    it('should merge conflicting Tailwind classes', () => {
        // tailwind-merge should resolve conflicting classes
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toBe('py-1 px-4');
    });

    it('should handle object syntax', () => {
        const result = cn('foo', { bar: true, baz: false });
        expect(result).toBe('foo bar');
    });

    it('should handle array syntax', () => {
        const result = cn(['foo', 'bar']);
        expect(result).toBe('foo bar');
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should merge background colors correctly', () => {
        const result = cn('bg-red-500', 'bg-blue-500');
        expect(result).toBe('bg-blue-500');
    });

    it('should merge text sizes correctly', () => {
        const result = cn('text-sm', 'text-lg');
        expect(result).toBe('text-lg');
    });
});
