import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { MapPin, Clock, Sparkles, Send, ImagePlus, CheckCircle2, XCircle } from 'lucide-react';

import { fetchComplaintById, clearCurrentComplaint } from '../../redux/slices/complaintSlice';
import { complaintApi } from '../../api/complaintApi';
import { userApi } from '../../api';
import { StatusBadge, SeverityBadge } from '../../components/Badges';
import { Button } from '../../components/Button';
import { ComplaintsMap } from '../../components/map/ComplaintsMap';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime, timeAgo, SLA_HOURS_LABEL } from '../../utils/constants';

const STATUS_ACTIONS = {
  Assigned: ['In Progress', 'Rejected'],
  'In Progress': ['Rejected'], // Resolved handled via dedicated resolve flow
};

export const ComplaintDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { role } = useAuth();
  const { current: complaint, status } = useSelector((s) => s.complaints);

  const [commentText, setCommentText] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState([]);
  const [resolutionNote, setResolutionNote] = useState('');
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => dispatch(fetchComplaintById(id));

  useEffect(() => {
    load();
    return () => dispatch(clearCurrentComplaint());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (role === 'admin' && complaint?.department) {
      userApi.listByDepartment(complaint.department._id).then((res) => setOfficers(res.data.data));
    }
  }, [role, complaint?.department]);

  if (status === 'loading' || !complaint) {
    return <div className="card h-64 animate-pulse" />;
  }

  const [lng, lat] = complaint.location.coordinates;

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setBusy(true);
    try {
      await complaintApi.comment(id, { message: commentText });
      setCommentText('');
      load();
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setBusy(true);
    try {
      await complaintApi.updateStatus(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setBusy(false);
    }
  };

  const handleUploadEvidence = async () => {
    if (resolutionFiles.length === 0) {
      toast.error('Select at least one evidence file first.');
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      resolutionFiles.forEach((f) => formData.append('media', f));
      await complaintApi.uploadResolutionEvidence(id, formData);
      toast.success('Evidence uploaded.');
      setResolutionFiles([]);
      load();
    } catch (err) {
      toast.error('Failed to upload evidence.');
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) {
      toast.error('Add a short resolution note.');
      return;
    }
    setBusy(true);
    try {
      await complaintApi.resolve(id, { resolutionNote });
      toast.success('Marked resolved — awaiting citizen confirmation.');
      setResolutionNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot resolve yet.');
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (isConfirmed) => {
    setBusy(true);
    try {
      await complaintApi.verify(id, {
        isConfirmed,
        reopenReason: !isConfirmed ? 'Citizen reports the issue is still present.' : undefined,
      });
      toast.success(isConfirmed ? 'Thanks for confirming!' : 'Complaint reopened.');
      load();
    } catch (err) {
      toast.error('Failed to submit verification.');
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOfficer) return;
    setBusy(true);
    try {
      await complaintApi.assign(id, { assignedTo: selectedOfficer });
      toast.success('Complaint assigned.');
      load();
    } catch (err) {
      toast.error('Failed to assign.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* -------- Header -------- */}
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <SeverityBadge severity={complaint.severity} />
            {complaint.isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rust-500/10 px-2.5 py-1 text-xs font-medium text-rust-500">
                <Clock size={12} /> SLA overdue
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-2xl font-medium text-char-950">{complaint.title}</h1>
          <p className="mt-2 text-sm text-stone-600">{complaint.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1"><MapPin size={12} /> {complaint.address}</span>
            <span>Reported {timeAgo(complaint.createdAt)}</span>
            <span>SLA: {SLA_HOURS_LABEL[complaint.severity]}</span>
          </div>

          {complaint.media?.length > 0 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {complaint.media.map((m, i) => (
                <img key={i} src={m.url} alt="" className="h-28 w-28 flex-shrink-0 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        {/* -------- AI analysis -------- */}
        {complaint.ai?.isAnalyzed && (
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" />
              <h2 className="font-medium text-char-950">AI Analysis</h2>
              <span className="ml-auto text-xs text-stone-500">
                Confidence: {(complaint.ai.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="mt-3 text-sm text-stone-600">{complaint.ai.summary}</p>
            <p className="mt-2 text-sm font-medium text-char-800">Recommended action</p>
            <p className="text-sm text-stone-600">{complaint.ai.recommendedAction}</p>
          </div>
        )}

        {/* -------- Map -------- */}
        <ComplaintsMap complaints={[complaint]} center={[lat, lng]} zoom={15} height="280px" />

        {/* -------- Resolution evidence -------- */}
        {complaint.resolutionEvidence?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-medium text-char-950">Resolution evidence</h2>
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {complaint.resolutionEvidence.map((m, i) => (
                <img key={i} src={m.url} alt="" className="h-32 w-32 flex-shrink-0 rounded-lg object-cover" />
              ))}
            </div>
            {complaint.resolutionNote && <p className="mt-3 text-sm text-stone-600">{complaint.resolutionNote}</p>}
          </div>
        )}

        {/* -------- Timeline -------- */}
        <div className="card p-6">
          <h2 className="font-medium text-char-950">Timeline</h2>
          <ol className="mt-4 space-y-4 border-l border-stone-200 pl-4">
            {complaint.timeline.map((event, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-sm font-medium text-char-900">{event.status}</p>
                {event.note && <p className="text-sm text-stone-600">{event.note}</p>}
                <p className="text-xs text-stone-400">{formatDateTime(event.createdAt)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* -------- Comments -------- */}
        <div className="card p-6">
          <h2 className="font-medium text-char-950">Comments</h2>
          <div className="mt-3 space-y-3">
            {complaint.comments?.length === 0 && <p className="text-sm text-stone-500">No comments yet.</p>}
            {complaint.comments?.map((c) => (
              <div key={c._id} className="rounded-lg bg-stone-50 p-3">
                <p className="text-xs font-medium capitalize text-char-800">{c.authorRole}</p>
                <p className="mt-0.5 text-sm text-char-700">{c.message}</p>
                <p className="mt-1 text-[11px] text-stone-400">{timeAgo(c.createdAt)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            />
            <Button onClick={handleComment} isLoading={busy} icon={Send} />
          </div>
        </div>
      </div>

      {/* -------- Actions sidebar -------- */}
      <div className="space-y-4">
        {/* Citizen: verify resolution */}
        {role === 'citizen' && complaint.status === 'Pending Verification' && (
          <div className="card p-5">
            <h3 className="font-medium text-char-950">Was this actually resolved?</h3>
            <p className="mt-1 text-sm text-stone-600">Confirm the fix, or reopen if the issue is still there.</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => handleVerify(true)} isLoading={busy} icon={CheckCircle2} className="flex-1">
                Confirm
              </Button>
              <Button onClick={() => handleVerify(false)} isLoading={busy} variant="outline" icon={XCircle} className="flex-1">
                Reopen
              </Button>
            </div>
          </div>
        )}

        {/* Authority: status transitions */}
        {role === 'authority' && STATUS_ACTIONS[complaint.status] && (
          <div className="card p-5">
            <h3 className="font-medium text-char-950">Update status</h3>
            <div className="mt-3 flex flex-col gap-2">
              {STATUS_ACTIONS[complaint.status].map((s) => (
                <Button key={s} variant="outline" onClick={() => handleStatusChange(s)} isLoading={busy}>
                  Move to {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Authority: resolution evidence + resolve */}
        {role === 'authority' && complaint.status === 'In Progress' && (
          <div className="card p-5">
            <h3 className="font-medium text-char-950">Mark resolved</h3>
            <p className="mt-1 text-xs text-stone-500">Evidence is required before you can resolve this complaint.</p>

            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 py-4 text-sm text-stone-500 hover:border-emerald-400">
              <ImagePlus size={16} /> Upload evidence
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => setResolutionFiles(Array.from(e.target.files))}
              />
            </label>
            {resolutionFiles.length > 0 && (
              <>
                <p className="mt-2 text-xs text-stone-500">{resolutionFiles.length} file(s) selected</p>
                <Button variant="outline" className="mt-2 w-full" onClick={handleUploadEvidence} isLoading={busy}>
                  Upload
                </Button>
              </>
            )}

            {complaint.resolutionEvidence?.length > 0 && (
              <>
                <textarea
                  className="input mt-3 min-h-[80px]"
                  placeholder="Resolution note..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
                <Button className="mt-2 w-full" onClick={handleResolve} isLoading={busy}>
                  Mark Resolved
                </Button>
              </>
            )}
          </div>
        )}

        {/* Admin: assign/reassign */}
        {role === 'admin' && (
          <div className="card p-5">
            <h3 className="font-medium text-char-950">Assign officer</h3>
            <select className="input mt-3" value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)}>
              <option value="">Select an officer</option>
              {officers.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} — {o.designation}
                </option>
              ))}
            </select>
            <Button className="mt-2 w-full" onClick={handleAssign} isLoading={busy} disabled={!selectedOfficer}>
              Assign
            </Button>
          </div>
        )}

        {/* Meta info */}
        <div className="card p-5 text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-stone-500">Category</span>
            <span className="font-medium text-char-900">{complaint.category}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-stone-500">Department</span>
            <span className="font-medium text-char-900">{complaint.department?.name || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-stone-500">Assigned to</span>
            <span className="font-medium text-char-900">{complaint.assignedTo?.name || '—'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-stone-500">Reported by</span>
            <span className="font-medium text-char-900">{complaint.reportedBy?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
