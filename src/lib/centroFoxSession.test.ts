import { describe, expect, it } from 'vitest';
import { foxLevel, foxQuestion, FOX_DIAG, FOX_SLIDES } from '@/data/centroFoxSession';
describe('Centro Fox session isolation and scoring', () => {
  it('keeps votes separate from CFL', () => { expect(foxQuestion('diag')).toBe('centro-fox-2026:diag'); expect(foxQuestion('fuentes')).not.toBe('fuentes'); });
  it('scores the eight questions with concrete level boundaries', () => { expect(FOX_DIAG).toHaveLength(8); expect(foxLevel(7)).toBe('Por fortalecer'); expect(foxLevel(8)).toBe('En desarrollo'); expect(foxLevel(12)).toBe('En desarrollo'); expect(foxLevel(13)).toBe('Práctica consistente'); });
  it('allocates ninety minutes across the session', () => { const agenda = FOX_SLIDES.find(s => s.kind === 'agenda'); expect(agenda?.items?.reduce((sum, item) => sum + parseInt(item.title), 0)).toBe(90); });
  it('gives each core axis twenty-five minutes', () => { const items=FOX_SLIDES.find(s=>s.kind==='agenda')?.items ?? []; expect(items.slice(1,4).map(i=>parseInt(i.title))).toEqual([25,25,25]); });
});