'use client'

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  Star, 
  MessageCircle, 
  Eye, 
  Plus, 
  Calendar,
  AlertCircle,
  X,
  PieChart,
  Trash2,
  Camera,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getWeeklyStats, saveWeeklyStat, deleteWeeklyStat, WeeklyStat } from '@/lib/db';

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
      console.log('[DB] 从Supabase加载数据:', data.length, '条');
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

  // 图片上传处理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 检查文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }

    setAnalyzing(true);

    try {
      // 转换为base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setPreviewImage(base64);

      // 调用AI识别API
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      const result = await response.json();

      if (result.success && result.data) {
        // 自动填充表单（只填充识别到的字段）
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

  // 重置截图上传状态
  const resetImageUpload = () => {
    setPreviewImage(null);
  };

  // 同步小红书数据
  const handleSync = async () => {
    if (syncing) return;
    
    if (!confirm('确定要从小红书同步最新数据吗？')) return;
    
    setSyncing(true);
    
    try {
      const response = await fetch('/api/sync-xhs', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        alert(`同步成功！

账号：${result.data.nickname}
粉丝：${result.data.followers}
笔记：${result.data.notesCount} 篇
获赞：${result.data.totalLikes}
收藏：${result.data.totalCollects}`);
        
        loadData(); // 重新加载页面数据
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* 顶部导航区 */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="text-slate-600 w-6 h-6" />
            数据分析
          </h1>
          <p className="text-slate-500 text-sm mt-1">深度追踪运营趋势，驱动内容增长</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 transition-all text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步'}
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black active:scale-95 transition-all text-white font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-slate-200 text-sm"
          >
            <Plus size={18} />
            手动录入
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* 预警提示 */}
        {latestStat && latestStat.female_ratio < 60 && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-orange-800">女性粉丝占比偏低 ({latestStat.female_ratio}%)</h4>
              <p className="text-orange-700 text-sm mt-0.5">
                当前低于 60% 警戒线。建议增加更具亲和力的"猫咪日常"或"精致生活"笔记，弱化硬核颜值展示。
              </p>
            </div>
          </div>
        )}

        {/* 核心指标卡片组 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Users className="text-blue-500" />} label="新增粉丝" value={latestStat?.new_followers || 0} />
          <StatCard icon={<Heart className="text-red-500" />} label="点赞数" value={latestStat?.likes || 0} />
          <StatCard icon={<Star className="text-yellow-500" />} label="收藏数" value={latestStat?.saves || 0} />
          <StatCard icon={<MessageCircle className="text-green-500" />} label="评论数" value={latestStat?.comments || 0} />
          <StatCard icon={<Eye className="text-purple-500" />} label="浏览量" value={latestStat?.views || 0} />
          <StatCard icon={<TrendingUp className="text-pink-500" />} label="女粉占比" value={`${latestStat?.female_ratio || 0}%`} />
        </div>

        {/* 中间深度分析层 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 指标分析 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <PieChart className="text-slate-600" size={18} />
                效率评估
              </h3>
              <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-md">最新一周期</span>
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

          {/* 性别比例可视化 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Users className="text-slate-600" size={18} />
              粉丝性别画像
            </h3>
            <div className="flex items-center gap-4 h-24">
              <div className="flex-1">
                <div className="flex justify-between mb-2 text-sm font-bold">
                  <span className="text-pink-500">女性 {latestStat?.female_ratio || 0}%</span>
                  <span className="text-blue-500">男性 {100 - (latestStat?.female_ratio || 0)}%</span>
                </div>
                <div className="relative h-4 w-full bg-blue-100 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                    style={{ width: `${latestStat?.female_ratio || 0}%` }}
                  />
                </div>
                <div className="mt-4 flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                    <span className="text-xs text-slate-500">目标受众</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-slate-500">自然流量</span>
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center border-4 border-white shadow-inner">
                <div className="text-center">
                   <p className="text-xs text-slate-400">指数</p>
                   <p className="text-lg font-black text-pink-600">
                     {(latestStat?.female_ratio || 0) >= 80 ? 'A+' : (latestStat?.female_ratio || 0) >= 60 ? 'A' : 'B'}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 历史记录列表 */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg">历史趋势数据</h3>
            <span className="text-xs text-slate-400">共 {stats.length} 条记录</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400">加载数据中...</div>
            ) : stats.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="inline-block p-4 bg-slate-50 rounded-full text-slate-300">
                  <BarChart3 size={40} />
                </div>
                <p className="text-slate-400">目前还没有数据，开始录入第一笔吧！</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr className="text-left text-slate-500 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">统计周期</th>
                    <th className="px-6 py-4 font-semibold text-center">总粉丝</th>
                    <th className="px-6 py-4 font-semibold text-center">新增</th>
                    <th className="px-6 py-4 font-semibold text-center">互动(点/收/评)</th>
                    <th className="px-6 py-4 font-semibold text-center">女粉比</th>
                    <th className="px-6 py-4 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.map((stat) => (
                    <tr key={stat.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{stat.week_start}</span>
                          <span className="text-xs text-slate-400 font-normal italic">至 {stat.week_end}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-600">{stat.followers.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold">
                          +{stat.new_followers}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-red-400 font-medium"><Heart size={10} />{stat.likes}</span>
                          <span className="flex items-center gap-1 text-yellow-500 font-medium"><Star size={10} />{stat.saves}</span>
                          <span className="flex items-center gap-1 text-blue-400 font-medium"><MessageCircle size={10} />{stat.comments}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${stat.female_ratio >= 60 ? 'text-pink-500' : 'text-slate-400'}`}>
                          {stat.female_ratio}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDelete(stat.id!)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
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

      {/* 录入弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">录入周度运营数据</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              {/* 截图上传区域 */}
              <div className="mb-6">
                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  analyzing ? 'border-pink-300 bg-pink-50' : 'border-slate-200 hover:border-pink-300'
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
                      <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                      <span className="text-pink-500 text-sm font-medium">AI正在识别中...</span>
                    </div>
                  ) : previewImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={previewImage} alt="预览" className="max-h-24 rounded-lg" />
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <Check size={14} /> 已识别，点击可重新上传
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-slate-700 font-medium">上传小红书后台截图</span>
                        <p className="text-slate-400 text-xs mt-1">AI自动识别数据，支持 PNG、JPG</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 分隔线 */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-400 text-xs">或手动输入</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <InputItem 
                    label="开始日期" 
                    type="date" 
                    value={formData.week_start} 
                    onChange={v => setFormData({...formData, week_start: v})}
                    icon={<Calendar size={14} />}
                  />
                  <InputItem 
                    label="结束日期" 
                    type="date" 
                    value={formData.week_end} 
                    onChange={v => setFormData({...formData, week_end: v})}
                    icon={<Calendar size={14} />}
                  />
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl space-y-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">粉丝指标</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InputItem label="总粉丝数" type="number" value={formData.followers} onChange={v => setFormData({...formData, followers: Number(v)})} />
                    <InputItem label="本周新增" type="number" value={formData.new_followers} onChange={v => setFormData({...formData, new_followers: Number(v)})} />
                  </div>
                </div>

                <div className="p-4 bg-red-50/50 rounded-2xl space-y-4 border border-red-100">
                  <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest">互动详情</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <InputItem label="点赞数" type="number" value={formData.likes} onChange={v => setFormData({...formData, likes: Number(v)})} />
                    <InputItem label="收藏数" type="number" value={formData.saves} onChange={v => setFormData({...formData, saves: Number(v)})} />
                    <InputItem label="评论数" type="number" value={formData.comments} onChange={v => setFormData({...formData, comments: Number(v)})} />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">其他表现</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <InputItem label="总浏览量 (PV)" type="number" value={formData.views} onChange={v => setFormData({...formData, views: Number(v)})} />
                    </div>
                    <InputItem label="发布篇数" type="number" value={formData.posts_count} onChange={v => setFormData({...formData, posts_count: Number(v)})} />
                  </div>
                  <InputItem 
                    label="女性粉丝占比 (%)" 
                    type="range" 
                    min={0}
                    max={100}
                    value={formData.female_ratio} 
                    onChange={v => setFormData({...formData, female_ratio: Number(v)})} 
                  />
                  <div className="text-center text-lg font-black text-pink-500">{formData.female_ratio}%</div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 font-bold rounded-2xl text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-pink-500 text-white font-bold rounded-2xl hover:bg-pink-600 shadow-lg shadow-pink-200 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '确认保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 统计卡片组件
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black mt-1 text-slate-800">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// 进度条组件
function ProgressBar({ label, value, target, hint }: { label: string, value: string, target: number, hint: string }) {
  const numValue = Number(value);
  const isHealthy = numValue >= target;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-sm font-bold text-slate-700">{label}</span>
          <p className="text-[10px] text-slate-400">{hint}</p>
        </div>
        <div className={`text-lg font-black ${isHealthy ? 'text-green-500' : 'text-orange-500'}`}>
          {value}%
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isHealthy ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ width: `${Math.min(numValue * 5, 100)}%` }}
        />
      </div>
    </div>
  );
}

// 输入框组件
function InputItem({ label, type, value, onChange, icon, ...props }: { 
  label: string, 
  type: string, 
  value: string | number, 
  onChange: (v: string) => void,
  icon?: React.ReactNode,
  min?: number,
  max?: number
}) {
  return (
    <div className="w-full">
      <label className="text-xs font-bold text-slate-500 mb-1.5 block px-1 flex items-center gap-1">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm"
        {...props}
      />
    </div>
  );
}
