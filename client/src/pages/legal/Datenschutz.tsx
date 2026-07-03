import { Layout } from '../../components/layout/Layout';
import { Topbar } from '../../components/layout/Topbar';
import { Shield } from 'lucide-react';

export function DatenschutzPage() {
  return (
    <Layout>
      <Topbar title="Datenschutzerklärung" subtitle="Gemäss Schweizer DSG und DSGVO" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield size={20} className="text-[#185FA5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Datenschutzerklärung</h1>
              <p className="text-xs text-gray-500">Letzte Aktualisierung: Januar 2026</p>
            </div>
          </div>

          {[
            {
              title: '1. Verantwortliche Stelle',
              content: 'SMARTLAW AG ist verantwortlich für die Verarbeitung Ihrer personenbezogenen Daten im Sinne des Schweizer Datenschutzgesetzes (DSG) sowie der Europäischen Datenschutz-Grundverordnung (DSGVO).',
            },
            {
              title: '2. Erhobene Daten',
              content: 'Wir erheben ausschliesslich Daten, die für den Betrieb der Kanzleisoftware notwendig sind: Benutzerdaten (Name, E-Mail, Rolle), Mandantendaten, Dossierdaten, Zeiterfassungseinträge und Dokumente. Alle Daten werden verschlüsselt gespeichert.',
            },
            {
              title: '3. Zweck der Datenverarbeitung',
              content: 'Die Daten werden ausschliesslich zur Erbringung der Kanzleimanagement-Dienstleistungen verwendet: Mandantenverwaltung, Zeiterfassung, Dokumentenverwaltung, Rechnungsstellung und KI-gestützte Rechtsassistenz.',
            },
            {
              title: '4. Datenspeicherung',
              content: 'Alle Daten werden auf Servern in der Schweiz bzw. der EU gespeichert (Supabase, EU-West). Die Übertragung erfolgt ausschliesslich über verschlüsselte TLS/HTTPS-Verbindungen. Backups werden täglich erstellt.',
            },
            {
              title: '5. Weitergabe an Dritte',
              content: 'Eine Weitergabe personenbezogener Daten an Dritte erfolgt nicht, ausser dies ist zur Erbringung der Dienstleistung erforderlich (z.B. Zahlungsabwicklung) oder gesetzlich vorgeschrieben.',
            },
            {
              title: '6. Ihre Rechte',
              content: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten. Für Anfragen wenden Sie sich an: datenschutz@smartlaw.ch',
            },
            {
              title: '7. Aufbewahrungsfristen',
              content: 'Mandanten- und Dossierdaten werden gemäss Schweizer Anwaltsrecht mindestens 10 Jahre aufbewahrt. Nach Ablauf der gesetzlichen Aufbewahrungsfrist werden die Daten sicher gelöscht.',
            },
            {
              title: '8. Kontakt',
              content: 'Bei Fragen zum Datenschutz: datenschutz@smartlaw.ch | SMARTLAW AG, Zürich, Schweiz',
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
