import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, canSeeAllSites } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Pratiche({searchParams}:{searchParams:Promise<{q?:string;status?:string;site?:string}>}) {
 const user=await currentUser();if(!user)redirect("/login");
 const q=await searchParams;const where:any={};
 if(!canSeeAllSites(user.role))where.siteId=user.siteId;
 if(q.site&&canSeeAllSites(user.role))where.siteId=q.site;
 if(q.status)where.status=q.status;
 if(q.q)where.OR=[{code:{contains:q.q,mode:"insensitive"}},{title:{contains:q.q,mode:"insensitive"}},{description:{contains:q.q,mode:"insensitive"}}];
 const [rows,sites]=await Promise.all([db.practice.findMany({where,orderBy:{updatedAt:"desc"},take:300,include:{site:true,assignee:true}}),db.site.findMany({where:{active:true},orderBy:{name:"asc"}})]);
 return <div className="shell"><aside className="sidebar"><p className="brand">REGISTRO CENTRALE</p><div className="subbrand">GESTIONE GRUPPO RISTORAZIONE</div><nav className="nav"><Link href="/">Dashboard</Link><Link className="active" href="/pratiche">Registro pratiche</Link><Link href="/nuova">Nuova pratica</Link><Link href="/moduli">Moduli operativi</Link><Link href="/configurazione">Sedi e utenti</Link><Link href="/audit">Storico modifiche</Link></nav></aside>
 <main className="main"><header className="topbar"><strong>Registro pratiche</strong><span className="small">{user.name}</span></header><section className="content"><div className="eyebrow">Archivio centrale</div><h1 className="heading">Registro pratiche</h1><p className="muted">Ricerca e filtri sulle pratiche registrate. Visualizzate fino a 300 righe per volta.</p>
 <div className="panel"><form className="toolbar"><input name="q" placeholder="Cerca ID, titolo o descrizione" defaultValue={q.q}/><select name="status" defaultValue={q.status??""}><option value="">Tutti gli stati</option>{["APERTA","IN_LAVORAZIONE","IN_ATTESA","COMPLETATA","ANNULLATA"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select>{canSeeAllSites(user.role)&&<select name="site" defaultValue={q.site??""}><option value="">Tutte le sedi</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}<button className="btn">Filtra</button><Link className="btn secondary" href="/pratiche">Reset</Link><Link className="btn" href="/nuova">+ Nuova</Link></form></div>
 <div className="tablewrap"><table><thead><tr><th>ID</th><th>Oggetto</th><th>Sede</th><th>Categoria</th><th>Responsabile</th><th>Priorità</th><th>Stato</th><th>Scadenza</th></tr></thead><tbody>{rows.map(p=><tr key={p.id}><td><Link href={`/pratiche/${p.id}`}><strong>{p.code}</strong></Link></td><td>{p.title}<div className="small">{p.description.slice(0,95)}{p.description.length>95?"…":""}</div></td><td>{p.site.name}</td><td>{p.category}</td><td>{p.assignee?.name??"—"}</td><td><span className={`pill ${p.priority==="URGENTE"?"urgent":""}`}>{p.priority}</span></td><td><span className={`pill ${p.status==="COMPLETATA"?"done":p.status==="IN_LAVORAZIONE"?"progress":""}`}>{p.status.replaceAll("_"," ")}</span></td><td>{p.dueAt?new Intl.DateTimeFormat("it-IT").format(p.dueAt):"—"}</td></tr>)}</tbody></table>{!rows.length&&<div className="empty">Nessuna pratica corrisponde ai filtri.</div>}</div>
 <p className="footer">Risultati: {rows.length}</p></section></main></div>;
}
