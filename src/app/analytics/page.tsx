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
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { getWeeklyStats, saveWeeklyStat, deleteWeeklyStat, WeeklyStat } from '@/lib/db';

const StatCard = ({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; trend?: string }) => (
  <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:translate-y-[-4px] transition-all">
    <div className="flex justify-between items-start mb-5">
      <div className="p-3 bg-[#F4F6F0] rounded-xl text-[#2D4B3E]">
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </div>
      )}
    </div>
    <p className="text-[11px] text-[#6B7A74] font-bold mb-1 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black text-[#2D4B3E] font-serif">{typeof value === 'number' ? value.toLocaleString() : value}</p>
  </div>
);

const ProgressBar = ({ label, value, target, hint }: { label: string; value: string; target: number; hint: string }) => {
  const numericValue = parseFloat(value);
  const isGood = numericValue >= target;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-[#2D4B3E]">{label}</span>
        <span className={`text-sm font-bold ${isGood ? 'text-[#2D4B3E]' : 'text-[#C5A267]'}`}>
          {value}%
        </span>
      </div>
      <div className="h-2.5 bg-[#F4F6F0] rounded-full overflow-hidden">
        <div 
          className={`h-full ${isGood ? 'bg-[#2D4B3E]' : 'bg-[#C5A267]'} rounded-full transition-all duration-500`} 
          style={{ width: `${Math.min(numericValue, 100)}%` }} 
        />
      </div>
      <p className={`text-xs mt-2 ${isGood ? 'text-[#2D4B3E]' : 'text-[#C5A267]'}`}>
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
        alert(`同步成功！\n\n账号：${result.data.nickname}\n粉丝：${result.data.followers}\n笔记：${result.data.notesCount} 篇`);
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif text-[#2D4B3E] mb-2">笔记分析</h1>
          <p className="text-[#6B7A74]">深度追踪运营趋势，驱动内容增长</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-white border border-[#2D4B3E]/10 hover:bg-[#F4F6F0] text-[#2D4B3E] font-bold py-3 px-6 rounded-xl disabled:opacity-50 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步小红书'}
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#2D4B3E] hover:bg-[#3D6654] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#2D4B3E]/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            手动录入
          </button>
        </div>
      </div>

      {/* 预警 */}
      {latestStat && latestStat.female_ratio < 60 && (
        <div className="bg-[#C5A267]/10 border border-[#C5A267]/20 p-5 rounded-[2rem] flex items-start gap-4 mb-8">
          <AlertCircle className="text-[#C5A267] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[#C5A267]">女性粉丝占比偏低 ({latestStat.female_ratio}%)</h4>
            <p className="text-[#C5A267]/80 text-sm mt-1">
              当前低于 60% 警戒线。建议增加更具亲和力的"猫咪日常"或"精致生活"笔记。
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
        <StatCard icon={Users} label="新增粉丝" value={latestStat?.new_followers || 0} trend="+5.8%" />
        <StatCard icon={Heart} label="点赞数" value={latestStat?.likes || 0} trend="+12.3%" />
        <StatCard icon={Star} label="收藏数" value={latestStat?.saves || 0} trend="+8.1%" />
        <StatCard icon={MessageCircle} label="评论数" value={latestStat?.comments || 0} trend="+3.2%" />
        <StatCard icon={Eye} label="浏览量" value={latestStat?.views || 0} trend="+14.2%" />
        <StatCard icon={TrendingUp} label="女粉占比" value={`${latestStat?.female_ratio || 0}%`} />
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-[#2D4B3E] font-serif text-lg flex items-center gap-2">
              <PieChart className="text-[#2D4B3E]" size={20} />
              效率评估
            </h3>
            <span className="text-xs text-[#6B7A74] font-bold px-3 py-1.5 bg-[#F4F6F0] rounded-lg uppercase tracking-wider">最新一周期</span>
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

        <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="font-bold text-[#2D4B3E] font-serif text-lg mb-8 flex items-center gap-2">
            <Users className="text-[#2D4B3E]" size={20} />
            粉丝性别画像
          </h3>
          <div className="flex items-center gap-6 h-24">
            <div className="flex-1">
              <div className="flex justify-between mb-3 text-sm font-bold">
                <span className="text-[#2D4B3E]">女性 {latestStat?.female_ratio || 0}%</span>
                <span className="text-[#6B7A74]">男性 {100 - (latestStat?.female_ratio || 0)}%</span>
              </div>
              <div className="relative h-3 w-full bg-[#F4F6F0] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[#2D4B3E] transition-all duration-1000 ease-out"
                  style={{ width: `${latestStat?.female_ratio || 0}%` }}
                />
              </div>
              <div className="mt-4 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2D4B3E]" />
                  <span className="text-xs text-[#6B7A74]">目标受众</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#F4F6F0]" />
                  <span className="text-xs text-[#6B7A74]">自然流量</span>
                </div>
              </div>
            </div>
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#F4F6F0] flex items-center justify-center border-4 border-white shadow-inner">
              <div className="text-center">
                <p className="text-xs text-[#6B7A74] font-bold uppercase">指数</p>
                <p className="text-xl font-black text-[#2D4B3E] font-serif">
                  {(latestStat?.female_ratio || 0) >= 80 ? 'A+' : (latestStat?.female_ratio || 0) >= 60 ? 'A' : 'B'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="p-6 border-b border-[#2D4B3E]/5 flex justify-between items-center">
          <h3 className="font-bold text-[#2D4B3E] font-serif">历史趋势数据</h3>
          <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider">共 {stats.length} 条记录</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-[#6B7A74]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
              加载数据中...
            </div>
          ) : stats.length === 0 ? (
            <div className="p-24 text-center space-y-5">
              <div className="inline-block p-5 bg-[#F4F6F0] rounded-2xl text-[#9BA8A3]">
                <BarChart3 size={44} />
              </div>
              <p className="text-[#6B7A74] text-lg">目前还没有数据，开始录入第一笔吧！</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#2D4B3E]/5">
              <thead className="bg-[#F4F6F0]">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[#6B7A74] uppercase tracking-widest">周周期</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[#6B7A74] uppercase tracking-widest">新增粉丝</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[#6B7A74] uppercase tracking-widest">点赞</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[#6B7A74] uppercase tracking-widest">收藏</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[#6B7A74] uppercase tracking-widest">评论</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[#6B7A74] uppercase tracking-widest">浏览量</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[#6B7A74] uppercase tracking-widest">女粉占比</th>
                  <th className="relative px-6 py-4"><span className="sr-only">操作</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#2D4B3E]/5">
                {stats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#2D4B3E]">
                      {stat.week_start} ~ {stat.week_end}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D4B3E]">
                      {stat.new_followers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D4B3E]">
                      {stat.likes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D4B3E]">
                      {stat.saves.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D4B3E]">
                      {stat.comments.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D4B3E]">
                      {stat.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D4B3E]">
                      {stat.female_ratio}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {stat.id && (
                        <button
                          onClick={() => handleDelete(stat.id!)}
                          className="text-[#B85C5C] hover:text-[#A04848]"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(45,75,62,0.2)] w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-[#2D4B3E] font-serif">手动录入数据</h3>
              <button onClick={() => { setShowModal(false); setPreviewImage(null); }} className="text-[#6B7A74] hover:text-[#2D4B3E]">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* 截图上传 */}
              <div className="mb-8">
                <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  analyzing ? 'border-[#6B7A74] bg-[#F4F6F0]' : 'border-[#2D4B3E]/10 hover:border-[#2D4B3E]/30'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={analyzing}
                  />
                  
                  {analyzing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-[#2D4B3E] animate-spin" />
                      <span className="text-[#6B7A74] text-sm font-bold">AI正在识别中...</span>
                    </div>
                  ) : previewImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={previewImage} alt="预览" className="max-h-24 rounded-xl" />
                      <span className="text-[#2D4B3E] text-sm font-bold">已识别，点击可重新上传</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-[#F4F6F0] rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-[#6B7A74]" />
                      </div>
                      <div>
                        <span className="text-[#2D4B3E] font-bold">上传小红书后台截图</span>
                        <p className="text-[#6B7A74] text-xs mt-1">AI自动识别数据</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-[#2D4B3E]/10"></div>
                <span className="text-[#6B7A74] text-xs font-bold uppercase tracking-wider">或手动输入</span>
                <div className="flex-1 h-px bg-[#2D4B3E]/10"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">周开始日期</label>
                  <input
                    type="date"
                    value={formData.week_start}
                    onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">周结束日期</label>
                  <input
                    type="date"
                    value={formData.week_end}
                    onChange={(e) => setFormData({ ...formData, week_end: e.target.value })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">新增粉丝</label>
                  <input
                    type="number"
                    value={formData.new_followers}
                    onChange={(e) => setFormData({ ...formData, new_followers: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">浏览量</label>
                  <input
                    type="number"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">点赞数</label>
                  <input
                    type="number"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">收藏数</label>
                  <input
                    type="number"
                    value={formData.saves}
                    onChange={(e) => setFormData({ ...formData, saves: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">评论数</label>
                  <input
                    type="number"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D4B3E] mb-2">女粉占比 (%)</label>
                  <input
                    type="number"
                    value={formData.female_ratio}
                    onChange={(e) => setFormData({ ...formData, female_ratio: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#2D4B3E] text-white py-4 rounded-xl hover:bg-[#3D6654] transition-colors disabled:opacity-50 font-bold shadow-lg shadow-[#2D4B3E]/20"
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
