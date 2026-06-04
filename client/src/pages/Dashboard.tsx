import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FolderOpen, Clock, Banknote, FileSignature,
  TrendingUp, AlertTriangle, Bot, ChevronRight
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { DashboardKPIs } from '@smartlaw/shared';
import {
  formatCHF, formatHours, formatDate,
  dossierStatusLabel, dossierStatusColor,
  rechtsgebietLabel, rechtsgebietColor,
  isDossierOverdue, isDossierSoon
} from '../lib/utils';

function KPICard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardKPIs>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard/kpis').then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: () => api.get('/ai/suggestions').then(r => r.data),
  });

  if (isLoading) return <Layout><Topbar title="Dashboard" /><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <Topbar title="Dashboard" subtitle={`Guten Morgen — ${new Date().toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard icon={FolderOpen} label="Aktive Dossiers" value={String(data?.aktiveDossiers ?? 0)} color="bg-blue-50 text-blue-600" />
          <KPICard icon={Clock} label="Stunden (Monat)" value={formatHours(data?.erfassteStunden ?? 0)} sub="erfasste Leistungen" color="bg-green-50 text-green-600" />
          <KPICard icon={Banknote} label="Offene Honorare" value={formatCHF(data?.offeneHonorare ?? 0)} sub="versendet + überfällig" color="bg-amber-50 text-amber-600" />
          <KPICard icon={FileSignature} label="Pend. Signaturen" value={String(data?.pendentSignaturen ?? 0)} sub="Dokumente ausstehend" color="bg-purple-50 text-purple-600" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Dossiers */}
          <div className="xl:col-span-2 card">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">Letzte Dossiers</h2>
              <Link to="/dossiers" className="text-sm text-[#185FA5] hover:underline flex items-center gap-1">
                Alle anzeigen <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {data?.recentDossiers?.map(d => (
                <Link key={d.id} to={`/dossiers/${d.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate group-hover:text-[#185FA5] text-sm">{d.titel}</p>
                      {d.frist && isDossierOverdue(d.frist) && d.status !== 'ABGESCHLOSSEN' && (
                        <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                      )}
                      {d.frist && isDossierSoon(d.frist) && !isDossierOverdue(d.frist) && d.status !== 'ABGESCHLOSSEN' && (
                        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.client?.vorname} {d.client?.nachname} {d.client?.firma ? `(${d.client.firma})` : ''} · {d.anwalt?.vorname} {d.anwalt?.nachname}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={rechtsgebietColor[d.rechtsgebiet]}>{rechtsgebietLabel[d.rechtsgebiet]}</Badge>
                    <Badge className={dossierStatusColor[d.status]}>{dossierStatusLabel[d.status]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Today's entries */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900 text-sm">Heute erfasst</h2>
                <Link to="/leistungen" className="text-xs text-[#185FA5] hover:underline">Alle</Link>
              </div>
              <div className="p-2">
                {data?.todayTimeEntries?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Noch keine Einträge heute</p>
                ) : (
                  data?.todayTimeEntries?.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{e.taetigkeit}</p>
                        <p className="text-xs text-gray-400">{e.dossier?.titel}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 ml-2">{formatHours(e.dauer)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="card">
              <div className="flex items-center gap-2 p-4 border-b border-gray-50">
                <Bot size={16} className="text-[#185FA5]" />
                <h2 className="font-semibold text-gray-900 text-sm">KI-Hinweise</h2>
              </div>
              <div className="p-3 space-y-2">
                {suggestions?.upcomingDeadlines?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-800 mb-1">⚠ Fristen in 7 Tagen</p>
                    {suggestions.upcomingDeadlines.map((d: any) => (
                      <p key={d.id} className="text-xs text-amber-700">{d.titel} — {formatDate(d.frist)}</p>
                    ))}
                  </div>
                )}
                {suggestions?.unbilledEntries > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-800">💡 {suggestions.unbilledEntries} verrechenbare Stunden noch nicht verrechnet</p>
                  </div>
                )}
                {(!suggestions?.upcomingDeadlines?.length && !suggestions?.unbilledEntries) && (
                  <p className="text-xs text-gray-400 text-center py-2">Keine dringenden Hinweise</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
