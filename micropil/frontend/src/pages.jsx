// import { useState, useEffect } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { api, img } from './api';
// import { money, paid, due, totals, nextSession } from './util';
// import { statementPDF } from './pdf';
// import { Reveal, Counter, Particles, BA, PHONE, ADDRESS } from './components';

// const Head = ({ t, s }) => (
//   <div className="page-h"><div className="wrap">
//     <motion.h2 className="gold" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>{t}</motion.h2>
//     <p className="sub">{s}</p>
//   </div></div>
// );

// export function Home() {
//   const [p, setP] = useState([]); const [S, setS] = useState({});
//   useEffect(() => { api('/procedures').then(setP).catch(() => {}); api('/settings').then(setS).catch(() => {}); }, []);
//   const mq = ['Sapphire FUE', 'PRP Therapy', 'Beard Restoration', 'HydraFacial', 'Laser Hair Removal', 'Skin Tightening'];
//   const steps = [
//     ['Digital Scalp Audit', 'Microscopic analysis of donor capacity, follicle health and thinning progression.'],
//     ['Facial-Mapped Hairline Design', 'A custom hairline calibrated to your facial structure, age and natural follicle angles.'],
//     ['Painless Micro-Transplant', 'Single-day outpatient Sapphire FUE under local anesthesia.'],
//     ['Post-Op & Growth Tracking', 'Follow-up care, medical washing kits and routine digital audits of graft survival.']
//   ];
//   const why = [
//     ['Natural-looking hairline', 'Hairlines designed to look realistic at every angle.'],
//     ['Surgeon-led procedures', 'Performed by qualified doctors and experienced surgeons themselves.'],
//     ['Density that looks natural', 'Good coverage without an artificial look.'],
//     ['Affordable treatment', 'Reasonable, competitive pricing.'],
//     ['Advanced hairline design', 'Digital scales and laser-light technology for accurate measurement.'],
//     ['Hygienic equipment', 'High-quality tools and disposable supplies for every patient.']
//   ];
//   return (
//     <>
//       <section className="hero">
//         <Particles /><div className="glow g1" /><div className="glow g2" />
//         <div className="wrap hero-in">
//           <div>
//             <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9 }}>
//               Islamabad's Premier <span className="gold">Hair &amp; Aesthetic</span> Clinic
//             </motion.h1>
//             <motion.p className="lead mut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
//               Precision hair restoration and advanced aesthetic treatments for natural, lasting results, on PWD Main Road.
//             </motion.p>
//             <motion.div className="cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
//               <Link className="btn" to="/contact">Book a free consultation</Link>
//               <a className="btn ghost" href={`tel:${PHONE}`}>Call {PHONE}</a>
//             </motion.div>
//             <div className="rate">★★★★★ 4.9 rating from 100+ patient reviews</div>
//           </div>
//           <motion.div className="hero-logo" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.3 }}>
//             {S.heroImage ? <div className="frame"><img src={img(S.heroImage)} alt="Micropil clinic" /></div> : <img src="/logo.jpg" alt="Micropil Hair Transplant & Aesthetics" />}
//           </motion.div>
//         </div>
//       </section>

//       <div className="mq"><div>{[...mq, ...mq, ...mq, ...mq].map((m, i) => <span key={i}>{m} ✦</span>)}</div></div>

//       <section><div className="wrap">
//         <Reveal className="center"><h2>Treatments <span className="gold">we offer</span></h2><p className="sub">Hair, skin and body care under one roof.</p></Reveal>
//         <div className="g3">
//           {[['Hair treatments', 'Advanced hair transplant, PRP and scalp therapies for natural growth.'],
//             ['Skin treatments', 'HydraFacials, acne clearance and deep skin rejuvenation.'],
//             ['Body treatments', 'Body contouring, laser hair removal and skin tightening.']].map(([t, d], i) => (
//             <Reveal key={t} delay={i * 0.12}><div className="card"><h3>{t}</h3><p className="mut">{d}</p><Link className="more" to="/services">See procedures</Link></div></Reveal>
//           ))}
//         </div>
//       </div></section>

//       <section className="alt"><div className="wrap">
//         <Reveal className="center"><h2>Hair restoration <span className="gold">procedures</span></h2><p className="sub">Permanent density for scalp, beard and eyebrows.</p></Reveal>
//         <div className="g3">
//           {p.filter(x => x.category === 'Hair').slice(0, 3).map((x, i) => (
//             <Reveal key={x.id} delay={i * 0.12}><div className="card">{x.image && <img className="pimg" src={img(x.image)} alt={x.name} loading="lazy" />}<span className="chip">{x.tag}</span><h3>{x.name}</h3><p className="mut">{x.description}</p></div></Reveal>
//           ))}
//         </div>
//       </div></section>

//       <section><div className="wrap">
//         <Reveal className="center"><h2>Our four-step <span className="gold">clinical protocol</span></h2></Reveal>
//         <div className="g4" style={{ marginTop: 40 }}>
//           {steps.map(([t, d], i) => (
//             <Reveal key={t} delay={i * 0.12}><div className="card"><div className="num">{i + 1}</div><h4>{t}</h4><p className="mut">{d}</p></div></Reveal>
//           ))}
//         </div>
//       </div></section>

//       <section className="alt"><div className="wrap">
//         <div className="split">
//           <Reveal>
//             <h2>About <span className="gold">Micropil</span></h2>
//             <p className="mut">Micropil Hair Transplant Clinic was established in 2016 on PWD Main Road, Islamabad. Our clinic is staffed by highly skilled doctors and experienced surgeons, and we have successfully performed more than 40,000 hair transplant surgeries.</p>
//             <Link className="btn" to="/contact" style={{ marginTop: 20 }}>Book your visit</Link>
//           </Reveal>
//           <div className="g2">
//             {[[40000, '+', 0, 'Surgeries performed'], [98, '%', 0, 'Graft survival rate'], [4.9, '', 1, 'Google rating'], [10, '+', 0, 'Years of experience']].map(([n, s, d, l]) => (
//               <div className="card stat" key={l}><b className="gold"><Counter to={n} suffix={s} dec={d} /></b><span className="mut">{l}</span></div>
//             ))}
//           </div>
//         </div>
//       </div></section>

//       <section><div className="wrap">
//         <Reveal className="center"><h2>Why choose <span className="gold">Micropil</span></h2></Reveal>
//         <div className="g3" style={{ marginTop: 40 }}>
//           {why.map(([t, d], i) => <Reveal key={t} delay={(i % 3) * 0.1}><div className="card"><h4>{t}</h4><p className="mut">{d}</p></div></Reveal>)}
//         </div>
//       </div></section>

//       <section className="cta-s"><div className="wrap center">
//         <Reveal><h2>Ready for a <span className="gold">free hair graft estimate?</span></h2>
//           <p className="sub">Pick a time that suits you and our team will confirm it.</p>
//           <Link className="btn" to="/contact">Book appointment</Link></Reveal>
//       </div></section>
//     </>
//   );
// }

// export function Procedures() {
//   const [list, setList] = useState([]); const [cat, setCat] = useState('All');
//   useEffect(() => { api('/procedures').then(setList).catch(() => {}); }, []);
//   const cats = ['All', ...new Set(list.map(x => x.category))];
//   return (
//     <>
//       <Head t="Our procedures" s="Clinical hair restoration and aesthetic treatments, delivered with precision." />
//       <section style={{ paddingTop: 20 }}><div className="wrap">
//         <div className="tabs">{cats.map(c => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
//         <motion.div layout className="g3">
//           {list.filter(x => cat === 'All' || x.category === cat).map(x => (
//             <motion.div layout key={x.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
//               <div className="card">{x.image && <img className="pimg" src={img(x.image)} alt={x.name} loading="lazy" />}<span className="chip">{x.tag || x.category}</span><h3>{x.name}</h3><p className="mut">{x.description}</p>
//                 <Link className="more" to={`/contact?p=${encodeURIComponent(x.name)}`}>Book this procedure</Link></div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div></section>
//     </>
//   );
// }

// export function Results() {
//   const [list, setList] = useState([]);
//   useEffect(() => { api('/results').then(setList).catch(() => {}); }, []);
//   return (
//     <>
//       <Head t="Before & afters" s="Drag the slider on each photo to compare the result." />
//       <section style={{ paddingTop: 20 }}><div className="wrap">
//         {!list.length && <p className="center mut">No results published yet. Check back soon.</p>}
//         <div className="g3">{list.map((r, i) => <Reveal key={r.id} delay={(i % 3) * 0.1}><BA {...r} /></Reveal>)}</div>
//         <div className="center" style={{ marginTop: 50 }}><Link className="btn" to="/contact">Book your consultation</Link></div>
//       </div></section>
//     </>
//   );
// }

// export function Contact() {
//   const [sp] = useSearchParams();
//   const [procs, setProcs] = useState([]); const [taken, setTaken] = useState([]); const [st, setSt] = useState({});
//   const [f, setF] = useState({ name: '', phone: '', email: '', procedure: sp.get('p') || '', date: '', time: '', message: '' });
//   const set = k => e => setF({ ...f, [k]: e.target.value });
//   useEffect(() => { api('/procedures').then(setProcs).catch(() => {}); }, []);
//   useEffect(() => { if (f.date) api('/slots?date=' + f.date).then(setTaken).catch(() => {}); }, [f.date]);
//   const slots = []; for (let m = 600; m <= 1230; m += 30) slots.push(String((m / 60) | 0).padStart(2, '0') + ':' + (m % 60 ? '30' : '00'));
//   const submit = async e => {
//     e.preventDefault();
//     if (!f.time) return setSt({ err: 'Please choose a time slot.' });
//     setSt({ busy: 1 });
//     try { await api('/appointments', { method: 'POST', body: f }); setSt({ ok: 1 }); } catch (x) { setSt({ err: x.message }); }
//   };
//   return (
//     <>
//       <Head t="Book your appointment" s="Choose a procedure, date and time. We confirm every booking by phone or WhatsApp." />
//       <section style={{ paddingTop: 20 }}><div className="wrap split">
//         <div className="cinfo">
//           <div className="card"><h4>Clinic address</h4><p className="mut">{ADDRESS}</p></div>
//           <div className="card"><h4>Phone</h4><a href={`tel:${PHONE}`} className="gold">{PHONE}</a><p className="mut">Mon - Sun: 10:00 AM - 9:00 PM</p></div>
//           <iframe title="Clinic map" loading="lazy" src="https://maps.google.com/maps?q=Bilal+Complex+PWD+Main+Road+Islamabad&output=embed" />
//         </div>
//         <div className="card">
//           {st.ok ? (
//             <motion.div className="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
//               <div className="tick">✓</div><h3>Appointment request received</h3>
//               <p className="mut">Thank you {f.name}. We will confirm {f.date} at {f.time} on {f.phone}.</p>
//               <button className="btn sm" onClick={() => { setSt({}); setF({ ...f, date: '', time: '', message: '' }); }}>Book another</button>
//             </motion.div>
//           ) : (
//             <form className="form" onSubmit={submit}>
//               <label>Full name *<input required value={f.name} onChange={set('name')} /></label>
//               <label>Phone / WhatsApp *<input required value={f.phone} onChange={set('phone')} placeholder="03xx xxxxxxx" /></label>
//               <label>Email<input type="email" value={f.email} onChange={set('email')} /></label>
//               <label>Procedure *
//                 <select required value={f.procedure} onChange={set('procedure')}>
//                   <option value="">Select a procedure</option>
//                   <option>Free hair graft estimate</option>
//                   {procs.map(x => <option key={x.id}>{x.name}</option>)}
//                 </select>
//               </label>
//               <label>Date *<input type="date" required min={new Date().toISOString().slice(0, 10)} value={f.date} onChange={e => setF({ ...f, date: e.target.value, time: '' })} /></label>
//               {f.date && (
//                 <div><label>Time *</label>
//                   <div className="slots">{slots.map(t => (
//                     <button type="button" key={t} disabled={taken.includes(t)} className={f.time === t ? 'on' : ''} onClick={() => setF({ ...f, time: t })}>{t}</button>
//                   ))}</div>
//                 </div>
//               )}
//               <label>Message<textarea rows="3" value={f.message} onChange={set('message')} /></label>
//               {st.err && <p className="err">{st.err}</p>}
//               <button className="btn" disabled={st.busy}>{st.busy ? 'Booking...' : 'Book appointment'}</button>
//             </form>
//           )}
//         </div>
//       </div></section>
//     </>
//   );
// }

// export function Portal() {
//   const [f, setF] = useState({ code: '', phone: '' }); const [d, setD] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
//   const go = async e => {
//     e.preventDefault(); setBusy(true); setErr('');
//     try { setD(await api('/portal', { method: 'POST', body: f })); } catch (x) { setErr(x.message); }
//     setBusy(false);
//   };
//   if (!d) return (
//     <>
//       <Head t="Patient portal" s="Enter your patient ID and mobile number to see your treatment, next session and dues." />
//       <section style={{ paddingTop: 20 }}><div className="wrap" style={{ maxWidth: 480 }}>
//         <form className="card form" onSubmit={go}>
//           <label>Patient ID<input required placeholder="MP-0001" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} /></label>
//           <label>Mobile number<input required placeholder="03xx xxxxxxx" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></label>
//           {err && <p className="err">{err}</p>}
//           <button className="btn" disabled={busy}>{busy ? 'Checking...' : 'View my profile'}</button>
//         </form>
//       </div></section>
//     </>
//   );
//   const t = totals(d), ns = nextSession(d);
//   return (
//     <>
//       <Head t={`Welcome, ${d.name}`} s={`Patient ID ${d.code}`} />
//       <section style={{ paddingTop: 20 }}><div className="wrap">
//         <div className="stats">
//           <div className="card"><span className="mut">Total billed</span><b>{money(t.billed)}</b></div>
//           <div className="card"><span className="mut">Paid so far</span><b>{money(t.paid)}</b></div>
//           <div className={'card ' + (t.due > 0 ? 'dues' : '')}><span className="mut">Balance due</span><b>{money(t.due)}</b></div>
//           <div className="card"><span className="mut">Next session</span><b>{ns ? ns.date : 'Not scheduled'}</b>{ns && <small className="mut">{ns.procedure}</small>}</div>
//         </div>
//         {d.treatments.map(x => (
//           <Reveal key={x.id}><div className="card" style={{ marginBottom: 18 }}>
//             <div className="row"><h3 style={{ margin: 0 }}>{x.procedure}</h3><span className="chip">{x.status}</span></div>
//             <p className="mut">Started {x.date} · Fee {money(x.total)} · Paid {money(paid(x))} · Due {money(due(x))}</p>
//             <div className="prog"><i style={{ width: Math.min(100, (paid(x) / (x.total || 1)) * 100) + '%' }} /></div>
//             <div className="split" style={{ marginTop: 18 }}>
//               <div><h4>Payments</h4>{!(x.payments || []).length && <p className="mut">No payments yet.</p>}
//                 {(x.payments || []).map(y => <div className="row" key={y.id}><span>{y.date} · {y.method}</span><b>{money(y.amount)}</b></div>)}</div>
//               <div><h4>Sessions</h4>{!(x.sessions || []).length && <p className="mut">No sessions scheduled.</p>}
//                 {(x.sessions || []).map(s => <div className="row" key={s.id}><span>{s.date}{s.note && ' · ' + s.note}</span><span className="chip">{s.done ? 'Done' : 'Upcoming'}</span></div>)}</div>
//             </div>
//           </div></Reveal>
//         ))}
//         <div className="cta"><button className="btn" onClick={() => statementPDF(d)}>Download statement (PDF)</button><button className="btn ghost" onClick={() => setD(null)}>Sign out</button></div>
//       </div></section>
//     </>
//   );
// }
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, img } from './api';
import { money, paid, due, totals, nextSession } from './util';
import { statementPDF } from './pdf';
import { Reveal, Counter, Particles, BA, PHONE, ADDRESS } from './components';

const Head = ({ t, s }) => (
  <div className="page-h"><div className="wrap">
    <motion.h2 className="gold" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>{t}</motion.h2>
    <p className="sub">{s}</p>
  </div></div>
);

export function Home() {
  const [p, setP] = useState([]); const [S, setS] = useState({});
  useEffect(() => { api('/procedures').then(setP).catch(() => { }); api('/settings').then(setS).catch(() => { }); }, []);
  const mq = ['Sapphire FUE', 'PRP Therapy', 'Beard Restoration', 'HydraFacial', 'Laser Hair Removal', 'Skin Tightening'];
  const steps = [
    ['Digital Scalp Audit', 'Microscopic analysis of donor capacity, follicle health and thinning progression.'],
    ['Facial-Mapped Hairline Design', 'A custom hairline calibrated to your facial structure, age and natural follicle angles.'],
    ['Painless Micro-Transplant', 'Single-day outpatient Sapphire FUE under local anesthesia.'],
    ['Post-Op & Growth Tracking', 'Follow-up care, medical washing kits and routine digital audits of graft survival.']
  ];
  const why = [
    ['Natural-looking hairline', 'Hairlines designed to look realistic at every angle.'],
    ['Surgeon-led procedures', 'Performed by qualified doctors and experienced surgeons themselves.'],
    ['Density that looks natural', 'Good coverage without an artificial look.'],
    ['Affordable treatment', 'Reasonable, competitive pricing.'],
    ['Advanced hairline design', 'Digital scales and laser-light technology for accurate measurement.'],
    ['Hygienic equipment', 'High-quality tools and disposable supplies for every patient.']
  ];
  return (
    <>
      <section className="hero">
        <Particles /><div className="glow g1" /><div className="glow g2" />
        <div className="wrap hero-in">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9 }}>
              Islamabad's Premier <span className="gold">Hair &amp; Aesthetic</span> Clinic
            </motion.h1>
            <motion.p className="lead mut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              Precision hair restoration and advanced aesthetic treatments for natural, lasting results, on PWD Main Road.
            </motion.p>
            <motion.div className="cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Link className="btn" to="/contact">Book a free consultation</Link>
              <a className="btn ghost" href={`tel:${PHONE}`}>Call {PHONE}</a>
            </motion.div>
            <div className="rate">★★★★★ 4.9 rating from 100+ patient reviews</div>
          </div>
          <motion.div className="hero-logo" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.3 }}>
            {S.heroImage ? <div className="frame"><img src={img(S.heroImage)} alt="Micropil clinic" /></div> : <img src="/logo.jpg" alt="Micropil Hair Transplant & Aesthetics" />}
          </motion.div>
        </div>
      </section>

      <div className="mq"><div>{[...mq, ...mq, ...mq, ...mq].map((m, i) => <span key={i}>{m} ✦</span>)}</div></div>

      <section><div className="wrap">
        <Reveal className="center"><h2>Treatments <span className="gold">we offer</span></h2><p className="sub">Hair, skin and body care under one roof.</p></Reveal>
        <div className="g3">
          {[['Hair treatments', 'Advanced hair transplant, PRP and scalp therapies for natural growth.'],
          ['Skin treatments', 'HydraFacials, acne clearance and deep skin rejuvenation.'],
          ['Body treatments', 'Body contouring, laser hair removal and skin tightening.']].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.12}><div className="card"><h3>{t}</h3><p className="mut">{d}</p><Link className="more" to="/services">See procedures</Link></div></Reveal>
          ))}
        </div>
      </div></section>

      <section className="alt"><div className="wrap">
        <Reveal className="center"><h2>Hair restoration <span className="gold">procedures</span></h2><p className="sub">Permanent density for scalp, beard and eyebrows.</p></Reveal>
        <div className="g3">
          {p.filter(x => x.category === 'Hair').slice(0, 3).map((x, i) => (
            <Reveal key={x.id} delay={i * 0.12}><div className="card">{x.image && <img className="pimg" src={img(x.image)} alt={x.name} loading="lazy" />}<span className="chip">{x.tag}</span><h3>{x.name}</h3><p className="mut">{x.description}</p></div></Reveal>
          ))}
        </div>
      </div></section>

      <section><div className="wrap">
        <Reveal className="center"><h2>Our four-step <span className="gold">clinical protocol</span></h2></Reveal>
        <div className="g4" style={{ marginTop: 40 }}>
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.12}><div className="card"><div className="num">{i + 1}</div><h4>{t}</h4><p className="mut">{d}</p></div></Reveal>
          ))}
        </div>
      </div></section>

      <section className="alt"><div className="wrap">
        <div className="split">
          <Reveal>
            <h2>About <span className="gold">Micropil</span></h2>
            <p className="mut">Micropil Hair Transplant Clinic was established in 2016 on PWD Main Road, Islamabad. Our clinic is staffed by highly skilled doctors and experienced surgeons, and we have successfully performed more than 40,000 hair transplant surgeries.</p>
            <Link className="btn" to="/contact" style={{ marginTop: 20 }}>Book your visit</Link>
          </Reveal>
          <div className="g2">
            {[[40000, '+', 0, 'Surgeries performed'], [98, '%', 0, 'Graft survival rate'], [4.9, '', 1, 'Google rating'], [10, '+', 0, 'Years of experience']].map(([n, s, d, l]) => (
              <div className="card stat" key={l}><b className="gold"><Counter to={n} suffix={s} dec={d} /></b><span className="mut">{l}</span></div>
            ))}
          </div>
        </div>
      </div></section>

      <section><div className="wrap">
        <Reveal className="center"><h2>Why choose <span className="gold">Micropil</span></h2></Reveal>
        <div className="g3" style={{ marginTop: 40 }}>
          {why.map(([t, d], i) => <Reveal key={t} delay={(i % 3) * 0.1}><div className="card"><h4>{t}</h4><p className="mut">{d}</p></div></Reveal>)}
        </div>
      </div></section>

      <section className="cta-s"><div className="wrap center">
        <Reveal><h2>Ready for a <span className="gold">free hair graft estimate?</span></h2>
          <p className="sub">Pick a time that suits you and our team will confirm it.</p>
          <Link className="btn" to="/contact">Book appointment</Link></Reveal>
      </div></section>
    </>
  );
}

export function Procedures() {
  const [list, setList] = useState([]);
  const [cat, setCat] = useState('All');

  useEffect(() => {
    api('/procedures').then(setList).catch(() => { });
  }, []);

  const cats = ['All', ...new Set(list.map(x => x.category))];
  const filteredList = list.filter(x => cat === 'All' || x.category === cat);

  return (
    <>
      <Head t="Our procedures" s="Clinical hair restoration and aesthetic treatments, delivered with precision." />
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="tabs">
            {cats.map(c => (
              <button
                key={c}
                className={c === cat ? 'on' : ''}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="g3" style={{ marginTop: 20 }}>
            {filteredList.map(x => (
              <div className="card" key={x.id}>
                {x.image && <img className="pimg" src={img(x.image)} alt={x.name} loading="lazy" />}
                <span className="chip">{x.tag || x.category}</span>
                <h3>{x.name}</h3>
                <p className="mut">{x.description}</p>
                <Link
                  className="more"
                  to={`/contact?p=${encodeURIComponent(x.name)}`}
                >
                  Book this procedure
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function Results() {
  const [list, setList] = useState([]);
  useEffect(() => { api('/results').then(setList).catch(() => { }); }, []);
  return (
    <>
      <Head t="Before & afters" s="Drag the slider on each photo to compare the result." />
      <section style={{ paddingTop: 20 }}><div className="wrap">
        {!list.length && <p className="center mut">No results published yet. Check back soon.</p>}
        <div className="g3">{list.map((r, i) => <Reveal key={r.id} delay={(i % 3) * 0.1}><BA {...r} /></Reveal>)}</div>
        <div className="center" style={{ marginTop: 50 }}><Link className="btn" to="/contact">Book your consultation</Link></div>
      </div></section>
    </>
  );
}

export function Contact() {
  const [sp] = useSearchParams();
  const [procs, setProcs] = useState([]); const [taken, setTaken] = useState([]); const [st, setSt] = useState({});
  const [f, setF] = useState({ name: '', phone: '', email: '', procedure: sp.get('p') || '', date: '', time: '', message: '' });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  useEffect(() => { api('/procedures').then(setProcs).catch(() => { }); }, []);
  useEffect(() => { if (f.date) api('/slots?date=' + f.date).then(setTaken).catch(() => { }); }, [f.date]);
  const slots = []; for (let m = 600; m <= 1230; m += 30) slots.push(String((m / 60) | 0).padStart(2, '0') + ':' + (m % 60 ? '30' : '00'));
  const submit = async e => {
    e.preventDefault();
    if (!f.time) return setSt({ err: 'Please choose a time slot.' });
    setSt({ busy: 1 });
    try { await api('/appointments', { method: 'POST', body: f }); setSt({ ok: 1 }); } catch (x) { setSt({ err: x.message }); }
  };
  return (
    <>
      <Head t="Book your appointment" s="Choose a procedure, date and time. We confirm every booking by phone or WhatsApp." />
      <section style={{ paddingTop: 20 }}><div className="wrap split">
        <div className="cinfo">
          <div className="card"><h4>Clinic address</h4><p className="mut">{ADDRESS}</p></div>
          <div className="card"><h4>Phone</h4><a href={`tel:${PHONE}`} className="gold">{PHONE}</a><p className="mut">Mon - Sun: 10:00 AM - 9:00 PM</p></div>
          <iframe title="Clinic map" loading="lazy" src="https://maps.google.com/maps?q=Bilal+Complex+PWD+Main+Road+Islamabad&output=embed" />
        </div>
        <div className="card">
          {st.ok ? (
            <motion.div className="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="tick">✓</div><h3>Appointment request received</h3>
              <p className="mut">Thank you {f.name}. We will confirm {f.date} at {f.time} on {f.phone}.</p>
              <button className="btn sm" onClick={() => { setSt({}); setF({ ...f, date: '', time: '', message: '' }); }}>Book another</button>
            </motion.div>
          ) : (
            <form className="form" onSubmit={submit}>
              <label>Full name *<input required value={f.name} onChange={set('name')} /></label>
              <label>Phone / WhatsApp *<input required value={f.phone} onChange={set('phone')} placeholder="03xx xxxxxxx" /></label>
              <label>Email<input type="email" value={f.email} onChange={set('email')} /></label>
              <label>Procedure *
                <select required value={f.procedure} onChange={set('procedure')}>
                  <option value="">Select a procedure</option>
                  <option>Free hair graft estimate</option>
                  {procs.map(x => <option key={x.id}>{x.name}</option>)}
                </select>
              </label>
              <label>Date *<input type="date" required min={new Date().toISOString().slice(0, 10)} value={f.date} onChange={e => setF({ ...f, date: e.target.value, time: '' })} /></label>
              {f.date && (
                <div><label>Time *</label>
                  <div className="slots">{slots.map(t => (
                    <button type="button" key={t} disabled={taken.includes(t)} className={f.time === t ? 'on' : ''} onClick={() => setF({ ...f, time: t })}>{t}</button>
                  ))}</div>
                </div>
              )}
              <label>Message<textarea rows="3" value={f.message} onChange={set('message')} /></label>
              {st.err && <p className="err">{st.err}</p>}
              <button className="btn" disabled={st.busy}>{st.busy ? 'Booking...' : 'Book appointment'}</button>
            </form>
          )}
        </div>
      </div></section>
    </>
  );
}

export function Portal() {
  const [f, setF] = useState({ code: '', phone: '' }); const [d, setD] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const go = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { setD(await api('/portal', { method: 'POST', body: f })); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  if (!d) return (
    <>
      <Head t="Patient portal" s="Enter your patient ID and mobile number to see your treatment, next session and dues." />
      <section style={{ paddingTop: 20 }}><div className="wrap" style={{ maxWidth: 480 }}>
        <form className="card form" onSubmit={go}>
          <label>Patient ID<input required placeholder="MP-0001" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} /></label>
          <label>Mobile number<input required placeholder="03xx xxxxxxx" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></label>
          {err && <p className="err">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Checking...' : 'View my profile'}</button>
        </form>
      </div></section>
    </>
  );
  const t = totals(d), ns = nextSession(d);
  return (
    <>
      <Head t={`Welcome, ${d.name}`} s={`Patient ID ${d.code}`} />
      <section style={{ paddingTop: 20 }}><div className="wrap">
        <div className="stats">
          <div className="card"><span className="mut">Total billed</span><b>{money(t.billed)}</b></div>
          <div className="card"><span className="mut">Paid so far</span><b>{money(t.paid)}</b></div>
          <div className={'card ' + (t.due > 0 ? 'dues' : '')}><span className="mut">Balance due</span><b>{money(t.due)}</b></div>
          <div className="card"><span className="mut">Next session</span><b>{ns ? ns.date : 'Not scheduled'}</b>{ns && <small className="mut">{ns.procedure}</small>}</div>
        </div>
        {d.treatments.map(x => (
          <Reveal key={x.id}><div className="card" style={{ marginBottom: 18 }}>
            <div className="row"><h3 style={{ margin: 0 }}>{x.procedure}</h3><span className="chip">{x.status}</span></div>
            <p className="mut">Started {x.date} · Fee {money(x.total)} · Paid {money(paid(x))} · Due {money(due(x))}</p>
            <div className="prog"><i style={{ width: Math.min(100, (paid(x) / (x.total || 1)) * 100) + '%' }} /></div>
            <div className="split" style={{ marginTop: 18 }}>
              <div><h4>Payments</h4>{!(x.payments || []).length && <p className="mut">No payments yet.</p>}
                {(x.payments || []).map(y => <div className="row" key={y.id}><span>{y.date} · {y.method}</span><b>{money(y.amount)}</b></div>)}</div>
              <div><h4>Sessions</h4>{!(x.sessions || []).length && <p className="mut">No sessions scheduled.</p>}
                {(x.sessions || []).map(s => <div className="row" key={s.id}><span>{s.date}{s.note && ' · ' + s.note}</span><span className="chip">{s.done ? 'Done' : 'Upcoming'}</span></div>)}</div>
            </div>
          </div></Reveal>
        ))}
        <div className="cta"><button className="btn" onClick={() => statementPDF(d)}>Download statement (PDF)</button><button className="btn ghost" onClick={() => setD(null)}>Sign out</button></div>
      </div></section>
    </>
  );
}
