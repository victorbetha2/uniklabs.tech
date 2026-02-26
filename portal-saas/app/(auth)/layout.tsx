import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/images/LOGO.png"
            alt="UnikLabs"
            width={160}
            height={46}
            className="h-10 w-auto"
          />
        </Link>
      </div>
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
