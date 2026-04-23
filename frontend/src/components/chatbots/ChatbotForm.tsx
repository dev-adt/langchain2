'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateChatbotPayload } from '@/types';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

interface ChatbotFormProps {
  initialData?: Partial<CreateChatbotPayload>;
  onSubmit: (data: CreateChatbotPayload) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const AVAILABLE_MODELS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
];

export default function ChatbotForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Tạo Chatbot',
}: ChatbotFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.systemPrompt || 'You are a helpful assistant. Respond in Vietnamese.'
  );
  const [model, setModel] = useState(initialData?.model || 'gpt-3.5-turbo');
  
  // Starter Prompts state
  const [starterPrompts, setStarterPrompts] = useState<{ title: string; description: string; prompt: string }[]>(
    initialData?.starterPrompts || [
      { title: '', description: '', prompt: '' }
    ]
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);

  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setSystemPrompt(initialData.systemPrompt || 'You are a helpful assistant. Respond in Vietnamese.');
      setModel(initialData.model || 'gpt-3.5-turbo');
      setIsPublic(initialData.isPublic || false);
      if (initialData.starterPrompts) {
        setStarterPrompts(initialData.starterPrompts);
      }
    }
  }, [initialData]);

  const handleAddPrompt = () => {
    if (starterPrompts.length < 4) {
      setStarterPrompts([...starterPrompts, { title: '', description: '', prompt: '' }]);
    }
  };

  const handleRemovePrompt = (index: number) => {
    setStarterPrompts(starterPrompts.filter((_, i) => i !== index));
  };

  const handlePromptChange = (index: number, field: string, value: string) => {
    const newPrompts = [...starterPrompts];
    newPrompts[index] = { ...newPrompts[index], [field]: value };
    setStarterPrompts(newPrompts);
  };

  const handleCopyLink = () => {
    if (initialData?.id) {
      const shareUrl = `${window.location.origin}/b/${initialData.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Tên chatbot là bắt buộc');
      return;
    }

    // Filter out empty prompts
    const validPrompts = starterPrompts.filter(p => p.title.trim() && p.prompt.trim());

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        systemPrompt: systemPrompt.trim(),
        model,
        isPublic,
        starterPrompts: validPrompts.length > 0 ? validPrompts : undefined
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tên Chatbot"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Trợ lý Bán hàng"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Model AI
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none bg-white text-gray-900 text-sm"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Mô tả"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả ngắn gọn về chatbot..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          System Prompt
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Hướng dẫn chatbot về cách hành xử..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none bg-white text-gray-900 text-sm resize-none"
        />
      </div>

      {/* Share Section */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-teal-900">Chế độ công khai</h3>
            <p className="text-xs text-teal-700 mt-0.5">
              Cho phép người khác truy cập chatbot này qua đường link.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isPublic ? 'bg-teal-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {isPublic && initialData?.id && (
          <div className="pt-2 border-t border-teal-100">
            <label className="block text-xs font-medium text-teal-800 mb-1.5">
              Link chia sẻ
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/b/${initialData.id}`}
                className="flex-1 bg-white border border-teal-200 rounded-lg px-3 py-1.5 text-xs text-teal-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white border border-teal-200 rounded-lg text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
              >
                {copied ? 'Đã chép!' : 'Sao chép'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Starter Prompts Section */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Câu hỏi gợi ý (Starter Prompts)
            </h3>
          </div>
          {starterPrompts.length < 4 && (
            <button
              type="button"
              onClick={handleAddPrompt}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Thêm gợi ý
            </button>
          )}
        </div>

        <div className="space-y-4">
          {starterPrompts.map((prompt, index) => (
            <div key={index} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 relative group">
              <button
                type="button"
                onClick={() => handleRemovePrompt(index)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  placeholder="Tiêu đề gợi ý (ví dụ: Giới thiệu)"
                  value={prompt.title}
                  onChange={(e) => handlePromptChange(index, 'title', e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-400"
                />
                <input
                  placeholder="Mô tả ngắn"
                  value={prompt.description}
                  onChange={(e) => handlePromptChange(index, 'description', e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-400"
                />
              </div>
              <textarea
                placeholder="Nội dung prompt sẽ gửi cho AI..."
                value={prompt.prompt}
                onChange={(e) => handlePromptChange(index, 'prompt', e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-400 resize-none"
              />
            </div>
          ))}
          {starterPrompts.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              Chưa có câu hỏi gợi ý nào.
            </p>
          )}
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
