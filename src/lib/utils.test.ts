import { describe, expect, it } from 'vitest';
import { isEventAutoArchived } from './utils';

const hour = 60 * 60 * 1000;
const iso = (ms: number) => new Date(ms).toISOString();

describe('isEventAutoArchived', () => {
  it('returns true when the DB flag is set, regardless of times', () => {
    expect(isEventAutoArchived({ is_archived: true, start_time: iso(Date.now() + hour) })).toBe(true);
  });

  it('returns true when end_time was more than an hour ago', () => {
    expect(isEventAutoArchived({ is_archived: false, end_time: iso(Date.now() - 2 * hour) })).toBe(true);
  });

  it('returns false when end_time is in the future', () => {
    expect(isEventAutoArchived({ is_archived: false, end_time: iso(Date.now() + hour) })).toBe(false);
  });

  it('returns false within the one-hour grace period after end', () => {
    expect(isEventAutoArchived({ is_archived: false, end_time: iso(Date.now() - 30 * 60 * 1000) })).toBe(false);
  });

  it('falls back to start_time + 3h when end_time is missing', () => {
    expect(isEventAutoArchived({ start_time: iso(Date.now() - 4 * hour) })).toBe(true);
    expect(isEventAutoArchived({ start_time: iso(Date.now() - hour) })).toBe(false);
  });

  it('returns false when there are no times at all', () => {
    expect(isEventAutoArchived({})).toBe(false);
  });
});
