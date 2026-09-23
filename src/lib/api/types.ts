export type Role = 'USER' | 'ADMIN';
export type OAuthProvider = 'google' | 'kakao';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type SortDirection = 'ASCENDING' | 'DESCENDING';
export type ClothesType =
  | '상의'
  | '바지'
  | '치마'
  | '아우터'
  | '원피스'
  | '신발'
  | '모자'
  | '가방'
  | '악세서리';
export type ClothesCategory =
  | 'TOP'
  | 'PANTS'
  | 'SKIRT'
  | 'OUTER'
  | 'DRESS'
  | 'SHOES'
  | 'HAT'
  | 'BAG'
  | 'ACCESSORY';
export type SkyStatus = 'CLEAR' | 'MOSTLY_CLOUDY' | 'CLOUDY';
export type PrecipitationType = 'NONE' | 'RAIN' | 'RAIN_SNOW' | 'SNOW' | 'SHOWER';
export type WindStrength = 'WEAK' | 'MODERATE' | 'STRONG';
export type NotificationLevel = 'INFO' | 'WARNING' | 'ERROR';

export interface ErrorResponse {
  exceptionName: string;
  message: string;
  details?: Record<string, string>;
}

export interface UserDto {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  role: Role;
  linkedOAuthProviders: OAuthProvider[];
  locked: boolean;
}

export interface UserSummary {
  userId: string;
  name: string;
  profileImageUrl?: string;
}

export interface AuthorDto {
  userId: string;
  name: string;
  profileImageUrl?: string;
}

export interface ProfileDto {
  userId: string;
  name: string;
  gender?: Gender;
  birthDate?: string;
  locationNames: string[];
  temperatureSensitivity?: number;
  profileImageUrl?: string;
}

export interface WeatherAPILocation {
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  locationNames: string[];
}

export interface TemperatureDto {
  current: number;
  comparedToDayBefore: number;
  min: number;
  max: number;
}

export interface HumidityDto {
  current: number;
  comparedToDayBefore: number;
}

export interface PrecipitationDto {
  type: PrecipitationType;
  amount: number;
  probability: number;
}

export interface WindSpeedDto {
  speed: number;
  asWord: WindStrength;
}

export interface WeatherDto {
  id: string;
  forecastedAt: string;
  forecastAt: string;
  location: WeatherAPILocation;
  skyStatus: SkyStatus;
  precipitation: PrecipitationDto;
  humidity: HumidityDto;
  temperature: TemperatureDto;
  windSpeed: WindSpeedDto;
}

export interface WeatherSummaryDto {
  weatherId: string;
  skyStatus: SkyStatus;
  precipitation: PrecipitationDto;
  temperature: TemperatureDto;
}

export type OutfitWeatherDto = Omit<WeatherSummaryDto, 'weatherId'>;

export interface OutfitClothesDto {
  id: string;
  name?: string;
  imageUrl?: string;
}

export interface OutfitDto {
  id: string;
  name: string;
  description: string;
  category: string;
  clothes: OutfitClothesDto[];
  weather: OutfitWeatherDto | null;
  createdAt?: string;
}

export interface OutfitListResponse extends Omit<CursorResponse<OutfitDto>, 'nextCursor' | 'nextIdAfter'> {
  nextCursor: string | null;
  nextIdAfter: string | null;
}

export interface OutfitListParams {
  cursor?: string;
}

export interface OutfitUpdateRequest {
  name?: string;
  description?: string;
  category?: string;
  clothesIds?: string[];
  weatherId?: string;
}

export interface OutfitUpdateResponse {
  id: string;
  name: string;
  description: string;
  clothes: OutfitClothesDto[];
  updatedAt: string;
}

export interface ClothesAttributeDto {
  definitionId: string;
  value: string;
}

export interface ClothesAttributeWithDefDto {
  definitionId: string;
  definitionName: string;
  selectableValues: string[];
  value: string;
}

export interface ClothesAttributeDefDto {
  id: string;
  createdAt: string;
  name: string;
  selectableValues: string[];
}

export interface ClothesDto {
  id: string;
  ownerId: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  type: ClothesType;
  season?: string;
  gender?: string;
  attributes: ClothesAttributeWithDefDto[];
  description?: string;
  isOwned?: boolean;
  preference?: number;
}

export interface OotdDto {
  clothesId: string;
  name: string;
  imageUrl?: string;
  type: ClothesType;
  attributes: ClothesAttributeWithDefDto[];
}

export interface FeedDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorDto;
  weather: WeatherSummaryDto | null;
  ootds: OotdDto[];
  content: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface CommentDto {
  id: string;
  createdAt: string;
  feedId: string;
  author: AuthorDto;
  content: string;
}

export interface FollowDto {
  id: string;
  followee: UserSummary;
  follower: UserSummary;
}

export interface FollowSummaryDto {
  followeeId: string;
  followerCount: number;
  followingCount: number;
  followedByMe: boolean;
  followedByMeId?: string;
  followingMe: boolean;
}

export interface RecommendationClothesDto {
  id: string;
  name: string;
  imageUrl?: string;
  category: ClothesType;
}

export interface RecommendedOutfitDto {
  rank: number;
  clothes: RecommendationClothesDto[];
  reason: string;
  styleTags: string[];
}

export interface RecommendationDto {
  outfits: RecommendedOutfitDto[];
}

export interface RecommendationUsage {
  limit: number;
  used: number;
  remaining: number;
}

export interface RecommendationUsageResponse {
  ootd: RecommendationUsage;
  outfit: RecommendationUsage;
}

export interface OutfitCreateRequest {
  name: string;
  description?: string;
  category: string;
  clothesIds: string[];
  weatherId?: string;
}

export interface OutfitCreateResponse {
  id: string;
  name: string;
  description?: string;
  clothes: Array<{id: string; name: string; imageUrl?: string}>;
  createdAt: string;
}

export interface RecommendationPreferenceRequest {
  subcategories: string[];
  colors: string[];
  fits: string[];
  materials: string[];
  patterns: string[];
  styles: string[];
}

export interface NotificationDto {
  id: string;
  createdAt: string;
  receiverId: string;
  title: string;
  content: string;
  level: NotificationLevel;
}

export interface DirectMessageDto {
  id: string;
  createdAt: string;
  sender: UserSummary;
  receiver: UserSummary;
  content: string;
}

export interface DmRoomListItem {
  roomId: string;
  dmKey: string;
  opponent: { id: string; name: string; profileImageUrl?: string };
  lastMessage: { content: string; sentAt: string };
  unreadCount: number;
}

export interface DmRoomListResponse {
  data: DmRoomListItem[];
  nextCursor?: string;
  hasNext: boolean;
}

export interface DmMessage {
  messageId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface DmMessageListResponse {
  roomId: string;
  messages: DmMessage[];
  nextCursor?: string;
  hasNext: boolean;
}

export interface DmRoomResponse {
  roomId: string;
  dmKey: string;
  opponentId: string;
  created: boolean;
}

export interface JwtDto {
  userDto: UserDto;
  accessToken: string;
}

export interface CursorResponse<T> {
  data: T[];
  nextCursor?: string;
  nextIdAfter?: string;
  hasNext: boolean;
  totalCount: number;
  sortBy: string;
  sortDirection: SortDirection;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  password: string;
}

export interface UserRoleUpdateRequest {
  role: Role;
}

export interface UserLockUpdateRequest {
  locked: boolean;
}

export interface ProfileUpdateRequest {
  name?: string;
  gender?: Gender;
  birthDate?: string;
  longitude?: number;
  latitude?: number;
  temperatureSensitivity?: number;
}

export interface FeedCreateRequest {
  authorId: string;
  outfitId: string;
  content: string;
}

export interface FeedUpdateRequest {
  content: string;
}

export interface CommentCreateRequest {
  feedId: string;
  authorId: string;
  content: string;
}

export interface ClothesCreateRequest {
  ownerId: string;
  name: string;
  brand: string;
  type: ClothesType;
  season: string;
  gender: string;
  attributes: ClothesAttributeDto[];
  description: string;
  isOwned: boolean;
  preference: number;
}

export interface ClothesUpdateRequest {
  name?: string;
  brand?: string;
  type?: ClothesType;
  season?: string;
  gender?: string;
  attributes?: ClothesAttributeDto[];
  description?: string;
  isOwned?: boolean;
  preference?: number;
}

export interface ClothesAttributeDefCreateRequest {
  name: string;
  selectableValues: string[];
}

export interface ClothesAttributeDefUpdateRequest {
  name?: string;
  selectableValues?: string[];
}

export interface FollowCreateRequest {
  followeeId: string;
  followerId: string;
}

export interface CursorParams {
  cursor?: string;
  idAfter?: string;
  limit: number;
}

export interface SortParams {
  sortDirection: SortDirection;
}

export interface UserListParams extends CursorParams, SortParams {
  emailLike?: string;
  roleEqual?: Role;
  locked?: boolean;
  sortBy: 'email' | 'createdAt';
}

export interface FeedListParams extends CursorParams, SortParams {
  keywordLike?: string;
  skyStatusEqual?: SkyStatus;
  precipitationTypeEqual?: PrecipitationType;
  authorIdEqual?: string;
  sortBy: 'createdAt' | 'likeCount';
}

export interface ClothesListParams extends CursorParams {
  typeEqual?: ClothesCategory;
  ownerId: string;
}

export interface ClothesAttributeDefListParams extends SortParams{
  sortBy: "createdAt" | "name";
  keywordLike?: string;
}

export interface FollowingListParam extends CursorParams {
  followerId: string;
  nameLike?: string;
  direction?: 'ASC' | 'DESC';
}

export interface FollowerListParam extends CursorParams {
  followeeId: string;
  nameLike?: string;
  direction?: 'ASC' | 'DESC';
}

export type FollowListResponse = CursorResponse<UserSummary>;

export interface WeatherParams {
  longitude: number;
  latitude: number;
}

export interface RecommendationParams {
  weatherId: string;
  selectedClothesIds?: string[];
}

export interface DirectMessageParams extends CursorParams {
  userId: string;
}

export interface FeedCommentParams extends CursorParams {
  feedId: string;
}
