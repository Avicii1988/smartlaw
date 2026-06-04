import { DossierStatus, InvoiceStatus, Rechtsgebiet, SignaturStatus, TaskStatus, ClientType, HonorarTyp } from '@smartlaw/shared';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '–';
  return format(new Date(date), 'dd.MM.yyyy', { locale: de });
}

export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '–';
  return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: de });
}

export function formatCHF(amount: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(amount);
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function isDossierOverdue(frist: string | undefined): boolean {
  if (!frist) return false;
  return isPast(new Date(frist));
}

export function isDossierSoon(frist: string | undefined): boolean {
  if (!frist) return false;
  const f = new Date(frist);
  return isWithinInterval(f, { start: new Date(), end: addDays(new Date(), 7) });
}

export const dossierStatusLabel: Record<DossierStatus, string> = {
  OFFEN: 'Offen',
  AKTIV: 'Aktiv',
  ABGESCHLOSSEN: 'Abgeschlossen',
};

export const dossierStatusColor: Record<DossierStatus, string> = {
  OFFEN: 'bg-amber-100 text-amber-800',
  AKTIV: 'bg-green-100 text-green-800',
  ABGESCHLOSSEN: 'bg-gray-100 text-gray-700',
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  ENTWURF: 'Entwurf',
  VERSENDET: 'Versendet',
  BEZAHLT: 'Bezahlt',
  UEBERFAELLIG: 'Überfällig',
};

export const invoiceStatusColor: Record<InvoiceStatus, string> = {
  ENTWURF: 'bg-gray-100 text-gray-700',
  VERSENDET: 'bg-blue-100 text-blue-800',
  BEZAHLT: 'bg-green-100 text-green-800',
  UEBERFAELLIG: 'bg-red-100 text-red-800',
};

export const signaturStatusLabel: Record<SignaturStatus, string> = {
  AUSSTEHEND: 'Ausstehend',
  UNTERZEICHNET: 'Unterzeichnet',
  ABGELEHNT: 'Abgelehnt',
};

export const signaturStatusColor: Record<SignaturStatus, string> = {
  AUSSTEHEND: 'bg-amber-100 text-amber-800',
  UNTERZEICHNET: 'bg-green-100 text-green-800',
  ABGELEHNT: 'bg-red-100 text-red-800',
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  OFFEN: 'Offen',
  IN_BEARBEITUNG: 'In Bearbeitung',
  ERLEDIGT: 'Erledigt',
};

export const taskStatusColor: Record<TaskStatus, string> = {
  OFFEN: 'bg-gray-100 text-gray-700',
  IN_BEARBEITUNG: 'bg-blue-100 text-blue-800',
  ERLEDIGT: 'bg-green-100 text-green-800',
};

export const rechtsgebietLabel: Record<Rechtsgebiet, string> = {
  FAMILIENRECHT: 'Familienrecht',
  ERBRECHT: 'Erbrecht',
  ARBEITSRECHT: 'Arbeitsrecht',
  MIETRECHT: 'Mietrecht',
  VERTRAGSRECHT: 'Vertragsrecht',
  STRAFRECHT: 'Strafrecht',
  GESELLSCHAFTSRECHT: 'Gesellschaftsrecht',
  IMMOBILIENRECHT: 'Immobilienrecht',
};

export const rechtsgebietColor: Record<Rechtsgebiet, string> = {
  FAMILIENRECHT: 'bg-pink-100 text-pink-800',
  ERBRECHT: 'bg-purple-100 text-purple-800',
  ARBEITSRECHT: 'bg-orange-100 text-orange-800',
  MIETRECHT: 'bg-teal-100 text-teal-800',
  VERTRAGSRECHT: 'bg-blue-100 text-blue-800',
  STRAFRECHT: 'bg-red-100 text-red-800',
  GESELLSCHAFTSRECHT: 'bg-indigo-100 text-indigo-800',
  IMMOBILIENRECHT: 'bg-green-100 text-green-800',
};

export const clientTypeLabel: Record<ClientType, string> = {
  PRIVAT: 'Privatperson',
  FIRMA: 'Unternehmen',
};

export const honorarTypLabel: Record<HonorarTyp, string> = {
  PAUSCHAL: 'Pauschalhonorar',
  STUNDENBASIS: 'Stundenbasis',
  ERFOLGSHONORAR: 'Erfolgshonorar',
};
