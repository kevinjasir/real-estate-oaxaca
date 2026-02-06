-- Add banner settings for projects page
INSERT INTO site_settings (key, value, description)
VALUES
  ('projects_banner_image', '"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"', 'Background image for projects page hero banner'),
  ('projects_banner_title', '"Nuestros Proyectos"', 'Title for projects page hero banner'),
  ('projects_banner_subtitle', '"Descubre los mejores desarrollos de terrenos en la costa de Oaxaca. Inversiones seguras con escrituras y servicios."', 'Subtitle for projects page hero banner')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
