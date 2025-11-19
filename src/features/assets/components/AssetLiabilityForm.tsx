
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Liability, AssetType, LiabilityType } from '../../../../types.ts';

interface AssetLiabilityFormProps {
    isOpen: boolean;
    onClose: () => void;
    itemType: 'asset' | 'liability';
    existingItem?: Asset | Liability;
    onSaveAsset: (item: Asset | Omit<Asset, 'id'>) => void;
    onDeleteAsset: (id: string) => void;
    onSaveLiability: (item: Liability | Omit<Liability, 'id'>) => void;
    onDeleteLiability: (id: string) => void;
}

const AssetLiabilityForm: React.FC<AssetLiabilityFormProps> = ({
    isOpen, onClose, itemType, existingItem,
    onSaveAsset, onDeleteAsset, onSaveLiability, onDeleteLiability
}) => {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState('');
    const [lender, setLender] = useState('');
    const [unit, setUnit] = useState(''); // State for unit

    const isAsset = itemType === 'asset';
    const typeOptions = useMemo(() => {
        return isAsset ? Object.values(AssetType) : Object.values(LiabilityType);
    }, [isAsset]);

    useEffect(() => {
        if (isOpen) {
            if (existingItem) {
                setName(existingItem.name);
                setType(existingItem.type);
                if (isAsset) {
                    setValue(String((existingItem as Asset).value));
                    setUnit((existingItem as Asset).unit || '');
                } else {
                    setValue(String((existingItem as Liability).initialAmount));
                    setLender((existingItem as Liability).lender || '');
                }
            } else {
                // Reset form
                setName('');
                setValue('');
                setLender('');
                setUnit('');
                setType(typeOptions[0]);
            }
        }
    }, [existingItem, isOpen, isAsset, typeOptions]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericValue = parseFloat(value || '0');
        if (name.trim()) {
            if (isAsset) {
                const isInvestment = type === AssetType.INVESTMENT;
                 if (isInvestment && !unit.trim() && !existingItem) {
                    alert('Vui lòng nhập đơn vị cho tài sản đầu tư.');
                    return;
                }
                const assetData = {
                    name: name.trim(),
                    type: type as AssetType,
                    // For new investment assets, value starts at 0, transactions will define it.
                    // For other assets, use the input value.
                    value: isInvestment && !existingItem ? 0 : numericValue,
                    unit: isInvestment ? unit.trim() : undefined,
                    transactions: isInvestment ? (existingItem as Asset)?.transactions ?? [] : undefined,
                    quantity: isInvestment ? (existingItem as Asset)?.quantity ?? 0 : undefined,
                };
                
                onSaveAsset(existingItem ? { ...existingItem, ...assetData, value: numericValue, unit: isInvestment ? unit : undefined } : assetData);
            } else {
                const liabilityData = {
                    name: name.trim(),
                    initialAmount: numericValue,
                    type: type as LiabilityType,
                    lender: lender.trim(),
                    paymentHistory: (existingItem as Liability)?.paymentHistory ?? []
                };
                onSaveLiability(existingItem ? { ...existingItem, ...liabilityData } : liabilityData);
            }
            onClose();
        }
    };

    const handleDelete = () => {
        if (existingItem && window.confirm(`Bạn có chắc muốn xóa "${existingItem.name}" không?`)) {
            if (isAsset) {
                onDeleteAsset(existingItem.id);
            } else {
                onDeleteLiability(existingItem.id);
            }
            onClose();
        }
    };

    const title = `${existingItem ? 'Chỉnh sửa' : 'Thêm'} ${isAsset ? 'Tài sản' : 'Khoản nợ'}`;
    const valueLabel = isAsset ? 'Giá trị' : 'Số tiền nợ ban đầu';

    const isCreatingNewInvestment = isAsset && type === AssetType.INVESTMENT && !existingItem;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Tên</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent" required />
                    </div>
                    
                    {!isAsset && (
                         <div>
                            <label htmlFor="lender" className="block text-sm font-medium text-slate-300 mb-1">Bên cho vay (Tùy chọn)</label>
                            <input type="text" id="lender" value={lender} onChange={e => setLender(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent" />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        {!isCreatingNewInvestment && (
                             <div>
                                <label htmlFor="value" className="block text-sm font-medium text-slate-300 mb-1">{valueLabel}</label>
                                <input type="number" id="value" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent" required />
                            </div>
                        )}
                        
                        <div className={isCreatingNewInvestment ? 'col-span-2' : ''}>
                             <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">Loại</label>
                             <select id="type" value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent">
                                {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {isCreatingNewInvestment && (
                         <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-slate-300 mb-1">Đơn vị (ví dụ: chỉ, cổ phiếu)</label>
                            <input type="text" id="unit" value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent" placeholder="chỉ, lượng, cổ phiếu..." required />
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4">
                        {existingItem && (
                            <button type="button" onClick={handleDelete} className="text-red-500 hover:underline">Xóa</button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors">Hủy</button>
                            <button type="submit" className="py-2 px-6 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors">Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetLiabilityForm;
