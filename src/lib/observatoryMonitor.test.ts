import {describe,it,expect} from 'vitest';
import {canonicalUrl,isRecent,verifiedDate,monitorSchedule,hasDirectTopicMatch} from '../../supabase/functions/observatory-monitor/core';
describe('Monitoreo del Observatorio',()=>{
 it('no admite una fecha reciente sin evidencia literal en la fuente',()=>{expect(verifiedDate('2026-10-19T12:00:00Z','19 octubre 2026','Contenido sin fecha')).toBeNull();});
 it('valida la fecha y no acepta futuras como hitos',()=>{const now=Date.parse('2026-10-19T20:00:00Z');expect(verifiedDate('2026-10-19T12:00:00Z','Publicado 19 octubre 2026','Publicado 19 octubre 2026',now)).toBe('2026-10-19T12:00:00.000Z');expect(isRecent('2026-10-20T00:00:00Z',now)).toBe(false);});
 it('deduplica URLs eliminando rastreo',()=>{expect(canonicalUrl('https://example.com/noticia?utm_source=x#contenido')).toBe('https://example.com/noticia');});
 it('revisa una vez al día a las 07:00 CDMX UTC-6',()=>{expect(monitorSchedule()).toBe('0 13 * * *');});
 it('solo asocia una nota a la vertical con relación directa y cita verificable',()=>{
  const source='Los docentes evalúan la recuperación educativa.';
  const matches=[{vertical:'educacion' as const,direct:true,reason:'El asunto central es aprendizaje.',evidence:source}];
  expect(hasDirectTopicMatch('educacion',matches,source)).toBe(true);
  expect(hasDirectTopicMatch('liderazgo',matches,source)).toBe(false);
 });
 it('rechaza menciones indirectas aunque exista evidencia literal',()=>{
  const source='La regulación laboral podría frenar inversiones.';
  expect(hasDirectTopicMatch('finanzas',[{vertical:'finanzas',direct:false,reason:'Inversión es una consecuencia secundaria.',evidence:source}],source)).toBe(false);
 });
 it('rechaza una asociación sin evidencia literal o sin justificación',()=>{
  const match={vertical:'pymes' as const,direct:true,reason:'Negocios pequeños son el asunto central.',evidence:'Las pequeñas empresas acceden a crédito.'};
  expect(hasDirectTopicMatch('pymes',[match],'Una empresa anuncia resultados.')).toBe(false);
  expect(hasDirectTopicMatch('pymes',[{...match,reason:''}],match.evidence)).toBe(false);
 });
});
