'use client';

import { useState, useEffect } from 'react';
import { Settings, Database, Key, AlertTriangle, CheckCircle, XCircle, RefreshCw, Bot, Zap } from 'lucide-react';
import { testSupabaseConnection } from '@/lib/db';

interface ApiStatus {
  success: boolean;
  message: string;
}

export default function SettingsPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<ApiStatus | null>(null);
  const [claudeStatus, setClaudeStatus] = useState<ApiStatus | null>(null);
  const [oneapiStatus, setOneapiStatus] = useState<ApiStatus | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [testingClaude, setTestingClaude] = useState(false);
  const [testingOneapi, setTestingOneapi] = useState(false);
  
  const testSupabase = async () => {
    setTestingSupabase(true);
    const result = await testSupabaseConnection();
    setSupabaseStatus(result);
    setTestingSupabase(false);
  };

  const testClaude = async () => {
    setTestingClaude(true);
    try {
      const response = await fetch('/api/chat', { method: 'GET' });
      const data = await response.json();
      if (data.configured) {
        setClaudeStatus({ success: true, message: '已配置' });
      } else {
        setClaudeStatus({ success: false, message: 'API Key 未配置' });
      }
    } catch {
      setClaudeStatus({ success: false, message: '检测失败' });
    }
    setTestingClaude(false);
  };

  const testOneapi = async () => {
    setTestingOneapi(true);
    try {
      const response = await fetch('/api/sync-xhs', { method: 'GET' });
      const data = await response.json();
      if (data.configured?.oneapiKey && data.configured?.xhsUserId) {
        setOneapiStatus({ success: true, message: '已配置' });
      } else if (data.configured?.oneapiKey) {
        setOneapiStatus({ success: false, message: '缺少 XHS_USER_ID' });
      } else if (data.configured?.xhsUserId) {
        setOneapiStatus({ success: false, message: '缺少 ONEAPI_KEY' });
      } else {
        setOneapiStatus({ success: false, message: '未配置' });
      }
    } catch {
      setOneapiStatus({ success: false, message: '检测失败' });
    }
    setTestingOneapi(false);
  };

  const testAllConnections = async () => {
    testSupabase();
    testClaude();
    testOneapi();
  };
  
  useEffect(() => {
    testAllConnections();
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
      
      {/* 服务连接状态 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            服务连接状态
          </h2>
          <button
            onClick={testAllConnections}
            disabled={testingSupabase || testingClaude || testingOneapi}
            className="text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw size={14} className={(testingSupabase || testingClaude || testingOneapi) ? 'animate-spin' : ''} />
            全部刷新
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Supabase */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Database size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Supabase</p>
                <p className="text-xs text-gray-400">PostgreSQL 云数据库</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testingSupabase ? (
                <RefreshCw size={16} className="text-gray-400 animate-spin" />
              ) : supabaseStatus?.success ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
              <span className={`text-sm ${supabaseStatus?.success ? 'text-green-600' : 'text-red-600'}`}>
                {testingSupabase ? '检测中' : supabaseStatus?.success ? '已连接' : supabaseStatus?.message || '未连接'}
              </span>
            </div>
          </div>

          {/* Claude AI */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Claude AI</p>
                <p className="text-xs text-gray-400">Anthropic API</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testingClaude ? (
                <RefreshCw size={16} className="text-gray-400 animate-spin" />
              ) : claudeStatus?.success ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
              <span className={`text-sm ${claudeStatus?.success ? 'text-green-600' : 'text-red-600'}`}>
                {testingClaude ? '检测中' : claudeStatus?.success ? '已配置' : claudeStatus?.message || '未配置'}
              </span>
            </div>
          </div>

          {/* OneAPI */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <Key size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">OneAPI</p>
                <p className="text-xs text-gray-400">小红书数据同步</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testingOneapi ? (
                <RefreshCw size={16} className="text-gray-400 animate-spin" />
              ) : oneapiStatus?.success ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
              <span className={`text-sm ${oneapiStatus?.success ? 'text-green-600' : 'text-amber-600'}`}>
                {testingOneapi ? '检测中' : oneapiStatus?.success ? '已配置' : oneapiStatus?.message || '未配置'}
              </span>
            </div>
          </div>
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
