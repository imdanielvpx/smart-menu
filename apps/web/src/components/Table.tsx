export default function Table({ headers, rows }:{ headers:string[]; rows:any[][] }) {
  return (
    <table>
      <thead>
        <tr>{headers.map(h=> <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r,i)=>(<tr key={i}>{r.map((c,j)=>(<td key={j}>{c}</td>))}</tr>))}
      </tbody>
    </table>
  );
}
