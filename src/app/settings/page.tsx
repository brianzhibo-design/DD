'use client';

import { useState } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('daodao_weekly_data');
      localStorage.removeItem('daodao_notes');
      localStorage.removeItem('daodao_cat_appearances');
      localStorage.removeItem('daodao_cat_profiles');
      window.location.reload();
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">⚙️ 设置</h1>
        <p className="text-gray-500">管理系统配置和数据</p>
      </div>
      
      {/* API Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="font-bold text-gray-800 mb-4">🔑 API配置</h2>
        <div className="bg-amber-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            AI助手功能需要配置 Anthropic API Key。请在项目根目录创建 <code className="bg-amber-100 px-1 rounded">.env.local</code> 文件：
          </p>
          <pre className="mt-2 bg-amber-100 p-2 rounded text-xs text-amber-900">
            ANTHROPIC_API_KEY=your_api_key_here
          </pre>
        </div>
        <a 
          href="https://console.anthropic.com/" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:text-pink-600 text-sm"
        >
          👉 获取 Anthropic API Key
        </a>
      </div>
      
      {/* Data Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="font-bold text-gray-800 mb-4">💾 数据管理</h2>
        <p className="text-sm text-gray-500 mb-4">
          所有数据存储在浏览器本地（localStorage），清除浏览器数据会丢失。
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">猫咪档案</p>
              <p className="text-xs text-gray-400">六只猫的性格、特点等信息</p>
            </div>
            <span className="text-xs text-gray-400">localStorage</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">运营数据</p>
              <p className="text-xs text-gray-400">每周的粉丝、互动等数据</p>
            </div>
            <span className="text-xs text-gray-400">localStorage</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">出镜统计</p>
              <p className="text-xs text-gray-400">猫咪内容出镜次数</p>
            </div>
            <span className="text-xs text-gray-400">localStorage</span>
          </div>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
        <h2 className="font-bold text-red-600 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} />
          危险操作
        </h2>
        
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} />
            清除所有数据
          </button>
        ) : (
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-red-700 font-medium mb-3">
              确定要清除所有数据吗？此操作不可撤销！
            </p>
            <div className="flex gap-2">
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                确认清除
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* About */}
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>🏝️ 小离岛岛 · 小红书运营系统</p>
        <p className="mt-1">六猫妈妈 × 氛围感生活 × 精致好物分享</p>
        <p className="mt-2">Powered by Claude Haiku 4.5</p>
      </div>
    </div>
  );
}

