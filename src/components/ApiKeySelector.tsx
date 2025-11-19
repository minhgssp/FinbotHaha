

import React, { useState } from 'react';

interface ApiKeySelectorProps {
    onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
    const [isSelecting, setIsSelecting] = useState(false);

    const handleSelectKey = async () => {
        setIsSelecting(true);
        // Defensive check for production environments where aistudio might not be available.
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            try {
                await window.aistudio.openSelectKey();
                // Assume success and let the parent component handle the state change.
                onKeySelected();
            } catch (error) {
                console.error("Error opening select key dialog:", error);
                // Handle potential errors if the dialog fails to open.
                alert("Không thể mở hộp thoại chọn API key. Vui lòng thử lại.");
            } finally {
                setIsSelecting(false);
            }
        } else {
            alert("Tính năng chọn API key không khả dụng trong môi trường này. Vui lòng đảm bảo bạn đang chạy ứng dụng trong một môi trường được hỗ trợ.");
            setIsSelecting(false);
        }
    };

    return (
        <div className="h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 shadow-2xl text-center border border-slate-700">
                <h1 className="text-2xl font-bold text-green-400 mb-4">Chào mừng bạn!</h1>
                <p className="text-slate-300 mb-6">
                    Để sử dụng các tính năng của trợ lý AI, ứng dụng này cần quyền truy cập vào API của Google.
                    Vui lòng chọn một API key của riêng bạn để tiếp tục.
                </p>
                <button
                    onClick={handleSelectKey}
                    disabled={isSelecting}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-wait"
                >
                    {isSelecting ? 'Đang chờ...' : 'Chọn API Key'}
                </button>
                <p className="text-xs text-slate-500 mt-4">
                    Việc sử dụng API có thể phát sinh chi phí. {' '}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:underline"
                    >
                        Tìm hiểu thêm về thanh toán.
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ApiKeySelector;