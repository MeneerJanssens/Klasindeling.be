import { useState } from 'react';
import { Armchair, Grid3x3, Shuffle, Printer, X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Leerling, OpgeslagenKlas } from '../utils/klasStorage';
import LeerlingenInput from '../components/LeerlingenInput';
import KlasOpslaan from '../components/KlasOpslaan';

interface DraggedItem {
  naam: string;
  rijIndex: number;
  kolomIndex: number;
}

export default function KlasindelingApp() {
  const [leerlingen, setLeerlingen] = useState<Leerling[]>([]);
  const [rijen, setRijen] = useState<number>(4);
  const [kolommen, setKolommen] = useState<number>(6);
  const [indeling, setIndeling] = useState<(Leerling | null)[][]>([]);
  const [toonResultaat, setToonResultaat] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [geblokkeerd, setGeblokkeerd] = useState<Set<string>>(new Set());
  const [klasNaam, setKlasNaam] = useState<string>('');

  const handleLaadKlas = (klas: OpgeslagenKlas) => {
    setLeerlingen(klas.leerlingen);
    setKlasNaam(klas.naam); // Vul de klasnaam automatisch in
    
    // Als er een opgeslagen indeling is, laad die ook
    if (klas.indeling && klas.rijen && klas.kolommen) {
      setIndeling(klas.indeling);
      setRijen(klas.rijen);
      setKolommen(klas.kolommen);
      if (klas.geblokkeerd) {
        setGeblokkeerd(new Set(klas.geblokkeerd));
      }
      setToonResultaat(true);
    } else {
      setToonResultaat(false);
      setIndeling([]);
    }
  };

  const genereerIndeling = () => {
    if (leerlingen.length === 0) {
      alert('Voeg eerst leerlingen toe!');
      return;
    }

    const totaalPlaatsen = rijen * kolommen - geblokkeerd.size;
    
    if (leerlingen.length > totaalPlaatsen) {
      alert(`Te veel leerlingen! Je hebt ${totaalPlaatsen} beschikbare plaatsen maar ${leerlingen.length} leerlingen.`);
      return;
    }

    // Verdeel leerlingen: vooraan, lastige en normale
    const vooraanLeerlingen = [...leerlingen.filter(l => l.vooraan)].sort(() => Math.random() - 0.5);
    const lastigeLeerlingen = [...leerlingen.filter(l => l.lastig && !l.vooraan)].sort(() => Math.random() - 0.5);
    const normaleLeerlingen = [...leerlingen.filter(l => !l.lastig && !l.vooraan)].sort(() => Math.random() - 0.5);
    
    // Maak een lege grid
    const nieuweIndeling: (Leerling | null)[][] = [];
    for (let r = 0; r < rijen; r++) {
      const rij: (Leerling | null)[] = [];
      for (let k = 0; k < kolommen; k++) {
        const positieKey = `${r}-${k}`;
        rij.push(geblokkeerd.has(positieKey) ? null : undefined as any);
      }
      nieuweIndeling.push(rij);
    }

    // Helper functie: check of een positie naast een lastige leerling is
    const heeftLastigeBuur = (r: number, k: number): boolean => {
      // Check links
      if (k > 0 && nieuweIndeling[r][k - 1]?.lastig) return true;
      // Check rechts
      if (k < kolommen - 1 && nieuweIndeling[r][k + 1]?.lastig) return true;
      // Check boven
      if (r > 0 && nieuweIndeling[r - 1][k]?.lastig) return true;
      // Check onder
      if (r < rijen - 1 && nieuweIndeling[r + 1][k]?.lastig) return true;
      return false;
    };

    // Plaats eerst lastige leerlingen
    let lastigeIndex = 0;
    let maxPogingen = 1000;
    let pogingen = 0;
    
    while (lastigeIndex < lastigeLeerlingen.length && pogingen < maxPogingen) {
      pogingen++;
      const r = Math.floor(Math.random() * rijen);
      const k = Math.floor(Math.random() * kolommen);
      
      // Check of de positie beschikbaar is en geen lastige buren heeft
      if (nieuweIndeling[r][k] === undefined && !heeftLastigeBuur(r, k)) {
        nieuweIndeling[r][k] = lastigeLeerlingen[lastigeIndex];
        lastigeIndex++;
        pogingen = 0; // Reset pogingen na succesvolle plaatsing
      }
    }

    // Als niet alle lastige leerlingen geplaatst konden worden, waarschuw dan
    if (lastigeIndex < lastigeLeerlingen.length) {
      alert('Waarschuwing: Niet alle lastige leerlingen kunnen worden verspreid zonder naast elkaar te zitten. Probeer opnieuw of pas de klasindeling aan.');
    }

    // Plaats eerst vooraan-leerlingen willekeurig over de onderste rij
    let vooraanIndex = 0;
    const ondersteRij = rijen - 1;
    
    // Verzamel beschikbare posities op de onderste rij
    const beschikbareOndersteRij: number[] = [];
    for (let k = 0; k < kolommen; k++) {
      if (nieuweIndeling[ondersteRij][k] === undefined) {
        beschikbareOndersteRij.push(k);
      }
    }
    
    // Shuffle de beschikbare posities op de onderste rij
    beschikbareOndersteRij.sort(() => Math.random() - 0.5);
    
    // Plaats vooraan-leerlingen op willekeurige posities in de onderste rij
    for (const kolomIndex of beschikbareOndersteRij) {
      if (vooraanIndex < vooraanLeerlingen.length) {
        nieuweIndeling[ondersteRij][kolomIndex] = vooraanLeerlingen[vooraanIndex];
        vooraanIndex++;
      }
    }
    
    // Als er nog vooraan-leerlingen over zijn, plaats ze in de volgende rijen
    for (let r = rijen - 2; r >= 0 && vooraanIndex < vooraanLeerlingen.length; r--) {
      for (let k = 0; k < kolommen && vooraanIndex < vooraanLeerlingen.length; k++) {
        if (nieuweIndeling[r][k] === undefined) {
          nieuweIndeling[r][k] = vooraanLeerlingen[vooraanIndex];
          vooraanIndex++;
        }
      }
    }

    // Plaats normale leerlingen op overige plekken (van onderen naar boven, van links naar rechts)
    let normaleIndex = 0;
    for (let r = rijen - 1; r >= 0; r--) {
      for (let k = 0; k < kolommen; k++) {
        if (nieuweIndeling[r][k] === undefined) {
          if (normaleIndex < normaleLeerlingen.length) {
            nieuweIndeling[r][k] = normaleLeerlingen[normaleIndex];
            normaleIndex++;
          } else {
            nieuweIndeling[r][k] = null;
          }
        }
      }
    }

    // Converteer undefined naar null voor consistentie
    for (let r = 0; r < rijen; r++) {
      for (let k = 0; k < kolommen; k++) {
        if (nieuweIndeling[r][k] === undefined) {
          nieuweIndeling[r][k] = null;
        }
      }
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
    const leerling = indeling[rijIndex][kolomIndex];
    if (leerling) {
      setDraggedItem({ naam: leerling.naam, rijIndex, kolomIndex });
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
    
    // Check of de doellocatie geblokkeerd is
    const doelKey = `${doelRijIndex}-${doelKolomIndex}`;
    if (geblokkeerd.has(doelKey)) return;

    const nieuweIndeling = indeling.map(rij => [...rij]);
    
    const temp = nieuweIndeling[doelRijIndex][doelKolomIndex];
    nieuweIndeling[doelRijIndex][doelKolomIndex] = nieuweIndeling[draggedItem.rijIndex][draggedItem.kolomIndex];
    nieuweIndeling[draggedItem.rijIndex][draggedItem.kolomIndex] = temp;
    
    setIndeling(nieuweIndeling);
    setDraggedItem(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('klasindeling-resultaat');
    if (!element) return;

    try {
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate dimensions for A4 landscape
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = klasNaam 
        ? `Klasindeling-${klasNaam}.pdf` 
        : 'Klasindeling-Meneer-Janssens.pdf';
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Er is een fout opgetreden bij het genereren van de PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto print:max-w-none">
        <div className="print:hidden">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8 text-center flex items-center justify-center gap-3 w-full">
            <Armchair className="w-10 h-10" />
            Klasindeling
          </h1>

          {/* Opgeslagen klassen sectie */}
          <div className="mb-6">
            <KlasOpslaan 
              leerlingen={leerlingen} 
              onLaadKlas={handleLaadKlas}
              indeling={indeling}
              rijen={rijen}
              kolommen={kolommen}
              geblokkeerd={geblokkeerd}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Leerlingen invoer */}
            <LeerlingenInput 
              leerlingen={leerlingen}
              setLeerlingen={setLeerlingen}
            />

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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    style={{
                      background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((rijen - 1) / 7) * 100}%, #e5e7eb ${((rijen - 1) / 7) * 100}%, #e5e7eb 100%)`
                    }}
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    style={{
                      background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((kolommen - 1) / 9) * 100}%, #e5e7eb ${((kolommen - 1) / 9) * 100}%, #e5e7eb 100%)`
                    }}
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
            </div>
          </div>

          {/* Klas layout editor */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Kies lege ruimtes (klik op vakjes om te blokkeren/deblokkeren)
            </h3>
            <div className="grid gap-2 max-w-4xl mx-auto" style={{ gridTemplateColumns: `repeat(${kolommen}, 1fr)` }}>
              {Array.from({ length: rijen }).map((_, rijIndex) => {
                return Array.from({ length: kolommen }).map((_, kolomIndex) => {
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
                });
              })}
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 font-medium">
              Bord
            </div>
          </div>

          <div className="max-w-md mx-auto mb-6">
            <button
              onClick={genereerIndeling}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Shuffle className="w-5 h-5" />
              Genereer willekeurige indeling
            </button>
          </div>

          {toonResultaat && (
            <div className="text-center mb-6 space-y-3">
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
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-5 h-5" />
                  Print Klasindeling
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-5 h-5" />
                  Download als PDF
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg inline-block">
                <p className="text-sm text-gray-700">
                  💡 <strong>Sleep en drop</strong> om leerlingen te verplaatsen
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Resultaat - zichtbaar op scherm en bij printen */}
        {toonResultaat && (
          <div id="klasindeling-resultaat" className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0 print:rounded-none">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 print:mb-4 print:text-3xl">
              Klasindeling - {klasNaam || 'Meneer Janssens'}
            </h2>
            
            <div>
              <div className="flex flex-col gap-2 print:gap-3">
                {indeling.map((rij, rijIndex) => (
                  <div key={rijIndex} className="flex gap-2 print:gap-3">
                    {rij.map((leerling, kolomIndex) => {
                      const positieKey = `${rijIndex}-${kolomIndex}`;
                      const isGeblokkeerd = geblokkeerd.has(positieKey);
                      const isLastig = leerling?.lastig || false;
                      const isVooraan = leerling?.vooraan || false;
                      return (
                        <div
                          key={`${rijIndex}-${kolomIndex}`}
                          draggable={!isGeblokkeerd && leerling !== null}
                          onDragStart={(e) => handleDragStart(e, rijIndex, kolomIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, rijIndex, kolomIndex)}
                          className={`border-2 rounded-lg p-4 text-center min-h-[80px] flex flex-col items-center justify-center transition print:min-h-[70px] print:p-2 print:border ${
                            isGeblokkeerd
                              ? 'bg-gray-200 border-gray-300 print:bg-white print:border-gray-300'
                              : leerling
                              ? isVooraan
                                ? 'bg-green-100 border-green-400 cursor-move hover:bg-green-200 print:cursor-default print:bg-white print:border-gray-700'
                                : isLastig
                                ? 'bg-orange-100 border-orange-300 cursor-move hover:bg-orange-200 print:cursor-default print:bg-white print:border-gray-700'
                                : 'bg-indigo-50 border-indigo-300 cursor-move hover:bg-indigo-100 print:cursor-default print:bg-white print:border-gray-700'
                              : 'bg-gray-50 border-gray-200 print:bg-white print:border-gray-400'
                          }`}
                          style={{ flex: isGeblokkeerd ? '0.5' : '1' }}
                        >
                          {leerling ? (
                            <>
                              <span className="font-medium print:text-base text-gray-800 print:text-black">
                                {leerling.naam}
                              </span>
                              <span className="text-xs mt-1 print:hidden">
                                {leerling.geslacht === 'm' ? '♂️' : '♀️'}
                                {isVooraan && ' ⭐'}
                                {isLastig && ' ⚠️'}
                              </span>
                            </>
                          ) : !isGeblokkeerd ? (
                            <span className="text-gray-400 text-sm print:text-gray-300">
                              (leeg)
                            </span>
                          ) : null}
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

      {/* Donatie sectie - onderaan (alleen zichtbaar als klasindeling getoond wordt) */}
      {toonResultaat && (
        <div className="mt-8 text-center print:hidden">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Steun dit project
          </h3>
          <p className="text-gray-600 mb-4">
            Vind je deze tool handig? Help me om meer gratis tools te maken voor leerkrachten!
          </p>
          <a 
            href='https://ko-fi.com/Z8Z01G7O8R' 
            target='_blank' 
            rel='noopener noreferrer'
            className="inline-block"
          >
            <img 
              src='https://ko-fi.com/img/githubbutton_sm.svg' 
              alt='Steun me op Ko-fi' 
              className="mx-auto"
            />
          </a>
        </div>
      </div>
      )}

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