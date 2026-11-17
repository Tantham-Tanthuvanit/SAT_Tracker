import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Laptop, Copy, Check, X, Wifi, ShieldAlert } from 'lucide-react';
import { fetchNetworkInfo } from '../api';

export default function NetworkModal({ isOpen, onClose }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetchNetworkInfo()
      .then((data) => {
        setNetworkInfo(data);
        // Default to first non-localhost LAN IP URL if available
        const preferred = data.access_urls.find(u => !u.includes('localhost') && !u.includes('127.0.0.1')) || data.access_urls[0];
        setSelectedUrl(preferred || window.location.origin);
      })
      .catch((err) => {
        console.error('Failed to fetch network info:', err);
        setSelectedUrl(window.location.origin);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!selectedUrl) return;

    QRCode.toDataURL(selectedUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#f8fafc',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [selectedUrl]);

  if (!isOpen) return null;

  const handleCopy = (urlToCopy) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Open on Phone & Network</h2>
              <p className="text-xs text-slate-400">Access your SAT Tracker from any device in your home</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm">Detecting network interfaces...</p>
            </div>
          ) : (
            <>
              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="bg-white p-2.5 rounded-xl shadow-lg shadow-indigo-950/30">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Network QR Code" className="w-48 h-48 rounded-lg" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-500">Generating QR...</div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-indigo-300 font-medium">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Scan with your phone's camera to open instantly</span>
                </div>
              </div>

              {/* URL Selection & Copy */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Network Access Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono text-sm text-indigo-300 select-all truncate">
                    {selectedUrl}
                  </div>
                  <button
                    onClick={() => handleCopy(selectedUrl)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Multiple IP Choices if any */}
              {networkInfo?.access_urls && networkInfo.access_urls.length > 1 && (
                <div>
                  <span className="block text-xs text-slate-400 mb-2">Available host addresses:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {networkInfo.access_urls.map((url) => (
                      <button
                        key={url}
                        onClick={() => setSelectedUrl(url)}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-mono transition border ${
                          selectedUrl === url
                            ? 'bg-indigo-950/50 text-indigo-300 border-indigo-500/50'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{url}</span>
                          {url.includes('localhost') ? (
                            <Laptop className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400 ml-1 shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Quick Tips for Cross-Device Access</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
                  <li>Make sure your phone and server are on the <strong>same Wi-Fi network</strong>.</li>
                  <li>On <strong>Mac Mini M1</strong>: Runs seamlessly; macOS allows local subnet connections.</li>
                  <li>On <strong>Windows</strong>: If your phone cannot connect, allow Python through Windows Defender Firewall when prompted or check port 8000.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
