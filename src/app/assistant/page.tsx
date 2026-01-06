import { Sparkles } from 'lucide-react';
import AIChat from '@/components/AIChat';

export default function AssistantPage() {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Sparkles size={24} className="text-purple-500" />
          AI运营助手
        </h1>
        <p className="text-gray-500">基于Claude Haiku 4.5，为你提供专业的小红书运营建议</p>
      </div>
      
      {/* Chat Interface */}
      <div className="h-[calc(100%-5rem)]">
        <AIChat />
      </div>
    </div>
  );
}

