-- ============================================================================
-- SEED DEMO DATA - Datos de prueba con imágenes de alta calidad
-- ============================================================================

-- Limpiar datos existentes (en orden para respetar FKs)
DELETE FROM media;
DELETE FROM lots;
DELETE FROM testimonials;
DELETE FROM faqs;
DELETE FROM projects;

-- ============================================================================
-- PROYECTOS
-- ============================================================================
INSERT INTO projects (id, name, slug, description, short_description, location_name, latitude, longitude, total_lots, available_lots, lot_size_from, lot_size_to, price_from, price_to, status, amenities) VALUES
(
  'a1b2c3d4-1111-4000-8000-000000000001',
  'Costa Esmeralda',
  'costa-esmeralda',
  'Exclusivo desarrollo residencial frente al mar en Puerto Escondido. Terrenos con vista al océano Pacífico, acceso directo a la playa y todas las amenidades para una vida de ensueño. El proyecto cuenta con vigilancia 24/7, club de playa privado y áreas verdes diseñadas por paisajistas profesionales.',
  'Desarrollo residencial frente al mar con acceso a playa privada',
  'Puerto Escondido, Oaxaca',
  15.8720, -97.0725,
  8, 6, 200, 380, 800000.00, 2090000.00,
  'active',
  '["Acceso a playa privada", "Club de playa", "Vigilancia 24/7", "Calles pavimentadas", "Alumbrado público", "Red de agua potable", "Drenaje", "Fibra óptica", "Áreas verdes", "Cancha de pádel"]'::jsonb
),
(
  'a1b2c3d4-2222-4000-8000-000000000002',
  'Bahías de Huatulco',
  'bahias-huatulco',
  'Vive rodeado de las 9 bahías más hermosas de México. Terrenos residenciales en zona de alta plusvalía, a minutos del aeropuerto internacional y de las playas más cristalinas del Pacífico mexicano. Ideal para inversión o para construir tu casa de retiro.',
  'Terrenos residenciales cerca de las 9 bahías de Huatulco',
  'Santa María Huatulco, Oaxaca',
  15.7833, -96.1344,
  5, 3, 250, 400, 1300000.00, 2400000.00,
  'active',
  '["Vista panorámica al mar", "Cerca de bahías", "Acceso controlado", "Infraestructura completa", "Cerca del aeropuerto", "Zona turística premium", "Servicios básicos", "Internet de alta velocidad"]'::jsonb
),
(
  'a1b2c3d4-3333-4000-8000-000000000003',
  'Mazunte Verde',
  'mazunte-verde',
  'Desarrollo eco-sustentable en el corazón de Mazunte. Terrenos amplios rodeados de naturaleza, perfectos para proyectos de ecoturismo o vivienda sustentable. Incluye sistema de captación de agua de lluvia y paneles solares comunitarios.',
  'Desarrollo eco-sustentable rodeado de naturaleza',
  'Mazunte, Oaxaca',
  15.6686, -96.5547,
  4, 3, 300, 500, 1050000.00, 2000000.00,
  'active',
  '["Eco-sustentable", "Paneles solares comunitarios", "Captación de agua de lluvia", "Reserva natural", "Cerca de playa", "Centro de yoga", "Huertos comunitarios", "Senderos naturales"]'::jsonb
),
(
  'a1b2c3d4-4444-4000-8000-000000000004',
  'Zipolite Sunset',
  'zipolite-sunset',
  'Próximo desarrollo en la famosa playa de Zipolite. Terrenos con espectaculares vistas al atardecer, en una de las playas más icónicas de México. Reserva tu lote con precio de preventa.',
  'Próximo desarrollo con vistas al atardecer en Zipolite',
  'Zipolite, Oaxaca',
  15.6619, -96.5264,
  15, 15, 200, 350, 720000.00, 1200000.00,
  'coming_soon',
  '["Vista al atardecer", "Playa cercana", "Zona bohemia", "Restaurantes y bares", "Comunidad artística", "Cerca de Mazunte", "Acceso a playa"]'::jsonb
);

-- ============================================================================
-- LOTES - Costa Esmeralda
-- ============================================================================
INSERT INTO lots (id, project_id, lot_number, area_m2, price, status, zone) VALUES
('b1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001', 'A-01', 350, 1925000, 'available', 'Frente de mar - Premium'),
('b1b2c3d4-1111-4000-8000-000000000002', 'a1b2c3d4-1111-4000-8000-000000000001', 'A-02', 320, 1760000, 'reserved', 'Frente de mar'),
('b1b2c3d4-1111-4000-8000-000000000003', 'a1b2c3d4-1111-4000-8000-000000000001', 'A-03', 380, 2090000, 'sold', 'Frente de mar - Esquina'),
('b1b2c3d4-1111-4000-8000-000000000004', 'a1b2c3d4-1111-4000-8000-000000000001', 'B-01', 280, 1260000, 'available', 'Segunda línea'),
('b1b2c3d4-1111-4000-8000-000000000005', 'a1b2c3d4-1111-4000-8000-000000000001', 'B-02', 250, 1125000, 'available', 'Segunda línea'),
('b1b2c3d4-1111-4000-8000-000000000006', 'a1b2c3d4-1111-4000-8000-000000000001', 'B-03', 300, 1350000, 'sold', 'Segunda línea - Esquina'),
('b1b2c3d4-1111-4000-8000-000000000007', 'a1b2c3d4-1111-4000-8000-000000000001', 'C-01', 220, 880000, 'available', 'Tercera línea'),
('b1b2c3d4-1111-4000-8000-000000000008', 'a1b2c3d4-1111-4000-8000-000000000001', 'C-02', 200, 800000, 'available', 'Tercera línea');

-- LOTES - Bahías de Huatulco
INSERT INTO lots (id, project_id, lot_number, area_m2, price, status, zone) VALUES
('b1b2c3d4-2222-4000-8000-000000000001', 'a1b2c3d4-2222-4000-8000-000000000002', 'H-01', 400, 2400000, 'available', 'Vista Bahía Tangolunda - Premium'),
('b1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002', 'H-02', 350, 2100000, 'reserved', 'Vista Bahía Tangolunda'),
('b1b2c3d4-2222-4000-8000-000000000003', 'a1b2c3d4-2222-4000-8000-000000000002', 'H-03', 280, 1456000, 'available', 'Zona residencial'),
('b1b2c3d4-2222-4000-8000-000000000004', 'a1b2c3d4-2222-4000-8000-000000000002', 'H-04', 300, 1560000, 'available', 'Zona residencial'),
('b1b2c3d4-2222-4000-8000-000000000005', 'a1b2c3d4-2222-4000-8000-000000000002', 'H-05', 250, 1300000, 'sold', 'Zona residencial');

-- LOTES - Mazunte Verde
INSERT INTO lots (id, project_id, lot_number, area_m2, price, status, zone) VALUES
('b1b2c3d4-3333-4000-8000-000000000001', 'a1b2c3d4-3333-4000-8000-000000000003', 'M-01', 500, 2000000, 'available', 'Lote grande - Ideal ecohotel'),
('b1b2c3d4-3333-4000-8000-000000000002', 'a1b2c3d4-3333-4000-8000-000000000003', 'M-02', 400, 1520000, 'available', 'Vista a montaña'),
('b1b2c3d4-3333-4000-8000-000000000003', 'a1b2c3d4-3333-4000-8000-000000000003', 'M-03', 350, 1225000, 'reserved', 'Rodeado de selva'),
('b1b2c3d4-3333-4000-8000-000000000004', 'a1b2c3d4-3333-4000-8000-000000000003', 'M-04', 300, 1050000, 'available', 'Tranquilo - Vista al mar');

-- ============================================================================
-- MEDIA - Imágenes de alta calidad (Unsplash)
-- ============================================================================

-- Costa Esmeralda - Proyecto
INSERT INTO media (id, url, type, entity_type, entity_id, order_index, is_primary, title) VALUES
('11111111-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', 'image', 'project', 'a1b2c3d4-1111-4000-8000-000000000001', 1, true, 'Vista principal playa'),
('11111111-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=1920&q=80', 'image', 'project', 'a1b2c3d4-1111-4000-8000-000000000001', 2, false, 'Atardecer en la costa'),
('11111111-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920&q=80', 'image', 'project', 'a1b2c3d4-1111-4000-8000-000000000001', 3, false, 'Casa de playa'),
('11111111-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=80', 'image', 'project', 'a1b2c3d4-1111-4000-8000-000000000001', 4, false, 'Vista aérea'),
('11111111-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1920&q=80', 'image', 'project', 'a1b2c3d4-1111-4000-8000-000000000001', 5, false, 'Palmeras tropicales');

-- Costa Esmeralda - Lotes
INSERT INTO media (id, url, type, entity_type, entity_id, order_index, is_primary, title) VALUES
('11111111-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', 'image', 'lot', 'b1b2c3d4-1111-4000-8000-000000000001', 1, true, 'Lote A-01'),
('11111111-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', 'image', 'lot', 'b1b2c3d4-1111-4000-8000-000000000002', 1, true, 'Lote A-02'),
('11111111-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', 'image', 'lot', 'b1b2c3d4-1111-4000-8000-000000000004', 1, true, 'Lote B-01');

-- Bahías de Huatulco - Proyecto
INSERT INTO media (id, url, type, entity_type, entity_id, order_index, is_primary, title) VALUES
('22222222-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=1920&q=80', 'image', 'project', 'a1b2c3d4-2222-4000-8000-000000000002', 1, true, 'Vista Huatulco'),
('22222222-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', 'image', 'project', 'a1b2c3d4-2222-4000-8000-000000000002', 2, false, 'Bahía panorámica'),
('22222222-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80', 'image', 'project', 'a1b2c3d4-2222-4000-8000-000000000002', 3, false, 'Residencias'),
('22222222-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80', 'image', 'project', 'a1b2c3d4-2222-4000-8000-000000000002', 4, false, 'Zona turística');

-- Bahías de Huatulco - Lotes
INSERT INTO media (id, url, type, entity_type, entity_id, order_index, is_primary, title) VALUES
('22222222-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80', 'image', 'lot', 'b1b2c3d4-2222-4000-8000-000000000001', 1, true, 'Lote H-01'),
('22222222-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80', 'image', 'lot', 'b1b2c3d4-2222-4000-8000-000000000003', 1, true, 'Lote H-03');

-- Mazunte Verde - Proyecto
INSERT INTO media (id, url, type, entity_type, entity_id, order_index, is_primary, title) VALUES
('33333333-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1920&q=80', 'image', 'project', 'a1b2c3d4-3333-4000-8000-000000000003', 1, true, 'Naturaleza Mazunte'),
('33333333-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80', 'image', 'project', 'a1b2c3d4-3333-4000-8000-000000000003', 2, false, 'Vista natural'),
('33333333-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80', 'image', 'project', 'a1b2c3d4-3333-4000-8000-000000000003', 3, false, 'Eco zona');

-- Mazunte Verde - Lotes
INSERT INTO media (id, url, type, entity_type, entity_id, order_index, is_primary, title) VALUES
('33333333-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80', 'image', 'lot', 'b1b2c3d4-3333-4000-8000-000000000001', 1, true, 'Lote M-01'),
('33333333-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80', 'image', 'lot', 'b1b2c3d4-3333-4000-8000-000000000002', 1, true, 'Lote M-02');

-- Zipolite Sunset - Proyecto (Coming Soon)
INSERT INTO media (id, url, type, entity_type, entity_id, order_index, is_primary, title) VALUES
('44444444-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80', 'image', 'project', 'a1b2c3d4-4444-4000-8000-000000000004', 1, true, 'Atardecer Zipolite'),
('44444444-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1920&q=80', 'image', 'project', 'a1b2c3d4-4444-4000-8000-000000000004', 2, false, 'Playa Zipolite');

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================
INSERT INTO testimonials (id, client_name, client_title, client_location, content, rating, project_id, featured, active) VALUES
('01111111-1111-4000-8000-000000000001', 'María González', 'Inversionista', 'Ciudad de México', 'Invertir en Costa Esmeralda fue la mejor decisión. El equipo me asesoró de principio a fin y hoy mi terreno ya tiene plusvalía del 40%. ¡Totalmente recomendable!', 5, 'a1b2c3d4-1111-4000-8000-000000000001', true, true),
('01111111-2222-4000-8000-000000000002', 'Carlos Mendoza', 'Empresario', 'Guadalajara, Jalisco', 'Buscaba un lugar para retirarme y encontré en Bahías de Huatulco el paraíso perfecto. Transparencia total en la compra y un servicio excepcional.', 5, 'a1b2c3d4-2222-4000-8000-000000000002', true, true),
('01111111-3333-4000-8000-000000000003', 'Ana Martínez', 'Arquitecta', 'Monterrey, N.L.', 'Como arquitecta, valoro mucho el diseño sustentable de Mazunte Verde. Es el proyecto perfecto para quienes buscan armonía con la naturaleza.', 5, 'a1b2c3d4-3333-4000-8000-000000000003', true, true),
('01111111-4444-4000-8000-000000000004', 'Roberto Silva', 'Médico', 'Puebla, Puebla', 'El proceso de compra fue sencillo y seguro. Ahora tengo un patrimonio en la costa de Oaxaca que crecerá con el tiempo. Excelente inversión.', 4, 'a1b2c3d4-1111-4000-8000-000000000001', false, true);

-- ============================================================================
-- FAQs
-- ============================================================================
INSERT INTO faqs (id, question, answer, category, order_index, active) VALUES
('0f111111-1111-4000-8000-000000000001', '¿Qué documentación necesito para comprar un terreno?', 'Para comprar un terreno necesitas: identificación oficial vigente (INE/Pasaporte), comprobante de domicilio reciente, RFC con homoclave, y CURP. Si eres extranjero, también necesitarás permiso de la SRE para adquisición de inmuebles en zona restringida.', 'Compra', 1, true),
('0f111111-2222-4000-8000-000000000002', '¿Cuáles son las formas de pago disponibles?', 'Ofrecemos varias opciones: pago de contado con descuento especial, financiamiento directo hasta 36 meses con enganche del 30%, y aceptamos créditos hipotecarios de los principales bancos. Consulta con nuestros asesores las condiciones vigentes.', 'Pagos', 2, true),
('0f111111-3333-4000-8000-000000000003', '¿Los terrenos cuentan con servicios?', 'Todos nuestros desarrollos cuentan con infraestructura completa: agua potable, drenaje, electricidad, y preparación para fibra óptica. Además, incluyen calles pavimentadas, alumbrado público y áreas verdes.', 'Servicios', 3, true),
('0f111111-4444-4000-8000-000000000004', '¿Puedo visitar los terrenos antes de comprar?', '¡Por supuesto! Organizamos visitas guiadas a todos nuestros desarrollos. Agenda tu visita a través de WhatsApp o nuestro formulario de contacto. Te llevaremos a conocer el proyecto y responderemos todas tus preguntas.', 'Visitas', 4, true),
('0f111111-5555-4000-8000-000000000005', '¿Qué garantía tengo sobre mi inversión?', 'Todos nuestros terrenos cuentan con escrituras ante notario público, título de propiedad libre de gravámenes, y certificado de libertad de adeudos. Trabajamos con notarios reconocidos para garantizar la seguridad jurídica de tu inversión.', 'Legal', 5, true),
('0f111111-6666-4000-8000-000000000006', '¿Puedo construir inmediatamente después de comprar?', 'Sí, una vez formalizada la compra y obtenidas las escrituras, puedes iniciar tu proyecto de construcción. Te asesoramos con los permisos de construcción y te recomendamos constructores locales de confianza.', 'Construcción', 6, true);
