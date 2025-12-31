import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PortionOption, MenuItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Edit2, Save, X } from 'lucide-react';

interface PortionPriceEditorProps {
  menuItem: MenuItem;
  portions: PortionOption[];
  open: boolean;
  onClose: () => void;
}

export function PortionPriceEditor({ menuItem, portions, open, onClose }: PortionPriceEditorProps) {
  const { updatePortionOption, inventoryCategories, categories } = useStore();
  
  // Local state for editing prices
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    portions.forEach(p => {
      initial[p.id] = p.fixedPrice?.toString() || '';
    });
    return initial;
  });

  const handleSave = () => {
    let hasChanges = false;
    
    portions.forEach(portion => {
      const priceStr = prices[portion.id];
      const newPrice = priceStr ? parseFloat(priceStr) : undefined;
      
      // Only update if price changed
      if (portion.fixedPrice !== newPrice) {
        updatePortionOption(portion.id, { fixedPrice: newPrice });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      toast.success('Portion prices updated');
    }
    onClose();
  };

  const handlePriceChange = (portionId: string, value: string) => {
    setPrices(prev => ({ ...prev, [portionId]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Prices: {menuItem.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-muted-foreground">
            Enter the fixed price for each portion size. Leave empty to use menu item base price with multiplier.
          </p>
          
          {portions
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(portion => (
              <div key={portion.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium">{portion.name}</div>
                  <div className="text-xs text-muted-foreground">{portion.size} units</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rs</span>
                  <Input
                    type="number"
                    value={prices[portion.id]}
                    onChange={(e) => handlePriceChange(portion.id, e.target.value)}
                    placeholder="Price"
                    className="w-24"
                  />
                </div>
              </div>
            ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Prices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Bulk price editor for all items in a category
interface CategoryPriceEditorProps {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onClose: () => void;
}

export function CategoryPriceEditor({ categoryId, categoryName, open, onClose }: CategoryPriceEditorProps) {
  const { menuItems, portionOptions, inventoryCategories, updatePortionOption } = useStore();
  
  const invCat = inventoryCategories.find(ic => ic.categoryId === categoryId);
  const portions = portionOptions.filter(p => p.inventoryCategoryId === invCat?.id);
  const itemsInCategory = menuItems.filter(m => m.category === categoryName);
  
  // State: { menuItemId: { portionId: price } }
  const [allPrices, setAllPrices] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    itemsInCategory.forEach(item => {
      initial[item.id] = {};
      portions.forEach(p => {
        // For now, portions are category-wide, so we need per-item prices
        // This would require a different data model - for now use the portion's fixed price
        initial[item.id][p.id] = p.fixedPrice?.toString() || '';
      });
    });
    return initial;
  });

  // Note: Current data model has portions at category level, not per-item
  // For per-item pricing, you'd need to modify the schema to have menu_item_id on portion_options
  // For now, show a simplified view

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Portion Prices: {categoryName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set fixed prices for each portion size. These prices apply to all items in this category.
          </p>
          
          {/* Portion price table */}
          <div className="space-y-3">
            {portions
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(portion => (
                <div key={portion.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <div className="font-medium">{portion.name}</div>
                    <div className="text-xs text-muted-foreground">{portion.size} {invCat?.unitType}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rs</span>
                    <Input
                      type="number"
                      value={portion.fixedPrice?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newPrice = val ? parseFloat(val) : undefined;
                        updatePortionOption(portion.id, { fixedPrice: newPrice });
                      }}
                      placeholder="Enter price"
                      className="w-28"
                    />
                  </div>
                  {portion.fixedPrice && (
                    <Badge variant="secondary" className="text-xs">
                      Set
                    </Badge>
                  )}
                </div>
              ))}
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <strong>Tip:</strong> All items in "{categoryName}" will use these portion prices when customers order.
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
