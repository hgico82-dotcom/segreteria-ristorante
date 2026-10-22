import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser, canSeeAllSites } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

const schema = z.object({
 title:z.string().trim().min(1).max(160), description:z.string().trim().min(1).max(10000),
 siteId:z.string().min(1), category:z.enum(["AMMINISTRAZIONE","PERSONALE","ACQUISTI","FORNITORI","MANUTENZIONE","UTENZE","DOCUMENTI","OPERATIVO","ALTRO"]),
 priority:z.enum(["BASSA","NORMALE","ALTA","URGENTE"]), assigneeId:z.string().optional(),
 dueAt:z.string().optional(), note:z.string().max(5000).optional()
});
export async function POST(request:Request){
 const user=await currentUser(); if(!user)return NextResponse.redirect(new URL("/login",request.url),303);
 const form=await request.formData();
 const parsed=schema.safeParse(Object.fromEntries(["title","description","siteId","category","priority","assigneeId","dueAt","note"].map(k=>[k,String(form.get(k)??"")])));
 if(!parsed.success)return NextResponse.redirect(new URL("/nuova?error=invalid",request.url),303);
 const d=parsed.data;
 if(!canSeeAllSites(user.role)&&user.siteId!==d.siteId)return new NextResponse("Accesso negato alla sede", {status:403});
 const site=await db.site.findFirst({where:{id:d.siteId,active:true}}); if(!site)return new NextResponse("Sede non valida", {status:400});
 if(d.assigneeId){const assignee=await db.user.findFirst({where:{id:d.assigneeId,active:true}});if(!assignee)return new NextResponse("Responsabile non valido",{status:400});}
 const result=await db.$transaction(async tx=>{
   const counter=await tx.counter.upsert({where:{key:"practice"},create:{key:"practice",value:1},update:{value:{increment:1}}});
   const code=`PR-${String(counter.value).padStart(5,"0")}`;
   const practice=await tx.practice.create({data:{code,title:d.title,description:d.description,siteId:d.siteId,category:d.category,priority:d.priority,assigneeId:d.assigneeId||null,dueAt:d.dueAt?new Date(`${d.dueAt}T12:00:00.000Z`):null,createdById:user.id}});
   if(d.note.trim())await tx.note.create({data:{body:d.note.trim(),practiceId:practice.id,authorId:user.id}});
   await tx.auditEvent.create({data:{actorId:user.id,practiceId:practice.id,action:"PRACTICE_CREATED",details:{code,site:site.name,category:d.category,priority:d.priority} as Prisma.InputJsonValue}});
   return practice;
 });
 return NextResponse.redirect(new URL(`/pratiche/${result.id}`,request.url),303);
}
