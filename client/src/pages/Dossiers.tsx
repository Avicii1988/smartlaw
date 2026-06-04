import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, FolderOpen, AlertTriangle, Edit2, Trash2, Calendar } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import api from '../lib/api';
import { DossierDto, Rechtsgebiet, DossierStatus } from '@smartlaw/shared';
import {
  formatDate, dossierStatusColor, dossierStatusLabel,
  rechtsgebietLabel, rechtsgebietColor,
  isDossierOverdue, isDossierSoon
} from '../lib/utils';

function DossierForm({ initial, clients, users, onSubmit, onCancel }: any) {
  const [form, setForm] = useState({
    titel: initial?.titel || '',
    rechtsgebiet: initial?.rechtsgebiet || 'FAMILIENRECHT',
    status: initial?.status || 'OFFEN',
    frist: initial?.frist ? initial.frist.slice(0, 10) : '',
    notizen: initial?.notizen || '',
    clientId: initial?.clientId || '',
    anwaltId: initial?.anwaltId || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Titel *</label>
        <input required className="input" value={form.titel} onChange={e => set('titel', e.target.value)} placeholder="z.B. Scheidungsverfahren Müller" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Rechtsgebiet *</label>
          <select required className="input" value={form.rechtsgebiet} onChange={e => set('rechtsgebiet', e.target.value)}>
            {Object.entries(rechtsgebietLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="OFFEN">Offen</option>
            <option value="AKTIV">Aktiv</option>
            <option value="ABGESCHLOSSEN">Abgeschlossen</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Mandant *</label>
          <select required className="input" value={form.clientId} onChange={e => set('clientId', e.target.value)}>
            <option value="">Mandant wählen...</option>
            {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.vorname} {c.nachname}{c.firma ? ` (${c.firma})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Zuständiger Anwalt *</label>
          <select required className="input" value={form.anwaltId} onChange={e => set('anwaltId', e.target.value)}>
            <option value="">Anwalt wählen...</option>
            {users?.map((u: any) => <option key={u.id} value={u.id}>{u.vorname} {u.nachname}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Frist</label>
        <input type="date" className="input" value={form.frist} onChange={e => set('frist', e.target.value)} />
      </div>
      <div>
        <label className="label">Notizen</label>
        <textarea className="input" rows={3} value={form.notizen} onChange={e => set('notizen', e.target.value)} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Speichern</button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Abbrechen</button>
      </div>
    </form>
  );
}

export function DossiersPage() {
  const [searchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDossier, setEditDossier] = useState<DossierDto | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRG, setFilterRG] = useState('');
  const qc = useQueryClient();

  const params: any = {};
  if (filterStatus) params.status = filterStatus;
  if (filterRG) params.rechtsgebiet = filterRG;
  if (searchParams.get('clientId')) params.clientId = searchParams.get('clientId');

  const { data: dossiers, isLoading } = useQuery<DossierDto[]>({
    queryKey: ['dossiers', params],
    queryFn: () => api.get('/dossiers', { params }).then(r => r.data),
  });
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: () => api.get('/clients').then(r => r.data) });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/dashboard/users').then(r => r.data) });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/dossiers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dossiers'] }); setModalOpen(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/dossiers/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dossiers'] }); setEditDossier(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/dossiers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dossiers'] }),
  });

  return (
    <Layout>
      <Topbar title="Dossiers" subtitle={`${dossiers?.length ?? 0} Dossiers`} />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Alle Status</option>
            {Object.entries(dossierStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input w-auto" value={filterRG} onChange={e => setFilterRG(e.target.value)}>
            <option value="">Alle Rechtsgebiete</option>
            {Object.entries(rechtsgebietLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="flex-1" />
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Neues Dossier
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : dossiers?.length === 0 ? (
          <EmptyState icon={FolderOpen} title="Keine Dossiers" description="Erstellen Sie das erste Dossier." action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">Dossier erstellen</button>
          } />
        ) : (
          <div className="space-y-2">
            {dossiers?.map(d => {
              const overdue = d.frist && isDossierOverdue(d.frist) && d.status !== 'ABGESCHLOSSEN';
              const soon = d.frist && isDossierSoon(d.frist) && !isDossierOverdue(d.frist) && d.status !== 'ABGESCHLOSSEN';
              return (
                <div key={d.id} className={`card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group ${overdue ? 'border-red-200 bg-red-50/30' : soon ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/dossiers/${d.id}`} className="font-semibold text-gray-900 hover:text-[#185FA5] text-sm truncate">
                        {d.titel}
                      </Link>
                      {overdue && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                      {soon && <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        {d.client?.vorname} {d.client?.nachname}{d.client?.firma ? ` · ${d.client.firma}` : ''}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{d.anwalt?.vorname} {d.anwalt?.nachname}</span>
                      {d.frist && (
                        <>
                          <span className="text-xs text-gray-400">·</span>
                          <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : soon ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                            <Calendar size={11} /> {formatDate(d.frist)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={rechtsgebietColor[d.rechtsgebiet]}>{rechtsgebietLabel[d.rechtsgebiet]}</Badge>
                    <Badge className={dossierStatusColor[d.status]}>{dossierStatusLabel[d.status]}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={() => setEditDossier(d)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => { if (confirm('Dossier löschen?')) deleteMut.mutate(d.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Neues Dossier" size="lg">
        <DossierForm clients={clients} users={users} onSubmit={d => createMut.mutate(d)} onCancel={() => setModalOpen(false)} />
      </Modal>
      <Modal isOpen={!!editDossier} onClose={() => setEditDossier(null)} title="Dossier bearbeiten" size="lg">
        {editDossier && <DossierForm initial={editDossier} clients={clients} users={users} onSubmit={d => updateMut.mutate({ id: editDossier.id, ...d })} onCancel={() => setEditDossier(null)} />}
      </Modal>
    </Layout>
  );
}
