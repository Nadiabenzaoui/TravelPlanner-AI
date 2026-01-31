import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";

export default function SignupPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background noise">
            <div className="w-full max-w-md flex flex-col items-center gap-8">
                <div className="text-center space-y-2">
                    <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic hover:opacity-70 transition-opacity">
                        TravelAI.
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Get Started</h1>
                    <p className="text-zinc-500 font-medium">Create an account to start planning</p>
                </div>

                <AuthForm type="signup" />

                <p className="text-sm font-medium text-zinc-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-black font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
