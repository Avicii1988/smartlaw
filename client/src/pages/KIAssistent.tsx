import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Send, Bot, User, Plus, Trash2, Lightbulb } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_PROMPTS = [
  'Fasse dieses Dossier zusammen',
  'Schlage nächste Schritte vor',
  'Erstelle einen Schriftsatz',
  'Welche Fristen sind zu beachten?',
  'Relevante Gesetzesartikel zum Rechtsgebiet',
];

export function KIAssistentPage() {
  const [searchParams] = useSearchParams();
  const initDossierId = searchParams.get('dossierId') || '';
  const [dossierId, setDossierId] = useState(initDossierId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: dossiers } = useQuery({ queryKey: ['dossiers'], queryFn: () => api.get('/dossiers').then(r => r.data) });
  const { data: dossier } = useQuery({
    queryKey: ['dossier', dossierId],
    queryFn: () => api.get(`/dossiers/${dossierId}`).then(r => r.data),
    enabled: !!dossierId,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startNewConversation = async () => {
    const { data } = await api.post('/ai/conversations', { dossierId: dossierId || undefined });
    setConversationId(data.id);
    setMessages([]);
  };

  useEffect(() => { startNewConversation(); }, []);

  const sendMessage = async (text = input) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('smartlaw_token')}`,
        },
        body: JSON.stringify({ messages: newMessages, dossierId: dossierId || undefined, conversationId }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullContent += data.text;
                setMessages(prev => prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: fullContent } : m
                ));
              }
              if (data.done) break;
            } catch {}
          }
        }
      }
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <Layout>
      <Topbar title="KI-Assistent" subtitle="Powered by Claude — Ihr digitaler Rechtsassistent" />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-100 bg-white flex flex-col p-4 gap-3">
          <button onClick={startNewConversation} className="btn-secondary flex items-center gap-2 w-full">
            <Plus size={15} /> Neues Gespräch
          </button>

          <div>
            <label className="label text-xs">Dossier-Kontext</label>
            <select className="input text-xs" value={dossierId} onChange={e => setDossierId(e.target.value)}>
              <option value="">Kein Kontext</option>
              {dossiers?.map((d: any) => <option key={d.id} value={d.id}>{d.titel}</option>)}
            </select>
          </div>

          {dossier && (
            <div className="bg-blue-50 rounded-xl p-3 text-xs space-y-1.5">
              <p className="font-semibold text-blue-800">Aktives Dossier</p>
              <p className="text-blue-700 font-medium">{dossier.titel}</p>
              <p className="text-blue-600">{dossier.client?.vorname} {dossier.client?.nachname}</p>
              <p className="text-blue-500">{dossier.rechtsgebiet}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Schnellzugriff</p>
            <div className="space-y-1">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="w-full text-left text-xs text-gray-600 hover:text-[#185FA5] hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                  <Lightbulb size={11} className="flex-shrink-0 text-amber-400" />
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Bot size={28} className="text-[#185FA5]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Wie kann ich Ihnen helfen?</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Ich bin Ihr KI-Rechtsassistent. Ich kann Schriftsätze verfassen, Dossiers zusammenfassen, Schweizer Rechtsfragen beantworten und nächste Schritte vorschlagen.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#185FA5] text-white rounded-tr-sm'
                      : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}
                      {msg.role === 'assistant' && streaming && idx === messages.length - 1 && msg.content === '' && (
                        <span className="inline-block w-2 h-4 bg-gray-400 cursor-blink ml-0.5 align-text-bottom" />
                      )}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht eingeben... (Enter zum Senden, Shift+Enter für Zeilenumbruch)"
                className="input flex-1 resize-none min-h-[44px] max-h-32"
                rows={1}
                disabled={streaming}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming}
                className="btn-primary p-2.5 flex-shrink-0 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              KI-generierter Inhalt. Keine Rechtsberatung. Immer durch Fachpersonen prüfen lassen.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
