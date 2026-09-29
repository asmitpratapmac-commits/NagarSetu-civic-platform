import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Crosshair, Search, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDebounce } from '../../hooks/useDebounce';

const pickerIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#2E8055;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(18,20,15,0.4);border:2px solid white;"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const RecenterOnChange = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], 16);
  }, [position, map]);
  return null;
};

/**
 * Props:
 *  - value: { lat, lng, address } | null
 *  - onChange: (next: { lat, lng, address }) => void
 */
export const LocationPicker = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { position: gpsPosition, loading: gpsLoading, requestLocation } = useGeolocation();

  const currentPosition = value ? { lat: value.lat, lng: value.lng } : null;

  // Reverse geocode whenever the pin moves (click or GPS)
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      onChange({ lat, lng, address: data.display_name || '' });
    } catch (err) {
      onChange({ lat, lng, address: '' });
    }
  };

  useEffect(() => {
    if (gpsPosition) reverseGeocode(gpsPosition.lat, gpsPosition.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsPosition]);

  // Forward geocode (address search) via Nominatim
  useEffect(() => {
    const search = async () => {
      if (!debouncedSearch || debouncedSearch.length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearch)}&limit=5`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    search();
  }, [debouncedSearch]);

  const selectSearchResult = (result) => {
    onChange({ lat: Number(result.lat), lng: Number(result.lon), address: result.display_name });
    setSearchTerm(result.display_name);
    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search for an address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-stone-400" />}

          {searchResults.length > 0 && (
            <ul className="absolute z-[1000] mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-raised">
              {searchResults.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    onClick={() => selectSearchResult(r)}
                    className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-stone-50"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={requestLocation}
          className="btn-outline flex-shrink-0"
          title="Use current location"
        >
          {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
        </button>
      </div>

      <div style={{ height: '320px' }} className="overflow-hidden rounded-2xl border border-stone-200">
        <MapContainer
          center={currentPosition ? [currentPosition.lat, currentPosition.lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
          zoom={currentPosition ? 16 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={({ lat, lng }) => reverseGeocode(lat, lng)} />
          {currentPosition && <Marker position={[currentPosition.lat, currentPosition.lng]} icon={pickerIcon} />}
          <RecenterOnChange position={currentPosition} />
        </MapContainer>
      </div>
      <p className="text-xs text-stone-500">
        Tap the map to drop a pin, search an address above, or use your current location.
      </p>
    </div>
  );
};
