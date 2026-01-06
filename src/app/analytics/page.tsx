'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Heart, Bookmark, MessageCircle, Eye, AlertTriangle, Plus, BarChart3, Pin, UserCheck, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { getWeeklyDataList, saveWeeklyData, WeeklyData } from '@/lib/storage';

export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    followers: '',
    likes: '',
    saves: '',
    comments: '',
    views: '',
    femaleRatio: '',
  });
  
  useEffect(() => {
    setWeeklyData(getWeeklyDataList());
  }, []);
  
  const latestData = weeklyData[weeklyData.length - 1];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newData: WeeklyData = {
      weekId: `${formData.startDate}_${formData.endDate}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      followers: parseInt(formData.followers) || 0,
      likes: parseInt(formData.likes) || 0,
      saves: parseInt(formData.saves) || 0,
      comments: parseInt(formData.comments) || 0,
      views: parseInt(formData.views) || 0,
      femaleRatio: parseFloat(formData.femaleRatio) || 0,
      topNotes: [],
    };
    
    saveWeeklyData(newData);
    setWeeklyData(getWeeklyDataList());
    setShowForm(false);
    setFormData({
      startDate: '',
      endDate: '',
      followers: '',
      likes: '',
      saves: '',
      comments: '',
      views: '',
      femaleRatio: '',
    });
  };
  
  // 计算收藏率
  const saveRate = latestData && latestData.views > 0 
    ? ((latestData.saves / latestData.views) * 100).toFixed(2)
    : '0';
  
  // 计算互动率
  const engagementRate = latestData && latestData.views > 0
    ? (((latestData.likes + latestData.saves + latestData.comments) / latestData.views) * 100).toFixed(2)
    : '0';
  
  // 风险检查
  const risks = [];
  if (latestData) {
    if (latestData.femaleRatio < 60) {
      risks.push({
        level: 'high',
        message: `女性粉丝占比 ${latestData.femaleRatio}%，低于60%警戒线`,
        suggestion: '建议增加猫咪日常和女性向生活内容，减少纯颜值展示'
      });
    } else if (latestData.femaleRatio < 65) {
      risks.push({
        level: 'medium',
        message: `女性粉丝占比 ${latestData.femaleRatio}%，接近警戒线`,
        suggestion: '持续关注，适当调整内容方向'
      });
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <BarChart3 size={24} className="text-pink-500" />
            数据分析
          </h1>
          <p className="text-gray-500">追踪运营数据，分析内容表现</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          录入本周数据
        </button>
      </div>
      
      {/* Risk Alerts */}
      {risks.length > 0 && (
        <div className="mb-6 space-y-3">
          {risks.map((risk, i) => (
            <div 
              key={i}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                risk.level === 'high' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <AlertTriangle 
                size={20} 
                className={risk.level === 'high' ? 'text-red-500' : 'text-amber-500'} 
              />
              <div>
                <p className={`font-medium ${risk.level === 'high' ? 'text-red-700' : 'text-amber-700'}`}>
                  {risk.message}
                </p>
                <p className="text-sm text-gray-600 mt-1">{risk.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Stats Grid */}
      {latestData ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-pink-500" />
                <span className="text-sm text-gray-500">新增粉丝</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">+{latestData.followers}</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={18} className="text-rose-500" />
                <span className="text-sm text-gray-500">点赞数</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{latestData.likes.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark size={18} className="text-amber-500" />
                <span className="text-sm text-gray-500">收藏数</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{latestData.saves.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={18} className="text-blue-500" />
                <span className="text-sm text-gray-500">评论数</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{latestData.comments.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={18} className="text-purple-500" />
                <span className="text-sm text-gray-500">浏览量</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{latestData.views.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-emerald-500" />
                <span className="text-sm text-gray-500">女粉占比</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{latestData.femaleRatio}%</p>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Pin size={18} className="text-amber-500" />
                关键指标
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">收藏率（核心指标）</span>
                    <span className="font-bold text-amber-600">{saveRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(parseFloat(saveRate) * 10, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">小红书核心指标，建议&gt;5%</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">互动率</span>
                    <span className="font-bold text-blue-600">{engagementRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(parseFloat(engagementRate) * 5, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">（点赞+收藏+评论）/ 浏览量</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserCheck size={18} className="text-pink-500" />
                粉丝性别分布
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-8 bg-gray-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${latestData.femaleRatio}%` }}
                    >
                      {latestData.femaleRatio}%
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${100 - latestData.femaleRatio}%` }}
                    >
                      {100 - latestData.femaleRatio}%
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-pink-600 flex items-center gap-1"><Users size={14} /> 女性</span>
                    <span className="text-blue-600 flex items-center gap-1"><Users size={14} /> 男性</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {latestData.femaleRatio >= 65 
                    ? <><CheckCircle size={14} className="text-green-500" /> 粉丝画像健康，符合目标用户定位</>
                    : latestData.femaleRatio >= 60
                    ? <><AlertCircle size={14} className="text-amber-500" /> 接近警戒线，建议关注内容方向</>
                    : <><XCircle size={14} className="text-red-500" /> 低于警戒线，需要调整内容策略</>}
                </p>
              </div>
            </div>
          </div>
          
          {/* Data History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-purple-500" />
              历史数据
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">周期</th>
                    <th className="px-4 py-3 text-right text-gray-500 font-medium">粉丝</th>
                    <th className="px-4 py-3 text-right text-gray-500 font-medium">点赞</th>
                    <th className="px-4 py-3 text-right text-gray-500 font-medium">收藏</th>
                    <th className="px-4 py-3 text-right text-gray-500 font-medium">评论</th>
                    <th className="px-4 py-3 text-right text-gray-500 font-medium">女粉占比</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.slice().reverse().map((data, i) => (
                    <tr key={data.weekId} className={i === 0 ? 'bg-pink-50' : 'border-b'}>
                      <td className="px-4 py-3 text-gray-700">
                        {data.startDate} ~ {data.endDate}
                        {i === 0 && <span className="ml-2 text-xs text-pink-500">最新</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">+{data.followers}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{data.likes.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{data.saves.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{data.comments.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={data.femaleRatio < 60 ? 'text-red-600' : 'text-gray-700'}>
                          {data.femaleRatio}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {weeklyData.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                暂无数据，点击右上角按钮录入本周数据
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
          <BarChart3 size={64} className="mx-auto mb-4 text-pink-400" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">暂无运营数据</h3>
          <p className="text-gray-500 mb-6">开始录入数据，追踪你的小红书运营表现</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            录入第一周数据
          </button>
        </div>
      )}
      
      {/* Data Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-4 border-b bg-gradient-to-r from-pink-500 to-purple-500 rounded-t-2xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} />
                录入本周数据
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新增粉丝</label>
                  <input
                    type="number"
                    value={formData.followers}
                    onChange={e => setFormData({...formData, followers: e.target.value})}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">点赞数</label>
                  <input
                    type="number"
                    value={formData.likes}
                    onChange={e => setFormData({...formData, likes: e.target.value})}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收藏数</label>
                  <input
                    type="number"
                    value={formData.saves}
                    onChange={e => setFormData({...formData, saves: e.target.value})}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">评论数</label>
                  <input
                    type="number"
                    value={formData.comments}
                    onChange={e => setFormData({...formData, comments: e.target.value})}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">浏览量</label>
                  <input
                    type="number"
                    value={formData.views}
                    onChange={e => setFormData({...formData, views: e.target.value})}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">女粉占比 (%)</label>
                  <input
                    type="number"
                    value={formData.femaleRatio}
                    onChange={e => setFormData({...formData, femaleRatio: e.target.value})}
                    placeholder="如: 65"
                    min="0"
                    max="100"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:opacity-90"
                >
                  保存数据
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

