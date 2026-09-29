import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, X } from 'lucide-react';
import { complaintApi } from '../../api/complaintApi';
import { Button } from '../../components/Button';
import { LocationPicker } from '../../components/map/LocationPicker';
import { CATEGORIES } from '../../utils/constants';

const schema = z.object({
  title: z.string().min(5, 'Title should be at least 5 characters'),
  description: z.string().min(10, 'Add a bit more detail (10+ characters)'),
  category: z.string().optional(),
  location: z
    .object({ lat: z.number(), lng: z.number(), address: z.string().optional() })
    .refine((v) => v?.lat !== undefined, 'Please select a location on the map'),
});

export const ReportComplaint = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { location: null },
  });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const removeFile = (index) => setFiles((f) => f.filter((_, i) => i !== index));

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      if (values.category) formData.append('category', values.category);
      formData.append('address', values.location.address || '');
      formData.append('latitude', values.location.lat);
      formData.append('longitude', values.location.lng);
      files.forEach((file) => formData.append('media', file));

      const { data } = await complaintApi.create(formData);
      toast.success('Complaint submitted — AI is analyzing it now.');
      navigate(`/citizen/complaints/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-medium text-char-950">Report an issue</h1>
      <p className="mt-1 text-sm text-stone-600">
        Describe what you saw — our AI will classify it and route it to the right department.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Large pothole near bus stop" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-rust-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[120px] resize-y"
            placeholder="Describe the issue, how long it's been there, and any safety concerns..."
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-rust-500">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Category (optional — AI will detect it if left blank)</label>
          <select className="input" {...register('category')}>
            <option value="">Let AI decide</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Photos / videos (up to 5)</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 py-6 text-sm text-stone-500 hover:border-emerald-400 hover:text-emerald-600">
            <ImagePlus size={18} />
            Click to upload evidence
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
          </label>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs text-char-700">
                  {file.name}
                  <button type="button" onClick={() => removeFile(i)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Location</label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => <LocationPicker value={field.value} onChange={field.onChange} />}
          />
          {errors.location && <p className="mt-1 text-xs text-rust-500">{errors.location.message}</p>}
        </div>

        <Button type="submit" className="w-full" isLoading={submitting}>
          Submit Complaint
        </Button>
      </form>
    </div>
  );
};
