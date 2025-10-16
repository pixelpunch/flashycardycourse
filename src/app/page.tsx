import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Flashy Cardy
          </h1>
          <p className="text-2xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <SignInButton mode="modal">
            <Button size="lg" variant="outline" className="px-8">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="lg" className="px-8">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
