import { Layout } from '../../components/layout/Layout';
import { Topbar } from '../../components/layout/Topbar';
import { Building2, Mail, Phone, Globe } from 'lucide-react';

export function ImpressumPage() {
  return (
    <Layout>
      <Topbar title="Impressum" subtitle="Angaben gemäss Schweizer Recht" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 size={20} className="text-[#185FA5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Impressum</h1>
              <p className="text-xs text-gray-500">Angaben zur Gesellschaft</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gesellschaft</h2>
              <p className="text-sm font-bold text-gray-900">SMARTLAW AG</p>
              <p className="text-sm text-gray-600">Kanzleimanagementsoftware</p>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adresse</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Bahnhofstrasse 1<br />
                8001 Zürich<br />
                Schweiz
              </p>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Handelsregister</h2>
              <p className="text-sm text-gray-700">Kanton Zürich · CHE-000.000.000</p>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kontakt</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail size={14} className="text-gray-400" />
                  <span>info@smartlaw.ch</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={14} className="text-gray-400" />
                  <span>+41 44 000 00 00</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Globe size={14} className="text-gray-400" />
                  <span>www.smartlaw.ch</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mehrwertsteuer</h2>
              <p className="text-sm text-gray-700">MWST-Nr. CHE-000.000.000 MWST</p>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Haftungsausschluss</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Die SMARTLAW AG übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen. Die KI-gestützten Funktionen ersetzen keine rechtliche Beratung durch einen zugelassenen Anwalt.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">© 2026 SMARTLAW AG · Alle Rechte vorbehalten</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
