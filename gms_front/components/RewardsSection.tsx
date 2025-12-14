import { useState } from 'react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
    Trophy,
    Award,
    Target,
    Users,
    Calendar,
    Flame,
    Star,
    Gift,
    Zap,
    Crown,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner@2.0.3";

export type UserBadge = {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
};

export type Achievement = {
    id: string;
    name: string;
    description: string;
    points: number;
    progress: number;
    total: number;
    category: 'workout' | 'challenge' | 'referral' | 'streak';
};

export type Reward = {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    type: 'discount' | 'gift';
};

export type UserRewards = {
    totalPoints: number;
    lifetimePoints: number;
    badges: UserBadge[];
    achievements: Achievement[];
};

interface RewardsSectionProps {
    rewards: UserRewards;
    onEarnPoints?: (points: number, activity: string) => void;
    onRedeemReward?: (reward: Reward) => void;
}

const AVAILABLE_REWARDS: Reward[] = [
    { id: '1', name: '10% Off Next Month', description: 'Get 10% discount on your next membership payment', pointsCost: 100, type: 'discount' },
    { id: '2', name: 'Free Personal Training Session', description: 'One complimentary 1-hour training session', pointsCost: 200, type: 'gift' },
    { id: '3', name: 'GMS Water Bottle', description: 'Premium stainless steel water bottle', pointsCost: 150, type: 'gift' },
    { id: '4', name: '20% Off Merchandise', description: 'Discount on any GMS branded merchandise', pointsCost: 250, type: 'discount' },
    { id: '5', name: 'Gym Bag', description: 'Premium GMS gym bag with multiple compartments', pointsCost: 300, type: 'gift' },
    { id: '6', name: 'Supplement Package', description: 'Starter pack of premium supplements', pointsCost: 400, type: 'gift' },
];

export function RewardsSection({ rewards, onEarnPoints, onRedeemReward }: RewardsSectionProps) {
    const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'redeem'>('overview');

    const handleRedeemReward = (reward: Reward) => {
        if (rewards.totalPoints >= reward.pointsCost) {
            onRedeemReward?.(reward);
            toast.success(`Successfully redeemed: ${reward.name}!`, {
                description: 'Check your email for redemption details.'
            });
        } else {
            toast.error('Insufficient points', {
                description: `You need ${reward.pointsCost - rewards.totalPoints} more points.`
            });
        }
    };

    const getBadgeIcon = (iconName: string) => {
        const icons: { [key: string]: JSX.Element } = {
            'trophy': <Trophy className="w-6 h-6" />,
            'flame': <Flame className="w-6 h-6" />,
            'star': <Star className="w-6 h-6" />,
            'crown': <Crown className="w-6 h-6" />,
            'target': <Target className="w-6 h-6" />,
            'zap': <Zap className="w-6 h-6" />,
        };
        return icons[iconName] || <Award className="w-6 h-6" />;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'workout': return <Calendar className="w-4 h-4" />;
            case 'challenge': return <Trophy className="w-4 h-4" />;
            case 'referral': return <Users className="w-4 h-4" />;
            case 'streak': return <Flame className="w-4 h-4" />;
            default: return <Target className="w-4 h-4" />;
        }
    };

    const nextMilestone = Math.ceil((rewards.totalPoints + 1) / 100) * 100;
    const milestoneProgress = (rewards.totalPoints / nextMilestone) * 100;

    return (
        <div className="space-y-6">
            {/* Points Overview Header */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white">Available Points</h3>
                    </div>
                    <p className="text-4xl text-white">{rewards.totalPoints}</p>
                    <p className="text-sm text-orange-100 mt-1">Redeem for rewards</p>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Trophy className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-white">Lifetime Points</h3>
                    </div>
                    <p className="text-4xl text-white">{rewards.lifetimePoints}</p>
                    <p className="text-sm text-gray-400 mt-1">Total earned</p>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Award className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-white">Badges Earned</h3>
                    </div>
                    <p className="text-4xl text-white">
                        {rewards.badges.filter(b => b.earned).length} / {rewards.badges.length}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Achievements unlocked</p>
                </Card>
            </div>

            {/* Next Milestone */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white">Next Milestone</h3>
                    <span className="text-sm text-gray-400">{rewards.totalPoints} / {nextMilestone} points</span>
                </div>
                <Progress value={milestoneProgress} className="h-3" />
                <p className="text-sm text-gray-400 mt-2">
                    {nextMilestone - rewards.totalPoints} points until next reward tier
                </p>
            </Card>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-zinc-800">
                <button
                    onClick={() => setSelectedTab('overview')}
                    className={`px-4 py-2 transition-colors ${
                        selectedTab === 'overview'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Badges
                </button>
                <button
                    onClick={() => setSelectedTab('achievements')}
                    className={`px-4 py-2 transition-colors ${
                        selectedTab === 'achievements'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Achievements
                </button>
                <button
                    onClick={() => setSelectedTab('redeem')}
                    className={`px-4 py-2 transition-colors ${
                        selectedTab === 'redeem'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Redeem Points
                </button>
            </div>

            {/* Badges Tab */}
            {selectedTab === 'overview' && (
                <div className="grid md:grid-cols-3 gap-4">
                    {rewards.badges.map((badge) => (
                        <Card
                            key={badge.id}
                            className={`p-6 transition-all ${
                                badge.earned
                                    ? 'bg-zinc-900 border-orange-500'
                                    : 'bg-zinc-900 border-zinc-800 opacity-50'
                            }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`p-4 rounded-full mb-3 ${
                                    badge.earned ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-800 text-gray-500'
                                }`}>
                                    {getBadgeIcon(badge.icon)}
                                </div>
                                <h3 className="text-white mb-1">{badge.name}</h3>
                                <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
                                {badge.earned ? (
                                    <div className="flex items-center gap-1 text-orange-500 text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Earned {badge.earnedDate}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-500">Not earned yet</span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Achievements Tab */}
            {selectedTab === 'achievements' && (
                <div className="space-y-4">
                    {rewards.achievements.map((achievement) => {
                        const progressPercent = (achievement.progress / achievement.total) * 100;
                        const isComplete = achievement.progress >= achievement.total;

                        return (
                            <Card key={achievement.id} className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            isComplete ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-800 text-gray-400'
                                        }`}>
                                            {getCategoryIcon(achievement.category)}
                                        </div>
                                        <div>
                                            <h3 className="text-white mb-1">{achievement.name}</h3>
                                            <p className="text-sm text-gray-400">{achievement.description}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${
                                        isComplete ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-gray-300'
                                    }`}>
                                        {achievement.points} pts
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Progress</span>
                                        <span className={isComplete ? 'text-orange-500' : 'text-white'}>
                      {achievement.progress} / {achievement.total}
                    </span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                </div>

                                {isComplete && (
                                    <div className="mt-3 flex items-center gap-2 text-orange-500 text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Completed!</span>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Redeem Points Tab */}
            {selectedTab === 'redeem' && (
                <div>
                    <div className="mb-6">
                        <h3 className="text-xl text-white mb-2">Available Rewards</h3>
                        <p className="text-gray-400">Use your points to redeem exclusive rewards and discounts</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {AVAILABLE_REWARDS.map((reward) => {
                            const canAfford = rewards.totalPoints >= reward.pointsCost;

                            return (
                                <Card key={reward.id} className="bg-zinc-900 border-zinc-800 p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className={`p-2 rounded-lg ${
                                            canAfford ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-800 text-gray-500'
                                        }`}>
                                            <Gift className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white mb-1">{reward.name}</h3>
                                            <p className="text-sm text-gray-400">{reward.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-orange-500" />
                                            <span className="text-white">{reward.pointsCost} points</span>
                                        </div>
                                        <Button
                                            onClick={() => handleRedeemReward(reward)}
                                            disabled={!canAfford}
                                            className={`${
                                                canAfford
                                                    ? 'bg-orange-500 hover:bg-orange-600'
                                                    : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                            size="sm"
                                        >
                                            Redeem
                                        </Button>
                                    </div>

                                    {!canAfford && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Need {reward.pointsCost - rewards.totalPoints} more points
                                        </p>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* How to Earn Points */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-white mb-4">How to Earn Points</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-white mb-1">Attend Workouts</p>
                            <p className="text-sm text-gray-400">10 points per session</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Trophy className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-white mb-1">Complete Challenges</p>
                            <p className="text-sm text-gray-400">50-100 points each</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-white mb-1">Refer Friends</p>
                            <p className="text-sm text-gray-400">100 points per referral</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
