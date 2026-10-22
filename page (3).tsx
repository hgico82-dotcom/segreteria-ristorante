import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, canSeeAllSites } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Nuova() {
 const user=await currentUser(); if(!user) redirect("/login");
 const sites=await db.site.findMany({where:{active:true},orderBy:{name:"asc"}});
 const users=await db.user.findMany({where:{active:true},select:{id:true,name:true,role:true},orderBy:{name:"asc"}});
 return <div className="shell"><aside className="sidebar"><p className="brand">REGISTRO CENTRALE</p><div className="subbrand">GESTIONE GRUPPO RISTORAZIONE</div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/pratiche">Registro pratiche</Link><Link className="active" href="/nuova">Nuova pratica</Link><Link href="/moduli">Moduli operativi</Link><Link href="/configurazione">Sedi e utenti</Link><Link href="/audit">Storico modifiche</Link></nav></aside>
 <main className="main"><header className="topbar"><strong>Nuova pratica</strong><span className="small">{user.name}</span></header><section className="content"><div className="eyebrow">Registro pratiche</div><h1 className="heading">Apri una pratica</h1><p className="muted">L’ID viene generato dal server e i dati sono salvati nel database.</p>
 {sites.length===0&&<div className="notice">Prima di creare pratiche, aggiungi almeno una sede in Configurazione.</div>}
 <div className="panel"><form action="/api/pratiche" method="post"><div className="formgrid">
 <div className="field"><label>Titolo / oggetto *</label><input name="title" required maxLength={160}/></div>
 <div className="field"><label>Sede *</label><select name="siteId" required defaultValue={user.siteId??""}>{canSeeAllSites(user.role)&&<option value="">Seleziona sede</option>}{sites.filter(s=>canSeeAllSites(user.role)||s.id===user.siteId).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
 <div className="field"><label>Categoria</label><select name="category" defaultValue="ALTRO">{["AMMINISTRAZIONE","PERSONALE","ACQUISTI","FORNITORI","MANUTENZIONE","UTENZE","DOCUMENTI","OPERATIVO","ALTRO"].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
 <div className="field"><label>Priorità</label><select name="priority" defaultValue="NORMALE">{["BASSA","NORMALE","ALTA","URGENTE"].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
 <div className="field"><label>Responsabile</label><select name="assigneeId" defaultValue=""><option value="">Non assegnato</option>{users.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role.replaceAll("_"," ")}</option>)}</select></div>
 <div className="field"><label>Scadenza</label><input name="dueAt" type="date"/></div>
 <div className="field" style={{gridColumn:"1/-1"}}><label>Descrizione *</label><textarea name="description" required maxLength={10000}/></div>
 <div className="field" style={{gridColumn:"1/-1"}}><label>Nota iniziale (facoltativa)</label><textarea name="note" maxLength={5000}/></div>
 </div><div className="toolbar"><button className="btn" disabled={sites.length===0}>Salva pratica</button><Link className="btn secondary" href="/pratiche">Annulla</Link></div></form></div></section></main></div>;
}
