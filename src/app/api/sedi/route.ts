import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
export async function POST(request:Request){
 const user=await currentUser();if(!user)return NextResponse.redirect(new URL("/login",request.url),303);
 if(user.role!=="DIREZIONE")return new NextResponse("Accesso negato",{status:403});
 const form=await request.formData();const name=String(form.get("name")??"").trim();
 if(name.length<2||name.length>100)return NextResponse.redirect(new URL("/configurazione?error=invalid",request.url),303);
 try{const count=await db.site.count();if(count>=5)return NextResponse.redirect(new URL("/configurazione?error=limit",request.url),303);
 await db.site.create({data:{name}});await db.auditEvent.create({data:{actorId:user.id,action:"SITE_CREATED",details:{name}}});
 }catch{return NextResponse.redirect(new URL("/configurazione?error=duplicate",request.url),303);}
 return NextResponse.redirect(new URL("/configurazione?ok=1",request.url),303);
}
