import React, { useState, useEffect } from 'react';
import { Send, Eye, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

/**
 * Briefing configuration — toggle, time, tickers, preview, test send.
 * Persists to the single UserSettings row.
 */
export default function BriefingConfig({ onSent, onPreview }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [feedback, setFeedback] = useState(null); // {type, message}

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.UserSettings.list();
      setSettings(list[0] || { briefing_enabled: false, briefing_time: '08:00', briefing_tickers: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        briefing_enabled: !!settings.briefing_enabled,
        briefing_time: settings.briefing_time || '08:00',
        briefing_tickers: settings.briefing_tickers || '',
      };
      if (settings.id) {
        await base44.entities.UserSettings.update(settings.id, payload);
      } else {
        const created = await base44.entities.UserSettings.create(payload);
        setSettings((s) => ({ ...s, id: created.id }));
      }
      setFeedback({ type: 'success', message: 'Settings saved.' });
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    setFeedback(null);
    try {
      // Save first so the function reads latest settings
      await save();
      const res = await base44.functions.invoke('sendTelegramBriefing', { preview: true });
      if (res.data?.error) {
        setFeedback({ type: 'error', message: res.data.message || res.data.error });
      } else {
        onPreview?.(res.data);
      }
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setPreviewing(false);
    }
  };

  const handleTestSend = async () => {
    setSending(true);
    setFeedback(null);
    try {
      await save();
      const res = await base44.functions.invoke('sendTelegramBriefing', { preview: false });
      if (res.data?.error) {
        setFeedback({ type: 'error', message: res.data.message || res.data.error });
      } else {
        setFeedback({ type: 'success', message: 'Briefing sent to Telegram.' });
      }
      onSent?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setFeedback({ type: 'error', message: msg });
      onSent?.();
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-specter-surface" />;
  }

  return (
    <div className="specter-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="agent-label text-specter-muted">Daily Briefing</div>
          <p className="mt-1 text-sm text-specter-text">Send every day to Telegram</p>
        </div>
        <Switch
          checked={!!settings.briefing_enabled}
          onCheckedChange={(v) => update({ briefing_enabled: v })}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="agent-label mb-2 block text-specter-muted">Delivery Time (UTC)</label>
          <Input
            type="time"
            value={settings.briefing_time || '08:00'}
            onChange={(e) => update({ briefing_time: e.target.value })}
            className="border-specter bg-specter-elevated font-mono text-specter-text focus-visible:ring-specter-primary"
          />
        </div>
        <div>
          <label className="agent-label mb-2 block text-specter-muted">Tickers (comma separated)</label>
          <Input
            value={settings.briefing_tickers || ''}
            onChange={(e) => update({ briefing_tickers: e.target.value.toUpperCase() })}
            placeholder="AAPL, NVDA, MES"
            className="border-specter bg-specter-elevated font-mono text-specter-text placeholder:text-specter-muted focus-visible:ring-specter-primary"
          />
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-md border p-3 ${
            feedback.type === 'error'
              ? 'border-bear/40 bg-bear/5'
              : 'border-bull/40 bg-bull/5'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
          )}
          <p className="text-xs text-specter-text">{feedback.message}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={save}
          disabled={saving}
          className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90"
        >
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
        <Button
          variant="ghost"
          onClick={handlePreview}
          disabled={previewing}
          className="border border-specter text-specter-text hover:bg-specter-elevated"
        >
          {previewing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Eye className="mr-1.5 h-4 w-4" />}
          Preview Today's Briefing
        </Button>
        <Button
          variant="ghost"
          onClick={handleTestSend}
          disabled={sending}
          className="border border-specter text-specter-text hover:bg-specter-elevated"
        >
          {sending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
          Send Test Briefing Now
        </Button>
      </div>

      <p className="mt-4 text-[0.7rem] text-specter-muted">
        Telegram delivery requires a chat ID in Settings and a server-side bot token. Preview works without either.
      </p>
    </div>
  );
}