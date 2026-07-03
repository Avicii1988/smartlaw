import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, CheckSquare, Clock, FileText,
  User, Calendar, AlertTriangle, CheckCircle, Circle, Edit2, Trash2, Bot
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import {
  formatDate, formatHours, formatCHF,
  dossierStatusColor, dossierStatusLabel,
  rechtsgebietLabel, rechtsgebietColor,
  taskStatusLabel, taskStatusColor,
  signaturStatusLabel, signaturStatusColor,
  isDossierOverdue, isDossierSoon
} from '../lib/utils';

function TaskForm({ dossierId, users, initial, onSubmit, onCancel }: any) {
  const [form, setForm] = useState({
    titel: initial?.titel || '',
    beschreibung: initial?.beschreibung || '',
    status: initial?.status || 'OFFEN',
    faellig: initial?.faellig ? initial.faellig.slice(0, 10) : '',
    assigneeId: initial?.assigneeId || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Titel *</label>
        <input required className="input" value={form.titel} onChange={e => set('titel', e.target.value)} />
      </div>
      <div>
        <label className="label">Beschreibung</label>
        <textarea className="input" rows={2} value={form.beschreibung} onChange={e => set('beschreibung', e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="OFFEN">Offen</option>
            <option value="IN_BEARBEITUNG">In Bearbeitung</option>
            <option value="ERLEDIGT">Erledigt</option>
          </select>
        </div>
        <div>
          <label className="label">Fällig</label>
          <input type="date" className="input" value={form.faellig} onChange={e => set('faellig', e.target.value)} />
        </div>
        <div>
          <label className="label">Zuständig</label>
          <select className="input" value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)}>
            <option value="">–</option>
            {users?.map((u: any) => <option key={u.id} value={u.id}>{u.vorname} {u.nachname}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Speichern</button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Abbrechen</button>
      </div>
    </form>
  );
}

export function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [taskModal, setTaskModal] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const qc = useQueryClient();

  const { data: dossier, isLoading } = useQuery({
    queryKey: ['dossier', id],
    queryFn: () => api.get(`/dossiers/${id}`).then(r => r.data),
  });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/dashboard/users').then(r => r.data) });

  const createTask = useMutation({
    mutationFn: (d: any) => api.post(`/dossiers/${id}/tasks`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dossier', id] }); setTaskModal(false); },
  });
  const updateTask = useMutation({
    mutationFn: ({ taskId, ...d }: any) => api.put(`/dossiers/${id}/tasks/${taskId}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dossier', id] }); setEditTask(null); },
  });
  const deleteTask = useMutation({
    mutationFn: (taskId: string) => api.delete(`/dossiers/${id}/tasks/${taskId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dossier', id] }),
  });

  if (isLoading) return <Layout><Topbar title="Dossier" /><LoadingSpinner /></Layout>;
  if (!dossier) return <Layout><Topbar title="Nicht gefunden" /><p className="p-6 text-gray-500">Dossier nicht gefunden.</p></Layout>;

  const overdue = dossier.frist && isDossierOverdue(dossier.frist) && dossier.status !== 'ABGESCHLOSSEN';
  const soon = dossier.frist && isDossierSoon(dossier.frist) && !isDossierOverdue(dossier.frist) && dossier.status !== 'ABGESCHLOSSEN';

  const totalTime = dossier.timeEntries?.reduce((s: number, e: any) => s + e.dauer, 0) || 0;
  const billableTime = dossier.timeEntries?.filter((e: any) => e.verrechenbar).reduce((s: number, e: any) => s + e.dauer, 0) || 0;

  return (
    <Layout>
      <Topbar title={dossier.titel} subtitle={`${dossier.client?.vorname} ${dossier.client?.nachname}`} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dossiers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} /> Dossiers
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-medium truncate">{dossier.titel}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: info */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={rechtsgebietColor[dossier.rechtsgebiet as keyof typeof rechtsgebietColor]}>
                  {rechtsgebietLabel[dossier.rechtsgebiet as keyof typeof rechtsgebietLabel]}
                </Badge>
                <Badge className={dossierStatusColor[dossier.status as keyof typeof dossierStatusColor]}>
                  {dossierStatusLabel[dossier.status as keyof typeof dossierStatusLabel]}
                </Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User size={15} className="text-gray-400" />
                  <Link to={`/mandanten/${dossier.clientId}`} className="text-[#185FA5] hover:underline">
                    {dossier.client?.vorname} {dossier.client?.nachname}
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <User size={15} className="text-gray-400" />
                  <span className="text-gray-700">{dossier.anwalt?.vorname} {dossier.anwalt?.nachname}</span>
                </div>
                {dossier.frist && (
                  <div className={`flex items-center gap-3 ${overdue ? 'text-red-600 font-medium' : soon ? 'text-amber-600 font-medium' : 'text-gray-700'}`}>
                    <Calendar size={15} className="flex-shrink-0" />
                    <span>Frist: {formatDate(dossier.frist)}</span>
                    {overdue && <AlertTriangle size={14} />}
                  </div>
                )}
              </div>
              {dossier.notizen && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notizen</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{dossier.notizen}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="card p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Erfasste Stunden</p>
                <p className="text-lg font-bold text-gray-900">{formatHours(totalTime)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Verrechenbar</p>
                <p className="text-lg font-bold text-[#185FA5]">{formatHours(billableTime)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Dokumente</p>
                <p className="text-lg font-bold text-gray-900">{dossier._count?.documents ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Aufgaben</p>
                <p className="text-lg font-bold text-gray-900">{dossier.tasks?.filter((t: any) => t.status !== 'ERLEDIGT').length ?? 0} offen</p>
              </div>
            </div>

            {/* KI-Link */}
            <Link to={`/ki-assistent?dossierId=${dossier.id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bot size={18} className="text-[#185FA5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">KI-Assistent</p>
                <p className="text-xs text-gray-400">Schriftsätze, Recherche, Zusammenfassungen</p>
              </div>
            </Link>
          </div>

          {/* Right: tasks + time entries + docs */}
          <div className="xl:col-span-2 space-y-4">
            {/* Tasks */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <CheckSquare size={16} className="text-gray-400" /> Aufgaben
                </h3>
                <button onClick={() => setTaskModal(true)} className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                  <Plus size={13} /> Aufgabe
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {dossier.tasks?.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400 text-center">Keine Aufgaben</p>
                ) : dossier.tasks?.map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 group hover:bg-gray-50">
                    <button
                      onClick={() => updateTask.mutate({ taskId: t.id, status: t.status === 'ERLEDIGT' ? 'OFFEN' : 'ERLEDIGT' })}
                      className="text-gray-300 hover:text-green-500 transition-colors flex-shrink-0"
                    >
                      {t.status === 'ERLEDIGT' ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${t.status === 'ERLEDIGT' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.titel}</span>
                      {t.faellig && <span className="text-xs text-gray-400 ml-2">· {formatDate(t.faellig)}</span>}
                    </div>
                    <Badge className={taskStatusColor[t.status as keyof typeof taskStatusColor]}>{taskStatusLabel[t.status as keyof typeof taskStatusLabel]}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => setEditTask(t)} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 size={13} /></button>
                      <button onClick={() => deleteTask.mutate(t.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent time entries */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-gray-400" /> Letzte Leistungen
                </h3>
                <Link to={`/leistungen?dossierId=${dossier.id}`} className="text-xs text-[#185FA5] hover:underline">Alle</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {dossier.timeEntries?.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400 text-center">Keine Leistungen</p>
                ) : dossier.timeEntries?.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{e.taetigkeit}</p>
                      <p className="text-xs text-gray-400">{formatDate(e.datum)} · {e.user?.vorname} {e.user?.nachname}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatHours(e.dauer)}</p>
                      <p className={`text-xs ${e.verrechenbar ? 'text-green-600' : 'text-gray-400'}`}>{e.verrechenbar ? 'verrechenbar' : 'intern'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-gray-400" /> Dokumente
                </h3>
                <Link to={`/dokumente?dossierId=${dossier.id}`} className="text-xs text-[#185FA5] hover:underline">Alle & Upload</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {dossier.documents?.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400 text-center">Keine Dokumente</p>
                ) : dossier.documents?.slice(0, 5).map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.typ} · {formatDate(doc.createdAt)}</p>
                    </div>
                    <Badge className={signaturStatusColor[doc.signaturStatus as keyof typeof signaturStatusColor]}>
                      {signaturStatusLabel[doc.signaturStatus as keyof typeof signaturStatusLabel]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="Neue Aufgabe">
        <TaskForm dossierId={id} users={users} onSubmit={(d: any) => createTask.mutate(d)} onCancel={() => setTaskModal(false)} />
      </Modal>
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Aufgabe bearbeiten">
        {editTask && <TaskForm dossierId={id} users={users} initial={editTask} onSubmit={(d: any) => updateTask.mutate({ taskId: editTask.id, ...d })} onCancel={() => setEditTask(null)} />}
      </Modal>
    </Layout>
  );
}
