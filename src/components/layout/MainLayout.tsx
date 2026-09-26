import {Outlet, useLocation} from 'react-router-dom';
import SideMenu from './SideMenu';
import GNB from './GNB';
import WebSocket from "@/components/layout/WebSocket.tsx";
import Sse from "@/components/layout/Sse.tsx";

export default function MainLayout() {
  const location = useLocation();

  const bgColor = location.pathname.includes("/recommendations") ? 'bg-[#fcfaf6]' : 'bg-white';
  const isRecommendations = location.pathname.includes('/recommendations');

  return (
    <div className={`h-full overflow-hidden ${bgColor} flex`}>
      {/* 사이드 메뉴 - 280px 고정폭 */}
      <div className="w-[268px] h-full flex-shrink-0">
        <SideMenu />
      </div>
      
      {/* 메인 컨텐츠 영역 */}
      <div className="relative flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {isRecommendations && (
          <>
            <div className="pointer-events-none absolute -right-[120px] -top-[185px] z-0 size-[570px] rounded-full border border-[#b7a997]/40" />
            <div className="pointer-events-none absolute -right-[72px] -top-[145px] z-0 size-[500px] rounded-full bg-[#b7a997]/10" />
            <div className="pointer-events-none absolute -right-[30px] -top-[105px] z-0 size-[420px] rounded-full bg-[#b08a44]/[0.06]" />
          </>
        )}
        {/* GNB - 60px 높이 */}
        <div className="relative z-10 h-[76px] flex-shrink-0">
          <GNB />
        </div>
        
        {/* 페이지 컨텐츠 - 남은 공간 모두 차지 */}
        <main className="relative z-10 flex-1 min-h-0">
          <Outlet />
        </main>
        <WebSocket/>
        <Sse/>
      </div>
    </div>
  );
}
