import {useCallback, useEffect, useRef, useState} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import ProfileAvatar from './ProfileAvatar';
import searchIcon from '@/assets/icons/ic_search.svg';
import {useFollowerStore} from '@/lib/stores/useFollowerStore';
import {useFollowingStore} from '@/lib/stores/useFollowingStore';
import {useNavigate} from "react-router-dom";
import {useInfiniteScroll} from "@/lib/hooks/useInfiniteScroll.ts";

interface FollowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'follower' | 'following';
  targetUserId: string;
}

export default function FollowModal({ open, onOpenChange, type, targetUserId }: FollowModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  
  // 팔로워 스토어
  const { 
    data: followers, 
    loading: followersLoading, 
    fetch: fetchFollowers, 
    fetchMore: fetchMoreFollowers, 
    clearData: clearFollowersData,
    updateParams: updateFollowersParams
  } = useFollowerStore();
  
  // 팔로잉 스토어  
  const { 
    data: followings, 
    loading: followingsLoading, 
    fetch: fetchFollowings, 
    fetchMore: fetchMoreFollowings, 
    clearData: clearFollowingsData,
    updateParams: updateFollowingsParams
  } = useFollowingStore();

  const usersContainerRef = useRef<HTMLDivElement>(null);

  // 현재 타입에 따른 데이터와 함수들
  const isFollowerMode = type === 'follower';
  const currentData = isFollowerMode ? followers : followings;
  const currentLoading = isFollowerMode ? followersLoading : followingsLoading;
  const currentFetch = isFollowerMode ? fetchFollowers : fetchFollowings;
  const currentFetchMore = isFollowerMode ? fetchMoreFollowers : fetchMoreFollowings;
  const currentClearData = isFollowerMode ? clearFollowersData : clearFollowingsData;
  const currentUpdateParams = isFollowerMode ? updateFollowersParams : updateFollowingsParams;

  const {ref: scrollTriggerRef} = useInfiniteScroll({
    onLoadMore: () => currentFetchMore()
  });

  // 타겟 유저 변경 시 파라미터 업데이트 및 데이터 조회
  useEffect(() => {
    if (open && targetUserId) {
      const params = isFollowerMode
          ? {
            followeeId: targetUserId,
            nameLike: searchQuery || undefined,
            direction: sortDirection,
          }
          : {
            followerId: targetUserId,
            nameLike: searchQuery || undefined,
            direction: sortDirection,
          };
      currentUpdateParams(params);
      currentFetch();
    }
  }, [open, targetUserId, type, isFollowerMode, currentUpdateParams, currentFetch, searchQuery,
    sortDirection]);

  // 모달이 닫힐 때 데이터 정리
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      currentClearData();
    }
  }, [open, currentClearData]);

  // 검색어 변경 시 파라미터 업데이트
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (targetUserId) {
      const params = isFollowerMode
          ? {
            followeeId: targetUserId,
            nameLike: query || undefined,
            direction: sortDirection,
          }
          : {
            followerId: targetUserId,
            nameLike: query || undefined,
            direction: sortDirection,
          };
      currentUpdateParams(params);
      currentFetch();
    }
  }, [targetUserId, isFollowerMode, currentUpdateParams, currentFetch, sortDirection]);


  const title = isFollowerMode ? '팔로워' : '팔로잉';
  const sortLabel = sortDirection === 'DESC' ? '최신순' : '오래된순';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-white w-[600px] h-[510px] max-w-[min(600px,90vw)] max-h-[min(510px,85vh)] p-0 gap-0 rounded-[30px] border-0 shadow-lg flex overflow-hidden"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full w-full">
          {/* 헤더 */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-[#e7e7e9]">
            <div className="flex items-center justify-center relative">
              <div className="font-['SUIT:Bold',_sans-serif] text-[#212126] text-[20px] tracking-[-0.5px] leading-[0] not-italic">
                <p className="leading-[normal]">{title}</p>
              </div>
            </div>

            {/* 검색 입력 */}
            <div className="bg-[#f7f7f8] h-[44px] relative rounded-[100px] w-full">
              <div className="flex items-center h-full pl-4 pr-3 py-3">
                <div className="overflow-clip relative shrink-0 size-5 mr-2">
                  <img src={searchIcon} alt="검색" className="block max-w-none size-full" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="사용자 검색..."
                    className="flex-1 font-['SUIT:SemiBold',_sans-serif] text-[16px] text-[#212126] tracking-[-0.4px] bg-transparent border-none outline-none placeholder:text-[#a9a9b1]"
                />
              </div>
            </div>

            {/* 정렬 */}
            <div className="flex justify-end relative">
              <button
                  type="button"
                  onClick={() => setSortMenuOpen(prev => !prev)}
                  className="flex items-center w-[140px] text-[14px] font-['SUIT:SemiBold',_sans-serif] text-[#212126]"
              >
                <span className="flex-1 text-left">팔로우한 날짜:</span>
                <span className="text-right">{sortLabel}</span>
              </button>

              {sortMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[110px] rounded-[10px] bg-white border border-[#e7e7e9] shadow-md z-10">
                    <button
                        type="button"
                        onClick={() => {
                          setSortDirection('DESC');
                          setSortMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-[14px] text-[#212126] hover:bg-[#f7f7f8]"
                    >
                      최신순
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                          setSortDirection('ASC');
                          setSortMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-[14px] text-[#212126] hover:bg-[#f7f7f8]"
                    >
                      오래된순
                    </button>
                  </div>
              )}
            </div>

          </div>

          {/* 사용자 목록 */}
          <div className="flex-1 overflow-hidden">
            {currentLoading && currentData.length === 0 ? (
              /* 로딩 상태 */
              <div className="flex items-center justify-center h-full">
                <div className="font-['SUIT:SemiBold',_sans-serif] text-[#a9a9b1] text-[18px] tracking-[-0.45px] leading-[1.4] not-italic">
                  <p>로딩 중...</p>
                </div>
              </div>
            ) : currentData.length === 0 ? (
              /* 빈 상태 */
              <div className="flex items-center justify-center h-full">
                <div className="font-['SUIT:SemiBold',_sans-serif] text-[#a9a9b1] text-[18px] tracking-[-0.45px] leading-[1.4] not-italic">
                  <p>{searchQuery ? '검색 결과가 없습니다.' : `${title}이 없습니다.`}</p>
                </div>
              </div>
            ) : (
              /* 사용자 목록 */
              <div ref={usersContainerRef} className="h-full overflow-y-auto px-5">
                <div className="flex flex-col py-4">
                  {currentData.map((user) => {
                    return (
                        <div key={user.userId} className="flex gap-3 items-center justify-between py-3">
                          <div className="flex gap-3 items-center flex-1">
                            {/* 프로필 이미지 */}
                            <div className="bg-[#a9a9b1] relative rounded-[100px] shrink-0 size-[40px] overflow-hidden">
                              <ProfileAvatar
                                  imageUrl={user.profileImageUrl}
                                  alt={user.name}
                                  className="w-full h-full object-cover rounded-[100px]"
                              />

                              <div
                                  aria-hidden="true"
                                  className="absolute border-[#a9a9b1] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[100px] shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)]"
                              />
                            </div>

                            {/* 사용자 이름 */}
                            <div
                                className="font-['SUIT:SemiBold',_sans-serif] text-[#212126] text-[16px] tracking-[-0.4px] leading-[0] not-italic cursor-pointer hover:underline"
                                onClick={() => {
                                  console.log('사용자 이름 클릭됨:', user.userId);
                                  onOpenChange(false);
                                  navigate(`/profiles?userId=${user.userId}`);
                                }}
                            >
                              <p className="leading-[normal]">{user.name}</p>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                  
                  {/* 무한 스크롤 트리거 */}
                  <div ref={scrollTriggerRef} className="w-full h-1" />
                  
                  {/* 무한 스크롤 로딩 */}
                  {currentLoading && currentData.length > 0 && (
                    <div className="flex justify-center py-4">
                      <div className="font-['SUIT:SemiBold',_sans-serif] text-[#a9a9b1] text-[14px] tracking-[-0.35px]">
                        로딩 중...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
