'use client';

import { useState, useEffect } from 'react';
import { Settings, Database, Key, AlertTriangle, CheckCircle, XCircle, RefreshCw, Bot, Zap, Camera, User, Lock, Eye, EyeOff, Shield, LogOut, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { testSupabaseConnection } from '@/lib/db';
import { getUserProfile, saveUserProfile, compressImage, UserProfile, loadUserProfile } from '@/lib/user-profile';

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
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [nickname, setNickname] = useState('');
  
  // 密码修改状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const router = useRouter();
  
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

  // 加载用户资料
  useEffect(() => {
    // 先显示缓存
    const cached = getUserProfile();
    setUserProfile(cached);
    setNickname(cached.nickname || '');
    
    // 然后从 Supabase 加载
    loadUserProfile().then(profile => {
      setUserProfile(profile);
      setNickname(profile.nickname || '');
    });
  }, []);
  
  useEffect(() => {
    testAllConnections();
  }, []);

  // 处理头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    try {
      const base64 = await compressImage(file, 150);
      const updated = { ...userProfile, avatar: base64 };
      const success = await saveUserProfile(updated);
      if (success) {
        setUserProfile(updated);
      } else {
        alert('保存失败，请重试');
      }
    } catch {
      alert('图片处理失败');
    }
  };

  // 保存昵称
  const handleSaveNickname = async () => {
    const updated = { ...userProfile, nickname };
    const success = await saveUserProfile(updated);
    if (success) {
      setUserProfile(updated);
      alert('昵称已保存');
    } else {
      alert('保存失败，请重试');
    }
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: '请填写所有字段' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: '新密码至少6位' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const result = await response.json();

      if (result.success) {
        setPasswordMessage({ type: 'success', text: '密码修改成功' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: result.error || '修改失败' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: '网络错误，请重试' });
    }

    setPasswordLoading(false);
  };

  // 退出登录
  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Settings size={24} className="text-slate-600" />
          系统设置
        </h1>
        <p className="text-slate-500 text-sm">管理个人资料和系统配置</p>
      </div>

      {/* 个人资料 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 mb-4">
        <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <User size={18} className="text-slate-600" />
          个人资料
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* 头像 */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white shadow-md">
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="头像"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={32} className="text-slate-300" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-black transition-colors shadow-lg shadow-slate-200">
              <Camera size={14} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* 昵称 */}
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-medium text-slate-500 mb-2">昵称</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入你的昵称"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 outline-none text-sm"
              />
              <button
                onClick={handleSaveNickname}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-medium shadow-lg shadow-slate-200"
              >
                保存
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">头像和昵称将显示在侧边栏和首页</p>
          </div>
        </div>
      </div>
      
      {/* 服务连接状态 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 mb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Zap size={18} className="text-slate-600" />
            服务连接状态
          </h2>
          <button
            onClick={testAllConnections}
            disabled={testingSupabase || testingClaude || testingOneapi}
            className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={(testingSupabase || testingClaude || testingOneapi) ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Supabase */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Database size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">Supabase</p>
                <p className="text-xs text-slate-400">PostgreSQL 云数据库</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testingSupabase ? (
                <RefreshCw size={16} className="text-slate-400 animate-spin" />
              ) : supabaseStatus?.success ? (
                <CheckCircle size={16} className="text-emerald-500" />
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
            className="text-slate-500 hover:text-slate-900 text-sm underline"
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
      
      {/* 修改密码 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-slate-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">修改密码</h2>
            <p className="text-xs text-slate-400">定期更换密码保护账户安全</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">当前密码</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all text-sm"
                placeholder="输入当前密码"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">新密码</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all text-sm"
              placeholder="输入新密码（至少6位）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">确认新密码</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all text-sm"
                placeholder="再次输入新密码"
              />
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-sm text-gray-600">显示密码</span>
          </label>

          {passwordMessage && (
            <div className={`p-3 rounded-xl text-sm ${
              passwordMessage.type === 'success' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 rounded-lg shadow-lg shadow-slate-200 transition-all disabled:opacity-50"
          >
            {passwordLoading ? '保存中...' : '保存新密码'}
          </button>
        </form>
      </div>

      {/* 退出登录 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
              <LogOut size={18} className="text-slate-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">退出登录</h2>
              <p className="text-xs text-slate-400">退出当前账户</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            退出
          </button>
        </div>
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
