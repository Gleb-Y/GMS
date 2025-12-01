import { useState } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Dumbbell, LogOut, CreditCard, Key, Calendar as CalendarIcon, MessageSquare, Award, TrendingUp, Star, User } from "lucide-react";
import type { User } from '../App';
import { RewardsSection, type UserRewards, type Reward } from './RewardsSection';
import { ProgressTracking, type ProgressData } from './ProgressTracking';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MemberDashboardProps {
    user: User;
    onLogout: () => void;
}

type Booking = {
    id: string;
    type: string;
    date: string;
    time: string;
    trainer?: string;
};

export function MemberDashboard({ user, onLogout }: MemberDashboardProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [bookings, setBookings] = useState<Booking[]>([
        { id: '1', type: 'Personal Training', date: '2025-11-08', time: '10:00 AM', trainer: 'Kalinenko Miroslav' }
    ]);
    const [hasLocker, setHasLocker] = useState(false);
    const [lockerNumber, setLockerNumber] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
        { role: 'assistant', content: 'Hello! I\'m your AI fitness assistant. How can I help you today?' }
    ]);
    const [chatInput, setChatInput] = useState('');

    // Initialize rewards data
    const [userRewards, setUserRewards] = useState<UserRewards>(user.rewards || {
        totalPoints: 350,
        lifetimePoints: 850,
        badges: [
            { id: '1', name: 'First Workout', description: 'Complete your first training session', icon: 'trophy', earned: true, earnedDate: '10/15/2025' },
            { id: '2', name: 'Week Warrior', description: 'Train 5 days in a week', icon: 'flame', earned: true, earnedDate: '10/22/2025' },
            { id: '3', name: 'Century Club', description: 'Earn 100 total points', icon: 'star', earned: true, earnedDate: '10/28/2025' },
            { id: '4', name: 'Challenge Master', description: 'Complete 3 fitness challenges', icon: 'crown', earned: false },
            { id: '5', name: 'Social Butterfly', description: 'Refer 3 friends to GMS', icon: 'target', earned: false },
            { id: '6', name: 'Consistency King', description: 'Maintain a 30-day workout streak', icon: 'zap', earned: false },
        ],
        achievements: [
            { id: '1', name: 'Workout Enthusiast', description: 'Attend 10 workout sessions', points: 50, progress: 7, total: 10, category: 'workout' },
            { id: '2', name: 'Challenge Champion', description: 'Complete 5 fitness challenges', points: 100, progress: 2, total: 5, category: 'challenge' },
            { id: '3', name: 'Referral Expert', description: 'Refer 5 friends to join GMS', points: 200, progress: 1, total: 5, category: 'referral' },
            { id: '4', name: 'Streak Master', description: 'Maintain a 14-day workout streak', points: 75, progress: 9, total: 14, category: 'streak' },
            { id: '5', name: 'Class Hero', description: 'Attend 20 group classes', points: 80, progress: 12, total: 20, category: 'workout' },
            { id: '6', name: 'Friend Magnet', description: 'Refer 10 friends to GMS', points: 500, progress: 1, total: 10, category: 'referral' },
        ]
    });

    // Initialize progress tracking data
    const [progressData, setProgressData] = useState<ProgressData>(() => {
        if (user.progressData) return user.progressData;

        return {
            bodyMeasurements: [
                { id: '1', date: '2025-10-01', weight: 82.5, bodyFat: 20.5, muscleMass: 35.2, bmi: 24.8 },
                { id: '2', date: '2025-10-08', weight: 81.8, bodyFat: 19.8, muscleMass: 35.5, bmi: 24.6 },
                { id: '3', date: '2025-10-15', weight: 81.0, bodyFat: 19.2, muscleMass: 35.8, bmi: 24.3 },
                { id: '4', date: '2025-10-22', weight: 80.5, bodyFat: 18.9, muscleMass: 36.0, bmi: 24.2 },
                { id: '5', date: '2025-10-29', weight: 79.8, bodyFat: 18.5, muscleMass: 36.2, bmi: 24.0 },
                { id: '6', date: '2025-11-05', weight: 79.2, bodyFat: 18.1, muscleMass: 36.5, bmi: 23.8 },
            ],
            workoutLogs: [
                { id: '1', date: '2025-11-01', exercise: 'Bench Press', sets: 4, reps: 10, weight: 80, notes: 'Felt strong' },
                { id: '2', date: '2025-11-01', exercise: 'Squats', sets: 4, reps: 8, weight: 100, notes: '' },
                { id: '3', date: '2025-11-03', exercise: 'Deadlift', sets: 3, reps: 6, weight: 120, notes: 'New PR!' },
                { id: '4', date: '2025-11-03', exercise: 'Shoulder Press', sets: 3, reps: 12, weight: 40, notes: '' },
                { id: '5', date: '2025-11-05', exercise: 'Bench Press', sets: 4, reps: 10, weight: 82.5, notes: 'Increased weight' },
                { id: '6', date: '2025-11-05', exercise: 'Pull-ups', sets: 3, reps: 10, weight: 0, notes: 'Bodyweight' },
                { id: '7', date: '2025-11-07', exercise: 'Squats', sets: 4, reps: 8, weight: 105, notes: 'Good form' },
                { id: '8', date: '2025-11-07', exercise: 'Leg Press', sets: 3, reps: 15, weight: 180, notes: '' },
            ],
            cardioSessions: [
                { id: '1', date: '2025-11-02', type: 'Running', duration: 30, distance: 5.2, calories: 320, avgHeartRate: 145 },
                { id: '2', date: '2025-11-04', type: 'Cycling', duration: 45, distance: 15.8, calories: 380, avgHeartRate: 135 },
                { id: '3', date: '2025-11-06', type: 'Running', duration: 35, distance: 6.0, calories: 350, avgHeartRate: 148 },
                { id: '4', date: '2025-11-08', type: 'Elliptical', duration: 25, calories: 280, avgHeartRate: 140 },
                { id: '5', date: '2025-11-09', type: 'Swimming', duration: 40, distance: 1.5, calories: 420, avgHeartRate: 130 },
            ],
            wearableData: {
                connected: false
            },
            goals: {
                targetWeight: 75,
                targetBodyFat: 15,
                weeklyWorkouts: 5
            }
        };
    });

    const handleRentLocker = () => {
        const randomLocker = Math.floor(Math.random() * 50) + 1;
        setLockerNumber(randomLocker.toString());
        setHasLocker(true);
    };

    const handleCancelLocker = () => {
        setHasLocker(false);
        setLockerNumber(null);
    };

    const handleBookSession = (type: string, time: string) => {
        if (selectedDate) {
            const trainerMap: { [key: string]: string } = {
                'Personal Training': 'Kalinenko Miroslav',
                'Group Class - Yoga': 'Chernyh Nikolai',
                'Group Class - HIIT': 'Donetskaya Viktoriya'
            };

            const newBooking: Booking = {
                id: Date.now().toString(),
                type,
                date: selectedDate.toISOString().split('T')[0],
                time,
                trainer: trainerMap[type] || undefined
            };
            setBookings([...bookings, newBooking]);
        }
    };

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setChatMessages([...chatMessages, { role: 'user', content: chatInput }]);

        // Mock AI response
        setTimeout(() => {
            const responses = [
                'Based on your goals, I recommend focusing on compound exercises like squats, deadlifts, and bench press.',
                'Make sure to stay hydrated and get enough protein - aim for 1g per pound of body weight.',
                'Great question! Recovery is just as important as training. Make sure you\\\'re getting 7-9 hours of sleep.',
                'For fat loss, combine resistance training with 20-30 minutes of cardio 3-4 times per week.',
                'Progressive overload is key. Try to increase weight or reps gradually each week.'
            ];
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: responses[Math.floor(Math.random() * responses.length)]
            }]);
        }, 1000);

        setChatInput('');
    };

    const handleEarnPoints = (points: number, activity: string) => {
        setUserRewards(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + points,
            lifetimePoints: prev.lifetimePoints + points
        }));
        toast.success(`+${points} points earned!`, {
            description: `Great job on ${activity}!`
        });
    };

    const handleRedeemReward = (reward: Reward) => {
        setUserRewards(prev => ({
            ...prev,
            totalPoints: prev.totalPoints - reward.pointsCost
        }));
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Navigation */}
            <nav className="bg-zinc-900 border-b border-zinc-800">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-orange-500" />
                        <span className="text-xl tracking-wide">GMS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white">{user.name}</span>
                        <Button
                            onClick={onLogout}
                            variant="outline"
                            className="border-zinc-700 hover:bg-zinc-800"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl mb-2 text-white">Welcome, {user.name}!</h1>
                    {user.membership && (
                        <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500 text-white">
                                {user.membership.plan}
                            </Badge>
                            <span className="text-gray-300">
                Valid until {new Date(user.membership.endDate).toLocaleDateString()}
              </span>
                        </div>
                    )}
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="progress"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Progress
                        </TabsTrigger>
                        <TabsTrigger
                            value="rewards"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Rewards
                        </TabsTrigger>
                        <TabsTrigger
                            value="booking"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Book Training
                        </TabsTrigger>
                        <TabsTrigger
                            value="locker"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Locker Rental
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            AI Assistant
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-xl text-white">My Membership</h2>
                                </div>
                                {user.membership ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Plan:</span>
                                            <span className="text-white">{user.membership.plan}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Start Date:</span>
                                            <span className="text-white">{new Date(user.membership.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">End Date:</span>
                                            <span className="text-white">{new Date(user.membership.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No active membership</p>
                                )}
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Key className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-xl text-white">Locker Status</h2>
                                </div>
                                {hasLocker ? (
                                    <div className="space-y-2">
                                        <p className="text-2xl text-orange-500">Locker #{lockerNumber}</p>
                                        <p className="text-gray-300">Your locker is active</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-300">No locker rented</p>
                                )}
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800 p-6 md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <CalendarIcon className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-xl text-white">My Bookings</h2>
                                </div>
                                {bookings.length > 0 ? (
                                    <div className="space-y-3">
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="text-lg text-white">{booking.type}</p>
                                                    {booking.trainer && (
                                                        <p className="text-sm text-gray-300">Trainer: {booking.trainer}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-orange-500">{booking.date}</p>
                                                    <p className="text-sm text-gray-300">{booking.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-300">No upcoming bookings</p>
                                )}
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="progress">
                        <ProgressTracking
                            data={progressData}
                            onUpdateData={setProgressData}
                        />
                    </TabsContent>

                    <TabsContent value="rewards">
                        <RewardsSection
                            rewards={userRewards}
                            onEarnPoints={handleEarnPoints}
                            onRedeemReward={handleRedeemReward}
                        />
                    </TabsContent>

                    <TabsContent value="booking">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <h2 className="text-2xl mb-4 text-white">Select Date</h2>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border border-zinc-800"
                                />

                                {/* View Trainers Button */}
                                <div className="mt-6">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700">
                                                <User className="w-4 h-4 mr-2" />
                                                View Trainers
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[85vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl text-white">Our Professional Trainers</DialogTitle>
                                            </DialogHeader>

                                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                                {trainersData.map((trainer) => (
                                                    <Card key={trainer.id} className="bg-zinc-800 border-zinc-700 overflow-hidden">
                                                        <div className="aspect-[4/3] overflow-hidden">
                                                            <ImageWithFallback
                                                                src={trainer.image}
                                                                alt={trainer.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h3 className="text-xl text-white mb-1">{trainer.name}</h3>
                                                                    <Badge className="bg-orange-500/20 text-orange-500 border-orange-500">
                                                                        {trainer.specialization}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                                                                    <span className="text-white">{trainer.rating}</span>
                                                                </div>
                                                            </div>

                                                            <p className="text-gray-300 text-sm mt-3 mb-3">{trainer.bio}</p>

                                                            <div className="space-y-2 mb-4">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Dumbbell className="w-4 h-4 text-orange-500" />
                                                                    <span className="text-gray-300">{trainer.experience} years experience</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <User className="w-4 h-4 text-orange-500" />
                                                                    <span className="text-gray-300">{trainer.clients} active clients</span>
                                                                </div>
                                                            </div>

                                                            {/* Certifications */}
                                                            <div className="mb-4">
                                                                <p className="text-xs text-gray-400 mb-2">Certifications:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {trainer.certifications.map((cert, idx) => (
                                                                        <Badge key={idx} variant="outline" className="border-zinc-600 text-xs">
                                                                            {cert}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Reviews */}
                                                            <div className="border-t border-zinc-700 pt-3">
                                                                <p className="text-sm text-gray-400 mb-2">Recent Reviews:</p>
                                                                <div className="space-y-2">
                                                                    {trainer.reviews.slice(0, 2).map((review, idx) => (
                                                                        <div key={idx} className="bg-zinc-900 p-2 rounded text-xs">
                                                                            <div className="flex items-center gap-1 mb-1">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <Star
                                                                                        key={i}
                                                                                        className={`w-3 h-3 ${i < review.stars ? 'fill-orange-500 text-orange-500' : 'text-zinc-600'}`}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                            <p className="text-gray-300">"{review.comment}"</p>
                                                                            <p className="text-gray-500 mt-1">- {review.client}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <h2 className="text-2xl mb-4 text-white">Available Sessions</h2>
                                <p className="text-gray-300 mb-4">
                                    {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                                </p>
                                <div className="space-y-3">
                                    {availableSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="bg-zinc-800 p-4 rounded-lg border border-zinc-700"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-lg text-white">{session.type}</p>
                                                <Badge variant="outline" className="border-orange-500 text-orange-500">
                                                    {session.time}
                                                </Badge>
                                            </div>
                                            {session.trainer && (
                                                <p className="text-sm text-gray-300 mb-3">With {session.trainer}</p>
                                            )}
                                            <Button
                                                onClick={() => handleBookSession(session.type, session.time)}
                                                className="w-full bg-orange-500 hover:bg-orange-600"
                                                disabled={!selectedDate}
                                            >
                                                Book Session
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="locker">
                        <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <Key className="w-6 h-6 text-orange-500" />
                                <h2 className="text-2xl text-white">Locker Rental</h2>
                            </div>

                            {hasLocker ? (
                                <div className="space-y-6">
                                    <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 text-center">
                                        <p className="text-gray-300 mb-2">Your Locker Number</p>
                                        <p className="text-5xl text-orange-500 mb-4">#{lockerNumber}</p>
                                        <p className="text-gray-300">Located in the main locker room</p>
                                    </div>
                                    <Button
                                        onClick={handleCancelLocker}
                                        variant="outline"
                                        className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                                    >
                                        Cancel Locker Rental
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                                        <h3 className="text-xl mb-4 text-white">Rent a Locker</h3>
                                        <p className="text-gray-300 mb-4">
                                            Secure storage for your belongings while you work out. Available 24/7 with your membership.
                                        </p>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Monthly Rate:</span>
                                                <span className="text-orange-500">$10/month</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Available Lockers:</span>
                                                <span className="text-white">32 / 50</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleRentLocker}
                                            className="w-full bg-orange-500 hover:bg-orange-600"
                                        >
                                            Rent Locker Now
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="ai">
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Chat Area */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-zinc-900 border-zinc-800 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-6 h-6 text-orange-500" />
                                            <h2 className="text-2xl text-white">AI Fitness Assistant</h2>
                                        </div>
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500">
                                            Online
                                        </Badge>
                                    </div>

                                    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4 h-96 overflow-y-auto mb-4">
                                        <div className="space-y-4">
                                            {chatMessages.map((message, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] p-3 rounded-lg ${
                                                            message.role === 'user'
                                                                ? 'bg-orange-500 text-white'
                                                                : 'bg-zinc-700 text-white'
                                                        }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Ask me about workouts, nutrition, or fitness advice..."
                                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-orange-500"
                                        />
                                        <Button
                                            type="submit"
                                            className="bg-orange-500 hover:bg-orange-600"
                                        >
                                            Send
                                        </Button>
                                    </form>

                                    <div className="mt-4 pt-4 border-t border-zinc-800">
                                        <p className="text-sm text-gray-300 mb-3">Quick Actions:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedQuestions.map((question, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setChatInput(question)}
                                                    className="text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full border border-zinc-700 transition-colors text-white"
                                                >
                                                    {question}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                {/* AI Generated Workout Plan */}
                                <Card className="bg-zinc-900 border-zinc-800 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl text-white">AI-Generated Workout Plan</h3>
                                        <Button
                                            onClick={() => {
                                                toast.success('New workout plan generated!', {
                                                    description: 'Your personalized plan is ready'
                                                });
                                            }}
                                            size="sm"
                                            className="bg-orange-500 hover:bg-orange-600"
                                        >
                                            Generate New Plan
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-4">Based on your goals and progress data:</p>
                                    <div className="space-y-3">
                                        {[
                                            { day: 'Monday', focus: 'Upper Body Strength', exercises: 'Bench Press, Rows, Shoulder Press', duration: '60 min' },
                                            { day: 'Wednesday', focus: 'Lower Body Power', exercises: 'Squats, Deadlifts, Lunges', duration: '60 min' },
                                            { day: 'Friday', focus: 'Full Body HIIT', exercises: 'Circuit Training, Cardio Intervals', duration: '45 min' }
                                        ].map((workout, idx) => (
                                            <div key={idx} className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-orange-500">{workout.day}</span>
                                                    <span className="text-xs text-gray-400">{workout.duration}</span>
                                                </div>
                                                <h4 className="text-white mb-1">{workout.focus}</h4>
                                                <p className="text-sm text-gray-300">{workout.exercises}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            {/* Sidebar Features */}
                            <div className="space-y-6">
                                {/* AI Insights */}
                                <Card className="bg-zinc-900 border-zinc-800 p-6">
                                    <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-orange-500" />
                                        AI Insights
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg">
                                            <p className="text-xs text-orange-400 mb-1">Progress Alert</p>
                                            <p className="text-sm text-white">You're 70% to your workout goal! 3 more sessions this week.</p>
                                        </div>
                                        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                                            <p className="text-xs text-blue-400 mb-1">Recommendation</p>
                                            <p className="text-sm text-white">Your bench press is improving! Consider increasing weight by 2.5kg.</p>
                                        </div>
                                        <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                                            <p className="text-xs text-green-400 mb-1">Achievement</p>
                                            <p className="text-sm text-white">New PR! You've lost 3.3kg in the last 5 weeks.</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Nutrition Suggestions */}
                                <Card className="bg-zinc-900 border-zinc-800 p-6">
                                    <h3 className="text-lg text-white mb-4">Daily Nutrition Goals</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-300">Protein</span>
                                                <span className="text-white">120g / 150g</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-300">Carbs</span>
                                                <span className="text-white">180g / 250g</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-300">Calories</span>
                                                <span className="text-white">1850 / 2200</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setChatInput('Create a meal plan for muscle gain');
                                        }}
                                        variant="outline"
                                        className="w-full mt-4 border-zinc-700 text-white hover:bg-zinc-800"
                                    >
                                        Get Meal Plan
                                    </Button>
                                </Card>

                                {/* AI Features */}
                                <Card className="bg-zinc-900 border-zinc-800 p-6">
                                    <h3 className="text-lg text-white mb-4">AI Features</h3>
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => {
                                                toast.success('Analyzing your progress...', {
                                                    description: 'Generating personalized report'
                                                });
                                            }}
                                            variant="outline"
                                            className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                                        >
                                            📊 Progress Analysis
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                toast.success('Injury prevention tips generated!');
                                            }}
                                            variant="outline"
                                            className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                                        >
                                            🛡️ Injury Prevention
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setChatInput('What supplements should I take?');
                                            }}
                                            variant="outline"
                                            className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                                        >
                                            💊 Supplement Guide
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                toast.success('Form check requested!', {
                                                    description: 'Upload a video for AI analysis'
                                                });
                                            }}
                                            variant="outline"
                                            className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                                        >
                                            🎥 Form Check AI
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

const availableSessions = [
    { id: '1', type: 'Personal Training', time: '10:00 AM', trainer: 'Kalinenko Miroslav' },
    { id: '2', type: 'Personal Training', time: '2:00 PM', trainer: 'Gazhdenbekovna Liza' },
    { id: '3', type: 'Group Class - Yoga', time: '6:00 PM', trainer: 'Chernyh Nikolai' },
    { id: '4', type: 'Group Class - HIIT', time: '7:30 PM', trainer: 'Donetskaya Viktoriya' },
];

const suggestedQuestions = [
    'Best exercises for beginners?',
    'How to lose weight effectively?',
    'Meal plan for muscle gain?',
    'Recovery tips after workout?'
];

const trainersData = [
    {
        id: '1',
        name: 'Kalinenko Miroslav',
        specialization: 'Strength Training',
        rating: 4.8,
        bio: 'Certified strength and conditioning coach specializing in powerlifting and athletic performance. Helped 100+ clients achieve their strength goals.',
        experience: 10,
        clients: 52,
        certifications: ['NSCA-CSCS', 'ISSA-CPT', 'Precision Nutrition Level 1'],
        reviews: [
            { client: 'Yurtaev Gleb', comment: 'Best trainer I\'ve ever had! Helped me increase my deadlift by 40kg in 6 months.', stars: 5 },
            { client: 'Anton Petrov', comment: 'Miroslav really knows his stuff. Great form corrections and programming.', stars: 5 },
            { client: 'Marina Volkova', comment: 'Professional and results-driven. Highly recommend!', stars: 4 }
        ],
        image: 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5lciUyMG1hbnxlbnwxfHx8fDE3NjI4MTQ0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '2',
        name: 'Gazhdenbekovna Liza',
        specialization: 'Weight Loss & Cardio',
        rating: 4.9,
        bio: 'Expert in body transformation and cardiovascular training. Passionate about helping clients achieve sustainable fat loss and improved fitness.',
        experience: 8,
        clients: 47,
        certifications: ['ACE-CPT', 'NASM-WLS', 'TRX Certified'],
        reviews: [
            { client: 'Elena Kuznetsova', comment: 'Lost 15kg in 4 months with Liza\'s guidance. She\'s amazing!', stars: 5 },
            { client: 'Dmitry Sokolov', comment: 'Very motivating and knows exactly how to push you. Great results!', stars: 5 },
            { client: 'Natasha Ivanova', comment: 'Professional approach and always energetic!', stars: 4 }
        ],
        image: 'https://images.unsplash.com/photo-1589860518300-9eac95f784d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5lciUyMHdvbWFufGVufDF8fHx8MTc2Mjg5NDY5OXww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '3',
        name: 'Chernyh Nikolai',
        specialization: 'Yoga & Flexibility',
        rating: 4.9,
        bio: 'Experienced yoga instructor focusing on flexibility, mindfulness, and recovery. Certified in multiple yoga styles including Vinyasa and Hatha.',
        experience: 12,
        clients: 65,
        certifications: ['RYT-500', 'Yoga Alliance', 'Meditation Teacher'],
        reviews: [
            { client: 'Irina Smirnova', comment: 'Nikolai\'s yoga classes are transformative. My flexibility has improved dramatically!', stars: 5 },
            { client: 'Pavel Morozov', comment: 'Excellent instructor with deep knowledge. Very calming presence.', stars: 5 },
            { client: 'Olga Lebedeva', comment: 'Perfect balance of challenge and relaxation.', stars: 5 }
        ],
        image: 'https://images.unsplash.com/photo-1692182549439-2a78c119dc40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvcnxlbnwxfHx8fDE3NjI4MDc1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '4',
        name: 'Donetskaya Viktoriya',
        specialization: 'HIIT & Functional Training',
        rating: 4.7,
        bio: 'High-intensity interval training specialist with expertise in functional fitness. Known for creative and challenging workout programs.',
        experience: 7,
        clients: 43,
        certifications: ['NASM-CPT', 'CrossFit Level 2', 'Kettlebell Instructor'],
        reviews: [
            { client: 'Sergey Popov', comment: 'Viktoriya\'s HIIT classes are intense but incredibly effective!', stars: 5 },
            { client: 'Anna Kozlova', comment: 'Love her energy and enthusiasm. Never a boring session!', stars: 4 },
            { client: 'Maxim Vasiliev', comment: 'Great trainer who really pushes you to your limits.', stars: 5 }
        ],
        image: 'https://images.unsplash.com/photo-1540205453279-389ebbc43b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBjb2FjaHxlbnwxfHx8fDE3NjI4OTQ2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
];