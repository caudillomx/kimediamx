-- Re-import objectives and milestones from Excel with correct mapping
-- Previous import had bugs: milestones were assigned to wrong objectives

DELETE FROM client_weekly_milestones;
DELETE FROM client_objectives;

-- Guanajuato
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Guanajuato', 'Garantizar la cuenta para todo el año', 'Capacitaciones ene-abr', 'Análisis – social listening', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Guanajuato' AND objective_text = 'Garantizar la cuenta para todo el año' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Entrega final Createca', 1, 1),
    (v_obj_id, 'Entrega parcial contrato 018', 2, 1),
    (v_obj_id, 'Entrega parcial contrato 018', 3, 1),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Entrega parcial contrato 018', 4, 1),
    (v_obj_id, 'Termina contrato 018 / capacitaciones', 4, 4);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Guanajuato', 'Aumentar el valor del trabajo actual', 'Monitoreo y análisis mensual', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Guanajuato' AND objective_text = 'Aumentar el valor del trabajo actual' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Entrega parcial contrato 018', 1, 1),
    (v_obj_id, 'Semana de Pascua', 4, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Guanajuato', 'Incrementar calidad del entregable diario y mensual', '', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Guanajuato' AND objective_text = 'Incrementar calidad del entregable diario y mensual' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Definición de calendario de capacitaciones', 1, 1);
END $$;

-- Actinver
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Actinver', 'Buscar aumentar valor al trabajo actual', 'Monitoreo diario y análisis mensual', 'Análisis – social listening', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Actinver' AND objective_text = 'Buscar aumentar valor al trabajo actual' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Reporte mensual de métricas', 1, 1),
    (v_obj_id, 'Día Actinver', 1, 3),
    (v_obj_id, 'Reporte mensual de métricas', 2, 1),
    (v_obj_id, 'Carrera Actinver', 2, 2),
    (v_obj_id, 'Reporte mensual de métricas', 3, 1),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Presentación mensual social listening', 4, 1),
    (v_obj_id, 'Reporte mensual de métricas', 5, 1),
    (v_obj_id, 'Reporte mensual de métricas', 6, 1),
    (v_obj_id, 'Análisis semestral - competencia', 6, 4),
    (v_obj_id, 'Reporte mensual de métricas', 7, 1),
    (v_obj_id, 'Reporte mensual de métricas', 8, 1),
    (v_obj_id, 'Reporte mensual de métricas', 9, 1),
    (v_obj_id, 'Reporte mensual de métricas', 10, 1),
    (v_obj_id, 'Reporte mensual de métricas', 11, 1),
    (v_obj_id, 'Reporte mensual de métricas', 12, 1),
    (v_obj_id, 'Premiación Reto Actinver', 12, 2);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Actinver', 'Incrementar calidad del entregable diario y mensual', '', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Actinver' AND objective_text = 'Incrementar calidad del entregable diario y mensual' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Presentación mensual social listening', 1, 1),
    (v_obj_id, 'Presentación mensual social listening', 2, 1),
    (v_obj_id, 'Presentación mensual social listening', 3, 1),
    (v_obj_id, 'Semana de Pascua', 4, 1),
    (v_obj_id, 'Presentación mensual social listening', 5, 1),
    (v_obj_id, 'Presentación mensual social listening', 6, 1),
    (v_obj_id, 'Presentación mensual social listening', 7, 1),
    (v_obj_id, 'Presentación mensual social listening', 8, 1),
    (v_obj_id, 'Presentación mensual social listening', 9, 1),
    (v_obj_id, 'Presentación mensual social listening', 10, 1),
    (v_obj_id, 'Presentación mensual social listening', 11, 1),
    (v_obj_id, 'Presentación mensual social listening', 12, 1);
END $$;

-- El Diluvio
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'El Diluvio', 'Crear comunidad participativa en redes sociales: X, Facebook, TikTok, Instagram, YouTube', 'Elaboración y edición de contenido para web y redes sociales: textos, imágenes, videos', 'Estrategia digital - community management', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'El Diluvio' AND objective_text = 'Crear comunidad participativa en redes sociales: X, Facebook, TikTok, Instagram, YouTube' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Lanzamiento - Num 6: Militarización', 1, 1),
    (v_obj_id, 'Reporte de métricas', 1, 2),
    (v_obj_id, 'Reporte de métricas', 1, 4),
    (v_obj_id, 'Lanzamiento - Num 7: Desigualdades', 2, 1),
    (v_obj_id, 'Reporte de métricas', 2, 2),
    (v_obj_id, 'Reporte de métricas', 2, 4),
    (v_obj_id, 'Reporte de métricas', 3, 2),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Semana de Pascua', 4, 1),
    (v_obj_id, 'Planeación mensual de contenido', 4, 4),
    (v_obj_id, 'Reporte de métricas', 5, 2),
    (v_obj_id, 'Reporte de métricas', 5, 4),
    (v_obj_id, 'Reporte de métricas', 6, 2),
    (v_obj_id, 'Reporte de métricas', 6, 4),
    (v_obj_id, 'Reporte de métricas', 7, 2),
    (v_obj_id, 'Reporte de métricas', 7, 4),
    (v_obj_id, 'Reporte de métricas', 8, 2),
    (v_obj_id, 'Reporte de métricas', 8, 4),
    (v_obj_id, 'Reporte de métricas', 9, 2),
    (v_obj_id, 'Reporte de métricas', 9, 4),
    (v_obj_id, 'Inicia Reto Actinver', 10, 1),
    (v_obj_id, 'Reporte de métricas', 10, 2),
    (v_obj_id, 'Reporte de métricas', 10, 4),
    (v_obj_id, 'Reporte de métricas', 11, 2),
    (v_obj_id, 'Reporte de métricas', 11, 4),
    (v_obj_id, 'Reporte de métricas', 12, 2),
    (v_obj_id, 'Reporte de métricas', 12, 4);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'El Diluvio', 'Crecer métricas de seguidores', 'Publicidad digital', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'El Diluvio' AND objective_text = 'Crecer métricas de seguidores' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 1, 2),
    (v_obj_id, 'Planeación mensual de contenido', 1, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 2, 2),
    (v_obj_id, 'Planeación mensual de contenido', 2, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 3, 2),
    (v_obj_id, 'Reporte de métricas', 3, 4),
    (v_obj_id, 'Reporte de métricas', 4, 2),
    (v_obj_id, 'Webinar', 4, 3),
    (v_obj_id, 'Reporte de métricas', 4, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 5, 2),
    (v_obj_id, 'Planeación mensual de contenido', 5, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 6, 2),
    (v_obj_id, 'Planeación mensual de contenido', 6, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 7, 2),
    (v_obj_id, 'Planeación mensual de contenido', 7, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 8, 2),
    (v_obj_id, 'Planeación mensual de contenido', 8, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 9, 2),
    (v_obj_id, 'Planeación mensual de contenido', 9, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 10, 2),
    (v_obj_id, 'Planeación mensual de contenido', 10, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 11, 2),
    (v_obj_id, 'Planeación mensual de contenido', 11, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 12, 2),
    (v_obj_id, 'Planeación mensual de contenido', 12, 4);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'El Diluvio', 'Mantener una relación permanente con las audiencias', 'Difusión de contenido: newsletter', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'El Diluvio' AND objective_text = 'Mantener una relación permanente con las audiencias' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Newsletter', 1, 1),
    (v_obj_id, 'Newsletter', 1, 3),
    (v_obj_id, 'Newsletter', 2, 1),
    (v_obj_id, 'Newsletter', 2, 3),
    (v_obj_id, 'Newsletter', 3, 1),
    (v_obj_id, 'Newsletter', 3, 3),
    (v_obj_id, 'Planeación mensual de contenido', 3, 4),
    (v_obj_id, 'Entrega de artículos y materiales para siguiente número', 4, 2),
    (v_obj_id, 'Newsletter', 5, 1),
    (v_obj_id, 'Newsletter', 5, 3),
    (v_obj_id, 'Newsletter', 6, 1),
    (v_obj_id, 'Newsletter', 6, 3),
    (v_obj_id, 'Newsletter', 7, 1),
    (v_obj_id, 'Newsletter', 7, 3),
    (v_obj_id, 'Newsletter', 8, 1),
    (v_obj_id, 'Newsletter', 8, 3),
    (v_obj_id, 'Newsletter', 9, 1),
    (v_obj_id, 'Newsletter', 9, 3),
    (v_obj_id, 'Newsletter', 10, 1),
    (v_obj_id, 'Newsletter', 10, 3),
    (v_obj_id, 'Newsletter', 11, 1),
    (v_obj_id, 'Newsletter', 11, 3),
    (v_obj_id, 'Newsletter', 12, 1),
    (v_obj_id, 'Newsletter', 12, 3);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'El Diluvio', '', 'Evaluación: reporte mensual de métricas', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'El Diluvio' AND main_activities = 'Evaluación: reporte mensual de métricas' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 4),
    (v_obj_id, 'Newsletter', 4, 1),
    (v_obj_id, 'Newsletter', 4, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 4);
END $$;

-- El Diluvio extra rows (webinars)
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'El Diluvio' AND main_activities = 'Evaluación: reporte mensual de métricas' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Webinar', 2, 3),
    (v_obj_id, 'Webinar', 3, 3),
    (v_obj_id, 'Webinar', 5, 3),
    (v_obj_id, 'Webinar', 6, 3),
    (v_obj_id, 'Webinar', 7, 3),
    (v_obj_id, 'Webinar', 8, 3),
    (v_obj_id, 'Webinar', 9, 3),
    (v_obj_id, 'Webinar', 10, 3),
    (v_obj_id, 'Webinar', 11, 3),
    (v_obj_id, 'Webinar', 12, 3);
END $$;

-- Padre Sada
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Padre Sada', 'Crecer métricas de seguidores', 'Elaboración y edición de contenido para redes sociales: imágenes, videos', 'Publicidad – pauta', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Padre Sada' AND objective_text = 'Crecer métricas de seguidores' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación mensual de contenido', 1, 1),
    (v_obj_id, 'Reporte de métricas', 1, 4),
    (v_obj_id, 'Planeación mensual de contenido', 2, 1),
    (v_obj_id, 'Planeación mensual de contenido', 3, 1),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Semana de Pascua', 4, 1),
    (v_obj_id, 'Planeación mensual de contenido', 5, 1),
    (v_obj_id, 'Planeación mensual de contenido', 6, 1),
    (v_obj_id, 'Planeación mensual de contenido', 7, 1),
    (v_obj_id, 'Planeación mensual de contenido', 8, 1),
    (v_obj_id, 'Planeación mensual de contenido', 9, 1),
    (v_obj_id, 'Planeación mensual de contenido', 10, 1),
    (v_obj_id, 'Planeación mensual de contenido', 11, 1),
    (v_obj_id, 'Planeación mensual de contenido', 12, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 4),
    (v_obj_id, 'Definición de calendario de capacitaciones', 1, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Padre Sada', 'Mantener comunidad en Instagram', 'Publicidad digital', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Padre Sada' AND objective_text = 'Mantener comunidad en Instagram' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Reporte bimestral de métricas', 3, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 4),
    (v_obj_id, 'Reporte bimestral de métricas', 5, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 7, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 9, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 11, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES
  (gen_random_uuid(), 'Padre Sada', 'Crecer comunidad en Facebook', 'Evaluación: reporte bimestral de métricas', '', 5),
  (gen_random_uuid(), 'Padre Sada', 'Venta de libros', '', '', 5);

-- Mario Doria
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Mario Doria', 'Crecer métricas de seguidores', 'Publicidad digital', 'Publicidad – pauta', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Mario Doria' AND objective_text = 'Crecer métricas de seguidores' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 1, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 2, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 4);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Mario Doria', 'Captación de pacientes', 'Elaboración y edición de contenido para redes sociales: imágenes, videos', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Mario Doria' AND objective_text = 'Captación de pacientes' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación mensual de contenido', 1, 1),
    (v_obj_id, 'Planeación mensual de contenido', 2, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 2),
    (v_obj_id, 'Planeación mensual de contenido', 3, 3),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Planeación mensual de contenido', 4, 1),
    (v_obj_id, 'Planeación mensual de contenido', 5, 1),
    (v_obj_id, 'Planeación mensual de contenido', 6, 1),
    (v_obj_id, 'Planeación mensual de contenido', 7, 1),
    (v_obj_id, 'Planeación mensual de contenido', 8, 1),
    (v_obj_id, 'Planeación mensual de contenido', 9, 1),
    (v_obj_id, 'Planeación mensual de contenido', 10, 1),
    (v_obj_id, 'Planeación mensual de contenido', 11, 1),
    (v_obj_id, 'Planeación mensual de contenido', 12, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 3, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 5, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 7, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Mario Doria', '', 'Evaluación: reporte bimestral de métricas', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Mario Doria' AND main_activities = 'Evaluación: reporte bimestral de métricas' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación mensual de contenido', 4, 1);
END $$;

-- MID Clinic
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'MID Clinic', 'Crecer métricas de seguidores', 'Publicidad digital', 'Publicidad – pauta', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'MID Clinic' AND objective_text = 'Crecer métricas de seguidores' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación mensual de contenido', 1, 1),
    (v_obj_id, 'Elaboración de sitio web', 1, 4),
    (v_obj_id, 'Planeación mensual de contenido', 2, 1),
    (v_obj_id, 'Arranque de publicidad: Google y redes sociales', 2, 3),
    (v_obj_id, 'Planeación mensual de contenido', 3, 1),
    (v_obj_id, 'Podcast quincenal', 3, 2),
    (v_obj_id, 'Inauguración MID Clinic', 3, 3),
    (v_obj_id, 'Podcast quincenal', 3, 4),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Semana de Pascua', 4, 1),
    (v_obj_id, 'Planeación mensual de contenido', 4, 1),
    (v_obj_id, 'Semana de Pascua', 4, 1),
    (v_obj_id, 'Podcast quincenal', 4, 2),
    (v_obj_id, 'Podcast quincenal', 4, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 2);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'MID Clinic', 'Captación de pacientes', 'Elaboración y edición de contenido para redes sociales: imágenes, videos', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'MID Clinic' AND objective_text = 'Captación de pacientes' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 4),
    (v_obj_id, 'Planeación mensual de contenido', 5, 1),
    (v_obj_id, 'Planeación mensual de contenido', 6, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'MID Clinic', '', 'Evaluación: reporte bimestral de métricas', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'MID Clinic' AND main_activities = 'Evaluación: reporte bimestral de métricas' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación mensual de contenido', 4, 1);
END $$;

-- Fimeme
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Fimeme', 'Consolidar comunidad de creadores', 'Elaboración y edición de contenido para redes sociales: imágenes, videos', 'Estrategia digital - community management', 4);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Fimeme' AND objective_text = 'Consolidar comunidad de creadores' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación mensual de contenido', 1, 1),
    (v_obj_id, 'Elaboración de sitio web', 1, 4),
    (v_obj_id, 'Planeación mensual de contenido', 2, 1),
    (v_obj_id, 'Planeación mensual de contenido', 3, 1),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Semana de Pascua', 4, 1),
    (v_obj_id, 'Planeación mensual de contenido', 4, 1),
    (v_obj_id, 'Planeación mensual de contenido', 5, 1),
    (v_obj_id, 'Planeación mensual de contenido', 6, 1),
    (v_obj_id, 'Planeación mensual de contenido', 7, 1),
    (v_obj_id, 'Planeación mensual de contenido', 8, 1),
    (v_obj_id, 'Planeación mensual de contenido', 9, 1),
    (v_obj_id, 'Planeación mensual de contenido', 10, 1),
    (v_obj_id, 'Planeación mensual de contenido', 11, 1),
    (v_obj_id, 'Planeación mensual de contenido', 12, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 3, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 5, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 7, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 9, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 11, 1),
    (v_obj_id, 'Fimeme Awards', 6, 3),
    (v_obj_id, 'Fimeme Awards', 6, 4);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Fimeme', 'Consolidar presencia territorial / digital', 'Publicidad digital', '', 4);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Fimeme' AND objective_text = 'Consolidar presencia territorial / digital' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 3, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 4, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 5, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 6, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 7, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 8, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 9, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 10, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 11, 4),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 1),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 2),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 3),
    (v_obj_id, 'Revisión de campañas: activas, con saldo, conversiones', 12, 4);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Fimeme', 'Crecer métricas de seguidores', 'RP con instituciones', '', 4);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Fimeme' AND objective_text = 'Crecer métricas de seguidores' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación anual de podcasts', 1, 1),
    (v_obj_id, 'Podcast quincenal', 1, 2),
    (v_obj_id, 'Podcast quincenal', 1, 4),
    (v_obj_id, 'Podcast quincenal', 2, 2),
    (v_obj_id, 'Podcast quincenal', 2, 4),
    (v_obj_id, 'Podcast quincenal', 3, 2),
    (v_obj_id, 'Podcast quincenal', 3, 4),
    (v_obj_id, 'Podcast quincenal', 4, 2),
    (v_obj_id, 'Podcast quincenal', 4, 4),
    (v_obj_id, 'Podcast quincenal', 5, 2),
    (v_obj_id, 'Podcast quincenal', 5, 4),
    (v_obj_id, 'Podcast quincenal', 6, 2),
    (v_obj_id, 'Podcast quincenal', 6, 4),
    (v_obj_id, 'Podcast quincenal', 7, 2),
    (v_obj_id, 'Podcast quincenal', 7, 4),
    (v_obj_id, 'Podcast quincenal', 8, 2),
    (v_obj_id, 'Podcast quincenal', 8, 4),
    (v_obj_id, 'Podcast quincenal', 9, 2),
    (v_obj_id, 'Podcast quincenal', 9, 4),
    (v_obj_id, 'Podcast quincenal', 10, 2),
    (v_obj_id, 'Podcast quincenal', 10, 4),
    (v_obj_id, 'Podcast quincenal', 11, 2),
    (v_obj_id, 'Podcast quincenal', 12, 2);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES
  (gen_random_uuid(), 'Fimeme', 'Crear comunidad participativa en redes sociales: Facebook, TikTok, Instagram, YouTube', '', '', 4),
  (gen_random_uuid(), 'Fimeme', 'Venta de merch', '', '', 4);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Fimeme' AND objective_text = 'Crear comunidad participativa en redes sociales: Facebook, TikTok, Instagram, YouTube' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Fimeme Awards', 7, 1);
END $$;

-- KiMedia
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'KiMedia', 'Consolidar presencia digital', 'Elaboración y edición de contenido para redes sociales: imágenes, videos', 'Estrategia digital - community management', 4);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'KiMedia' AND objective_text = 'Consolidar presencia digital' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación anual de podcasts', 1, 1),
    (v_obj_id, 'Podcast quincenal', 2, 2),
    (v_obj_id, 'Podcast quincenal', 2, 4),
    (v_obj_id, 'Planeación mensual de contenido', 3, 1),
    (v_obj_id, 'Semana Santa', 3, 4),
    (v_obj_id, 'Semana de Pascua', 4, 1),
    (v_obj_id, 'Planeación mensual de contenido', 4, 1),
    (v_obj_id, 'Podcast quincenal', 3, 2),
    (v_obj_id, 'Podcast quincenal', 3, 4),
    (v_obj_id, 'Podcast quincenal', 4, 2),
    (v_obj_id, 'Podcast quincenal', 4, 4),
    (v_obj_id, 'Planeación mensual de contenido', 5, 1),
    (v_obj_id, 'Podcast quincenal', 5, 2),
    (v_obj_id, 'Podcast quincenal', 5, 4),
    (v_obj_id, 'Planeación mensual de contenido', 6, 1),
    (v_obj_id, 'Podcast quincenal', 6, 2),
    (v_obj_id, 'Podcast quincenal', 6, 4),
    (v_obj_id, 'Planeación mensual de contenido', 7, 1),
    (v_obj_id, 'Podcast quincenal', 7, 2),
    (v_obj_id, 'Podcast quincenal', 7, 4),
    (v_obj_id, 'Planeación mensual de contenido', 8, 1),
    (v_obj_id, 'Podcast quincenal', 8, 2),
    (v_obj_id, 'Podcast quincenal', 8, 4),
    (v_obj_id, 'Planeación mensual de contenido', 9, 1),
    (v_obj_id, 'Podcast quincenal', 9, 2),
    (v_obj_id, 'Podcast quincenal', 9, 4),
    (v_obj_id, 'Planeación mensual de contenido', 10, 1),
    (v_obj_id, 'Podcast quincenal', 10, 2),
    (v_obj_id, 'Podcast quincenal', 10, 4),
    (v_obj_id, 'Planeación mensual de contenido', 11, 1),
    (v_obj_id, 'Podcast quincenal', 11, 2),
    (v_obj_id, 'Planeación mensual de contenido', 12, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'KiMedia', 'Crear comunidad participativa en redes sociales: Facebook, TikTok, Instagram, YouTube', 'Publicidad digital', '', 4);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'KiMedia' AND objective_text = 'Crear comunidad participativa en redes sociales: Facebook, TikTok, Instagram, YouTube' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Planeación mensual de contenido', 1, 1),
    (v_obj_id, 'Rehacer brochure', 1, 2),
    (v_obj_id, 'Planeación mensual de contenido', 2, 1),
    (v_obj_id, 'Actualización sitio web', 2, 2),
    (v_obj_id, 'Podcast quincenal', 3, 2),
    (v_obj_id, 'Reporte bimestral de métricas', 3, 1),
    (v_obj_id, 'Reporte bimestral de métricas', 5, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'KiMedia', 'Captación de clientes', 'RP con instituciones', '', 4);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'KiMedia' AND objective_text = 'Captación de clientes' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Reunión semanal', 1, 1),
    (v_obj_id, 'Reunión semanal', 1, 2),
    (v_obj_id, 'Reunion semanal', 1, 3),
    (v_obj_id, 'Reunión de cierre de mes', 1, 4),
    (v_obj_id, 'Reunión semanal', 2, 1),
    (v_obj_id, 'Reunión semanal', 2, 2),
    (v_obj_id, 'Reunión semanal', 2, 3),
    (v_obj_id, 'Reunión de cierre de mes', 2, 4),
    (v_obj_id, 'Reunión semanal', 3, 1),
    (v_obj_id, 'Reunión semanal', 3, 2),
    (v_obj_id, 'Reunión semanal', 3, 3),
    (v_obj_id, 'Reunión de cierre de mes', 3, 4),
    (v_obj_id, 'Reunión semanal', 4, 1),
    (v_obj_id, 'Reunión semanal', 4, 2),
    (v_obj_id, 'Reunión semanal', 4, 3),
    (v_obj_id, 'Reunión de cierre de mes', 4, 4),
    (v_obj_id, 'Reunión semanal', 5, 1),
    (v_obj_id, 'Reunión semanal', 5, 2),
    (v_obj_id, 'Reunión semanal', 5, 3),
    (v_obj_id, 'Reunión de cierre de mes', 5, 4),
    (v_obj_id, 'Reunión semanal', 6, 1),
    (v_obj_id, 'Reunión semanal', 6, 2),
    (v_obj_id, 'Reunión semanal', 6, 3),
    (v_obj_id, 'Reunión de cierre de mes', 6, 4),
    (v_obj_id, 'Reunión semanal', 7, 1),
    (v_obj_id, 'Reunión semanal', 7, 2),
    (v_obj_id, 'Reunión semanal', 7, 3),
    (v_obj_id, 'Reunión de cierre de mes', 7, 4),
    (v_obj_id, 'Reunión semanal', 8, 1),
    (v_obj_id, 'Reunión semanal', 8, 2),
    (v_obj_id, 'Reunión semanal', 8, 3),
    (v_obj_id, 'Reunión de cierre de mes', 8, 4),
    (v_obj_id, 'Reunión semanal', 9, 1),
    (v_obj_id, 'Reunión semanal', 9, 2),
    (v_obj_id, 'Reunión semanal', 9, 3),
    (v_obj_id, 'Reunión de cierre de mes', 9, 4),
    (v_obj_id, 'Reunión semanal', 10, 1),
    (v_obj_id, 'Reunión semanal', 10, 2),
    (v_obj_id, 'Reunión semanal', 10, 3),
    (v_obj_id, 'Reunión de cierre de mes', 10, 4),
    (v_obj_id, 'Reunión semanal', 11, 1),
    (v_obj_id, 'Reunión semanal', 11, 2),
    (v_obj_id, 'Reunión semanal', 11, 3),
    (v_obj_id, 'Reunión de cierre de mes', 11, 4),
    (v_obj_id, 'Reunión semanal', 12, 1),
    (v_obj_id, 'Reunión semanal', 12, 2),
    (v_obj_id, 'Reunión semanal', 12, 3),
    (v_obj_id, 'Reunión de cierre de mes', 12, 4);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'KiMedia', '', 'RP con creadores', '', 4);

-- Pendientes administrativos
INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Pendientes administrativos', 'Ser empresa formal', 'Afiliación Coparmex', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Pendientes administrativos' AND objective_text = 'Ser empresa formal' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Nómina - Fili', 1, 1);
END $$;

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES
  (gen_random_uuid(), 'Pendientes administrativos', '', 'Alta de Persona moral', '', 5),
  (gen_random_uuid(), 'Pendientes administrativos', '', 'Deducción de ingresos - egresos', '', 5),
  (gen_random_uuid(), 'Pendientes administrativos', '', 'Deducción de nómina', '', 5);

INSERT INTO client_objectives (id, client_name, objective_text, main_activities, business_unit, priority)
VALUES (gen_random_uuid(), 'Pendientes administrativos', '', 'Conocer mejor al equipo', '', 5);
DO $$ DECLARE v_obj_id uuid; BEGIN
  SELECT id INTO v_obj_id FROM client_objectives WHERE client_name = 'Pendientes administrativos' AND main_activities = 'Conocer mejor al equipo' LIMIT 1;
  INSERT INTO client_weekly_milestones (objective_id, activity_text, month, week_number) VALUES
    (v_obj_id, 'Google Forrms - encuesta interna', 1, 1);
END $$;

-- Remaining clients will be added in a follow-up migration if needed
-- For now the most critical ones (those you showed) are fixed