import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden">
      <section className="flex relative w-full h-[500px] flex-col justify-end items-center">
        <Image
          src="/logo.png"
          alt="Mythical Insider Logo"
          className="shrink-0 w-[600px] h-[600px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur brightness-50"
          width={600}
          height={600}
        />
        <Image
          src="/logo.png"
          alt="Mythical Insider Logo"
          className="shrink-0 w-[350px] h-[350px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          width={350}
          height={350}
        />
        <h1 className="text-white font-bold z-10 text-3xl text-center">
          Mythical Insider API
        </h1>
      </section>
    </main>
  );
}
