import { SignUp } from "@clerk/nextjs";

const signUpAppearance = {
  elements: {
    rootBox: "mx-auto",
    card: "shadow-lg border border-border",
  },
  variables: {
    colorPrimary: "oklch(0.205 0 0)",
    colorBackground: "oklch(1 0 0)",
    colorInputBackground: "oklch(0.97 0 0)",
    colorInputText: "oklch(0.145 0 0)",
    borderRadius: "0.625rem",
  },
};

export default function SignUpPage() {
  return (
    <SignUp
      appearance={signUpAppearance}
      routing="path"
      path="/sign-in"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
