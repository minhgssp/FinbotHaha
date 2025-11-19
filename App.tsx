

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TodoItem, IncomeSource, FinancialGoal, Transaction, Message, RecurringTransaction, Asset, Liability, AssetType, Sender } from './types.ts';
import { INITIAL_TODOS } from './constants.ts';
import { ChatBubbleIcon, ChartPieIcon, CreditCardIcon, ArrowPathIcon, BanknotesIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from './src/components/IconComponents.tsx';
import AssistantScreen from './src/features/assistant/AssistantScreen.tsx';
import DashboardScreen from './src/features/dashboard/DashboardScreen.tsx';
import TransactionsScreen from './src/features/transactions/TransactionsScreen.tsx';
import RecurringTransactionsScreen from './src/features/recurring/RecurringTransactionsScreen.tsx';
import AssetsAndDebtsScreen from './src/features/assets/AssetsAndDebtsScreen.tsx';
import { useTransactionChat } from './src/features/transactions/hooks/useTransactionChat.ts';
import useOnboarding from './src/features/onboarding/hooks/useOnboarding.ts';
import { useAssetChat } from './src/features/assets/hooks/useAssetChat.ts';
import LoginScreen from './src/components/LoginScreen.tsx';
import useDataManager from './src/hooks/useDataManager.ts';
import SettingsModal from './src/components/SettingsModal.tsx';

type Tab = 'chatbot' | 'transactions' | 'recurring' | 'assets' | 'dashboard';
export type ActiveAgent = 'onboarding' | 'transaction' | 'assets';
export type AuthState = 'pending' | 'guest' | 'premium';

const AUTH_STATE_KEY = 'financial-app-auth-state';
const USER_API_KEY = 'financial-app-user-api-key';

function App() {
  const [authState, setAuthState] = useState<AuthState>('pending');
  const [activeTab, setActiveTab] = useState<Tab>('chatbot');
  const [activeAgent, setActiveAgent] = useState<ActiveAgent>('transaction');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(() => localStorage.getItem(USER_API_KEY));
  const [defaultApiKey, setDefaultApiKey] = useState<string | null>(null);
  const [isKeyLoading, setIsKeyLoading] = useState(true);

  // Load auth state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem(AUTH_STATE_KEY) as AuthState | null;
    if (savedState && ['guest', 'premium'].includes(savedState)) {
      setAuthState(savedState);
    } else {
      setAuthState('pending'); // Fallback to login screen
    }
  }, []);

  // Fetch default API key when auth state is determined
  useEffect(() => {
    if (authState === 'pending') {
      console.log('[Debug] Auth state is pending, skipping API key fetch.');
      setIsKeyLoading(false);
      return;
    }

    const fetchDefaultKey = async () => {
      console.log(`[Debug] Attempting to fetch default API key for authState: '${authState}'...`);
      setIsKeyLoading(true);
      try {
        const response = await fetch(`/api/keys?mode=${authState}`);
        console.log(`[Debug] API response received with status: ${response.status}`);
        
        if (response.ok) {
          const { apiKey } = await response.json();
          console.log(`[Debug] Successfully fetched default API key.`);
          setDefaultApiKey(apiKey);
        } else {
          const errorText = await response.text();
          console.error(`[Debug] Failed to fetch default API key. Status: ${response.status}. Response: ${errorText}`);
          setDefaultApiKey(null);
        }
      } catch (error) {
        console.error('[Debug] Network or other error fetching default API key:', error);
        setDefaultApiKey(null);
      } finally {
        setIsKeyLoading(false);
        console.log('[Debug] API key fetch process finished.');
      }
    };

    fetchDefaultKey();
  }, [authState]);
  
  const currentApiKey = useMemo(() => userApiKey || defaultApiKey, [userApiKey, defaultApiKey]);

  const {
    appData,
    setAppData,
    isLoading: isDataLoading,
    error,
  } = useDataManager(authState);

  const {
    incomeSources, financialGoal, transactions, recurringTransactions, todos, assets, liabilities
  } = appData;

  // Due date processing for recurring transactions
  useEffect(() => {
    if (isDataLoading || authState === 'pending' || !recurringTransactions) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updatedRecurring = [...recurringTransactions];
    const newTransactions: Transaction[] = [];
    let hasChanges = false;

    updatedRecurring.forEach((item, index) => {
      let nextDueDate = new Date(item.nextDueDate);
      if (nextDueDate > today) return; // Skip if not due yet

      hasChanges = true;
      while (nextDueDate <= today) {
        newTransactions.push({
          id: `recurring-${item.id}-${nextDueDate.toISOString()}`,
          description: item.description, amount: item.amount, type: item.type,
          category: item.category, date: nextDueDate.toISOString(),
        });
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }
      updatedRecurring[index] = { ...item, nextDueDate: nextDueDate.toISOString().split('T')[0] };
    });

    if (hasChanges) {
      const netChange = newTransactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
      setAppData(prev => ({
        ...prev,
        transactions: [...prev.transactions, ...newTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        recurringTransactions: updatedRecurring,
        assets: prev.assets.map(asset =>
          asset.type === AssetType.CASH ? { ...asset, value: asset.value + netChange } : asset
        ),
      }));
    }
  // We only want this to run when the app loads or data changes, not on every state update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataLoading, authState]);


  // All handler functions now use the central `setAppData` updater
  const setTodos = (updater: React.SetStateAction<TodoItem[]>) => {
    setAppData(prev => ({...prev, todos: typeof updater === 'function' ? updater(prev.todos) : updater }));
  };

  const handleProfileUpdate = useCallback((data: { incomes: IncomeSource[], goal: FinancialGoal | null }) => {
    setAppData(prev => {
      const newTodos = [...prev.todos];
      if (data.incomes.length > 0) newTodos[0] = { ...newTodos[0], completed: true };
      if (data.goal) newTodos[1] = { ...newTodos[1], completed: true };
      if (data.incomes.length > 0 && data.goal) newTodos[2] = { ...newTodos[2], completed: true };
      return { ...prev, incomeSources: data.incomes, financialGoal: data.goal, todos: newTodos };
    });
  }, [setAppData]);

  const handleAddTransaction = useCallback((newTransaction: Transaction) => {
    setAppData(prev => {
      const amountChange = newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;
      const newTodos = [...prev.todos];
      if (!newTodos[3].completed) newTodos[3] = { ...newTodos[3], completed: true };
      return {
        ...prev,
        transactions: [newTransaction, ...prev.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        assets: prev.assets.map(asset => asset.type === AssetType.CASH ? { ...asset, value: asset.value + amountChange } : asset),
        todos: newTodos,
      };
    });
  }, [setAppData]);
  
  const handleDeleteTransaction = useCallback((id: string) => {
    setAppData(prev => {
      const txToDelete = prev.transactions.find(t => t.id === id);
      if (!txToDelete) return prev;
      const amountChange = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;
      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        assets: prev.assets.map(asset => asset.type === AssetType.CASH ? { ...asset, value: asset.value + amountChange } : asset),
      };
    });
  }, [setAppData]);

  const handleAddRecurringTransaction = useCallback((newItem: RecurringTransaction) => {
    setAppData(prev => ({ ...prev, recurringTransactions: [...prev.recurringTransactions, newItem] }));
  }, [setAppData]);

  const handleUpdateRecurringTransaction = useCallback((updatedItem: RecurringTransaction) => {
    setAppData(prev => ({ ...prev, recurringTransactions: prev.recurringTransactions.map(item => item.id === updatedItem.id ? updatedItem : item) }));
  }, [setAppData]);

  const handleDeleteRecurringTransaction = useCallback((id: string) => {
    setAppData(prev => ({ ...prev, recurringTransactions: prev.recurringTransactions.filter(item => item.id !== id) }));
  }, [setAppData]);
  
  // All asset/liability handlers are now updated to use setAppData
  const handleAddAsset = useCallback((asset: Omit<Asset, 'id'>) => {
    setAppData(prev => {
        if (asset.type === AssetType.CASH) {
            return { ...prev, assets: prev.assets.map(a => a.type === AssetType.CASH ? { ...a, value: a.value + asset.value } : a)};
        }
        const newAsset: Asset = { ...asset, id: `asset-${Date.now()}` };
        return { ...prev, assets: [...prev.assets, newAsset] };
    });
  }, [setAppData]);
  
  const handleAddLiability = useCallback((liability: Omit<Liability, 'id'>) => {
      const newLiability: Liability = { ...liability, id: `liability-${Date.now()}`, paymentHistory: [] };
      setAppData(prev => ({...prev, liabilities: [...prev.liabilities, newLiability] }));
  }, [setAppData]);
  
  const handleBuyAsset = useCallback((name: string, type: AssetType, totalValue: number, quantity: number, unit: string) => {
    setAppData(prev => {
        let assetExists = false;
        const updatedAssets = prev.assets.map(asset => {
            if (asset.type === AssetType.CASH) return { ...asset, value: asset.value - totalValue };
            if (asset.name.toLowerCase() === name.toLowerCase()) {
                assetExists = true;
                const newTx = { id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'buy' as const, quantity, totalValue };
                const newTxs = [...(asset.transactions || []), newTx];
                const totalBuyQty = newTxs.filter(t => t.type === 'buy').reduce((s, t) => s + t.quantity, 0);
                const totalSellQty = newTxs.filter(t => t.type === 'sell').reduce((s, t) => s + t.quantity, 0);
                return { ...asset, quantity: totalBuyQty - totalSellQty, transactions: newTxs };
            }
            return asset;
        });
        if (!assetExists) {
            const newTx = { id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'buy' as const, quantity, totalValue };
            updatedAssets.push({ id: `asset-${Date.now()}`, name, type, value: totalValue, quantity, unit, transactions: [newTx] });
        }
        return {...prev, assets: updatedAssets };
    });
  }, [setAppData]);

  const handleSellAsset = useCallback((name: string, totalValue: number, quantity: number) => {
    setAppData(prev => {
        const assetToSell = prev.assets.find(a => a.name.toLowerCase() === name.toLowerCase());
        if (!assetToSell || (assetToSell.quantity ?? 0) < quantity) return prev;

        const updatedAssets = prev.assets.map(asset => {
            if (asset.type === AssetType.CASH) return { ...asset, value: asset.value + totalValue };
            if (asset.id === assetToSell.id) {
                const newTx = { id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'sell' as const, quantity, totalValue };
                const newTxs = [...(asset.transactions || []), newTx];
                const totalBuyQty = newTxs.filter(t => t.type === 'buy').reduce((s, t) => s + t.quantity, 0);
                const totalSellQty = newTxs.filter(t => t.type === 'sell').reduce((s, t) => s + t.quantity, 0);
                return { ...asset, quantity: totalBuyQty - totalSellQty, transactions: newTxs };
            }
            return asset;
        });
        return { ...prev, assets: updatedAssets };
    });
  }, [setAppData]);

  const handleRepayLiability = useCallback((name: string, amount: number) => {
    setAppData(prev => {
        const updatedLiabilities = prev.liabilities.map(l => {
            if (l.name.toLowerCase() === name.toLowerCase()) {
                const newPayment = { id: `pay-${Date.now()}`, date: new Date().toISOString(), amount };
                return { ...l, paymentHistory: [...l.paymentHistory, newPayment] };
            }
            return l;
        });
        const updatedAssets = prev.assets.map(a => a.type === AssetType.CASH ? { ...a, value: a.value - amount } : a);
        return { ...prev, liabilities: updatedLiabilities, assets: updatedAssets };
    });
  }, [setAppData]);

  const handleDeleteAsset = useCallback((id: string) => {
      setAppData(prev => ({...prev, assets: prev.assets.filter(a => a.id !== id)}));
  }, [setAppData]);

  const handleUpdateAsset = useCallback((updatedAsset: Asset) => {
      setAppData(prev => ({...prev, assets: prev.assets.map(a => a.id === updatedAsset.id ? updatedAsset : a)}));
  }, [setAppData]);

  const handleUpdateLiability = useCallback((updatedLiability: Liability) => {
      setAppData(prev => ({...prev, liabilities: prev.liabilities.map(l => l.id === updatedLiability.id ? updatedLiability : l)}));
  }, [setAppData]);
  
  const handleDeleteLiability = useCallback((id: string) => {
      setAppData(prev => ({...prev, liabilities: prev.liabilities.filter(l => l.id !== id)}));
  }, [setAppData]);

  const handleLoginSuccess = useCallback((state: AuthState) => {
    localStorage.setItem(AUTH_STATE_KEY, state);
    setAuthState(state);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_STATE_KEY);
    setAuthState('pending');
    setAppData({
        incomeSources: [], financialGoal: null, transactions: [], 
        recurringTransactions: [], todos: INITIAL_TODOS, assets: [], liabilities: [],
    });
  }, [setAppData]);

  const handleSaveUserApiKey = useCallback((key: string) => {
    localStorage.setItem(USER_API_KEY, key);
    setUserApiKey(key);
  }, []);

  const handleClearUserApiKey = useCallback(() => {
    localStorage.removeItem(USER_API_KEY);
    setUserApiKey(null);
  }, []);

  const {
      messages: onboardingMessages, isLoading: isOnboardingLoading, handleSendMessage: handleSendOnboardingMessage,
  } = useOnboarding({ onProfileUpdate: handleProfileUpdate, todos, setTodos, apiKey: currentApiKey });
  // FIX: Pass handler functions to the useTransactionChat hook using explicit key-value pairs.
  const {
      messages: transactionMessages, isLoading: isTransactionChatLoading, handleSendMessage: handleSendTransactionMessage, handleUndoTransaction,
  } = useTransactionChat({ 
      onAddTransaction: handleAddTransaction, 
      onAddRecurringTransaction: handleAddRecurringTransaction, 
      onDeleteTransaction: handleDeleteTransaction, 
      onDeleteRecurringTransaction: handleDeleteRecurringTransaction, 
      apiKey: currentApiKey 
  });
  // FIX: Pass handler functions to the useAssetChat hook using explicit key-value pairs.
  const {
    messages: assetMessages, isLoading: isAssetChatLoading, handleSendMessage: handleSendAssetMessage, handleConfirm: handleConfirmAsset, handleCancel: handleCancelAsset,
  } = useAssetChat({ 
      assets, 
      liabilities, 
      onAddAsset: handleAddAsset, 
      onAddLiability: handleAddLiability, 
      onBuyAsset: handleBuyAsset, 
      onSellAsset: handleSellAsset, 
      onRepayLiability: handleRepayLiability, 
      apiKey: currentApiKey 
  });

  if (authState === 'pending') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (isDataLoading || isKeyLoading) {
      return (
          <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-t-green-500 border-slate-700 rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-400">Đang khởi tạo...</p>
              </div>
          </div>
      );
  }

  const NavButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode; }> = ({ tabName, label, icon }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex flex-col items-center justify-center w-full py-2 px-1 transition-colors duration-200 focus:outline-none ${ activeTab === tabName ? 'text-green-400' : 'text-slate-400 hover:text-white' }`}>
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );

  const activeMessages = activeAgent === 'onboarding' ? onboardingMessages : activeAgent === 'transaction' ? transactionMessages : assetMessages;
  const activeIsLoading = activeAgent === 'onboarding' ? isOnboardingLoading : activeAgent === 'transaction' ? isTransactionChatLoading : isAssetChatLoading;
  const activeHandleSendMessage = activeAgent === 'onboarding' ? handleSendOnboardingMessage : activeAgent === 'transaction' ? handleSendTransactionMessage : handleSendAssetMessage;
  const activeHandleConfirm = activeAgent === 'assets' ? handleConfirmAsset : () => {};
  const activeHandleCancel = activeAgent === 'assets' ? handleCancelAsset : () => {};
  const activeHandleUndo = activeAgent === 'transaction' ? handleUndoTransaction : () => {};

  return (
    <>
      <div className="h-screen bg-slate-900 text-white flex flex-col">
        <header className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 h-14 flex items-center justify-between px-4">
          <h1 className="text-lg font-bold text-green-400">Trợ Lý Tài Chính</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Cog6ToothIcon className="w-6 h-6" /></button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors"><ArrowLeftOnRectangleIcon className="w-6 h-6" /></button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full">
              {activeTab === 'chatbot' && <AssistantScreen messages={activeMessages} isLoading={activeIsLoading} handleSendMessage={activeHandleSendMessage} activeAgent={activeAgent} onSwitchAgent={setActiveAgent} handleConfirm={activeHandleConfirm} handleCancel={activeHandleCancel} handleUndoTransaction={activeHandleUndo} />}
              {activeTab === 'transactions' && <div className="h-full"><TransactionsScreen transactions={transactions} onDeleteTransaction={handleDeleteTransaction} /></div>}
              {activeTab === 'recurring' && <RecurringTransactionsScreen items={recurringTransactions} onAdd={handleAddRecurringTransaction} onUpdate={handleUpdateRecurringTransaction} onDelete={handleDeleteRecurringTransaction}/>}
              {activeTab === 'assets' && <AssetsAndDebtsScreen assets={assets} liabilities={liabilities} onAddAsset={handleAddAsset} onUpdateAsset={handleUpdateAsset} onDeleteAsset={handleDeleteAsset} onAddLiability={handleAddLiability} onUpdateLiability={handleUpdateLiability} onDeleteLiability={handleDeleteLiability} onPurchaseAsset={handleBuyAsset} onSellAsset={handleSellAsset} />}
              {activeTab === 'dashboard' && <div className="p-4 sm:p-6 lg:p-8 h-full"><DashboardScreen incomeSources={incomeSources} financialGoal={financialGoal} transactions={transactions} todos={todos} /></div>}
          </div>
        </main>
        
        <div className="flex-shrink-0 relative">
          <nav className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 grid grid-cols-5 justify-around items-center h-16">
              <NavButton tabName="dashboard" label="Dashboard" icon={<ChartPieIcon className="w-6 h-6" />} />
              <NavButton tabName="transactions" label="Giao dịch" icon={<CreditCardIcon className="w-6 h-6" />} />
              <NavButton tabName="chatbot" label="Trợ lý AI" icon={<ChatBubbleIcon className="w-6 h-6" />} />
              <NavButton tabName="recurring" label="Định kỳ" icon={<ArrowPathIcon className="w-6 h-6" />} />
              <NavButton tabName="assets" label="Tài sản" icon={<BanknotesIcon className="w-6 h-6" />} />
          </nav>
        </div>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentKey={userApiKey}
        onSaveKey={handleSaveUserApiKey}
        onClearKey={handleClearUserApiKey}
      />
    </>
  );
}

export default App;