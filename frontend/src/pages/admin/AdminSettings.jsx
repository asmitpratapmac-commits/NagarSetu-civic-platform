import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../api';
import { Button } from '../../components/Button';

export const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((res) => setSettings(res.data.data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        slaRules: settings.slaRules,
        aiConfig: settings.aiConfig,
        general: settings.general,
      });
      toast.success('Settings saved.');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="card h-96 animate-pulse" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-medium text-char-950">Settings</h1>

      <div className="card space-y-4 p-6">
        <h2 className="font-medium text-char-950">SLA rules (hours to resolve, by severity)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(settings.slaRules).map(([severity, hours]) => (
            <div key={severity}>
              <label className="label">{severity}</label>
              <input
                type="number"
                className="input"
                value={hours}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, slaRules: { ...s.slaRules, [severity]: Number(e.target.value) } }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-medium text-char-950">AI configuration</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm text-char-800">AI analysis enabled</span>
          <input
            type="checkbox"
            checked={settings.aiConfig.enabled}
            onChange={(e) => setSettings((s) => ({ ...s, aiConfig: { ...s.aiConfig, enabled: e.target.checked } }))}
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-char-800">Auto-assign department</span>
          <input
            type="checkbox"
            checked={settings.aiConfig.autoAssignDepartment}
            onChange={(e) =>
              setSettings((s) => ({ ...s, aiConfig: { ...s.aiConfig, autoAssignDepartment: e.target.checked } }))
            }
          />
        </label>
        <div>
          <label className="label">AI service URL</label>
          <input
            className="input"
            value={settings.aiConfig.aiServiceUrl}
            onChange={(e) => setSettings((s) => ({ ...s, aiConfig: { ...s.aiConfig, aiServiceUrl: e.target.value } }))}
          />
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-medium text-char-950">General</h2>
        <div>
          <label className="label">App name</label>
          <input
            className="input"
            value={settings.general.appName}
            onChange={(e) => setSettings((s) => ({ ...s, general: { ...s.general, appName: e.target.value } }))}
          />
        </div>
        <label className="flex items-center justify-between">
          <span className="text-sm text-char-800">Allow citizens to reopen complaints</span>
          <input
            type="checkbox"
            checked={settings.general.allowCitizenReopen}
            onChange={(e) =>
              setSettings((s) => ({ ...s, general: { ...s.general, allowCitizenReopen: e.target.checked } }))
            }
          />
        </label>
      </div>

      <Button onClick={handleSave} isLoading={saving}>
        Save all settings
      </Button>
    </div>
  );
};
