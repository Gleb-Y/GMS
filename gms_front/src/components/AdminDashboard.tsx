import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dumbbell, Users, LogOut, UserPlus, Calendar, Key, Brain, AlertTriangle, Activity, CheckCircle, XCircle } from "lucide-react";
import type { User } from '../App';
import { Badge } from "./ui/badge";
import { toast } from 'sonner';
import { adminApi, userApi, membershipApi, userMembershipApi, type UserStatistics, type Membership } from './apiServices';

interface AdminDashboardProps {
    user: User;
    onLogout: () => void;
}

type NewUser = {
    email: string;
    name: string;
    membershipPlan: string;
    startDate: string;
};

type Member = {
    id: string;
    name: string;
    email: string;
    membership: string;
    joinDate: string;
    lockerNumber?: string;
};

type HighRiskPlanRequest = {
    id: string;
    memberName: string;
    memberEmail: string;
    requestType: string;
    requestDetails: string;
    date: string;
    riskLevel: 'high' | 'medium';
    status: 'pending' | 'approved' | 'rejected';
};

type AttendanceAlert = {
    id: string;
    memberName: string;
    memberEmail: string;
    membershipPlan: string;
    weeklyAttendance: number;
    totalSessionsThisMonth: number;
    averageSessionDuration: number;
    lastVisit: string;
    riskLevel: 'high' | 'medium' | 'low';
    notes: string;
};

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
    const [newUser, setNewUser] = useState<NewUser>({
        email: '',
        name: '',
        membershipPlan: '',
        startDate: ''
    });
    
    // State for real data
    const [members, setMembers] = useState<Member[]>([]);
    const [userStats, setUserStats] = useState<UserStatistics | null>(null);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Load data on mount
    useEffect(() => {
        loadDashboardData();
        loadMemberships();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsResponse, expiringResponse] = await Promise.all([
                adminApi.getUserStatistics(),
                adminApi.getExpiringMemberships(365) // Get all memberships for the year
            ]);
            
            setUserStats(statsResponse.data);
            
            // Convert expiring memberships to members list
            if (expiringResponse.data && Array.isArray(expiringResponse.data)) {
                const membersList = expiringResponse.data.map((item: any) => ({
                    id: item.userId?.toString() || item.id?.toString(),
                    name: item.userName || item.name || 'N/A',
                    email: item.userEmail || item.email || 'N/A',
                    membership: item.membershipName || item.plan || 'N/A',
                    joinDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A',
                }));
                setMembers(membersList);
            }
        } catch (error: any) {
            console.error('Error loading dashboard data:', error);
            toast.error('Не удалось загрузить данные дашборда');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }
        
        setLoading(true);
        try {
            await adminApi.deleteUser(Number(memberId));
            
            // Удалить из локального списка
            setMembers(members.filter(m => m.id !== memberId));
            
            toast.success('Пользователь успешно удалён');
            
            // Обновить статистику
            await loadDashboardData();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data || 'Не удалось удалить пользователя');
        } finally {
            setLoading(false);
        }
    };

    const loadMemberships = async () => {
        try {
            const response = await membershipApi.getActiveMemberships();
            setMemberships(response.data.data);
        } catch (error: any) {
            console.error('Error loading memberships:', error);
        }
    };

    // High-risk plan requests from AI assistant
    const [highRiskPlans, setHighRiskPlans] = useState<HighRiskPlanRequest[]>([
        {
            id: '1',
            memberName: 'Yurtaev Gleb',
            memberEmail: 'member@gms.com',
            requestType: 'Extreme Weight Loss Plan',
            requestDetails: 'Requested an aggressive 8-week transformation plan targeting 15kg weight loss. AI flagged due to rapid weight loss target (1.9kg/week) which exceeds safe recommendations.',
            date: '2025-11-28',
            riskLevel: 'high',
            status: 'pending'
        },
        {
            id: '2',
            memberName: 'Mike Johnson',
            memberEmail: 'mike@example.com',
            requestType: 'Advanced Powerlifting Protocol',
            requestDetails: 'Asked for a high-intensity powerlifting program with 6 days/week heavy lifting. Member history shows recent shoulder injury recovery.',
            date: '2025-11-29',
            riskLevel: 'high',
            status: 'pending'
        },
        {
            id: '3',
            memberName: 'Anna Kozlova',
            memberEmail: 'anna@example.com',
            requestType: 'Marathon Training - Beginner',
            requestDetails: 'Beginner requesting intensive marathon training starting at 50km/week. AI suggests gradual progression starting at 20km/week.',
            date: '2025-11-30',
            riskLevel: 'medium',
            status: 'pending'
        }
    ]);

    // Attendance tracking alerts
    const [attendanceAlerts, setAttendanceAlerts] = useState<AttendanceAlert[]>([
        {
            id: '1',
            memberName: 'Sergey Popov',
            memberEmail: 'sergey@example.com',
            membershipPlan: 'Elite Plan',
            weeklyAttendance: 14,
            totalSessionsThisMonth: 52,
            averageSessionDuration: 180,
            lastVisit: '2025-12-01',
            riskLevel: 'high',
            notes: 'Training 14 times per week (2x daily). Signs of overtraining - consider rest days and recovery program.'
        },
        {
            id: '2',
            memberName: 'Elena Kuznetsova',
            memberEmail: 'elena@example.com',
            membershipPlan: 'Premium Plan',
            weeklyAttendance: 11,
            totalSessionsThisMonth: 44,
            averageSessionDuration: 150,
            lastVisit: '2025-12-01',
            riskLevel: 'high',
            notes: 'Very high frequency (11 sessions/week). No rest days detected in past 3 weeks. Recommend intervention to prevent burnout.'
        },
        {
            id: '3',
            memberName: 'Pavel Morozov',
            memberEmail: 'pavel@example.com',
            membershipPlan: 'Premium Plan',
            weeklyAttendance: 8,
            totalSessionsThisMonth: 32,
            averageSessionDuration: 120,
            lastVisit: '2025-11-30',
            riskLevel: 'medium',
            notes: 'Above-average attendance. Monitor for sustainability - offer recovery sessions and nutritional guidance.'
        }
    ]);

    const handleRegisterUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newUser.email || !newUser.name || !newUser.membershipPlan) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        
        setLoading(true);
        try {
            // Создать пользователя
            const userResponse = await userApi.createUser({
                email: newUser.email,
                name: newUser.name,
                password: 'defaultPassword123', // Можно добавить поле для пароля
                role: 'ROLE_USER'
            });
            
            const createdUser = userResponse.data.data;
            
            // Назначить абонемент, если указан
            if (newUser.membershipPlan && newUser.startDate) {
                const selectedMembership = memberships.find(m => m.name === newUser.membershipPlan);
                if (selectedMembership) {
                    await userMembershipApi.assignMembership({
                        user: { id: createdUser.id },
                        membership: selectedMembership,
                        startDate: newUser.startDate,
                        endDate: undefined, // Backend рассчитает автоматически
                        isActive: true,
                        autoRenew: false
                    });
                }
            }
            
            // Добавить в список members
            const member: Member = {
                id: createdUser.id.toString(),
                name: newUser.name,
                email: newUser.email,
                membership: newUser.membershipPlan,
                joinDate: newUser.startDate
            };
            setMembers([...members, member]);
            
            // Очистить форму
            setNewUser({ email: '', name: '', membershipPlan: '', startDate: '' });
            
            toast.success('Пользователь успешно зарегистрирован!');
            
            // Обновить статистику
            await loadDashboardData();
        } catch (error: any) {
            console.error('Error registering user:', error);
            toast.error(error.response?.data?.message || 'Не удалось зарегистрировать пользователя');
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePlan = (planId: string) => {
        setHighRiskPlans(plans =>
            plans.map(plan =>
                plan.id === planId ? { ...plan, status: 'approved' as const } : plan
            )
        );
        toast.success('Workout plan approved!', {
            description: 'Member will be notified of approval.'
        });
    };

    const handleRejectPlan = (planId: string) => {
        setHighRiskPlans(plans =>
            plans.map(plan =>
                plan.id === planId ? { ...plan, status: 'rejected' as const } : plan
            )
        );
        toast.success('Workout plan rejected', {
            description: 'Alternative recommendations will be provided to the member.'
        });
    };

    const handleContactMember = (memberEmail: string, memberName: string) => {
        toast.success(`Opening email to ${memberName}`, {
            description: `Contact: ${memberEmail}`
        });
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Navigation */}
            <nav className="bg-zinc-900 border-b border-zinc-800">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-orange-500" />
                        <span className="text-xl tracking-wide">GMS ADMIN</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">{user.name}</span>
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
                <h1 className="text-4xl mb-8">Admin Dashboard</h1>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="register"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Register New User
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Manage Members
                        </TabsTrigger>
                        <TabsTrigger
                            value="bookings"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            Bookings
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai"
                            className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                        >
                            AI Management
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Members</p>
                                        <p className="text-3xl mt-2 text-white">
                                            {loading ? '...' : userStats?.totalUsers || 0}
                                        </p>
                                    </div>
                                    <Users className="w-12 h-12 text-orange-500 opacity-50" />
                                </div>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Active Members</p>
                                        <p className="text-3xl mt-2 text-white">
                                            {loading ? '...' : userStats?.activeMembers || 0}
                                        </p>
                                    </div>
                                    <Activity className="w-12 h-12 text-orange-500 opacity-50" />
                                </div>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Expiring Soon</p>
                                        <p className="text-3xl mt-2 text-white">
                                            {loading ? '...' : userStats?.expiringThisMonth || 0}
                                        </p>
                                    </div>
                                    <AlertTriangle className="w-12 h-12 text-orange-500 opacity-50" />
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="register">
                        <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <UserPlus className="w-6 h-6 text-orange-500" />
                                <h2 className="text-2xl text-white">Register New User</h2>
                            </div>

                            <form onSubmit={handleRegisterUser} className="space-y-6">
                                <div>
                                    <Label htmlFor="name" className="text-white">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="bg-zinc-800 border-zinc-700 focus:border-orange-500 mt-2 text-white placeholder:text-gray-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-white">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="bg-zinc-800 border-zinc-700 focus:border-orange-500 mt-2 text-white placeholder:text-gray-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="membership" className="text-white">Membership Plan</Label>
                                    <Select
                                        value={newUser.membershipPlan}
                                        onValueChange={(value) => setNewUser({ ...newUser, membershipPlan: value })}
                                        required
                                    >
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700 focus:border-orange-500 mt-2 text-white">
                                            <SelectValue placeholder="Select a plan" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                            {memberships.map((membership) => (
                                                <SelectItem 
                                                    key={membership.id} 
                                                    value={membership.name} 
                                                    className="text-white focus:bg-zinc-700 focus:text-white"
                                                >
                                                    {membership.name} - ${membership.price}/{membership.durationDays} days
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="startDate" className="text-white">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={newUser.startDate}
                                        onChange={(e) => setNewUser({ ...newUser, startDate: e.target.value })}
                                        className="bg-zinc-800 border-zinc-700 focus:border-orange-500 mt-2 text-white"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    Register User
                                </Button>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="members">
                        <Card className="bg-zinc-900 border-zinc-800 p-6">
                            <h2 className="text-2xl mb-6 text-white">All Members</h2>
                            {loading ? (
                                <p className="text-gray-400">Загрузка пользователей...</p>
                            ) : members.length > 0 ? (
                                <div className="space-y-4">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="text-lg text-white">{member.name}</p>
                                                <p className="text-sm text-gray-400">{member.email}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-orange-500">{member.membership}</p>
                                                    <p className="text-sm text-gray-400">Joined: {member.joinDate}</p>
                                                    {member.lockerNumber && (
                                                        <p className="text-sm text-gray-400">Locker: #{member.lockerNumber}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                                                    disabled={loading}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">Пользователи не найдены</p>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="bookings">
                        <Card className="bg-zinc-900 border-zinc-800 p-6">
                            <h2 className="text-2xl mb-6 text-white">Upcoming Training Sessions</h2>
                            <div className="space-y-4">
                                {mockBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-lg text-white">{booking.memberName}</p>
                                            <p className="text-sm text-gray-400">{booking.sessionType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-orange-500">{booking.date}</p>
                                            <p className="text-sm text-gray-400">{booking.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ai">
                        <div className="space-y-6">
                            {/* High-Risk Plan Requests Section */}
                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Brain className="w-6 h-6 text-orange-500" />
                                    <h2 className="text-2xl text-white">High-Risk Workout Plan Requests</h2>
                                    <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500">
                                        {highRiskPlans.filter(p => p.status === 'pending').length} Pending
                                    </Badge>
                                </div>

                                <p className="text-gray-300 mb-6">
                                    Review and approve or reject workout plans flagged by the AI assistant as potentially unsafe or requiring expert oversight.
                                </p>

                                <div className="space-y-4">
                                    {highRiskPlans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`bg-zinc-800 p-5 rounded-lg border-2 ${
                                                plan.status === 'approved'
                                                    ? 'border-green-500/30 bg-green-500/5'
                                                    : plan.status === 'rejected'
                                                        ? 'border-red-500/30 bg-red-500/5'
                                                        : plan.riskLevel === 'high'
                                                            ? 'border-red-500'
                                                            : 'border-yellow-500'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg text-white">{plan.requestType}</h3>
                                                        <Badge className={`${
                                                            plan.riskLevel === 'high'
                                                                ? 'bg-red-500/20 text-red-400 border-red-500'
                                                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                                                        }`}>
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            {plan.riskLevel.toUpperCase()} RISK
                                                        </Badge>
                                                        {plan.status !== 'pending' && (
                                                            <Badge className={`${
                                                                plan.status === 'approved'
                                                                    ? 'bg-green-500/20 text-green-400 border-green-500'
                                                                    : 'bg-red-500/20 text-red-400 border-red-500'
                                                            }`}>
                                                                {plan.status === 'approved' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                                {plan.status.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-300 mb-1">{plan.memberName} ({plan.memberEmail})</p>
                                                    <p className="text-xs text-gray-400">Requested: {plan.date}</p>
                                                </div>
                                            </div>

                                            <div className="bg-zinc-900 p-4 rounded-lg mb-4">
                                                <p className="text-sm text-gray-300">{plan.requestDetails}</p>
                                            </div>

                                            {plan.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleApprovePlan(plan.id)}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approve Plan
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleRejectPlan(plan.id)}
                                                        variant="outline"
                                                        className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Reject Plan
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Attendance Monitoring Section */}
                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity className="w-6 h-6 text-orange-500" />
                                    <h2 className="text-2xl text-white">Attendance Monitoring & Overtraining Alerts</h2>
                                    <Badge className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500">
                                        {attendanceAlerts.filter(a => a.riskLevel === 'high').length} High Risk
                                    </Badge>
                                </div>

                                <p className="text-gray-300 mb-6">
                                    Members with excessive attendance patterns detected by AI. Reach out to prevent burnout and offer support.
                                </p>

                                <div className="space-y-4">
                                    {attendanceAlerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`bg-zinc-800 p-5 rounded-lg border-2 ${
                                                alert.riskLevel === 'high'
                                                    ? 'border-red-500'
                                                    : alert.riskLevel === 'medium'
                                                        ? 'border-yellow-500'
                                                        : 'border-blue-500'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg text-white">{alert.memberName}</h3>
                                                        <Badge className={`${
                                                            alert.riskLevel === 'high'
                                                                ? 'bg-red-500/20 text-red-400 border-red-500'
                                                                : alert.riskLevel === 'medium'
                                                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                                                                    : 'bg-blue-500/20 text-blue-400 border-blue-500'
                                                        }`}>
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            {alert.riskLevel.toUpperCase()} RISK
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-300 mb-1">{alert.memberEmail}</p>
                                                    <p className="text-xs text-gray-400">{alert.membershipPlan} • Last visit: {alert.lastVisit}</p>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="bg-zinc-900 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-400 mb-1">Weekly Attendance</p>
                                                    <p className="text-xl text-orange-500">{alert.weeklyAttendance}</p>
                                                    <p className="text-xs text-gray-500">sessions/week</p>
                                                </div>
                                                <div className="bg-zinc-900 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-400 mb-1">Monthly Total</p>
                                                    <p className="text-xl text-white">{alert.totalSessionsThisMonth}</p>
                                                    <p className="text-xs text-gray-500">sessions</p>
                                                </div>
                                                <div className="bg-zinc-900 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-400 mb-1">Avg. Duration</p>
                                                    <p className="text-xl text-white">{alert.averageSessionDuration}</p>
                                                    <p className="text-xs text-gray-500">minutes</p>
                                                </div>
                                                <div className="bg-zinc-900 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                                                    <p className={`text-xl ${
                                                        alert.riskLevel === 'high' ? 'text-red-400' :
                                                            alert.riskLevel === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                                                    }`}>
                                                        {alert.riskLevel === 'high' ? 'HIGH' : alert.riskLevel === 'medium' ? 'MED' : 'LOW'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* AI Notes */}
                                            <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg mb-4">
                                                <div className="flex items-start gap-2">
                                                    <Brain className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-orange-200 mb-1">AI Analysis:</p>
                                                        <p className="text-sm text-gray-300">{alert.notes}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleContactMember(alert.memberEmail, alert.memberName)}
                                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                                >
                                                    Contact Member
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        toast.success('Recovery plan created', {
                                                            description: `Personalized recovery program assigned to ${alert.memberName}`
                                                        });
                                                    }}
                                                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600"
                                                >
                                                    Assign Recovery Plan
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

const mockBookings = [
    { id: '1', memberName: 'Yurtaev Gleb', sessionType: 'Personal Training', date: '2025-11-08', time: '10:00 AM' },
    { id: '2', memberName: 'Jane Smith', sessionType: 'Group Class - Yoga', date: '2025-11-08', time: '2:00 PM' },
    { id: '3', memberName: 'Mike Johnson', sessionType: 'Personal Training', date: '2025-11-09', time: '9:00 AM' },
];