import { describe, it, expect } from 'vitest';
import { attackerOf, targetOf } from '@/data/taller2027';
const teams = ['a', 'b', 'c'].map(id => ({ id }));
describe('pares del ejercicio 3', () => {
  it('cada equipo ataca la pieza del siguiente y el último la del primero', () => {
    expect(targetOf(teams, 'a')?.id).toBe('b');
    expect(targetOf(teams, 'c')?.id).toBe('a');
  });
  it('cada equipo recibe exactamente un ataque, aun con número impar', () => {
    const received = teams.map(t => teams.filter(x => targetOf(teams, x.id)?.id === t.id).length);
    expect(received).toEqual([1, 1, 1]);
    expect(attackerOf(teams, 'a')?.id).toBe('c');
  });
});

import { beforeElection, closingLine, segReady, FUNNEL, PRACTICES } from '@/data/taller2027';
describe('reglas del taller 2027', () => {
  it('la acción debe ser antes del 6 de junio de 2027', () => {
    expect(beforeElection('2027-06-05')).toBe(true);
    expect(beforeElection('2027-06-06')).toBe(false);
    expect(beforeElection(undefined)).toBe(false);
  });
  it('un segmento necesita tres capas y la casilla de consentimiento', () => {
    expect(segReady({ territorio: 'Centro', quienes: 'mamás', donde: 'Facebook' })).toBe(false);
    expect(segReady({ territorio: 'Centro', quienes: 'mamás', donde: 'Facebook', ok: true })).toBe(true);
    expect(segReady({ territorio: 'Centro', quienes: 'mamás', ok: true })).toBe(false);
  });
  it('el embudo termina en el seguimiento hasta la jornada electoral y el cierre incluye el megáfono', () => {
    expect(FUNNEL[FUNNEL.length - 1]).toBe('Seguimiento hasta la jornada electoral');
    expect(PRACTICES).toContain('Dejar de usar mis redes como megáfono');
  });
  it('el cierre contrasta la práctica menos común con el compromiso más votado', () => {
    expect(closingLine([5, 1, 3, 4], { 'Dejar de usar mis redes como megáfono': 6 })?.top).toBe('Dejar de usar mis redes como megáfono');
    expect(closingLine([5, 1, 3, 4], { x: 1 })?.least).toMatch(/^Verifico/);
  });
});
