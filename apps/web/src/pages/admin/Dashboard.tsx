import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Overview = { topPlates: any[]; badPlates: any[]; todayCounts: number; avgToday: number; noFeedbackPct: number };

export default function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  useEffect(() => { fetch('/api/admin/metrics/overview').then(r=>r.json()).then(setData); }, []);
  if (!data) return <div>Cargando...</div>;
  return (
    <div>
      <h2>Dashboard</h2>
      <div>Calificaciones hoy: {data.todayCounts} Promedio: {data.avgToday?.toFixed(2)}</div>
      <div>% platos sin feedback: {data.noFeedbackPct.toFixed(1)}%</div>
      <h3>Top 5</h3>
      <ul>
        {data.topPlates.map(p => (<li key={p.id}>{p.name} ({p.avg?.toFixed(1)})</li>))}
      </ul>
      <h3>Más quejas</h3>
      <ul>
        {data.badPlates.map(p => (<li key={p.id}>{p.name} ({p.count})</li>))}
      </ul>
      <nav>
        <Link to="/admin/menu">Menu</Link> | <Link to="/admin/feedback">Feedback</Link> | <Link to="/admin/settings">Settings</Link>
      </nav>
    </div>
  );
}
