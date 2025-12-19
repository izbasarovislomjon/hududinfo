export type ObjectType = 'school' | 'kindergarten' | 'clinic' | 'water' | 'road';
export type IssueType = 'water_supply' | 'road_condition' | 'heating' | 'medical_quality' | 'staff_shortage' | 'infrastructure' | 'other';
export type FeedbackStatus = 'submitted' | 'reviewing' | 'in_progress' | 'completed' | 'rejected';

export interface InfrastructureObject {
  id: string;
  name: string;
  type: ObjectType;
  address: string;
  region: string;
  district: string;
  lat: number;
  lng: number;
  rating: number;
  total_reviews: number;
  total_feedbacks: number;
  is_new: boolean;
  is_reconstructed: boolean;
  capacity?: number;
  built_year?: number;
  last_renovation?: number;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  object_id: string;
  issue_type: IssueType;
  description: string;
  status: FeedbackStatus;
  is_anonymous: boolean;
  author_name?: string;
  author_phone?: string;
  votes: number;
  admin_comment?: string;
  created_at: string;
  updated_at: string;
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
