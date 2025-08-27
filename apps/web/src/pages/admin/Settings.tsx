import { useEffect, useState } from 'react';

type Rest = { id: number; name: string; slug: string; logoUrl: string };

export default function Settings() {
  const [rest, setRest] = useState<Rest | null>(null);
  const [name, setName] = useState('');
  useEffect(() => { fetch('/api/admin/settings').then(r=>r.json()).then(d=>{setRest(d); setName(d.name);}); }, []);
  const save = async () => { await fetch('/api/admin/settings', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name }) }); };
  if (!rest) return <div>Cargando...</div>;
  return (
    <div>
      <h2>Settings</h2>
      <input value={name} onChange={e=>setName(e.target.value)} />
      <button onClick={save}>Guardar</button>
    </div>
  );
}
