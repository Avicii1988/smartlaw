import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, CheckCircle, XCircle, FileText, List, Zap } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { rechtsgebietLabel, rechtsgebietColor } from '../lib/utils';

export function PaketePage() {
  const qc = useQueryClient();
  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => api.get('/packages').then(r => r.data),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => api.put(`/packages/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
  });

  return (
    <Layout>
      <Topbar title="Rechtspakete" subtitle="Rechtsgebiet-spezifische Vorlagen und Checklisten" />
      <div className="p-4 md:p-6">
        {isLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {packages?.map((pkg: any) => (
              <div key={pkg.id} className={`card overflow-hidden ${pkg.aktiv ? 'ring-2 ring-[#185FA5]' : ''}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${pkg.aktiv ? 'bg-blue-600' : 'bg-gray-100'}`}>
                        <Package size={20} className={pkg.aktiv ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                        <Badge className={rechtsgebietColor[pkg.rechtsgebiet as keyof typeof rechtsgebietColor]}>
                          {rechtsgebietLabel[pkg.rechtsgebiet as keyof typeof rechtsgebietLabel]}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMut.mutate(pkg.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pkg.aktiv
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {pkg.aktiv ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {pkg.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{pkg.beschreibung}</p>

                  {/* Templates */}
                  {pkg.templates?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Enthaltene Vorlagen</p>
                      <div className="space-y-1.5">
                        {pkg.templates.map((t: any) => (
                          <div key={t.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg group">
                            {t.typ === 'Schriftsatz' ? <FileText size={13} className="text-blue-500 flex-shrink-0" /> :
                             t.typ === 'Checkliste' ? <List size={13} className="text-green-500 flex-shrink-0" /> :
                             <Zap size={13} className="text-amber-500 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-gray-700">{t.name}</span>
                            </div>
                            <Badge className={
                              t.typ === 'Schriftsatz' ? 'bg-blue-50 text-blue-700' :
                              t.typ === 'Checkliste' ? 'bg-green-50 text-green-700' :
                              'bg-amber-50 text-amber-700'
                            }>{t.typ}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {pkg.aktiv && (
                  <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
                    <p className="text-xs text-blue-700 flex items-center gap-1.5">
                      <CheckCircle size={12} />
                      Paket ist aktiv — Vorlagen stehen in Dossiers zur Verfügung
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
