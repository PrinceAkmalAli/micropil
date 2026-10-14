import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, upload, img } from './api';
import { money, paid, due, totals, nextSession, today } from './util';
import { makePDF, statementPDF } from './pdf';

const STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];
const COLOR = { pending: '#e0a526', confirmed: '#4fb477', completed: '#5a8fd8', cancelled: '#d9604f', ongoing: '#e0a526' };
const Pill = ({ s }) => <span className="pill" style={{ background: (COLOR[s] || '#888') + '33', color: COLOR[s] || '#ccc' }}>{s}</span>;
const uid = () => Math.random().toString(36).slice(2, 9);
const when = ms => new Date(ms).toLocaleString();

const exportCSV = list => {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['Name', 'Phone', 'Email', 'Procedure', 'Date', 'Time', 'Status', 'Booked at', 'Message'];
  const rows = list.map(a => [a.name, a.phone, a.email, a.procedure, a.date, a.time, a.status, when(a.createdAt), a.message].map(q).join(','));
  const url = URL.createObjectURL(new Blob([[head.join(','), ...rows].join('\n')], { type: 'text/csv' }));
  Object.assign(document.createElement('a'), { href: url, download: 'micropil-appointments.csv' }).click();
};
const apptRows = l => l.map((a, i) => [i + 1, a.name, a.phone, a.procedure, `${a.date} ${a.time}`, a.status, when(a.createdAt)]);
const apptHead = ['#', 'Patient', 'Phone', 'Procedure', 'Visit', 'Status', 'Booked at'];

function Mini({ fields, btn, onAdd }) {
  const [v, setV] = useState({});
  return (
    <form className="mini-form" onSubmit={e => { e.preventDefault(); onAdd(v); setV({}); }}>
      {fields.map(([k, label, type = 'text', req = true]) => (
        <label key={k}><span>{label}</span><input type={type} required={req} value={v[k] || ''} onChange={e => setV({ ...v, [k]: e.target.value })} /></label>
      ))}
      <button className="btn sm">{btn}</button>
    </form>
  );
}

function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const pick = async e => {
    const f = e.target.files[0]; if (!f) return; setBusy(true); setErr('');
    try { onChange(await upload(f)); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  return (
    <label>{label}
      {value && <img className="prev" src={img(value)} alt="" />}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />
      {busy && <small>Uploading in full quality...</small>}{err && <small className="err">{err}</small>}
    </label>
  );
}

export function Login() {
  const nav = useNavigate(); const [f, setF] = useState({ username: '', password: '' }); const [err, setErr] = useState('');
  const go = async e => {
    e.preventDefault();
    try { const d = await api('/admin/login', { method: 'POST', body: f }); localStorage.setItem('mtk', d.token); localStorage.setItem('mu', JSON.stringify(d.user)); nav('/admin'); }
    catch (x) { setErr(x.message); }
  };
  return (
    <div className="login"><form className="card form" onSubmit={go}>
      <img src="/logo.jpg" alt="Micropil" style={{ width: 170, margin: 'auto', mixBlendMode: 'lighten' }} />
      <h3 className="center gold">Staff & admin login</h3>
      <label>Username<input required value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></label>
      <label>Password<input type="password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></label>
      {err && <p className="err">{err}</p>}
      <button className="btn">Sign in</button>
    </form></div>
  );
}

export function Dashboard() {
  const nav = useNavigate(); const user = JSON.parse(localStorage.getItem('mu') || '{}'); const isAdmin = user.role === 'admin';
  const [tab, setTab] = useState('overview'); const [A, setA] = useState([]); const [P, setP] = useState([]); const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState(''); const prev = useRef(null);
  const out = () => { localStorage.removeItem('mtk'); localStorage.removeItem('mu'); nav('/admin/login'); };
  const loadP = () => api('/admin/patients', { auth: 1 }).then(setP).catch(() => { });
  const load = () => {
    api('/admin/appointments', { auth: 1 }).then(d => {
      if (prev.current !== null && d.length > prev.current) { setToast(`New appointment: ${d[0].name} - ${d[0].procedure}`); setTimeout(() => setToast(''), 6000); }
      prev.current = d.length; setA(d);
    }).catch(out);
    loadP();
  };
  useEffect(() => {
    if (!localStorage.getItem('mtk')) return nav('/admin/login');
    load(); const t = setInterval(load, 15000); return () => clearInterval(t);
  }, []);
  const tabs = [['overview', 'Overview'], ['appointments', 'Appointments'], ['patients', 'Patients'], ['reports', 'Reports'],
  ...(isAdmin ? [['procedures', 'Procedures'], ['results', 'Before & Afters'], ['settings', 'Website settings'], ['team', 'Team']] : [])];
  const pending = A.filter(a => a.status === 'pending').length;
  return (
    <div className="adm">
      {toast && <div className="toast">{toast}</div>}
      <aside className="side noprint">
        <img src="/logo.jpg" alt="Micropil" />
        <p className="who">{user.name}<br /><small className="mut">{isAdmin ? 'Administrator' : 'Staff'}</small></p>
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setFocus(null); }}>{l}{k === 'appointments' && pending > 0 && <b className="badge">{pending}</b>}</button>)}
        <button onClick={out}>Sign out</button>
      </aside>
      <div className="main">
        {tab === 'overview' && <Overview A={A} P={P} />}
        {tab === 'appointments' && <Appointments A={A} reload={load} isAdmin={isAdmin} onPatient={id => { setFocus(id); setTab('patients'); }} />}
        {tab === 'patients' && <Patients P={P} reload={loadP} user={user} focus={focus} />}
        {tab === 'reports' && <Reports />}
        {tab === 'procedures' && <Editor kind="procedures" fields={[['name', 'Name'], ['category', 'Category (Hair / Skin / Body)'], ['tag', 'Tag'], ['description', 'Description'], ['image', 'Procedure photo', 'image']]} />}
        {tab === 'results' && <Editor kind="results" fields={[['title', 'Title'], ['before', 'Before photo', 'image'], ['after', 'After photo', 'image'], ['note', 'Note']]} />}
        {tab === 'settings' && <Settings />}
        {tab === 'team' && <Team />}
      </div>
    </div>
  );
}

function Overview({ A, P }) {
  const td = today(); const n = s => A.filter(a => a.status === s).length;
  const days = [...Array(14)].map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10);
    return [d.slice(5), A.filter(a => new Date(a.createdAt).toISOString().slice(0, 10) === d).length];
  });
  const max = Math.max(1, ...days.map(d => d[1]));
  const upcoming = A.filter(a => a.date >= td && a.status !== 'cancelled').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 6);
  const dues = P.reduce((s, p) => s + totals(p).due, 0);
  const sessions = P.map(p => ({ p, s: nextSession(p) })).filter(x => x.s).sort((a, b) => a.s.date.localeCompare(b.s.date)).slice(0, 6);
  return (
    <>
      <h2 className="gold">Overview</h2>
      <div className="stats">
        {[['Total bookings', A.length], ['Pending requests', n('pending')], ["Today's visits", A.filter(a => a.date === td && a.status !== 'cancelled').length], ['Patients', P.length], ['Outstanding dues', money(dues)]].map(([l, v]) => (
          <div className="card" key={l}><span className="mut">{l}</span><b>{v}</b></div>
        ))}
      </div>
      <div className="card"><h4>Bookings received, last 14 days</h4>
        <div className="bars">{days.map(([d, c]) => <div key={d}><i style={{ height: (c / max) * 120 + 'px' }} />{c}<br />{d}</div>)}</div></div>
      <div className="split" style={{ marginTop: 16 }}>
        <div className="card"><h4>Upcoming appointments</h4>
          {!upcoming.length && <p className="mut">No upcoming appointments yet.</p>}
          {upcoming.map(a => <div className="row" key={a.id}><span><b>{a.name}</b> - {a.procedure}</span><span>{a.date} {a.time} <Pill s={a.status} /></span></div>)}</div>
        <div className="card"><h4>Upcoming patient sessions</h4>
          {!sessions.length && <p className="mut">No sessions scheduled.</p>}
          {sessions.map(({ p, s }) => <div className="row" key={p.id}><span><b>{p.name}</b> ({p.code}) - {s.procedure}</span><span>{s.date}</span></div>)}</div>
      </div>
    </>
  );
}

function Appointments({ A, reload, isAdmin, onPatient }) {
  const [q, setQ] = useState(''); const [fs, setFs] = useState('all');
  const list = A.filter(a => (fs === 'all' || a.status === fs) && (a.name + a.phone + a.procedure).toLowerCase().includes(q.toLowerCase()));
  const setStatus = async (id, status) => { await api('/admin/appointments/' + id, { method: 'PATCH', body: { status }, auth: 1 }); reload(); };
  const del = async id => { if (confirm('Delete this appointment?')) { await api('/admin/appointments/' + id, { method: 'DELETE', auth: 1 }); reload(); } };
  const mk = async a => {
    const p = await api('/admin/patients', { method: 'POST', body: { name: a.name, phone: a.phone, email: a.email, procedure: a.procedure, date: a.date }, auth: 1 });
    await setStatus(a.id, 'completed'); onPatient(p.id);
  };
  const pdf = () => makePDF({ title: 'Appointments', subtitle: `${list.length} records | filter: ${fs}`, landscape: true, file: 'micropil-appointments.pdf', tables: [{ head: apptHead, rows: apptRows(list) }] });
  return (
    <>
      <h2 className="gold">Appointments</h2>
      <div className="row noprint"><input placeholder="Search name, phone, procedure" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <select value={fs} onChange={e => setFs(e.target.value)} style={{ width: 160 }}><option value="all">All statuses</option>{STATUS.map(s => <option key={s}>{s}</option>)}</select>
        <span><button className="btn sm" onClick={pdf}>Export PDF</button> <button className="btn ghost sm" onClick={() => exportCSV(list)}>CSV</button></span></div>
      <table className="tbl"><thead><tr><th>Patient</th><th>Procedure</th><th>When</th><th>Status</th><th /></tr></thead><tbody>
        {list.map(a => (
          <tr key={a.id}>
            <td><b>{a.name}</b><br />{a.phone}{a.message && <><br /><small className="mut">{a.message}</small></>}</td>
            <td>{a.procedure}</td><td>{a.date}<br />{a.time}</td>
            <td><select value={a.status} onChange={e => setStatus(a.id, e.target.value)}>{STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
            <td><button className="mini" onClick={() => mk(a)}>Create patient ID</button>
              <a className="mini" target="_blank" rel="noreferrer" href={`https://wa.me/92${a.phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(`Hello ${a.name}, your appointment at Micropil for ${a.procedure} on ${a.date} at ${a.time} is confirmed.`)}`}>WhatsApp</a>
              {isAdmin && <button className="mini" onClick={() => del(a.id)}>Delete</button>}</td>
          </tr>
        ))}
      </tbody></table>
      {!list.length && <p className="mut">No appointments found.</p>}
    </>
  );
}

function Patients({ P, reload, user, focus }) {
  const [q, setQ] = useState(''); const [sid, setSid] = useState(focus); const [nw, setNw] = useState(false); const [err, setErr] = useState('');
  useEffect(() => setSid(focus), [focus]);
  const p = P.find(x => x.id === sid);
  const list = P.filter(x => (x.name + x.phone + x.code).toLowerCase().includes(q.toLowerCase()));
  const create = async v => {
    try { const r = await api('/admin/patients', { method: 'POST', body: v, auth: 1 }); await reload(); setNw(false); setErr(''); setSid(r.id); } catch (x) { setErr(x.message); }
  };
  const save = async np => { await api('/admin/patients/' + np.id, { method: 'PUT', body: np, auth: 1 }); reload(); };
  const delP = async x => { if (confirm(`Delete ${x.name} and all records?`)) { await api('/admin/patients/' + x.id, { method: 'DELETE', auth: 1 }); setSid(null); reload(); } };
  if (p) return <Profile p={p} user={user} back={() => setSid(null)} save={save} del={() => delP(p)} />;
  const pdf = () => makePDF({
    title: 'Patient List', subtitle: `${list.length} patients`, landscape: true, file: 'micropil-patients.pdf',
    summary: [['Patients', list.length], ['Total billed', money(list.reduce((s, x) => s + totals(x).billed, 0))], ['Total dues', money(list.reduce((s, x) => s + totals(x).due, 0))]],
    tables: [{ head: ['ID', 'Name', 'Phone', 'Procedures', 'Billed', 'Paid', 'Due', 'Next session'], rows: list.map(x => { const t = totals(x), n = nextSession(x); return [x.code, x.name, x.phone, x.treatments.map(y => y.procedure).join(', '), money(t.billed), money(t.paid), money(t.due), n ? n.date : '-']; }) }]
  });
  return (
    <>
      <h2 className="gold">Patients</h2>
      <div className="row noprint"><input placeholder="Search name, phone or ID (MP-0001)" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <span><button className="btn sm" onClick={() => setNw(!nw)}>{nw ? 'Close' : 'New patient'}</button> <button className="btn ghost sm" onClick={pdf}>Export PDF</button></span></div>
      {nw && <div className="card"><h4>New patient (a unique ID is created automatically)</h4>
        <Mini btn="Create patient" onAdd={create} fields={[['name', 'Full name'], ['phone', 'Mobile number'], ['email', 'Email', 'email', false], ['procedure', 'First procedure', 'text', false], ['total', 'Fee (Rs)', 'number', false]]} />{err && <p className="err">{err}</p>}</div>}
      <table className="tbl"><thead><tr><th>ID</th><th>Patient</th><th>Procedures</th><th>Due</th><th>Next session</th></tr></thead><tbody>
        {list.map(x => {
          const t = totals(x), n = nextSession(x); return (
            <tr key={x.id} className="click" onClick={() => setSid(x.id)}>
              <td><b className="gold">{x.code}</b></td><td><b>{x.name}</b><br />{x.phone}</td>
              <td>{x.treatments.map(y => y.procedure).join(', ') || '-'}</td><td style={{ color: t.due > 0 ? '#ff9a8a' : '#8fd6a8' }}>{money(t.due)}</td><td>{n ? n.date : '-'}</td>
            </tr>);
        })}
      </tbody></table>
      {!list.length && <p className="mut">No patients yet. Use "Create patient ID" on a completed appointment, or add one manually.</p>}
    </>
  );
}

function Profile({ p, user, back, save, del }) {
  const admin = user.role === 'admin'; const t = totals(p), ns = nextSession(p);
  const upd = fn => save(fn(structuredClone(p)));
  const T = (n, id) => n.treatments.find(x => x.id === id);
  return (
    <>
      <div className="row noprint"><button className="mini" onClick={back}>Back to all patients</button>
        <span><button className="btn sm" onClick={() => statementPDF(p)}>Download statement (PDF)</button> {admin && <button className="btn ghost sm" onClick={del}>Delete patient</button>}</span></div>
      <div className="card"><span className="chip">{p.code}</span><h2 className="gold" style={{ margin: 0 }}>{p.name}</h2><p className="mut">{p.phone}{p.email && ' · ' + p.email}</p>
        <div className="stats">
          <div className="card"><span className="mut">Total billed</span><b>{money(t.billed)}</b></div>
          <div className="card"><span className="mut">Paid</span><b>{money(t.paid)}</b></div>
          <div className={'card ' + (t.due > 0 ? 'dues' : '')}><span className="mut">Balance due</span><b>{money(t.due)}</b></div>
          <div className="card"><span className="mut">Next session</span><b>{ns ? ns.date : 'None'}</b>{ns && <small className="mut">{ns.procedure}</small>}</div>
        </div></div>
      {p.treatments.map(x => (
        <div className="card" key={x.id} style={{ marginTop: 16 }}>
          <div className="row"><h3 style={{ margin: 0 }}>{x.procedure}</h3>
            <span className="acts"><label className="inl">Fee (Rs)<input type="number" defaultValue={x.total} onBlur={e => upd(n => { T(n, x.id).total = +e.target.value; return n; })} /></label>
              <select value={x.status} onChange={e => upd(n => { T(n, x.id).status = e.target.value; return n; })} style={{ width: 140 }}><option>ongoing</option><option>completed</option></select>
              {admin && <button className="mini" onClick={() => confirm('Delete this procedure record?') && upd(n => { n.treatments = n.treatments.filter(y => y.id !== x.id); return n; })}>Delete</button>}</span></div>
          <p className="mut">Started {x.date} · Paid {money(paid(x))} · Due <b style={{ color: due(x) > 0 ? '#ff9a8a' : '#8fd6a8' }}>{money(due(x))}</b></p>
          <div className="prog"><i style={{ width: Math.min(100, (paid(x) / (x.total || 1)) * 100) + '%' }} /></div>
          <div className="split" style={{ marginTop: 18 }}>
            <div><h4>Payments</h4>
              {(x.payments || []).map(y => <div className="row" key={y.id}><span>{y.date} · {y.method}{y.note && ' · ' + y.note}<br /><small className="mut">received by {y.by}</small></span>
                <span><b>{money(y.amount)}</b> {admin && <button className="mini" onClick={() => upd(n => { const z = T(n, x.id); z.payments = z.payments.filter(w => w.id !== y.id); return n; })}>x</button>}</span></div>)}
              <Mini btn="Add payment" fields={[['amount', 'Amount (Rs)', 'number'], ['method', 'Method (Cash / Bank)', 'text', false], ['note', 'Note', 'text', false]]}
                onAdd={v => upd(n => { T(n, x.id).payments.push({ id: uid(), amount: +v.amount, method: v.method || 'Cash', note: v.note || '', date: today(), by: user.name }); return n; })} /></div>
            <div><h4>Sessions</h4>
              {(x.sessions || []).sort((a, b) => a.date.localeCompare(b.date)).map(s => <div className="row" key={s.id}>
                <label className="inl"><input type="checkbox" checked={!!s.done} onChange={() => upd(n => { const z = T(n, x.id).sessions.find(w => w.id === s.id); z.done = !z.done; return n; })} style={{ width: 18 }} /> {s.date}{s.note && ' · ' + s.note}</label>
                {admin && <button className="mini" onClick={() => upd(n => { const z = T(n, x.id); z.sessions = z.sessions.filter(w => w.id !== s.id); return n; })}>x</button>}</div>)}
              <Mini btn="Schedule session" fields={[['date', 'Date', 'date'], ['note', 'Note', 'text', false]]}
                onAdd={v => upd(n => { T(n, x.id).sessions.push({ id: uid(), date: v.date, note: v.note || '', done: false }); return n; })} /></div>
          </div>
        </div>
      ))}
      <div className="card" style={{ marginTop: 16 }}><h4>Add another procedure</h4>
        <Mini btn="Add procedure" fields={[['procedure', 'Procedure'], ['total', 'Fee (Rs)', 'number']]}
          onAdd={v => upd(n => { n.treatments.push({ id: uid(), procedure: v.procedure, total: +v.total, date: today(), status: 'ongoing', notes: '', payments: [], sessions: [] }); return n; })} /></div>
    </>
  );
}

function Reports() {
  const [r, setR] = useState('day'); const [d, setD] = useState(null);
  useEffect(() => { api('/admin/report?range=' + r, { auth: 1 }).then(setD); }, [r]);
  const label = { day: 'Last 24 hours', week: 'Last 7 days', month: 'Last 30 days', all: 'All time' }[r];
  const pdf = () => makePDF({
    title: 'Appointment Report', subtitle: label, landscape: true, file: `micropil-report-${r}.pdf`,
    summary: [['Booked', d.total], ...STATUS.map(s => [s, d.byStatus[s] || 0])],
    tables: [{ title: 'By procedure', head: ['Procedure', 'Appointments'], rows: Object.entries(d.byProcedure) }, { title: 'All appointments', head: apptHead, rows: apptRows(d.list) }]
  });
  return (
    <>
      <h2 className="gold">Appointment reports</h2>
      <div className="row noprint">
        <select value={r} onChange={e => setR(e.target.value)} style={{ width: 200 }}>
          <option value="day">Last 24 hours</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="all">All time</option>
        </select>
        <span><button className="btn sm" onClick={pdf} disabled={!d}>Export PDF</button> <button className="btn ghost sm" onClick={() => exportCSV(d.list)} disabled={!d}>CSV</button></span>
      </div>
      {d && <>
        <div className="stats">
          <div className="card"><span className="mut">Appointments booked</span><b>{d.total}</b></div>
          {STATUS.map(s => <div className="card" key={s}><span className="mut">{s}</span><b>{d.byStatus[s] || 0}</b></div>)}
        </div>
        <div className="card"><h4>By procedure</h4>
          {Object.entries(d.byProcedure).map(([k, v]) => <div className="row" key={k}><span>{k}</span><b>{v}</b></div>)}
          {!d.total && <p className="mut">No appointments in this period.</p>}</div>
        <table className="tbl" style={{ marginTop: 16 }}><thead><tr><th>Booked at</th><th>Patient</th><th>Phone</th><th>Procedure</th><th>Visit</th><th>Status</th></tr></thead><tbody>
          {d.list.map(a => <tr key={a.id}><td>{when(a.createdAt)}</td><td>{a.name}</td><td>{a.phone}</td><td>{a.procedure}</td><td>{a.date} {a.time}</td><td><Pill s={a.status} /></td></tr>)}
        </tbody></table>
      </>}
    </>
  );
}

function Editor({ kind, fields }) {
  const [items, setItems] = useState([]); const [f, setF] = useState({});
  const load = () => api('/' + kind).then(setItems);
  useEffect(() => { load(); setF({}); }, [kind]);
  const save = async e => {
    e.preventDefault();
    await api(`/admin/${kind}${f.id ? '/' + f.id : ''}`, { method: f.id ? 'PUT' : 'POST', body: f, auth: 1 }); setF({}); load();
  };
  const del = async id => { if (confirm('Delete this item?')) { await api(`/admin/${kind}/${id}`, { method: 'DELETE', auth: 1 }); load(); } };
  return (
    <>
      <h2 className="gold">{kind === 'procedures' ? 'Manage procedures' : 'Manage before & afters'}</h2>
      <div className="split">
        <form onSubmit={save} className="card form">
          <h4>{f.id ? 'Edit item' : 'Add new item'}</h4>
          {fields.map(([k, l, t]) => t === 'image'
            ? <ImageField key={k} label={l} value={f[k]} onChange={u => setF(s => ({ ...s, [k]: u }))} />
            : <label key={k}>{l}<input value={f[k] || ''} required={k === 'name' || k === 'title'} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>)}
          <button className="btn">{f.id ? 'Save changes' : 'Add item'}</button>
          {f.id && <button type="button" className="btn ghost" onClick={() => setF({})}>Cancel</button>}
        </form>
        <div>{items.map(i => (
          <div className="card row" key={i.id}>
            {(i.image || i.after) && <img className="thumb" src={img(i.image || i.after)} alt="" />}
            <b style={{ flex: 1 }}>{i.name || i.title}</b>
            <span><button className="mini" onClick={() => setF(i)}>Edit</button><button className="mini" onClick={() => del(i.id)}>Delete</button></span></div>
        ))}</div>
      </div>
    </>
  );
}

function Settings() {
  const [s, setS] = useState({}); const [ok, setOk] = useState(false);
  useEffect(() => { api('/settings').then(setS); }, []);
  const save = async () => { await api('/admin/settings', { method: 'PUT', body: s, auth: 1 }); setOk(true); setTimeout(() => setOk(false), 2500); };
  return (
    <>
      <h2 className="gold">Website settings</h2>
      <div className="card form" style={{ maxWidth: 520 }}>
        <ImageField label="Hero section photo (clinic picture, use a landscape or portrait photo of 1600px or larger)" value={s.heroImage} onChange={u => setS({ ...s, heroImage: u })} />
        <button className="btn" onClick={save}>Save settings</button>{ok && <p>Saved. Refresh the home page to see it.</p>}
      </div>
    </>
  );
}

function Team() {
  const [U, setU] = useState([]); const [err, setErr] = useState('');
  const load = () => api('/admin/users', { auth: 1 }).then(setU);
  useEffect(() => { load(); }, []);
  const act = async (id, body) => { try { await api('/admin/users/' + id, { method: 'PUT', body, auth: 1 }); setErr(''); load(); } catch (x) { setErr(x.message); } };
  const add = async v => { try { await api('/admin/users', { method: 'POST', body: v, auth: 1 }); setErr(''); load(); } catch (x) { setErr(x.message); } };
  const del = async id => { if (confirm('Delete this user?')) { try { await api('/admin/users/' + id, { method: 'DELETE', auth: 1 }); load(); } catch (x) { setErr(x.message); } } };
  return (
    <>
      <h2 className="gold">Team accounts</h2>
      <p className="mut">Staff can manage appointments, patients and payments. Only administrators can delete records, edit website content and manage the team.</p>
      <div className="card"><h4>Add employee</h4>
        <Mini btn="Create account" onAdd={add} fields={[['name', 'Full name'], ['username', 'Username'], ['password', 'Password (6+ characters)', 'password'], ['role', 'Role: staff or admin', 'text', false]]} />
        {err && <p className="err">{err}</p>}</div>
      {U.map(u => (
        <div className="card row" key={u.id} style={{ marginTop: 12 }}>
          <span><b>{u.name}</b> · {u.username}<br /><small className="mut">{u.role === 'admin' ? 'Administrator' : 'Staff'}</small> {u.active === false && <Pill s="cancelled" />}</span>
          <span>
            <button className="mini" onClick={() => { const p = prompt('New password (6+ characters):'); p && act(u.id, { password: p }); }}>Reset password</button>
            <button className="mini" onClick={() => act(u.id, { role: u.role === 'admin' ? 'staff' : 'admin' })}>Make {u.role === 'admin' ? 'staff' : 'admin'}</button>
            <button className="mini" onClick={() => act(u.id, { active: u.active === false })}>{u.active === false ? 'Enable' : 'Disable'}</button>
            <button className="mini" onClick={() => del(u.id)}>Delete</button></span>
        </div>
      ))}
    </>
  );
}
