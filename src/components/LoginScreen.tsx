
import React, { useState } from 'react';
import { AuthState } from '../../App.tsx';
import { SparklesIcon } from './IconComponents.tsx';

interface LoginScreenProps {
  onLoginSuccess: (state: AuthState) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePremiumLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onLoginSuccess('premium');
      } else {
        const data = await response.json();
        setError(data.error || 'Mật khẩu không đúng. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 shadow-2xl text-center border border-slate-700">
        <SparklesIcon className="w-12 h-12 mx-auto text-green-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Trợ lý Tài chính Cá nhân</h1>
        <p className="text-slate-400 mb-8">Bắt đầu quản lý tài chính của bạn một cách thông minh.</p>
        
        <div className="space-y-4">
          <button
            onClick={() => onLoginSuccess('guest')}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Tiếp tục với tư cách Khách
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-800 px-2 text-slate-500">HOẶC</span>
            </div>
          </div>
          
          <form onSubmit={handlePremiumLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu Premium"
              className="w-full bg-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            {error && <p className="text-red-500 text-sm mt-2 text-left">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-wait"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập Premium'}
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Chế độ Khách sẽ lưu dữ liệu trên trình duyệt này. <br/>
          Chế độ Premium lưu dữ liệu trên đám mây.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;