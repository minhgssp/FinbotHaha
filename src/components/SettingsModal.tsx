
import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentKey: string | null;
    onSaveKey: (key: string) => void;
    onClearKey: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentKey, onSaveKey, onClearKey }) => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKey(currentKey || '');
        }
    }, [isOpen, currentKey]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (apiKey.trim()) {
            onSaveKey(apiKey.trim());
            onClose();
        }
    };

    const handleClear = () => {
        onClearKey();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-white">Cài đặt</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-slate-300 mb-1">
                            Google Gemini API Key
                        </label>
                        <input 
                            type="password" 
                            id="api-key" 
                            value={apiKey} 
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="Nhập API key của bạn"
                            className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent" 
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Key của bạn được lưu an toàn trên trình duyệt này và sẽ được ưu tiên sử dụng.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-700">
                    <button 
                        type="button" 
                        onClick={handleClear} 
                        className="text-red-500 hover:underline text-sm font-medium"
                        disabled={!currentKey}
                    >
                        Dùng key mặc định
                    </button>
                    <div className="flex gap-3 ml-auto">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors">Hủy</button>
                        <button type="button" onClick={handleSave} className="py-2 px-6 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors">Lưu</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
