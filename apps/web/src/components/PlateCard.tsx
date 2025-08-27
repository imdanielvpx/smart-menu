import { Link } from 'react-router-dom';

export default function PlateCard({ plate, to }:{ plate:any; to:string; }) {
  return (
    <Link to={to} style={{ display:'block', margin:'8px 0' }}>
      <img src={plate.photoUrl} width={120} />
      <div>{plate.name}</div>
    </Link>
  );
}
