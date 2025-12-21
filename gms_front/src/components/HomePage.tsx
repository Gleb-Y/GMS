import { Button } from "./ui/button";
import { Dumbbell, Users, Zap, Trophy, ChevronRight } from "lucide-react";

interface HomePageProps {
    onLoginClick: () => void;
}

export function HomePage({ onLoginClick }: HomePageProps) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-zinc-900/80 backdrop-blur-sm z-50 border-b border-zinc-800">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-orange-500" />
                        <span className="text-xl tracking-wide">GMS</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#home" className="hover:text-orange-500 transition-colors">Home</a>
                        <a href="#program" className="hover:text-orange-500 transition-colors">Program</a>
                        <a href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</a>
                        <a href="#about" className="hover:text-orange-500 transition-colors">About</a>
                        <a href="#contact" className="hover:text-orange-500 transition-colors">Contact</a>
                    </div>
                    <Button
                        onClick={onLoginClick}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        Join Now
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="pt-32 pb-20 px-6 relative">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1734458211458-4d508abf564e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwbWFufGVufDF8fHx8MTc2MjUxNjYzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Fitness Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
                </div>
                <div className="container mx-auto relative z-10">
                    <div className="max-w-2xl">
                        <p className="text-orange-500 mb-4 tracking-wide">BEST FITNESS IN THE TOWN</p>
                        <h1 className="text-5xl md:text-7xl mb-6">
                            MAKE <span className="text-white">YOUR</span><br />
                            <span className="text-white">BODY SHAPE</span>
                        </h1>
                        <p className="text-gray-400 mb-8 max-w-lg">
                            Unleash your potential and embark on a journey towards a stronger, fitter, and more confident you. Sign up for 'Make Your Body Shape' now and witness the incredible transformation your body is capable of!
                        </p>
                        <Button
                            onClick={onLoginClick}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section id="program" className="py-20 px-6 bg-zinc-900/50">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-4xl">EXPLORE OUR PROGRAM</h2>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full border border-orange-500 flex items-center justify-center hover:bg-orange-500 transition-colors">
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-orange-500 flex items-center justify-center hover:bg-orange-500 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {programs.map((program, index) => (
                            <div
                                key={index}
                                className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 hover:border-orange-500 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                                    {program.icon}
                                </div>
                                <h3 className="text-xl mb-3">{program.title}</h3>
                                <p className="text-gray-400 text-sm mb-4">{program.description}</p>
                                <button className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                                    Join Now <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6">
                <div className="container mx-auto">
                    <h2 className="text-4xl text-center mb-4">OUR PRICING PLAN</h2>
                    <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                        Choose the plan that works best for you
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <div
                                key={index}
                                className="bg-zinc-800 p-8 rounded-lg border border-zinc-700 hover:border-orange-500 transition-colors"
                            >
                                <h3 className="text-xl mb-6">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl">${plan.price}</span>
                                    <span className="text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                            <span className="text-orange-500 mt-1">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    onClick={onLoginClick}
                                    className={index === 1 ? "w-full bg-orange-500 hover:bg-orange-600" : "w-full bg-zinc-700 hover:bg-zinc-600"}
                                >
                                    Join Now
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6 bg-zinc-900/50">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-4xl text-center mb-4">GET IN TOUCH</h2>
                    <p className="text-gray-400 text-center mb-12">
                        We'd love to hear from you. Send us a message!
                    </p>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl mb-2">Location</h3>
                                <p className="text-gray-400">Tole bi, 00, Almaty, Kazakhstan, 12345</p>
                            </div>
                            <div>
                                <h3 className="text-xl mb-2">Phone</h3>
                                <p className="text-gray-400">+7 (707) 707-0707</p>
                            </div>
                            <div>
                                <h3 className="text-xl mb-2">Email</h3>
                                <p className="text-gray-400">info@gms.com</p>
                            </div>
                            <div>
                                <h3 className="text-xl mb-2">Hours</h3>
                                <p className="text-gray-400">Mon-Fri: 6AM - 10PM</p>
                                <p className="text-gray-400">Sat-Sun: 8AM - 8PM</p>
                            </div>
                        </div>
                        <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                            <form className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
                                />
                                <textarea
                                    placeholder="Your Message"
                                    rows={4}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
                                />
                                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-900 border-t border-zinc-800 py-8 px-6">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <Dumbbell className="w-5 h-5 text-orange-500" />
                            <span className="tracking-wide">GMS</span>
                        </div>
                        <p className="text-gray-400 text-sm">© 2025 GMS. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const programs = [
    {
        icon: <Dumbbell className="w-6 h-6 text-orange-500" />,
        title: "Strength",
        description: "Build muscle mass and increase your overall strength with our comprehensive strength training program."
    },
    {
        icon: <Users className="w-6 h-6 text-orange-500" />,
        title: "Physical Fitness",
        description: "Improve your cardiovascular health, strength, flexibility, and endurance with varied workouts."
    },
    {
        icon: <Zap className="w-6 h-6 text-orange-500" />,
        title: "Fat Loss",
        description: "Burn calories, boost your metabolism, and achieve sustainable weight loss with expert guidance."
    },
    {
        icon: <Trophy className="w-6 h-6 text-orange-500" />,
        title: "Weight Gain",
        description: "Structured program offers an effective approach to gaining weight in a healthy and sustainable manner."
    }
];

const pricingPlans = [
    {
        name: "Basic Plan",
        price: 15,
        features: [
            "Access to gym facilities",
            "Standard equipment",
            "Locker room access",
            "1 guest pass per month"
        ]
    },
    {
        name: "Premium Plan",
        price: 35,
        features: [
            "All Basic Plan features",
            "Personal training (2x/month)",
            "Group classes included",
            "Nutrition consultation",
            "Locker rental available"
        ]
    },
    {
        name: "Elite Plan",
        price: 45,
        features: [
            "All Premium Plan features",
            "Unlimited personal training",
            "Priority class booking",
            "Meal planning service",
            "Free locker rental",
            "Recovery room access"
        ]
    }
];