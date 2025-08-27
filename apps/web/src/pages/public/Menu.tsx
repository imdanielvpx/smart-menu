import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

type Plate = { id: number; name: string; priceCents: number; photoUrl: string; avg: number | null; };

export default function Menu() {
  const { slug } = useParams();
  const [plates, setPlates] = useState<Plate[]>([]);
  useEffect(() => {
    fetch(`/api/public/restaurants/${slug}/plates`).then(r => r.json()).then(setPlates);
  }, [slug]);
  return (
    <div>
      <h2>Menú</h2>
      {plates.map(p => (
        <div key={p.id}>
          <Link to={`/r/${slug}/plate/${p.id}`}>
            <img src={p.photoUrl} width={120} />
            <div>{p.name} - ${(p.priceCents/100).toFixed(2)}</div>
            <div>⭐ {p.avg?.toFixed(1) || '-'}</div>
          </Link>
        </div>
      ))}
    </div>
  );
}
