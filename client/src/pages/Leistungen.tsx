import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Clock, Play, Pause, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import api from '../lib/api';
import { formatDate, formatHours, formatCHF } from '../lib/utils';
import { useAuthStore } from '../store/auth';

function TimeEntryForm({ initial, dossiers, onSubmit, onCancel, defaultStundenansatz }: any) {
  const [form, setForm] = useState({
    datum: initial?.datum ? initial.datum.slice(0, 10) : new Date().toISOString().slice(0, 10),
    taetigkeit: initial?.taetigkeit || '',
    dauer: initial?.dauer || 1,
    stundenansatz: initial?.stundenansatz || defaultStundenansatz || 250,
    verrechenbar: initial?.verrechenbar ?? true,
    dossierId: initial?.dossierId || '',
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Dossier *</label>
        <select required className="input" value={form.dossierId} onChange={e => set('dossierId', e.target.value)}>
          <option value="">Dossier wählen...</option>
          {dossiers?.map((d: any) => <option key={d.id} value={d.id}>{d.titel} ({d.client?.vorname} {d.client?.nachname})</option>)}
        </select>
      </div>
      <div>
        <label className="label">Tätigkeit *</label>
        <input required className="input" value={form.taetigkeit} onChange={e => set('taetigkeit', e.target.value)} placeholder="z.B. Mandantengespräch" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Datum *</label>
          <input required type="date" className="input" value={form.datum} onChange={e => set('datum', e.target.value)} />
        </div>
        <div>
          <label className="label">Dauer (h) *</label>
          <input required type="number" step="0.25" min="0.25" className="input" value={form.dauer} onChange={e => set('dauer', parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="label">Ansatz (CHF/h)</label>
          <input type="number" className="input" value={form.stundenansatz} onChange={e => set('stundenansatz', parseFloat(e.target.value))} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="verrechenbar" className="rounded" checked={form.verrechenbar} onChange={e => set('verrechenbar', e.target.checked)} />
        <label htmlFor="verrechenbar" className="text-sm text-gray-700 font-medium">Verrechenbar</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Speichern</button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Abbrechen</button>
      </div>
    </form>
  );
}

export function LeistungenPage() {
  const [searchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [filterDate, setFilterDate] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const params: any = {};
  if (filterDate) params.datum = filterDate;
  if (searchParams.get('dossierId')) params.dossierId = searchParams.get('dossierId');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['time-entries', params],
    queryFn: () => api.get('/time-entries', { params }).then(r => r.data),
  });
  const { data: dossiers } = useQuery({
    queryKey: ['dossiers'],
    queryFn: () => api.get('/dossiers').then(r => r.data),
  });

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/time-entries', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-entries'] }); setModalOpen(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/time-entries/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['time-entries'] }); setEditEntry(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/time-entries/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time-entries'] }),
  });

  const totalHours = entries?.reduce((s: number, e: any) => s + e.dauer, 0) || 0;
  const billableHours = entries?.filter((e: any) => e.verrechenbar).reduce((s: number, e: any) => s + e.dauer, 0) || 0;
  const totalCHF = entries?.filter((e: any) => e.verrechenbar).reduce((s: number, e: any) => s + e.dauer * e.stundenansatz, 0) || 0;

  return (
    <Layout>
      <Topbar title="Leistungserfassung" subtitle="Zeit erfassen und verwalten" />
      <div className="p-6 space-y-6">
        {/* Timer card */}
        <div className="card p-5 flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-gray-900">{formatTimer(timer)}</div>
            <div className="text-xs text-gray-400 mt-1">Stoppuhr</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimerRunning(r => !r)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${timerRunning ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              {timerRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
            </button>
            <button onClick={() => { setTimer(0); setTimerRunning(false); }} className="btn-secondary">Reset</button>
          </div>
          {timer > 60 && (
            <button
              onClick={() => {
                setTimerRunning(false);
                setModalOpen(true);
              }}
              className="btn-primary ml-auto flex items-center gap-2"
            >
              <Plus size={16} /> Zeit erfassen ({formatTimer(timer)})
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{formatHours(totalHours)}</p>
            <p className="text-xs text-gray-400 mt-1">Total Stunden</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-[#185FA5]">{formatHours(billableHours)}</p>
            <p className="text-xs text-gray-400 mt-1">Verrechenbar</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCHF(totalCHF)}</p>
            <p className="text-xs text-gray-400 mt-1">Honorar total</p>
          </div>
        </div>

        {/* Filters + Actions */}
        <div className="flex items-center gap-3">
          <input type="date" className="input w-auto" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <button onClick={() => setFilterDate('')} className="text-sm text-gray-400 hover:text-gray-600">Zurücksetzen</button>
          <div className="flex-1" />
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Leistung erfassen
          </button>
        </div>

        {/* Entries */}
        {isLoading ? <LoadingSpinner /> : entries?.length === 0 ? (
          <EmptyState icon={Clock} title="Keine Leistungen" description="Erfassen Sie Ihre erste Leistung." action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">Leistung erfassen</button>
          } />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tätigkeit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dossier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dauer</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Honorar</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Verr.</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries?.map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(e.datum)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{e.taetigkeit}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{e.dossier?.titel}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatHours(e.dauer)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{e.verrechenbar ? formatCHF(e.dauer * e.stundenansatz) : '–'}</td>
                    <td className="px-4 py-3 text-center">
                      {e.verrechenbar ? <CheckCircle size={15} className="text-green-500 inline" /> : <XCircle size={15} className="text-gray-300 inline" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => setEditEntry(e)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Edit2 size={13} /></button>
                        <button onClick={() => deleteMut.mutate(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Leistung erfassen">
        <TimeEntryForm
          dossiers={dossiers}
          defaultStundenansatz={user?.stundenansatz}
          onSubmit={(d: any) => createMut.mutate(d)}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
      <Modal isOpen={!!editEntry} onClose={() => setEditEntry(null)} title="Leistung bearbeiten">
        {editEntry && <TimeEntryForm
          initial={editEntry}
          dossiers={dossiers}
          defaultStundenansatz={user?.stundenansatz}
          onSubmit={(d: any) => updateMut.mutate({ id: editEntry.id, ...d })}
          onCancel={() => setEditEntry(null)}
        />}
      </Modal>
    </Layout>
  );
}
