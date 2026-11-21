import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  from: vi.fn(),
  setHeader: vi.fn(),
  result: { data: [] as object[], error: null as object | null },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mock.from },
}));

import { teamToken, useCf27Teams } from '@/hooks/useCf27Teams';

async function mountTeams() {
  const container = document.createElement('div');
  const root = createRoot(container);
  const result = { current: null as ReturnType<typeof useCf27Teams> | null };
  function Probe() { result.current = useCf27Teams(); return null; }
  await act(async () => { root.render(<Probe />); });
  return { result, unmount: () => act(() => root.unmount()) };
}

describe('workshop capability-bearing reads', () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    localStorage.clear();
    vi.clearAllMocks();
    mock.result = { data: [], error: null };
    mock.setHeader.mockImplementation(() => Promise.resolve(mock.result));
    const builder = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      setHeader: mock.setHeader,
    };
    mock.from.mockReturnValue(builder);
  });

  it('sends the stable team capability only on workshop reads', async () => {
    const token = teamToken();
    expect(token).toMatch(/^[0-9a-f]{32}$/);
    expect(teamToken()).toBe(token);
    const { result, unmount } = await mountTeams();
    expect(result.current?.loaded).toBe(true);
    expect(mock.from).toHaveBeenCalledWith('cf27_teams');
    expect(mock.setHeader).toHaveBeenCalledWith('x-cf27-team-token', token);
    unmount();
  });

  it('clears previously displayed answers when a protected reload fails', async () => {
    mock.result = { data: [{ id: 'team-a' }], error: null };
    const { result, unmount } = await mountTeams();
    expect(result.current?.teams).toHaveLength(1);
    mock.result = { data: [], error: { message: 'Access denied' } };
    await act(async () => { await result.current?.reload(); });
    expect(result.current?.teams).toEqual([]);
    unmount();
  });
});