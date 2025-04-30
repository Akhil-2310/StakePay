export default function Features() {
    const features = [
      {
        title: "AI-Powered Invoice Creation",
        description: "Create professional invoices quickly with our AI assistant that guides you through the process.",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#2E6D9A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        ),
      },
      {
        title: "Blockchain-Backed Trust",
        description:
          "Both parties stake tokens to ensure commitment, creating a trustless environment for business transactions.",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#2E6D9A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ),
      },
      {
        title: "Secure Escrow Payments",
        description: "Payments are held in a secure smart contract until delivery is confirmed, protecting both parties.",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#2E6D9A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
      {
        title: "Real-time Status Tracking",
        description: "Track the status of your invoices in real-time from creation to payment completion.",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#2E6D9A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        ),
      },
    ]
  
    return (
      <div id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose StakePay</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines the security of blockchain with the simplicity of modern invoice management.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-lg">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  