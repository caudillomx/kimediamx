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
