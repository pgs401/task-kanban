import { AuthForm } from "@/components/auth-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { confirm?: string };
}) {
  const notice = searchParams.confirm
    ? "Account created. Check your email to confirm, then sign in."
    : undefined;
  return <AuthForm mode="login" notice={notice} />;
}
