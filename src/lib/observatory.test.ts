import { describe, it, expect } from 'vitest';
import { balancedSignals, dailyMilestone, signalBrief, signalsCsv, canDiscoverObservatories, type Signal } from './observatory';
const make = (geographic_scope: string, relevance = 80) => ({ geographic_scope, relevance, title:'=unsafe', source_name:'Fuente', source_url:'https://example.com', vertical_slug:'educacion', summary:'Resumen', content_angle:'Ángulo', hook:'Gancho', channel:'Medios', published_at:'2026-10-19T12:00:00Z', is_milestone:true, is_reference:false } as Signal);
describe('Observatorio editorial', () => {
  it('reserva el panorama y la navegación entre observatorios al equipo interno', () => {
    expect(canDiscoverObservatories(null)).toBe(false);
    expect(canDiscoverObservatories('client')).toBe(false);
    for (const role of ['admin', 'editor', 'viewer']) expect(canDiscoverObservatories(role)).toBe(true);
  });
  it('mantiene 50/50 México/LatAm y Global en la edición mixta', () => {
    const result = balancedSignals([make('México/LatAm'), make('México/LatAm', 90), make('Global')]);
    expect(result.map(s => s.geographic_scope)).toEqual(['México/LatAm','Global']);
    expect(result[0].relevance).toBe(90);
  });
  it('el hito acepta notas de hasta 48 horas, no referencias históricas', () => {
    const now = Date.parse('2026-10-19T20:00:00Z');
    expect(dailyMilestone([make('Global')], now)?.title).toBe('=unsafe');
    expect(dailyMilestone([{ ...make('Global'), is_reference:true }], now)).toBeUndefined();
    expect(dailyMilestone([{ ...make('Global'), published_at:'2026-10-18T08:00:00Z' }], now)?.title).toBe('=unsafe');
    expect(dailyMilestone([{ ...make('Global'), published_at:'2026-10-17T19:59:59Z' }], now)).toBeUndefined();
    expect(dailyMilestone([{ ...make('Global'), published_at:'2026-10-20T00:00:00Z' }], now)).toBeUndefined();
  });
  it('conserva la fuente y el guion editorial al copiar un brief', () => {
    const brief = signalBrief({...make('Global'),content_plan:{audience:'Directivos',objective:'Evaluar una decisión',format:'Video',outline:['Abrir con la cifra verificada','Explicar su efecto'],brand_application:'Ejemplo documentado',alternative_hooks:['Una decisión informada'],cta:'Comparte tu caso',caution:'Verificar fecha'}});
    expect(brief).toContain('FUENTE: Fuente');
    expect(brief).toContain('1. Abrir con la cifra verificada\n2. Explicar su efecto');
    expect(brief).toContain('AUDIENCIA: Directivos');
  });
  it('exporta fuente y neutraliza fórmulas en CSV', () => {
    expect(signalsCsv([make('Global')])).toContain('"\'=unsafe"');
    expect(signalsCsv([make('Global')])).toContain('https://example.com');
  });
});