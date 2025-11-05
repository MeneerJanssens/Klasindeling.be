import { useState } from 'react';
import { Users, Grid3x3, Shuffle, Printer, X } from 'lucide-react';

interface DraggedItem {
  naam: string;
  rijIndex: number;
  kolomIndex: number;
}

export default function KlasindelingApp() {
  const [leerlingen, setLeerlingen] = useState<string>('');
  const [rijen, setRijen] = useState<number>(4);
  const [kolommen, setKolommen] = useState<number>(6);
  const [indeling, setIndeling] = useState<(string | null)[][]>([]);
  const [toonResultaat, setToonResultaat] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [geblokkeerd, setGeblokkeerd] = useState<Set<string>>(new Set());

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

    // Schud de leerlingen willekeurig
    const geschuddeLeerlingen = [...leerlingenLijst].sort(() => Math.random() - 0.5);
    
    // Maak de indeling
    const nieuweIndeling = [];
    let leerlingIndex = 0;
    
    for (let r = 0; r < rijen; r++) {
      const rij = [];
      for (let k = 0; k < kolommen; k++) {
        const positieKey = `${r}-${k}`;
        if (geblokkeerd.has(positieKey)) {
          rij.push(null); // null betekent geblokkeerde ruimte
        } else {
          rij.push(geschuddeLeerlingen[leerlingIndex] || '');
          leerlingIndex++;
        }
      }
      nieuweIndeling.push(rij);
    }

    setIndeling(nieuweIndeling);
    setToonResultaat(true);
  };

  const toggleBlok = (rijIndex: number, kolomIndex: number) => {
    const key = `${rijIndex}-${kolomIndex}`;
    const nieuweGeblokkeerd = new Set(geblokkeerd);
    
    if (nieuweGeblokkeerd.has(key)) {
      nieuweGeblokkeerd.delete(key);
    } else {
      nieuweGeblokkeerd.add(key);
    }
    
    setGeblokkeerd(nieuweGeblokkeerd);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, rijIndex: number, kolomIndex: number) => {
    const naam = indeling[rijIndex][kolomIndex];
    if (naam) {
      setDraggedItem({ naam, rijIndex, kolomIndex });
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, doelRijIndex: number, doelKolomIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // Check of de doelpositie geblokkeerd is
    if (indeling[doelRijIndex][doelKolomIndex] === null) return;

    const nieuweIndeling = indeling.map(rij => [...rij]);
    
    // Wissel de posities
    const temp = nieuweIndeling[doelRijIndex][doelKolomIndex];
    nieuweIndeling[doelRijIndex][doelKolomIndex] = draggedItem.naam;
    nieuweIndeling[draggedItem.rijIndex][draggedItem.kolomIndex] = temp;
    
    setIndeling(nieuweIndeling);
    setDraggedItem(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="print:hidden">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8 text-center flex items-center justify-center gap-3">
            <Users className="w-10 h-10" />
            Klasindeling Generator - Meneer Janssens
          </h1>

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
                Klas Indeling
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
                Genereer Willekeurige Indeling
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
          <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 print:mb-8">
              Klasindeling - Meneer Janssens
            </h2>
            
            <div className="print:landscape">
              <div className="flex flex-col gap-2">
                {indeling.map((rij, rijIndex) => (
                  <div key={rijIndex} className="flex gap-2">
                    {rij.map((naam, kolomIndex) => {
                      const isGeblokkeerd = naam === null;
                      return (
                        <div
                          key={`${rijIndex}-${kolomIndex}`}
                          draggable={!isGeblokkeerd && naam !== ''}
                          onDragStart={(e) => handleDragStart(e, rijIndex, kolomIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, rijIndex, kolomIndex)}
                          className={`border-2 rounded-lg p-4 text-center min-h-[80px] flex items-center justify-center print:min-h-[60px] print:p-3 transition ${
                            isGeblokkeerd
                              ? 'bg-gray-200 border-gray-300 print:bg-gray-100'
                              : naam
                              ? 'bg-indigo-50 border-indigo-300 cursor-move hover:bg-indigo-100 print:cursor-default'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          style={{ flex: isGeblokkeerd ? '0.5' : '1' }}
                        >
                          <span className={`font-medium print:text-sm ${
                            isGeblokkeerd ? 'text-gray-400 text-xs' : naam ? 'text-gray-800' : 'text-gray-400'
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

            <div className="mt-6 text-center text-sm text-gray-600 print:mt-8">
              <p className="font-medium">Legende: Voorkant van de klas is onderaan</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}