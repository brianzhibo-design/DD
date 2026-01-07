'use client';

import { useState, useEffect } from 'react';
import { Settings, Database, Key, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { testSupabaseConnection } from '@/lib/db';

export default function SettingsPage() {
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean; message: string} | null>(null);
  const [testing, setTesting] = useState(false);
  
  const testConnection = async () => {
    setTesting(true);
    const result = await testSupabaseConnection();
    setConnectionStatus(result);
    setTesting(false);
  };
  
  useEffect(() => {
    testConnection();
  }, []);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Settings size={24} className="text-gray-600" />
          设置
        </h1>
        <p className="text-gray-500">管理系统配置和数据库连接</p>
      </div>
      
      {/* Database Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database size={18} className="text-green-500" />
          数据库状态
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Supabase 连接</p>
              <p className="text-xs text-gray-400 mt-1">PostgreSQL 云数据库</p>
            </div>
            <div className="flex items-center gap-2">
              {testing ? (
                <RefreshCw size={18} className="text-gray-400 animate-spin" />
              ) : connectionStatus?.success ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <XCircle size={18} className="text-red-500" />
              )}
              <span className={`text-sm ${connectionStatus?.success ? 'text-green-600' : 'text-red-600'}`}>
                {testing ? '测试中...' : connectionStatus?.success ? '已连接' : '未连接'}
              </span>
            </div>
          </div>
          
          {connectionStatus && !connectionStatus.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{connectionStatus.message}</p>
            </div>
          )}
          
          <button
            onClick={testConnection}
            disabled={testing}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {testing ? '测试中...' : '重新测试连接'}
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500 mb-2">数据存储位置：</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">周统计数据</span>
              <span className="text-xs text-green-600 font-medium">Supabase: weekly_stats</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">猫咪档案</span>
              <span className="text-xs text-green-600 font-medium">Supabase: cats</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">笔记数据</span>
              <span className="text-xs text-green-600 font-medium">Supabase: notes</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* API Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key size={18} className="text-amber-500" />
          API 配置
        </h2>
        <div className="bg-amber-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            AI功能需要配置以下环境变量（在 Netlify 中设置）：
          </p>
          <pre className="mt-2 bg-amber-100 p-3 rounded text-xs text-amber-900 overflow-x-auto">
{`ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
          </pre>
        </div>
        <div className="flex gap-4">
          <a 
            href="https://console.anthropic.com/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-600 text-sm"
          >
            获取 Claude API Key
          </a>
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-600 text-sm"
          >
            Supabase Dashboard
          </a>
        </div>
      </div>
      
      {/* Data Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          注意事项
        </h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• 所有数据存储在 Supabase 云数据库中</li>
          <li>• 数据会自动同步，无需手动备份</li>
          <li>• 如需删除数据，请在 Supabase Dashboard 中操作</li>
          <li>• 确保 Netlify 环境变量配置正确</li>
        </ul>
      </div>
      
      {/* About */}
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>小离岛岛 · 小红书运营系统</p>
        <p className="mt-1">内容创作 × 生活方式 × 精致分享</p>
        <p className="mt-2">Powered by Claude Sonnet 4.5 + Supabase</p>
      </div>
    </div>
  );
}
