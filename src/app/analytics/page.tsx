'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  Star, 
  MessageCircle, 
  Eye, 
  Plus, 
  AlertCircle,
  X,
  PieChart,
  Trash2,
  Camera,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getWeeklyStats, saveWeeklyStat, deleteWeeklyStat, WeeklyStat } from '@/lib/db';

const StatCard = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) => (
  <div className="bg-white p-5 rounded-xl border border-[#E2E8D5] flex flex-col items-start">
    <div className="w-10 h-10 bg-[#F4F6F0] rounded-lg flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-[#4A6741]" />
    </div>
    <p className="text-xs text-[#7D8A80] font-medium mb-1">{label}</p>
    <p className="text-xl font-bold text-[#2D3A30]">{typeof value === 'number' ? value.toLocaleString() : value}</p>
  </div>
);

const ProgressBar = ({ label, value, target, hint }: { label: string; value: string; target: number; hint: string }) => {
  const numericValue = parseFloat(value);
  const isGood = numericValue >= target;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#2D3A30]">{label}</span>
        <span className={`text-sm font-semibold ${isGood ? 'text-[#4A6741]' : 'text-[#B8860B]'}`}>
          {value}%
        </span>
      </div>
      <div className="h-2.5 bg-[#F4F6F0] rounded-full overflow-hidden">
        <div 
          className={`h-full ${isGood ? 'bg-[#4A6741]' : 'bg-[#B8860B]'} rounded-full transition-all duration-500`} 
          style={{ width: `${Math.min(numericValue, 100)}%` }} 
        />
      </div>
      <p className={`text-xs mt-2 ${isGood ? 'text-[#4A6741]' : 'text-[#B8860B]'}`}>
        {hint}
      </p>
    </div>
  );
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<WeeklyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    week_start: '',
    week_end: '',
    followers: 0,
    new_followers: 0,
    likes: 0,
    saves: 0,
    comments: 0,
    views: 0,
    posts_count: 0,
    female_ratio: 85
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyStats();
      setStats(data);
    } catch (error) {
      console.error('加载失败:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await saveWeeklyStat(formData);
      if (result) {
        setShowModal(false);
        setPreviewImage(null);
        await loadData();
        setFormData({
          week_start: '',
          week_end: '',
          followers: 0,
          new_followers: 0,
          likes: 0,
          saves: 0,
          comments: 0,
          views: 0,
          posts_count: 0,
          female_ratio: 85
        });
      } else {
        alert('保存失败，请检查网络连接');
      }
    } catch (error) {
      console.error('保存错误:', error);
      alert('保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    const success = await deleteWeeklyStat(id);
    if (success) {
      await loadData();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }

    setAnalyzing(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setPreviewImage(base64);

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          ...(result.data.followers !== undefined && { followers: result.data.followers }),
          ...(result.data.new_followers !== undefined && { new_followers: result.data.new_followers }),
          ...(result.data.likes !== undefined && { likes: result.data.likes }),
          ...(result.data.saves !== undefined && { saves: result.data.saves }),
          ...(result.data.comments !== undefined && { comments: result.data.comments }),
          ...(result.data.views !== undefined && { views: result.data.views }),
          ...(result.data.posts_count !== undefined && { posts_count: result.data.posts_count }),
          ...(result.data.female_ratio !== undefined && { female_ratio: result.data.female_ratio }),
        }));
        
        alert('识别成功！请检查数据并补充日期');
      } else {
        alert(result.error || '识别失败，请手动输入');
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    }

    setAnalyzing(false);
  };

  const handleSync = async () => {
    if (syncing) return;
    
    if (!confirm('确定要从小红书同步最新数据吗？')) return;
    
    setSyncing(true);
    
    try {
      const response = await fetch('/api/sync-xhs', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        alert(`同步成功！\n\n账号：${result.data.nickname}\n粉丝：${result.data.followers}\n笔记：${result.data.notesCount} 篇\n获赞：${result.data.totalLikes}\n收藏：${result.data.totalCollects}`);
        loadData();
      } else {
        alert('同步失败: ' + result.error);
      }
    } catch (error) {
      console.error('同步错误:', error);
      alert('同步失败，请检查网络');
    }
    
    setSyncing(false);
  };

  const latestStat = stats[0];
  const totalInteractions = latestStat ? latestStat.likes + latestStat.saves + latestStat.comments : 0;
  const interactionRate = latestStat?.views ? ((totalInteractions / latestStat.views) * 100).toFixed(2) : '0';
  const saveRate = latestStat?.views ? ((latestStat.saves / latestStat.views) * 100).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3A30] flex items-center gap-2">
            <BarChart3 className="text-[#4A6741] w-6 h-6" />
            数据分析
          </h1>
          <p className="text-[#7D8A80] mt-1">深度追踪运营趋势，驱动内容增长</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-white border border-[#E2E8D5] hover:bg-[#F4F6F0] text-[#2D3A30] font-medium py-2.5 px-5 rounded-xl disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步小红书'}
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#4A6741] hover:bg-[#3A5233] text-white font-medium py-2.5 px-5 rounded-xl shadow-lg transition-all"
          >
            <Plus size={18} />
            手动录入
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* 预警 */}
        {latestStat && latestStat.female_ratio < 60 && (
          <div className="bg-[#B8860B]/10 border border-[#B8860B]/20 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#B8860B]">女性粉丝占比偏低 ({latestStat.female_ratio}%)</h4>
              <p className="text-[#B8860B]/80 text-sm mt-0.5">
                当前低于 60% 警戒线。建议增加更具亲和力的"猫咪日常"或"精致生活"笔记。
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Users} label="新增粉丝" value={latestStat?.new_followers || 0} />
          <StatCard icon={Heart} label="点赞数" value={latestStat?.likes || 0} />
          <StatCard icon={Star} label="收藏数" value={latestStat?.saves || 0} />
          <StatCard icon={MessageCircle} label="评论数" value={latestStat?.comments || 0} />
          <StatCard icon={Eye} label="浏览量" value={latestStat?.views || 0} />
          <StatCard icon={TrendingUp} label="女粉占比" value={`${latestStat?.female_ratio || 0}%`} />
        </div>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8D5]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#2D3A30] flex items-center gap-2">
                <PieChart className="text-[#4A6741]" size={20} />
                效率评估
              </h3>
              <span className="text-xs text-[#7D8A80] font-medium px-2 py-1 bg-[#F4F6F0] rounded-md">最新一周期</span>
            </div>
            <div className="space-y-6">
              <ProgressBar 
                label="收藏率 (核心指标)" 
                value={saveRate} 
                target={5} 
                hint="反映内容的实用价值，建议 >5%" 
              />
              <ProgressBar 
                label="互动率 (转粉潜力)" 
                value={interactionRate} 
                target={10} 
                hint="反映粉丝活跃度，建议 >10%" 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-6 flex items-center gap-2">
              <Users className="text-[#4A6741]" size={20} />
              粉丝性别画像
            </h3>
            <div className="flex items-center gap-4 h-24">
              <div className="flex-1">
                <div className="flex justify-between mb-2 text-sm font-bold">
                  <span className="text-[#4A6741]">女性 {latestStat?.female_ratio || 0}%</span>
                  <span className="text-[#7D8A80]">男性 {100 - (latestStat?.female_ratio || 0)}%</span>
                </div>
                <div className="relative h-3 w-full bg-[#F4F6F0] rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-[#4A6741] transition-all duration-1000 ease-out"
                    style={{ width: `${latestStat?.female_ratio || 0}%` }}
                  />
                </div>
                <div className="mt-4 flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4A6741]" />
                    <span className="text-xs text-[#7D8A80]">目标受众</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E2E8D5]" />
                    <span className="text-xs text-[#7D8A80]">自然流量</span>
                  </div>
                </div>
              </div>
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#F4F6F0] flex items-center justify-center border-4 border-white shadow-inner">
                <div className="text-center">
                  <p className="text-xs text-[#7D8A80]">指数</p>
                  <p className="text-lg font-black text-[#2D3A30]">
                    {(latestStat?.female_ratio || 0) >= 80 ? 'A+' : (latestStat?.female_ratio || 0) >= 60 ? 'A' : 'B'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8D5] overflow-hidden">
          <div className="p-6 border-b border-[#E2E8D5] flex justify-between items-center">
            <h3 className="font-bold text-[#2D3A30]">历史趋势数据</h3>
            <span className="text-xs text-[#7D8A80]">共 {stats.length} 条记录</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-[#7D8A80]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                加载数据中...
              </div>
            ) : stats.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="inline-block p-4 bg-[#F4F6F0] rounded-full text-[#9CA89F]">
                  <BarChart3 size={40} />
                </div>
                <p className="text-[#7D8A80]">目前还没有数据，开始录入第一笔吧！</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[#E2E8D5]">
                <thead className="bg-[#F4F6F0]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7D8A80] uppercase">周周期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7D8A80] uppercase">新增粉丝</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7D8A80] uppercase">点赞</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7D8A80] uppercase">收藏</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7D8A80] uppercase">评论</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7D8A80] uppercase">浏览量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7D8A80] uppercase">女粉占比</th>
                    <th className="relative px-6 py-3"><span className="sr-only">操作</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8D5]">
                  {stats.map((stat) => (
                    <tr key={stat.id} className="hover:bg-[#F4F6F0]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3A30]">
                        {stat.week_start} ~ {stat.week_end}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3A30]">
                        {stat.new_followers.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3A30]">
                        {stat.likes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3A30]">
                        {stat.saves.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3A30]">
                        {stat.comments.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3A30]">
                        {stat.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3A30]">
                        {stat.female_ratio}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(stat.id)}
                          className="text-[#C75050] hover:text-[#B04545]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#2D3A30]">手动录入数据</h3>
              <button onClick={() => { setShowModal(false); setPreviewImage(null); }} className="text-[#7D8A80] hover:text-[#2D3A30]">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* 截图上传 */}
              <div className="mb-6">
                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  analyzing ? 'border-[#7D8A80] bg-[#F4F6F0]' : 'border-[#E2E8D5] hover:border-[#4A6741]'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={analyzing}
                  />
                  
                  {analyzing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-[#4A6741] animate-spin" />
                      <span className="text-[#7D8A80] text-sm font-medium">AI正在识别中...</span>
                    </div>
                  ) : previewImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={previewImage} alt="预览" className="max-h-24 rounded-lg" />
                      <span className="text-[#4A6741] text-sm">已识别，点击可重新上传</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-[#F4F6F0] rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-[#7D8A80]" />
                      </div>
                      <div>
                        <span className="text-[#2D3A30] font-medium">上传小红书后台截图</span>
                        <p className="text-[#7D8A80] text-xs mt-1">AI自动识别数据</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[#E2E8D5]"></div>
                <span className="text-[#7D8A80] text-xs">或手动输入</span>
                <div className="flex-1 h-px bg-[#E2E8D5]"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">周开始日期</label>
                  <input
                    type="date"
                    value={formData.week_start}
                    onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">周结束日期</label>
                  <input
                    type="date"
                    value={formData.week_end}
                    onChange={(e) => setFormData({ ...formData, week_end: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">新增粉丝</label>
                  <input
                    type="number"
                    value={formData.new_followers}
                    onChange={(e) => setFormData({ ...formData, new_followers: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">浏览量</label>
                  <input
                    type="number"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">点赞数</label>
                  <input
                    type="number"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">收藏数</label>
                  <input
                    type="number"
                    value={formData.saves}
                    onChange={(e) => setFormData({ ...formData, saves: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">评论数</label>
                  <input
                    type="number"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3A30] mb-2">女粉占比 (%)</label>
                  <input
                    type="number"
                    value={formData.female_ratio}
                    onChange={(e) => setFormData({ ...formData, female_ratio: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#4A6741] text-white py-3 rounded-xl hover:bg-[#3A5233] transition-colors disabled:opacity-50 font-medium shadow-lg"
              >
                {saving ? '保存中...' : '保存数据'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
