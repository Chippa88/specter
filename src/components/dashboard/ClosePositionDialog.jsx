import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const today = () => new Date().toISOString().slice(0, 10);

export default function ClosePositionDialog({ open, position, onOpenChange, onClosed }) {
  const [exitPrice, setExitPrice] = useState('');
  const [exitDate, setExitDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setExitPrice('');
      setExitDate(today());
      setError(null);
      setSaving(false);
    }
  }, [open]);

  if (!position) return null;

  const handleClose = async () => {
    if (!exitPrice) {
      setError('Exit price is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const ep = parseFloat(exitPrice);
      const direction = position.position_type === 'short' ? -1 : 1;
      const pnl = parseFloat(
        (direction * (ep - position.entry_price) * position.quantity).toFixed(2)
      );
      await base44.entities.Portfolio.update(position.id, {
        status: 'closed',
        exit_price: ep,
        exit_date: exitDate,
        pnl,
      });
      onClosed?.();
      onOpenChange(false);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-specter bg-specter-surface p-0 text-specter-text">
        <DialogTitle className="sr-only">Close Position</DialogTitle>
        <div className="border-b border-specter px-5 py-3">
          <div className="agent-label text-specter-muted">
            CLOSE {position.position_type?.toUpperCase()} · <span className="font-mono">{position.ticker}</span>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-md border border-specter bg-specter-elevated/40 p-3 text-xs text-specter-muted">
            Entry: <span className="font-mono text-specter-text">${position.entry_price?.toFixed(2)}</span> ·
            Qty: <span className="font-mono text-specter-text">{position.quantity}</span>
          </div>

          <div>
            <label className="agent-label mb-1.5 block text-specter-muted">Exit Price</label>
            <Input
              type="number"
              step="0.01"
              autoFocus
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="h-10 border-specter bg-specter-elevated font-mono text-specter-text focus-visible:ring-specter-primary"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="agent-label mb-1.5 block text-specter-muted">Exit Date</label>
            <Input
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              className="h-10 border-specter bg-specter-elevated font-mono text-specter-text focus-visible:ring-specter-primary"
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
          <Button onClick={handleClose} disabled={saving} className="bg-specter-primary text-specter-bg hover:bg-specter-primary/90">
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Close Position
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}