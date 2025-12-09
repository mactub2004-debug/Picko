import { useState, useRef, useEffect } from 'react';
import { Plus, Check, Trash2, ShoppingBag, Package, GripVertical } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { demoProducts } from '../../lib/demo-data';
import { StorageService } from '../../lib/storage';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Reorder, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface ShoppingListItem {
    id: string;
    name: string;
    checked: boolean;
    productId?: string;
    image?: string;
    brand?: string;
    type?: 'FOOD' | 'COSMETIC';
}

interface ShoppingListScreenProps {
    onNavigate: (screen: string, data?: any) => void;
}

export function ShoppingListScreen({ onNavigate }: ShoppingListScreenProps) {
    const { t } = useLanguage();
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [swipedItem, setSwipedItem] = useState<string | null>(null);
    const [scanHistory, setScanHistory] = useState<any[]>([]);
    const touchStartX = useRef<number>(0);
    const touchCurrentX = useRef<number>(0);

    // Load purchased items from scan history
    useEffect(() => {
        const history = StorageService.getScanHistory();
        setScanHistory(history);

        // Get items marked as purchased
        const purchasedItems = history
            .filter(item => item.isPurchased)
            .map(item => ({
                id: item.id,
                name: item.product.name,
                checked: false,
                productId: item.product.id,
                image: item.product.image,
                brand: item.product.brand,
                type: item.product.type
            }));

        setItems(purchasedItems);
    }, []);

    const handleAddItem = () => {
        if (newItemName.trim()) {
            const newItem: ShoppingListItem = {
                id: Date.now().toString(),
                name: newItemName.trim(),
                checked: false,
            };
            setItems([...items, newItem]);
            setNewItemName('');
        }
    };

    const handleToggleItem = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
        setSwipedItem(null);
    };

    const handleTouchStart = (e: React.TouchEvent, id: string) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent, id: string) => {
        touchCurrentX.current = e.touches[0].clientX;
        const diff = touchStartX.current - touchCurrentX.current;

        if (diff > 50) {
            setSwipedItem(id);
        } else if (diff < -50) {
            setSwipedItem(null);
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = 0;
        touchCurrentX.current = 0;
    };

    const handleAddScannedProduct = (product: any) => {
        const newItem: ShoppingListItem = {
            id: Date.now().toString(),
            name: product.name,
            checked: false,
            productId: product.id,
            image: product.image,
            brand: product.brand,
            type: product.type
        };
        setItems([...items, newItem]);
        setShowAddDialog(false);
    };

    const uncheckedItems = items.filter(item => !item.checked);
    const checkedItems = items.filter(item => item.checked);

    // Separate by type for multi-vertical display
    const foodItems = uncheckedItems.filter(item => item.type === 'FOOD' || !item.type);
    const cosmeticItems = uncheckedItems.filter(item => item.type === 'COSMETIC');

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 pt-10 pb-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#22C55E]" />
                        </div>
                        <div className="flex-1">
                            <h1>{t.shoppingList?.title || 'Shopping List'}</h1>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {uncheckedItems.length} {t.shoppingList?.itemsToBuy || 'items to buy'}
                    </p>
                </div>

                {/* Quick Add */}
                <div className="px-6 py-6 bg-white border-b border-gray-200">
                    <div className="flex gap-2">
                        <Input
                            placeholder={t.shoppingList?.addItem || 'Add item...'}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                            className="flex-1 h-12 bg-[#F8F9FA] rounded-2xl border-gray-200"
                        />
                        <Button
                            onClick={handleAddItem}
                            disabled={!newItemName.trim()}
                            className="h-12 w-12 p-0 bg-[#22C55E] hover:bg-[#22C55E]/90 rounded-2xl"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddDialog(true)}
                            className="w-full h-10 rounded-xl text-sm"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            {t.shoppingList?.addFromHistory || 'Add from Scan History'}
                        </Button>
                    </div>
                </div>

                {/* Shopping List */}
                <div className="px-6 py-6">
                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="mb-2">{t.shoppingList?.emptyTitle || 'Your list is empty'}</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                {t.shoppingList?.emptyDescription || 'Add products to start building your shopping list'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Food Items */}
                            {foodItems.length > 0 && (
                                <div>
                                    <h3 className="mb-3 flex items-center gap-2">
                                        <span>🛒</span> {t.shoppingList?.sections?.food || 'Pantry'}
                                    </h3>
                                    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
                                        {foodItems.map((item) => (
                                            <Reorder.Item key={item.id} value={item} dragListener={false}>
                                                <ShoppingListItemComponent
                                                    item={item}
                                                    onToggle={() => handleToggleItem(item.id)}
                                                    onDelete={() => handleDeleteItem(item.id)}
                                                    swipedItem={swipedItem}
                                                    setSwipedItem={setSwipedItem}
                                                    handleTouchStart={handleTouchStart}
                                                    handleTouchMove={handleTouchMove}
                                                    handleTouchEnd={handleTouchEnd}
                                                />
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            )}

                            {/* Cosmetic Items */}
                            {cosmeticItems.length > 0 && (
                                <div>
                                    <h3 className="mb-3 flex items-center gap-2">
                                        <span>🛁</span> {t.shoppingList?.sections?.cosmetic || 'Skincare'}
                                    </h3>
                                    <div className="space-y-2">
                                        {cosmeticItems.map((item) => (
                                            <ShoppingListItemComponent
                                                key={item.id}
                                                item={item}
                                                onToggle={() => handleToggleItem(item.id)}
                                                onDelete={() => handleDeleteItem(item.id)}
                                                swipedItem={swipedItem}
                                                setSwipedItem={setSwipedItem}
                                                handleTouchStart={handleTouchStart}
                                                handleTouchMove={handleTouchMove}
                                                handleTouchEnd={handleTouchEnd}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Completed Items */}
                            {checkedItems.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-muted-foreground">
                                        {t.shoppingList?.completed || 'Completed'} ({checkedItems.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {checkedItems.map((item) => (
                                            <div key={item.id}>
                                                <ShoppingListItemComponent
                                                    item={item}
                                                    onToggle={() => handleToggleItem(item.id)}
                                                    onDelete={() => handleDeleteItem(item.id)}
                                                    swipedItem={swipedItem}
                                                    setSwipedItem={setSwipedItem}
                                                    handleTouchStart={handleTouchStart}
                                                    handleTouchMove={handleTouchMove}
                                                    handleTouchEnd={handleTouchEnd}
                                                    isCompleted
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Clear completed */}
                {checkedItems.length > 0 && (
                    <div className="px-6 pb-6">
                        <Button
                            variant="outline"
                            onClick={() => setItems(uncheckedItems)}
                            className="w-full h-12 rounded-2xl border-gray-200 text-[#EF4444] hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t.shoppingList?.clearCompleted || 'Clear Completed Items'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Add from history dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t.shoppingList?.addFromHistoryTitle || 'Add from History'}</DialogTitle>
                        <DialogDescription>
                            {t.shoppingList?.addFromHistoryDesc || 'Choose products from your scan history'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 mt-4">
                        {scanHistory.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                {t.shoppingList?.noHistory || 'No products in history yet'}
                            </p>
                        ) : (
                            scanHistory.map((historyItem) => (
                                <button
                                    key={historyItem.id}
                                    onClick={() => handleAddScannedProduct(historyItem.product)}
                                    className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
                                >
                                    <div className="flex items-center gap-3 p-3">
                                        <ImageWithFallback
                                            src={historyItem.product.image}
                                            alt={historyItem.product.name}
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground">{historyItem.product.brand}</p>
                                            <p className="text-sm mt-0.5 truncate">{historyItem.product.name}</p>
                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                {historyItem.product.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Extracted component for cleaner code and drag controls
function ShoppingListItemComponent({
    item,
    onToggle,
    onDelete,
    swipedItem,
    setSwipedItem,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isCompleted = false
}: {
    item: ShoppingListItem,
    onToggle: () => void,
    onDelete: () => void,
    swipedItem: string | null,
    setSwipedItem: (id: string | null) => void,
    handleTouchStart: (e: React.TouchEvent, id: string) => void,
    handleTouchMove: (e: React.TouchEvent, id: string) => void,
    handleTouchEnd: () => void,
    isCompleted?: boolean
}) {
    const controls = useDragControls();

    return (
        <div className={`relative overflow-hidden rounded-2xl ${isCompleted ? 'opacity-60' : ''}`}>
            {/* Delete background (revealed on swipe) */}
            <div className={`absolute inset-0 bg-[#EF4444] flex items-center justify-end px-6 transition-opacity duration-200 ${swipedItem === item.id ? 'opacity-100' : 'opacity-0'}`}>
                <Trash2 className="w-6 h-6 text-white" />
            </div>

            {/* Main content (swipeable) */}
            <div
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onTouchMove={(e) => handleTouchMove(e, item.id)}
                onTouchEnd={handleTouchEnd}
                onClick={onToggle}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 relative transition-all duration-200 active:scale-[0.99]"
                style={{
                    transform: swipedItem === item.id ? 'translateX(-80px)' : 'translateX(0)'
                }}
            >
                {/* Drag Handle - Only show for uncompleted items */}
                {!isCompleted && (
                    <div
                        onPointerDown={(e) => controls.start(e)}
                        className="touch-none cursor-grab active:cursor-grabbing p-1 -ml-2 text-gray-300 hover:text-gray-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                )}

                <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => { }}
                    className="data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
                />

                {item.image ? (
                    <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-400" />
                    </div>
                )}

                <div className="flex-1 min-w-0 select-none">
                    {item.brand && (
                        <p className={`text-xs text-muted-foreground ${isCompleted ? 'line-through' : ''}`}>{item.brand}</p>
                    )}
                    <p className={`truncate ${isCompleted ? 'line-through' : ''}`}>{item.name}</p>
                </div>
            </div>

            {/* Delete button (shown when swiped) */}
            {swipedItem === item.id && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center"
                >
                    <Trash2 className="w-6 h-6 text-white" />
                </button>
            )}
        </div>
    );
}
