import { useEffect, useState } from 'react';

type Rating = { id: number; plateId: number; stars: number; comment: string };

export default function Feedback() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  useEffect(() => { fetch('/api/admin/ratings').then(r=>r.json()).then(setRatings); }, []);
  return (
    <div>
      <h2>Feedback</h2>
      <ul>
        {ratings.map(r => (<li key={r.id}>{r.plateId} - {r.stars} - {r.comment}</li>))}
      </ul>
    </div>
  );
}
