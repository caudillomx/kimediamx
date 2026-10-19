import { describe, it, expect } from 'vitest';
import { balancedSignals, dailyMilestone, parrillaReturnPath, signalsCsv, type Signal } from './observatory';
const make = (geographic_scope: string, relevance = 80) => ({ geographic_scope, relevance, title:'=unsafe', source_name:'Fuente', source_url:'https://example.com', vertical_slug:'educacion', summary:'Resumen', content_angle:'Ángulo', hook:'Gancho', channel:'Medios', published_at:'2026-10-19T12:00:00Z', is_milestone:true, is_reference:false } as Signal);
describe('Observatorio editorial', () => {
  it('mantiene 50/50 México/LatAm y Global en la edición mixta', () => {
    const result = balancedSignals([make('México/LatAm'), make('México/LatAm', 90), make('Global')]);
    expect(result.map(s => s.geographic_scope)).toEqual(['México/LatAm','Global']);
    expect(result[0].relevance).toBe(90);
  });
  it('el hito solo corresponde a las últimas 24 horas, no referencias históricas', () => {
    const now = Date.parse('2026-10-19T20:00:00Z');
    expect(dailyMilestone([make('Global')], now)?.title).toBe('=unsafe');
    expect(dailyMilestone([{ ...make('Global'), is_reference:true }], now)).toBeUndefined();
    expect(dailyMilestone([{ ...make('Global'), published_at:'2026-10-18T19:59:59Z' }], now)).toBeUndefined();
    expect(dailyMilestone([{ ...make('Global'), published_at:'2026-10-20T00:00:00Z' }], now)).toBeUndefined();
  });
  it('solo permite volver a la Parrilla después de iniciar sesión', () => {
    expect(parrillaReturnPath('/parrilla?signal=12345678-1234-1234-1234-123456789abc')).toBe('/parrilla?signal=12345678-1234-1234-1234-123456789abc');
    expect(parrillaReturnPath('//evil.test')).toBe('/admin/operaciones');
  });
  it('exporta fuente y neutraliza fórmulas en CSV', () => {
    expect(signalsCsv([make('Global')])).toContain('"\'=unsafe"');
    expect(signalsCsv([make('Global')])).toContain('https://example.com');
  });
});