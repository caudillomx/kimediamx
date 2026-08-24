import { describe, expect, it } from "vitest";
import { benchmarkAccountKey, titularAccountIds } from "./benchmarkAccountIdentity";

const accounts = [
  { id: "mauro-name", name: "Juan Mauro González Martínez", network: "x", profile_external_id: "191" },
  { id: "mauro-handle", name: "MauroGonzalezMa", network: "x", profile_external_id: "191" },
  { id: "ricardo", name: "Ricardo Narváez Martínez", network: "x", profile_external_id: "156" },
];

describe("benchmark account identity", () => {
  it("joins display-name and handle variants by platform identity", () => {
    expect(benchmarkAccountKey(accounts[0])).toBe(benchmarkAccountKey(accounts[1]));
  });

  it("never admits another person into the titular block", () => {
    expect([...titularAccountIds(accounts, "Juan Mauro González Martínez")].sort()).toEqual(["mauro-handle", "mauro-name"]);
  });
});