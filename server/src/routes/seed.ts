import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const secret = req.headers['x-seed-secret'] || req.body?.secret;
  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Push schema to DB at runtime (build server can't reach Supabase port 5432)
  try {
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss`, {
      env: { ...process.env },
      stdio: 'pipe',
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'prisma db push failed', detail: e.message });
  }

  const existing = await prisma.user.count();
  if (existing > 0) {
    return res.status(409).json({ error: 'Datenbank enthält bereits Daten. Seed abgebrochen.' });
  }

  const pw = await bcrypt.hash('smartlaw123', 10);

  const [admin, anwalt1, anwalt2, assistant] = await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@smartlaw.ch' }, update: {}, create: { email: 'admin@smartlaw.ch', passwordHash: pw, vorname: 'Anna', nachname: 'Meier', role: 'ADMIN', stundenansatz: 350 } }),
    prisma.user.upsert({ where: { email: 'mueller@smartlaw.ch' }, update: {}, create: { email: 'mueller@smartlaw.ch', passwordHash: pw, vorname: 'Thomas', nachname: 'Müller', role: 'LAWYER', stundenansatz: 300 } }),
    prisma.user.upsert({ where: { email: 'schneider@smartlaw.ch' }, update: {}, create: { email: 'schneider@smartlaw.ch', passwordHash: pw, vorname: 'Sarah', nachname: 'Schneider', role: 'LAWYER', stundenansatz: 280 } }),
    prisma.user.upsert({ where: { email: 'assistant@smartlaw.ch' }, update: {}, create: { email: 'assistant@smartlaw.ch', passwordHash: pw, vorname: 'Marc', nachname: 'Weber', role: 'ASSISTANT', stundenansatz: 120 } }),
  ]);

  const clients = await Promise.all([
    prisma.client.create({ data: { vorname: 'Hans', nachname: 'Zimmermann', typ: 'PRIVAT', email: 'h.zimmermann@gmail.com', telefon: '+41 79 123 45 67', strasse: 'Bahnhofstrasse 12', plz: '8001', ort: 'Zürich' } }),
    prisma.client.create({ data: { vorname: 'Maria', nachname: 'Keller', typ: 'PRIVAT', email: 'maria.keller@bluewin.ch', telefon: '+41 79 234 56 78', strasse: 'Hauptgasse 5', plz: '3011', ort: 'Bern' } }),
    prisma.client.create({ data: { vorname: 'Peter', nachname: 'Huber', firma: 'Huber Immobilien AG', typ: 'FIRMA', email: 'p.huber@huber-immobilien.ch', telefon: '+41 44 456 78 90', strasse: 'Seestrasse 88', plz: '8700', ort: 'Küsnacht' } }),
    prisma.client.create({ data: { vorname: 'Sophie', nachname: 'Brunner', typ: 'PRIVAT', email: 'sophie.brunner@outlook.com', telefon: '+41 76 345 67 89', strasse: 'Rösslimattstrasse 14', plz: '6003', ort: 'Luzern' } }),
    prisma.client.create({ data: { vorname: 'Klaus', nachname: 'Fischer', firma: 'Fischer & Partner GmbH', typ: 'FIRMA', email: 'k.fischer@fischer-partner.ch', telefon: '+41 61 789 01 23', strasse: 'Freie Strasse 30', plz: '4001', ort: 'Basel' } }),
    prisma.client.create({ data: { vorname: 'Claudia', nachname: 'Wirz', typ: 'PRIVAT', email: 'c.wirz@gmx.ch', telefon: '+41 78 456 78 90', strasse: 'Kirchgasse 8', plz: '9000', ort: 'St. Gallen' } }),
    prisma.client.create({ data: { vorname: 'Beat', nachname: 'Frei', typ: 'PRIVAT', email: 'beat.frei@hispeed.ch', telefon: '+41 31 654 32 10', strasse: 'Thunstrasse 45', plz: '3006', ort: 'Bern' } }),
    prisma.client.create({ data: { vorname: 'Ingrid', nachname: 'Steiner', firma: 'Steiner Tech AG', typ: 'FIRMA', email: 'i.steiner@steinertech.ch', telefon: '+41 44 987 65 43', strasse: 'Technoparkstrasse 1', plz: '8005', ort: 'Zürich' } }),
    prisma.client.create({ data: { vorname: 'René', nachname: 'Dubois', typ: 'PRIVAT', email: 'rene.dubois@romandie.ch', telefon: '+41 79 567 89 01', strasse: 'Rue du Lac 22', plz: '1006', ort: 'Lausanne' } }),
    prisma.client.create({ data: { vorname: 'Martina', nachname: 'Graf', firma: 'Graf Consulting AG', typ: 'FIRMA', email: 'm.graf@grafconsulting.ch', telefon: '+41 41 321 09 87', strasse: 'Pilatusstrasse 2', plz: '6003', ort: 'Luzern' } }),
  ]);

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 86400000);

  const dossierData = [
    { titel: 'Scheidungsverfahren Zimmermann', rechtsgebiet: 'FAMILIENRECHT' as const, status: 'AKTIV' as const, clientId: clients[0].id, anwaltId: admin.id, frist: daysAhead(30), notizen: 'Güterrechtliche Auseinandersetzung. Kinderzuteilung ungeklärt.' },
    { titel: 'Erbstreit Keller - Nachlass Keller Hans', rechtsgebiet: 'ERBRECHT' as const, status: 'AKTIV' as const, clientId: clients[1].id, anwaltId: anwalt1.id, frist: daysAhead(5), notizen: 'Testament angefochten. Pflichtteilsklage eingereicht.' },
    { titel: 'Mietstreit Wohnung Zürich', rechtsgebiet: 'MIETRECHT' as const, status: 'AKTIV' as const, clientId: clients[2].id, anwaltId: anwalt1.id, frist: daysAhead(14), notizen: 'Kündigung wegen Eigenbedarf. Erstreckung beantragt.' },
    { titel: 'Arbeitsrechtliche Kündigung Brunner', rechtsgebiet: 'ARBEITSRECHT' as const, status: 'AKTIV' as const, clientId: clients[3].id, anwaltId: anwalt2.id, frist: daysAhead(3), notizen: 'Fristlose Kündigung. Ungerechtfertigt. Klage auf Entschädigung.' },
    { titel: 'Aktionärbindungsvertrag Fischer & Partner', rechtsgebiet: 'VERTRAGSRECHT' as const, status: 'AKTIV' as const, clientId: clients[4].id, anwaltId: admin.id, frist: daysAhead(21), notizen: 'Revision des ABV. Neue Gesellschafter aufzunehmen.' },
    { titel: 'Strafanzeige Betrug Wirz', rechtsgebiet: 'STRAFRECHT' as const, status: 'OFFEN' as const, clientId: clients[5].id, anwaltId: anwalt2.id, frist: daysAhead(45), notizen: 'Anzeige gegen Geschäftspartner wegen Betrug Art. 146 StGB.' },
    { titel: 'Lohnklage Frei vs. Arbeitgeber', rechtsgebiet: 'ARBEITSRECHT' as const, status: 'AKTIV' as const, clientId: clients[6].id, anwaltId: anwalt1.id, frist: daysAhead(7), notizen: 'Ausstehende Löhne CHF 45\'000. Klage bei Arbeitsgericht.' },
    { titel: 'Unternehmensfusion Steiner Tech', rechtsgebiet: 'GESELLSCHAFTSRECHT' as const, status: 'AKTIV' as const, clientId: clients[7].id, anwaltId: admin.id, frist: daysAhead(60), notizen: 'Due Diligence läuft. Vertragsverhandlungen in Vorbereitung.' },
    { titel: 'Kaufvertrag Liegenschaft Dubois', rechtsgebiet: 'IMMOBILIENRECHT' as const, status: 'ABGESCHLOSSEN' as const, clientId: clients[8].id, anwaltId: anwalt2.id, frist: daysAgo(10), notizen: 'Abgeschlossen. Beurkundung erfolgt.' },
    { titel: 'Beratung Gesellschaftsgründung Graf', rechtsgebiet: 'GESELLSCHAFTSRECHT' as const, status: 'AKTIV' as const, clientId: clients[9].id, anwaltId: anwalt1.id, frist: daysAhead(20), notizen: 'GmbH-Gründung. Handelsregistereintrag in Bearbeitung.' },
    { titel: 'Eheschutzverfahren Zimmermann', rechtsgebiet: 'FAMILIENRECHT' as const, status: 'ABGESCHLOSSEN' as const, clientId: clients[0].id, anwaltId: admin.id, frist: daysAgo(30), notizen: 'Getrennte Wohnungen angeordnet. Unterhalt provisorisch geregelt.' },
    { titel: 'Testament Keller', rechtsgebiet: 'ERBRECHT' as const, status: 'ABGESCHLOSSEN' as const, clientId: clients[1].id, anwaltId: anwalt1.id, frist: daysAgo(60), notizen: 'Testament erstellt und notariell beglaubigt.' },
    { titel: 'Mietkaution Huber Immobilien', rechtsgebiet: 'MIETRECHT' as const, status: 'OFFEN' as const, clientId: clients[2].id, anwaltId: anwalt2.id, frist: daysAhead(90), notizen: 'Rückforderung Mietkaution CHF 8\'400.' },
    { titel: 'Datenschutzverletzung Steiner Tech', rechtsgebiet: 'VERTRAGSRECHT' as const, status: 'OFFEN' as const, clientId: clients[7].id, anwaltId: admin.id, frist: daysAhead(35), notizen: 'DSGVO-Verstoß gegenüber Kunden. Schadenansprüche.' },
    { titel: 'Konsortialvertrag Graf Consulting', rechtsgebiet: 'VERTRAGSRECHT' as const, status: 'AKTIV' as const, clientId: clients[9].id, anwaltId: anwalt2.id, frist: daysAhead(15), notizen: 'Konsortium für Ausschreibung. Verteilung Pflichten und Gewinne.' },
  ];

  const dossiers = await Promise.all(dossierData.map(d => prisma.dossier.create({ data: d })));

  const taetigkeiten = ['Mandantengespräch', 'Schriftsatz verfassen', 'Recherche', 'Aktenstudium', 'Korrespondenz', 'Gericht', 'Telefonat', 'Beratung'];
  for (let i = 0; i < 40; i++) {
    const d = dossiers[i % dossiers.length];
    const userOptions = [admin, anwalt1, anwalt2];
    const user = userOptions[i % 3];
    await prisma.timeEntry.create({
      data: {
        datum: daysAgo(i % 30),
        taetigkeit: taetigkeiten[i % taetigkeiten.length],
        dauer: [0.5, 1, 1.5, 2, 3][i % 5],
        stundenansatz: user.stundenansatz,
        verrechenbar: i % 5 !== 0,
        dossierId: d.id,
        userId: user.id,
      },
    });
  }

  await Promise.all([
    prisma.task.create({ data: { titel: 'Klageantwort einreichen', status: 'OFFEN', faellig: daysAhead(5), dossierId: dossiers[0].id, assigneeId: admin.id } }),
    prisma.task.create({ data: { titel: 'Zeugen kontaktieren', status: 'IN_BEARBEITUNG', faellig: daysAhead(3), dossierId: dossiers[1].id, assigneeId: anwalt1.id } }),
    prisma.task.create({ data: { titel: 'Unterlagen anfordern', status: 'OFFEN', faellig: daysAhead(7), dossierId: dossiers[2].id, assigneeId: anwalt1.id } }),
    prisma.task.create({ data: { titel: 'Gerichtstermin vorbereiten', status: 'OFFEN', faellig: daysAhead(2), dossierId: dossiers[3].id, assigneeId: anwalt2.id } }),
    prisma.task.create({ data: { titel: 'Vertragsentwurf prüfen', status: 'ERLEDIGT', faellig: daysAgo(5), dossierId: dossiers[4].id, assigneeId: admin.id } }),
  ]);

  await prisma.invoice.create({
    data: {
      nummer: 'RE-2025-001', status: 'VERSENDET', faelligkeitsdatum: daysAhead(30), betrag: 4500, mwst: 7.7,
      dossierId: dossiers[0].id, clientId: clients[0].id,
      items: { create: [
        { beschreibung: 'Mandantengespräch', menge: 2, einheit: 'h', einzelpreis: 350, total: 700 },
        { beschreibung: 'Schriftsatz Klageantwort', menge: 8, einheit: 'h', einzelpreis: 350, total: 2800 },
        { beschreibung: 'Aktenstudium', menge: 2.86, einheit: 'h', einzelpreis: 350, total: 1000 },
      ]},
    },
  });

  await prisma.invoice.create({
    data: {
      nummer: 'RE-2025-002', status: 'BEZAHLT', ausstellungsdatum: daysAgo(45), faelligkeitsdatum: daysAgo(15), betrag: 2100, mwst: 7.7,
      dossierId: dossiers[8].id, clientId: clients[8].id,
      items: { create: [
        { beschreibung: 'Kaufvertrag beurkunden', menge: 6, einheit: 'h', einzelpreis: 280, total: 1680 },
        { beschreibung: 'Grundbucheintrag', menge: 1.5, einheit: 'h', einzelpreis: 280, total: 420 },
      ]},
    },
  });

  await prisma.invoice.create({
    data: {
      nummer: 'RE-2025-003', status: 'UEBERFAELLIG', ausstellungsdatum: daysAgo(60), faelligkeitsdatum: daysAgo(30), betrag: 3750, mwst: 7.7,
      dossierId: dossiers[7].id, clientId: clients[7].id,
      items: { create: [
        { beschreibung: 'Due Diligence', menge: 10, einheit: 'h', einzelpreis: 350, total: 3500 },
        { beschreibung: 'Beratung', menge: 0.71, einheit: 'h', einzelpreis: 350, total: 250 },
      ]},
    },
  });

  await Promise.all([
    prisma.legalPackage.create({
      data: {
        name: 'Familienrecht', rechtsgebiet: 'FAMILIENRECHT', beschreibung: 'Vollständiges Paket für familienrechtliche Mandate', aktiv: true,
        templates: { create: [
          { name: 'Scheidungsklage', inhalt: 'An das Bezirksgericht...\n\nKlagebegehren:\n1. Die Ehe sei zu scheiden.\n2. Die Kinder seien unter die Obhut von {{obhut}} zu stellen.', typ: 'Schriftsatz' },
          { name: 'Unterhaltsberechnung', inhalt: 'Unterhaltsberechnung gemäss Zürcher Tabellen\n\nNettoeinkommen: CHF {{einkommen}}\nUnterhaltsansatz: CHF {{unterhalt}}', typ: 'Checkliste' },
        ]},
      },
    }),
    prisma.legalPackage.create({
      data: {
        name: 'Arbeitsrecht', rechtsgebiet: 'ARBEITSRECHT', beschreibung: 'Kündigungen, Lohnklagen, Diskriminierung', aktiv: true,
        templates: { create: [
          { name: 'Kündigungsschutzklage', inhalt: 'KLAGE\n\nAn das Arbeitsgericht:\n\nKläger/in: {{arbeitnehmer}}\nBeklagte/r: {{arbeitgeber}}\n\nGrundlage: Art. 336 ff. OR\n\nBegehren:\n1. Die Kündigung sei als missbräuchlich zu erklären.', typ: 'Schriftsatz' },
        ]},
      },
    }),
    prisma.legalPackage.create({
      data: {
        name: 'Erbrecht', rechtsgebiet: 'ERBRECHT', beschreibung: 'Testamente, Erbverträge, Nachlassregelung', aktiv: true,
        templates: { create: [
          { name: 'Testament', inhalt: 'LETZTER WILLE\n\nIch, {{name}}, geboren am {{geburtsdatum}},\nbestimme hiermit meinen letzten Willen:\n\n{{inhalt}}\n\nDatum: {{datum}}\nUnterschrift: _______________', typ: 'Vorlage' },
        ]},
      },
    }),
  ]);

  await Promise.all([
    prisma.honorarVereinbarung.create({ data: { typ: 'STUNDENBASIS', stundenansatz: 350, dossierId: dossiers[0].id } }),
    prisma.honorarVereinbarung.create({ data: { typ: 'STUNDENBASIS', stundenansatz: 300, dossierId: dossiers[1].id } }),
    prisma.honorarVereinbarung.create({ data: { typ: 'PAUSCHAL', betrag: 5000, dossierId: dossiers[4].id } }),
    prisma.honorarVereinbarung.create({ data: { typ: 'ERFOLGSHONORAR', betrag: 15000, dossierId: dossiers[6].id } }),
  ]);

  res.json({
    message: '✅ Demo-Daten erfolgreich erstellt!',
    logins: [
      { email: 'admin@smartlaw.ch', password: 'smartlaw123', role: 'Admin' },
      { email: 'mueller@smartlaw.ch', password: 'smartlaw123', role: 'Anwalt' },
      { email: 'schneider@smartlaw.ch', password: 'smartlaw123', role: 'Anwältin' },
      { email: 'assistant@smartlaw.ch', password: 'smartlaw123', role: 'Assistent' },
    ],
  });
});

export default router;
