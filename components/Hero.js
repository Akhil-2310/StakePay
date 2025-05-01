import Link from "next/link"

export default function Hero() {
  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Secure Invoice Management powered by <span className="text-[#2E6D9A]">Blockchain</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, manage, and secure your invoices with blockchain technology. StakePay ensures trust between
            suppliers and buyers through staking and escrow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors text-center"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-8 py-3 bg-white text-[#2E6D9A] border border-[#2E6D9A] rounded-md hover:bg-gray-100 transition-colors text-center"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
