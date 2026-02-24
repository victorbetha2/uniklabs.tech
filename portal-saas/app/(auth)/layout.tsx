export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <a href="/" className="text-2xl font-semibold tracking-tight text-foreground">
          UnikLabs
        </a>
      </div>
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
