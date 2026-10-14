import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import { img } from './api';

export const PHONE = '03315269599';
export const ADDRESS = 'Flat No. 6, 2nd Floor, Bilal Complex, 1283A PWD Main Road, Islamabad';

export const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
);

export function Counter({ to, suffix = '', dec = 0 }) {
  const ref = useRef(); const seen = useInView(ref, { once: true }); const [n, setN] = useState(0);
  useEffect(() => { if (seen) { const c = animate(0, to, { duration: 2, onUpdate: setN }); return () => c.stop(); } }, [seen]);
  return <span ref={ref}>{n.toFixed(dec)}{suffix}</span>;
}

export const Particles = () => (
  <div className="parts">
    {Array.from({ length: 26 }, (_, i) => (
      <span key={i} style={{ left: (i * 37) % 100 + '%', width: 2 + (i % 4) * 2, height: 2 + (i % 4) * 2,
        animationDelay: (i % 9) * -1.3 + 's', animationDuration: 8 + (i % 7) * 2 + 's' }} />
    ))}
  </div>
);

export function BA({ before, after, title, note }) {
  const [v, setV] = useState(50);
  const bg = u => (u ? { backgroundImage: `url(${img(u)})` } : {});
  return (
    <div className="card ba">
      <div className="baimg">
        <div className="im a" style={bg(after)}>{!after && <em>After</em>}</div>
        <div className="im b" style={{ ...bg(before), clipPath: `inset(0 ${100 - v}% 0 0)` }}>{!before && <em>Before</em>}</div>
        <div className="line" style={{ left: v + '%' }}><b>↔</b></div>
        <input type="range" min="0" max="100" value={v} onChange={e => setV(+e.target.value)} aria-label="Compare before and after" />
        <span className="tag l">Before</span><span className="tag r">After</span>
      </div>
      <h4>{title}</h4><p className="mut">{note}</p>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false); const [sc, setSc] = useState(false);
  useEffect(() => { const f = () => setSc(window.scrollY > 40); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);
  const links = [['/', 'Home'], ['/services', 'Procedures'], ['/results', 'Before & Afters'], ['/portal', 'Patient Portal'], ['/contact', 'Contact Us']];
  return (
    <header className={'nav ' + (sc ? 'sc' : '')}>
      <Link to="/" className="logo"><img src="/logo.jpg" alt="Micropil" /></Link>
      <nav className={open ? 'open' : ''}>
        {links.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>{t}</NavLink>)}
        <Link to="/contact" className="btn sm" onClick={() => setOpen(false)}>Book Appointment</Link>
      </nav>
      <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu"><i /><i /><i /></button>
    </header>
  );
}

export const Footer = () => (
  <footer>
    <div className="wrap fg">
      <div><img src="/logo.jpg" alt="Micropil" /><p className="mut">Precision sapphire hair transplant and facial-mapped hairline artistry.</p></div>
      <div><h4>Explore</h4><Link to="/">Home</Link><Link to="/services">Procedures</Link><Link to="/results">Before & Afters</Link><Link to="/portal">Patient Portal</Link><Link to="/contact">Contact Us</Link></div>
      <div><h4>Visit us</h4><p className="mut">{ADDRESS}</p><a href={`tel:${PHONE}`}>{PHONE}</a><p className="mut">Mon - Sun: 10:00 AM - 9:00 PM</p></div>
    </div>
    <p className="copy">© 2026 Micropil Hair Transplant & Aesthetics, Islamabad. <Link to="/admin/login">Staff login</Link></p>
  </footer>
);
