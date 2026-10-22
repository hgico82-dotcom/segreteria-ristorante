import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, canSeeAllSites } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function Audit(){
 const user=await currentUser();if(!user)redirect("/login");
 if(!["DIREZIONE","SEGRETERIA","AMMINISTRAZIONE"].includes(user.role))redirect("/");
 const events=await db.auditEvent.findMany({orderBy:{createdAt:"desc"},take:200,include:{actor:true,practice:true}});
 return <div className="shell"><aside className="sidebar"><p className="brand">REGISTRO CENTRALE</p><div className="subbrand">GESTIONE GRUPPO RISTORAZIONE</div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/pratiche">Registro pratiche</Link><Link href="/nuova">Nuova pratica</Link><Link href="/moduli">Moduli operativi</Link><Link href="/configurazione">Sedi e utenti</Link><Link className="active" href="/audit">Storico modifiche</Link></nav></aside><main className="main"><header className="topbar"><strong>Storico modifiche</strong><span className="small">{user.name}</span></header><section className="content"><div className="eyebrow">Audit trail</div><h1 className="heading">Storico attività</h1><p className="muted">Ultimi 200 eventi registrati dal sistema.</p><div className="tablewrap"><table><thead><tr><th>Data</th><th>Utente</th><th>Azione</th><th>Pratica</th><th>Dettagli</th></tr></thead><tbody>{events.map(e=><tr key={e.id}><td>{new Intl.DateTimeFormat("it-IT",{dateStyle:"short",timeStyle:"short"}).format(e.createdAt)}</td><td>{e.actor.name}</td><td>{e.action.replaceAll("_"," ")}</td><td>{e.practice?<Link href={`/pratiche/${e.practice.id}`}>{e.practice.code}</Link>:"—"}</td><td><pre style={{fontSize:11,whiteSpace:"pre-wrap"}}>{e.details?JSON.stringify(e.details):"—"}</pre></td></tr>)}</tbody></table>{!events.length&&<div className="empty">Nessun evento registrato.</div>}</div></section></main></div>;
}
