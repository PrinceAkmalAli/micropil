export const today = () => new Date().toISOString().slice(0, 10);
export const money = n => 'Rs ' + Number(n || 0).toLocaleString('en-PK');
export const paid = t => (t.payments || []).reduce((s, x) => s + (+x.amount || 0), 0);
export const due = t => (+t.total || 0) - paid(t);
export const totals = p => { const b = p.treatments.reduce((s, t) => s + (+t.total || 0), 0), pd = p.treatments.reduce((s, t) => s + paid(t), 0); return { billed: b, paid: pd, due: b - pd }; };
export const nextSession = p => p.treatments.flatMap(t => (t.sessions || []).filter(s => !s.done).map(s => ({ ...s, procedure: t.procedure }))).sort((a, b) => a.date.localeCompare(b.date))[0];
