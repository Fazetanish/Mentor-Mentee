import React from 'react';
import { Users, FileText, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';

export default function MainPage() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Browse & Discover",
      description: "Explore faculty profiles filtered by expertise and availability. Connect with the perfect mentor for your research goals."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Structured Proposals",
      description: "Submit detailed project proposals with clear objectives, methodology, and outcomes to ensure meaningful mentorship."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Request Management",
      description: "Faculty can review, approve, or request changes. Students track their applications in real-time with notifications."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Admin Analytics",
      description: "Department coordinators gain insights into mentorship distribution, project domains, and success metrics."
    }
  ];

  const roles = [
    {
      title: "For Students",
      points: [
        "Browse faculty by domain expertise",
        "Submit comprehensive project proposals",
        "Track application status in real-time",
        "Receive instant notifications"
      ]
    },
    {
      title: "For Faculty",
      points: [
        "Review student profiles and proposals",
        "Manage mentorship capacity",
        "Approve or request proposal changes",
        "Focus on serious, well-prepared requests"
      ]
    },
    {
      title: "For Administrators",
      points: [
        "Monitor mentorship distribution",
        "View project analytics by domain",
        "Manage user accounts and tags",
        "Track success rates and engagement"
      ]
    }
  ];

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Students with
            <span className="text-indigo-600"> Expert Mentors</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A streamlined platform for academic mentorship that brings together students, faculty, and administrators
            to foster meaningful research collaborations through structured project proposals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need for successful academic mentorship</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-lg transition">
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to meaningful mentorship</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Browse & Filter</h3>
              <p className="text-gray-600">Students explore faculty profiles filtered by domain expertise and current capacity. Faculty can also browse student profiles.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Submit Proposal</h3>
              <p className="text-gray-600">Students submit detailed project proposals including title, description, methodology, and expected outcomes.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Review & Connect</h3>
              <p className="text-gray-600">Faculty review proposals and approve, reject, or request changes. Students track status through their dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Everyone</h2>
            <p className="text-xl text-gray-600">Tailored experiences for students, faculty, and administrators</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="p-8 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">{role.title}</h3>
                <ul className="space-y-3">
                  {role.points.map((point, pIndex) => (
                    <li key={pIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join our platform today and experience seamless academic mentorship matching
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
              Sign Up Now
            </button>
            <button className="bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-800 transition border-2 border-white">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}