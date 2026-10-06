export function RecordTable({title,rows}:{title:string,rows:Record<string,unknown>[]}) {
  const columns=rows.length ? Object.keys(rows[0]) : [];
  return <section className="p-6 overflow-auto"><h2 className="mb-4 text-xl font-semibold">{title}</h2>
    {!rows.length ? <p>No records available.</p> : <table className="w-full text-left text-sm"><thead><tr>
      {columns.map(c=><th key={c} className="border-b border-white/20 p-3">{c.replaceAll('_',' ')}</th>)}
    </tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{columns.map(c=><td key={c} className="border-b border-white/10 p-3">{String(row[c] ?? '')}</td>)}</tr>)}</tbody></table>}
  </section>;
}
