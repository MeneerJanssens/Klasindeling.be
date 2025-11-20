import { useState } from 'react';
import { Users, RefreshCw, Edit2, Save, Printer, Download } from 'lucide-react';
import { Leerling, OpgeslagenKlas } from '../utils/klasStorage';
import LeerlingenInput from '../components/LeerlingenInput';
import KlasOpslaan from '../components/KlasOpslaan';

export default function Groepjesmaker() {
  const [leerlingen, setLeerlingen] = useState<Leerling[]>([]);
  const [verdeelMethode, setVerdeelMethode] = useState('grootte');
  const [groepsGrootte, setGroepsGrootte] = useState(4);
  const [aantalGroepen, setAantalGroepen] = useState(5);
  const [groepen, setGroepen] = useState<Leerling[][]>([]);
  const [bewerkMode, setBewerkMode] = useState(false);
  const [klasNaam, setKlasNaam] = useState<string>('');
  const [extraTekst, setExtraTekst] = useState<string>('');
  const [toonKleuren, setToonKleuren] = useState<boolean>(true);

  const handleLaadKlas = (klas: OpgeslagenKlas) => {
    setLeerlingen(klas.leerlingen);
    setGroepen([]);
    setBewerkMode(false);
    setKlasNaam(klas.naam || '');
  };

  const reset = () => {
    setLeerlingen([]);
    setVerdeelMethode('grootte');
    setGroepsGrootte(4);
    setAantalGroepen(5);
    setGroepen([]);
    setBewerkMode(false);
    setKlasNaam('');
    setExtraTekst('');
  };

  const maakGroepen = () => {
    if (leerlingen.length === 0) return;

    const geshuffled = [...leerlingen].sort(() => Math.random() - 0.5);
    
    const drukkeLeerlingen = geshuffled.filter(l => l.druk);
    const normaleLeerlingen = geshuffled.filter(l => !l.druk);
    
    let nieuweGroepen: Leerling[][] = [];
    let aantalGr;

    if (verdeelMethode === 'grootte') {
      aantalGr = Math.ceil(leerlingen.length / groepsGrootte);
    } else {
      aantalGr = aantalGroepen;
    }

    for (let i = 0; i < aantalGr; i++) {
      nieuweGroepen.push([]);
    }

    // Eerst drukke leerlingen verdelen (één per groep zoveel mogelijk)
    drukkeLeerlingen.forEach((leerling, idx) => {
      nieuweGroepen[idx % aantalGr].push(leerling);
    });

    // Normale leerlingen verdelen, maar nu rekening houdend met huidige groepsgroottes
    // Sorteer groepen op grootte (kleinste eerst) en vul ze aan
    normaleLeerlingen.forEach((leerling) => {
      // Vind de kleinste groep
      const kleinsteGroepIndex = nieuweGroepen.reduce((minIdx, groep, idx, arr) => {
        return groep.length < arr[minIdx].length ? idx : minIdx;
      }, 0);
      nieuweGroepen[kleinsteGroepIndex].push(leerling);
    });

    nieuweGroepen = nieuweGroepen.filter(groep => groep.length > 0);

    setGroepen(nieuweGroepen);
    setBewerkMode(false);
  };

  const verplaatsLeerling = (vanGroep: number, naarGroep: number, leerlingIdx: number) => {
    const nieuweGroepen = [...groepen];
    const leerling = nieuweGroepen[vanGroep][leerlingIdx];
    nieuweGroepen[vanGroep].splice(leerlingIdx, 1);
    nieuweGroepen[naarGroep].push(leerling);
    
    const gefilterd = nieuweGroepen.filter(groep => groep.length > 0);
    setGroepen(gefilterd);
  };

  const voegGroepToe = () => {
    setGroepen([...groepen, []]);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const escapeHtml = (unsafe: string) => (
      unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    );

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Groepsindeling</title>
        <style>
          @page {
            size: portrait;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #4F46E5;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 8px;
            margin-bottom: 12px;
            font-size: 24px;
          }
          .info {
            margin-bottom: 15px;
            font-size: 13px;
          }
          .groep {
            margin: 12px 0;
            page-break-inside: avoid;
          }
          .groep-titel {
            background: #4F46E5;
            color: white;
            padding: 6px 10px;
            font-weight: bold;
            border-radius: 4px;
            font-size: 14px;
          }
          .leerling-lijst {
            background: #f9fafb;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 2px;
          }
          .leerling {
            padding: 3px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          .leerling:last-child {
            border-bottom: none;
          }
          @media print {
            body { padding: 15px; }
            h1 { font-size: 22px; }
            .groep-titel { font-size: 13px; padding: 5px 8px; }
            .leerling { font-size: 12px; }
          }
        </style>
      </head>
      <body>
        ${(klasNaam || extraTekst) ? `
          <h1 style="margin-bottom: 4px; padding-bottom: 4px;">
            ${escapeHtml(klasNaam || '')}${klasNaam && extraTekst ? ' - ' : ''}${escapeHtml(extraTekst || '')}
          </h1>
        ` : '<h1>Groepsindeling</h1>'}
        <div class="info">
          <p><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL')}</p>
          <p><strong>Totaal aantal groepen:</strong> ${groepen.length}</p>
        </div>
          ${groepen.map((groep, idx) => `
          <div class="groep">
            <div class="groep-titel">Groep ${idx + 1} (${groep.length} leerlingen)</div>
            <div class="leerling-lijst">
              ${groep.map(l => `<div class="leerling">• ${escapeHtml(l.naam)}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('groepsindeling-resultaat');
    if (!element) return;

    // Add a class to force desktop styles and inject helper CSS for pdf export
    element.classList.add('pdf-export');
    const style = document.createElement('style');
    style.id = 'pdf-export-styles';
    style.textContent = `
      .pdf-export .overflow-x-auto { overflow-x: visible !important; }
      .pdf-export .flex { gap: 0.5rem !important; }
      .pdf-export [class*="min-h-"] { min-height: 80px !important; min-width: auto !important; padding: 1rem !important; font-size: 1rem !important; line-height: 1.5rem !important; }
      .pdf-export * { background: white !important; background-image: none !important; color: black !important; border-color: black !important; }
      .pdf-export .pdf-hidden { display: none !important; }
    `;
    document.head.appendChild(style);

    // small delay so styles apply
    await new Promise((r) => setTimeout(r, 120));

    try {
      // Load UMD bundle at runtime to avoid bundler/ESM issues that can break
      // class inheritance (some builds pack jspdf/html2canvas differently).
      await new Promise<void>((resolve, reject) => {
        if ((window as any).html2pdf) return resolve();
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/html2pdf.js/dist/html2pdf.bundle.min.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load html2pdf.js bundle'));
        document.head.appendChild(s);
      });

      // @ts-ignore - html2pdf is provided by the UMD bundle on window
      const html2pdf = (window as any).html2pdf;

      const opt = {
        margin: 10,
        filename: 'Groepsindeling-Meneer-Janssens.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      // Use the UMD API which is more stable across builds
      await new Promise<void>((resolve, reject) => {
        try {
          const worker = html2pdf().set(opt).from(element).save();
          if (worker && typeof worker.then === 'function') {
            worker.then(() => resolve()).catch((err: any) => reject(err));
          } else {
            // Fallback: wait briefly for download to start
            setTimeout(() => resolve(), 1000);
          }
        } catch (err) {
          reject(err);
        }
      });
    } catch (error: any) {
      console.error('Error generating PDF (html2pdf UMD):', error);
      alert('Er is een fout opgetreden bij het genereren van de PDF. Controleer de console voor details.');
    } finally {
      // Clean up
      element.classList.remove('pdf-export');
      const tempStyle = document.getElementById('pdf-export-styles');
      if (tempStyle) tempStyle.remove();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <Users className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
              Groepjesmaker
            </h1>
          </div>
        </div>

        {/* Opgeslagen klassen sectie */}
        <div className="mb-6">
          <KlasOpslaan 
            leerlingen={leerlingen} 
            onLaadKlas={handleLaadKlas}
            onReset={reset}
          />
        </div>

        {/* Leerlingen input component */}
        <LeerlingenInput 
          leerlingen={leerlingen}
          setLeerlingen={setLeerlingen}
        />

        {/* Groepsinstellingen */}
        {leerlingen.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">Groepsindeling</h2>
              
              <div className="flex gap-4 mb-4 flex-wrap">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="grootte"
                    checked={verdeelMethode === 'grootte'}
                    onChange={(e) => setVerdeelMethode(e.target.value)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-sm font-medium">Groepsgrootte:</span>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={groepsGrootte}
                    onChange={(e) => setGroepsGrootte(parseInt(e.target.value))}
                    disabled={verdeelMethode !== 'grootte'}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">leerlingen per groep</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="aantal"
                    checked={verdeelMethode === 'aantal'}
                    onChange={(e) => setVerdeelMethode(e.target.value)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-sm font-medium">Aantal groepen:</span>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={aantalGroepen}
                    onChange={(e) => setAantalGroepen(parseInt(e.target.value))}
                    disabled={verdeelMethode !== 'aantal'}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">groepen</span>
                </label>
              </div>

              <button
                onClick={maakGroepen}
                className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition flex items-center gap-2 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Maak Groepen
              </button>
          </div>
        )}

        {/* Groepen weergave */}
        {groepen.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Groepsindeling ({groepen.length} groepen)
              </h2>
              

              <div className="grid md:grid-cols-2 gap-4 md:gap-12 mb-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Klasnaam (optioneel):
                  </label>
                  <input
                    type="text"
                    value={klasNaam}
                    onChange={(e) => setKlasNaam(e.target.value)}
                    placeholder="Bijv: 3A, 5de jaar, ..."
                    className="w-full max-w-xs px-3 py-2 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={toonKleuren}
                      onChange={(e) => setToonKleuren(e.target.checked)}
                      className="h-5 w-5 accent-indigo-600"
                    />
                    Kleuren en emoji's tonen/verbergen
                  </label>

                  <div>
                    <button
                      onClick={() => setBewerkMode(!bewerkMode)}
                      className={`px-4 py-2 rounded-2xl transition flex items-center justify-center gap-2 ${
                        bewerkMode
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {bewerkMode ? (
                        <>
                          <Save className="w-4 h-4" />
                          Klaar
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Groepen aanpassen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            

            {bewerkMode && (
              <div className="mb-4 p-4 bg-blue-50 rounded-2xl">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Bewerkingsmodus:</strong> Selecteer een leerling en klik op een groep om te verplaatsen.
                </p>
                <button
                  onClick={voegGroepToe}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                >
                  + Nieuwe groep toevoegen
                </button>
              </div>
            )}

            <div id="groepsindeling-resultaat">
              {(klasNaam || extraTekst) && (
                <div className="mb-1 p-6 bg-white">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {klasNaam && <span>{klasNaam}</span>}
                    {klasNaam && extraTekst && <span> - </span>}
                    {extraTekst && <span>{extraTekst}</span>}
                  </h3>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 px-6 pb-6 bg-white">
              {groepen.map((groep, groepIdx) => (
                <div
                  key={groepIdx}
                  className="border-2 border-gray-200 rounded-2xl p-4 bg-linear-to-br from-white to-gray-50"
                >
                  <h3 className={`font-bold text-lg ${toonKleuren ? 'text-indigo-600' : 'text-gray-800'} mb-3`}>
                    Groep {groepIdx + 1} ({groep.length})
                  </h3>
                  <div className="space-y-2">
                    {groep.map((leerling, leerlingIdx) => (
                      <LeerlingKaart
                        key={leerling.id}
                        leerling={leerling}
                        bewerkMode={bewerkMode}
                        onVerplaats={(naarGroep) => verplaatsLeerling(groepIdx, naarGroep, leerlingIdx)}
                        groepen={groepen}
                        huidigeGroep={groepIdx}
                        toonKleuren={toonKleuren}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:justify-end mt-6 gap-3 px-6 w-full">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto pdf-hidden print:hidden px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print groepen
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto pdf-hidden print:hidden px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            </div>
          </div>
        )}

        {/* Donatie sectie - onderaan (alleen zichtbaar als groepen gemaakt zijn) */}
        {groepen.length > 0 && (
          <div className="mt-8">
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white border border-indigo-500/20">
              <h2 className="text-xl font-bold mb-2 text-center">
                ❤️ Steun dit project
              </h2>
              <p className="mb-6 text-center text-indigo-100">
                Vind je deze tool handig? Help me om meer gratis tools te maken voor leerkrachten!
              </p>
              <div className="flex justify-center">
                <a 
                  href='https://ko-fi.com/Z8Z01G7O8R' 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className="inline-block transform hover:scale-105 transition"
                >
                  <img 
                    src='/support_me_on_kofi_dark.png' 
                    alt='Steun me op Ko-fi' 
                    className="mx-auto h-12"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface LeerlingKaartProps {
  leerling: Leerling;
  bewerkMode: boolean;
  onVerplaats: (naarGroep: number) => void;
  groepen: Leerling[][];
  huidigeGroep: number;
  toonKleuren: boolean;
}

function LeerlingKaart({ leerling, bewerkMode, onVerplaats, groepen, huidigeGroep, toonKleuren }: LeerlingKaartProps) {
  const [toonVerplaats, setToonVerplaats] = useState(false);

  return (
    <div className="relative">
      <div
        className={`px-3 py-2 rounded-2xl ${
          toonKleuren && leerling.druk
            ? 'bg-orange-100 border-2 border-orange-300'
            : 'bg-white border-2 border-gray-200'
        } ${bewerkMode ? 'cursor-pointer hover:shadow-md transition' : ''}`}
        onClick={() => bewerkMode && setToonVerplaats(!toonVerplaats)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {leerling.naam}
            {toonKleuren && (
              <span className="ml-1 pdf-hidden">
                {leerling.geslacht === 'm' ? '♂️' : leerling.geslacht === 'v' ? '♀️' : '⚧️'}
              </span>
            )}
          </span>
          {leerling.druk && toonKleuren && (
            <span className="text-xs bg-orange-200 px-2 py-1 rounded pdf-hidden">⚠️</span>
          )}
        </div>
      </div>

      {bewerkMode && toonVerplaats && (
        <div className="absolute z-10 mt-1 bg-white border-2 border-indigo-300 rounded-2xl shadow-lg p-2 w-full">
          <p className="text-xs font-semibold text-gray-600 mb-1">Verplaats naar:</p>
          {groepen.map((_, idx: number) => (
            idx !== huidigeGroep && (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onVerplaats(idx);
                  setToonVerplaats(false);
                }}
                className="w-full text-left px-2 py-1 text-sm hover:bg-indigo-100 rounded"
              >
                Groep {idx + 1}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
