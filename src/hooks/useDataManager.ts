import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthState } from '../../App.tsx';
import { IncomeSource, FinancialGoal, Transaction, RecurringTransaction, TodoItem, Asset, Liability, AssetType } from '../../types.ts';
import { INITIAL_TODOS } from '../../constants.ts';

const GUEST_STORAGE_KEY = 'financial-app-guest-data-v1';
const DEBOUNCE_DELAY = 1500; // 1.5 seconds

export interface AppData {
    incomeSources: IncomeSource[];
    financialGoal: FinancialGoal | null;
    transactions: Transaction[];
    recurringTransactions: RecurringTransaction[];
    todos: TodoItem[];
    assets: Asset[];
    liabilities: Liability[];
}

const initialData: AppData = {
    incomeSources: [],
    financialGoal: null,
    transactions: [],
    recurringTransactions: [],
    todos: INITIAL_TODOS,
    assets: [{ id: 'asset-cash-default', name: 'Tiền mặt', type: AssetType.CASH, value: 0 }],
    liabilities: [],
};


const useDataManager = (authState: AuthState) => {
    const [appData, setAppData] = useState<AppData>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const debounceTimer = useRef<number | null>(null);

    const saveData = useCallback(async (data: AppData) => {
        if (authState === 'pending') return;

        if (authState === 'guest') {
            try {
                localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
            } catch (err) {
                console.error("Failed to save to localStorage", err);
                setError("Không thể lưu dữ liệu cục bộ.");
            }
        } else if (authState === 'premium') {
            console.log('[DataManager] Premium user: Attempting to save data to server. Payload:', data);
            try {
                const response = await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({ error: 'Unknown server error' }));
                    throw new Error(`Server responded with ${response.status}: ${errorBody.error}`);
                }
                
                const responseBody = await response.json();
                console.log(`[DataManager] Server successfully saved data. Status: ${response.status}. Body:`, responseBody);
                // Optionally clear error on success
                if (error) setError(null);

            } catch (err) {
                console.error("[DataManager] CRITICAL: Failed to save data to server:", err);
                setError("Không thể đồng bộ dữ liệu với máy chủ. Vui lòng kiểm tra kết nối mạng hoặc liên hệ hỗ trợ.");
            }
        }
    }, [authState, error]);
    
    const debouncedSave = useCallback((data: AppData) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = window.setTimeout(() => {
            saveData(data);
        }, DEBOUNCE_DELAY);
    }, [saveData]);

    useEffect(() => {
        if (authState === 'pending') {
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let dataToLoad: AppData = initialData;
                if (authState === 'guest') {
                    const localData = localStorage.getItem(GUEST_STORAGE_KEY);
                    if (localData) {
                        dataToLoad = JSON.parse(localData);
                    }
                } else if (authState === 'premium') {
                    console.log('[DataManager] Premium user: Attempting to load data from server...');
                    const response = await fetch('/api/data');
                    console.log(`[DataManager] Server responded to load request with status: ${response.status}`);
                    if (response.ok) {
                        const serverData = await response.json();
                        console.log('[DataManager] Data received from server:', serverData);
                        if (serverData) {
                           dataToLoad = serverData;
                        }
                    } else {
                        throw new Error('Failed to fetch data from server.');
                    }
                }
                
                // Ensure default cash asset exists
                if (!dataToLoad.assets || !dataToLoad.assets.some(a => a.type === AssetType.CASH)) {
                    const cashAsset: Asset = { id: 'asset-cash-default', name: 'Tiền mặt', type: AssetType.CASH, value: 0 };
                    dataToLoad.assets = dataToLoad.assets ? [cashAsset, ...dataToLoad.assets] : [cashAsset];
                }

                setAppData(dataToLoad);
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Không thể tải dữ liệu.");
                setAppData(initialData);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [authState]);
    
    const setAppDataWithSave = useCallback((updater: React.SetStateAction<AppData>) => {
        setAppData(prevData => {
            const newData = typeof updater === 'function' ? updater(prevData) : updater;
            debouncedSave(newData);
            return newData;
        });
    }, [debouncedSave]);


    return {
        appData,
        setAppData: setAppDataWithSave,
        isLoading,
        error,
    };
};

export default useDataManager;