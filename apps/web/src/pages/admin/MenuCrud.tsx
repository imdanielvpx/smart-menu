import { useEffect, useState } from 'react';

type Plate = { id: number; name: string; priceCents: number; photoUrl: string };

export default function MenuCrud() {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(1000);
  useEffect(() => { load(); }, []);
  const load = () => fetch('/api/admin/plates').then(r=>r.json()).then(setPlates);
  const add = async () => {
    await fetch('/api/admin/plates', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, priceCents: price, categoryId: 1 }) });
    setName(''); setPrice(1000); load();
  };
  return (
    <div>
      <h2>Platos</h2>
      <ul>{plates.map(p => (<li key={p.id}>{p.name} ${(p.priceCents/100).toFixed(2)}</li>))}</ul>
      <div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" />
        <input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} />
        <button onClick={add}>Agregar</button>
      </div>
    </div>
  );
}
