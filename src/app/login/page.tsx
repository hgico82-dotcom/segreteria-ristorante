import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; setup?: string }> }) {
  if (await currentUser()) redirect("/");
  const q = await searchParams;
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:20}}><div className="panel" style={{width:"100%",maxWidth:430,padding:30}}>
    <p className="eyebrow">Segreteria centrale</p><h1 className="heading">Accedi al gestionale</h1><p className="muted">Usa le credenziali assegnate dall’amministratore.</p>
    {q.error && <div className="error">{q.error==="invalid"?"Email o password non corrette.":q.error==="setup"?"Configurazione iniziale non completata.": "Accesso non riuscito."}</div>}
    {q.setup==="1" && <div className="notice">Nessun amministratore iniziale: completa la configurazione tramite la procedura indicata nel README prima di accedere.</div>}
    <form action="/api/login" method="post"><div className="field"><label>Email</label><input type="email" name="email" required autoComplete="username"/></div><div className="field"><label>Password</label><input type="password" name="password" required autoComplete="current-password"/></div><button className="btn" style={{width:"100%",marginTop:10}}>Accedi</button></form>
    <p className="small" style={{marginTop:20}}>Per sicurezza, non condividere le credenziali in chat.</p></div></main>;
}
