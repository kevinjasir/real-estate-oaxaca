-- Add coordinates to existing projects for map display
UPDATE projects SET
  latitude = 15.7692,
  longitude = -96.1287,
  address = 'Playa Coral, Huatulco, Oaxaca',
  city = 'Santa María Huatulco',
  google_maps_url = 'https://www.google.com/maps?q=15.7692,-96.1287'
WHERE slug = 'playa-coral';

UPDATE projects SET
  latitude = 15.6685,
  longitude = -96.4889,
  address = 'Mazunte, San Pedro Pochutla, Oaxaca',
  city = 'San Pedro Pochutla',
  google_maps_url = 'https://www.google.com/maps?q=15.6685,-96.4889'
WHERE slug = 'mazunte-verde';

UPDATE projects SET
  latitude = 15.8517,
  longitude = -97.0726,
  address = 'Puerto Escondido, San Pedro Mixtepec, Oaxaca',
  city = 'San Pedro Mixtepec',
  google_maps_url = 'https://www.google.com/maps?q=15.8517,-97.0726'
WHERE slug = 'costa-esmeralda';

UPDATE projects SET
  latitude = 15.7567,
  longitude = -96.1345,
  address = 'Bahías de Huatulco, Oaxaca',
  city = 'Santa María Huatulco',
  google_maps_url = 'https://www.google.com/maps?q=15.7567,-96.1345'
WHERE slug = 'bahias-huatulco';

UPDATE projects SET
  latitude = 15.6580,
  longitude = -96.4950,
  address = 'Puerto Ángel, San Pedro Pochutla, Oaxaca',
  city = 'San Pedro Pochutla',
  google_maps_url = 'https://www.google.com/maps?q=15.6580,-96.4950'
WHERE slug = 'puerto-angel-residencial';
