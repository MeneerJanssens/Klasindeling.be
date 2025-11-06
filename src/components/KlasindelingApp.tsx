import { useState, useEffect } from 'react';
import { Users, Grid3x3, Shuffle, Printer, X, Save, FolderOpen, Trash2 } from 'lucide-react';

interface DraggedItem {
  naam: string;
  rijIndex: number;
  kolomIndex: number;
}

interface OpgeslagenKlas {
  id: string;
  naam: string;
  leerlingen: string;
  rijen: number;
  kolommen: number;
  geblokkeerd: string[];
  klasNaam: string;
}

export default function KlasindelingApp() {
  const [leerlingen, setLeerlingen] = useState<string>('');
  const [rijen, setRijen] = useState<number>(4);
  const [kolommen, setKolommen] = useState<number>(6);
  const [indeling, setIndeling] = useState<(string | null)[][]>([]);
  const [toonResultaat, setToonResultaat] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [geblokkeerd, setGeblokkeerd] = useState<Set<string>>(new Set());
  const [klasNaam, setKlasNaam] = useState<string>('');
  const [opgeslagenKlassen, setOpgeslagenKlassen] = useState<OpgeslagenKlas[]>([]);
  const [geselecteerdeKlas, setGeselecteerdeKlas] = useState<string>('');
  const [opslaanNaam, setOpslaanNaam] = useState<string>('');

  // Laad opgeslagen klassen bij opstarten
  useEffect(() => {
    const opgeslagen = localStorage.getItem('klasindelingen');
    if (opgeslagen) {
      setOpgeslagenKlassen(JSON.parse(opgeslagen));
    }
  }, []);

  const genereerIndeling = () => {
    const leerlingenLijst = leerlingen
      .split('\n')
      .map(naam => naam.trim())
      .filter(naam => naam.length > 0);

    if (leerlingenLijst.length === 0) {
      alert('Voeg eerst leerlingen toe!');
      return;
    }

    const totaalPlaatsen = rijen * kolommen - geblokkeerd.size;
    
    if (leerlingenLijst.length > totaalPlaatsen) {
      alert(`Te veel leerlingen! Je hebt ${totaalPlaatsen} beschikbare plaatsen maar ${leerlingenLijst.length} leerlingen.`);
      return;
    }

    const geschuddeLeerlingen = [...leerlingenLijst].sort(() => Math.random() - 0.5);
    
    const nieuweIndeling = [];
    let leerlingIndex = 0;
    
    for (let r = rijen - 1; r >= 0; r--) {
      const rij = [];
      for (let k = 0; k < kolommen; k++) {
        const positieKey = `${r}-${k}`;
        if (geblokkeerd.has(positieKey)) {
          rij.push(null);
        } else {
          rij.push(geschuddeLeerlingen[leerlingIndex] || '');
          leerlingIndex++;
        }
      }
      nieuweIndeling.unshift(rij);
    }

    setIndeling(nieuweIndeling);
    setToonResultaat(true);
  };

  const toggleBlok = (rijIndex: number, kolomIndex: number): void => {
    const key = `${rijIndex}-${kolomIndex}`;
    const nieuweGeblokkeerd = new Set(geblokkeerd);
    
    if (nieuweGeblokkeerd.has(key)) {
      nieuweGeblokkeerd.delete(key);
    } else {
      nieuweGeblokkeerd.add(key);
    }
    
    setGeblokkeerd(nieuweGeblokkeerd);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, rijIndex: number, kolomIndex: number): void => {
    const naam = indeling[rijIndex][kolomIndex];
    if (naam) {
      setDraggedItem({ naam, rijIndex, kolomIndex });
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, doelRijIndex: number, doelKolomIndex: number): void => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    if (indeling[doelRijIndex][doelKolomIndex] === null) return;

    const nieuweIndeling = indeling.map(rij => [...rij]);
    
    const temp = nieuweIndeling[doelRijIndex][doelKolomIndex];
    nieuweIndeling[doelRijIndex][doelKolomIndex] = draggedItem.naam;
    nieuweIndeling[draggedItem.rijIndex][draggedItem.kolomIndex] = temp;
    
    setIndeling(nieuweIndeling);
    setDraggedItem(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const opslaanKlas = () => {
    if (!opslaanNaam.trim()) {
      alert('Geef een naam op voor de klas!');
      return;
    }

    if (!leerlingen.trim()) {
      alert('Voeg eerst leerlingen toe!');
      return;
    }

    const nieuweKlas = {
      id: Date.now().toString(),
      naam: opslaanNaam,
      leerlingen: leerlingen,
      rijen: rijen,
      kolommen: kolommen,
      geblokkeerd: Array.from(geblokkeerd),
      klasNaam: opslaanNaam // Use the same name for consistency
    };

    const bijgewerkt = [...opgeslagenKlassen.filter(k => k.naam !== opslaanNaam), nieuweKlas];
    setOpgeslagenKlassen(bijgewerkt);
    localStorage.setItem('klasindelingen', JSON.stringify(bijgewerkt));
    
    alert(`Klas "${opslaanNaam}" opgeslagen!`);
    setOpslaanNaam('');
  };

  const laadKlas = (klasId: string): void => {
    const klas = opgeslagenKlassen.find(k => k.id === klasId);
    if (klas) {
      setLeerlingen(klas.leerlingen);
      setRijen(klas.rijen);
      setKolommen(klas.kolommen);
      setGeblokkeerd(new Set(klas.geblokkeerd));
      setKlasNaam(klas.naam); // Update klasNaam with the selected class name
      setToonResultaat(false);
      setIndeling([]);
    }
  };

  const verwijderKlas = (klasId: string): void => {
    if (confirm('Weet je zeker dat je deze klas wilt verwijderen?')) {
      const bijgewerkt = opgeslagenKlassen.filter(k => k.id !== klasId);
      setOpgeslagenKlassen(bijgewerkt);
      localStorage.setItem('klasindelingen', JSON.stringify(bijgewerkt));
      setGeselecteerdeKlas('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto print:max-w-none">
        <div className="print:hidden">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8 text-center flex items-center justify-center gap-3">
            <Users className="w-10 h-10" />
            Klasindeling Generator - Meneer Janssens
          </h1>

          {/* Opgeslagen klassen sectie */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Opgeslagen klassen
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Klas laden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Laad een klas:
                </label>
                <div className="flex gap-2">
                  <select
                    value={geselecteerdeKlas}
                    onChange={(e) => {
                      setGeselecteerdeKlas(e.target.value);
                      if (e.target.value) laadKlas(e.target.value);
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Selecteer een klas --</option>
                    {opgeslagenKlassen.map(klas => (
                      <option key={klas.id} value={klas.id}>
                        {klas.naam}
                      </option>
                    ))}
                  </select>
                  {geselecteerdeKlas && (
                    <button
                      onClick={() => verwijderKlas(geselecteerdeKlas)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition"
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={opslaanNaam}
                    onChange={(e) => setOpslaanNaam(e.target.value)}
                    placeholder="Bijv: 3A, 4B, ..."
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={opslaanKlas}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    Opslaan
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Leerlingen invoer */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Leerlingen
              </h2>
              <textarea
                className="w-full h-64 p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="Voer de namen van leerlingen in (één per regel)&#10;Bijv:&#10;Jan Janssen&#10;Marie Peeters&#10;Tom Vermeulen"
                value={leerlingen}
                onChange={(e) => setLeerlingen(e.target.value)}
              />
              <p className="text-sm text-gray-600 mt-2">
                Aantal leerlingen: {leerlingen.split('\n').filter(n => n.trim()).length}
              </p>
            </div>

            {/* Klas layout */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Klasindeling
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aantal rijen: {rijen}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={rijen}
                    onChange={(e) => setRijen(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aantal kolommen: {kolommen}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={kolommen}
                    onChange={(e) => setKolommen(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Totaal aantal plaatsen:</strong> {rijen * kolommen - geblokkeerd.size}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Geblokkeerde ruimtes: {geblokkeerd.size}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 <strong>Tip:</strong> Klik hieronder op een vakje om een lege ruimte te markeren (tussen banken, gang, enz.)
                  </p>
                </div>
              </div>

              <button
                onClick={genereerIndeling}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Shuffle className="w-5 h-5" />
                Genereer willekeurige indeling
              </button>
            </div>
          </div>

          {/* Klas layout editor */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Kies lege ruimtes (klik op vakjes om te blokkeren/deblokkeren)
            </h3>
            <div className="grid gap-2 max-w-4xl mx-auto" style={{ gridTemplateColumns: `repeat(${kolommen}, 1fr)` }}>
              {Array.from({ length: rijen }).map((_, rijIndex) =>
                Array.from({ length: kolommen }).map((_, kolomIndex) => {
                  const key = `${rijIndex}-${kolomIndex}`;
                  const isGeblokkeerd = geblokkeerd.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleBlok(rijIndex, kolomIndex)}
                      className={`h-16 rounded-lg border-2 flex items-center justify-center transition ${
                        isGeblokkeerd
                          ? 'bg-red-100 border-red-400 hover:bg-red-200'
                          : 'bg-green-50 border-green-300 hover:bg-green-100'
                      }`}
                    >
                      {isGeblokkeerd ? (
                        <X className="w-6 h-6 text-red-600" />
                      ) : (
                        <span className="text-xs text-gray-500">Plaats</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {toonResultaat && (
            <div className="text-center mb-6 space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg inline-block">
                <p className="text-sm text-gray-700">
                  💡 <strong>Sleep en drop</strong> om leerlingen te verplaatsen
                </p>
              </div>
              <div className="max-w-md mx-auto mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klas naam (optioneel):
                </label>
                <input
                  type="text"
                  value={klasNaam}
                  onChange={(e) => setKlasNaam(e.target.value)}
                  placeholder="Bijv: 3A, 5de jaar, ..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 mx-auto transition"
                >
                  <Printer className="w-5 h-5" />
                  Print Klasindeling
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resultaat - zichtbaar op scherm en bij printen */}
        {toonResultaat && (
          <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0 print:rounded-none">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 print:mb-4 print:text-3xl">
              Klasindeling - {klasNaam || 'Meneer Janssens'}
            </h2>
            
            <div>
              <div className="flex flex-col gap-2 print:gap-3">
                {indeling.map((rij, rijIndex) => (
                  <div key={rijIndex} className="flex gap-2 print:gap-3">
                    {rij.map((naam, kolomIndex) => {
                      const isGeblokkeerd = naam === null;
                      return (
                        <div
                          key={`${rijIndex}-${kolomIndex}`}
                          draggable={!isGeblokkeerd && naam !== ''}
                          onDragStart={(e) => handleDragStart(e, rijIndex, kolomIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, rijIndex, kolomIndex)}
                          className={`border-2 rounded-lg p-4 text-center min-h-[80px] flex items-center justify-center transition print:min-h-[70px] print:p-2 print:border ${
                            isGeblokkeerd
                              ? 'bg-gray-200 border-gray-300 print:bg-white print:border-gray-300'
                              : naam
                              ? 'bg-indigo-50 border-indigo-300 cursor-move hover:bg-indigo-100 print:cursor-default print:bg-white print:border-gray-700'
                              : 'bg-gray-50 border-gray-200 print:bg-white print:border-gray-400'
                          }`}
                          style={{ flex: isGeblokkeerd ? '0.5' : '1' }}
                        >
                          <span className={`font-medium print:text-base ${
                            isGeblokkeerd ? 'text-gray-400 text-xs print:hidden' : naam ? 'text-gray-800 print:text-black' : 'text-gray-400 print:hidden'
                          }`}>
                            {isGeblokkeerd ? '' : naam || '(leeg)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 print:mt-4 print:text-base print:text-black">
              <p className="font-medium">Bord</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          * {
            background: white !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white !important;
          }
          @page {
            size: A4 landscape;
            margin: 1.5cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:landscape {
            width: 100%;
            max-width: none;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:mt-4 {
            margin-top: 1rem !important;
          }
          .print\\:text-3xl {
            font-size: 1.875rem !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:gap-3 {
            gap: 0.75rem !important;
          }
          .print\\:min-h-\\[70px\\] {
            min-height: 70px !important;
          }
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          .print\\:border {
            border-width: 1px !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          .print\\:border-gray-400 {
            border-color: #9ca3af !important;
          }
          .print\\:border-gray-700 {
            border-color: #374151 !important;
          }
          .print\\:cursor-default {
            cursor: default !important;
          }
        }
      `}</style>
    </div>
  );
}