# Gestionale Registro Centrale — Ristorazione

Applicazione web Next.js con database PostgreSQL, autenticazione con sessione server-side firmata, ruoli applicativi, registro pratiche, note, scadenze e audit trail. Pensata come base concreta da completare e collaudare prima dell'uso aziendale.

## Funzioni incluse in questa base
- Login/logout con password hash bcrypt e cookie HttpOnly/SameSite.
- Ruoli: DIREZIONE, SEGRETERIA, AMMINISTRAZIONE, RESPONSABILE_SEDE, PERSONALE.
- Sedi configurabili (massimo 5 nella UI iniziale).
- Registro pratiche: ID `PR-00001`, sede, categoria, descrizione, responsabile, priorità, scadenza e stato.
- Ricerca testuale e filtri per stato/sede.
- Note operative, storico eventi e dashboard.
- Controlli server-side per le pagine e le API principali.
- Nessun dato aziendale di esempio inserito automaticamente.

## Prima di iniziare
Servono Node.js 20+, npm e un database PostgreSQL. Per hosting gestito si può usare Neon e Vercel; creare questi servizi richiede accesso al proprio account. Non inserire password o chiavi segrete in chat o nel repository.

## Avvio locale
1. Copia `.env.example` in `.env`.
2. Inserisci in `DATABASE_URL` la stringa PostgreSQL fornita dal provider. Inserisci in `SESSION_SECRET` un segreto casuale di almeno 32 caratteri.
3. Installa dipendenze: `npm install`
4. Crea le tabelle: `npm run db:push`
5. Crea il primo amministratore DIREZIONE **solo in ambiente locale controllato**:
   - imposta temporaneamente `ALLOW_FIRST_ADMIN=true`, `ADMIN_EMAIL`, `ADMIN_NAME` e `ADMIN_PASSWORD` nell'ambiente di esecuzione;
   - usa una password casuale di almeno 14 caratteri;
   - esegui `npm run db:seed`;
   - elimina `ADMIN_PASSWORD` e reimposta `ALLOW_FIRST_ADMIN=false`.
6. Avvia: `npm run dev`; visita `http://localhost:3000`.

Non mettere credenziali in file tracciati da Git, commit, screenshot o chat.

## Deploy Vercel + Neon
1. Crea un database PostgreSQL in Neon e conserva la connection string in un password manager.
2. Carica il progetto in un repository GitHub **privato**.
3. Importa il repository in Vercel.
4. Aggiungi `DATABASE_URL` e `SESSION_SECRET` nelle Environment Variables di Vercel per Preview/Production, senza inserirle nel codice.
5. Deploy e applica lo schema dal terminale locale collegato al database corretto con `npx prisma db push`. Per un ambiente produttivo stabile, passare a migrazioni versionate Prisma (`prisma migrate deploy`) prima del rilascio definitivo.
6. Crea il primo utente in modo controllato. Non abilitare una rotta pubblica di registrazione dell'amministratore.
7. Rimuovi ogni variabile temporanea di bootstrap e verifica i log.

## Stato e limiti: leggere prima dell'uso reale
Questo repository è una **base applicativa funzionante da installare e collaudare**, non un servizio già pubblicato o certificato. Non contiene ancora:
- gestione completa e interfaccia per invitare/disattivare utenti e reimpostare password;
- upload reale dei documenti su storage privato (il modello DB è predisposto, ma nessun file viene caricato);
- moduli transazionali completi per fatture, acquisti/ordini, personale, manutenzioni e report esportabili;
- test automatici, rate limiting login, recupero password, CSRF hardening dedicato, policy di retention e piano di backup verificato;
- audit di sicurezza indipendente o verifica legale/GDPR.

Non usare ancora per dati sensibili del personale, documenti fiscali o come unico archivio ufficiale. Prima della messa in produzione occorrono completamento dei moduli, migrazioni, test, backup/restore, monitoraggio e verifica dei permessi per ciascun ruolo. Il modulo personale va progettato con accessi minimi e dati strettamente necessari.

## Struttura
- `src/app`: interfaccia e route API
- `src/lib/auth.ts`: sessioni e permessi
- `prisma/schema.prisma`: schema relazionale PostgreSQL
- `prisma/seed.ts`: bootstrap amministratore protetto da variabile d'ambiente


## Moduli aggiunti
- **Fatture**: registrazione fatture fornitori, scadenze, importi e stato amministrativo.
- **Fornitori**: anagrafica base e collegamenti a fatture/acquisti.
- **Acquisti**: richieste di acquisto per sede, quantità, fornitore e importo stimato.
- **Personale**: registro operativo minimizzato con mansione, sede e date organizzative.
- **Manutenzioni**: segnalazioni con sede, priorità, scadenza, fornitore e costo.
- **Report direzionale**: aggregazioni da dati effettivamente registrati.
- **Moduli operativi**: indice centrale per accedere alle sezioni.

Dopo aver aggiunto i modelli Prisma, eseguire `npm run db:push` in un ambiente di sviluppo o staging prima del deploy. Prima della produzione servono test d'integrazione, policy per le modifiche di stato dei registri, gestione completa utenti, storage documentale privato e revisione dei permessi per ogni route.


### Creazione utenti dopo il primo accesso
Un utente con ruolo DIREZIONE può creare utenti dalla pagina **Sedi e utenti**. Le password iniziali devono essere di almeno 14 caratteri e consegnate in modo sicuro. Per un responsabile di sede è obbligatorio assegnare la sede. Non è prevista registrazione pubblica.
