import React from 'react'
import { Link } from 'react-router-dom'
import clsx from 'classnames'
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from './../hooks/useAuth'
import Button from './../components/ui/button'

const Home: React.FC = () => {
  const { currentUser } = useAuth()

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms detect misinformation, deepfakes, and manipulated content with high accuracy.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: DocumentTextIcon,
      title: 'Legal Guidance',
      description: 'Generate comprehensive legal reports and personalized guidance based on jurisdiction and case specifics.',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: ChartBarIcon,
      title: 'Risk Assessment',
      description: 'Detailed risk analysis with actionable insights and recommendations for content verification.',
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  const stats = [
    { label: 'Accuracy Rate', value: '99.2%', icon: CheckCircleIcon },
    { label: 'Processing Speed', value: '<2s', icon: ArrowPathIcon },
    { label: 'Files Analyzed', value: '1M+', icon: SparklesIcon },
    { label: 'User Satisfaction', value: '4.9/5', icon: StarIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <div className="relative container-fluid py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/50 backdrop-blur-sm border border-blue-700/50 text-blue-300 text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              AI-Powered Content Analysis Platform
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              TruthShield
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Enterprise
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Detect misinformation, verify content authenticity, and generate legal guidance
              with enterprise-grade AI technology. Trusted by professionals worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Go to Dashboard
                    <ArrowPathIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="px-8 py-4 text-lg">
                      Start Free Trial
                      <SparklesIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center">
                <LockClosedIcon className="h-4 w-4 mr-2 text-emerald-400" />
                Enterprise Security
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-emerald-400" />
                SOC 2 Compliant
              </div>
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                4.9/5 Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-slate-800/50 backdrop-blur-sm">
        <div className="container-fluid">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4 shadow-lg">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Comprehensive content analysis and legal guidance powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-slate-700/50 group hover:scale-105 hover:border-slate-600/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className={clsx(
                    'inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r text-white mb-6 shadow-lg',
                    feature.gradient
                  )}>
                    <feature.icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-50 via-blue-100 to-purple-50 border-t border-blue-100">
        <div className="container-fluid text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to Verify Content with Confidence?
          </h2>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust TruthShield for their content analysis needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser ? (
              <Link to="/upload">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Start Analyzing
                  <ArrowPathIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Get Started Free
                    <SparklesIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home