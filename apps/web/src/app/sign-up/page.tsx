import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";

export const metadata = { title: "Create workspace" };

export default function SignUpPage() {
  return <AuthLayout title="Create your workspace" subtitle="Start with a business profile, then connect the channels your team already uses."><AuthForm mode="sign-up" /></AuthLayout>;
}
