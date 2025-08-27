import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type PlateData = { plate: { id: number; name: string; description: string; photoUrl: string; priceCents: number }; avgRating: number | null };

export default function Plate() {
  const { id } = useParams();
  const [data, setData] = useState<PlateData | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [coupon, setCoupon] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/public/plates/${id}`).then(r => r.json()).then(setData);
  }, [id]);
  if (!data) return <div>Loading...</div>;
  const submit = async () => {
    const res = await fetch('/api/public/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plateId: data.plate.id, stars, comment }) });
    const json = await res.json();
    setCoupon(json.coupon);
  };
  return (
    <div>
      <h3>{data.plate.name}</h3>
      <img src={data.plate.photoUrl} width={200} />
      <p>{data.plate.description}</p>
      {!coupon ? (
        <div>
          <input type="number" min={1} max={5} value={stars} onChange={e => setStars(Number(e.target.value))} />
          <input value={comment} onChange={e => setComment(e.target.value)} maxLength={120} placeholder="Comentario" />
          <button onClick={submit}>Calificar</button>
        </div>
      ) : (
        <div>Gracias! Tu cupón: {coupon}</div>
      )}
    </div>
  );
}
