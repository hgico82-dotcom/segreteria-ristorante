# Checklist di messa in produzione — Registro Centrale

Questa checklist è obbligatoria prima di usare dati aziendali reali.

## 1. Requisiti
- Node.js 20 o superiore
- PostgreSQL gestito (ad es. Neon)
- Repository GitHub privato
- Hosting Next.js (ad es. Vercel)
- Account amministrativi controllati dal titolare del gruppo

## 2. Configurazione sicura
- Copiare `.env.example` in `.env` solo sul computer di sviluppo.
- Impostare `DATABASE_URL` con la connection string del database di produzione.
- Impostare `SESSION_SECRET` con almeno 32 caratteri casuali.
- Non salvare `.env` nel repository Git; il file è escluso dal `.gitignore`.
- Non inviare credenziali in chat o email non protette.

## 3. Installazione locale
```bash
npm install
npx prisma validate
npx prisma generate
npm run db:push
npm run dev
```
Aprire `http://localhost:3000`. Se `npm install` o la generazione Prisma falliscono, non proseguire al deploy.

## 4. Creazione del primo amministratore
Impostare temporaneamente le variabili d'ambiente `ALLOW_FIRST_ADMIN=true`, `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` (password casuale di almeno 14 caratteri) nell'ambiente locale protetto, quindi:
```bash
npm run db:seed
```
Rimuovere `ADMIN_PASSWORD` e riportare `ALLOW_FIRST_ADMIN=false` immediatamente dopo. Non creare un endpoint pubblico di bootstrap amministratore.

## 5. Pubblicazione
1. Caricare il progetto in un repository GitHub privato.
2. Importare il repository in Vercel.
3. Configurare `DATABASE_URL` e `SESSION_SECRET` nelle variabili ambiente Vercel, sia per Preview sia per Production solo se necessario.
4. Applicare lo schema al database corretto con `npx prisma db push` da un ambiente sicuro.
5. Eseguire il deploy e controllare i log di build.
6. Accedere con l'utente DIREZIONE, creare le sedi reali e poi creare gli utenti con ruoli e sedi corretti.

## 6. Test obbligatori prima del go-live
- Login riuscito e password errata rifiutata.
- Logout invalida la sessione.
- Utente RESPONSABILE_SEDE non può vedere dati di altre sedi.
- Utente non autorizzato riceve accesso negato per le API.
- Creazione/aggiornamento pratica, nota e storico.
- Creazione fattura, fornitore, acquisto, scheda personale e manutenzione.
- Scadenze e importi controllati su casi di test.
- Backup PostgreSQL creato e ripristino testato.
- Verificare HTTPS, log, policy password e recupero credenziali.
- Verificare che documenti e dati del personale non siano esposti pubblicamente.

## 7. Limitazioni note da risolvere prima di archiviare documenti ufficiali
- Il modello Document è predisposto ma non è implementato upload/download su storage privato.
- Non è implementata la modifica di stato di fatture, acquisti e manutenzioni attraverso workflow dedicati.
- Non sono inclusi test automatici e limitazione dei tentativi di login.
- Prima della produzione è raccomandato passare da `prisma db push` a migrazioni versionate (`prisma migrate deploy`) dopo aver creato e verificato le migrazioni in staging.
- Il registro del personale è intenzionalmente minimale: non inserirvi dati sanitari, documenti d'identità o altre categorie particolari di dati.
- L'applicazione non sostituisce il software contabile/fiscale ufficiale.

**Stato attuale:** codice sorgente predisposto; hosting, database di produzione e collaudo non verificati da questa sessione. Non trattare il sistema come produzione finché tutti i test sopra non sono completati.
