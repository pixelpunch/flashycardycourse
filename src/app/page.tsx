import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to Flashy Cardy Course
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Master any subject with intelligent flashcards powered by spaced repetition algorithms
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:scale-105 transition-all transform"
            >
              Start Learning Now
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-primary px-8 py-4 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-105"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Smart Learning with Flashcards
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create, study, and master flashcards with spaced repetition algorithms. 
            Track your progress and achieve your learning goals faster.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30 hover:bg-card/80">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors">Smart Algorithms</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">Adaptive spaced repetition that learns your pace and optimizes review timing for maximum retention.</p>
          </div>

          <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30 hover:bg-card/80">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors">Progress Tracking</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">Detailed analytics and insights to monitor your learning journey and celebrate your improvement.</p>
          </div>

          <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30 hover:bg-card/80">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors">Easy Creation</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">Intuitive card creation with support for text, images, and various question types.</p>
          </div>
        </div>

        {/* Sample Flashcard Preview */}
        <div className="text-center mb-20">
          <h3 className="text-4xl font-bold mb-12 text-foreground">Experience the Magic</h3>
          <div className="max-w-lg mx-auto">
            <div className="group relative bg-gradient-to-br from-card via-card to-card/80 border-2 border-primary/20 rounded-2xl p-10 shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer hover:scale-105 hover:border-primary/40">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
              <div className="relative text-center">
                <div className="text-sm text-primary font-semibold mb-6 uppercase tracking-wider">Question</div>
                <div className="text-2xl font-bold mb-8 text-card-foreground leading-relaxed">
                  What is the capital of France?
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  Click to reveal answer →
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/70 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-2xl p-12 max-w-4xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative">
              <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Ready to Transform Your Learning?
              </h3>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students who have revolutionized their study habits and achieved remarkable learning outcomes with FlashyCardy.
              </p>
              <div className="flex gap-6 justify-center flex-wrap">
                <Button className="group bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-10 py-5 rounded-xl font-bold text-xl hover:from-primary/90 hover:to-primary transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-primary/30">
                  <span className="group-hover:scale-110 inline-block transition-transform">Start Your Journey</span>
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-primary/50 text-primary px-10 py-5 rounded-xl font-bold text-xl hover:bg-primary/10 hover:border-primary transition-all transform hover:scale-105 backdrop-blur-sm"
                >
                  Explore Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 mt-24 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              FlashyCardy
            </div>
            <p className="text-muted-foreground text-lg mb-6">
              Revolutionizing learning through intelligent flashcards
            </p>
            <div className="text-sm text-muted-foreground/70">
              <p>&copy; 2024 FlashyCardy. Coming soon...</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
