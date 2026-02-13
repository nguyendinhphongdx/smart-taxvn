import React, { useState, useCallback } from 'react';
import { AdditionalIncome, CalculationInput, Region, TaxResult, TaxConfig, IncomeType } from './types';
import { calculateGrossToNet, calculateNetToGross } from './services/taxService';
import { TAX_CONFIG_2025, TAX_CONFIG_2026, DEFAULT_TAX_CONFIG } from './constants';
import { ResultsView } from './components/ResultsView';
import { AiAdvisor } from './components/AiAdvisor';
import { SettingsModal } from './components/SettingsModal';
import { TaxLawInfoModal } from './components/TaxLawInfoModal';

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { MoneyInput } from './components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';

import {
  Calculator,
  Settings,
  BookOpen,
  Plus,
  X,
  Minus,
  HelpCircle,
  Briefcase,
  TrendingUp,
  DollarSign,
  Gift
} from 'lucide-react';

const INCOME_TYPE_CONFIG: Record<IncomeType, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  NON_TAXABLE: { label: 'Miễn thuế', description: 'Không chịu thuế TNCN', icon: <Gift className="h-4 w-4" />, color: 'text-emerald-600' },
  SALARY_LIKE: { label: 'Gộp lương', description: 'Thuế lũy tiến từ tiền lương', icon: <Briefcase className="h-4 w-4" />, color: 'text-blue-600' },
  FREELANCE: { label: 'Vãng lai', description: 'Thuế suất 10%', icon: <TrendingUp className="h-4 w-4" />, color: 'text-orange-600' },
  INVESTMENT: { label: 'Đầu tư', description: 'Thuế suất 5%', icon: <DollarSign className="h-4 w-4" />, color: 'text-purple-600' },
};

const App: React.FC = () => {
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(DEFAULT_TAX_CONFIG);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('2026');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLawInfoOpen, setIsLawInfoOpen] = useState(false);

  const [input, setInput] = useState<CalculationInput>({
    income: 0,
    incomeType: 'GROSS',
    region: Region.I,
    dependents: 0,
    insuranceSalary: 0,
    insuranceMode: 'OFFICIAL',
    otherDeductions: 0,
    additionalIncomes: []
  });

  const [result, setResult] = useState<TaxResult | null>(null);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState(0);
  const [newIncomeType, setNewIncomeType] = useState<IncomeType>('NON_TAXABLE');

  const switchPolicy = (policyId: string) => {
    setSelectedPolicyId(policyId);
    const newConfig = policyId === '2025' ? TAX_CONFIG_2025 : TAX_CONFIG_2026;
    setTaxConfig(newConfig);

    if (result && input.income > 0) {
      const res = input.incomeType === 'GROSS'
        ? calculateGrossToNet(input, newConfig)
        : calculateNetToGross(input, newConfig);
      setResult(res);
    }
  };

  const handleCalculate = useCallback(() => {
    if (input.income <= 0 && input.additionalIncomes.length === 0) return;

    const res = input.incomeType === 'GROSS'
      ? calculateGrossToNet(input, taxConfig)
      : calculateNetToGross(input, taxConfig);
    setResult(res);

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [input, taxConfig]);

  const handleInputChange = <K extends keyof CalculationInput>(field: K, value: CalculationInput[K]) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const addNewIncome = () => {
    if (!newIncomeName.trim() || newIncomeAmount <= 0) return;

    const newIncome: AdditionalIncome = {
      id: Date.now().toString(),
      type: newIncomeType,
      amount: newIncomeAmount,
      label: newIncomeName.trim()
    };

    setInput(prev => ({ ...prev, additionalIncomes: [...prev.additionalIncomes, newIncome] }));
    setNewIncomeName('');
    setNewIncomeAmount(0);
    setNewIncomeType('NON_TAXABLE');
  };

  const removeIncomeSource = (id: string) => {
    setInput(prev => ({
      ...prev,
      additionalIncomes: prev.additionalIncomes.filter(inc => inc.id !== id)
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background pb-20">
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={taxConfig}
          onSave={(newConfig) => {
            setTaxConfig(newConfig);
            if (result) {
              const res = input.incomeType === 'GROSS'
                ? calculateGrossToNet(input, newConfig)
                : calculateNetToGross(input, newConfig);
              setResult(res);
            }
          }}
        />

        <TaxLawInfoModal
          isOpen={isLawInfoOpen}
          onClose={() => setIsLawInfoOpen(false)}
          config={taxConfig}
        />

        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-xl items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                T
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none">TaxVN</span>
                <span className="text-[10px] text-muted-foreground">Tính thuế TNCN</span>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsLawInfoOpen(true)}>
                <BookOpen className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Quy định</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Cấu hình</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container max-w-screen-xl py-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tính lương Gross & Net</h1>
              <p className="text-sm text-muted-foreground">
                Công cụ tính thuế TNCN chính xác theo quy định {taxConfig.name}
              </p>
            </div>

            <Tabs value={selectedPolicyId} onValueChange={switchPolicy}>
              <TabsList>
                <TabsTrigger value="2025">Luật 2025</TabsTrigger>
                <TabsTrigger value="2026" className="relative">
                  Đề xuất 2026
                  {selectedPolicyId !== '2026' && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column - Input Form */}
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Thông tin thu nhập</CardTitle>
                  <CardDescription>Nhập thông tin lương và các khoản thu nhập</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Salary Input */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Lương cố định (tháng)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <MoneyInput
                          value={input.income}
                          onChange={(val) => handleInputChange('income', val)}
                          placeholder="Nhập số tiền..."
                          className="h-11 text-lg font-semibold"
                        />
                      </div>
                      <Tabs
                        value={input.incomeType}
                        onValueChange={(val) => handleInputChange('incomeType', val as 'GROSS' | 'NET')}
                        className="w-full sm:w-auto"
                      >
                        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
                          <TabsTrigger value="GROSS" className="text-xs font-semibold">GROSS</TabsTrigger>
                          <TabsTrigger value="NET" className="text-xs font-semibold">NET</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  {/* Insurance Mode */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Mức lương đóng bảo hiểm</Label>
                    <RadioGroup
                      value={input.insuranceMode}
                      onValueChange={(val) => handleInputChange('insuranceMode', val as 'OFFICIAL' | 'CUSTOM')}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="insurance-official"
                        className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                          input.insuranceMode === 'OFFICIAL'
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <RadioGroupItem value="OFFICIAL" id="insurance-official" />
                        <span className="text-sm font-medium">Trên lương chính thức</span>
                      </Label>

                      <div className={`rounded-lg border p-4 transition-colors ${
                        input.insuranceMode === 'CUSTOM'
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}>
                        <Label
                          htmlFor="insurance-custom"
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <RadioGroupItem value="CUSTOM" id="insurance-custom" />
                          <span className="text-sm font-medium">Nhập mức khác</span>
                        </Label>

                        {input.insuranceMode === 'CUSTOM' && (
                          <div className="mt-3 animate-fade-in">
                            <MoneyInput
                              value={input.insuranceSalary}
                              onChange={(val) => handleInputChange('insuranceSalary', val)}
                              placeholder="Mức đóng bảo hiểm"
                              className="h-9"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Region & Dependents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Vùng lương tối thiểu</Label>
                      <Select
                        value={String(input.region)}
                        onValueChange={(val) => handleInputChange('region', Number(val) as Region)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Vùng I (Hà Nội, TP.HCM)</SelectItem>
                          <SelectItem value="2">Vùng II (Đà Nẵng, Cần Thơ...)</SelectItem>
                          <SelectItem value="3">Vùng III (Bắc Ninh...)</SelectItem>
                          <SelectItem value="4">Vùng IV (Khác)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-sm font-medium">Người phụ thuộc</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Giảm trừ {formatCurrency(taxConfig.deduction.dependent)}đ/người/tháng</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-r-none"
                          onClick={() => handleInputChange('dependents', Math.max(0, input.dependents - 1))}
                          disabled={input.dependents <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="h-9 flex-1 flex items-center justify-center border-y bg-muted/30 font-semibold tabular-nums">
                          {input.dependents}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-l-none"
                          onClick={() => handleInputChange('dependents', input.dependents + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Income */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Thu nhập khác
                    </Label>

                    {/* Existing Incomes */}
                    {input.additionalIncomes.length > 0 && (
                      <div className="space-y-2">
                        {input.additionalIncomes.map((inc) => {
                          const config = INCOME_TYPE_CONFIG[inc.type];
                          return (
                            <div
                              key={inc.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`${config.color}`}>{config.icon}</div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{inc.label}</p>
                                  <p className="text-xs text-muted-foreground">{config.label}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-primary tabular-nums">
                                  +{formatCurrency(inc.amount)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeIncomeSource(inc.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add New Form */}
                    <div className="rounded-lg border border-dashed p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Tên khoản thu (VD: Thưởng tết)"
                          value={newIncomeName}
                          onChange={(e) => setNewIncomeName(e.target.value)}
                        />
                        <MoneyInput
                          value={newIncomeAmount}
                          onChange={setNewIncomeAmount}
                          placeholder="Số tiền"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={newIncomeType} onValueChange={(val) => setNewIncomeType(val as IncomeType)}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(INCOME_TYPE_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <span className={config.color}>{config.icon}</span>
                                  <span>{config.label}</span>
                                  <span className="text-muted-foreground">- {config.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="secondary"
                          onClick={addNewIncome}
                          disabled={!newIncomeName.trim() || newIncomeAmount <= 0}
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Thêm
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <Button
                    className="w-full h-11 text-base font-semibold"
                    size="lg"
                    onClick={handleCalculate}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Tính thuế ngay
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start" id="results-section">
              {result ? (
                <ResultsView result={result} config={taxConfig} />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Calculator className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Bắt đầu tính toán</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                      Nhập thông tin lương và bấm "Tính thuế ngay" để xem kết quả
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* AI Advisor Widget */}
        <AiAdvisor contextData={result} />
      </div>
    </TooltipProvider>
  );
};

export default App;
