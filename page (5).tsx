import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
export default async function Moduli(){
 const u=await currentUser();if(!u)redirect("/login");
 const items=[
  ["Fatture","/moduli/fatture","Registro fatture fornitori e scadenze di pagamento."],
  ["Fornitori","/moduli/fornitori","Anagrafica fornitori e riferimenti operativi."],
  ["Acquisti","/moduli/acquisti","Richieste di acquisto, importi stimati e avanzamento."],
  ["Personale","/moduli/personale","Registro operativo minimo del personale e scadenze."],
  ["Manutenzioni","/moduli/manutenzioni","Segnalazioni, priorità, costi e scadenze."],
  ["Report direzionale","/moduli/report","Riepiloghi per sede, fatture, acquisti e manutenzioni."]
 ];
 return <div className="shell"><aside className="sidebar"><p className="brand">REGISTRO CENTRALE</p><div className="subbrand">GESTIONE GRUPPO RISTORAZIONE</div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/pratiche">Registro pratiche</Link><Link href="/nuova">Nuova pratica</Link><Link className="active" href="/moduli">Moduli operativi</Link><Link href="/configurazione">Sedi e utenti</Link><Link href="/audit">Storico modifiche</Link></nav></aside><main className="main"><header className="topbar"><strong>Moduli operativi</strong><span className="small">{u.name}</span></header><section className="content"><div className="eyebrow">Gestione gruppo</div><h1 className="heading">Moduli operativi</h1><p className="muted">Registri separati per amministrazione, acquisti, personale e manutenzioni.</p><div className="grid" style={{marginTop:22}}>{items.map(([name,href,desc])=><Link key={href} href={href} className="metric"><div className="l">MODULO</div><div style={{fontWeight:750,fontSize:19,marginTop:12}}>{name}</div><p className="muted">{desc}</p><span className="small">Apri modulo →</span></Link>)}</div></section></main></div>
}
