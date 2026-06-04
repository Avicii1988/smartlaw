import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Building2, Phone, Mail, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import api from '../lib/api';
import { ClientDto, ClientType } from '@smartlaw/shared';
import { clientTypeLabel } from '../lib/utils';

function ClientForm({ initial, onSubmit, onCancel }: {
  initial?: Partial<ClientDto>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    vorname: initial?.vorname || '',
    nachname: initial?.nachname || '',
    firma: initial?.firma || '',
    typ: initial?.typ || 'PRIVAT',
    email: initial?.email || '',
    telefon: initial?.telefon || '',
    strasse: initial?.strasse || '',
    plz: initial?.plz || '',
    ort: initial?.ort || '',
    land: initial?.land || 'Schweiz',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Typ</label>
          <select className="input" value={form.typ} onChange={e => set('typ', e.target.value)}>
            <option value="PRIVAT">Privatperson</option>
            <option value="FIRMA">Unternehmen</option>
          </select>
        </div>
        {form.typ === 'FIRMA' && (
          <div>
            <label className="label">Firma</label>
            <input className="input" value={form.firma} onChange={e => set('firma', e.target.value)} placeholder="Muster AG" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Vorname *</label>
          <input required className="input" value={form.vorname} onChange={e => set('vorname', e.target.value)} />
        </div>
        <div>
          <label className="label">Nachname *</label>
          <input required className="input" value={form.nachname} onChange={e => set('nachname', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">E-Mail *</label>
          <input required type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={form.telefon} onChange={e => set('telefon', e.target.value)} placeholder="+41 79 123 45 67" />
        </div>
      </div>
      <div>
        <label className="label">Strasse</label>
        <input className="input" value={form.strasse} onChange={e => set('strasse', e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">PLZ</label>
          <input className="input" value={form.plz} onChange={e => set('plz', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">Ort</label>
          <input className="input" value={form.ort} onChange={e => set('ort', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Speichern</button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Abbrechen</button>
      </div>
    </form>
  );
}

export function MandantenPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientDto | null>(null);
  const qc = useQueryClient();

  const { data: clients, isLoading } = useQuery<ClientDto[]>({
    queryKey: ['clients', search],
    queryFn: () => api.get('/clients', { params: { search: search || undefined } }).then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/clients', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setModalOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/clients/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setEditClient(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  return (
    <Layout>
      <Topbar title="Mandanten" subtitle={`${clients?.length ?? 0} Mandanten`} />
      <div className="p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Mandanten suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Neuer Mandant
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : clients?.length === 0 ? (
          <EmptyState icon={User} title="Keine Mandanten" description="Erstellen Sie den ersten Mandanten." action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">Mandant erstellen</button>
          } />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients?.map(client => (
              <div key={client.id} className="card p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${client.typ === 'FIRMA' ? 'bg-indigo-50' : 'bg-blue-50'}`}>
                      {client.typ === 'FIRMA' ? <Building2 size={18} className="text-indigo-600" /> : <User size={18} className="text-blue-600" />}
                    </div>
                    <div>
                      <Link to={`/mandanten/${client.id}`} className="font-semibold text-gray-900 hover:text-[#185FA5] text-sm">
                        {client.vorname} {client.nachname}
                      </Link>
                      {client.firma && <p className="text-xs text-gray-400">{client.firma}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditClient(client)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { if (confirm('Mandant löschen?')) deleteMut.mutate(client.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={12} /> <span className="truncate">{client.email}</span>
                  </div>
                  {client.telefon && <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} /> {client.telefon}
                  </div>}
                  {client.ort && <div className="flex items-center gap-2 text-xs text-gray-500">
                    📍 {client.plz} {client.ort}
                  </div>}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <Badge className={client.typ === 'FIRMA' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'}>
                    {clientTypeLabel[client.typ as ClientType]}
                  </Badge>
                  <Link to={`/mandanten/${client.id}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#185FA5]">
                    <FolderOpen size={12} /> {(client as any)._count?.dossiers ?? 0} Dossiers
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Neuer Mandant">
        <ClientForm onSubmit={d => createMut.mutate(d)} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editClient} onClose={() => setEditClient(null)} title="Mandant bearbeiten">
        {editClient && (
          <ClientForm
            initial={editClient}
            onSubmit={d => updateMut.mutate({ id: editClient.id, ...d })}
            onCancel={() => setEditClient(null)}
          />
        )}
      </Modal>
    </Layout>
  );
}
