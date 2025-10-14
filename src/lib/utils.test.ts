import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('combina clases simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('omite valores falsy', () => {
    expect(cn('a', undefined, null, false && 'c')).toBe('a');
  });

  it('fusiona clases tailwind duplicadas', () => {
    // px-2 debe sobrescribir px-4 si el merge aplica orden de derecha a izquierda.
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });
});
