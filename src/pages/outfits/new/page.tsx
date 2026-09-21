import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hangerIcon from '@/assets/icons/il_hanger.svg';

export default function NewOutfitPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'OOTD';
  const listPath = `/outfits?${new URLSearchParams({ category })}`;

  return (
    <div className="flex h-full flex-col overflow-y-auto px-10 py-2.5">
      <header className="flex shrink-0 items-center gap-4 border-b border-gray-200 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={listPath} aria-label="아웃핏 목록으로 돌아가기"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-[22px] font-bold text-gray-900">아웃핏 제작</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
        <img src={hangerIcon} alt="" className="h-24 w-24" />
        <h2 className="text-xl font-bold text-gray-800">아웃핏 제작 기능을 준비하고 있어요</h2>
        <p className="text-base leading-relaxed text-gray-500">
          옷장의 의류를 조합해 나만의 아웃핏을 만드는 기능이 추가될 예정입니다.
        </p>
        <Button variant="secondary" asChild><Link to={listPath}>아웃핏 목록으로</Link></Button>
      </div>
    </div>
  );
}
