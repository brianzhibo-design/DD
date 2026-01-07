export interface Cat {
  id: number;
  name: string;
  gender: '公' | '母';
  nickname?: string;
  personality?: string;
  traits?: string[];
  appearance: string;
  color: string;
  bgColor: string;
  contentTags?: string[];
  bestContentType?: string;
  notes?: string;
  avatar?: string;  // base64 图片
  createdAt?: Date;
  updatedAt?: Date;
}

// 初始数据 - 包含已确认的真实信息
export const initialCats: Cat[] = [
  { 
    id: 1, 
    name: "Baby",
    gender: "公",
    appearance: "白色长毛",
    color: "#E879F9",
    bgColor: "bg-purple-50",
    nickname: "",
    personality: "",
    traits: [],
    contentTags: [],
    bestContentType: "",
    notes: "",
  },
  { 
    id: 2, 
    name: "Mini",
    gender: "公",
    appearance: "橘白长毛",
    color: "#FDA4AF",
    bgColor: "bg-pink-50",
    nickname: "",
    personality: "",
    traits: [],
    contentTags: [],
    bestContentType: "",
    notes: "",
  },
  { 
    id: 3, 
    name: "提莫",
    gender: "公",
    appearance: "灰棕色长毛",
    color: "#FB923C",
    bgColor: "bg-orange-50",
    nickname: "",
    personality: "",
    traits: [],
    contentTags: [],
    bestContentType: "",
    notes: "",
  },
  { 
    id: 4, 
    name: "达令",
    gender: "母",
    appearance: "狸花",
    color: "#60A5FA",
    bgColor: "bg-blue-50",
    nickname: "",
    personality: "",
    traits: [],
    contentTags: [],
    bestContentType: "",
    notes: "唯一的母猫",
  },
  { 
    id: 5, 
    name: "熊崽",
    gender: "公",
    appearance: "烟灰色缅因长毛",
    color: "#FBBF24",
    bgColor: "bg-amber-50",
    nickname: "",
    personality: "",
    traits: [],
    contentTags: [],
    bestContentType: "",
    notes: "缅因猫，体型较大",
  },
  { 
    id: 6, 
    name: "甜心",
    gender: "公",
    appearance: "奶白色长毛",
    color: "#F472B6",
    bgColor: "bg-rose-50",
    nickname: "",
    personality: "",
    traits: [],
    contentTags: [],
    bestContentType: "",
    notes: "",
  },
];

export const getCatByName = (name: string) => initialCats.find(c => c.name === name);
export const getCatById = (id: number) => initialCats.find(c => c.id === id);

