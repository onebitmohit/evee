import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return <AuthLayout title="Welcome back" subtitle="Sign in to your GTM workspace."><AuthForm mode="sign-in" /></AuthLayout>;
}
