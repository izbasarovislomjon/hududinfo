import type {
  FeedbackStatus,
  IssueType,
  InfrastructureObject,
  ObjectType,
} from "@/lib/types";
import { getRatingTitle } from "@/lib/reputation";
import {
  type ReportValidationResult,
  validateSubmittedReport,
} from "@/lib/report-validation";

export type LocalRole = "admin" | "user";
export type ChecklistAnswer = "yes" | "no";

export interface LocalUserRecord {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: LocalRole;
  createdAt: string;
}

export interface LocalFeedbackRecord {
  id: string;
  userId: string;
  objectId: string;
  issueType: IssueType;
  description: string;
  status: FeedbackStatus;
  isAnonymous: boolean;
  authorName: string | null;
  authorPhone: string | null;
  adminComment: string | null;
  validation?: ReportValidationResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalFeedbackVoteRecord {
  id: string;
  feedbackId: string;
  userId: string;
  createdAt: string;
}

export interface LocalFeedbackStatusHistory {
  id: string;
  feedbackId: string;
  status: FeedbackStatus;
  comment: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface LocalNewsRecord {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  region: string | null;
  district: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface LocalChecklistProgram {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bg: string;
  borderColor: string;
  institution: string;
  type: ObjectType;
  completionBonus: number;
}

export interface LocalChecklistQuestion {
  id: string;
  programId: string;
  text: string;
  important: boolean;
  points: number;
}

export interface LocalChecklistSubmission {
  id: string;
  userId: string;
  programId: string;
  answers: Array<{ questionId: string; answer: ChecklistAnswer }>;
  yesCount: number;
  noCount: number;
  earnedPoints: number;
  createdAt: string;
}

export interface LocalNotificationRecord {
  id: string;
  userId: string;
  type: "news" | "feedback_status" | "feedback_response" | "feedback_removed";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface LocalReviewRecord {
  id: string;
  userId: string;
  objectId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface LocalBackendState {
  version: number;
  users: LocalUserRecord[];
  objects: InfrastructureObject[];
  feedbacks: LocalFeedbackRecord[];
  feedbackVotes: LocalFeedbackVoteRecord[];
  feedbackStatusHistory: LocalFeedbackStatusHistory[];
  news: LocalNewsRecord[];
  checklistPrograms: LocalChecklistProgram[];
  checklistQuestions: LocalChecklistQuestion[];
  checklistSubmissions: LocalChecklistSubmission[];
  notifications: LocalNotificationRecord[];
  reviews: LocalReviewRecord[];
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: LocalRole;
  reputationPoints: number;
  titleLabel: string;
  titleEmoji: string;
  titleColor: string;
  isGuest?: boolean;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  titleLabel: string;
  titleEmoji: string;
  titleColor: string;
  reputationPoints: number;
  role: LocalRole;
}

export interface FeedbackView {
  id: string;
  issue_type: IssueType;
  description: string;
  status: FeedbackStatus;
  votes: number;
  is_anonymous: boolean;
  author_name: string | null;
  created_at: string;
  updated_at: string;
  admin_comment: string | null;
  object_id: string;
  object_name: string;
  object_type: ObjectType;
  object_region: string;
  object_district: string;
  user_id: string;
  submitter: PublicUserProfile;
  display_name: string;
  has_voted: boolean;
  validation: ReportValidationResult | null;
}

export interface ChecklistProgramView extends LocalChecklistProgram {
  totalCount: number;
  totalPossiblePoints: number;
  submissionsCount: number;
  lastEarnedPoints: number | null;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  feedbacks: number;
  votes: number;
  completed: number;
  rejected: number;
  checklistPoints: number;
  reputationPoints: number;
  titleLabel: string;
  titleEmoji: string;
  titleColor: string;
  role: LocalRole;
}

const STORAGE_KEY = "hududinfo.local-backend.v4";
const SESSION_KEY = "hududinfo.local-backend.session";
const LAST_GUEST_KEY = "hududinfo.local-backend.last-guest";
const BACKEND_EVENT = "hududinfo-local-backend-change";
const SESSION_EVENT = "hududinfo-local-backend-session-change";
const STATE_VERSION = 4;

const GUEST_FIRST_NAMES = [
  "Azamat",
  "Sevinch",
  "Bekzod",
  "Madina",
  "Javohir",
  "Shahzoda",
  "Kamron",
  "Nilufar",
  "Oybek",
  "Sitora",
  "Sunnat",
  "Mubina",
];

const GUEST_LAST_NAMES = [
  "Karimov",
  "Rahimova",
  "Yusupov",
  "Toshmatova",
  "Aliyev",
  "Saidova",
  "Rasulov",
  "Qodirova",
  "Ismoilov",
  "Nazarova",
];

const asyncResolve = <T,>(value: T) => Promise.resolve(value);

function nowIso() {
  return new Date().toISOString();
}

function relativeIso(days: number, hours = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emitBackendChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(BACKEND_EVENT));
}

function emitSessionChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

const DEMO_USERS: Array<Omit<LocalUserRecord, "createdAt">> = [
  {
    id: "user-admin-001",
    email: "admin@hududinfo.local",
    password: "admin123",
    fullName: "Dilshod Rahmonov",
    phone: "+998 90 100 00 01",
    role: "admin",
  },
  {
    id: "user-aziz-001",
    email: "aziz@hududinfo.local",
    password: "demo123",
    fullName: "Aziz Karimov",
    phone: "+998 90 123 45 67",
    role: "user",
  },
  {
    id: "user-malika-001",
    email: "malika@hududinfo.local",
    password: "demo123",
    fullName: "Malika Rahimova",
    phone: "+998 91 222 11 33",
    role: "user",
  },
  {
    id: "user-dilnoza-001",
    email: "dilnoza@hududinfo.local",
    password: "demo123",
    fullName: "Dilnoza Yusupova",
    phone: "+998 93 444 22 11",
    role: "user",
  },
  {
    id: "user-jasur-001",
    email: "jasur@hududinfo.local",
    password: "demo123",
    fullName: "Jasur Toshmatov",
    phone: "+998 90 987 65 43",
    role: "user",
  },
  {
    id: "user-nodira-001",
    email: "nodira@hududinfo.local",
    password: "demo123",
    fullName: "Nodira Alimova",
    phone: "+998 97 111 77 55",
    role: "user",
  },
  {
    id: "user-sardor-001",
    email: "sardor@hududinfo.local",
    password: "demo123",
    fullName: "Sardor Toshmatov",
    phone: "+998 99 700 20 20",
    role: "user",
  },
  {
    id: "user-odina-001",
    email: "odina@hududinfo.local",
    password: "demo123",
    fullName: "Odina Rasulova",
    phone: "+998 94 500 12 12",
    role: "user",
  },
];

const SEED_OBJECTS: InfrastructureObject[] = [
  {
    id: "obj-toshkent-school-01",
    name: "56-sonli umumta'lim maktabi",
    type: "school",
    address: "Chilonzor tumani, Bunyodkor ko'chasi 15",
    region: "Toshkent shahri",
    district: "Chilonzor tumani",
    lat: 41.2856,
    lng: 69.2044,
    rating: 4.1,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: 1200,
    built_year: 1985,
    last_renovation: 2022,
  },
  {
    id: "obj-toshkent-garden-01",
    name: "23-sonli bolalar bog'chasi",
    type: "kindergarten",
    address: "Yakkasaroy tumani, Shota Rustaveli ko'chasi 45",
    region: "Toshkent shahri",
    district: "Yakkasaroy tumani",
    lat: 41.2992,
    lng: 69.2678,
    rating: 3.9,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: true,
    is_reconstructed: false,
    capacity: 180,
    built_year: 2023,
    last_renovation: null,
  },
  {
    id: "obj-toshkent-clinic-01",
    name: "Mirzo Ulug'bek tumani oilaviy poliklinikasi",
    type: "clinic",
    address: "Mirzo Ulug'bek tumani, Universitet ko'chasi 7",
    region: "Toshkent shahri",
    district: "Mirzo Ulug'bek tumani",
    lat: 41.3383,
    lng: 69.2855,
    rating: 3.5,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: null,
    built_year: 1978,
    last_renovation: null,
  },
  {
    id: "obj-toshkent-water-01",
    name: "Sergeli suv tarmog'i 12",
    type: "water",
    address: "Sergeli tumani, Yangi Sergeli mavzesi",
    region: "Toshkent shahri",
    district: "Sergeli tumani",
    lat: 41.2234,
    lng: 69.2189,
    rating: 3,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: null,
    built_year: 1992,
    last_renovation: null,
  },
  {
    id: "obj-toshkent-road-01",
    name: "Olmazor-Chilonzor ichki yo'li",
    type: "road",
    address: "Olmazor tumani - Chilonzor tumani oralig'i",
    region: "Toshkent shahri",
    district: "Olmazor tumani",
    lat: 41.3123,
    lng: 69.2345,
    rating: 3.2,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: null,
    built_year: null,
    last_renovation: 2021,
  },
  {
    id: "obj-toshvil-school-01",
    name: "Bo'stonliq tumanidagi 14-maktab",
    type: "school",
    address: "Bo'stonliq tumani, Gazalkent markazi",
    region: "Toshkent viloyati",
    district: "Bo'stonliq tumani",
    lat: 41.5604,
    lng: 69.7702,
    rating: 4,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: 980,
    built_year: 1991,
    last_renovation: 2020,
  },
  {
    id: "obj-samarqand-school-01",
    name: "Samarqand shahridagi 8-maktab",
    type: "school",
    address: "Samarqand shahri, Universitet xiyoboni 12",
    region: "Samarqand viloyati",
    district: "Samarqand shahri",
    lat: 39.6542,
    lng: 66.9597,
    rating: 4.3,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: 1500,
    built_year: 1980,
    last_renovation: 2023,
  },
  {
    id: "obj-buxoro-water-01",
    name: "Buxoro markaziy suv uzeli",
    type: "water",
    address: "Buxoro shahri, Gijduvon ko'chasi 9",
    region: "Buxoro viloyati",
    district: "Buxoro shahri",
    lat: 39.767,
    lng: 64.455,
    rating: 3.4,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: null,
    built_year: 2001,
    last_renovation: 2018,
  },
  {
    id: "obj-fergana-clinic-01",
    name: "Farg'ona shahar 2-oilaviy poliklinikasi",
    type: "clinic",
    address: "Farg'ona shahri, Mustaqillik ko'chasi 18",
    region: "Farg'ona viloyati",
    district: "Farg'ona shahri",
    lat: 40.3864,
    lng: 71.787,
    rating: 3.7,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: null,
    built_year: 1988,
    last_renovation: 2021,
  },
  {
    id: "obj-andijon-garden-01",
    name: "Asaka shahridagi 12-bog'cha",
    type: "kindergarten",
    address: "Asaka shahri, Yangiobod ko'chasi 4",
    region: "Andijon viloyati",
    district: "Asaka shahri",
    lat: 40.6415,
    lng: 72.2387,
    rating: 4.2,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: true,
    is_reconstructed: false,
    capacity: 240,
    built_year: 2022,
    last_renovation: null,
  },
  {
    id: "obj-namangan-school-01",
    name: "Namangan shahar 24-maktabi",
    type: "school",
    address: "Namangan shahri, Afrosiyob ko'chasi 21",
    region: "Namangan viloyati",
    district: "Namangan shahri",
    lat: 41.0011,
    lng: 71.6726,
    rating: 3.8,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: 1120,
    built_year: 1989,
    last_renovation: 2022,
  },
  {
    id: "obj-jizzax-road-01",
    name: "Jizzax halqa yo'lining 3-sektori",
    type: "road",
    address: "Jizzax shahri, halqa yo'l 3-km",
    region: "Jizzax viloyati",
    district: "Jizzax shahri",
    lat: 40.1158,
    lng: 67.8422,
    rating: 2.8,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: null,
    built_year: null,
    last_renovation: 2019,
  },
  {
    id: "obj-qashqadaryo-garden-01",
    name: "Qarshi shahri 17-bog'chasi",
    type: "kindergarten",
    address: "Qarshi shahri, Nasaf ko'chasi 33",
    region: "Qashqadaryo viloyati",
    district: "Qarshi shahri",
    lat: 38.8606,
    lng: 65.789,
    rating: 3.6,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: 190,
    built_year: 1996,
    last_renovation: 2017,
  },
  {
    id: "obj-surxondaryo-clinic-01",
    name: "Termiz tumani tez yordam bo'limi",
    type: "clinic",
    address: "Termiz shahri, Al-Termiziy ko'chasi 5",
    region: "Surxondaryo viloyati",
    district: "Termiz shahri",
    lat: 37.2242,
    lng: 67.2783,
    rating: 3.3,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: null,
    built_year: 1985,
    last_renovation: 2020,
  },
  {
    id: "obj-sirdaryo-road-01",
    name: "Guliston-Shirin magistral yo'li",
    type: "road",
    address: "Guliston shahri, 12-km uchastka",
    region: "Sirdaryo viloyati",
    district: "Guliston shahri",
    lat: 40.4897,
    lng: 68.7842,
    rating: 3.1,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: null,
    built_year: null,
    last_renovation: 2018,
  },
  {
    id: "obj-xorazm-water-01",
    name: "Urganch suv bosim stansiyasi",
    type: "water",
    address: "Urganch shahri, Jaloliddin Manguberdi ko'chasi 22",
    region: "Xorazm viloyati",
    district: "Urganch shahri",
    lat: 41.5534,
    lng: 60.6315,
    rating: 3.5,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: true,
    capacity: null,
    built_year: 2003,
    last_renovation: 2022,
  },
  {
    id: "obj-karakalpak-clinic-01",
    name: "Nukus shahar oilaviy poliklinikasi 4",
    type: "clinic",
    address: "Nukus shahri, Berdaq ko'chasi 17",
    region: "Qoraqolpog'iston Respublikasi",
    district: "Nukus shahri",
    lat: 42.4602,
    lng: 59.6151,
    rating: 3.4,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: null,
    built_year: 1993,
    last_renovation: 2016,
  },
  {
    id: "obj-navoiy-road-01",
    name: "Navoiy-Karmana ichki yo'li",
    type: "road",
    address: "Navoiy shahri, Karmana chiqish yo'li",
    region: "Navoiy viloyati",
    district: "Navoiy shahri",
    lat: 40.1039,
    lng: 65.3687,
    rating: 3,
    total_reviews: 0,
    total_feedbacks: 0,
    is_new: false,
    is_reconstructed: false,
    capacity: null,
    built_year: null,
    last_renovation: 2017,
  },
];

function createSeedFeedbacks(): LocalFeedbackRecord[] {
  return [
    {
      id: "fb-001",
      userId: "user-aziz-001",
      objectId: "obj-toshkent-school-01",
      issueType: "infrastructure",
      description:
        "Sport maydonchasi panjarasining bir qismi qulab tushgan, darsdan keyin o'ynayotgan bolalar uchun xavf tug'diryapti.",
      status: "completed",
      isAnonymous: false,
      authorName: "Aziz Karimov",
      authorPhone: "+998 90 123 45 67",
      adminComment: "Panjaralar to'liq almashtirildi va xavfsizlik belgilari yangilandi.",
      createdAt: relativeIso(18),
      updatedAt: relativeIso(11),
    },
    {
      id: "fb-002",
      userId: "user-malika-001",
      objectId: "obj-toshkent-water-01",
      issueType: "water_supply",
      description:
        "Suv bosimi kechqurun keskin pasayib ketadi, 5-qavatga umuman suv chiqmay qolmoqda.",
      status: "in_progress",
      isAnonymous: false,
      authorName: "Malika Rahimova",
      authorPhone: "+998 91 222 11 33",
      adminComment: "Nasos uskunasi almashtirish ishlari boshlandi.",
      createdAt: relativeIso(7, 4),
      updatedAt: relativeIso(2, 3),
    },
    {
      id: "fb-003",
      userId: "user-dilnoza-001",
      objectId: "obj-fergana-clinic-01",
      issueType: "medical_quality",
      description:
        "Laboratoriya navbati haddan tashqari uzun, natijalar 3 kun kechikib berilmoqda.",
      status: "reviewing",
      isAnonymous: false,
      authorName: "Dilnoza Yusupova",
      authorPhone: "+998 93 444 22 11",
      adminComment: "Ichki audit va navbat tizimi tekshirilmoqda.",
      createdAt: relativeIso(5, 6),
      updatedAt: relativeIso(3, 5),
    },
    {
      id: "fb-004",
      userId: "user-jasur-001",
      objectId: "obj-jizzax-road-01",
      issueType: "road_condition",
      description:
        "Halqa yo'lning 3-km qismida chuqurlar ko'payib ketgan, kechasi ko'rinmaydi va mashinalar zarar ko'rmoqda.",
      status: "submitted",
      isAnonymous: false,
      authorName: "Jasur Toshmatov",
      authorPhone: "+998 90 987 65 43",
      adminComment: null,
      createdAt: relativeIso(2, 5),
      updatedAt: relativeIso(2, 5),
    },
    {
      id: "fb-005",
      userId: "user-odina-001",
      objectId: "obj-qashqadaryo-garden-01",
      issueType: "heating",
      description:
        "Bog'cha guruhlarida qozonxona ishlamayapti, xona harorati ertalab juda past bo'ladi.",
      status: "rejected",
      isAnonymous: false,
      authorName: "Odina Rasulova",
      authorPhone: "+998 94 500 12 12",
      adminComment: "Tekshiruv vaqtida isitish tizimi me'yorda ishlayotgani qayd etildi.",
      createdAt: relativeIso(14),
      updatedAt: relativeIso(10),
    },
    {
      id: "fb-006",
      userId: "user-odina-001",
      objectId: "obj-surxondaryo-clinic-01",
      issueType: "staff_shortage",
      description:
        "Kechki smenada pediatr bo'lmaydi, ota-onalar bolani boshqa tumanga olib borishga majbur.",
      status: "rejected",
      isAnonymous: true,
      authorName: null,
      authorPhone: null,
      adminComment: "Navbatchi pediatr mavjudligi jurnal bilan tasdiqlandi.",
      createdAt: relativeIso(12),
      updatedAt: relativeIso(9),
    },
    {
      id: "fb-007",
      userId: "user-nodira-001",
      objectId: "obj-buxoro-water-01",
      issueType: "water_supply",
      description:
        "Ichimlik suvining rangi loyqalashgan va hid paydo bo'lgan, filtratsiya tekshirilishi kerak.",
      status: "completed",
      isAnonymous: false,
      authorName: "Nodira Alimova",
      authorPhone: "+998 97 111 77 55",
      adminComment: "Suv filtrlari yangilandi va laboratoriya tahlili e'lon qilindi.",
      createdAt: relativeIso(20),
      updatedAt: relativeIso(13),
    },
    {
      id: "fb-008",
      userId: "user-sardor-001",
      objectId: "obj-samarqand-school-01",
      issueType: "heating",
      description:
        "Eski korpusda radiatorlar qizimaydi, 3 ta sinf dars vaqtida juda sovuq bo'lib qolmoqda.",
      status: "in_progress",
      isAnonymous: false,
      authorName: "Sardor Toshmatov",
      authorPhone: "+998 99 700 20 20",
      adminComment: "Issiqlik quvurlarini almashtirish ishlari jadvalga kiritildi.",
      createdAt: relativeIso(6),
      updatedAt: relativeIso(1),
    },
    {
      id: "fb-009",
      userId: "user-aziz-001",
      objectId: "obj-toshkent-clinic-01",
      issueType: "medical_quality",
      description:
        "Qabul oynasida nogironligi bo'lgan fuqarolar uchun alohida navbat oynasi ishlamayapti.",
      status: "reviewing",
      isAnonymous: false,
      authorName: "Aziz Karimov",
      authorPhone: "+998 90 123 45 67",
      adminComment: "Kirish zonasi va navbat tartibi qayta ko'rib chiqilmoqda.",
      createdAt: relativeIso(4),
      updatedAt: relativeIso(2),
    },
    {
      id: "fb-010",
      userId: "user-malika-001",
      objectId: "obj-andijon-garden-01",
      issueType: "infrastructure",
      description:
        "Bolalar maydonchasidagi rezina qoplama yirtilgan, yomg'irdan keyin suv to'planadi.",
      status: "submitted",
      isAnonymous: true,
      authorName: null,
      authorPhone: null,
      adminComment: null,
      createdAt: relativeIso(1, 10),
      updatedAt: relativeIso(1, 10),
    },
    {
      id: "fb-011",
      userId: "user-dilnoza-001",
      objectId: "obj-namangan-school-01",
      issueType: "staff_shortage",
      description:
        "Ingliz tili o'qituvchisi bir oy davomida to'liq stavkada bo'lmagani uchun darslar bo'shab qolmoqda.",
      status: "completed",
      isAnonymous: false,
      authorName: "Dilnoza Yusupova",
      authorPhone: "+998 93 444 22 11",
      adminComment: "Yangi mutaxassis ishga qabul qilindi va dars jadvali tiklandi.",
      createdAt: relativeIso(25),
      updatedAt: relativeIso(16),
    },
    {
      id: "fb-012",
      userId: "user-jasur-001",
      objectId: "obj-navoiy-road-01",
      issueType: "road_condition",
      description:
        "Yo'l chetidagi yoritgichlar ishlamaydi, ayniqsa kechasi velosipedchilar uchun xavfli.",
      status: "completed",
      isAnonymous: false,
      authorName: "Jasur Toshmatov",
      authorPhone: "+998 90 987 65 43",
      adminComment: "18 ta LED yoritgich qayta ishga tushirildi.",
      createdAt: relativeIso(17),
      updatedAt: relativeIso(8),
    },
    {
      id: "fb-013",
      userId: "user-odina-001",
      objectId: "obj-karakalpak-clinic-01",
      issueType: "other",
      description:
        "Qabul oynasidagi xodimlar murojaatchilarga qo'pol munosabatda bo'lmoqda.",
      status: "rejected",
      isAnonymous: false,
      authorName: "Odina Rasulova",
      authorPhone: "+998 94 500 12 12",
      adminComment: "Kuzatuv va xizmat sifati monitoringida da'vo tasdiqlanmadi.",
      createdAt: relativeIso(9),
      updatedAt: relativeIso(5),
    },
    {
      id: "fb-014",
      userId: "user-nodira-001",
      objectId: "obj-sirdaryo-road-01",
      issueType: "road_condition",
      description:
        "Yomg'irdan keyin yo'lning chetki qismida chuqur suv qoladi, avtobus bekatiga yetish qiyin.",
      status: "in_progress",
      isAnonymous: false,
      authorName: "Nodira Alimova",
      authorPhone: "+998 97 111 77 55",
      adminComment: "Drenaj kanali qazish ishlari boshlangan.",
      createdAt: relativeIso(3, 2),
      updatedAt: relativeIso(1, 4),
    },
    {
      id: "fb-015",
      userId: "user-sardor-001",
      objectId: "obj-xorazm-water-01",
      issueType: "water_supply",
      description:
        "Stansiya yaqinidagi mahallada suv tonggi soatlarda loyqa kelmoqda.",
      status: "reviewing",
      isAnonymous: true,
      authorName: null,
      authorPhone: null,
      adminComment: "Nasos filtrlari va laboratoriya namunasi tekshiruvda.",
      createdAt: relativeIso(2, 8),
      updatedAt: relativeIso(1, 22),
    },
    {
      id: "fb-016",
      userId: "user-malika-001",
      objectId: "obj-toshvil-school-01",
      issueType: "infrastructure",
      description:
        "Sport zalining tom qismi nam tortgan, yomg'irdan keyin pol sirpanchiq bo'lib qoladi.",
      status: "completed",
      isAnonymous: false,
      authorName: "Malika Rahimova",
      authorPhone: "+998 91 222 11 33",
      adminComment: "Tom izolyatsiyasi yangilandi, pol qoplamasi almashtirildi.",
      createdAt: relativeIso(28),
      updatedAt: relativeIso(19),
    },
  ];
}

function createSeedVotes(): LocalFeedbackVoteRecord[] {
  return [
    ["fb-001", "user-malika-001"], ["fb-001", "user-dilnoza-001"], ["fb-001", "user-jasur-001"],
    ["fb-002", "user-aziz-001"], ["fb-002", "user-dilnoza-001"], ["fb-002", "user-sardor-001"], ["fb-002", "user-nodira-001"],
    ["fb-003", "user-aziz-001"], ["fb-003", "user-malika-001"],
    ["fb-004", "user-aziz-001"], ["fb-004", "user-dilnoza-001"],
    ["fb-007", "user-aziz-001"], ["fb-007", "user-malika-001"], ["fb-007", "user-dilnoza-001"], ["fb-007", "user-jasur-001"],
    ["fb-008", "user-aziz-001"], ["fb-008", "user-malika-001"], ["fb-008", "user-dilnoza-001"],
    ["fb-011", "user-aziz-001"], ["fb-011", "user-malika-001"], ["fb-011", "user-nodira-001"],
    ["fb-012", "user-aziz-001"], ["fb-012", "user-dilnoza-001"], ["fb-012", "user-malika-001"],
    ["fb-014", "user-aziz-001"], ["fb-014", "user-jasur-001"],
    ["fb-016", "user-aziz-001"], ["fb-016", "user-dilnoza-001"], ["fb-016", "user-sardor-001"],
  ].map(([feedbackId, userId], index) => ({
    id: `vote-${index + 1}`,
    feedbackId,
    userId,
    createdAt: relativeIso(10 - (index % 6), index % 5),
  }));
}

function createSeedNews(): LocalNewsRecord[] {
  return [
    {
      id: "news-001",
      title: "Chilonzordagi 56-maktab sport maydonchasi yangilandi",
      content:
        "Ta'mirlash ishlari doirasida xavfsizlik panjaralari va rezina qoplama to'liq almashtirildi. Endi darsdan keyingi mashg'ulotlar xavfsizroq bo'ladi.\n\nMahalla faollari va ota-onalar hamkorligida hudud bo'yicha qo'shimcha nazorat rejasi ishlab chiqildi.",
      summary: "Fuqarolar murojaatidan so'ng maydoncha qayta tiklandi.",
      category: "education",
      region: "Toshkent shahri",
      district: "Chilonzor tumani",
      imageUrl: null,
      videoUrl: null,
      isPublished: true,
      publishedAt: relativeIso(3),
      createdAt: relativeIso(3),
      updatedAt: relativeIso(3),
      authorId: "user-admin-001",
    },
    {
      id: "news-002",
      title: "Sergeli suv tarmog'ida bosimni oshirish ishlari boshlandi",
      content:
        "Nasos stansiyasidagi eskirgan bloklar bosqichma-bosqich almashtirilmoqda. Ishlar yakunlangach yuqori qavatlarda suv bosimi barqarorlashadi.\n\nTexnik guruh kechki yuklama eng yuqori bo'ladigan soatlarda qo'shimcha o'lchovlar o'tkazmoqda.",
      summary: "Mahalliy suv bosimi muammosi bo'yicha tezkor texnik ishlar boshlandi.",
      category: "water",
      region: "Toshkent shahri",
      district: "Sergeli tumani",
      imageUrl: null,
      videoUrl: null,
      isPublished: true,
      publishedAt: relativeIso(2),
      createdAt: relativeIso(2),
      updatedAt: relativeIso(2),
      authorId: "user-admin-001",
    },
    {
      id: "news-003",
      title: "Jizzax halqa yo'lida tungi yoritish va yamash ishlari rejalashtirildi",
      content:
        "Yo'l holati bo'yicha kelib tushgan murojaatlar asosida 3-km uchastka avariyaviy ta'mir ro'yxatiga kiritildi.\n\nTungi yoritgichlar va belgilash ishlari alohida pudratchi tomonidan bajariladi.",
      summary: "Chuqurlar va yoritgichlar bo'yicha murojaatlar tezkor reja asosida hal etiladi.",
      category: "road",
      region: "Jizzax viloyati",
      district: "Jizzax shahri",
      imageUrl: null,
      videoUrl: null,
      isPublished: true,
      publishedAt: relativeIso(4),
      createdAt: relativeIso(4),
      updatedAt: relativeIso(4),
      authorId: "user-admin-001",
    },
    {
      id: "news-004",
      title: "Namangan shahridagi 24-maktabga yangi ingliz tili o'qituvchisi biriktirildi",
      content:
        "Kadrlar bo'yicha murojaat natijasida yangi mutaxassis ish boshladi. O'tkazib yuborilgan darslar uchun tiklov jadvali e'lon qilindi.",
      summary: "Kadrlar masalasi fuqarolar fikri asosida tezlashtirildi.",
      category: "education",
      region: "Namangan viloyati",
      district: "Namangan shahri",
      imageUrl: null,
      videoUrl: null,
      isPublished: true,
      publishedAt: relativeIso(8),
      createdAt: relativeIso(8),
      updatedAt: relativeIso(8),
      authorId: "user-admin-001",
    },
    {
      id: "news-005",
      title: "Buxoro markaziy suv uzelida filtrlar yangilandi",
      content:
        "Loyqalashuv bo'yicha kelgan murojaatlar asosida suv filtrlari va nazorat modullari almashtirildi. Laboratoriya tahlili natijalari ochiq e'lon qilinadi.",
      summary: "Suv sifati bo'yicha shikoyatlar ortidan texnik yangilanish yakunlandi.",
      category: "infrastructure",
      region: "Buxoro viloyati",
      district: "Buxoro shahri",
      imageUrl: null,
      videoUrl: null,
      isPublished: true,
      publishedAt: relativeIso(10),
      createdAt: relativeIso(10),
      updatedAt: relativeIso(10),
      authorId: "user-admin-001",
    },
    {
      id: "news-006",
      title: "Termiz tez yordam bo'limi uchun qo'shimcha pediatr smenasi ochilmoqda",
      content:
        "Kechki smenadagi yuklama ortishi sababli yangi navbatchilik grafigi shakllantirildi. Mart oyidan boshlab bolalar qabuli kechki soatlarda ham davom etadi.",
      summary: "Tibbiy xizmat ko'rsatish sifati oshirilmoqda.",
      category: "health",
      region: "Surxondaryo viloyati",
      district: "Termiz shahri",
      imageUrl: null,
      videoUrl: null,
      isPublished: true,
      publishedAt: relativeIso(6),
      createdAt: relativeIso(6),
      updatedAt: relativeIso(6),
      authorId: "user-admin-001",
    },
  ];
}

const CHECKLIST_PROGRAMS: LocalChecklistProgram[] = [
  {
    id: "p1",
    name: "Toza qo'llar",
    emoji: "🧼",
    description: "Maktablarda sanitariya va tozalik tekshiruvi",
    color: "#1A56DB",
    bg: "#EFF4FF",
    borderColor: "#C7D7F8",
    institution: "Maktab",
    type: "school",
    completionBonus: 2,
  },
  {
    id: "p2",
    name: "Sog'lom poliklinika",
    emoji: "🏥",
    description: "Tibbiy muassasalarda xizmat sifati nazorati",
    color: "#DC2626",
    bg: "#FEF2F2",
    borderColor: "#FECACA",
    institution: "Poliklinika",
    type: "clinic",
    completionBonus: 2,
  },
  {
    id: "p3",
    name: "Xavfsiz yo'l",
    emoji: "🛣️",
    description: "Ko'cha va yo'llardagi muammolar monitoringi",
    color: "#D97706",
    bg: "#FFFBEB",
    borderColor: "#FDE68A",
    institution: "Yo'l",
    type: "road",
    completionBonus: 2,
  },
  {
    id: "p4",
    name: "Toza suv",
    emoji: "💧",
    description: "Ichimlik suvi sifati va ta'minoti nazorati",
    color: "#0891B2",
    bg: "#ECFEFF",
    borderColor: "#A5F3FC",
    institution: "Suv tarmog'i",
    type: "water",
    completionBonus: 2,
  },
];

const CHECKLIST_QUESTIONS: LocalChecklistQuestion[] = [
  { id: "p1-c1", programId: "p1", text: "Oshxona va bufet tozaligini tekshiring", important: true, points: 1 },
  { id: "p1-c2", programId: "p1", text: "Hojatxonalar toza va to'liq ishlayapti", important: true, points: 1 },
  { id: "p1-c3", programId: "p1", text: "Sinf xonalari artilgan va shamollatilgan", important: true, points: 1 },
  { id: "p1-c4", programId: "p1", text: "Hovli va sport maydoni tozalangan", important: false, points: 1 },
  { id: "p1-c5", programId: "p1", text: "Qo'l yuvish joylarida sovun mavjud", important: true, points: 1 },
  { id: "p1-c6", programId: "p1", text: "Chiqindi idishlari o'z vaqtida bo'shatilgan", important: false, points: 1 },
  { id: "p2-c1", programId: "p2", text: "Elektron yoki tartibli navbat tizimi ishlayapti", important: true, points: 1 },
  { id: "p2-c2", programId: "p2", text: "Qabul xonalari toza", important: true, points: 1 },
  { id: "p2-c3", programId: "p2", text: "Shifokorlar navbat vaqtida joyida", important: true, points: 1 },
  { id: "p2-c4", programId: "p2", text: "Asosiy jihozlar tayyor holatda", important: true, points: 1 },
  { id: "p2-c5", programId: "p2", text: "Kutish xonasida o'rindiqlar yetarli", important: false, points: 1 },
  { id: "p2-c6", programId: "p2", text: "Sanitariya talablari bajarilmoqda", important: true, points: 1 },
  { id: "p3-c1", programId: "p3", text: "Yo'l qoplamasida chuqurlar yo'q", important: true, points: 1 },
  { id: "p3-c2", programId: "p3", text: "Yo'l belgilari ko'rinib turadi", important: true, points: 1 },
  { id: "p3-c3", programId: "p3", text: "Piyodalar yo'lagi xavfsiz", important: true, points: 1 },
  { id: "p3-c4", programId: "p3", text: "Tungi yoritgichlar ishlaydi", important: false, points: 1 },
  { id: "p3-c5", programId: "p3", text: "Yo'l bo'yidagi chiqindilar tozalangan", important: false, points: 1 },
  { id: "p4-c1", programId: "p4", text: "Suv tiniq va hidsiz", important: true, points: 1 },
  { id: "p4-c2", programId: "p4", text: "Suv bosimi yetarli", important: true, points: 1 },
  { id: "p4-c3", programId: "p4", text: "Suv kun davomida uzilmaydi", important: true, points: 1 },
  { id: "p4-c4", programId: "p4", text: "Quvurlarda sizish ko'rinmaydi", important: false, points: 1 },
  { id: "p4-c5", programId: "p4", text: "Hisoblagich va kranlar soz", important: false, points: 1 },
];

function createSeedChecklistSubmissions(): LocalChecklistSubmission[] {
  return [
    {
      id: "sub-001",
      userId: "user-aziz-001",
      programId: "p1",
      answers: [
        { questionId: "p1-c1", answer: "yes" },
        { questionId: "p1-c2", answer: "yes" },
        { questionId: "p1-c3", answer: "yes" },
        { questionId: "p1-c4", answer: "yes" },
        { questionId: "p1-c5", answer: "yes" },
        { questionId: "p1-c6", answer: "no" },
      ],
      yesCount: 5,
      noCount: 1,
      earnedPoints: 7,
      createdAt: relativeIso(11),
    },
    {
      id: "sub-002",
      userId: "user-malika-001",
      programId: "p2",
      answers: [
        { questionId: "p2-c1", answer: "yes" },
        { questionId: "p2-c2", answer: "yes" },
        { questionId: "p2-c3", answer: "no" },
        { questionId: "p2-c4", answer: "yes" },
        { questionId: "p2-c5", answer: "yes" },
        { questionId: "p2-c6", answer: "yes" },
      ],
      yesCount: 5,
      noCount: 1,
      earnedPoints: 7,
      createdAt: relativeIso(8),
    },
    {
      id: "sub-003",
      userId: "user-jasur-001",
      programId: "p3",
      answers: [
        { questionId: "p3-c1", answer: "yes" },
        { questionId: "p3-c2", answer: "yes" },
        { questionId: "p3-c3", answer: "yes" },
        { questionId: "p3-c4", answer: "no" },
        { questionId: "p3-c5", answer: "yes" },
      ],
      yesCount: 4,
      noCount: 1,
      earnedPoints: 6,
      createdAt: relativeIso(6),
    },
  ];
}

function createSeedReviews(): LocalReviewRecord[] {
  return [
    {
      id: "review-001",
      userId: "user-sardor-001",
      objectId: "obj-toshkent-school-01",
      rating: 5,
      comment: "Ta'mirdan keyin maktab hududi ancha xavfsiz va tartibli bo'ldi.",
      createdAt: relativeIso(7),
    },
    {
      id: "review-002",
      userId: "user-nodira-001",
      objectId: "obj-buxoro-water-01",
      rating: 4,
      comment: "Filtrlar yangilangandan keyin suv sifati sezilarli yaxshilandi.",
      createdAt: relativeIso(6),
    },
    {
      id: "review-003",
      userId: "user-aziz-001",
      objectId: "obj-toshvil-school-01",
      rating: 4,
      comment: "Sport zalidagi muammo tez hal bo'ldi, ammo shamollatish hali sust.",
      createdAt: relativeIso(5),
    },
  ];
}

function createSeedNotifications(): LocalNotificationRecord[] {
  return [
    {
      id: "notif-001",
      userId: "user-malika-001",
      type: "feedback_status",
      title: "Murojaatingiz jarayonga olindi",
      message: "Sergeli suv tarmog'i bo'yicha murojaatingiz texnik guruhga yuborildi.",
      link: "/my-feedbacks",
      read: false,
      createdAt: relativeIso(2),
    },
    {
      id: "notif-002",
      userId: "user-aziz-001",
      type: "news",
      title: "Yangi yangilik e'lon qilindi",
      message: "Chilonzordagi maktab maydonchasi bo'yicha yangilanish e'lon qilindi.",
      link: "/news/news-001",
      read: false,
      createdAt: relativeIso(3),
    },
  ];
}

function createSeedState(): LocalBackendState {
  return {
    version: STATE_VERSION,
    users: DEMO_USERS.map((user) => ({ ...user, createdAt: relativeIso(45) })),
    objects: clone(SEED_OBJECTS),
    feedbacks: createSeedFeedbacks(),
    feedbackVotes: createSeedVotes(),
    feedbackStatusHistory: createSeedFeedbacks().map((feedback, index) => ({
      id: `history-${index + 1}`,
      feedbackId: feedback.id,
      status: feedback.status,
      comment: feedback.adminComment,
      changedBy: feedback.status === "submitted" ? feedback.userId : "user-admin-001",
      createdAt: feedback.updatedAt,
    })),
    news: createSeedNews(),
    checklistPrograms: clone(CHECKLIST_PROGRAMS),
    checklistQuestions: clone(CHECKLIST_QUESTIONS),
    checklistSubmissions: createSeedChecklistSubmissions(),
    notifications: createSeedNotifications(),
    reviews: createSeedReviews(),
  };
}

function loadState(): LocalBackendState {
  if (!isBrowser()) {
    return createSeedState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedState();
    saveState(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as LocalBackendState;
    if (!parsed.version || parsed.version !== STATE_VERSION) {
      const seed = createSeedState();
      saveState(seed);
      return seed;
    }
    return parsed;
  } catch {
    const seed = createSeedState();
    saveState(seed);
    return seed;
  }
}

function saveState(state: LocalBackendState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emitBackendChange();
}

function getSessionUserId() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(SESSION_KEY);
}

function setSessionUserId(userId: string | null) {
  if (!isBrowser()) return;
  if (userId) {
    window.localStorage.setItem(SESSION_KEY, userId);
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  emitSessionChange();
}

function setLastGuestUserId(userId: string | null) {
  if (!isBrowser()) return;
  if (userId) {
    window.localStorage.setItem(LAST_GUEST_KEY, userId);
  } else {
    window.localStorage.removeItem(LAST_GUEST_KEY);
  }
}

function getLastGuestUserId() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(LAST_GUEST_KEY);
}

function getUserRecordById(state: LocalBackendState, userId: string) {
  return state.users.find((user) => user.id === userId) ?? null;
}

function createGuestUser(state: LocalBackendState) {
  const firstName = pickRandom(GUEST_FIRST_NAMES);
  const lastName = pickRandom(GUEST_LAST_NAMES);
  const slug = Math.random().toString(36).slice(2, 8);
  const user: LocalUserRecord = {
    id: createId("guest"),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${slug}@hudud.live`,
    password: "demo-guest",
    fullName: `${firstName} ${lastName}`,
    phone: `+998 ${Math.floor(90 + Math.random() * 9)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
    role: "user",
    createdAt: nowIso(),
  };

  state.users.unshift(user);
  addNotification(state, {
    userId: user.id,
    type: "news",
    title: "Demo profil tayyor",
    message: "Sizga avtomatik demo fuqaro profili yaratildi. Endi darhol test qilishingiz mumkin.",
    link: "/profile",
  });
  saveState(state);
  setLastGuestUserId(user.id);
  setSessionUserId(user.id);
  return user;
}

function ensureGuestSession(forceNew = false) {
  const state = ensureInitialized();
  const lastGuestId = forceNew ? null : getLastGuestUserId();
  const existingGuest = lastGuestId ? getUserRecordById(state, lastGuestId) : null;

  if (existingGuest && existingGuest.role === "user") {
    setSessionUserId(existingGuest.id);
    setLastGuestUserId(existingGuest.id);
    return existingGuest;
  }

  return createGuestUser(state);
}

function votesForFeedback(state: LocalBackendState, feedbackId: string) {
  return state.feedbackVotes.filter((vote) => vote.feedbackId === feedbackId).length;
}

function getUserChecklistPoints(state: LocalBackendState, userId: string) {
  return state.checklistSubmissions
    .filter((submission) => submission.userId === userId)
    .reduce((total, submission) => total + submission.earnedPoints, 0);
}

function getUserFeedbackStats(state: LocalBackendState, userId: string) {
  const feedbacks = state.feedbacks.filter((feedback) => feedback.userId === userId);
  const feedbackIds = new Set(feedbacks.map((feedback) => feedback.id));
  return {
    feedbacks: feedbacks.length,
    completed: feedbacks.filter((feedback) => feedback.status === "completed").length,
    rejected: feedbacks.filter((feedback) => feedback.status === "rejected").length,
    pending: feedbacks.filter((feedback) => ["submitted", "reviewing", "in_progress"].includes(feedback.status)).length,
    votes: state.feedbackVotes.filter((vote) => feedbackIds.has(vote.feedbackId)).length,
  };
}

function getUserReputationPoints(state: LocalBackendState, userId: string) {
  const stats = getUserFeedbackStats(state, userId);
  const statusPoints =
    stats.feedbacks * 2 + stats.completed * 10 - stats.rejected * 10 + stats.votes;
  return statusPoints + getUserChecklistPoints(state, userId);
}

function toAuthUser(state: LocalBackendState, user: LocalUserRecord): AuthUser {
  const reputationPoints = getUserReputationPoints(state, user.id);
  const rating = getRatingTitle(reputationPoints);
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone,
    role: user.role,
    reputationPoints,
    titleLabel: rating.label,
    titleEmoji: rating.emoji,
    titleColor: rating.color,
    isGuest: user.email.endsWith("@hudud.live") && user.password === "demo-guest",
  };
}

function toPublicUserProfile(state: LocalBackendState, userId: string): PublicUserProfile {
  const user = getUserRecordById(state, userId);
  if (!user) {
    const rating = getRatingTitle(-50);
    return {
      id: userId,
      name: "Noma'lum foydalanuvchi",
      email: "unknown@local",
      titleLabel: rating.label,
      titleEmoji: rating.emoji,
      titleColor: rating.color,
      reputationPoints: -50,
      role: "user",
    };
  }

  const authUser = toAuthUser(state, user);
  return {
    id: authUser.id,
    name: authUser.full_name,
    email: authUser.email,
    titleLabel: authUser.titleLabel,
    titleEmoji: authUser.titleEmoji,
    titleColor: authUser.titleColor,
    reputationPoints: authUser.reputationPoints,
    role: authUser.role,
  };
}

function enrichObject(state: LocalBackendState, object: InfrastructureObject): InfrastructureObject {
  const reviews = state.reviews.filter((review) => review.objectId === object.id);
  const feedbacks = state.feedbacks.filter((feedback) => feedback.objectId === object.id);
  const rating = reviews.length > 0
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : object.rating;

  return {
    ...object,
    rating,
    total_reviews: reviews.length,
    total_feedbacks: feedbacks.length,
  };
}

function enrichFeedback(
  state: LocalBackendState,
  feedback: LocalFeedbackRecord,
  currentUserId?: string | null,
): FeedbackView {
  const object = state.objects.find((item) => item.id === feedback.objectId) ?? state.objects[0];
  const submitter = toPublicUserProfile(state, feedback.userId);
  return {
    id: feedback.id,
    issue_type: feedback.issueType,
    description: feedback.description,
    status: feedback.status,
    votes: votesForFeedback(state, feedback.id),
    is_anonymous: feedback.isAnonymous,
    author_name: feedback.authorName,
    created_at: feedback.createdAt,
    updated_at: feedback.updatedAt,
    admin_comment: feedback.adminComment,
    object_id: feedback.objectId,
    object_name: object.name,
    object_type: object.type,
    object_region: object.region,
    object_district: object.district,
    user_id: feedback.userId,
    submitter,
    display_name: feedback.isAnonymous ? "Anonim" : submitter.name,
    has_voted: currentUserId
      ? state.feedbackVotes.some(
          (vote) => vote.feedbackId === feedback.id && vote.userId === currentUserId,
        )
      : false,
    validation: feedback.validation ?? null,
  };
}

function addNotification(
  state: LocalBackendState,
  notification: Omit<LocalNotificationRecord, "id" | "createdAt" | "read">,
) {
  state.notifications.unshift({
    ...notification,
    id: createId("notif"),
    createdAt: nowIso(),
    read: false,
  });
}

function ensureInitialized() {
  return loadState();
}

export function subscribeToLocalBackend(listener: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === SESSION_KEY) {
      listener();
    }
  };

  window.addEventListener(BACKEND_EVENT, listener);
  window.addEventListener(SESSION_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(BACKEND_EVENT, listener);
    window.removeEventListener(SESSION_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function resetLocalBackend() {
  const seed = createSeedState();
  saveState(seed);
  setSessionUserId(null);
  setLastGuestUserId(null);
}

export function getCurrentAuthUser(): AuthUser | null {
  const state = ensureInitialized();
  let userId = getSessionUserId();
  if (!userId) {
    userId = ensureGuestSession().id;
  }
  const user = getUserRecordById(state, userId);
  if (!user) {
    const guest = ensureGuestSession(true);
    return toAuthUser(ensureInitialized(), guest);
  }
  return toAuthUser(state, user);
}

export function getAuthSnapshot() {
  return asyncResolve(getCurrentAuthUser());
}

export async function signInLocal(email: string, password: string) {
  const state = ensureInitialized();
  const user = state.users.find(
    (entry) => entry.email.toLowerCase() === email.trim().toLowerCase() && entry.password === password,
  );

  if (!user) {
    return { error: new Error("Email yoki parol noto'g'ri") };
  }

  setSessionUserId(user.id);
  return { error: null, user: toAuthUser(state, user) };
}

export async function signUpLocal(email: string, password: string, fullName: string) {
  const state = ensureInitialized();
  const normalizedEmail = email.trim().toLowerCase();

  if (state.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { error: new Error("Bu email allaqachon mavjud") };
  }

  const user: LocalUserRecord = {
    id: createId("user"),
    email: normalizedEmail,
    password,
    fullName: fullName.trim(),
    phone: "+998 90 000 00 00",
    role: "user",
    createdAt: nowIso(),
  };

  state.users.unshift(user);
  saveState(state);
  setSessionUserId(user.id);

  addNotification(state, {
    userId: user.id,
    type: "news",
    title: "Xush kelibsiz!",
    message: "Profilingiz yaratildi. Endi murojaat yuborish va ovoz berish mumkin.",
    link: "/profile",
  });
  saveState(state);

  return { error: null, user: toAuthUser(state, user) };
}

export async function signOutLocal() {
  const guest = ensureGuestSession(true);
  return { error: null, user: toAuthUser(ensureInitialized(), guest) };
}

export async function activateAdminDemoLocal() {
  const state = ensureInitialized();
  const currentUserId = getSessionUserId();
  const currentUser = currentUserId ? getUserRecordById(state, currentUserId) : null;
  if (currentUser?.role === "user") {
    setLastGuestUserId(currentUser.id);
  }
  const admin = getUserRecordById(state, "user-admin-001");
  if (!admin) {
    throw new Error("Admin demo hisobi topilmadi");
  }
  setSessionUserId(admin.id);
  return toAuthUser(state, admin);
}

export async function activateGuestDemoLocal(options?: { forceNew?: boolean }) {
  const guest = ensureGuestSession(options?.forceNew ?? false);
  return toAuthUser(ensureInitialized(), guest);
}

export async function listLocalUsers() {
  const state = ensureInitialized();
  return state.users.map((user) => toPublicUserProfile(state, user.id));
}

export async function listLocalObjects() {
  const state = ensureInitialized();
  return state.objects.map((object) => enrichObject(state, object));
}

export async function getLocalObjectById(objectId: string) {
  const state = ensureInitialized();
  const object = state.objects.find((entry) => entry.id === objectId);
  return object ? enrichObject(state, object) : null;
}

export async function listFeedbackViews(filters?: {
  status?: FeedbackStatus | "all";
  userId?: string;
  search?: string;
  currentUserId?: string | null;
  objectId?: string;
}) {
  const state = ensureInitialized();
  let feedbacks = state.feedbacks.slice();

  if (filters?.status && filters.status !== "all") {
    feedbacks = feedbacks.filter((feedback) => feedback.status === filters.status);
  }
  if (filters?.userId) {
    feedbacks = feedbacks.filter((feedback) => feedback.userId === filters.userId);
  }
  if (filters?.objectId) {
    feedbacks = feedbacks.filter((feedback) => feedback.objectId === filters.objectId);
  }

  let views = feedbacks
    .map((feedback) => enrichFeedback(state, feedback, filters?.currentUserId))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  if (filters?.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    views = views.filter(
      (feedback) =>
        feedback.description.toLowerCase().includes(query) ||
        feedback.object_name.toLowerCase().includes(query) ||
        feedback.display_name.toLowerCase().includes(query),
    );
  }

  return views;
}

export async function getFeedbackDetail(feedbackId: string) {
  const state = ensureInitialized();
  const feedback = state.feedbacks.find((entry) => entry.id === feedbackId);
  return feedback ? enrichFeedback(state, feedback) : null;
}

export async function submitFeedbackLocal(input: {
  userId: string;
  objectId: string;
  issueType: IssueType;
  description: string;
  isAnonymous: boolean;
  authorName?: string | null;
  authorPhone?: string | null;
  photosCount?: number;
}) {
  const state = ensureInitialized();
  const user = getUserRecordById(state, input.userId);
  const object = state.objects.find((entry) => entry.id === input.objectId);
  if (!user || !object) {
    throw new Error("Murojaat uchun foydalanuvchi yoki ob'ekt topilmadi");
  }

  const validation = await validateSubmittedReport({
    objectName: object.name,
    objectType: object.type,
    issueType: input.issueType,
    description: input.description.trim(),
    address: object.address,
    district: object.district,
    region: object.region,
    photosCount: input.photosCount,
  });
  const initialStatus: FeedbackStatus =
    validation.validity === "likely_invalid" ? "reviewing" : "submitted";

  const feedback: LocalFeedbackRecord = {
    id: createId("fb"),
    userId: input.userId,
    objectId: input.objectId,
    issueType: input.issueType,
    description: input.description.trim(),
    status: initialStatus,
    isAnonymous: input.isAnonymous,
    authorName: input.isAnonymous ? null : input.authorName ?? user.fullName,
    authorPhone: input.isAnonymous ? null : input.authorPhone ?? user.phone,
    adminComment: null,
    validation,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  state.feedbacks.unshift(feedback);
  state.feedbackStatusHistory.unshift({
    id: createId("fsh"),
    feedbackId: feedback.id,
    status: initialStatus,
    comment:
      validation.validity === "likely_invalid"
        ? "AI tekshiruv shubhali deb topdi, qo'lda ko'rib chiqishga yuborildi"
        : "Murojaat qabul qilindi",
    changedBy: input.userId,
    createdAt: nowIso(),
  });

  addNotification(state, {
    userId: input.userId,
    type: "feedback_status",
    title:
      validation.validity === "likely_invalid"
        ? "Murojaat tekshiruvga yuborildi"
        : "Murojaat qabul qilindi",
    message:
      validation.validity === "likely_invalid"
        ? `${object.name} bo'yicha murojaatingiz AI tekshiruvdan o'tib, qo'lda ko'rib chiqishga yuborildi.`
        : `${object.name} bo'yicha murojaatingiz navbatga olindi.`,
    link: "/my-feedbacks",
  });

  saveState(state);
  return enrichFeedback(state, feedback, input.userId);
}

export async function voteForFeedback(feedbackId: string, userId: string) {
  const state = ensureInitialized();
  if (state.feedbackVotes.some((vote) => vote.feedbackId === feedbackId && vote.userId === userId)) {
    throw new Error("Siz bu murojaatga allaqachon ovoz bergansiz");
  }

  const feedback = state.feedbacks.find((entry) => entry.id === feedbackId);
  if (!feedback) {
    throw new Error("Murojaat topilmadi");
  }

  state.feedbackVotes.unshift({
    id: createId("vote"),
    feedbackId,
    userId,
    createdAt: nowIso(),
  });

  if (feedback.userId !== userId) {
    addNotification(state, {
      userId: feedback.userId,
      type: "feedback_response",
      title: "Murojaatingiz qo'llab-quvvatlandi",
      message: "Murojaatingiz uchun yangi ovoz berildi.",
      link: "/my-feedbacks",
    });
  }

  saveState(state);
  return enrichFeedback(state, feedback);
}

export async function hasUserVotedForFeedback(feedbackId: string, userId: string) {
  const state = ensureInitialized();
  return state.feedbackVotes.some((vote) => vote.feedbackId === feedbackId && vote.userId === userId);
}

export async function updateFeedbackStatusLocal(input: {
  feedbackId: string;
  status: FeedbackStatus;
  adminComment: string;
  changedBy: string;
}) {
  const state = ensureInitialized();
  const feedback = state.feedbacks.find((entry) => entry.id === input.feedbackId);
  if (!feedback) {
    throw new Error("Murojaat topilmadi");
  }

  feedback.status = input.status;
  feedback.adminComment = input.adminComment.trim() || null;
  feedback.updatedAt = nowIso();
  state.feedbackStatusHistory.unshift({
    id: createId("fsh"),
    feedbackId: feedback.id,
    status: input.status,
    comment: feedback.adminComment,
    changedBy: input.changedBy,
    createdAt: nowIso(),
  });

  const object = state.objects.find((entry) => entry.id === feedback.objectId);
  const objectName = object?.name ?? "Muassasa";
  addNotification(state, {
    userId: feedback.userId,
    type: "feedback_status",
    title:
      input.status === "completed"
        ? "Murojaat hal qilindi"
        : input.status === "rejected"
        ? "Murojaat rad etildi"
        : input.status === "in_progress"
        ? "Murojaat jarayonga olindi"
        : "Murojaat holati yangilandi",
    message: `${objectName} bo'yicha holat: ${input.status}.`,
    link: "/my-feedbacks",
  });

  if (feedback.adminComment) {
    addNotification(state, {
      userId: feedback.userId,
      type: "feedback_response",
      title: "Admin izoh qoldirdi",
      message: feedback.adminComment,
      link: "/my-feedbacks",
    });
  }

  saveState(state);
  return enrichFeedback(state, feedback);
}

export async function listFeedbackHistory(feedbackId: string) {
  const state = ensureInitialized();
  return state.feedbackStatusHistory
    .filter((entry) => entry.feedbackId === feedbackId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function listLocalNews(filters?: {
  publishedOnly?: boolean;
  region?: string;
  category?: string;
  search?: string;
}) {
  const state = ensureInitialized();
  let news = state.news.slice().sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

  if (filters?.publishedOnly) {
    news = news.filter((item) => item.isPublished);
  }
  if (filters?.region && filters.region !== "Barcha viloyatlar") {
    news = news.filter((item) => item.region === filters.region);
  }
  if (filters?.category && filters.category !== "all") {
    news = news.filter((item) => item.category === filters.category);
  }
  if (filters?.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    news = news.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        (item.summary ?? "").toLowerCase().includes(query),
    );
  }

  return news;
}

export async function getLocalNewsById(newsId: string) {
  const state = ensureInitialized();
  return state.news.find((item) => item.id === newsId) ?? null;
}

export async function saveLocalNews(input: {
  id?: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  region: string;
  district?: string;
  imageUrl?: string;
  videoUrl?: string;
  isPublished: boolean;
  authorId: string;
}) {
  const state = ensureInitialized();
  const now = nowIso();
  const existing = input.id ? state.news.find((item) => item.id === input.id) : null;

  if (existing) {
    existing.title = input.title.trim();
    existing.content = input.content.trim();
    existing.summary = input.summary.trim() || null;
    existing.category = input.category;
    existing.region = input.region || null;
    existing.district = input.district?.trim() || null;
    existing.imageUrl = input.imageUrl?.trim() || null;
    existing.videoUrl = input.videoUrl?.trim() || null;
    existing.isPublished = input.isPublished;
    existing.updatedAt = now;
    if (input.isPublished && !existing.publishedAt) {
      existing.publishedAt = now;
    }
    saveState(state);
    return existing;
  }

  const article: LocalNewsRecord = {
    id: createId("news"),
    title: input.title.trim(),
    content: input.content.trim(),
    summary: input.summary.trim() || null,
    category: input.category,
    region: input.region || null,
    district: input.district?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    videoUrl: input.videoUrl?.trim() || null,
    isPublished: input.isPublished,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    authorId: input.authorId,
  };

  state.news.unshift(article);
  if (article.isPublished) {
    state.users
      .filter((user) => user.role === "user")
      .forEach((user) => {
        addNotification(state, {
          userId: user.id,
          type: "news",
          title: "Yangi yangilik e'lon qilindi",
          message: article.title,
          link: `/news/${article.id}`,
        });
      });
  }

  saveState(state);
  return article;
}

export async function deleteLocalNews(newsId: string) {
  const state = ensureInitialized();
  state.news = state.news.filter((item) => item.id !== newsId);
  saveState(state);
}

export async function listChecklistPrograms(userId?: string | null) {
  const state = ensureInitialized();
  return state.checklistPrograms.map((program) => {
    const questions = state.checklistQuestions.filter((question) => question.programId === program.id);
    const submissions = userId
      ? state.checklistSubmissions.filter((submission) => submission.programId === program.id && submission.userId === userId)
      : [];
    return {
      ...program,
      totalCount: questions.length,
      totalPossiblePoints:
        questions.reduce((total, question) => total + question.points, 0) + program.completionBonus,
      submissionsCount: submissions.length,
      lastEarnedPoints: submissions[0]?.earnedPoints ?? null,
    } satisfies ChecklistProgramView;
  });
}

export async function listChecklistQuestions(programId: string) {
  const state = ensureInitialized();
  return state.checklistQuestions.filter((question) => question.programId === programId);
}

export async function submitChecklistLocal(input: {
  userId: string;
  programId: string;
  answers: Array<{ questionId: string; answer: ChecklistAnswer }>;
}) {
  const state = ensureInitialized();
  const program = state.checklistPrograms.find((entry) => entry.id === input.programId);
  if (!program) {
    throw new Error("Dastur topilmadi");
  }

  const questions = state.checklistQuestions.filter((question) => question.programId === input.programId);
  const yesCount = input.answers.filter((entry) => entry.answer === "yes").length;
  const noCount = input.answers.filter((entry) => entry.answer === "no").length;
  const points = input.answers.reduce((total, entry) => {
    const question = questions.find((item) => item.id === entry.questionId);
    if (!question) return total;
    return total + (entry.answer === "yes" ? question.points : 0);
  }, 0) + program.completionBonus;

  const submission: LocalChecklistSubmission = {
    id: createId("check"),
    userId: input.userId,
    programId: input.programId,
    answers: input.answers,
    yesCount,
    noCount,
    earnedPoints: points,
    createdAt: nowIso(),
  };

  state.checklistSubmissions.unshift(submission);
  addNotification(state, {
    userId: input.userId,
    type: "feedback_status",
    title: "Tekshiruv yakunlandi",
    message: `${program.name} bo'yicha ${points} ball hisoblandi.`,
    link: "/checklist",
  });
  saveState(state);

  return submission;
}

export async function getChecklistUserSummary(userId: string) {
  const state = ensureInitialized();
  const submissions = state.checklistSubmissions.filter((submission) => submission.userId === userId);
  return {
    totalSubmissions: submissions.length,
    totalPoints: submissions.reduce((total, submission) => total + submission.earnedPoints, 0),
    submissions,
  };
}

export async function getLocalLeaderboard() {
  const state = ensureInitialized();
  const entries: LeaderboardEntry[] = state.users
    .filter((user) => user.role === "user")
    .map((user) => {
      const stats = getUserFeedbackStats(state, user.id);
      const reputationPoints = getUserReputationPoints(state, user.id);
      const title = getRatingTitle(reputationPoints);
      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        feedbacks: stats.feedbacks,
        votes: stats.votes,
        completed: stats.completed,
        rejected: stats.rejected,
        checklistPoints: getUserChecklistPoints(state, user.id),
        reputationPoints,
        titleLabel: title.label,
        titleEmoji: title.emoji,
        titleColor: title.color,
        role: user.role,
      };
    })
    .sort((left, right) => {
      if (right.reputationPoints !== left.reputationPoints) {
        return right.reputationPoints - left.reputationPoints;
      }
      return right.votes - left.votes;
    });

  return entries;
}

export async function getCurrentUserRank(userId: string) {
  const entries = await getLocalLeaderboard();
  const index = entries.findIndex((entry) => entry.id === userId);
  return index >= 0 ? index + 1 : null;
}

export async function getLocalProfile(userId: string) {
  const state = ensureInitialized();
  const user = getUserRecordById(state, userId);
  if (!user) return null;

  const authUser = toAuthUser(state, user);
  const feedbacks = state.feedbacks.filter((feedback) => feedback.userId === userId).map((feedback) => enrichFeedback(state, feedback, userId));
  const checklistSummary = await getChecklistUserSummary(userId);
  const rank = await getCurrentUserRank(userId);

  return {
    user: authUser,
    rank,
    stats: {
      total: feedbacks.length,
      completed: feedbacks.filter((feedback) => feedback.status === "completed").length,
      pending: feedbacks.filter((feedback) => ["submitted", "reviewing", "in_progress"].includes(feedback.status)).length,
      rejected: feedbacks.filter((feedback) => feedback.status === "rejected").length,
      totalVotes: feedbacks.reduce((sum, feedback) => sum + feedback.votes, 0),
      checklistPoints: checklistSummary.totalPoints,
    },
    feedbacks: feedbacks.sort((left, right) => right.created_at.localeCompare(left.created_at)),
    checklistSummary,
  };
}

export async function getIndexSnapshot(currentUserId?: string | null) {
  const state = ensureInitialized();
  const objects = state.objects.map((object) => enrichObject(state, object));
  const feedbacks = state.feedbacks.map((feedback) => enrichFeedback(state, feedback, currentUserId));
  const userFeedbacks = currentUserId
    ? feedbacks.filter((feedback) => feedback.user_id === currentUserId).slice(0, 3)
    : [];

  return {
    totalObjects: objects.length,
    typeCounts: objects.reduce<Record<ObjectType, number>>(
      (counts, object) => {
        counts[object.type] += 1;
        return counts;
      },
      { school: 0, kindergarten: 0, clinic: 0, water: 0, road: 0 },
    ),
    recentFeedbacks: feedbacks.slice(0, 6),
    userFeedbacks,
  };
}

export async function listNotifications(userId: string) {
  const state = ensureInitialized();
  return state.notifications
    .filter((notification) => notification.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function markNotificationRead(notificationId: string) {
  const state = ensureInitialized();
  const notification = state.notifications.find((entry) => entry.id === notificationId);
  if (notification) {
    notification.read = true;
    saveState(state);
  }
}

export async function markAllNotificationsRead(userId: string) {
  const state = ensureInitialized();
  state.notifications.forEach((notification) => {
    if (notification.userId === userId) {
      notification.read = true;
    }
  });
  saveState(state);
}

export async function getAdminDashboardSnapshot() {
  const state = ensureInitialized();
  const feedbacks = state.feedbacks.map((feedback) => enrichFeedback(state, feedback));
  return {
    totalFeedbacks: feedbacks.length,
    completedFeedbacks: feedbacks.filter((feedback) => feedback.status === "completed").length,
    pendingFeedbacks: feedbacks.filter((feedback) => ["submitted", "reviewing", "in_progress"].includes(feedback.status)).length,
    rejectedFeedbacks: feedbacks.filter((feedback) => feedback.status === "rejected").length,
    totalUsers: state.users.filter((user) => user.role === "user").length,
    totalObjects: state.objects.length,
    recentFeedbacks: feedbacks.slice(0, 5),
  };
}

export async function createLocalReview(input: {
  userId: string;
  objectId: string;
  rating: number;
  comment?: string;
}) {
  const state = ensureInitialized();
  state.reviews.unshift({
    id: createId("review"),
    userId: input.userId,
    objectId: input.objectId,
    rating: input.rating,
    comment: input.comment?.trim() || null,
    createdAt: nowIso(),
  });
  saveState(state);
}

export async function listObjectReviews(objectId: string) {
  const state = ensureInitialized();
  return state.reviews
    .filter((review) => review.objectId === objectId)
    .map((review) => ({
      ...review,
      authorName: toPublicUserProfile(state, review.userId).name,
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getDemoCredentials() {
  return {
    admin: { email: "admin@hududinfo.local", password: "admin123" },
    user: { email: "aziz@hududinfo.local", password: "demo123" },
  };
}
