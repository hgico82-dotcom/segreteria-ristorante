import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Home() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const siteFilter = user.siteId && user.role === "RESPONSABILE_SEDE" ? { siteId: user.siteId } : {};
  const [total, open, overdue, completed, recent] = await Promise.all([
    db.practice.count({ where: siteFilter }),
    db.practice.count({ where: { ...siteFilter, status: { in: ["APERTA", "IN_LAVORAZIONE", "IN_ATTESA"] } } }),
    db.practice.count({ where: { ...siteFilter, dueAt: { lt: new Date() }, status: { notIn: ["COMPLETATA", "ANNULLATA"] } } }),
    db.practice.count({ where: { ...siteFilter, status: "COMPLETATA" } }),
    db.practice.findMany({ where: siteFilter, orderBy: { updatedAt: "desc" }, take: 8, include: { site: true, assignee: true } })
  ]);
  return <div className="shell">
    <aside className="sidebar"><p className="brand">REGISTRO CENTRALE</p><div className="subbrand">GESTIONE GRUPPO RISTORAZIONE</div><nav className="nav">
      <Link className="active" href="/">Dashboard</Link><Link href="/pratiche">Registro pratiche</Link><Link href="/nuova">Nuova pratica</Link><Link href="/moduli">Moduli operativi</Link><Link href="/configurazione">Sedi e utenti</Link><Link href="/audit">Storico modifiche</Link>
    </nav><div className="footer" style={{color:"#b7c9c1",marginTop:30}}>Dati aziendali nel database<br/>Accesso autenticato</div></aside>
    <main className="main"><header className="topbar"><div><strong>Dashboard</strong><div className="small">Segreteria centrale</div></div><div className="right"><span className="small">{user.name} · {user.role.replaceAll("_"," ")}</span><form action="/api/logout" method="post"><button className="btn secondary">Esci</button></form></div></header>
      <section className="content"><div className="eyebrow">Panoramica operativa</div><h1 className="heading">Buongiorno, {user.name.split(" ")[0]}</h1><p className="muted">Situazione delle pratiche registrate nel sistema.</p>
        <div className="grid" style={{marginTop:22}}><div className="metric"><div className="l">Pratiche totali</div><div className="n">{total}</div></div><div className="metric"><div className="l">Da gestire</div><div className="n">{open}</div></div><div className="metric"><div className="l">Scadute</div><div className="n">{overdue}</div></div><div className="metric"><div className="l">Completate</div><div className="n">{completed}</div></div></div>
        <div className="panel"><div className="toolbar" style={{justifyContent:"space-between"}}><div><h2 style={{margin:"0 0 6px",fontSize:18}}>Attività aggiornate di recente</h2><div className="muted">Ultime 8 pratiche modificate</div></div><Link className="btn" href="/nuova">+ Nuova pratica</Link></div>
          {recent.length ? <div className="tablewrap" style={{marginTop:18}}><table><thead><tr><th>ID pratica</th><th>Descrizione</th><th>Sede</th><th>Stato</th><th>Scadenza</th></tr></thead><tbody>{recent.map(p=><tr key={p.id}><td><Link href={`/pratiche/${p.id}`}><strong>{p.code}</strong></Link></td><td>{p.title}<div className="small">{p.assignee?.name ?? "Non assegnata"}</div></td><td>{p.site.name}</td><td><span className={`pill ${p.status==="COMPLETATA"?"done":p.status==="IN_LAVORAZIONE"?"progress":""}`}>{p.status.replaceAll("_"," ")}</span></td><td>{p.dueAt?new Intl.DateTimeFormat("it-IT").format(p.dueAt):"—"}</td></tr>)}</tbody></table></div> : <div className="empty">Nessuna pratica presente. Crea la prima pratica per iniziare.</div>}
        </div><p className="footer">Le statistiche riflettono i dati salvati nel database. Nessun dato aziendale di esempio viene inserito automaticamente.</p>
      </section></main></div>;
}
