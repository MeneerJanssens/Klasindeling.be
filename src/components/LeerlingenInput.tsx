import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Leerling } from '../utils/klasStorage';

interface LeerlingenInputProps {
  leerlingen: Leerling[];
  setLeerlingen: (leerlingen: Leerling[]) => void;
}

export default function LeerlingenInput({ leerlingen, setLeerlingen }: LeerlingenInputProps) {
  const [naam, setNaam] = useState('');
  const [geslacht, setGeslacht] = useState<'m' | 'v'>('m');
  const [lastig, setLastig] = useState(false);
  const [vooraan, setVooraan] = useState(false);
  const [bulkTekst, setBulkTekst] = useState('');
  const [toonBulk, setToonBulk] = useState(false);
  const [bewerkLeerling, setBewerkLeerling] = useState<Leerling | null>(null);

  const voegLeerlingToe = () => {
    if (naam.trim()) {
      setLeerlingen([...leerlingen, {
        id: Date.now(),
        naam: naam.trim(),
        geslacht,
        lastig,
        vooraan
      }]);
      setNaam('');
      setLastig(false);
      setVooraan(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      voegLeerlingToe();
    }
  };

  const plakLeerlingen = () => {
    const regels = bulkTekst.split('\n').filter(r => r.trim());
    const nieuweLeerlingen: Leerling[] = regels.map(regel => ({
      id: Date.now() + Math.random(),
      naam: regel.trim(),
      geslacht: 'm' as const,
      lastig: false,
      vooraan: false
    }));
    setLeerlingen([...leerlingen, ...nieuweLeerlingen]);
    setBulkTekst('');
    setToonBulk(false);
  };

  const verwijderLeerling = (id: number) => {
    setLeerlingen(leerlingen.filter(l => l.id !== id));
  };

  const bewerkLeerlingInfo = (id: number, nieuweData: Partial<Leerling>) => {
    setLeerlingen(leerlingen.map(l => 
      l.id === id ? { ...l, ...nieuweData } : l
    ));
    setBewerkLeerling(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">Leerlingen toevoegen</h3>
        <button
          onClick={() => setToonBulk(!toonBulk)}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          {toonBulk ? 'Handmatig toevoegen' : 'Lijst plakken'}
        </button>
      </div>

      {toonBulk ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plak je lijst met namen (één per regel)
          </label>
          <textarea
            value={bulkTekst}
            onChange={(e) => setBulkTekst(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={6}
            placeholder="Emma de Vries&#10;Luuk Jansen&#10;Sophie Bakker&#10;..."
          />
          <button
            onClick={plakLeerlingen}
            className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Toevoegen ({bulkTekst.split('\n').filter(r => r.trim()).length} leerlingen)
          </button>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam leerling
            </label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Bijv. Emma de Vries"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geslacht
            </label>
            <select
              value={geslacht}
              onChange={(e) => setGeslacht(e.target.value as 'm' | 'v')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="m">Jongen</option>
              <option value="v">Meisje</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="lastig"
                checked={lastig}
                onChange={(e) => setLastig(e.target.checked)}
                className="w-4 h-4 rounded focus:ring-indigo-500 accent-indigo-600"
              />
              <label htmlFor="lastig" className="text-sm font-medium text-gray-700">
                Lastig
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vooraan"
                checked={vooraan}
                onChange={(e) => setVooraan(e.target.checked)}
                className="w-4 h-4 rounded focus:ring-indigo-500 accent-green-600"
              />
              <label htmlFor="vooraan" className="text-sm font-medium text-gray-700">
                Vooraan
              </label>
            </div>
          </div>

          <button
            onClick={voegLeerlingToe}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Toevoegen
          </button>
        </div>
      )}

      {/* Lijst leerlingen */}
      {leerlingen.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Leerlingen ({leerlingen.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {leerlingen.map((leerling) => (
              <div key={leerling.id}>
                {bewerkLeerling?.id === leerling.id ? (
                  <BewerkLeerlingForm
                    leerling={leerling}
                    onOpslaan={bewerkLeerlingInfo}
                    onAnnuleer={() => setBewerkLeerling(null)}
                  />
                ) : (
                  <div
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:shadow-md transition ${
                      leerling.vooraan
                        ? 'bg-green-100 border-2 border-green-400'
                        : leerling.lastig
                        ? 'bg-orange-100 border-2 border-orange-300'
                        : 'bg-gray-100'
                    }`}
                    onClick={() => setBewerkLeerling(leerling)}
                  >
                    <span className="text-sm">
                      {leerling.naam}
                      <span className="ml-1">
                        {leerling.geslacht === 'm' ? '♂️' : '♀️'}
                      </span>
                      {leerling.vooraan && <span className="ml-1">⭐</span>}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        verwijderLeerling(leerling.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface BewerkLeerlingFormProps {
  leerling: Leerling;
  onOpslaan: (id: number, nieuweData: Partial<Leerling>) => void;
  onAnnuleer: () => void;
}

function BewerkLeerlingForm({ leerling, onOpslaan, onAnnuleer }: BewerkLeerlingFormProps) {
  const [naam, setNaam] = useState(leerling.naam);
  const [geslacht, setGeslacht] = useState(leerling.geslacht);
  const [lastig, setLastig] = useState(leerling.lastig);
  const [vooraan, setVooraan] = useState(leerling.vooraan);

  const handleOpslaan = () => {
    onOpslaan(leerling.id, { naam, geslacht, lastig, vooraan });
  };

  return (
    <div className="bg-white border-2 border-indigo-500 rounded-lg p-3 shadow-lg" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-2">
        <input
          type="text"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          placeholder="Naam"
        />
        <select
          value={geslacht}
          onChange={(e) => setGeslacht(e.target.value as 'm' | 'v')}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="m">Jongen ♂️</option>
          <option value="v">Meisje ♀️</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lastig}
            onChange={(e) => setLastig(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-600"
          />
          Lastige leerling
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={vooraan}
            onChange={(e) => setVooraan(e.target.checked)}
            className="w-4 h-4 rounded accent-green-600"
          />
          Vooraan plaatsen
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleOpslaan}
            className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Opslaan
          </button>
          <button
            onClick={onAnnuleer}
            className="flex-1 px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
          >
            Annuleer
          </button>
        </div>
      </div>
    </div>
  );
}
