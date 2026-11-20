import { describe, expect, it } from 'vitest';
import { INE, COM, multiplier, normalizeWord, isClean, ACTIVITIES, cf27Key } from '@/data/centroFox2027';

describe('Centro Fox 2027 · cifras del caso', () => {
  it('ronda 1 de Adela Micha: B rinde 4.5 veces', () => {
    const r = INE.juego_cual_funciono[0];
    expect([r.A.interacciones, r.B.interacciones]).toEqual([19826, 89059]);
    expect(multiplier(r.A.interacciones, r.B.interacciones)).toBe(4.5);
  });
  it('ronda 3 de Azteca Noticias: 9.5 veces', () => {
    const r = INE.juego_cual_funciono[2];
    expect(multiplier(r.A.interacciones, r.B.interacciones)).toBe(9.5);
  });
  it('INE México pesa 0.3% y el PAN con Xóchitl 2.7%', () => {
    const q = INE.quien_se_llevo_la_conversacion;
    expect(q.find(a => a.actor.startsWith('INE México'))?.porcentaje).toBe(0.3);
    expect(q.find(a => a.actor.startsWith('Figuras del PAN'))?.porcentaje).toBe(2.7);
  });
  it('postura en la publicación de la Presidenta: 12 / 52 / 36', () => {
    expect(COM.publicaciones.find(p => p.id === 'fb2')?.postura_pct).toEqual({ alineado_con_emisor: 12, en_contra: 52, neutral_o_ruido: 36 });
  });
});
describe('Centro Fox 2027 · participación', () => {
  it('las claves caben en el límite de 40 caracteres de la tabla de votos', () => {
    ACTIVITIES.forEach(a => expect(cf27Key(a.id).length).toBeLessThanOrEqual(40));
  });
  it('la nube unifica acentos y mayúsculas y filtra groserías', () => {
    expect(normalizeWord('  Verificación ')).toBe('verificacion');
    expect(isClean(normalizeWord('Pendejo'))).toBe(false);
  });
});

import { verdict, activity as act } from '@/data/centroFox2027';
describe('Centro Fox 2027 · revelado', () => {
  it('si la mayoría acierta, dice qué porcentaje acertó', () => {
    expect(verdict({ A: 1, B: 3 }, ['A', 'B'], 'B')).toBe('El 75% de la sala acertó.');
  });
  it('si la mayoría falla, contrasta lo votado con lo que ganó', () => {
    expect(verdict({ A: 3, B: 1 }, ['A', 'B'], 'B')).toBe('La sala votó por “A”; en realidad ganó “B”.');
  });
  it('sin votos no inventa un veredicto', () => {
    expect(verdict({}, ['A', 'B'], 'B')).toBe('Todavía no hay votos de la sala.');
  });
  it('respuestas correctas salen de los datos: B en ambas rondas, Instagram, Sheinbaum, medios', () => {
    expect([act('v09').correct, act('v10').correct, act('v12').correct, act('v17').correct, act('v07').correct]).toEqual(['B', 'B', 'Instagram', 'Claudia Sheinbaum', 'Medios, periodistas e influencers']);
  });
});
