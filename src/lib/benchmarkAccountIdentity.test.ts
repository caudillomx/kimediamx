import { describe, expect, it } from "vitest";
import { benchmarkAccountKey, buildValidCompetitorMaps, titularAccountIds } from "./benchmarkAccountIdentity";

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

  it("accepts one-letter capture errors in a complete titular name", () => {
    const typo = { id: "rosario-typo", name: "Rosario Corona Amado", network: "tiktok", profile_external_id: "999" };
    expect(titularAccountIds([typo], "María del Rosario Corona Amador")).toEqual(new Set(["rosario-typo"]));
  });

  it("accepts known short-name variants only when they include a surname", () => {
    const regis = { id: "regis", name: "Regis Trujillo", network: "instagram", profile_external_id: "694" };
    const unrelated = { id: "unrelated", name: "Regis Martínez", network: "instagram", profile_external_id: "695" };
    expect(titularAccountIds([regis, unrelated], "Alma Regina Trujillo Domínguez")).toEqual(new Set(["regis"]));
  });

  it("does not use fuzzy matching for short or partial names", () => {
    const other = { id: "other", name: "Ricardo Martínez", network: "x", profile_external_id: "156" };
    expect(titularAccountIds([other], "Juan Mauro González Martínez")).toEqual(new Set());
  });

  it("applies the same titular validity to every report aggregation", () => {
    const mapped = buildValidCompetitorMaps(
      [
        { ...accounts[0], dependencia_id: "seguridad", account_type: "titular" },
        { ...accounts[2], dependencia_id: "seguridad", account_type: "titular" },
        { id: "institution", name: "Secretaría de Seguridad", network: "facebook", profile_external_id: "500", dependencia_id: "seguridad", account_type: "institucional" },
      ],
      [{ id: "seguridad", titular: "Juan Mauro González Martínez" }],
    );
    expect([...mapped.validIds].sort()).toEqual(["institution", "mauro-name"]);
    expect(mapped.depOfCompetitor.has("ricardo")).toBe(false);
  });
});