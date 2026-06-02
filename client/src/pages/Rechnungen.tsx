import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Trash2, Download, CheckCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import api from '../lib/api';
import { InvoiceDto, InvoiceStatus } from '@lexflow/shared';
import { formatDate, formatCHF, invoiceStatusLabel, invoiceStatusColor } from '../lib/utils';

function InvoiceForm({ dossiers, onSubmit, onCancel }: any) {
  const [dossierId, setDossierId] = useState('');
  const [faellig, setFaellig] = useState('');
  const [items, setItems] = useState([{ beschreibung: '', menge: 1, einheit: 'h', einzelpreis: 250, total: 250 }]);

  const addItem = () => setItems(i => [...i, { beschreibung: '', menge: 1, einheit: 'h', einzelpreis: 250, total: 250 }]);
  const updateItem = (idx: number, k: string, v: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [k]: v };
      updated.total = updated.menge * updated.einzelpreis;
      return updated;
    }));
  };
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const dossier = dossiers?.find((d: any) => d.id === dossierId);
  const total = items.reduce((s, i) => s + i.total, 0);
  const mwst = total * 0.077;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier) return;
    onSubmit({ dossierId, clientId: dossier.clientId, faelligkeitsdatum: faellig, items, mwst: 7.7 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Dossier *</label>
          <select required className="input" value={dossierId} onChange={e => setDossierId(e.target.value)}>
            <option value="">Dossier wählen...</option>
            {dossiers?.map((d: any) => <option key={d.id} value={d.id}>{d.titel}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Fällig am *</label>
          <input required type="date" className="input" value={faellig} onChange={e => setFaellig(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Positionen</label>
          <button type="button" onClick={addItem} className="text-xs text-[#185FA5] hover:underline flex items-center gap-1"><Plus size={12} /> Position</button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
              <input className="input col-span-5" placeholder="Beschreibung" value={item.beschreibung} onChange={e => updateItem(idx, 'beschreibung', e.target.value)} />
              <input className="input col-span-2" type="number" step="0.5" placeholder="Menge" value={item.menge} onChange={e => updateItem(idx, 'menge', parseFloat(e.target.value))} />
              <input className="input col-span-2" type="number" placeholder="CHF/Einheit" value={item.einzelpreis} onChange={e => updateItem(idx, 'einzelpreis', parseFloat(e.target.value))} />
              <div className="col-span-2 flex items-center text-sm font-medium text-gray-700 pt-2">{formatCHF(item.total)}</div>
              <button type="button" onClick={() => removeItem(idx)} className="pt-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
        <div className="flex justify-between text-gray-600"><span>Netto</span><span>{formatCHF(total)}</span></div>
        <div className="flex justify-between text-gray-600"><span>MwSt 7.7%</span><span>{formatCHF(mwst)}</span></div>
        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200"><span>Total</span><span>{formatCHF(total + mwst)}</span></div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Rechnung erstellen</button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Abbrechen</button>
      </div>
    </form>
  );
}

export function RechnungenPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const qc = useQueryClient();

  const params: any = {};
  if (filterStatus) params.status = filterStatus;

  const { data: invoices, isLoading } = useQuery<InvoiceDto[]>({
    queryKey: ['invoices', params],
    queryFn: () => api.get('/invoices', { params }).then(r => r.data),
  });
  const { data: dossiers } = useQuery({ queryKey: ['dossiers'], queryFn: () => api.get('/dossiers').then(r => r.data) });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/invoices', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); setModalOpen(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/invoices/${id}`, d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const totalOpen = invoices?.filter(i => ['VERSENDET', 'UEBERFAELLIG'].includes(i.status)).reduce((s, i) => s + i.betrag, 0) || 0;

  return (
    <Layout>
      <Topbar title="Rechnungen" subtitle={`${invoices?.length ?? 0} Rechnungen`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {(['ENTWURF', 'VERSENDET', 'BEZAHLT', 'UEBERFAELLIG'] as InvoiceStatus[]).map(s => {
            const count = invoices?.filter(i => i.status === s).length || 0;
            return (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                className={`card p-4 text-left transition-all ${filterStatus === s ? 'ring-2 ring-[#185FA5]' : 'hover:shadow-md'}`}>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <Badge className={`${invoiceStatusColor[s]} mt-1`}>{invoiceStatusLabel[s]}</Badge>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Offene Honorare: <span className="font-semibold text-amber-600">{formatCHF(totalOpen)}</span></div>
          <div className="flex-1" />
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Rechnung erstellen</button>
        </div>

        {isLoading ? <LoadingSpinner /> : invoices?.length === 0 ? (
          <EmptyState icon={FileText} title="Keine Rechnungen" action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">Rechnung erstellen</button>
          } />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nummer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mandant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dossier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Betrag</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fällig</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices?.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{inv.nummer}</td>
                    <td className="px-4 py-3 text-gray-700">{(inv.client as any)?.vorname} {(inv.client as any)?.nachname}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[160px]">{(inv.dossier as any)?.titel}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCHF(inv.betrag * (1 + inv.mwst / 100))}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{formatDate(inv.faelligkeitsdatum)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={invoiceStatusColor[inv.status]}>{invoiceStatusLabel[inv.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 justify-end">
                        {inv.status === 'VERSENDET' && (
                          <button onClick={() => updateMut.mutate({ id: inv.id, status: 'BEZAHLT' })}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Als bezahlt markieren">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => deleteMut.mutate(inv.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Neue Rechnung" size="xl">
        <InvoiceForm dossiers={dossiers} onSubmit={(d: any) => createMut.mutate(d)} onCancel={() => setModalOpen(false)} />
      </Modal>
    </Layout>
  );
}
