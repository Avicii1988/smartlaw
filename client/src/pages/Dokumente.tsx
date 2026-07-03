import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Upload, FileText, Download, Trash2, PenSquare } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import api from '../lib/api';
import { DocumentDto, SignaturStatus } from '@smartlaw/shared';
import { formatDate, signaturStatusLabel, signaturStatusColor } from '../lib/utils';

export function DokumentePage() {
  const [searchParams] = useSearchParams();
  const [signModal, setSignModal] = useState<DocumentDto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dossierId, setDossierId] = useState(searchParams.get('dossierId') || '');
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const params: any = {};
  if (dossierId) params.dossierId = dossierId;

  const { data: docs, isLoading } = useQuery<DocumentDto[]>({
    queryKey: ['documents', params],
    queryFn: () => api.get('/documents', { params }).then(r => r.data),
  });
  const { data: dossiers } = useQuery({ queryKey: ['dossiers'], queryFn: () => api.get('/dossiers').then(r => r.data) });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!dossierId) { alert('Bitte zuerst ein Dossier wählen.'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dossierId', dossierId);
    try {
      await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      qc.invalidateQueries({ queryKey: ['documents'] });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const sigMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SignaturStatus }) => api.put(`/documents/${id}/signature`, { signaturStatus: status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); setSignModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Layout>
      <Topbar title="Dokumente" subtitle="Dokumente und E-Signatur" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <select className="input w-64" value={dossierId} onChange={e => setDossierId(e.target.value)}>
            <option value="">Alle Dossiers</option>
            {dossiers?.map((d: any) => <option key={d.id} value={d.id}>{d.titel}</option>)}
          </select>
          <div className="flex-1" />
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={16} /> {uploading ? 'Wird hochgeladen...' : 'Dokument hochladen'}
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : docs?.length === 0 ? (
          <EmptyState icon={FileText} title="Keine Dokumente"
            description="Laden Sie das erste Dokument hoch."
            action={<button onClick={() => fileRef.current?.click()} className="btn-primary">Hochladen</button>}
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Typ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dossier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grösse</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Signatur</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs?.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge className="bg-gray-100 text-gray-600">{doc.typ}</Badge></td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]">{(doc as any).dossier?.titel || '–'}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatSize(doc.groesse)}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSignModal(doc)} className="hover:opacity-80 transition-opacity">
                        <Badge className={signaturStatusColor[doc.signaturStatus]}>
                          {signaturStatusLabel[doc.signaturStatus]}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 justify-end">
                        <a href={`/api/documents/${doc.id}/download`} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" target="_blank">
                          <Download size={13} />
                        </a>
                        <button onClick={() => deleteMut.mutate(doc.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
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

      <Modal isOpen={!!signModal} onClose={() => setSignModal(null)} title="E-Signatur Status" size="sm">
        {signModal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Signatur-Status für: <span className="font-medium">{signModal.name}</span></p>
            <div className="current-status flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <PenSquare size={15} className="text-gray-400" />
              <span className="text-sm">Aktuell: </span>
              <Badge className={signaturStatusColor[signModal.signaturStatus]}>{signaturStatusLabel[signModal.signaturStatus]}</Badge>
            </div>
            <div className="space-y-2">
              {(['AUSSTEHEND', 'UNTERZEICHNET', 'ABGELEHNT'] as SignaturStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => sigMut.mutate({ id: signModal.id, status: s })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left text-sm ${
                    signModal.signaturStatus === s ? 'border-[#185FA5] bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Badge className={signaturStatusColor[s]}>{signaturStatusLabel[s]}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
