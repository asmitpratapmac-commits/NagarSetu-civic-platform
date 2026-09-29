import L from 'leaflet';

const buildDivIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(18,20,15,0.35);
      border:2px solid white;
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });

// Severity-colored markers — deliberately no blue, matching the app palette.
export const MARKER_ICONS = {
  Critical: buildDivIcon('#8F3D2B'), // rust
  High: buildDivIcon('#E8A33D'), // amber
  Medium: buildDivIcon('#2E8055'), // emerald
  Low: buildDivIcon('#847C64'), // stone
  default: buildDivIcon('#2E8055'),
};

export const getMarkerIcon = (severity) => MARKER_ICONS[severity] || MARKER_ICONS.default;
