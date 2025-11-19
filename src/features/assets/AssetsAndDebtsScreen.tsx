


import React, { useState, useMemo } from 'react';
import { Asset, Liability, AssetType } from '../../../types.ts';
import NetWorthCard from './components/NetWorthCard.tsx';
import AssetLiabilityItem from './components/AssetLiabilityItem.tsx';
import AssetLiabilityForm from './components/AssetLiabilityForm.tsx';
import AssetDetailModal from './components/AssetDetailModal.tsx';
import LiabilityDetailModal from './components/LiabilityDetailModal.tsx';
import { PlusCircleIcon } from '../../../components/IconComponents.tsx';

type EditingItem = { type: 'asset', data: Asset } | { type: 'liability', data: Liability };
type DetailItem = { type: 'asset', data: Asset } | { type: 'liability', data: Liability };

interface AssetsAndDebtsScreenProps {
    assets: Asset[];
    liabilities: Liability[];
    onAddAsset: (asset: Omit<Asset, 'id'>) => void;
    onUpdateAsset: (asset: Asset) => void; // This will now be for market value updates
    onDeleteAsset: (id: string) => void;
    onAddLiability: (liability: Omit<Liability, 'id'>) => void;
    onUpdateLiability: (liability: Liability) => void;
    onDeleteLiability: (id: string) => void;
    onPurchaseAsset: (name: string, type: AssetType, totalValue: number, quantity: number, unit: string) => void;
    onSellAsset: (sourceAssetName: string, proceeds: number, quantity: number) => void;
}

const AssetsAndDebtsScreen: React.FC<AssetsAndDebtsScreenProps> = (props) => {
    const { 
        assets, liabilities, onUpdateAsset, onUpdateLiability, 
        onPurchaseAsset, onSellAsset 
    } = props;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'asset' | 'liability'>('asset');
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [detailItem, setDetailItem] = useState<DetailItem | null>(null);

    const totalAssets = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);
    
    const totalLiabilities = useMemo(() => liabilities.reduce((sum, liability) => {
        const totalPaid = liability.paymentHistory.reduce((paidSum, p) => paidSum + p.amount, 0);
        return sum + (liability.initialAmount - totalPaid);
    }, 0), [liabilities]);

    const netWorth = totalAssets - totalLiabilities;

    const handleOpenFormModal = (type: 'asset' | 'liability', itemToEdit: Asset | Liability | null = null) => {
        setModalType(type);
        setEditingItem(itemToEdit ? { type, data: itemToEdit as any } : null);
        setIsFormModalOpen(true);
    };
    
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingItem(null);
    };

    const handleOpenDetailModal = (type: 'asset' | 'liability', item: Asset | Liability) => {
        setDetailItem({ type, data: item as any });
    };

    const handleCloseDetailModal = () => {
        setDetailItem(null);
    };

    const ListSection: React.FC<{
        title: string;
        items: (Asset | Liability)[];
        type: 'asset' | 'liability';
    }> = ({ title, items, type }) => (
        <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button 
                    onClick={() => handleOpenFormModal(type)}
                    className="flex items-center text-green-400 font-semibold hover:text-green-300 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-1" />
                    Thêm
                </button>
            </div>
            {items.length > 0 ? (
                <div className="space-y-2">
                    {items.map(item => (
                         <AssetLiabilityItem 
                            key={item.id} 
                            item={item} 
                            type={type} 
                            onEdit={() => handleOpenDetailModal(type, item)} 
                        />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-4">Chưa có dữ liệu.</p>
            )}
        </div>
    );
    
    return (
        <div className="flex flex-col h-full bg-slate-900 p-4 custom-scrollbar overflow-y-auto">
            <NetWorthCard netWorth={netWorth} totalAssets={totalAssets} totalLiabilities={totalLiabilities} />
            
            <div className="space-y-6 mt-6">
                <ListSection title="Tài sản" items={assets} type="asset" />
                <ListSection title="Nợ phải trả" items={liabilities} type="liability" />
            </div>

            {isFormModalOpen && (
                <AssetLiabilityForm 
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    itemType={modalType}
                    existingItem={editingItem?.data}
                    onSaveAsset={editingItem ? onUpdateAsset : props.onAddAsset}
                    onDeleteAsset={props.onDeleteAsset}
                    onSaveLiability={editingItem ? onUpdateLiability : props.onAddLiability}
                    onDeleteLiability={props.onDeleteLiability}
                />
            )}

            {detailItem?.type === 'asset' && (
                <AssetDetailModal
                    asset={detailItem.data}
                    onClose={handleCloseDetailModal}
                    onPurchase={(cost, quantity) => onPurchaseAsset(detailItem.data.name, detailItem.data.type, cost, quantity, detailItem.data.unit || '')}
                    onSell={(proceeds, quantity) => onSellAsset(detailItem.data.name, proceeds, quantity)}
                />
            )}

            {detailItem?.type === 'liability' && (
                <LiabilityDetailModal
                    liability={detailItem.data}
                    onClose={handleCloseDetailModal}
                    onSave={onUpdateLiability}
                />
            )}
        </div>
    );
};

export default AssetsAndDebtsScreen;