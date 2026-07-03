import { Layout } from '../../components/layout/Layout';
import { Topbar } from '../../components/layout/Topbar';
import { Shield, Lock, Server, Eye, RefreshCw, AlertTriangle } from 'lucide-react';

const measures = [
  {
    icon: Lock,
    title: 'Verschlüsselung',
    items: ['TLS 1.3 für alle Datenübertragungen', 'AES-256 Verschlüsselung at rest', 'Bcrypt-Passwort-Hashing (Faktor 10)', 'JWT-Token mit kurzer Laufzeit (7 Tage)'],
  },
  {
    icon: Server,
    title: 'Infrastruktur',
    items: ['Hosting in der EU (Frankfurt / Dublin)', 'ISO 27001-zertifizierte Rechenzentren', 'Tägliche automatische Backups', '99.5% SLA-Verfügbarkeitsgarantie'],
  },
  {
    icon: Eye,
    title: 'Zugriffskontrolle',
    items: ['Rollenbasierte Zugriffskontrolle (RBAC)', 'Audit-Log aller kritischen Aktionen', 'Session-Timeout nach Inaktivität', 'Separate Mandanten-Datentrennung'],
  },
  {
    icon: RefreshCw,
    title: 'Updates & Patches',
    items: ['Automatische Sicherheits-Updates', 'Dependency-Scanning (wöchentlich)', 'Penetrationstests (jährlich)', 'Responsible Disclosure Policy'],
  },
];

export function SicherheitPage() {
  return (
    <Layout>
      <Topbar title="Sicherheit" subtitle="Unsere Sicherheitsmassnahmen im Überblick" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header card */}
        <div className="card p-6 bg-gradient-to-br from-[#0f172a] to-[#185FA5] text-white">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={24} className="text-white/80" />
            <h1 className="text-lg font-bold">Sicherheit bei SMARTLAW</h1>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Der Schutz mandantenrelevanter Daten hat höchste Priorität. Alle Daten werden nach Schweizer und europäischen Datenschutzstandards verarbeitet und gespeichert.
          </p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">ISO 27001</span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Swiss Hosted</span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">DSGVO-konform</span>
          </div>
        </div>

        {/* Measures grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {measures.map(({ icon: Icon, title, items }) => (
            <div key={title} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon size={16} className="text-[#185FA5]" />
                </div>
                <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
              </div>
              <ul className="space-y-1.5">
                {items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Reporting */}
        <div className="card p-5 border-amber-200 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="font-semibold text-amber-800 text-sm">Sicherheitslücke melden</h2>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            Wenn Sie eine Sicherheitslücke entdecken, melden Sie diese bitte vertraulich an <strong>security@smartlaw.ch</strong>. Wir bestätigen den Eingang innerhalb von 24 Stunden und beheben kritische Lücken innerhalb von 72 Stunden.
          </p>
        </div>
      </div>
    </Layout>
  );
}
