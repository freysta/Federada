export interface IUser {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STORE_ADMIN' | 'SPORTS_ADMIN';
  userType?: 'ATHLETE' | 'PRESIDENT';
  period?: 'MORNING' | 'NIGHT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITeam {
  id: string;
  name: string;
  logoUrl?: string;
  modality: 'FUTSAL' | 'VOLEI' | 'BASQUETE' | 'HANDEBOL';
  category: 'MALE' | 'FEMALE';
  status: 'ACTIVE' | 'INACTIVE';
  president: IUser;
  owner?: IUser;
  inviteCode?: string;
  createdAt: string;
}

export interface IAthleteProfile {
  id: string;
  user: IUser;
  team?: ITeam;
  nickname?: string;
  number?: string;
  position?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  documentRg?: string;
  documentRgUrl?: string;
  documentRgStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  documentRgRejectionReason?: string;
  documentEnrollment?: string;
  documentEnrollmentUrl?: string;
  documentEnrollmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  documentEnrollmentRejectionReason?: string;
  teamRole?: 'PRESIDENT' | 'CAPTAIN' | 'PLAYER';
  cpf?: string;
  gender?: string;
  teamJoinStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface IChampionship {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  rulesUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'OPEN' | 'CLOSED' | 'GENERATING_BRACKET' | 'ONGOING' | 'FINISHED' | 'ARCHIVED';
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  enrollmentDeadline?: string;
  organizer?: string;
  audienceFocus?: 'GENERAL' | 'UNIVERSITY' | 'SCHOOL' | 'CITY';
  settings?: any;
  modalities?: IModality[];
}

export interface IModality {
  id: string;
  championship: IChampionship;
  name: string;
  type: 'TEAM' | 'INDIVIDUAL';
  price: number;
  maxParticipants?: number;
}

export interface ISubscription {
  id: string;
  championship: IChampionship;
  modality: IModality;
  team?: ITeam;
  athlete?: IAthleteProfile;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
}

export interface IMatch {
  id: string;
  championship: IChampionship;
  modality: IModality;
  teamA?: ITeam;
  teamB?: ITeam;
  athleteA?: IAthleteProfile;
  athleteB?: IAthleteProfile;
  scoreA?: number;
  scoreB?: number;
  status: 'SCHEDULED' | 'FINISHED' | 'CANCELED' | 'ONGOING' | 'IN_PROGRESS';
  date?: string;
  location?: string;
  round: number;
  bracketPosition?: number;
}

export interface IProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  sizes: string[];
  isCustomizable: boolean;
  isActive: boolean;
}

export interface IOrder {
  id: string;
  user: IUser;
  amount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentId?: string;
  items: IOrderItem[];
  createdAt: string;
}

export interface IOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSize?: string;
  quantity: number;
  price: number;
  customName?: string;
  customNumber?: string;
  playerType?: string;
}

export interface INews {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  dateLabel?: string;
  createdAt: string;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
}
