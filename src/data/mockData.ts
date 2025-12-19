// Mock data for HududInfo.uz platform
// Based on Uzbekistan Geoportal structure

export type ObjectType = 'school' | 'kindergarten' | 'clinic' | 'water' | 'road';

export type IssueType = 
  | 'water_supply' 
  | 'road_condition' 
  | 'heating' 
  | 'medical_quality' 
  | 'staff_shortage'
  | 'infrastructure'
  | 'other';

export type FeedbackStatus = 
  | 'submitted' 
  | 'reviewing' 
  | 'in_progress' 
  | 'completed' 
  | 'rejected';

export interface InfrastructureObject {
  id: string;
  name: string;
  type: ObjectType;
  address: string;
  region: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  rating: number;
  totalReviews: number;
  totalFeedbacks: number;
  isNew: boolean;
  isReconstructed: boolean;
  capacity?: number;
  builtYear?: number;
  lastRenovation?: number;
}

export interface Feedback {
  id: string;
  objectId: string;
  objectName: string;
  issueType: IssueType;
  description: string;
  status: FeedbackStatus;
  isAnonymous: boolean;
  authorName?: string;
  authorPhone?: string;
  photos: string[];
  votes: number;
  hasVoted: boolean;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: FeedbackStatus;
    date: string;
    comment?: string;
  }[];
}

export interface Review {
  id: string;
  objectId: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export const objectTypeLabels: Record<ObjectType, string> = {
  school: "Maktab",
  kindergarten: "Bog'cha",
  clinic: "Poliklinika",
  water: "Suv ta'minoti",
  road: "Yo'l",
};

export const objectTypeColors: Record<ObjectType, string> = {
  school: "#3b82f6",
  kindergarten: "#a855f7",
  clinic: "#ef4444",
  water: "#06b6d4",
  road: "#f59e0b",
};

export const issueTypeLabels: Record<IssueType, string> = {
  water_supply: "Suv ta'minoti",
  road_condition: "Yo'l holati",
  heating: "Isitish tizimi",
  medical_quality: "Tibbiy xizmat sifati",
  staff_shortage: "Xodimlar yetishmasligi",
  infrastructure: "Infratuzilma",
  other: "Boshqa",
};

export const statusLabels: Record<FeedbackStatus, string> = {
  submitted: "Qabul qilindi",
  reviewing: "Ko'rib chiqilmoqda",
  in_progress: "Amalga oshirilmoqda",
  completed: "Bajarildi",
  rejected: "Rad etildi",
};

export const statusColors: Record<FeedbackStatus, string> = {
  submitted: "bg-info text-info-foreground",
  reviewing: "bg-warning text-warning-foreground",
  in_progress: "bg-accent text-accent-foreground",
  completed: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

// Mock infrastructure objects - Tashkent region
export const mockObjects: InfrastructureObject[] = [
  {
    id: "obj-001",
    name: "56-sonli umumta'lim maktabi",
    type: "school",
    address: "Chilonzor tumani, Bunyodkor ko'chasi 15",
    region: "Toshkent shahri",
    district: "Chilonzor tumani",
    coordinates: [41.2856, 69.2044],
    rating: 4.2,
    totalReviews: 48,
    totalFeedbacks: 12,
    isNew: false,
    isReconstructed: true,
    capacity: 1200,
    builtYear: 1985,
    lastRenovation: 2022,
  },
  {
    id: "obj-002",
    name: "23-sonli bolalar bog'chasi",
    type: "kindergarten",
    address: "Yakkasaroy tumani, Shota Rustaveli ko'chasi 45",
    region: "Toshkent shahri",
    district: "Yakkasaroy tumani",
    coordinates: [41.2992, 69.2678],
    rating: 3.8,
    totalReviews: 32,
    totalFeedbacks: 8,
    isNew: true,
    isReconstructed: false,
    capacity: 180,
    builtYear: 2023,
  },
  {
    id: "obj-003",
    name: "Mirzo Ulug'bek tumani oilaviy poliklinikasi",
    type: "clinic",
    address: "Mirzo Ulug'bek tumani, Universitet ko'chasi 7",
    region: "Toshkent shahri",
    district: "Mirzo Ulug'bek tumani",
    coordinates: [41.3383, 69.2855],
    rating: 3.5,
    totalReviews: 156,
    totalFeedbacks: 45,
    isNew: false,
    isReconstructed: false,
    builtYear: 1978,
  },
  {
    id: "obj-004",
    name: "Sergeli suv tarmog'i №12",
    type: "water",
    address: "Sergeli tumani, Yangi Sergeli mavzesi",
    region: "Toshkent shahri",
    district: "Sergeli tumani",
    coordinates: [41.2234, 69.2189],
    rating: 2.9,
    totalReviews: 23,
    totalFeedbacks: 67,
    isNew: false,
    isReconstructed: false,
    builtYear: 1992,
  },
  {
    id: "obj-005",
    name: "Olmazor-Chilonzor ichki yo'li",
    type: "road",
    address: "Olmazor tumani - Chilonzor tumani oralig'i",
    region: "Toshkent shahri",
    district: "Olmazor tumani",
    coordinates: [41.3123, 69.2345],
    rating: 3.2,
    totalReviews: 89,
    totalFeedbacks: 34,
    isNew: false,
    isReconstructed: true,
    lastRenovation: 2021,
  },
  {
    id: "obj-006",
    name: "112-sonli umumta'lim maktabi",
    type: "school",
    address: "Yunusobod tumani, Amir Temur ko'chasi 88",
    region: "Toshkent shahri",
    district: "Yunusobod tumani",
    coordinates: [41.3567, 69.2901],
    rating: 4.5,
    totalReviews: 72,
    totalFeedbacks: 5,
    isNew: true,
    isReconstructed: false,
    capacity: 1500,
    builtYear: 2024,
  },
  {
    id: "obj-007",
    name: "Bektemir tumani markaziy poliklinikasi",
    type: "clinic",
    address: "Bektemir tumani, Mustaqillik ko'chasi 23",
    region: "Toshkent shahri",
    district: "Bektemir tumani",
    coordinates: [41.2089, 69.3345],
    rating: 4.0,
    totalReviews: 98,
    totalFeedbacks: 18,
    isNew: false,
    isReconstructed: true,
    builtYear: 1990,
    lastRenovation: 2023,
  },
  {
    id: "obj-008",
    name: "45-sonli bolalar bog'chasi",
    type: "kindergarten",
    address: "Shayxontohur tumani, Zarqaynar ko'chasi 12",
    region: "Toshkent shahri",
    district: "Shayxontohur tumani",
    coordinates: [41.3234, 69.2456],
    rating: 3.6,
    totalReviews: 41,
    totalFeedbacks: 14,
    isNew: false,
    isReconstructed: false,
    capacity: 200,
    builtYear: 1995,
  },
  {
    id: "obj-009",
    name: "Uchtepa suv tarmog'i №8",
    type: "water",
    address: "Uchtepa tumani, Qoratosh mahallasi",
    region: "Toshkent shahri",
    district: "Uchtepa tumani",
    coordinates: [41.2789, 69.1923],
    rating: 2.5,
    totalReviews: 15,
    totalFeedbacks: 89,
    isNew: false,
    isReconstructed: false,
    builtYear: 1988,
  },
  {
    id: "obj-010",
    name: "Yunusobod-Shayhontohur ichki yo'li",
    type: "road",
    address: "Yunusobod - Shayxontohur tumanlari oralig'i",
    region: "Toshkent shahri",
    district: "Yunusobod tumani",
    coordinates: [41.3456, 69.2678],
    rating: 4.1,
    totalReviews: 56,
    totalFeedbacks: 11,
    isNew: false,
    isReconstructed: true,
    lastRenovation: 2024,
  },
];

// Mock feedbacks
export const mockFeedbacks: Feedback[] = [
  {
    id: "fb-001",
    objectId: "obj-004",
    objectName: "Sergeli suv tarmog'i №12",
    issueType: "water_supply",
    description: "Suv bosimi juda past, 3-qavatdan yuqoriga suv chiqmayapti. Ayniqsa ertalab va kechqurun muammo kuchayadi.",
    status: "in_progress",
    isAnonymous: false,
    authorName: "Aziz Karimov",
    photos: [],
    votes: 45,
    hasVoted: false,
    createdAt: "2024-12-15T10:30:00Z",
    updatedAt: "2024-12-18T14:20:00Z",
    statusHistory: [
      { status: "submitted", date: "2024-12-15T10:30:00Z" },
      { status: "reviewing", date: "2024-12-16T09:00:00Z" },
      { status: "in_progress", date: "2024-12-18T14:20:00Z", comment: "Suv nasosi ta'mirga olinadi" },
    ],
  },
  {
    id: "fb-002",
    objectId: "obj-003",
    objectName: "Mirzo Ulug'bek tumani oilaviy poliklinikasi",
    issueType: "staff_shortage",
    description: "Kardiolog mutaxassisi yo'q, eng yaqin kardiologga borish uchun 5 km yurish kerak.",
    status: "reviewing",
    isAnonymous: true,
    photos: [],
    votes: 78,
    hasVoted: true,
    createdAt: "2024-12-14T08:15:00Z",
    updatedAt: "2024-12-17T11:00:00Z",
    statusHistory: [
      { status: "submitted", date: "2024-12-14T08:15:00Z" },
      { status: "reviewing", date: "2024-12-17T11:00:00Z", comment: "Sog'liqni saqlash bo'limi bilan bog'lanildi" },
    ],
  },
  {
    id: "fb-003",
    objectId: "obj-005",
    objectName: "Olmazor-Chilonzor ichki yo'li",
    issueType: "road_condition",
    description: "Yo'lning shimoliy qismida katta chuqurlar paydo bo'lgan. Mashinalar shikastlanmoqda.",
    status: "completed",
    isAnonymous: false,
    authorName: "Nodira Alimova",
    photos: [],
    votes: 123,
    hasVoted: false,
    createdAt: "2024-12-01T16:45:00Z",
    updatedAt: "2024-12-10T12:30:00Z",
    statusHistory: [
      { status: "submitted", date: "2024-12-01T16:45:00Z" },
      { status: "reviewing", date: "2024-12-02T10:00:00Z" },
      { status: "in_progress", date: "2024-12-05T08:00:00Z", comment: "Ta'mir ishlari boshlandi" },
      { status: "completed", date: "2024-12-10T12:30:00Z", comment: "Yo'l to'liq ta'mirlandi" },
    ],
  },
  {
    id: "fb-004",
    objectId: "obj-001",
    objectName: "56-sonli umumta'lim maktabi",
    issueType: "heating",
    description: "Qishda sinflarda juda sovuq, isitish tizimi yaxshi ishlamayapti. Bolalar kasal bo'lmoqda.",
    status: "submitted",
    isAnonymous: false,
    authorName: "Malika Rahimova",
    photos: [],
    votes: 34,
    hasVoted: false,
    createdAt: "2024-12-18T09:20:00Z",
    updatedAt: "2024-12-18T09:20:00Z",
    statusHistory: [
      { status: "submitted", date: "2024-12-18T09:20:00Z" },
    ],
  },
  {
    id: "fb-005",
    objectId: "obj-009",
    objectName: "Uchtepa suv tarmog'i №8",
    issueType: "water_supply",
    description: "Ichimlik suvi tarkibida ko'p miqdorda qum bor. Suvni ichib bo'lmaydi.",
    status: "rejected",
    isAnonymous: true,
    photos: [],
    votes: 12,
    hasVoted: false,
    createdAt: "2024-12-10T14:00:00Z",
    updatedAt: "2024-12-12T10:00:00Z",
    statusHistory: [
      { status: "submitted", date: "2024-12-10T14:00:00Z" },
      { status: "reviewing", date: "2024-12-11T09:00:00Z" },
      { status: "rejected", date: "2024-12-12T10:00:00Z", comment: "Tekshiruv natijasida suv sifati me'yorga mos ekanligi aniqlandi" },
    ],
  },
];

// Mock reviews
export const mockReviews: Review[] = [
  {
    id: "rev-001",
    objectId: "obj-006",
    rating: 5,
    comment: "Yangi maktab juda chiroyli va zamonaviy jihozlangan. Bolalarimiz xursand.",
    authorName: "Sardor Toshmatov",
    createdAt: "2024-12-15T11:00:00Z",
  },
  {
    id: "rev-002",
    objectId: "obj-002",
    rating: 4,
    comment: "Yangi bog'cha yaxshi, lekin bog' maydoni kichik.",
    authorName: "Gulnora Karimova",
    createdAt: "2024-12-14T15:30:00Z",
  },
  {
    id: "rev-003",
    objectId: "obj-007",
    rating: 4,
    comment: "Ta'mirdan keyin poliklinika yaxshilandi, xodimlar mehribon.",
    authorName: "Rustam Ergashev",
    createdAt: "2024-12-12T09:15:00Z",
  },
];

// Statistics for admin dashboard
export const mockStats = {
  totalFeedbacks: 312,
  resolvedFeedbacks: 187,
  pendingFeedbacks: 89,
  rejectedFeedbacks: 36,
  averageResolutionDays: 5.2,
  satisfactionRate: 78,
  feedbacksByType: {
    water_supply: 98,
    road_condition: 67,
    heating: 45,
    medical_quality: 38,
    staff_shortage: 32,
    infrastructure: 22,
    other: 10,
  },
  feedbacksByRegion: {
    "Chilonzor tumani": 45,
    "Sergeli tumani": 67,
    "Mirzo Ulug'bek tumani": 38,
    "Yunusobod tumani": 29,
    "Yakkasaroy tumani": 33,
    "Olmazor tumani": 41,
    "Bektemir tumani": 25,
    "Shayxontohur tumani": 21,
    "Uchtepa tumani": 13,
  },
  monthlyFeedbacks: [
    { month: "Yan", count: 23 },
    { month: "Fev", count: 31 },
    { month: "Mar", count: 28 },
    { month: "Apr", count: 35 },
    { month: "May", count: 42 },
    { month: "Iyn", count: 38 },
    { month: "Iyl", count: 29 },
    { month: "Avg", count: 33 },
    { month: "Sen", count: 41 },
    { month: "Okt", count: 47 },
    { month: "Noy", count: 52 },
    { month: "Dek", count: 45 },
  ],
};
