import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { getMarkerIcon } from './markerIcons';
import { StatusBadge, SeverityBadge } from '../Badges';

const DEFAULT_CENTER = [28.6139, 77.209]; // New Delhi fallback

/**
 * Renders complaint markers on an OpenStreetMap tile layer.
 * Every marker's React `key` and popup link use the complaint's MongoDB `_id`
 * as required — never an array index.
 */
export const ComplaintsMap = ({ complaints = [], center = DEFAULT_CENTER, zoom = 12, height = '420px', basePath = '/complaints' }) => {
  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-stone-200">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map((complaint) => {
          const [lng, lat] = complaint.location.coordinates;
          return (
            <Marker key={complaint._id} position={[lat, lng]} icon={getMarkerIcon(complaint.severity)}>
              <Popup>
                <div className="min-w-[180px] space-y-1.5">
                  <p className="font-medium text-char-950">{complaint.title}</p>
                  <div className="flex gap-1.5">
                    <StatusBadge status={complaint.status} />
                    <SeverityBadge severity={complaint.severity} />
                  </div>
                  <Link to={`${basePath}/${complaint._id}`} className="text-xs font-medium text-emerald-600 hover:underline">
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
