import { Layout } from '../../components/layout/Layout';
import { Topbar } from '../../components/layout/Topbar';
import { FileText } from 'lucide-react';

export function AGBPage() {
  return (
    <Layout>
      <Topbar title="Allgemeine Geschäftsbedingungen" subtitle="AGB SMARTLAW AG" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText size={20} className="text-[#185FA5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Allgemeine Geschäftsbedingungen</h1>
              <p className="text-xs text-gray-500">Stand: Januar 2026 · SMARTLAW AG, Zürich</p>
            </div>
          </div>

          {[
            {
              title: '§ 1 Geltungsbereich',
              content: 'Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der SMARTLAW AG (nachfolgend «Anbieter») und den Nutzern der SMARTLAW-Kanzleisoftware (nachfolgend «Kunden»). Abweichende Bedingungen des Kunden werden nicht anerkannt.',
            },
            {
              title: '§ 2 Leistungsumfang',
              content: 'Der Anbieter stellt dem Kunden die SMARTLAW-Plattform als Software-as-a-Service (SaaS) zur Verfügung. Der Leistungsumfang umfasst: Mandantenverwaltung, Dossier- und Dokumentenmanagement, Zeiterfassung, Rechnungsstellung sowie KI-gestützte Rechtsassistenz.',
            },
            {
              title: '§ 3 Verfügbarkeit',
              content: 'Der Anbieter garantiert eine Systemverfügbarkeit von 99,5% im Jahresdurchschnitt. Wartungsarbeiten werden nach Möglichkeit ausserhalb der Geschäftszeiten (Mo–Fr, 08:00–18:00 Uhr) durchgeführt und mindestens 24 Stunden im Voraus angekündigt.',
            },
            {
              title: '§ 4 Nutzungsrechte',
              content: 'Der Kunde erhält ein nicht-exklusives, nicht-übertragbares Recht zur Nutzung der Software für die vereinbarte Anzahl Benutzer. Eine Weitergabe, Unterlizenzierung oder ein Weiterverkauf ist nicht gestattet.',
            },
            {
              title: '§ 5 Pflichten des Kunden',
              content: 'Der Kunde ist verantwortlich für die sichere Verwahrung seiner Zugangsdaten, die Einhaltung des Anwaltsgeheimnisses bei der Dateneingabe sowie die Richtigkeit der eingegebenen Daten. Der Missbrauch der Plattform ist untersagt.',
            },
            {
              title: '§ 6 Vertragslaufzeit und Kündigung',
              content: 'Der Vertrag wird auf unbestimmte Zeit geschlossen und kann von beiden Parteien mit einer Frist von 30 Tagen zum Monatsende gekündigt werden. Das Recht zur ausserordentlichen Kündigung bleibt vorbehalten.',
            },
            {
              title: '§ 7 Haftungsbeschränkung',
              content: 'Die Haftung des Anbieters für mittelbare Schäden, entgangenen Gewinn und Folgeschäden ist ausgeschlossen. Die Haftung für direkte Schäden ist auf den im Schadensmonat bezahlten Nutzungsbetrag begrenzt.',
            },
            {
              title: '§ 8 Anwendbares Recht und Gerichtsstand',
              content: 'Es gilt Schweizer Recht unter Ausschluss des UN-Kaufrechts. Ausschliesslicher Gerichtsstand für alle Streitigkeiten ist Zürich, Schweiz.',
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
