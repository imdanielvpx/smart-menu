export default function Stat({ label, value }:{ label:string; value:any }) {
  return (
    <div style={{margin:'4px 0'}}>
      <strong>{label}: </strong>{value}
    </div>
  );
}
