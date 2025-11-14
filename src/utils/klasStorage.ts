// Gedeelde types en localStorage helpers voor Klasindeling en Groepjesmaker

export interface Leerling {
  id: number;
  naam: string;
  geslacht: 'm' | 'v';
  lastig: boolean;
  vooraan: boolean;
}

export interface OpgeslagenKlas {
  id: string;
  naam: string;
  leerlingen: Leerling[];
  timestamp: number;
  // Optionele velden voor klasindeling
  indeling?: (Leerling | null)[][];
  rijen?: number;
  kolommen?: number;
  geblokkeerd?: string[]; // Set wordt array voor opslag
}

const STORAGE_KEY = 'opgeslagen-klassen';

export const loadKlassen = (): OpgeslagenKlas[] => {
  try {
    const opgeslagen = localStorage.getItem(STORAGE_KEY);
    return opgeslagen ? JSON.parse(opgeslagen) : [];
  } catch (error) {
    console.error('Error loading klassen:', error);
    return [];
  }
};

export const saveKlassen = (klassen: OpgeslagenKlas[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(klassen));
  } catch (error) {
    console.error('Error saving klassen:', error);
  }
};

export const addKlas = (
  naam: string, 
  leerlingen: Leerling[], 
  indeling?: (Leerling | null)[][],
  rijen?: number,
  kolommen?: number,
  geblokkeerd?: Set<string>
): void => {
  const klassen = loadKlassen();
  
  // Zoek bestaande klas met dezelfde naam
  const bestaandeKlas = klassen.find(k => k.naam === naam);
  
  const nieuweKlas: OpgeslagenKlas = {
    id: bestaandeKlas?.id || Date.now().toString(),
    naam,
    leerlingen,
    timestamp: Date.now(),
    // Behoud bestaande indeling als er geen nieuwe wordt meegegeven
    indeling: indeling !== undefined ? indeling : bestaandeKlas?.indeling,
    rijen: rijen !== undefined ? rijen : bestaandeKlas?.rijen,
    kolommen: kolommen !== undefined ? kolommen : bestaandeKlas?.kolommen,
    geblokkeerd: geblokkeerd ? Array.from(geblokkeerd) : bestaandeKlas?.geblokkeerd,
  };
  
  // Verwijder oude klas met dezelfde naam als die bestaat
  const gefilterd = klassen.filter(k => k.naam !== naam);
  saveKlassen([...gefilterd, nieuweKlas]);
};

export const deleteKlas = (id: string): void => {
  const klassen = loadKlassen();
  saveKlassen(klassen.filter(k => k.id !== id));
};

export const getKlas = (id: string): OpgeslagenKlas | undefined => {
  const klassen = loadKlassen();
  return klassen.find(k => k.id === id);
};
