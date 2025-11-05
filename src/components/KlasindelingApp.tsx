import { useState } from 'react';
import { Users, Grid3x3, Shuffle, Printer } from 'lucide-react';

export default function KlasindelingApp() {
  const [leerlingen, setLeerlingen] = useState<string>('');
  const [rijen, setRijen] = useState<number>(4);
  const [kolommen, setKolommen] = useState<number>(6);
  const [indeling, setIndeling] = useState<string[][]>([]);
  const [toonResultaat, setToonResultaat] = useState<boolean>(false);

  const genereerIndeling = () => {
    const leerlingenLijst = leerlingen
      .split('\n')
      .map(naam => naam.trim())
      .filter(naam => naam.length > 0);

    if (leerlingenLijst.length === 0) {
      alert('Voeg eerst leerlingen toe!');
      return;
    }

    const totaalPlaatsen = rijen * kolommen;
    
    if (leerlingenLijst.length > totaalPlaatsen) {
      alert(`Te veel leerlingen! Je hebt ${totaalPlaatsen} plaatsen maar ${leerlingenLijst.length} leerlingen.`);
      return;
    }

    // Schud de leerlingen willekeurig
    const geschuddeLeerlingen = [...leerlingenLijst].sort(() => Math.random() - 0.5);
    
    // Maak de indeling
    const nieuweIndeling: string[][] = [];
    for (let r = 0; r < rijen; r++) {
      const rij: string[] = [];
      for (let k = 0; k < kolommen; k++) {
        const index = r * kolommen + k;
        rij.push(geschuddeLeerlingen[index] || '');
      }
      nieuweIndeling.push(rij);
    }

    setIndeling(nieuweIndeling);
    setToonResultaat(true);
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
            Klasindeling Generator
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
                    <strong>Totaal aantal plaatsen:</strong> {rijen * kolommen}
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

          {toonResultaat && (
            <div className="text-center mb-6">
              <button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 mx-auto transition"
              >
                <Printer className="w-5 h-5" />
                Print Klasindeling
              </button>
            </div>
          )}
        </div>

        {/* Resultaat - zichtbaar op scherm en bij printen */}
        {toonResultaat && (
          <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 print:mb-8">
              Klasindeling
            </h2>
            
            <div className="print:landscape">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${kolommen}, 1fr)` }}>
                {indeling.map((rij, rijIndex) => (
                  rij.map((naam, kolomIndex) => (
                    <div
                      key={`${rijIndex}-${kolomIndex}`}
                      className={`border-2 rounded-lg p-4 text-center min-h-[80px] flex items-center justify-center print:min-h-[60px] print:p-3 ${
                        naam ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className={`font-medium print:text-sm ${naam ? 'text-gray-800' : 'text-gray-400'}`}>
                        {naam || '(leeg)'}
                      </span>
                    </div>
                  ))
                ))}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 print:mt-8">
              <p className="font-medium">Legende: Voorkant van de klas is bovenaan</p>
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