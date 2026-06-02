// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  ASSISTANT = 'ASSISTANT',
}

export enum ClientType {
  PRIVAT = 'PRIVAT',
  FIRMA = 'FIRMA',
}

export enum Rechtsgebiet {
  FAMILIENRECHT = 'FAMILIENRECHT',
  ERBRECHT = 'ERBRECHT',
  ARBEITSRECHT = 'ARBEITSRECHT',
  MIETRECHT = 'MIETRECHT',
  VERTRAGSRECHT = 'VERTRAGSRECHT',
  STRAFRECHT = 'STRAFRECHT',
  GESELLSCHAFTSRECHT = 'GESELLSCHAFTSRECHT',
  IMMOBILIENRECHT = 'IMMOBILIENRECHT',
}

export enum DossierStatus {
  OFFEN = 'OFFEN',
  AKTIV = 'AKTIV',
  ABGESCHLOSSEN = 'ABGESCHLOSSEN',
}

export enum InvoiceStatus {
  ENTWURF = 'ENTWURF',
  VERSENDET = 'VERSENDET',
  BEZAHLT = 'BEZAHLT',
  UEBERFAELLIG = 'UEBERFAELLIG',
}

export enum HonorarTyp {
  PAUSCHAL = 'PAUSCHAL',
  STUNDENBASIS = 'STUNDENBASIS',
  ERFOLGSHONORAR = 'ERFOLGSHONORAR',
}

export enum SignaturStatus {
  AUSSTEHEND = 'AUSSTEHEND',
  UNTERZEICHNET = 'UNTERZEICHNET',
  ABGELEHNT = 'ABGELEHNT',
}

export enum TaskStatus {
  OFFEN = 'OFFEN',
  IN_BEARBEITUNG = 'IN_BEARBEITUNG',
  ERLEDIGT = 'ERLEDIGT',
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  vorname: string;
  nachname: string;
  role: UserRole;
  stundenansatz: number;
}

// Client types
export interface ClientDto {
  id: string;
  vorname: string;
  nachname: string;
  firma?: string;
  typ: ClientType;
  email: string;
  telefon?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  land: string;
  createdAt: string;
  _count?: { dossiers: number };
}

export interface CreateClientDto {
  vorname: string;
  nachname: string;
  firma?: string;
  typ: ClientType;
  email: string;
  telefon?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  land?: string;
}

// Dossier types
export interface DossierDto {
  id: string;
  titel: string;
  rechtsgebiet: Rechtsgebiet;
  status: DossierStatus;
  frist?: string;
  notizen?: string;
  clientId: string;
  client?: ClientDto;
  anwaltId: string;
  anwalt?: UserDto;
  createdAt: string;
  updatedAt: string;
  tasks?: TaskDto[];
  _count?: { timeEntries: number; documents: number };
}

export interface CreateDossierDto {
  titel: string;
  rechtsgebiet: Rechtsgebiet;
  status?: DossierStatus;
  frist?: string;
  notizen?: string;
  clientId: string;
  anwaltId: string;
}

// Task types
export interface TaskDto {
  id: string;
  titel: string;
  beschreibung?: string;
  status: TaskStatus;
  faellig?: string;
  dossierId: string;
  assigneeId?: string;
  assignee?: UserDto;
}

export interface CreateTaskDto {
  titel: string;
  beschreibung?: string;
  status?: TaskStatus;
  faellig?: string;
  dossierId: string;
  assigneeId?: string;
}

// Time entry types
export interface TimeEntryDto {
  id: string;
  datum: string;
  taetigkeit: string;
  dauer: number;
  stundenansatz: number;
  verrechenbar: boolean;
  dossierId: string;
  dossier?: DossierDto;
  userId: string;
  user?: UserDto;
  createdAt: string;
}

export interface CreateTimeEntryDto {
  datum: string;
  taetigkeit: string;
  dauer: number;
  stundenansatz: number;
  verrechenbar: boolean;
  dossierId: string;
}

// Invoice types
export interface InvoiceDto {
  id: string;
  nummer: string;
  status: InvoiceStatus;
  ausstellungsdatum: string;
  faelligkeitsdatum: string;
  betrag: number;
  mwst: number;
  dossierId: string;
  dossier?: DossierDto;
  clientId: string;
  client?: ClientDto;
  items?: InvoiceItemDto[];
  createdAt: string;
}

export interface InvoiceItemDto {
  id: string;
  beschreibung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  total: number;
}

// Document types
export interface DocumentDto {
  id: string;
  name: string;
  typ: string;
  groesse: number;
  version: number;
  signaturStatus: SignaturStatus;
  dossierId: string;
  uploadedById: string;
  uploadedBy?: UserDto;
  createdAt: string;
  url: string;
}

// HonorarVereinbarung
export interface HonorarVereinbarungDto {
  id: string;
  typ: HonorarTyp;
  betrag?: number;
  stundenansatz?: number;
  dossierId: string;
}

// Legal Package types
export interface LegalPackageDto {
  id: string;
  name: string;
  rechtsgebiet: Rechtsgebiet;
  beschreibung: string;
  aktiv: boolean;
  templates?: PackageTemplateDto[];
}

export interface PackageTemplateDto {
  id: string;
  name: string;
  inhalt: string;
  typ: string;
  packageId: string;
}

// AI types
export interface AIMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIConversationDto {
  id: string;
  dossierId?: string;
  messages: AIMessageDto[];
  createdAt: string;
}

// Dashboard KPIs
export interface DashboardKPIs {
  aktiveDossiers: number;
  erfassteStunden: number;
  offeneHonorare: number;
  pendentSignaturen: number;
  recentDossiers: DossierDto[];
  todayTimeEntries: TimeEntryDto[];
}
