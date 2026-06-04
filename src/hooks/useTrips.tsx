import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trip, Transport, Gastro, Attraction, Activity } from '../types';
import { storage } from '../services/storage';

interface TripsContextType {
  trips: Trip[];
  loading: boolean;
  refreshTrips: () => Promise<void>;
  getTrip: (id: string) => Trip | undefined;
  createTrip: (tripData: Omit<Trip, 'id' | 'transports' | 'gastronomies' | 'attractions' | 'activities'>) => Promise<Trip>;
  updateTrip: (id: string, tripData: Partial<Omit<Trip, 'id' | 'transports' | 'gastronomies' | 'attractions' | 'activities'>>) => Promise<Trip | null>;
  deleteTrip: (id: string) => Promise<void>;
  
  // Sub-itens
  addTransport: (tripId: string, transport: Omit<Transport, 'id' | 'tripId'>) => Promise<Transport | null>;
  deleteTransport: (tripId: string, transportId: string) => Promise<void>;
  addGastro: (tripId: string, gastro: Omit<Gastro, 'id' | 'tripId'>) => Promise<Gastro | null>;
  deleteGastro: (tripId: string, gastroId: string) => Promise<void>;
  addAttraction: (tripId: string, attraction: Omit<Attraction, 'id' | 'tripId'>) => Promise<Attraction | null>;
  deleteAttraction: (tripId: string, attractionId: string) => Promise<void>;
  addActivity: (tripId: string, activity: Omit<Activity, 'id' | 'tripId'>) => Promise<Activity | null>;
  deleteActivity: (tripId: string, activityId: string) => Promise<void>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const TripsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshTrips = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const data = await storage.getTrips();
      setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    storage.getTrips().then((data) => {
      if (active) {
        setTrips(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const getTrip = useCallback((id: string) => {
    return trips.find(t => t.id === id);
  }, [trips]);

  const createTrip = async (tripData: Omit<Trip, 'id' | 'transports' | 'gastronomies' | 'attractions' | 'activities'>) => {
    const newTrip = await storage.createTrip(tripData);
    await refreshTrips();
    return newTrip;
  };

  const updateTrip = async (id: string, tripData: Partial<Omit<Trip, 'id' | 'transports' | 'gastronomies' | 'attractions' | 'activities'>>) => {
    const updated = await storage.updateTrip(id, tripData);
    await refreshTrips();
    return updated;
  };

  const deleteTrip = async (id: string) => {
    await storage.deleteTrip(id);
    await refreshTrips();
  };

  const addTransport = async (tripId: string, transport: Omit<Transport, 'id' | 'tripId'>) => {
    const item = await storage.addTransport(tripId, transport);
    await refreshTrips();
    return item;
  };

  const deleteTransport = async (tripId: string, transportId: string) => {
    await storage.deleteTransport(tripId, transportId);
    await refreshTrips();
  };

  const addGastro = async (tripId: string, gastro: Omit<Gastro, 'id' | 'tripId'>) => {
    const item = await storage.addGastro(tripId, gastro);
    await refreshTrips();
    return item;
  };

  const deleteGastro = async (tripId: string, gastroId: string) => {
    await storage.deleteGastro(tripId, gastroId);
    await refreshTrips();
  };

  const addAttraction = async (tripId: string, attraction: Omit<Attraction, 'id' | 'tripId'>) => {
    const item = await storage.addAttraction(tripId, attraction);
    await refreshTrips();
    return item;
  };

  const deleteAttraction = async (tripId: string, attractionId: string) => {
    await storage.deleteAttraction(tripId, attractionId);
    await refreshTrips();
  };

  const addActivity = async (tripId: string, activity: Omit<Activity, 'id' | 'tripId'>) => {
    const item = await storage.addActivity(tripId, activity);
    await refreshTrips();
    return item;
  };

  const deleteActivity = async (tripId: string, activityId: string) => {
    await storage.deleteActivity(tripId, activityId);
    await refreshTrips();
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        loading,
        refreshTrips,
        getTrip,
        createTrip,
        updateTrip,
        deleteTrip,
        addTransport,
        deleteTransport,
        addGastro,
        deleteGastro,
        addAttraction,
        deleteAttraction,
        addActivity,
        deleteActivity,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTrips deve ser usado dentro de um TripsProvider');
  }
  return context;
};
