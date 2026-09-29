import React, { useEffect, useState } from 'react';
import { complaintApi } from '../../api/complaintApi';
import { ComplaintsMap } from '../../components/map/ComplaintsMap';

export const AuthorityMap = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await complaintApi.listAssignedToMe({ limit: 100 });
      setComplaints(data.data.filter((c) => c.location?.coordinates));
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-medium text-char-950">Assigned complaints map</h1>
        <p className="text-sm text-stone-600">{complaints.length} complaints plotted</p>
      </div>
      <ComplaintsMap complaints={complaints} zoom={12} height="calc(100vh - 220px)" basePath="/authority/complaints" />
    </div>
  );
};
