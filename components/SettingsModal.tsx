import React, { useState, useEffect } from 'react';
import { TaxConfig } from '../types';
import { DEFAULT_TAX_CONFIG } from '../constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TaxConfig;
  onSave: (newConfig: TaxConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<TaxConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const handleChange = (section: 'deduction' | 'baseSalary', field: string, value: number) => {
    if (section === 'deduction') {
      setLocalConfig(prev => ({
        ...prev,
        deduction: { ...prev.deduction, [field]: value }
      }));
    } else if (section === 'baseSalary') {
      setLocalConfig(prev => ({ ...prev, baseSalary: value }));
    }
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_TAX_CONFIG);
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cấu hình luật thuế</DialogTitle>
          <DialogDescription>
            Tùy chỉnh các thông số tính thuế theo nhu cầu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Alert */}
          <div className="flex gap-3 p-3 rounded-lg bg-muted text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-muted-foreground leading-relaxed">
              Các chỉ số mặc định áp dụng theo <strong>{config.name}</strong>.
              Bạn có thể thay đổi để mô phỏng các chính sách khác.
            </p>
          </div>

          {/* Base Salary */}
          <div className="space-y-2">
            <Label htmlFor="baseSalary">Lương cơ sở</Label>
            <div className="relative">
              <Input
                id="baseSalary"
                type="number"
                value={localConfig.baseSalary}
                onChange={(e) => handleChange('baseSalary', 'baseSalary', Number(e.target.value))}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                VNĐ
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Dùng để tính trần BHXH, BHYT (20 lần lương cơ sở)
            </p>
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personalDeduction">Giảm trừ bản thân</Label>
              <div className="relative">
                <Input
                  id="personalDeduction"
                  type="number"
                  value={localConfig.deduction.personal}
                  onChange={(e) => handleChange('deduction', 'personal', Number(e.target.value))}
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  VNĐ
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dependentDeduction">Giảm trừ phụ thuộc</Label>
              <div className="relative">
                <Input
                  id="dependentDeduction"
                  type="number"
                  value={localConfig.deduction.dependent}
                  onChange={(e) => handleChange('deduction', 'dependent', Number(e.target.value))}
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Khôi phục
          </Button>
          <Button onClick={handleSave}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
