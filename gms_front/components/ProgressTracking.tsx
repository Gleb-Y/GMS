import { useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Scale,
    Activity,
    TrendingUp,
    Dumbbell,
    Heart,
    Watch,
    Plus,
    Calendar,
    Zap,
    Target,
    BarChart3
} from "lucide-react";
import { toast } from "sonner@2.0.3";

export type BodyMeasurement = {
    id: string;
    date: string;
    weight: number;
    bodyFat?: number;
    muscleMass?: number;
    bmi?: number;
};

export type WorkoutLog = {
    id: string;
    date: string;
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
    notes?: string;
};

export type CardioSession = {
    id: string;
    date: string;
    type: string;
    duration: number; // minutes
    distance?: number; // km
    calories: number;
    avgHeartRate?: number;
};

export type WearableData = {
    connected: boolean;
    deviceName?: string;
    lastSync?: string;
    todaySteps?: number;
    todayCalories?: number;
    todayActiveMinutes?: number;
    weeklyAvgHeartRate?: number;
};

export type ProgressData = {
    bodyMeasurements: BodyMeasurement[];
    workoutLogs: WorkoutLog[];
    cardioSessions: CardioSession[];
    wearableData: WearableData;
    goals?: {
        targetWeight?: number;
        targetBodyFat?: number;
        weeklyWorkouts?: number;
    };
};

interface ProgressTrackingProps {
    data: ProgressData;
    onUpdateData?: (data: ProgressData) => void;
}

export function ProgressTracking({ data, onUpdateData }: ProgressTrackingProps) {
    const [selectedTab, setSelectedTab] = useState<'overview' | 'body' | 'workout' | 'cardio' | 'wearable'>('overview');
    const [showAddBody, setShowAddBody] = useState(false);
    const [showAddWorkout, setShowAddWorkout] = useState(false);
    const [showAddCardio, setShowAddCardio] = useState(false);

    // Form states
    const [bodyForm, setBodyForm] = useState({
        weight: '',
        bodyFat: '',
        muscleMass: ''
    });

    const [workoutForm, setWorkoutForm] = useState({
        exercise: '',
        sets: '',
        reps: '',
        weight: '',
        notes: ''
    });

    const [cardioForm, setCardioForm] = useState({
        type: 'Running',
        duration: '',
        distance: '',
        calories: '',
        avgHeartRate: ''
    });

    const handleAddBodyMeasurement = () => {
        const weight = parseFloat(bodyForm.weight);
        const bodyFat = bodyForm.bodyFat ? parseFloat(bodyForm.bodyFat) : undefined;
        const muscleMass = bodyForm.muscleMass ? parseFloat(bodyForm.muscleMass) : undefined;

        if (!weight) {
            toast.error('Please enter your weight');
            return;
        }

        const newMeasurement: BodyMeasurement = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            weight,
            bodyFat,
            muscleMass,
            bmi: weight / Math.pow(1.75, 2) // Mock BMI calculation assuming 1.75m height
        };

        const updatedData = {
            ...data,
            bodyMeasurements: [...data.bodyMeasurements, newMeasurement]
        };

        onUpdateData?.(updatedData);
        setBodyForm({ weight: '', bodyFat: '', muscleMass: '' });
        setShowAddBody(false);
        toast.success('Body measurement added successfully!');
    };

    const handleAddWorkout = () => {
        const sets = parseInt(workoutForm.sets);
        const reps = parseInt(workoutForm.reps);
        const weight = parseFloat(workoutForm.weight);

        if (!workoutForm.exercise || !sets || !reps || !weight) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newWorkout: WorkoutLog = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            exercise: workoutForm.exercise,
            sets,
            reps,
            weight,
            notes: workoutForm.notes
        };

        const updatedData = {
            ...data,
            workoutLogs: [...data.workoutLogs, newWorkout]
        };

        onUpdateData?.(updatedData);
        setWorkoutForm({ exercise: '', sets: '', reps: '', weight: '', notes: '' });
        setShowAddWorkout(false);
        toast.success('Workout logged successfully!');
    };

    const handleAddCardio = () => {
        const duration = parseInt(cardioForm.duration);
        const calories = parseInt(cardioForm.calories);
        const distance = cardioForm.distance ? parseFloat(cardioForm.distance) : undefined;
        const avgHeartRate = cardioForm.avgHeartRate ? parseInt(cardioForm.avgHeartRate) : undefined;

        if (!cardioForm.type || !duration || !calories) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newCardio: CardioSession = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            type: cardioForm.type,
            duration,
            distance,
            calories,
            avgHeartRate
        };

        const updatedData = {
            ...data,
            cardioSessions: [...data.cardioSessions, newCardio]
        };

        onUpdateData?.(updatedData);
        setCardioForm({ type: 'Running', duration: '', distance: '', calories: '', avgHeartRate: '' });
        setShowAddCardio(false);
        toast.success('Cardio session logged successfully!');
    };

    const handleConnectWearable = () => {
        // Mock connection to wearable device
        const mockWearableData: WearableData = {
            connected: true,
            deviceName: 'Fitness Bracelet Pro',
            lastSync: new Date().toLocaleString(),
            todaySteps: 8543,
            todayCalories: 2180,
            todayActiveMinutes: 65,
            weeklyAvgHeartRate: 72
        };

        const updatedData = {
            ...data,
            wearableData: mockWearableData
        };

        onUpdateData?.(updatedData);
        toast.success('Fitness device connected successfully!', {
            description: 'Your activity data is now syncing automatically.'
        });
    };

    const handleSyncWearable = () => {
        // Mock sync
        const updatedData = {
            ...data,
            wearableData: {
                ...data.wearableData,
                lastSync: new Date().toLocaleString(),
                todaySteps: (data.wearableData.todaySteps || 0) + Math.floor(Math.random() * 500),
                todayCalories: (data.wearableData.todayCalories || 0) + Math.floor(Math.random() * 100),
                todayActiveMinutes: (data.wearableData.todayActiveMinutes || 0) + Math.floor(Math.random() * 10)
            }
        };

        onUpdateData?.(updatedData);
        toast.success('Data synced successfully!');
    };

    const handleDisconnectWearable = () => {
        const updatedData = {
            ...data,
            wearableData: {
                connected: false
            }
        };

        onUpdateData?.(updatedData);
        toast.success('Fitness device disconnected');
    };

    // Calculate statistics
    const latestWeight = data.bodyMeasurements.length > 0
        ? data.bodyMeasurements[data.bodyMeasurements.length - 1].weight
        : 0;
    const firstWeight = data.bodyMeasurements.length > 0
        ? data.bodyMeasurements[0].weight
        : 0;
    const weightChange = latestWeight - firstWeight;
    const totalWorkouts = data.workoutLogs.length;
    const totalCardioMinutes = data.cardioSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalCaloriesBurned = data.cardioSessions.reduce((sum, session) => sum + session.calories, 0);

    // Prepare chart data
    const weightChartData = data.bodyMeasurements.map(m => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: m.weight,
        bodyFat: m.bodyFat || 0
    }));

    const workoutChartData = data.workoutLogs.slice(-10).map(w => ({
        exercise: w.exercise.substring(0, 15),
        volume: w.sets * w.reps * w.weight
    }));

    const cardioChartData = data.cardioSessions.slice(-7).map(c => ({
        date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        duration: c.duration,
        calories: c.calories
    }));

    return (
        <div className="space-y-6">
            {/* Stats Overview Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Scale className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-gray-300">Current Weight</h3>
                    </div>
                    <p className="text-3xl text-white">{latestWeight.toFixed(1)} kg</p>
                    <p className={`text-sm mt-1 ${weightChange < 0 ? 'text-green-500' : 'text-orange-500'}`}>
                        {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from start
                    </p>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Dumbbell className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-gray-300">Total Workouts</h3>
                    </div>
                    <p className="text-3xl text-white">{totalWorkouts}</p>
                    <p className="text-sm text-gray-400 mt-1">Logged sessions</p>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-gray-300">Cardio Time</h3>
                    </div>
                    <p className="text-3xl text-white">{totalCardioMinutes}</p>
                    <p className="text-sm text-gray-400 mt-1">Total minutes</p>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-gray-300">Calories Burned</h3>
                    </div>
                    <p className="text-3xl text-white">{totalCaloriesBurned}</p>
                    <p className="text-sm text-gray-400 mt-1">From cardio sessions</p>
                </Card>
            </div>

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
                    Overview
                </button>
                <button
                    onClick={() => setSelectedTab('body')}
                    className={`px-4 py-2 transition-colors ${
                        selectedTab === 'body'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Body Metrics
                </button>
                <button
                    onClick={() => setSelectedTab('workout')}
                    className={`px-4 py-2 transition-colors ${
                        selectedTab === 'workout'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Workout Logs
                </button>
                <button
                    onClick={() => setSelectedTab('cardio')}
                    className={`px-4 py-2 transition-colors ${
                        selectedTab === 'cardio'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Cardio
                </button>
                <button
                    onClick={() => setSelectedTab('wearable')}
                    className={`px-4 py-2 transition-colors ${
                        selectedTab === 'wearable'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Wearable Sync
                </button>
            </div>

            {/* Overview Tab */}
            {selectedTab === 'overview' && (
                <div className="space-y-6">
                    {/* Weight Trend Chart */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xl text-white">Weight & Body Fat Trend</h3>
                            </div>
                        </div>
                        {weightChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={weightChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#ffffff' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} name="Weight (kg)" />
                                    <Line type="monotone" dataKey="bodyFat" stroke="#fb923c" strokeWidth={2} name="Body Fat (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-center py-8">No body measurements recorded yet</p>
                        )}
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Workout Volume Chart */}
                        <Card className="bg-zinc-900 border-zinc-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart3 className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xl text-white">Recent Workout Volume</h3>
                            </div>
                            {workoutChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={workoutChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey="exercise" stroke="#71717a" angle={-45} textAnchor="end" height={80} style={{ fontSize: '11px' }} />
                                        <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            labelStyle={{ color: '#ffffff' }}
                                        />
                                        <Bar dataKey="volume" fill="#f97316" name="Total Volume (kg)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No workouts logged yet</p>
                            )}
                        </Card>

                        {/* Cardio Performance Chart */}
                        <Card className="bg-zinc-900 border-zinc-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xl text-white">Cardio Performance</h3>
                            </div>
                            {cardioChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={cardioChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                                        <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            labelStyle={{ color: '#ffffff' }}
                                        />
                                        <Area type="monotone" dataKey="duration" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Duration (min)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No cardio sessions logged yet</p>
                            )}
                        </Card>
                    </div>

                    {/* Goals Progress */}
                    {data.goals && (
                        <Card className="bg-zinc-900 border-zinc-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Target className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xl text-white">Goals Progress</h3>
                            </div>
                            <div className="space-y-4">
                                {data.goals.targetWeight && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-300">Target Weight</span>
                                            <span className="text-white">{latestWeight.toFixed(1)} / {data.goals.targetWeight} kg</span>
                                        </div>
                                        <Progress
                                            value={Math.min((latestWeight / data.goals.targetWeight) * 100, 100)}
                                            className="h-2"
                                        />
                                    </div>
                                )}
                                {data.goals.weeklyWorkouts && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-300">Weekly Workouts</span>
                                            <span className="text-white">3 / {data.goals.weeklyWorkouts} sessions</span>
                                        </div>
                                        <Progress
                                            value={(3 / data.goals.weeklyWorkouts) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Body Metrics Tab */}
            {selectedTab === 'body' && (
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl text-white">Body Measurements</h3>
                            <Button
                                onClick={() => setShowAddBody(!showAddBody)}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Measurement
                            </Button>
                        </div>

                        {showAddBody && (
                            <Card className="bg-zinc-800 border-zinc-700 p-4 mb-6">
                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <Label className="text-gray-300">Weight (kg) *</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={bodyForm.weight}
                                            onChange={(e) => setBodyForm({ ...bodyForm, weight: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="75.5"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Body Fat %</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={bodyForm.bodyFat}
                                            onChange={(e) => setBodyForm({ ...bodyForm, bodyFat: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="18.5"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Muscle Mass (kg)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={bodyForm.muscleMass}
                                            onChange={(e) => setBodyForm({ ...bodyForm, muscleMass: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="32.0"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddBodyMeasurement} className="bg-orange-500 hover:bg-orange-600">
                                        Save Measurement
                                    </Button>
                                    <Button
                                        onClick={() => setShowAddBody(false)}
                                        variant="outline"
                                        className="border-zinc-700 hover:bg-zinc-800"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Card>
                        )}

                        <div className="space-y-3">
                            {data.bodyMeasurements.slice().reverse().map((measurement) => (
                                <div
                                    key={measurement.id}
                                    className="bg-zinc-800 p-4 rounded-lg border border-zinc-700"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-orange-500">{new Date(measurement.date).toLocaleDateString()}</span>
                                        <Badge variant="outline" className="border-zinc-600 text-gray-300">
                                            BMI: {measurement.bmi?.toFixed(1)}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Weight:</span>
                                            <p className="text-white">{measurement.weight} kg</p>
                                        </div>
                                        {measurement.bodyFat && (
                                            <div>
                                                <span className="text-gray-400">Body Fat:</span>
                                                <p className="text-white">{measurement.bodyFat}%</p>
                                            </div>
                                        )}
                                        {measurement.muscleMass && (
                                            <div>
                                                <span className="text-gray-400">Muscle Mass:</span>
                                                <p className="text-white">{measurement.muscleMass} kg</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {data.bodyMeasurements.length === 0 && (
                                <p className="text-gray-400 text-center py-8">No measurements recorded yet</p>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Workout Logs Tab */}
            {selectedTab === 'workout' && (
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl text-white">Workout Logs</h3>
                            <Button
                                onClick={() => setShowAddWorkout(!showAddWorkout)}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Log Workout
                            </Button>
                        </div>

                        {showAddWorkout && (
                            <Card className="bg-zinc-800 border-zinc-700 p-4 mb-6">
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <Label className="text-gray-300">Exercise *</Label>
                                        <Input
                                            type="text"
                                            value={workoutForm.exercise}
                                            onChange={(e) => setWorkoutForm({ ...workoutForm, exercise: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="Bench Press"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Sets *</Label>
                                        <Input
                                            type="number"
                                            value={workoutForm.sets}
                                            onChange={(e) => setWorkoutForm({ ...workoutForm, sets: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="4"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Reps *</Label>
                                        <Input
                                            type="number"
                                            value={workoutForm.reps}
                                            onChange={(e) => setWorkoutForm({ ...workoutForm, reps: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="10"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Weight (kg) *</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            value={workoutForm.weight}
                                            onChange={(e) => setWorkoutForm({ ...workoutForm, weight: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="80"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Notes</Label>
                                        <Input
                                            type="text"
                                            value={workoutForm.notes}
                                            onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="Felt strong today"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddWorkout} className="bg-orange-500 hover:bg-orange-600">
                                        Save Workout
                                    </Button>
                                    <Button
                                        onClick={() => setShowAddWorkout(false)}
                                        variant="outline"
                                        className="border-zinc-700 hover:bg-zinc-800"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Card>
                        )}

                        <div className="space-y-3">
                            {data.workoutLogs.slice().reverse().map((workout) => (
                                <div
                                    key={workout.id}
                                    className="bg-zinc-800 p-4 rounded-lg border border-zinc-700"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-white">{workout.exercise}</h4>
                                        <span className="text-orange-500 text-sm">{new Date(workout.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                                        <div>
                                            <span className="text-gray-400">Sets:</span>
                                            <p className="text-white">{workout.sets}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Reps:</span>
                                            <p className="text-white">{workout.reps}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Weight:</span>
                                            <p className="text-white">{workout.weight} kg</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Volume:</span>
                                            <p className="text-white">{(workout.sets * workout.reps * workout.weight).toFixed(0)} kg</p>
                                        </div>
                                    </div>
                                    {workout.notes && (
                                        <p className="text-sm text-gray-400 italic">{workout.notes}</p>
                                    )}
                                </div>
                            ))}
                            {data.workoutLogs.length === 0 && (
                                <p className="text-gray-400 text-center py-8">No workouts logged yet</p>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Cardio Tab */}
            {selectedTab === 'cardio' && (
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl text-white">Cardio Sessions</h3>
                            <Button
                                onClick={() => setShowAddCardio(!showAddCardio)}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Log Cardio
                            </Button>
                        </div>

                        {showAddCardio && (
                            <Card className="bg-zinc-800 border-zinc-700 p-4 mb-6">
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label className="text-gray-300">Type *</Label>
                                        <select
                                            value={cardioForm.type}
                                            onChange={(e) => setCardioForm({ ...cardioForm, type: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                                        >
                                            <option>Running</option>
                                            <option>Cycling</option>
                                            <option>Swimming</option>
                                            <option>Rowing</option>
                                            <option>Elliptical</option>
                                            <option>Treadmill</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Duration (minutes) *</Label>
                                        <Input
                                            type="number"
                                            value={cardioForm.duration}
                                            onChange={(e) => setCardioForm({ ...cardioForm, duration: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="30"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Distance (km)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={cardioForm.distance}
                                            onChange={(e) => setCardioForm({ ...cardioForm, distance: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="5.0"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Calories Burned *</Label>
                                        <Input
                                            type="number"
                                            value={cardioForm.calories}
                                            onChange={(e) => setCardioForm({ ...cardioForm, calories: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="350"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Avg Heart Rate (bpm)</Label>
                                        <Input
                                            type="number"
                                            value={cardioForm.avgHeartRate}
                                            onChange={(e) => setCardioForm({ ...cardioForm, avgHeartRate: e.target.value })}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="145"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddCardio} className="bg-orange-500 hover:bg-orange-600">
                                        Save Session
                                    </Button>
                                    <Button
                                        onClick={() => setShowAddCardio(false)}
                                        variant="outline"
                                        className="border-zinc-700 hover:bg-zinc-800"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Card>
                        )}

                        <div className="space-y-3">
                            {data.cardioSessions.slice().reverse().map((session) => (
                                <div
                                    key={session.id}
                                    className="bg-zinc-800 p-4 rounded-lg border border-zinc-700"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-orange-500" />
                                            <h4 className="text-white">{session.type}</h4>
                                        </div>
                                        <span className="text-orange-500 text-sm">{new Date(session.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Duration:</span>
                                            <p className="text-white">{session.duration} min</p>
                                        </div>
                                        {session.distance && (
                                            <div>
                                                <span className="text-gray-400">Distance:</span>
                                                <p className="text-white">{session.distance} km</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-400">Calories:</span>
                                            <p className="text-white">{session.calories} kcal</p>
                                        </div>
                                        {session.avgHeartRate && (
                                            <div>
                                                <span className="text-gray-400">Avg HR:</span>
                                                <p className="text-white">{session.avgHeartRate} bpm</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {data.cardioSessions.length === 0 && (
                                <p className="text-gray-400 text-center py-8">No cardio sessions logged yet</p>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Wearable Sync Tab */}
            {selectedTab === 'wearable' && (
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Watch className="w-6 h-6 text-orange-500" />
                            <h3 className="text-xl text-white">Wearable Device Integration</h3>
                        </div>

                        {data.wearableData.connected ? (
                            <div className="space-y-6">
                                <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-500/20 p-2 rounded-lg">
                                                <Watch className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white">{data.wearableData.deviceName}</h4>
                                                <p className="text-sm text-gray-400">Connected</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500/20 text-green-500 border-green-500">
                                            Active
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Last synced: {data.wearableData.lastSync}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSyncWearable}
                                            className="bg-orange-500 hover:bg-orange-600"
                                        >
                                            Sync Now
                                        </Button>
                                        <Button
                                            onClick={handleDisconnectWearable}
                                            variant="outline"
                                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                                        >
                                            Disconnect
                                        </Button>
                                    </div>
                                </div>

                                {/* Today's Activity */}
                                <div>
                                    <h4 className="text-white mb-4">Today's Activity</h4>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Card className="bg-zinc-800 border-zinc-700 p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Activity className="w-5 h-5 text-orange-500" />
                                                <span className="text-gray-300">Steps</span>
                                            </div>
                                            <p className="text-3xl text-white">{data.wearableData.todaySteps?.toLocaleString()}</p>
                                            <Progress value={(data.wearableData.todaySteps || 0) / 100} className="h-2 mt-2" />
                                            <p className="text-sm text-gray-400 mt-1">Goal: 10,000</p>
                                        </Card>

                                        <Card className="bg-zinc-800 border-zinc-700 p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Zap className="w-5 h-5 text-orange-500" />
                                                <span className="text-gray-300">Calories</span>
                                            </div>
                                            <p className="text-3xl text-white">{data.wearableData.todayCalories?.toLocaleString()}</p>
                                            <Progress value={(data.wearableData.todayCalories || 0) / 25} className="h-2 mt-2" />
                                            <p className="text-sm text-gray-400 mt-1">Goal: 2,500</p>
                                        </Card>

                                        <Card className="bg-zinc-800 border-zinc-700 p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Calendar className="w-5 h-5 text-orange-500" />
                                                <span className="text-gray-300">Active Minutes</span>
                                            </div>
                                            <p className="text-3xl text-white">{data.wearableData.todayActiveMinutes}</p>
                                            <Progress value={(data.wearableData.todayActiveMinutes || 0) / 0.6} className="h-2 mt-2" />
                                            <p className="text-sm text-gray-400 mt-1">Goal: 60</p>
                                        </Card>
                                    </div>
                                </div>

                                {/* Weekly Stats */}
                                <Card className="bg-zinc-800 border-zinc-700 p-6">
                                    <h4 className="text-white mb-4">Weekly Average</h4>
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-5 h-5 text-orange-500" />
                                        <div>
                                            <p className="text-2xl text-white">{data.wearableData.weeklyAvgHeartRate} bpm</p>
                                            <p className="text-sm text-gray-400">Average Heart Rate</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-zinc-800 p-8 rounded-lg border border-zinc-700 max-w-md mx-auto">
                                    <Watch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h4 className="text-xl text-white mb-2">Connect Your Fitness Device</h4>
                                    <p className="text-gray-400 mb-6">
                                        Sync your fitness bracelet to automatically track steps, heart rate, calories, and more.
                                    </p>
                                    <Button
                                        onClick={handleConnectWearable}
                                        className="bg-orange-500 hover:bg-orange-600"
                                    >
                                        <Watch className="w-4 h-4 mr-2" />
                                        Connect Device
                                    </Button>
                                    <div className="mt-6 pt-6 border-t border-zinc-700">
                                        <p className="text-sm text-gray-400 mb-3">Supported Devices:</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <Badge variant="outline" className="border-zinc-600 text-gray-300">Fitness Bracelet</Badge>
                                            <Badge variant="outline" className="border-zinc-600 text-gray-300">Smart Watch</Badge>
                                            <Badge variant="outline" className="border-zinc-600 text-gray-300">Activity Tracker</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}