import React from 'react';
import { TaxResult, TaxConfig } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { HelpCircle, TrendingDown, Wallet, Shield, Receipt } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface ResultsViewProps {
  result: TaxResult;
  config: TaxConfig;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, config }) => {
  const totalInsurance = result.socialInsurance + result.healthInsurance + result.unemploymentInsurance;

  const chartData = [
    { name: 'Thực nhận', value: result.totalNet, color: 'hsl(158, 64%, 32%)' },
    { name: 'Thuế TNCN', value: result.totalTax, color: 'hsl(0, 84%, 60%)' },
    { name: 'Bảo hiểm', value: totalInsurance, color: 'hsl(45, 93%, 47%)' },
  ].filter(d => d.value > 0);

  const totalDeductions = config.deduction.personal + (config.deduction.dependent * Math.max(0, (result.incomeBeforeTax - result.taxableIncome - config.deduction.personal) / config.deduction.dependent));
  const dependentDeduction = result.incomeBeforeTax - result.taxableIncome - config.deduction.personal;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary-foreground/70 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Thực nhận</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(result.net)}
            </p>
            <p className="text-xs text-primary-foreground/60 mt-1">VNĐ/tháng</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Tổng khấu trừ</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-destructive">
              {formatCurrency(result.gross - result.net)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">VNĐ/tháng</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Chi tiết khấu trừ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">Lương GROSS</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(result.gross)}
                </TableCell>
              </TableRow>

              {/* Insurance Section */}
              <TableRow>
                <TableCell className="text-muted-foreground pl-6">
                  <div className="flex items-center gap-1.5">
                    BHXH (8%)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tối đa 20 lần lương cơ sở</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell className="text-right text-destructive tabular-nums">
                  -{formatCurrency(result.socialInsurance)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground pl-6">BHYT (1.5%)</TableCell>
                <TableCell className="text-right text-destructive tabular-nums">
                  -{formatCurrency(result.healthInsurance)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground pl-6">BHTN (1%)</TableCell>
                <TableCell className="text-right text-destructive tabular-nums">
                  -{formatCurrency(result.unemploymentInsurance)}
                </TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">Thu nhập trước thuế</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(result.incomeBeforeTax)}
                </TableCell>
              </TableRow>

              {/* Deductions */}
              <TableRow>
                <TableCell className="text-muted-foreground pl-6">
                  Giảm trừ bản thân
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  -{formatCurrency(config.deduction.personal)}
                </TableCell>
              </TableRow>
              {dependentDeduction > 0 && (
                <TableRow>
                  <TableCell className="text-muted-foreground pl-6">
                    Giảm trừ người phụ thuộc
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    -{formatCurrency(dependentDeduction)}
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">Thu nhập chịu thuế</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(result.taxableIncome)}
                </TableCell>
              </TableRow>

              <TableRow className="border-t-2">
                <TableCell className="font-semibold">Thuế TNCN phải nộp</TableCell>
                <TableCell className="text-right font-bold text-destructive tabular-nums">
                  -{formatCurrency(result.personalIncomeTax)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Brackets Detail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Biểu thuế lũy tiến
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Mức chịu thuế</TableHead>
                <TableHead className="text-xs text-center">Thuế suất</TableHead>
                <TableHead className="text-xs text-right">Thu nhập</TableHead>
                <TableHead className="text-xs text-right">Thuế</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.detailTax.map((level, idx) => (
                <TableRow
                  key={idx}
                  className={cn(
                    level.taxAmount === 0 && "text-muted-foreground/50"
                  )}
                >
                  <TableCell className="text-xs">
                    {level.maxIncome === Infinity
                      ? `Trên ${formatCurrency(level.minIncome)}`
                      : level.minIncome > 0
                      ? `${formatCurrency(level.minIncome)} - ${formatCurrency(level.maxIncome)}`
                      : `Đến ${formatCurrency(level.maxIncome)}`}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {level.rate * 100}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs">
                    {formatCurrency(level.taxedAmount)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right tabular-nums text-xs font-medium",
                    level.taxAmount > 0 && "text-destructive"
                  )}>
                    {formatCurrency(level.taxAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right text-xs font-medium">
                  Tổng thuế TNCN
                </TableCell>
                <TableCell className="text-right font-bold text-destructive tabular-nums">
                  {formatCurrency(result.personalIncomeTax)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Income Details */}
      {result.additionalTaxDetails && result.additionalTaxDetails.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Thu nhập khác</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Khoản thu</TableHead>
                  <TableHead className="text-xs">Loại</TableHead>
                  <TableHead className="text-xs text-right">Số tiền</TableHead>
                  <TableHead className="text-xs text-right">Thuế</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.additionalTaxDetails.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs font-medium">{item.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.typeName}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right tabular-nums text-xs",
                      item.tax > 0 && "text-destructive"
                    )}>
                      {item.tax > 0 ? `-${formatCurrency(item.tax)}` : '0'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
