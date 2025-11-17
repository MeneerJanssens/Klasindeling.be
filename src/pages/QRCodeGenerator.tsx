import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';

export default function QRCodeGenerator() {
  const [url, setUrl] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (!url) return;
    
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const imageUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <QrCode className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
              QR-Code Generator
            </h1>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
          <div className="mb-6">
            <label htmlFor="url" className="block text-xl font-semibold text-gray-700 mb-3">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://klasindeling.be"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg transition"
            />
          </div>

          <div>
            <label htmlFor="size" className="block text-xl font-semibold text-gray-700 mb-3">
              Grootte: {qrSize}px
            </label>
            <input
              type="range"
              id="size"
              min="128"
              max="512"
              step="64"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              style={{
                background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((qrSize - 128) / (512 - 128)) * 100}%, #e5e7eb ${((qrSize - 128) / (512 - 128)) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Klein</span>
              <span>Groot</span>
            </div>
          </div>
        </div>

        {url && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Jouw QR-Code
            </h2>
            <div className="flex flex-col items-center gap-6">
              <div
                ref={qrRef}
                className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-indigo-200 rounded-xl shadow-inner"
              >
                <QRCodeCanvas
                  value={url}
                  size={qrSize}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <button
                onClick={downloadQRCode}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                <Download className="w-5 h-5" />
                Download als PNG
              </button>
              
              <p className="text-sm text-gray-500 text-center max-w-md">
                💡 Tip: Gebruik een hoge resolutie voor afdrukken en een lagere voor digitaal gebruik
              </p>
            </div>
          </div>
        )}

        {!url && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
                <QrCode className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Geen QR-code?
              </h2>
              <p className="text-gray-500 text-lg">
                Voer hierboven een URL in om te starten
              </p>
            </div>
          </div>
        )}

        {/* Donatie sectie */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white border border-indigo-500/20">
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
      </div>
    </div>
  );
}
