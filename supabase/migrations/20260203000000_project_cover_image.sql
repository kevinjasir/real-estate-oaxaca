-- ============================================================================
-- ADD COVER IMAGE TO PROJECTS
-- Permite agregar una imagen de portada/hero a cada proyecto
-- ============================================================================

-- Agregar columna de imagen de portada a proyectos
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Comentario descriptivo
COMMENT ON COLUMN projects.cover_image_url IS 'URL de la imagen de portada/hero del proyecto';

-- Actualizar proyectos existentes con imágenes de ejemplo
UPDATE projects SET cover_image_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80'
WHERE slug = 'costa-esmeralda' AND cover_image_url IS NULL;

UPDATE projects SET cover_image_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'
WHERE slug = 'bahias-huatulco' AND cover_image_url IS NULL;

UPDATE projects SET cover_image_url = 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80'
WHERE slug = 'mazunte-verde' AND cover_image_url IS NULL;

UPDATE projects SET cover_image_url = 'https://images.unsplash.com/photo-1468413253725-0d5181091126?w=1920&q=80'
WHERE slug = 'zipolite-sunset' AND cover_image_url IS NULL;

UPDATE projects SET cover_image_url = 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80'
WHERE slug = 'playa-coral' AND cover_image_url IS NULL;
