const BASE = import.meta.env.VITE_API || 'https://micropil-production.up.railway.app';

export const api = async (path, { method = 'GET', body, auth } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { 
      'Content-Type': 'application/json', 
      ...(auth && { Authorization: 'Bearer ' + localStorage.getItem('mtk') }) 
    },
    body: body && JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

export const upload = async file => {
  const fd = new FormData(); 
  fd.append('file', file);
  const res = await fetch(BASE + '/admin/upload', { 
    method: 'POST', 
    headers: { Authorization: 'Bearer ' + localStorage.getItem('mtk') }, 
    body: fd 
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || 'Upload failed');
  return d.url;
};

export const img = u => (!u ? '' : /^https?:/.test(u) ? u : (import.meta.env.VITE_FILES || 'https://micropil-production.up.railway.app') + u);
