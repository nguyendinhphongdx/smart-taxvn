import React from 'react';
import { TaxConfig } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, Shield, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TaxLawInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TaxConfig;
}

export const TaxLawInfoModal: React.FC<TaxLawInfoModalProps> = ({ isOpen, onClose, config }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quy định thuế - {config.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="deductions" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deductions" className="text-xs">Giảm trừ</TabsTrigger>
            <TabsTrigger value="insurance" className="text-xs">Bảo hiểm</TabsTrigger>
            <TabsTrigger value="brackets" className="text-xs">Biểu thuế</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Tab 1: Deductions */}
            <TabsContent value="deductions" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Giảm trừ bản thân</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(config.deduction.personal)}</p>
                    <p className="text-xs text-muted-foreground">VNĐ/tháng</p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Giảm trừ phụ thuộc</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(config.deduction.dependent)}</p>
                    <p className="text-xs text-muted-foreground">VNĐ/người/tháng</p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Lương cơ sở</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(config.baseSalary)}</p>
                    <p className="text-xs text-muted-foreground">VNĐ (Trần BH)</p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground">
                <p>
                  <strong>Giảm trừ bản thân:</strong> Áp dụng cho mọi người nộp thuế có thu nhập chịu thuế.
                </p>
                <p className="mt-2">
                  <strong>Giảm trừ người phụ thuộc:</strong> Áp dụng cho mỗi người phụ thuộc đã đăng ký (con cái, cha mẹ già...).
                </p>
              </div>
            </TabsContent>

            {/* Tab 2: Insurance */}
            <TabsContent value="insurance" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{config.insurance.social * 100}%</p>
                    <p className="text-xs font-medium text-muted-foreground">BHXH</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{config.insurance.health * 100}%</p>
                    <p className="text-xs font-medium text-muted-foreground">BHYT</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{config.insurance.unemployment * 100}%</p>
                    <p className="text-xs font-medium text-muted-foreground">BHTN</p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>BHXH, BHYT:</strong> Tối đa trên {config.insurance.socialCapMultiplier} lần mức lương cơ sở
                  ({formatCurrency(config.baseSalary * config.insurance.socialCapMultiplier)} VNĐ)
                </p>
                <p>
                  <strong>BHTN:</strong> Tối đa trên {config.insurance.unemploymentCapMultiplier} lần mức lương tối thiểu vùng
                </p>
              </div>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">Lương tối thiểu vùng 2024</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Vùng I</span>
                      <span className="font-medium">{formatCurrency(config.regionalMinWage[1])}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Vùng II</span>
                      <span className="font-medium">{formatCurrency(config.regionalMinWage[2])}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Vùng III</span>
                      <span className="font-medium">{formatCurrency(config.regionalMinWage[3])}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Vùng IV</span>
                      <span className="font-medium">{formatCurrency(config.regionalMinWage[4])}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Tax Brackets */}
            <TabsContent value="brackets" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Bậc</TableHead>
                        <TableHead className="text-xs">Thu nhập tính thuế/tháng</TableHead>
                        <TableHead className="text-xs text-right">Thuế suất</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.brackets.map((bracket, index) => {
                        const prevMax = index === 0 ? 0 : config.brackets[index - 1].max;
                        const rangeLabel = bracket.max === Infinity
                          ? `Trên ${prevMax / 1000000} triệu`
                          : prevMax === 0
                          ? `Đến ${bracket.max / 1000000} triệu`
                          : `Trên ${prevMax / 1000000} đến ${bracket.max / 1000000} triệu`;

                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">Bậc {index + 1}</TableCell>
                            <TableCell className="text-muted-foreground">{rangeLabel}</TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              {bracket.rate * 100}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 rounded-lg bg-muted text-sm text-muted-foreground">
                <p>
                  <strong>Thuế lũy tiến từng phần:</strong> Thu nhập chịu thuế được tính theo từng bậc.
                  Phần thu nhập nằm trong bậc nào sẽ chịu thuế suất của bậc đó.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="pt-4 border-t mt-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
