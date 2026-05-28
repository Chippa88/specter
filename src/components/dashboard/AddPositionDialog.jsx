import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddPositionDialog({ open, onOpenChange, onAdded }) {
  const [form, setForm] = useState({
    ticker: '',
    asset_type: 'stock',
    position_type: 'long',
    entry_price: '',
    quantity: '',
    entry_date: today(),
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm({
        ticker: '',
        asset_type: 'stock',
        position_type: 'long',
        entry_price: '',
        quantity: '',
        entry_date: today(),
        notes: '',
      });
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.ticker.trim() || !form.entry_price || !form.quantity) {
      setError('Ticker, entry price, and quantity are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await base44.entities.Portfolio.create({
        ticker: form.ticker.toUpperCase().trim(),
        asset_type: form.asset_type,
        position_type: form.position_type,
        entry_price: parseFloat(form.entry_price),
        quantity: parseFloat(form.quantity),
        entry_date: form.entry_date,
        notes: form.notes,
        status: 'open',
      });
      onAdded?.();
      onOpenChange(false);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-specter bg-specter-surface p-0 text-specter-text">
        <DialogTitle className="sr-only">Add Position</DialogTitle>
        <div className="border-b border-specter px-5 py-3">
          <div className="agent-label text-specter-muted">LOG POSITION</div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="agent-label mb-1.5 block text-specter-muted">Ticker</label>
              <Input
                value={form.ticker}
                onChange={(e) => set('ticker', e.target.value.toUpperCase())}
                className="h-10 border-specter bg-specter-elevated font-mono text-specter-text focus-visible:ring-specter-primary"
                placeholder="AAPL"
              />
            </div>
            <div>
              <label className="agent-label mb-1.5 block text-specter-muted">Asset Type</label>
              <Select value={form.asset_type} onValueChange={(v) => set('asset_type', v)}>
                <SelectTrigger className="h-10 border-specter bg-specter-elevated text-specter-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-specter bg-specter-surface text-specter-text">
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="futures">Futures</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="agent-label mb-1.5 block text-specter-muted">Side</label>
              <Select value={form.position_type} onValueChange={(v) => set('position_type', v)}>
                <SelectTrigger className="h-10 border-specter bg-specter-elevated text-specter-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-specter bg-specter-surface text-specter-text">
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="agent-label mb-1.5 block text-specter-muted">Entry Date</label>
              <Input
                type="date"
                value={form.entry_date}
                onChange={(e) => set('entry_date', e.target.value)}
                className="h-10 border-specter bg-specter-elevated font-mono text-specter-text focus-visible:ring-specter-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="agent-label mb-1.5 block text-specter-muted">Entry Price</label>
              <Input
                type="number"
                step="0.01"
                value={form.entry_price}
                onChange={(e) => set('entry_price', e.target.value)}
                className="h-10 border-specter bg-specter-elevated font-mono text-specter-text focus-visible:ring-specter-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="agent-label mb-1.5 block text-specter-muted">Quantity</label>
              <Input
                type="number"
                step="any"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                className="h-10 border-specter bg-specter-elevated font-mono text-specter-text focus-visible:ring-specter-primary"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="agent-label mb-1.5 block text-specter-muted">Notes (optional)</label>
            <Input
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="h-10 border-specter bg-specter-elevated text-specter-text focus-visible:ring-specter-primary"
              placeholder="Trade thesis, stop loss, etc."
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-bear/40 bg-bear/5 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
              <p className="text-xs text-specter-text">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-specter px-5 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-specter-muted hover:text-specter-text">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90"
          >
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save Position
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}