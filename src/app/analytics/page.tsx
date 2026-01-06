'use client'

import { useState, useEffect } from 'react'
import { getWeeklyStats, saveWeeklyStat, deleteWeeklyStat } from '@/lib/db'
import { WeeklyStat } from '@/lib/supabase'
import { BarChart3, TrendingUp, Users, Heart, Bookmark, MessageCircle, Eye, PlusCircle, Trash2, AlertTriangle, X } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<WeeklyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
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
  })

  // 加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    console.log('[Analytics] Loading data from Supabase...')
    const data = await getWeeklyStats()
    console.log('[Analytics] Loaded', data.length, 'records')
    setStats(data)
    setLoading(false)
  }

  // 计算关键指标
  const latestStat = stats[0]
  const totalInteractions = latestStat 
    ? latestStat.likes + latestStat.saves + latestStat.comments 
    : 0
  const interactionRate = latestStat?.views 
    ? ((totalInteractions / latestStat.views) * 100).toFixed(2) 
    : '0'
  const saveRate = latestStat?.views 
    ? ((latestStat.saves / latestStat.views) * 100).toFixed(2) 
    : '0'

  // 保存数据
  const handleSubmit = async () => {
    if (!formData.week_start || !formData.week_end) {
      alert('请填写日期范围')
      return
    }
    
    setSaving(true)
    console.log('[Analytics] Saving to Supabase:', formData)
    
    const result = await saveWeeklyStat(formData)
    
    if (result) {
      console.log('[Analytics] Saved successfully:', result)
      setShowModal(false)
      loadData()
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
      })
    } else {
      alert('保存失败，请检查控制台')
    }
    setSaving(false)
  }

  // 删除数据
  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条记录？')) return
    
    const success = await deleteWeeklyStat(id)
    if (success) {
      loadData()
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={24} className="text-pink-500" />
            数据分析
          </h1>
          <p className="text-gray-500">追踪运营数据，分析内容表现（数据存储在 Supabase）</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={18} />
          录入本周数据
        </button>
      </div>

      {/* 警告提示 */}
      {latestStat && latestStat.female_ratio < 60 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">女性粉丝占比 {latestStat.female_ratio}%，低于60%警戒线</p>
            <p className="text-sm mt-1">建议增加猫咪日常和女性向生活内容，减少纯颜值展示</p>
          </div>
        </div>
      )}

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <DataCard icon={<Users size={24} className="text-blue-500" />} label="新增粉丝" value={latestStat?.new_followers || 0} prefix="+" />
        <DataCard icon={<Heart size={24} className="text-red-500" />} label="点赞数" value={latestStat?.likes || 0} />
        <DataCard icon={<Bookmark size={24} className="text-amber-500" />} label="收藏数" value={latestStat?.saves || 0} />
        <DataCard icon={<MessageCircle size={24} className="text-green-500" />} label="评论数" value={latestStat?.comments || 0} />
        <DataCard icon={<Eye size={24} className="text-purple-500" />} label="浏览量" value={latestStat?.views || 0} />
        <DataCard icon={<Users size={24} className="text-pink-500" />} label="女粉占比" value={`${latestStat?.female_ratio || 0}%`} highlight={latestStat && latestStat.female_ratio < 70} />
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-pink-500" />
            关键指标
          </h3>
          <div className="space-y-4">
            <MetricRow 
              label="收藏率（核心指标）" 
              value={`${saveRate}%`}
              hint="小红书核心指标，建议>5%"
              isGood={Number(saveRate) >= 5}
            />
            <MetricRow 
              label="互动率" 
              value={`${interactionRate}%`}
              hint="(点赞+收藏+评论) / 浏览量"
              isGood={Number(interactionRate) >= 10}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Users size={18} className="text-pink-500" />
            粉丝性别分布
          </h3>
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all" 
              style={{ width: `${latestStat?.female_ratio || 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-pink-500 font-medium">女性 {latestStat?.female_ratio || 0}%</span>
            <span className="text-blue-500 font-medium">男性 {100 - (latestStat?.female_ratio || 0)}%</span>
          </div>
          {latestStat && latestStat.female_ratio < 75 && (
            <p className="text-xs text-amber-600 mt-2">目标: 女粉占比 ≥ 75%</p>
          )}
        </div>
      </div>

      {/* 历史数据表格 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold mb-4">历史数据</h3>
        {loading ? (
          <p className="text-gray-500 text-center py-8">加载中...</p>
        ) : stats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">暂无数据</p>
            <button 
              onClick={() => setShowModal(true)}
              className="text-pink-500 hover:underline"
            >
              点击录入第一条数据
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b text-sm">
                  <th className="pb-3 font-medium">周期</th>
                  <th className="pb-3 font-medium">新增粉丝</th>
                  <th className="pb-3 font-medium">点赞</th>
                  <th className="pb-3 font-medium">收藏</th>
                  <th className="pb-3 font-medium">评论</th>
                  <th className="pb-3 font-medium">浏览量</th>
                  <th className="pb-3 font-medium">女粉占比</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, index) => (
                  <tr key={stat.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <span className="text-sm">{stat.week_start} ~ {stat.week_end}</span>
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded">最新</span>
                      )}
                    </td>
                    <td className="py-3 text-green-600">+{stat.new_followers}</td>
                    <td className="py-3">{stat.likes}</td>
                    <td className="py-3">{stat.saves}</td>
                    <td className="py-3">{stat.comments}</td>
                    <td className="py-3">{stat.views}</td>
                    <td className={`py-3 ${stat.female_ratio < 70 ? 'text-red-500' : 'text-pink-500'}`}>
                      {stat.female_ratio}%
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => stat.id && handleDelete(stat.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 录入弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">录入本周数据</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="开始日期" type="date" value={formData.week_start} 
                  onChange={(v) => setFormData({...formData, week_start: v})} />
                <InputField label="结束日期" type="date" value={formData.week_end}
                  onChange={(v) => setFormData({...formData, week_end: v})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="总粉丝数" type="number" value={formData.followers}
                  onChange={(v) => setFormData({...formData, followers: Number(v)})} />
                <InputField label="新增粉丝" type="number" value={formData.new_followers}
                  onChange={(v) => setFormData({...formData, new_followers: Number(v)})} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <InputField label="点赞数" type="number" value={formData.likes}
                  onChange={(v) => setFormData({...formData, likes: Number(v)})} />
                <InputField label="收藏数" type="number" value={formData.saves}
                  onChange={(v) => setFormData({...formData, saves: Number(v)})} />
                <InputField label="评论数" type="number" value={formData.comments}
                  onChange={(v) => setFormData({...formData, comments: Number(v)})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="浏览量" type="number" value={formData.views}
                  onChange={(v) => setFormData({...formData, views: Number(v)})} />
                <InputField label="发布笔记数" type="number" value={formData.posts_count}
                  onChange={(v) => setFormData({...formData, posts_count: Number(v)})} />
              </div>

              <InputField label="女粉占比 (%)" type="number" value={formData.female_ratio}
                onChange={(v) => setFormData({...formData, female_ratio: Number(v)})} />
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存到 Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 数据卡片组件
function DataCard({ icon, label, value, prefix = '', highlight = false }: { 
  icon: React.ReactNode, 
  label: string, 
  value: number | string, 
  prefix?: string,
  highlight?: boolean 
}) {
  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border ${highlight ? 'border-red-300 bg-red-50' : ''}`}>
      <div className="mb-2">{icon}</div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-red-500' : ''}`}>{prefix}{value}</div>
    </div>
  )
}

// 指标行组件
function MetricRow({ label, value, hint, isGood }: { label: string, value: string, hint: string, isGood: boolean }) {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-gray-700">{label}</span>
        <span className={`font-bold ${isGood ? 'text-green-500' : 'text-red-500'}`}>{value}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  )
}

// 输入框组件
function InputField({ label, type, value, onChange }: { 
  label: string, 
  type: string, 
  value: string | number, 
  onChange: (v: string) => void 
}) {
  return (
    <div>
      <label className="text-sm text-gray-500 block mb-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
      />
    </div>
  )
}
