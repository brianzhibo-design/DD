'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Bot, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  User,
  Upload,
  Loader2,
  Key,
  LogOut,
  Eye,
  EyeOff,
  Save,
  Type,
  Check,
  Wallet
} from 'lucide-react';
import { testSupabaseConnection } from '@/lib/db';
import { getUserProfile, UserProfile, loadUserProfile, saveUserProfile, compressImage } from '@/lib/user-profile';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionStatus {
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  status: 'checking' | 'connected' | 'error';
  message?: string;
}

export default function SettingsPage() {
  const { logout } = useAuth();
  
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    { name: 'Supabase 数据库', icon: Database, status: 'checking' },
    { name: 'Claude AI', icon: Bot, status: 'checking' },
    { name: 'OneAPI 小红书', icon: RefreshCw, status: 'checking' },
  ]);

  const [userProfile, setUserProfileState] = useState<UserProfile>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nickname, setNickname] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwds, setShowPwds] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [selectedFont, setSelectedFont] = useState('modern');

  // OneAPI 余额
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    checkConnections();
    loadProfile();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoadingBalance(true);
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('获取余额失败:', error);
    }
    setLoadingBalance(false);
  };

  const loadProfile = async () => {
    const profile = await loadUserProfile();
    setUserProfileState(profile);
    setNickname(profile.nickname || '');
  };

  const checkConnections = async () => {
    const supabaseOk = await testSupabaseConnection();
    setConnections(prev => prev.map(c => 
      c.name === 'Supabase 数据库' 
        ? { ...c, status: supabaseOk ? 'connected' : 'error', message: supabaseOk ? '连接正常' : '连接失败' }
        : c
    ));

    try {
      const aiRes = await fetch('/api/chat', { method: 'GET' });
      const aiData = await aiRes.json();
      setConnections(prev => prev.map(c => 
        c.name === 'Claude AI' 
          ? { ...c, status: aiData.configured ? 'connected' : 'error', message: aiData.configured ? 'API已配置' : '未配置API Key' }
          : c
      ));
    } catch {
      setConnections(prev => prev.map(c => 
        c.name === 'Claude AI' ? { ...c, status: 'error', message: '检测失败' } : c
      ));
    }

    try {
      const oneRes = await fetch('/api/sync-xhs', { method: 'GET' });
      const oneData = await oneRes.json();
      setConnections(prev => prev.map(c => 
        c.name === 'OneAPI 小红书' 
          ? { ...c, status: oneData.configured ? 'connected' : 'error', message: oneData.configured ? 'API已配置' : '未配置' }
          : c
      ));
    } catch {
      setConnections(prev => prev.map(c => 
        c.name === 'OneAPI 小红书' ? { ...c, status: 'error', message: '检测失败' } : c
      ));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    setUploadingAvatar(true);

    try {
      const base64 = await compressImage(file, 200);
      const newProfile = { ...userProfile, avatar: base64 };
      await saveUserProfile(newProfile);
      setUserProfileState(newProfile);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败');
    }

    setUploadingAvatar(false);
  };

  const handleSaveNickname = async () => {
    setSavingProfile(true);
    try {
      const newProfile = { ...userProfile, nickname };
      await saveUserProfile(newProfile);
      setUserProfileState(newProfile);
      alert('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      alert('请填写完整');
      return;
    }
    if (newPwd !== confirmPwd) {
      alert('两次密码不一致');
      return;
    }
    if (newPwd.length < 4) {
      alert('新密码至少4位');
      return;
    }

    setChangingPwd(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
      const data = await res.json();
      if (data.success) {
        alert('密码修改成功');
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
      } else {
        alert(data.error || '修改失败');
      }
    } catch (error) {
      alert('修改失败');
    }
    setChangingPwd(false);
  };

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await logout();
      window.location.href = '/login';
    }
  };

  const fontOptions = [
    { id: 'modern', name: '现代主义', desc: 'Lexend + Noto Sans SC' },
    { id: 'classical', name: '复古宋体', desc: 'ZCOOL XiaoWei' },
    { id: 'playful', name: '治愈圆体', desc: 'ZCOOL KuaiLe' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-[#2D4B3E] mb-2">系统设置</h1>
        <p className="text-[#6B7A74]">管理账户、连接状态和个性化配置</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
        <div className="flex items-center gap-2 mb-8">
          <User className="w-5 h-5 text-[#2D4B3E]" />
          <h2 className="font-bold text-[#2D4B3E] font-serif">个人资料</h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          <label className="relative cursor-pointer group shrink-0">
            <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed transition-colors ${
              uploadingAvatar ? 'border-[#6B7A74] bg-[#F4F6F0]' : 'border-[#2D4B3E]/20 hover:border-[#2D4B3E]/40'
            } flex items-center justify-center bg-[#F4F6F0]`}>
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-[#2D4B3E] animate-spin" />
              ) : userProfile.avatar ? (
                <img src={userProfile.avatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <Upload size={24} className="text-[#6B7A74]" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploadingAvatar}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-[#6B7A74] bg-white px-2 py-0.5 rounded-md shadow whitespace-nowrap">
              点击上传
            </div>
          </label>

          {/* Nickname */}
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-[#2D4B3E] mb-2">昵称</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="flex-1 px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                placeholder="输入昵称"
              />
              <button
                onClick={handleSaveNickname}
                disabled={savingProfile}
                className="px-6 py-3 bg-[#2D4B3E] text-white rounded-xl hover:bg-[#3D6654] transition-colors disabled:opacity-50 font-bold shadow-lg shadow-[#2D4B3E]/20 flex items-center gap-2"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Font Settings */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Type className="w-5 h-5 text-[#2D4B3E]" />
          <h2 className="font-bold text-[#2D4B3E] font-serif">字体预设</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fontOptions.map(font => (
            <button
              key={font.id}
              onClick={() => setSelectedFont(font.id)}
              className={`p-5 rounded-xl text-left transition-all border-2 ${
                selectedFont === font.id 
                  ? 'border-[#2D4B3E] bg-[#F4F6F0]' 
                  : 'border-transparent bg-[#FDFBF7] hover:bg-[#F4F6F0]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#2D4B3E]">{font.name}</span>
                {selectedFont === font.id && (
                  <Check size={16} className="text-[#2D4B3E]" />
                )}
              </div>
              <span className="text-xs text-[#6B7A74]">{font.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#2D4B3E]" />
            <h2 className="font-bold text-[#2D4B3E] font-serif">服务连接状态</h2>
          </div>
          <button
            onClick={checkConnections}
            className="text-sm text-[#6B7A74] hover:text-[#2D4B3E] flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            刷新
          </button>
        </div>
        
        <div className="space-y-4">
          {connections.map((conn, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  conn.status === 'connected' ? 'bg-emerald-50 text-emerald-600' :
                  conn.status === 'error' ? 'bg-red-50 text-red-500' :
                  'bg-[#F4F6F0] text-[#6B7A74]'
                }`}>
                  <conn.icon size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#2D4B3E]">{conn.name}</p>
                  <p className="text-xs text-[#6B7A74]">{conn.message || '检测中...'}</p>
                </div>
              </div>
              
              {conn.status === 'checking' ? (
                <Loader2 size={18} className="text-[#6B7A74] animate-spin" />
              ) : conn.status === 'connected' ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : (
                <XCircle size={18} className="text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* OneAPI Balance */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#2D4B3E]" />
            <h2 className="font-bold text-[#2D4B3E] font-serif">OneAPI 余额</h2>
          </div>
          <button
            onClick={fetchBalance}
            disabled={loadingBalance}
            className="text-sm text-[#6B7A74] hover:text-[#2D4B3E] flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingBalance ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex-1 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl">
            <p className="text-sm text-[#6B7A74] mb-1">可用余额</p>
            <p className="text-3xl font-bold text-emerald-600">
              {loadingBalance ? (
                <span className="text-[#6B7A74] text-lg">加载中...</span>
              ) : balance !== null ? (
                `¥${balance.toFixed(2)}`
              ) : (
                <span className="text-red-500 text-lg">获取失败</span>
              )}
            </p>
          </div>
          <div className="text-sm text-[#6B7A74] max-w-[200px]">
            <p className="mb-2">💡 余额用于：</p>
            <ul className="space-y-1 text-xs">
              <li>• 小红书数据同步</li>
              <li>• 笔记详情获取</li>
              <li>• 评论数据抓取</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Key className="w-5 h-5 text-[#2D4B3E]" />
          <h2 className="font-bold text-[#2D4B3E] font-serif">修改密码</h2>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPwds ? 'text' : 'password'}
              placeholder="当前密码"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E] pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPwds(!showPwds)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7A74]"
            >
              {showPwds ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <input
            type={showPwds ? 'text' : 'password'}
            placeholder="新密码"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
          />
          <input
            type={showPwds ? 'text' : 'password'}
            placeholder="确认新密码"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
          />
          <button
            onClick={handleChangePassword}
            disabled={changingPwd}
            className="w-full bg-[#2D4B3E] text-white py-4 rounded-xl hover:bg-[#3D6654] transition-colors disabled:opacity-50 font-bold shadow-lg shadow-[#2D4B3E]/20 flex items-center justify-center gap-2"
          >
            {changingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key size={18} />}
            修改密码
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 py-4 rounded-xl hover:bg-red-100 transition-colors font-bold flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        退出登录
      </button>
    </div>
  );
}
