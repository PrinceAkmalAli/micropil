import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { money, paid, due, totals, nextSession } from './util';

const toData = url => fetch(url).then(r => r.blob()).then(b => new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); }));

export async function makePDF({ title, subtitle = '', summary = [], tables, file, landscape = false }) {
  const d = new jsPDF({ orientation: landscape ? 'l' : 'p', unit: 'pt', format: 'a4' });
  const W = d.internal.pageSize.getWidth(), H = d.internal.pageSize.getHeight();
  const logo = await toData('/logo.jpg');
  const header = () => {
    d.setFillColor(43, 28, 17); d.rect(0, 0, W, 92, 'F'); d.addImage(logo, 'JPEG', 24, 6, 82, 78);
    d.setFont('helvetica', 'bold'); d.setFontSize(19); d.setTextColor(246, 226, 122); d.text(title, W - 30, 42, { align: 'right' });
    d.setFont('helvetica', 'normal'); d.setFontSize(9); d.setTextColor(225, 210, 185);
    d.text(subtitle, W - 30, 60, { align: 'right' }); d.text('Generated ' + new Date().toLocaleString(), W - 30, 75, { align: 'right' });
    d.setFillColor(212, 175, 55); d.rect(0, 92, W, 3, 'F');
  };
  header();
  let y = 122;
  if (summary.length) {
    const w = (W - 60) / summary.length;
    summary.forEach(([l, v], i) => {
      const x = 30 + i * w; d.setFillColor(250, 243, 224); d.roundedRect(x, y - 12, w - 8, 48, 6, 6, 'F');
      d.setFontSize(8); d.setFont('helvetica', 'normal'); d.setTextColor(120, 95, 40); d.text(String(l).toUpperCase(), x + 8, y + 3);
      d.setFontSize(13); d.setFont('helvetica', 'bold'); d.setTextColor(43, 28, 17); d.text(String(v), x + 8, y + 24);
    });
    y += 64;
  }
  tables.forEach(t => {
    if (y > H - 100) { d.addPage(); y = 120; }
    if (t.title) { d.setFontSize(12); d.setFont('helvetica', 'bold'); d.setTextColor(43, 28, 17); d.text(t.title, 30, y); y += 8; }
    autoTable(d, { startY: y, head: [t.head], body: t.rows, margin: { top: 112, left: 30, right: 30, bottom: 40 },
      headStyles: { fillColor: [43, 28, 17], textColor: [246, 226, 122] }, alternateRowStyles: { fillColor: [252, 248, 236] },
      styles: { fontSize: 9, cellPadding: 5 }, didDrawPage: header });
    y = d.lastAutoTable.finalY + 26;
  });
  const n = d.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    d.setPage(i); d.setFontSize(8); d.setFont('helvetica', 'normal'); d.setTextColor(130);
    d.text(`Micropil Hair Transplant & Aesthetics  |  PWD Main Road, Islamabad  |  03315269599`, 30, H - 18);
    d.text(`Page ${i} of ${n}`, W - 30, H - 18, { align: 'right' });
  }
  d.save(file);
}

export const statementPDF = p => {
  const t = totals(p), ns = nextSession(p);
  return makePDF({
    title: 'Patient Statement', subtitle: `${p.name}  |  ${p.code}  |  ${p.phone}`, file: `${p.code}-statement.pdf`,
    summary: [['Total billed', money(t.billed)], ['Total paid', money(t.paid)], ['Balance due', money(t.due)], ['Next session', ns ? ns.date : 'None scheduled']],
    tables: [
      { title: 'Procedures', head: ['Procedure', 'Date', 'Fee', 'Paid', 'Due', 'Status'], rows: p.treatments.map(x => [x.procedure, x.date, money(x.total), money(paid(x)), money(due(x)), x.status]) },
      { title: 'Payment history', head: ['Date', 'Procedure', 'Amount', 'Method', 'Note'], rows: p.treatments.flatMap(x => (x.payments || []).map(y => [y.date, x.procedure, money(y.amount), y.method || '', y.note || ''])).sort((a, b) => a[0].localeCompare(b[0])) },
      { title: 'Sessions', head: ['Date', 'Procedure', 'Note', 'Status'], rows: p.treatments.flatMap(x => (x.sessions || []).map(s => [s.date, x.procedure, s.note || '', s.done ? 'Done' : 'Upcoming'])).sort((a, b) => a[0].localeCompare(b[0])) }
    ]
  });
};
