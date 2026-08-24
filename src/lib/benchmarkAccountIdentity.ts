import { nameTokens } from "@/lib/entityNames";

export type BenchmarkAccount = {
  id: string;
  name: string;
  network: string;
  profile_external_id?: string | null;
  external_url?: string | null;
};

const normalized = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase().replace(/\/$/, "");

/** Stable account identity across exports that alternate between display name and handle. */
export function benchmarkAccountKey(account: BenchmarkAccount): string {
  const network = normalized(account.network);
  const externalId = normalized(account.profile_external_id);
  if (externalId) return `${network}|id:${externalId}`;
  const url = normalized(account.external_url)?.replace(/^https?:\/\/(www\.)?/, "");
  if (url) return `${network}|url:${url}`;
  return `${network}|name:${nameTokens(account.name).join("-")}`;
}

/**
 * A titular block may only contain the registered titular and aliases of the
 * exact same social accounts (same platform external id / URL).
 */
export function titularAccountIds(accounts: BenchmarkAccount[], titular: string | null): Set<string> {
  if (!titular) return new Set<string>();
  const expected = new Set(nameTokens(titular));
  const directlyNamed = accounts.filter((account) => {
    const actual = nameTokens(account.name);
    return actual.length >= 2 && actual.every((token) => expected.has(token)) && expected.size === new Set(actual).size;
  });
  const validKeys = new Set(directlyNamed.map(benchmarkAccountKey));
  return new Set(accounts.filter((account) => validKeys.has(benchmarkAccountKey(account))).map((account) => account.id));
}