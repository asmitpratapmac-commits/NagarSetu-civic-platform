import React, { useState } from 'react';
import { Sparkles, ImagePlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../../api';
import { Button } from '../../components/Button';
import { SeverityBadge } from '../../components/Badges';

export const AIDetectionPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await aiApi.detectImage(formData);
      setResult(data.data);
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-600" />
          <h1 className="font-display text-2xl font-medium text-char-950">AI Issue Detection</h1>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          Upload a photo of a civic issue and see how our AI reads it — before you file a report.
        </p>
      </div>

      <div className="card p-6">
        {preview ? (
          <img src={preview} alt="Upload preview" className="mb-4 h-56 w-full rounded-lg object-cover" />
        ) : (
          <label className="mb-4 flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 text-stone-500 hover:border-emerald-400 hover:text-emerald-600">
            <ImagePlus size={24} />
            <span className="text-sm">Click to upload a photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}

        <div className="flex gap-2">
          <label className="btn-outline flex-1 cursor-pointer text-center">
            {preview ? 'Choose another photo' : 'Select photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <Button onClick={handleAnalyze} disabled={!file} isLoading={analyzing} className="flex-1">
            Analyze
          </Button>
        </div>
      </div>

      {analyzing && (
        <div className="card flex items-center justify-center gap-2 p-8 text-stone-500">
          <Loader2 size={18} className="animate-spin" /> Analyzing image...
        </div>
      )}

      {result && !analyzing && (
        <div className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-char-950">Detection result</h2>
            <span className="text-xs text-stone-500">Confidence: {(result.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-stone-500">Detected issue</p>
              <p className="mt-0.5 font-medium capitalize text-char-900">{result.detectedIssue?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Category</p>
              <p className="mt-0.5 font-medium text-char-900">{result.category}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Severity</p>
              <div className="mt-1"><SeverityBadge severity={result.severity} /></div>
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-500">Recommended action</p>
            <p className="mt-1 text-sm text-char-800">{result.recommendedAction}</p>
          </div>
        </div>
      )}
    </div>
  );
};
