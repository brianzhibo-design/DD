'use client';

import { useState, useEffect } from 'react';
import { Settings, Database, Key, AlertTriangle, CheckCircle, XCircle, RefreshCw, Bot, Zap, Camera, User, Lock, Eye, EyeOff, Shield, LogOut, Check, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const cached = getUserProfile();
    setUserProfile(cached);
    setNickname(cached.nickname || '');
    
    loadUserProfile().then(profile => {
      setUserProfile(profile);
      setNickname(profile.nickname || '');
    });
  }, []);
  
  useEffect(() => {
    testAllConnections();
  }, []);

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

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D3A30] mb-2 flex items-center gap-2">
          <Settings size={24} className="text-[#4A6741]" />
          系统设置
        </h1>
        <p className="text-[#7D8A80]">管理个人资料和系统配置</p>
      </div>

      {/* 个人资料 */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8D5] mb-6">
        <h2 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
          <User size={18} className="text-[#4A6741]" />
          个人资料
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F4F6F0] border-4 border-white shadow-lg">
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="头像"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={40} className="text-[#9CA89F]" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#4A6741] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3A5233] transition-colors shadow-md">
              <Camera size={16} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-[#2D3A30] mb-2">昵称</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入你的昵称"
                className="flex-1 px-4 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] outline-none text-[#2D3A30] bg-white"
              />
              <button
                onClick={handleSaveNickname}
                className="px-4 py-2 bg-[#4A6741] text-white rounded-lg hover:bg-[#3A5233] transition-colors shadow-sm"
              >
                保存
              </button>
            </div>
            <p className="text-xs text-[#7D8A80] mt-2">头像和昵称将显示在侧边栏和首页</p>
          </div>
        </div>
      </div>
      
      {/* 服务连接状态 */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8D5] mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#2D3A30] flex items-center gap-2">
            <Zap size={18} className="text-[#4A6741]" />
            服务连接状态
          </h2>
          <button
            onClick={testAllConnections}
            disabled={testingSupabase || testingClaude || testingOneapi}
            className="text-sm text-[#7D8A80] hover:text-[#4A6741] flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw size={14} className={(testingSupabase || testingClaude || testingOneapi) ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Supabase */}
          <div className="flex items-center justify-between p-4 bg-[#F4F6F0] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Database size={20} className="text-[#4A6741]" />
              </div>
              <div>
                <p className="font-medium text-[#2D3A30]">Supabase</p>
                <p className="text-xs text-[#7D8A80]">PostgreSQL 云数据库</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testingSupabase ? (
                <RefreshCw size={16} className="text-[#7D8A80] animate-spin" />
              ) : supabaseStatus?.success ? (
                <CheckCircle size={16} className="text-[#4A6741]" />
              ) : (
                <XCircle size={16} className="text-[#C75050]" />
              )}
              <span className={`text-sm ${supabaseStatus?.success ? 'text-[#4A6741]' : 'text-[#C75050]'}`}>
                {testingSupabase ? '检测中...' : supabaseStatus?.message}
              </span>
            </div>
          </div>

          {/* Claude AI */}
          <div className="flex items-center justify-between p-4 bg-[#F4F6F0] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Bot size={20} className="text-[#4A6741]" />
              </div>
              <div>
                <p className="font-medium text-[#2D3A30]">Claude AI</p>
                <p className="text-xs text-[#7D8A80]">Anthropic API Key</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testingClaude ? (
                <RefreshCw size={16} className="text-[#7D8A80] animate-spin" />
              ) : claudeStatus?.success ? (
                <CheckCircle size={16} className="text-[#4A6741]" />
              ) : (
                <XCircle size={16} className="text-[#C75050]" />
              )}
              <span className={`text-sm ${claudeStatus?.success ? 'text-[#4A6741]' : 'text-[#C75050]'}`}>
                {testingClaude ? '检测中...' : claudeStatus?.message}
              </span>
            </div>
          </div>

          {/* OneAPI */}
          <div className="flex items-center justify-between p-4 bg-[#F4F6F0] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Key size={20} className="text-[#4A6741]" />
              </div>
              <div>
                <p className="font-medium text-[#2D3A30]">OneAPI 小红书</p>
                <p className="text-xs text-[#7D8A80]">数据同步服务</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {testingOneapi ? (
                <RefreshCw size={16} className="text-[#7D8A80] animate-spin" />
              ) : oneapiStatus?.success ? (
                <CheckCircle size={16} className="text-[#4A6741]" />
              ) : (
                <XCircle size={16} className="text-[#C75050]" />
              )}
              <span className={`text-sm ${oneapiStatus?.success ? 'text-[#4A6741]' : 'text-[#C75050]'}`}>
                {testingOneapi ? '检测中...' : oneapiStatus?.message}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 修改密码 */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8D5] mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#F4F6F0] rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-[#4A6741]" />
          </div>
          <div>
            <h2 className="font-bold text-[#2D3A30]">修改密码</h2>
            <p className="text-sm text-[#7D8A80]">定期更换密码保护账户安全</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-[#2D3A30] mb-2">当前密码</label>
            <div className="relative">
              <input
                id="current-password"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white border border-[#E2E8D5] rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 transition-all text-[#2D3A30]"
                placeholder="输入当前密码"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#7D8A80] hover:text-[#4A6741]"
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-[#2D3A30] mb-2">新密码</label>
            <input
              id="new-password"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-[#E2E8D5] rounded-xl px-4 py-3 outline-none focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 transition-all text-[#2D3A30]"
              placeholder="输入新密码 (至少6位)"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#2D3A30] mb-2">确认新密码</label>
            <input
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-[#E2E8D5] rounded-xl px-4 py-3 outline-none focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 transition-all text-[#2D3A30]"
              placeholder="再次输入新密码"
            />
          </div>

          {passwordMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              passwordMessage.type === 'success' ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20' : 'bg-[#C75050]/10 text-[#C75050] border border-[#C75050]/20'
            }`}>
              {passwordMessage.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-[#4A6741] text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-[#3A5233] transition-all disabled:opacity-50"
          >
            {passwordLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                修改中...
              </span>
            ) : (
              '修改密码'
            )}
          </button>
        </form>
      </div>

      {/* 退出登录 */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8D5] mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F4F6F0] rounded-xl flex items-center justify-center">
              <LogOut size={20} className="text-[#7D8A80]" />
            </div>
            <div>
              <h2 className="font-bold text-[#2D3A30]">退出登录</h2>
              <p className="text-sm text-[#7D8A80]">退出当前账户</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-[#C75050] text-white rounded-xl hover:bg-[#B04545] transition-colors shadow-lg"
          >
            退出
          </button>
        </div>
      </div>

      {/* 关于 */}
      <div className="mt-8 text-center text-sm text-[#7D8A80]">
        <p>小离岛岛 · 小红书运营系统</p>
        <p className="mt-1">内容创作 × 生活方式 × 精致分享</p>
        <p className="mt-2">Powered by Claude + Supabase</p>
      </div>
    </div>
  );
}
