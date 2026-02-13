import React, { useState, useEffect, useRef } from 'react';
import { getTaxAdvice } from '../services/geminiService';
import { TaxResult } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const renderAnswerWithTooltips = (text: string) => {
  if (!text) return null;

  const regex = /\[\[(.*?)\|(.*?)\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span
          key={lastIndex}
          dangerouslySetInnerHTML={{
            __html: text.substring(lastIndex, match.index).replace(/\n/g, '<br/>')
          }}
        />
      );
    }

    const term = match[1];
    const definition = match[2];
    parts.push(
      <Tooltip key={match.index}>
        <TooltipTrigger asChild>
          <span className="text-primary font-medium border-b border-primary/50 border-dashed cursor-help">
            {term}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{definition}</p>
        </TooltipContent>
      </Tooltip>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span
        key={lastIndex}
        dangerouslySetInnerHTML={{
          __html: text.substring(lastIndex).replace(/\n/g, '<br/>')
        }}
      />
    );
  }

  return <div className="leading-relaxed">{parts}</div>;
};

interface AiAdvisorProps {
  contextData: TaxResult | null;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [answer, loading]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);

    const contextString = contextData
      ? `
      Tổng thu nhập Gross: ${new Intl.NumberFormat('vi-VN').format(contextData.gross)}
      Thực nhận (Total Net): ${new Intl.NumberFormat('vi-VN').format(contextData.totalNet)}
      Tổng Thuế TNCN: ${new Intl.NumberFormat('vi-VN').format(contextData.totalTax)}
      Bảo hiểm: ${new Intl.NumberFormat('vi-VN').format(contextData.socialInsurance + contextData.healthInsurance + contextData.unemploymentInsurance)}
    `
      : 'Chưa có dữ liệu tính toán.';

    const res = await getTaxAdvice(question, contextString);
    setAnswer(res.answer);
    setLoading(false);
  };

  const suggestedQuestions = [
    "Cách tính thuế vãng lai?",
    "Giảm trừ gia cảnh 2025 là bao nhiêu?",
    "Làm sao để giảm thuế TNCN hợp pháp?"
  ];

  // Floating Button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
      </Button>
    );
  }

  // Chat Window
  return (
    <Card className="fixed bottom-6 right-6 z-50 w-[360px] h-[480px] flex flex-col shadow-xl animate-slide-up">
      {/* Header */}
      <CardHeader className="p-4 pb-3 border-b flex-row items-center justify-between space-y-0 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Trợ lý Thuế AI</CardTitle>
            <p className="text-xs text-primary-foreground/70">Hỗ trợ bởi Gemini</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      {/* Chat Body */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30" ref={scrollRef}>
        {!answer && !loading && (
          <div className="text-center py-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tôi có thể giúp gì về thuế TNCN?
            </p>
            <div className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="w-full text-left text-xs p-2.5 bg-card border rounded-lg text-primary hover:bg-primary/5 transition-colors"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Message */}
        {(loading || answer) && question && (
          <div className="flex justify-end animate-fade-in">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[85%]">
              {question}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
              </span>
              <span className="text-xs text-muted-foreground">Đang suy nghĩ...</span>
            </div>
          </div>
        )}

        {/* AI Response */}
        {answer && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-card border p-4 rounded-2xl rounded-tl-sm text-sm max-w-[90%]">
              {renderAnswerWithTooltips(answer)}
            </div>
          </div>
        )}
      </CardContent>

      {/* Input */}
      <div className="p-3 border-t bg-card rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Nhập câu hỏi..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleAsk()}
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={handleAsk}
            disabled={loading || !question.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
