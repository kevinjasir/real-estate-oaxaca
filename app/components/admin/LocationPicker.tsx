"use client";

import { useState, useEffect, useCallback } from "react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  googleMapsUrl: string | null;
  onLocationChange: (location: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    googleMapsUrl: string | null;
  }) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  address,
  city,
  state,
  postalCode,
  googleMapsUrl,
  onLocationChange,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  // Generate Google Maps embed URL
  const getEmbedUrl = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&q=${latitude},${longitude}&zoom=15`;
    }
    if (address) {
      return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&q=${encodeURIComponent(address)}&zoom=15`;
    }
    return null;
  };

  // Generate direct Google Maps URL
  const generateGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  // Search for location using address
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      // Use OpenStreetMap Nominatim for geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`,
        {
          headers: {
            "User-Agent": "CostaOaxacaRealEstate/1.0",
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const addr = result.address;

        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: result.display_name.split(",").slice(0, 3).join(","),
          city: addr.city || addr.town || addr.village || addr.municipality || city,
          state: addr.state || state,
          postalCode: addr.postcode || postalCode,
          googleMapsUrl: generateGoogleMapsUrl(lat, lng),
        });
      } else {
        setError("No se encontró la ubicación. Intenta con una dirección más específica.");
      }
    } catch (err) {
      console.error("Error searching location:", err);
      setError("Error al buscar la ubicación");
    } finally {
      setSearching(false);
    }
  };

  // Extract coords from Google Maps URL
  const handleGoogleMapsUrlPaste = (url: string) => {
    try {
      // Try to extract coordinates from various Google Maps URL formats
      // Format 1: https://www.google.com/maps?q=15.123,-96.456
      // Format 2: https://www.google.com/maps/@15.123,-96.456,15z
      // Format 3: https://goo.gl/maps/...

      const coordsMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);

      let lat: number | null = null;
      let lng: number | null = null;

      if (coordsMatch) {
        lat = parseFloat(coordsMatch[1]);
        lng = parseFloat(coordsMatch[2]);
      } else if (queryMatch) {
        lat = parseFloat(queryMatch[1]);
        lng = parseFloat(queryMatch[2]);
      }

      if (lat && lng) {
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address,
          city,
          state,
          postalCode,
          googleMapsUrl: url,
        });
      }
    } catch (err) {
      console.error("Error parsing Google Maps URL:", err);
    }
  };

  const handleManualCoordinates = (lat: string, lng: string) => {
    const latitude = lat ? parseFloat(lat) : null;
    const longitude = lng ? parseFloat(lng) : null;

    onLocationChange({
      latitude,
      longitude,
      address,
      city,
      state,
      postalCode,
      googleMapsUrl: latitude && longitude ? generateGoogleMapsUrl(latitude, longitude) : null,
    });
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="space-y-4">
      {/* Search by address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar ubicación
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ej: Puerto Ángel, Oaxaca, México"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {searching ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Or paste Google Maps URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          O pega un enlace de Google Maps
        </label>
        <input
          type="url"
          value={googleMapsUrl || ""}
          onChange={(e) => {
            const url = e.target.value;
            handleGoogleMapsUrlPaste(url);
            onLocationChange({
              latitude,
              longitude,
              address,
              city,
              state,
              postalCode,
              googleMapsUrl: url,
            });
          }}
          placeholder="https://www.google.com/maps/..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Toggle manual input */}
      <button
        type="button"
        onClick={() => setShowManual(!showManual)}
        className="text-sm text-emerald-600 hover:text-emerald-700"
      >
        {showManual ? "Ocultar" : "Mostrar"} campos manuales
      </button>

      {/* Manual coordinate input */}
      {showManual && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input
              type="number"
              step="any"
              value={latitude || ""}
              onChange={(e) => handleManualCoordinates(e.target.value, longitude?.toString() || "")}
              placeholder="15.8667"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input
              type="number"
              step="any"
              value={longitude || ""}
              onChange={(e) => handleManualCoordinates(latitude?.toString() || "", e.target.value)}
              placeholder="-96.4833"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
            <input
              type="text"
              value={postalCode || ""}
              onChange={(e) => onLocationChange({
                latitude,
                longitude,
                address,
                city,
                state,
                postalCode: e.target.value,
                googleMapsUrl,
              })}
              placeholder="70902"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <input
              type="text"
              value={state || ""}
              onChange={(e) => onLocationChange({
                latitude,
                longitude,
                address,
                city,
                state: e.target.value,
                postalCode,
                googleMapsUrl,
              })}
              placeholder="Oaxaca"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa</label>
            <input
              type="text"
              value={address || ""}
              onChange={(e) => onLocationChange({
                latitude,
                longitude,
                address: e.target.value,
                city,
                state,
                postalCode,
                googleMapsUrl,
              })}
              placeholder="Calle Principal #123, Colonia Centro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>
      )}

      {/* Map Preview */}
      {(latitude && longitude) || address ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Vista previa del mapa</h4>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Abrir en Google Maps
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Static map preview using OpenStreetMap with marker */}
          <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(longitude || 0) - 0.01},${(latitude || 0) - 0.008},${(longitude || 0) + 0.01},${(latitude || 0) + 0.008}&layer=mapnik&marker=${latitude},${longitude}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
            <a
              href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-xs text-gray-700 px-2 py-1 rounded shadow"
            >
              Ver mapa completo
            </a>
          </div>

          {/* Location info */}
          {(latitude && longitude) && (
            <div className="text-xs text-gray-500 flex items-center gap-4">
              <span>Lat: {latitude.toFixed(6)}</span>
              <span>Lng: {longitude.toFixed(6)}</span>
              {postalCode && <span>CP: {postalCode}</span>}
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">Busca una ubicación para ver el mapa</p>
          </div>
        </div>
      )}
    </div>
  );
}
