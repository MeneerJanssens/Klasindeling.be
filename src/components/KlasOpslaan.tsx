import { Save, FolderOpen, Trash2, ChevronDown } from 'lucide-react';
import { OpgeslagenKlas, loadKlassen, addKlas, deleteKlas, Leerling } from '../utils/klasStorage';
import { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';

interface KlasOpslagenProps {
  leerlingen: Leerling[];
  onLaadKlas: (klas: OpgeslagenKlas) => void;
  // Optioneel voor klasindeling
  indeling?: (Leerling | null)[][];
  rijen?: number;
  kolommen?: number;
  geblokkeerd?: Set<string>;
  onReset?: () => void;
}

export default function KlasOpslaan({ leerlingen, onLaadKlas, indeling, rijen, kolommen, geblokkeerd, onReset }: KlasOpslagenProps) {
  const [opgeslagenKlassen, setOpgeslagenKlassen] = useState<OpgeslagenKlas[]>([]);
  const [geselecteerdeKlas, setGeselecteerdeKlas] = useState<string>('');
  const [opslaanNaam, setOpslaanNaam] = useState<string>('');

  // Laad opgeslagen klassen bij opstarten
  useEffect(() => {
    setOpgeslagenKlassen(loadKlassen());
  }, []);

  const opslaanKlas = () => {
    if (!opslaanNaam.trim()) {
      alert('Geef een naam op voor de klas!');
      return;
    }

    if (leerlingen.length === 0) {
      alert('Voeg eerst leerlingen toe!');
      return;
    }

    addKlas(opslaanNaam, leerlingen, indeling, rijen, kolommen, geblokkeerd);
    setOpgeslagenKlassen(loadKlassen());
    alert(`Klas "${opslaanNaam}" opgeslagen!`);
    setOpslaanNaam('');
  };

  const laadKlas = (klasId: string): void => {
    const klassen = loadKlassen();
    const klas = klassen.find(k => k.id === klasId);
    if (klas) {
      onLaadKlas(klas);
      setOpslaanNaam(klas.naam); // Vul de klasnaam ook in het opslaan veld
    }
  };

  const verwijderKlas = (klasId: string): void => {
    if (confirm('Weet je zeker dat je deze klas wilt verwijderen?')) {
      deleteKlas(klasId);
      setOpgeslagenKlassen(loadKlassen());
      setGeselecteerdeKlas('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FolderOpen className="w-5 h-5" />
        Opgeslagen klassen
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Klas laden */}
        <div>
          <label htmlFor="klas-select" className="block text-sm font-medium text-gray-700 mb-2">
            Laad een klas:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Menu as="div" className="relative w-full sm:flex-1">
              <Menu.Button className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-left flex items-center justify-between">
                {geselecteerdeKlas ? `${opgeslagenKlassen.find(k => k.id === geselecteerdeKlas)?.naam} (${opgeslagenKlassen.find(k => k.id === geselecteerdeKlas)?.leerlingen.length} leerlingen)` : '-- Selecteer een klas --'}
                <ChevronDown className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                <Menu.Item>
                  {() => (
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900 cursor-pointer"
                      onClick={() => {
                        setGeselecteerdeKlas('');
                        onReset?.();
                      }}
                    >
                      -- Selecteer een klas --
                    </button>
                  )}
                </Menu.Item>
                {opgeslagenKlassen.map(klas => (
                  <Menu.Item key={klas.id}>
                    {() => (
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900 cursor-pointer"
                        onClick={() => {
                          setGeselecteerdeKlas(klas.id);
                          laadKlas(klas.id);
                        }}
                      >
                        {klas.naam} ({klas.leerlingen.length} leerlingen)
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
            {geselecteerdeKlas && (
              <button
                onClick={() => verwijderKlas(geselecteerdeKlas)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Klas opslaan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sla huidige klas op:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={opslaanNaam}
              onChange={(e) => setOpslaanNaam(e.target.value)}
              placeholder="Bijv: 3A, 4B, ..."
              className="w-full sm:flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
            />
            <button
              onClick={opslaanKlas}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
