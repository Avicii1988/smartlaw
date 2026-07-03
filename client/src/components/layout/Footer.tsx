import { Scale, Mail, Phone, Globe, Shield, FileText, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#185FA5] rounded-lg flex items-center justify-center">
                <Scale size={15} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 tracking-wide text-sm">SMARTLAW</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Professionelle Kanzlei­management­software für Schweizer Anwaltskanzleien.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Produkt</h4>
            <ul className="space-y-2">
              {['Mandantenmanagement', 'Zeiterfassung', 'Dokumentenverwaltung', 'E-Signatur', 'KI-Assistent'].map(item => (
                <li key={item}>
                  <span className="text-xs text-gray-500 hover:text-[#185FA5] cursor-pointer transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Rechtliches</h4>
            <ul className="space-y-2">
              {[
                { icon: FileText, label: 'Datenschutz' },
                { icon: Shield, label: 'Sicherheit' },
                { icon: BookOpen, label: 'AGB' },
                { icon: FileText, label: 'Impressum' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-500 hover:text-[#185FA5] cursor-pointer transition-colors">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Kontakt</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-xs text-gray-500">
                <Mail size={11} className="text-gray-400 flex-shrink-0" />
                <span>support@smartlaw.ch</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-gray-500">
                <Phone size={11} className="text-gray-400 flex-shrink-0" />
                <span>+41 44 000 00 00</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-gray-500">
                <Globe size={11} className="text-gray-400 flex-shrink-0" />
                <span>www.smartlaw.ch</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <span className="inline-block text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">ISO 27001</span>
              <span className="inline-block text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Swiss Hosted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[11px] text-gray-400">
          © 2026 SMARTLAW AG · Alle Rechte vorbehalten · Schweizer Kanzleisoftware
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400">Version 1.0</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Alle Systeme betriebsbereit
          </span>
        </div>
      </div>
    </footer>
  );
}
