// 로컬 에셋 import
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import weatherIcon from '@/assets/icons/sidebar/weather-sun.svg';
import wardrobeIcon from '@/assets/icons/sidebar/wardrobe.svg';
import outfitIcon from '@/assets/icons/sidebar/outfit-tshirt.svg';
import feedIcon from '@/assets/icons/sidebar/feed.svg';
import profileIcon from '@/assets/icons/sidebar/profile.svg';
import sendIcon from '@/assets/icons/sidebar/dm-send.svg';
import userManagementIcon from '@/assets/icons/sidebar/user-management.svg';
import attributeWrenchIcon from '@/assets/icons/sidebar/attribute-wrench.svg';
import {useAuthStore} from "@/lib/stores/useAuthStore.ts";

interface SideMenuBtnProps {
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

function SideMenuBtn({ label = "Label", isActive = false, onClick, icon }: SideMenuBtnProps) {
  const baseClass = "box-border content-stretch flex gap-[13px] h-[58px] items-center justify-start px-[16px] py-[10px] relative shrink-0 w-full cursor-pointer rounded-[12px] transition-colors";
  const activeClass = "bg-[#e6dfd5] rounded-[12px] shadow-[0px_4px_14px_rgba(15,42,68,0.06)] !pl-[10px]";
  
  return (
    <div 
      className={`${baseClass} ${isActive ? activeClass : ""}`}
      onClick={onClick}
    >
      <div className="box-border content-stretch flex items-center justify-center overflow-clip relative rounded-full shrink-0 size-10 bg-[#f5f2ec]">
        {icon || (
          <div className="overflow-clip relative shrink-0 size-6">
            <img alt="" className="block max-w-none size-full" src={attributeWrenchIcon} />
          </div>
        )}
      </div>
      <div className={`font-semibold leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap tracking-[-0.4px] ${isActive ? 'text-[#0f2a44]' : 'text-[#3d5570]'}`}>
        <p className="leading-[normal] whitespace-pre">{label}</p>
      </div>
    </div>
  );
}

function WeatherIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-6">
      <img alt="날씨" className="block max-w-none size-full" src={weatherIcon} />
    </div>
  );
}

function FeedIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-6">
      <img alt="피드" className="block max-w-none size-full" src={feedIcon} />
    </div>
  );
}

function ClosetIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-6">
      <img alt="옷장" className="block max-w-none size-full" src={wardrobeIcon} />
    </div>
  );
}

function ProfileIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-6">
      <img alt="프로필" className="block max-w-none size-full" src={profileIcon} />
    </div>
  );
}

function SettingIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-6">
      <img alt="설정" className="block max-w-none size-full" src={attributeWrenchIcon} />
    </div>
  );
}

function Setting2Icon() {
  return (
    <div className="overflow-clip relative shrink-0 size-6">
      <img alt="사용자 관리" className="block max-w-none size-full" src={userManagementIcon} />
    </div>
  );
}

function DmIcon() {
  return <div className="overflow-clip relative shrink-0 size-6"><img alt="DM" className="block max-w-none size-full" src={sendIcon} /></div>;
}

// 메뉴 아이템 정의
const menuItems = [
  {
    id: 'recommendations',
    label: '날씨별 옷 추천',
    path: '/recommendations',
    icon: <WeatherIcon />
  },
  {
    id: 'closet',
    label: '옷장',
    path: '/closet',
    icon: <ClosetIcon />
  },
  {
    id: 'outfits',
    label: '아웃핏',
    path: '/outfits',
    icon: <img src={outfitIcon} alt="아웃핏" className="size-6 shrink-0" />
  },
  {
    id: 'feeds',
    label: '피드',
    path: '/feeds',
    icon: <FeedIcon />
  },
  {
    id: 'profiles',
    label: '프로필',
    path: '/profiles',
    icon: <ProfileIcon />
  },
  {
    id: 'direct-messages',
    label: 'DM',
    path: '/direct-messages',
    icon: <DmIcon />
  },
  {
    id: 'users',
    label: '사용자 관리',
    path: '/admin/users',
    icon: <Setting2Icon />
  },
  {
    id: 'attributes',
    label: '속성 관리',
    path: '/admin/clothes-attributes',
    icon: <SettingIcon />
  }
];

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string>('recommendations');
  const isAdmin = useAuthStore(state => state.data?.userDto.role === 'ADMIN');

  // 현재 경로에 따라 활성 메뉴 업데이트
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => 
      currentPath === item.path || 
      (item.path !== '/' && currentPath.startsWith(item.path))
    );
    
    if (activeItem) {
      setActiveMenu(activeItem.id);
    }
  }, [location.pathname]);

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuId: string, path: string) => {
    setActiveMenu(menuId);
    navigate(path);
  };

  return (
    <div className="bg-[#fcfaf6] relative size-full">
      <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-3.5 px-[28px] relative size-full">
        <div className="absolute top-0 left-0 right-0 h-[112px] z-10 pl-7 pt-7">
          <div aria-label="OTBOO" className="text-[#3d5570]">
            <div className="font-serif text-[33px] leading-none tracking-[0.18em]">OTBOO</div>
            <div className="mt-2 text-[9px] font-semibold tracking-[0.28em] text-[#7a8ca3]">OUTFIT FOR A BETTER TODAY</div>
            <div className="mt-4 h-px w-7 bg-[#b08a44]" />
          </div>
        </div>
        
        <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 mt-[112px] w-full">
          {menuItems
          .filter(item => {
            if (isAdmin) return true;
            return !item.path.includes('/admin/');
          })
          .map((item) => (
            <SideMenuBtn
              key={item.id}
              label={item.label}
              isActive={activeMenu === item.id}
              icon={item.icon}
              onClick={() => handleMenuClick(item.id, item.path)}
            />
          ))}
        </div>
      </div>
      
      {/* 우측 보더 */}
      <div className="absolute border-r border-[#d9d1c6] inset-0 pointer-events-none shadow-[6px_0px_16px_0px_rgba(15,42,68,0.03)]" />
    </div>
  );
}
