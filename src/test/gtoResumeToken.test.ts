import { describe, expect, it } from 'vitest';
import { issueResumeToken, verifyResumeToken } from '../../supabase/functions/gto-access/resumeToken';

const secret = 'test-only-signing-secret';
const session = '11111111-1111-4111-8111-111111111111';
const participant = '22222222-2222-4222-8222-222222222222';
const now = 1_800_000_000_000;

describe('GTO resume capability', () => {
  it('restores only the signed participant and session', async () => {
    const token = await issueResumeToken(secret, session, participant, now);
    expect(await verifyResumeToken(secret, token, now)).toEqual({ session, participant });
  });
  it('rejects altered participant IDs and signatures', async () => {
    const token = await issueResumeToken(secret, session, participant, now);
    const [, signature] = token.split('.');
    const forged = btoa(JSON.stringify({ session, participant: session, expires: now + 1000 })).replace(/=+$/, '');
    expect(await verifyResumeToken(secret, `${forged}.${signature}`, now)).toBeNull();
    expect(await verifyResumeToken('other-secret', token, now)).toBeNull();
  });
  it('rejects expired, missing and malformed credentials', async () => {
    const token = await issueResumeToken(secret, session, participant, now);
    expect(await verifyResumeToken(secret, token, now + 30 * 86400000)).toBeNull();
    for (const value of [null, {}, '', session, 'a.b.c', 'a'.repeat(1025)]) {
      expect(await verifyResumeToken(secret, value, now)).toBeNull();
    }
  });
});