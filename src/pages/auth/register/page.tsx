import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#3d5570] px-5 py-12 text-[#142f50]">
      <div className="absolute -left-28 -top-28 h-[460px] w-[460px] rounded-full bg-[#71859c]/40 blur-3xl" />
      <div className="absolute -bottom-52 -right-28 h-[600px] w-[600px] rounded-full bg-[#2a405a]" />
      <div className="absolute -right-24 -top-40 h-[460px] w-[740px] rotate-[30deg] rounded-[50%] border border-white/40" />
      <div className="absolute -bottom-44 -left-32 h-[420px] w-[700px] rotate-[-25deg] rounded-[50%] border border-white/35" />

      <header className="absolute left-10 top-12 hidden text-white xl:block">
        <h1 className="font-serif text-[31px] tracking-[0.27em]">OTBOO</h1>
        <p className="mt-1.5 text-[11px] tracking-[0.36em] text-white/65">OUTFIT FOR A BETTER TODAY</p>
        <div className="mt-5 h-px w-7 bg-[#d2b677]" />
      </header>

      <section className="relative z-10 w-full max-w-[568px] rounded-[25px] bg-[#fbfaf7] px-7 py-12 shadow-[0_25px_55px_rgba(3,15,30,0.38)] sm:px-[70px] sm:py-[52px]">
        <header className="mb-8 text-center">
          <h2 className="font-serif text-[47px] leading-none tracking-[-0.07em] text-[#173252] sm:text-[52px]">OTBOO</h2>
          <p className="mt-3 text-[13px] font-medium tracking-[0.34em] text-[#536980]">나만의 오늘을 시작하세요</p>
        </header>
        <RegisterForm />
      </section>
      <p className="absolute bottom-11 left-10 hidden text-[10px] font-medium leading-5 tracking-[0.28em] text-white/60 xl:block">A SMALL CHANGE<br />A BETTER YOU</p>
      <p className="absolute right-11 top-14 hidden text-[10px] font-medium leading-5 tracking-[0.38em] text-white/60 xl:block">WEAR<br />YOUR<br />STORY</p>
    </main>
  );
}
