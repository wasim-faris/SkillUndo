import React from 'react';
import { Link } from 'react-router-dom';
import { HiBolt, HiCheckCircle, HiArrowRight, HiChatBubbleLeftRight, HiAcademicCap, HiRocketLaunch } from 'react-icons/hi2';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div 
    className="card-premium animate-fade-in group"
    style={{ animationDelay: delay }}
  >
    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="text-[#6C63FF] w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex gap-6 items-start">
    <div className="w-12 h-12 rounded-full bg-[#6C63FF] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-purple-200">
      {number}
    </div>
    <div>
      <h4 className="text-xl font-bold mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#6C63FF] rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <HiBolt className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-800">SkillSwap</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-600 font-medium hover:text-[#6C63FF] transition-colors">How it works</a>
            <a href="#features" className="text-gray-600 font-medium hover:text-[#6C63FF] transition-colors">Features</a>
            <Link to="/login" className="text-gray-800 font-bold hover:text-[#6C63FF] transition-colors">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-[#6C63FF] font-semibold text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6C63FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6C63FF]"></span>
              </span>
              The future of learning is social
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 text-gray-900">
              Master new skills through <span className="text-[#6C63FF]">knowledge exchange.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
              The world's first currency-free learning platform. Teach what you know, learn what you don't. Simple as that.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
                Join the Community <HiArrowRight />
              </Link>
              <a href="#how-it-works" className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4">
                Watch Demo
              </a>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-gray-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium">Join <span className="text-gray-900 font-bold">2,000+</span> skill swappers today</p>
            </div>
          </div>
          
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
               <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="People learning together" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 animate-bounce transition-all duration-1000" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <HiCheckCircle className="text-green-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Matching Found!</p>
                  <p className="text-sm font-bold text-gray-800">React &lt;&gt; Design</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-10 -left-10 bg-[#FF6584] p-6 rounded-2xl shadow-xl z-20 text-white animate-pulse">
               <HiChatBubbleLeftRight className="w-8 h-8 mb-2" />
               <p className="font-bold">12 New Messages</p>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Trading skills is easier than you think</h2>
            <p className="text-lg text-gray-600">Our platform matches your expertise with what you want to learn, creating a win-win partnership for everyone.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
             <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
             <Step 
                number="1"
                title="List your skills"
                description="Tell us what you're good at and what you're eager to learn. Our AI takes care of the rest."
             />
             <Step 
                number="2"
                title="Get matched"
                description="Browse curated matches of people who have what you want and want what you have."
             />
             <Step 
                number="3"
                title="Start swapping"
                description="Connect via our secure chat and schedule your first peer-to-peer session."
             />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={HiAcademicCap}
              title="Verified Experts"
              description="Our community peer-reviews skills to ensure you're learning from the best in the field."
              delay="0.1s"
            />
            <FeatureCard 
              icon={HiChatBubbleLeftRight}
              title="Seamless Chat"
              description="Coordinate sessions and share resources through our built-in real-time collaboration tools."
              delay="0.2s"
            />
            <FeatureCard 
              icon={HiRocketLaunch}
              title="Global Network"
              description="Connect with experts from around the world, across any timezone or industry."
              delay="0.3s"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#6C63FF] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-purple-300">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
           
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 relative z-10">Ready to level up your skills?</h2>
           <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto relative z-10">
             Join 2,000+ professionals who are already swapping knowledge and growing their careers.
           </p>
           <Link to="/register" className="inline-block bg-white text-[#6C63FF] font-bold text-xl px-10 py-5 rounded-2xl hover:scale-105 transition-transform duration-300 relative z-10 shadow-xl">
             Create Your Free Account
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <HiBolt className="text-[#6C63FF] w-6 h-6" />
            <span className="text-xl font-bold tracking-tight text-gray-800">SkillSwap</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 SkillSwap. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-[#6C63FF]">Privacy Policy</a>
            <a href="#" className="hover:text-[#6C63FF]">Terms of Service</a>
            <a href="#" className="hover:text-[#6C63FF]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
