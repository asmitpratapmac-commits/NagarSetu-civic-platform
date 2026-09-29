import React, { useEffect, useState } from 'react';
import { ComplaintsMap } from '../../components/map/ComplaintsMap';
import { complaintApi } from '../../api/complaintApi';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Button } from '../../components/Button';
import { Crosshair } from 'lucide-react';

export const CitizenMap = () => {
  const [complaints, setComplaints] = useState([]);
  const [center, setCenter] = useState([28.6139, 77.209]);
  const { position, requestLocation, loading } = useGeolocation();

  const load = async (lat, lng) => {
    const { data } = await complaintApi.nearby({ lat, lng, radiusKm: 5 });
    setComplaints(data.data);
  };

  useEffect(() => {
    load(center[0], center[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (position) {
      setCenter([position.lat, position.lng]);
      load(position.lat, position.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-medium text-char-950">City map</h1>
          <p className="text-sm text-stone-600">{complaints.length} public complaints near you</p>
        </div>
        <Button variant="outline" onClick={requestLocation} isLoading={loading} icon={Crosshair}>
          Use my location
        </Button>
      </div>
      <ComplaintsMap complaints={complaints} center={center} zoom={13} height="calc(100vh - 260px)" basePath="/citizen/complaints" />
    </div>
  );
};
