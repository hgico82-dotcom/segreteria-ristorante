import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {currentUser} from "@/lib/auth";
import {db} from "@/lib/db";
const schema=z.object({name:z.string().trim().min(2).max(120),email:z.string().trim().email().max(254),password:z.string().min(14).max(200),role:z.enum(["DIREZIONE","SEGRETERIA","AMMINISTRAZIONE","RESPONSABILE_SEDE","PERSONALE"]),siteId:z.string().optional()});
export async function POST(req:Request){
 const actor=await currentUser();if(!actor)return NextResponse.redirect(new URL("/login",req.url),303);
 if(actor.role!=="DIREZIONE")return new NextResponse("Accesso negato",{status:403});
 const f=await req.formData();const d=schema.safeParse(Object.fromEntries(["name","email","password","role","siteId"].map(k=>[k,String(f.get(k)??"")])));
 if(!d.success)return NextResponse.redirect(new URL("/configurazione?error=invalid",req.url),303);
 const x=d.data;
 if(x.role==="RESPONSABILE_SEDE"&&!x.siteId)return NextResponse.redirect(new URL("/configurazione?error=invalid",req.url),303);
 if(x.siteId&&!await db.site.findFirst({where:{id:x.siteId,active:true}}))return NextResponse.redirect(new URL("/configurazione?error=invalid",req.url),303);
 try{
  const passwordHash=await bcrypt.hash(x.password,12);
  const created=await db.user.create({data:{name:x.name,email:x.email.toLowerCase(),passwordHash,role:x.role,siteId:x.siteId||null}});
  await db.auditEvent.create({data:{actorId:actor.id,action:"USER_CREATED",details:{userId:created.id,email:created.email,role:created.role,siteId:created.siteId}}});
 }catch{return NextResponse.redirect(new URL("/configurazione?error=duplicate",req.url),303);}
 return NextResponse.redirect(new URL("/configurazione?ok=1",req.url),303);
}
