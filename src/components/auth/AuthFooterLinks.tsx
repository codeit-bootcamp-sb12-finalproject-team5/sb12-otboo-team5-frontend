import { Link } from "react-router-dom";

export default function AuthFooterLinks() {
  return (
    <div className="flex flex-col gap-3 items-center justify-center w-full pt-4">
      <Link 
        to="/auth/forgot-password"
        className="text-[#294968] text-sm font-semibold tracking-[-0.4px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        비밀번호를 잊으셨나요?
      </Link>
      
      <div className="flex gap-[7px] items-center justify-center text-sm font-semibold tracking-[-0.4px]">
        <span className="text-[#8b939b]">
          계정이 없으신가요?
        </span>
        <Link 
          to="/auth/register"
          className="text-[#294968] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
