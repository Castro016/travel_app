export interface Transport {
  id: string;
  tripId: string;
  type: 'avião' | 'ônibus' | 'trem' | 'carro' | 'metrô' | 'outro';
  date: string; // ISO Date YYYY-MM-DD
  time: string; // HH:MM
  origin: string;
  destination: string;
  company?: string;
  reservationNumber?: string;
  confirmationCode?: string;
  seat?: string;
  terminal?: string;
  gate?: string;
  notes?: string;
}

export interface Gastro {
  id: string;
  tripId: string;
  name: string;
  type: 'café' | 'restaurante' | 'bar' | 'outro';
  date: string; // ISO Date YYYY-MM-DD
  time?: string; // HH:MM
  address?: string;
  reservationInfo?: string;
  notes?: string;
}

export interface Attraction {
  id: string;
  tripId: string;
  name: string;
  date: string; // ISO Date YYYY-MM-DD
  time?: string; // HH:MM
  address?: string;
  ticketPrice?: string;
  ticketBought: boolean;
  notes?: string;
}

export interface Activity {
  id: string;
  tripId: string;
  name: string;
  date: string; // ISO Date YYYY-MM-DD
  time: string; // HH:MM
  description?: string;
  address?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string; // ISO Date YYYY-MM-DD
  coverGradient: [string, string]; // Cores Hex para gradientes
  description?: string;
  transports: Transport[];
  gastronomies: Gastro[];
  attractions: Attraction[];
  activities: Activity[];
}

// Tipo unificado para itens do roteiro (timeline)
export interface ItineraryItem {
  id: string;
  type: 'transport' | 'gastro' | 'attraction' | 'activity';
  title: string;
  time: string; // HH:MM para ordenação
  subtitle: string;
  details: string[]; // Informações extras dependendo do tipo
  rawItem: Transport | Gastro | Attraction | Activity; // Referência ao item original
}
