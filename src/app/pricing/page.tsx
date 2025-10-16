import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your learning needs. Upgrade anytime to unlock premium features.
          </p>
        </div>

        {/* Pricing Table */}
        <div className="flex justify-center clerk-pricing-wrapper">
          <PricingTable 
            appearance={{
              elements: {
                // Card styling
                card: "bg-card border-border",
                cardBox: "bg-card text-card-foreground",
                
                // Button styling - ensure high contrast
                button: "bg-primary text-primary-foreground hover:bg-primary/90",
                buttonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                
                // Badge/Label styling for 'active' labels
                badge: "bg-primary text-primary-foreground",
                badgePrimary: "bg-primary text-primary-foreground",
                
                // Text elements
                text: "text-foreground",
                textPrimary: "text-primary",
                textSecondary: "text-muted-foreground",
                
                // Price styling
                priceText: "text-foreground",
                
                // Features list
                featuresListItem: "text-foreground",
              },
              layout: {
                shimmer: false,
              }
            }}
          />
        </div>

        {/* Features Comparison Section */}
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Features Comparison
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan Features */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Free Plan
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-muted-foreground">
                    Create up to <strong className="text-foreground">3 decks</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-muted-foreground">
                    Unlimited cards per deck
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-muted-foreground">
                    Basic study mode
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-muted-foreground">
                    Manual card creation
                  </span>
                </li>
              </ul>
            </div>

            {/* Pro Plan Features */}
            <div className="bg-primary/5 rounded-lg border border-primary/20 p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Pro Plan
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-foreground">
                    <strong>Unlimited decks</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-foreground">
                    Unlimited cards per deck
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-foreground">
                    Advanced study mode
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-foreground">
                    <strong>AI-powered flashcard generation</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-foreground">
                    Priority support
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 border-t border-border pt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Can I upgrade or downgrade my plan anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade to Pro at any time to unlock all features. If you downgrade, you&apos;ll keep access to Pro features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                What happens to my decks if I downgrade?
              </h3>
              <p className="text-muted-foreground">
                Your decks and cards are never deleted. If you downgrade to the Free plan, you&apos;ll need to delete decks to get down to 3 before you can create new ones.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                How does AI flashcard generation work?
              </h3>
              <p className="text-muted-foreground">
                Pro users can generate flashcards automatically using AI. Simply provide a topic or paste content, and our AI will create relevant question-answer pairs for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

