import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

type RestaurantData = {
  restaurant: { id: number; name: string; slug: string; logoUrl: string };
  categories: { id: number; name: string }[];
  platesCount: number;
};

export default function Restaurant() {
  const { slug } = useParams();
  const [data, setData] = useState<RestaurantData | null>(null);
  useEffect(() => {
    fetch(`/api/public/restaurants/${slug}`).then(r => r.json()).then(setData);
  }, [slug]);
  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <h1>{data.restaurant.name}</h1>
      <img src={data.restaurant.logoUrl} width={80} />
      <Link to={`/r/${slug}/menu`}>Ver Menú</Link>
    </div>
  );
}
