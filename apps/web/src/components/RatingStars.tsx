export default function RatingStars({ value, onChange }:{ value:number; onChange:(v:number)=>void }) {
  return (
    <div>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={()=>onChange(n)} style={{cursor:'pointer', color: n<=value ? 'gold' : '#ccc'}}>★</span>
      ))}
    </div>
  );
}
