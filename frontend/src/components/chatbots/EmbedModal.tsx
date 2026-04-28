import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatbotId: string;
}

export default function EmbedModal({ isOpen, onClose, chatbotId }: EmbedModalProps) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const embedUrl = `${window.location.origin}/embed/${chatbotId}`;
  const embedCode = `<iframe\n  src="${embedUrl}"\n  style="width: 100%; height: 700px; border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"\n  allow="microphone"\n></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Nhúng vào Website</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            Sao chép mã iframe bên dưới và dán vào mã nguồn trang web của bạn để hiển thị chatbot. 
            <span className="font-semibold text-teal-600 ml-1">Lưu ý: Chatbot phải ở chế độ Công khai.</span>
          </p>

          <div className="relative group">
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed border border-gray-800">
              {embedCode}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all shadow-lg border border-gray-700"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-900">Xem thử trang nhúng</p>
                <p className="text-xs text-teal-700 mt-0.5 mb-2">Kiểm tra hiển thị của chatbot trên trang nhúng riêng biệt.</p>
                <a 
                  href={embedUrl} 
                  target="_blank" 
                  className="text-xs font-bold text-teal-600 hover:underline inline-flex items-center gap-1"
                >
                  Mở trang nhúng <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
