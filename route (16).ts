import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser, canSeeAllSites } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

const updateSchema=z.object({status:z.enum(["APERTA","IN_LAVORAZIONE","IN_ATTESA","COMPLETATA","ANNULLATA"]),priority:z.enum(["BASSA","NORMALE","ALTA","URGENTE"]),assigneeId:z.string().optional()});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await currentUser();if(!user)return NextResponse.redirect(new URL("/login",request.url),303);
 if(!["DIREZIONE","SEGRETERIA","AMMINISTRAZIONE","RESPONSABILE_SEDE"].includes(user.role))return new NextResponse("Accesso negato",{status:403});
 const {id}=await params;const p=await db.practice.findUnique({where:{id}});
 if(!p||(!canSeeAllSites(user.role)&&p.siteId!==user.siteId))return new NextResponse("Non trovato",{status:404});
 const form=await request.formData();const intent=String(form.get("intent")??"");
 try{
  if(intent==="note"){
   const body=String(form.get("body")??"").trim();if(!body||body.length>5000)throw new Error("invalid");
   await db.$transaction([db.note.create({data:{body,practiceId:id,authorId:user.id}}),db.auditEvent.create({data:{actorId:user.id,practiceId:id,action:"NOTE_ADDED",details:{length:body.length}}})]);
  }else{
   const parsed=updateSchema.safeParse({status:String(form.get("status")),priority:String(form.get("priority")),assigneeId:String(form.get("assigneeId")??"")});
   if(!parsed.success)throw new Error("invalid");
   const d=parsed.data;const old={status:p.status,priority:p.priority,assigneeId:p.assigneeId};
   await db.$transaction([
    db.practice.update({where:{id},data:{status:d.status,priority:d.priority,assigneeId:d.assigneeId||null,closedAt:d.status==="COMPLETATA"?new Date():null}}),
    db.auditEvent.create({data:{actorId:user.id,practiceId:id,action:"PRACTICE_UPDATED",details:{before:old,after:d} as Prisma.InputJsonValue}})
   ]);
  }
 }catch{return NextResponse.redirect(new URL(`/pratiche/${id}?error=invalid`,request.url),303);}
 return NextResponse.redirect(new URL(`/pratiche/${id}`,request.url),303);
}
