// 设计令牌 - 响应式间距系统
// 翡翠森绿主题 (Jade Forest)

// 颜色系统
export const colors = {
  primary: '#2D4B3E',          // 翡翠森绿
  primaryLight: '#426B5A',
  secondary: '#C5A267',        // 琥珀金
  
  bg: '#FDFBF7',               // 燕麦奶
  bgWarm: '#F7F3EE',           // 暖燕麦
  card: '#FFFFFF',
  
  border: 'rgba(45, 75, 62, 0.08)',
  borderHover: 'rgba(45, 75, 62, 0.15)',
  
  text: '#1A2421',             // 炭黑绿
  textSecondary: '#6B7A74',    // 灰绿
  textMuted: '#9BA8A3',
  
  success: '#2D4B3E',
  warning: '#C5A267',
  danger: '#B85C5C',
}

// 间距系统
export const spacing = {
  // 页面内边距
  page: {
    mobile: 'px-4 py-4',        // 16px
    tablet: 'md:px-6 md:py-6',  // 24px
    desktop: 'lg:px-8 lg:py-8'  // 32px
  },
  
  // 卡片内边距
  card: {
    mobile: 'p-4',              // 16px
    tablet: 'md:p-5',           // 20px
    desktop: 'lg:p-6'           // 24px
  },
  
  // 区块间距
  section: {
    mobile: 'space-y-4',        // 16px
    tablet: 'md:space-y-6',     // 24px
    desktop: 'lg:space-y-8'     // 32px
  },
  
  // 元素间距
  element: {
    tight: 'gap-2',             // 8px
    normal: 'gap-3 md:gap-4',   // 12px -> 16px
    loose: 'gap-4 md:gap-6'     // 16px -> 24px
  }
}

// 字体大小规范
export const typography = {
  // 页面标题
  pageTitle: 'text-xl md:text-2xl font-bold text-[#1A2421]',
  
  // 卡片标题
  cardTitle: 'text-base md:text-lg font-semibold text-[#1A2421]',
  
  // 区块标题
  sectionTitle: 'text-sm md:text-base font-medium text-[#2D4B3E]',
  
  // 正文
  body: 'text-sm md:text-base text-[#6B7A74]',
  
  // 小字/标签
  caption: 'text-xs md:text-sm text-[#6B7A74]',
  
  // 辅助文字
  helper: 'text-[10px] md:text-xs text-[#9BA8A3]'
}

// 圆角规范
export const radius = {
  card: 'rounded-xl md:rounded-2xl',
  button: 'rounded-lg',
  input: 'rounded-lg',
  tag: 'rounded-md',
  avatar: 'rounded-full'
}

// 阴影规范
export const shadows = {
  soft: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  float: 'shadow-[0_20px_50px_rgba(45,75,62,0.1)]',
  primary: 'shadow-lg shadow-[#2D4B3E]/20'
}

// 组合类
export const classes = {
  // 页面容器
  pageContainer: 'px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8',
  
  // 区块间距
  sectionGap: 'space-y-4 md:space-y-6 lg:space-y-8',
  
  // 网格间距
  gridGap: 'gap-3 md:gap-4 lg:gap-6',
  
  // 卡片样式
  card: 'bg-white rounded-xl md:rounded-2xl border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  
  // 主按钮
  buttonPrimary: 'bg-[#2D4B3E] hover:bg-[#3D6654] text-white shadow-lg shadow-[#2D4B3E]/20',
  
  // 次按钮
  buttonSecondary: 'bg-white border border-[#2D4B3E]/10 text-[#2D4B3E] hover:bg-[#F7F3EE]',
  
  // 幽灵按钮
  buttonGhost: 'text-[#6B7A74] hover:text-[#2D4B3E] hover:bg-[#2D4B3E]/5',
}

