import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Transport, Gastro, Attraction, Activity } from '../types';

const STORAGE_KEY = '@tripwise:trips';

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export const storage = {
  // Obter todas as viagens salvas
  async getTrips(): Promise<Trip[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao ler viagens do AsyncStorage:', error);
      return [];
    }
  },

  // Salvar a lista completa de viagens
  async saveTrips(trips: Trip[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Erro ao salvar viagens no AsyncStorage:', error);
    }
  },

  // Obter uma viagem específica por ID
  async getTripById(id: string): Promise<Trip | null> {
    const trips = await this.getTrips();
    return trips.find(t => t.id === id) || null;
  },

  // Criar uma nova viagem
  async createTrip(tripData: Omit<Trip, 'id' | 'transports' | 'gastronomies' | 'attractions' | 'activities'>): Promise<Trip> {
    const trips = await this.getTrips();
    const newTrip: Trip = {
      ...tripData,
      id: generateId(),
      transports: [],
      gastronomies: [],
      attractions: [],
      activities: []
    };
    
    trips.push(newTrip);
    await this.saveTrips(trips);
    return newTrip;
  },

  // Atualizar dados básicos de uma viagem
  async updateTrip(id: string, updatedData: Partial<Omit<Trip, 'id' | 'transports' | 'gastronomies' | 'attractions' | 'activities'>>): Promise<Trip | null> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === id);
    if (index === -1) return null;

    trips[index] = {
      ...trips[index],
      ...updatedData
    };
    
    await this.saveTrips(trips);
    return trips[index];
  },

  // Excluir uma viagem e todos os seus itens associados
  async deleteTrip(id: string): Promise<void> {
    const trips = await this.getTrips();
    const filteredTrips = trips.filter(t => t.id !== id);
    await this.saveTrips(filteredTrips);
  },

  /* --- MÉTODOS DE TRANSPORTE --- */

  async addTransport(tripId: string, transport: Omit<Transport, 'id' | 'tripId'>): Promise<Transport | null> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return null;

    const newTransport: Transport = {
      ...transport,
      id: generateId(),
      tripId
    };

    trips[index].transports.push(newTransport);
    await this.saveTrips(trips);
    return newTransport;
  },

  async deleteTransport(tripId: string, transportId: string): Promise<void> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return;

    trips[index].transports = trips[index].transports.filter(t => t.id !== transportId);
    await this.saveTrips(trips);
  },

  /* --- MÉTODOS DE GASTRONOMIA --- */

  async addGastro(tripId: string, gastro: Omit<Gastro, 'id' | 'tripId'>): Promise<Gastro | null> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return null;

    const newGastro: Gastro = {
      ...gastro,
      id: generateId(),
      tripId
    };

    trips[index].gastronomies.push(newGastro);
    await this.saveTrips(trips);
    return newGastro;
  },

  async deleteGastro(tripId: string, gastroId: string): Promise<void> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return;

    trips[index].gastronomies = trips[index].gastronomies.filter(g => g.id !== gastroId);
    await this.saveTrips(trips);
  },

  /* --- MÉTODOS DE PONTOS TURÍSTICOS --- */

  async addAttraction(tripId: string, attraction: Omit<Attraction, 'id' | 'tripId'>): Promise<Attraction | null> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return null;

    const newAttraction: Attraction = {
      ...attraction,
      id: generateId(),
      tripId
    };

    trips[index].attractions.push(newAttraction);
    await this.saveTrips(trips);
    return newAttraction;
  },

  async deleteAttraction(tripId: string, attractionId: string): Promise<void> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return;

    trips[index].attractions = trips[index].attractions.filter(a => a.id !== attractionId);
    await this.saveTrips(trips);
  },

  /* --- MÉTODOS DE ATIVIDADES MANUAIS --- */

  async addActivity(tripId: string, activity: Omit<Activity, 'id' | 'tripId'>): Promise<Activity | null> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return null;

    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      tripId
    };

    trips[index].activities.push(newActivity);
    await this.saveTrips(trips);
    return newActivity;
  },

  async deleteActivity(tripId: string, activityId: string): Promise<void> {
    const trips = await this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index === -1) return;

    trips[index].activities = trips[index].activities.filter(a => a.id !== activityId);
    await this.saveTrips(trips);
  }
};
