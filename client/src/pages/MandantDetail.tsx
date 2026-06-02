import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Building2, Mail, Phone, MapPin, FolderOpen } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { formatDate, dossierStatusColor, dossierStatusLabel, rechtsgebietLabel, rechtsgebietColor } from '../lib/utils';

export function MandantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.get(`/clients/${id}`).then(r => r.data),
  });

  if (isLoading) return <Layout><Topbar title="Mandant" /><LoadingSpinner /></Layout>;
  if (!client) return <Layout><Topbar title="Nicht gefunden" /><p className="p-6 text-gray-500">Mandant nicht gefunden.</p></Layout>;

  return (
    <Layout>
      <Topbar title={`${client.vorname} ${client.nachname}`} subtitle={client.firma || 'Privatperson'} />
      <div className="p-6 space-y-6">
        <Link to="/mandanten" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Zurück zu Mandanten
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info card */}
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                {client.typ === 'FIRMA' ? <Building2 size={28} className="text-blue-600" /> : <User size={28} className="text-blue-600" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{client.vorname} {client.nachname}</h2>
                {client.firma && <p className="text-gray-500">{client.firma}</p>}
              </div>
            </div>
            <div className="space-y-3 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={15} className="text-gray-400" />
                <a href={`mailto:${client.email}`} className="text-[#185FA5] hover:underline">{client.email}</a>
              </div>
              {client.telefon && <div className="flex items-center gap-3 text-sm">
                <Phone size={15} className="text-gray-400" />
                <span className="text-gray-700">{client.telefon}</span>
              </div>}
              {client.ort && <div className="flex items-start gap-3 text-sm">
                <MapPin size={15} className="text-gray-400 mt-0.5" />
                <div className="text-gray-700">
                  {client.strasse && <div>{client.strasse}</div>}
                  {client.plz} {client.ort}
                  <div>{client.land}</div>
                </div>
              </div>}
            </div>
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-400">Mandant seit {formatDate(client.createdAt)}</p>
            </div>
          </div>

          {/* Dossiers */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FolderOpen size={17} className="text-gray-400" /> Dossiers ({client.dossiers?.length ?? 0})
              </h3>
              <Link to={`/dossiers?clientId=${client.id}`} className="text-sm text-[#185FA5] hover:underline">Alle</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {client.dossiers?.length === 0 ? (
                <p className="p-6 text-sm text-gray-400 text-center">Noch keine Dossiers vorhanden.</p>
              ) : client.dossiers?.map((d: any) => (
                <Link key={d.id} to={`/dossiers/${d.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{d.titel}</p>
                    <p className="text-xs text-gray-400">{d.anwalt?.vorname} {d.anwalt?.nachname} · {formatDate(d.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={rechtsgebietColor[d.rechtsgebiet as keyof typeof rechtsgebietColor]}>{rechtsgebietLabel[d.rechtsgebiet as keyof typeof rechtsgebietLabel]}</Badge>
                    <Badge className={dossierStatusColor[d.status as keyof typeof dossierStatusColor]}>{dossierStatusLabel[d.status as keyof typeof dossierStatusLabel]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
