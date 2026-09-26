import LoginForm from '@/components/auth/LoginForm';
import SocialLoginSection from '@/components/auth/SocialLoginSection';
import AuthFooterLinks from '@/components/auth/AuthFooterLinks';
import FashionIllustration from '@/assets/illust_logos/login-fashion-illustration.png';

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#3d5570] px-5 py-10 text-[#142f50]">
      <div className="absolute -left-24 -top-24 h-[430px] w-[430px] rounded-full bg-[#71859c]/45 blur-3xl" />
      <div className="absolute -bottom-44 -right-28 h-[520px] w-[520px] rounded-full bg-[#2a405a]" />
      <div className="absolute -left-20 bottom-0 h-[380px] w-[520px] rotate-[-36deg] rounded-[50%] border border-white/40" />
      <div className="absolute right-[-130px] top-[-190px] h-[420px] w-[620px] rotate-[42deg] rounded-[50%] border border-white/40" />

      <section className="relative z-10 grid w-full max-w-[1325px] overflow-hidden rounded-[25px] bg-[#fbfaf7] shadow-[0_25px_55px_rgba(3,15,30,0.45)] lg:grid-cols-2">
        <aside className="relative hidden min-h-[720px] overflow-hidden border-r border-[#d9d3c9] bg-[#f7f3eb] p-11 lg:block">
          <div className="font-serif text-[19px] font-semibold tracking-[0.42em] text-[#173252]">OTBOO</div>
          <div className="mt-4 h-px w-7 bg-[#b28c48]" />
          <div className="absolute left-[10%] top-[30%] h-40 w-40 rounded-full bg-[#dbe1e4]/70 blur-[3px]" />
          <div className="absolute right-[9%] top-[43%] h-48 w-48 rounded-full bg-[#e4d9c5]/70 blur-[3px]" />
          <img
            src={FashionIllustration}
            alt="세련된 옷차림의 두 사람 일러스트"
            className="absolute bottom-[26%] left-[1%] z-10 w-[98%] object-contain opacity-90"
          />
          <div className="absolute bottom-10 left-11 text-[11px] font-medium leading-6 tracking-[0.28em] text-[#69788c]">
            A SMALL CHANGE<br />A BETTER YOU
            <div className="mt-3 h-px w-7 bg-[#b28c48]" />
          </div>
        </aside>

        <div className="flex min-h-[720px] items-center justify-center px-7 py-14 sm:px-16 lg:px-20">
          <div className="w-full max-w-[404px]">
            <header className="mb-11 text-center">
              <h1 className="font-serif text-[52px] leading-none tracking-[-0.07em] text-[#123052] sm:text-[60px]">OTBOO</h1>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.42em] text-[#60738d]">OUTFIT FOR A BETTER TODAY</p>
            </header>

            <div className="flex flex-col gap-7">
              <LoginForm />
              <div className="flex items-center gap-3 text-xs text-[#8993a0] before:h-px before:flex-1 before:bg-[#d7d7d4] after:h-px after:flex-1 after:bg-[#d7d7d4]">또는</div>
              <SocialLoginSection />
              <AuthFooterLinks />
            </div>
          </div>
        </div>
      </section>
      <p className="absolute right-7 top-1/2 hidden -translate-y-1/2 rotate-90 text-[10px] font-medium tracking-[0.55em] text-white/60 xl:block">WEAR YOUR STORY</p>
    </main>
  );
}
