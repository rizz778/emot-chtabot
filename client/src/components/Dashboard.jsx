import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, Scatter, ScatterChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap, Sector 
} from 'recharts';
import { 
  CalendarClock, 
  MessageCircle, 
  Activity,
  TrendingUp, 
  Heart,
  Brain,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  ChartBar,
  Calendar,
  Search,
  Filter,
  Clock,
  Download,
  Info,
  BarChart2,
  PieChart as PieChartIcon,
  Target
} from 'lucide-react';

// Mock data based on the actual backend structure
const mockData = {
  userId: "12345",
  totalSessions: 24,
  totalUserMessages: 186,
  averageDistressScore: 4.7,
  emotionCounts: {
    happy: 42,
    sad: 35,
    angry: 18,
    fear: 22,
    surprise: 15,
    disgust: 8,
    neutral: 28,
    unknown: 6
  },
  emotionPercentages: {
    happy: 22.6,
    sad: 18.8,
    angry: 9.7,
    fear: 11.8,
    surprise: 8.1,
    disgust: 4.3,
    neutral: 15.1,
    unknown: 3.2
  },
  dominantEmotion: "happy",
  sessionsByDistress: {
    high: [
      { sessionId: "s1", sessionName: "Difficult morning", avgDistress: 8.2, createdAt: "2025-03-12T10:30:00" },
      { sessionId: "s2", sessionName: "Work anxiety", avgDistress: 7.5, createdAt: "2025-03-15T16:20:00" }
    ],
    medium: [
      { sessionId: "s3", sessionName: "Family concerns", avgDistress: 6.3, createdAt: "2025-03-18T14:15:00" },
      { sessionId: "s4", sessionName: "Health worries", avgDistress: 5.8, createdAt: "2025-03-22T19:40:00" },
      { sessionId: "s5", sessionName: "Relationship discussion", avgDistress: 4.5, createdAt: "2025-03-25T20:10:00" }
    ],
    low: [
      { sessionId: "s6", sessionName: "Weekend reflection", avgDistress: 3.7, createdAt: "2025-03-28T11:05:00" },
      { sessionId: "s7", sessionName: "Progress check-in", avgDistress: 2.2, createdAt: "2025-04-01T09:30:00" },
      { sessionId: "s8", sessionName: "Gratitude practice", avgDistress: 1.5, createdAt: "2025-04-05T17:45:00" }
    ]
  },
  sessionAnalytics: [
    { sessionId: "s1", sessionName: "Difficult morning", messageCount: 24, averageDistress: 8.2, createdAt: "2025-03-12T10:30:00" },
    { sessionId: "s2", sessionName: "Work anxiety", messageCount: 18, averageDistress: 7.5, createdAt: "2025-03-15T16:20:00" },
    { sessionId: "s3", sessionName: "Family concerns", messageCount: 22, averageDistress: 6.3, createdAt: "2025-03-18T14:15:00" },
    { sessionId: "s4", sessionName: "Health worries", messageCount: 19, averageDistress: 5.8, createdAt: "2025-03-22T19:40:00" },
    { sessionId: "s5", sessionName: "Relationship discussion", messageCount: 28, averageDistress: 4.5, createdAt: "2025-03-25T20:10:00" },
    { sessionId: "s6", sessionName: "Weekend reflection", messageCount: 15, averageDistress: 3.7, createdAt: "2025-03-28T11:05:00" },
    { sessionId: "s7", sessionName: "Progress check-in", messageCount: 21, averageDistress: 2.2, createdAt: "2025-04-01T09:30:00" },
    { sessionId: "s8", sessionName: "Gratitude practice", messageCount: 16, averageDistress: 1.5, createdAt: "2025-04-05T17:45:00" }
  ],
  distressTrend: [
    { timestamp: "2025-03-10T11:30:00", score: 7.8, sessionId: "s1", sessionName: "Difficult morning" },
    { timestamp: "2025-03-15T14:45:00", score: 7.2, sessionId: "s2", sessionName: "Work anxiety" },
    { timestamp: "2025-03-18T09:20:00", score: 6.5, sessionId: "s3", sessionName: "Family concerns" },
    { timestamp: "2025-03-22T16:35:00", score: 5.9, sessionId: "s4", sessionName: "Health worries" },
    { timestamp: "2025-03-25T13:10:00", score: 4.7, sessionId: "s5", sessionName: "Relationship discussion" },
    { timestamp: "2025-03-28T10:55:00", score: 3.6, sessionId: "s6", sessionName: "Weekend reflection" },
    { timestamp: "2025-04-01T15:40:00", score: 2.8, sessionId: "s7", sessionName: "Progress check-in" },
    { timestamp: "2025-04-05T12:15:00", score: 1.9, sessionId: "s8", sessionName: "Gratitude practice" }
  ],
  emotionTrend: [
    { timestamp: "2025-03-10T11:30:00", emotion: "angry", sessionId: "s1", sessionName: "Difficult morning" },
    { timestamp: "2025-03-15T14:45:00", emotion: "fear", sessionId: "s2", sessionName: "Work anxiety" },
    { timestamp: "2025-03-18T09:20:00", emotion: "sad", sessionId: "s3", sessionName: "Family concerns" },
    { timestamp: "2025-03-22T16:35:00", emotion: "sad", sessionId: "s4", sessionName: "Health worries" },
    { timestamp: "2025-03-25T13:10:00", emotion: "surprise", sessionId: "s5", sessionName: "Relationship discussion" },
    { timestamp: "2025-03-28T10:55:00", emotion: "neutral", sessionId: "s6", sessionName: "Weekend reflection" },
    { timestamp: "2025-04-01T15:40:00", emotion: "happy", sessionId: "s7", sessionName: "Progress check-in" },
    { timestamp: "2025-04-05T12:15:00", emotion: "happy", sessionId: "s8", sessionName: "Gratitude practice" }
  ]
};

// Color palette for emotions
const emotionColors = {
  happy: "#22c55e", // green
  sad: "#3b82f6", // blue
  angry: "#ef4444", // red
  fear: "#f97316", // orange
  surprise: "#a855f7", // purple
  disgust: "#84cc16", // lime
  neutral: "#94a3b8", // slate
  unknown: "#cbd5e1" // light slate
};

// Custom gradient colors
const gradientColors = {
  primary: ["#8b5cf6", "#6366f1"],
  secondary: ["#ec4899", "#f43f5e"],
  tertiary: ["#06b6d4", "#0ea5e9"]
};

// Enhanced dashboard component
export default function Dashboard() {
  const [data, setData] = useState(mockData);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    distressLevel: "all",
    dateRange: "all"
  });
  
  // In a real app, you would fetch the data here
  useEffect(() => {
    // Example fetch call (commented out)
    // const fetchData = async () => {
    //   const response = await fetch(`/api/user-analytics/${userId}`);
    //   const userData = await response.json();
    //   setData(userData);
    // };
    // fetchData();
  }, []);

  // Data formatting functions
  const formatDistressTrend = () => {
    return data.distressTrend.map(item => ({
      date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: item.score,
      session: item.sessionName
    }));
  };

  const formatEmotionTrend = () => {
    const result = [];
    const emotions = Object.keys(data.emotionCounts);
    
    // Create data points for all emotions over time
    data.emotionTrend.forEach((item, index) => {
      const date = new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existingDate = result.find(point => point.date === date);
      
      if (existingDate) {
        existingDate[item.emotion] = (existingDate[item.emotion] || 0) + 1;
      } else {
        const newPoint = { date, sessionName: item.sessionName };
        emotions.forEach(emotion => {
          newPoint[emotion] = emotion === item.emotion ? 1 : 0;
        });
        result.push(newPoint);
      }
    });
    
    return result;
  };

  const formatEmotionRadar = () => {
    return Object.keys(data.emotionCounts)
      .filter(key => key !== 'unknown')
      .map(emotion => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        count: data.emotionCounts[emotion],
        fullMark: Math.max(...Object.values(data.emotionCounts)) + 10
      }));
  };
  
  const formatEmotionPie = () => {
    return Object.keys(data.emotionPercentages)
      .filter(emotion => data.emotionPercentages[emotion] > 0 && emotion !== 'unknown')
      .map(emotion => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: data.emotionPercentages[emotion]
      }));
  };
  
  const formatSessionsTreemap = () => {
    const allSessions = [
      ...data.sessionsByDistress.high.map(s => ({ ...s, category: 'High' })),
      ...data.sessionsByDistress.medium.map(s => ({ ...s, category: 'Medium' })),
      ...data.sessionsByDistress.low.map(s => ({ ...s, category: 'Low' }))
    ];
    
    return allSessions.map(session => ({
      name: session.sessionName,
      size: session.avgDistress * 10,
      category: session.category
    }));
  };
  
  const formatDistressScatter = () => {
    return data.distressTrend.map(item => ({
      x: new Date(item.timestamp).getTime(),
      y: item.score,
      name: item.sessionName
    }));
  };

  const formatSessionCards = () => {
    return [...data.sessionAnalytics]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  };

  // Filter sessions based on search term and filters
  const getFilteredSessions = () => {
    let filteredSessions = [...data.sessionAnalytics];
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      filteredSessions = filteredSessions.filter(session => 
        session.sessionName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply distress level filter
    if (selectedFilters.distressLevel !== "all") {
      if (selectedFilters.distressLevel === "high") {
        filteredSessions = filteredSessions.filter(session => session.averageDistress >= 7);
      } else if (selectedFilters.distressLevel === "medium") {
        filteredSessions = filteredSessions.filter(session => session.averageDistress >= 4 && session.averageDistress < 7);
      } else if (selectedFilters.distressLevel === "low") {
        filteredSessions = filteredSessions.filter(session => session.averageDistress < 4);
      }
    }
    
    // Apply date range filter
    if (selectedFilters.dateRange !== "all") {
      const today = new Date();
      let filterDate = new Date();
      
      if (selectedFilters.dateRange === "week") {
        filterDate.setDate(today.getDate() - 7);
      } else if (selectedFilters.dateRange === "month") {
        filterDate.setMonth(today.getMonth() - 1);
      }
      
      filteredSessions = filteredSessions.filter(session => 
        new Date(session.createdAt) >= filterDate
      );
    }
    
    return filteredSessions;
  };

  // Calculate trend direction and stats
  const calculateTrendDirection = () => {
    if (data.distressTrend.length < 2) return "steady";
    
    const sortedTrend = [...data.distressTrend].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    const firstScore = sortedTrend[0].score;
    const lastScore = sortedTrend[sortedTrend.length - 1].score;
    
    if (lastScore < firstScore) return "decreasing";
    if (lastScore > firstScore) return "increasing";
    return "steady";
  };
  
  const distressTrendDirection = calculateTrendDirection();
  const trendPercentage = () => {
    if (data.distressTrend.length < 2) return 0;
    
    const sortedTrend = [...data.distressTrend].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    const firstScore = sortedTrend[0].score;
    const lastScore = sortedTrend[sortedTrend.length - 1].score;
    
    return Math.abs(Math.round((lastScore - firstScore) / firstScore * 100));
  };

  // Formatted data
  const distressData = formatDistressTrend();
  const emotionTrendData = formatEmotionTrend();
  const emotionRadarData = formatEmotionRadar();
  const emotionPieData = formatEmotionPie();
  const sessionsTreemapData = formatSessionsTreemap();
  const distressScatterData = formatDistressScatter();
  const recentSessions = formatSessionCards();
  const filteredSessions = getFilteredSessions();

  // Custom components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-100">
          <p className="text-gray-700 font-medium">{label}</p>
          <p className="text-sm text-indigo-600">
            {payload[0].name}: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" className="text-sm font-medium">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
          {`${value.toFixed(1)}%`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  // State for active pie sector
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Prepare custom gradient definitions
  const renderGradients = () => (
    <defs>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={gradientColors.primary[0]} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={gradientColors.primary[1]} stopOpacity={0.2}/>
      </linearGradient>
      <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={gradientColors.secondary[0]} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={gradientColors.secondary[1]} stopOpacity={0.2}/>
      </linearGradient>
      <linearGradient id="tertiaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={gradientColors.tertiary[0]} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={gradientColors.tertiary[1]} stopOpacity={0.2}/>
      </linearGradient>
      <filter id="shadow" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.1"/>
      </filter>
    </defs>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <header className="bg-white text-black shadow-lg">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold">Emotional Wellness Dashboard</h1>
          <p className="mt-2 ">Your emotional journey visualized</p>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-md mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'emotions' 
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('emotions')}
            >
              Emotions
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'sessions' 
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
          </nav>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards with Visual Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-400">Total Sessions</div>
                    <div className="text-3xl font-bold mt-2 text-gray-800">{data.totalSessions}</div>
                  </div>
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <CalendarClock className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-400">Messages</div>
                    <div className="text-3xl font-bold mt-2 text-gray-800">{data.totalUserMessages}</div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-400">Distress Level</div>
                    <div className="flex items-baseline mt-2">
                      <div className="text-3xl font-bold text-gray-800">{data.averageDistressScore}</div>
                      <div className="text-sm text-gray-500 ml-1">/10</div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500"></div>
                <div className="mt-4 flex items-center text-sm">
                  {distressTrendDirection === "decreasing" ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">{trendPercentage()}% decrease</span>
                    </>
                  ) : distressTrendDirection === "increasing" ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500 font-medium">{trendPercentage()}% increase</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Stable</span>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-400">Primary Emotion</div>
                    <div className="text-3xl font-bold mt-2 text-gray-800 capitalize">{data.dominantEmotion}</div>
                  </div>
                  <div className="h-12 w-12 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: `${emotionColors[data.dominantEmotion]}20` }}>
                    <Heart className="h-6 w-6" style={{ color: emotionColors[data.dominantEmotion] }} />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1" 
                     style={{ backgroundColor: emotionColors[data.dominantEmotion] }}></div>
              </div>
            </div>
            
            {/* Main Charts - Distress and Emotions Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-5 rounded-xl shadow-sm col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Distress Level Trend</h2>
                  <span className="text-sm text-gray-500">Last {distressData.length} sessions</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={distressData}>
                      {renderGradients()}
                      <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#E0E0E0' }}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickCount={6}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="url(#primaryGradient)" 
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#primaryGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Emotion Pattern</h2>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={emotionRadarData}>
                      {renderGradients()}
                      <PolarGrid stroke="#E0E0E0" />
                      <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 12, fill: '#4B5563' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar 
                        name="Emotions" 
                        dataKey="count" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recent Sessions Cards */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Recent Sessions</h2>
                <button 
                  className="flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-800"
                  onClick={() => setActiveTab('sessions')}
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentSessions.map(session => (
                  <div key={session.sessionId} className="bg-white rounded-xl shadow-sm p-5 border border-gray-50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-800">{session.sessionName}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs font-medium text-gray-500">Messages</div>
                        <div className="flex items-center mt-1">
                          <MessageCircle className="h-4 w-4 text-indigo-500 mr-1" />
                          <span className="text-lg font-semibold text-gray-700">{session.messageCount}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Distress Level</div>
                        <div className="flex items-center mt-1">
                          <Activity className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-lg font-semibold text-gray-700">{session.averageDistress}</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Emotions Tab */}
        {activeTab === 'emotions' && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Emotional Landscape</h2>
              <p className="text-gray-600 mb-6">
                Analyze your emotional patterns across conversations. Understanding your emotions is the first step to managing them.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Emotion Distribution Pie Chart */}
                <div className="h-80">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    Emotion Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {renderGradients()}
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={CustomActiveShape}
                        data={emotionPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {emotionPieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={emotionColors[entry.name.toLowerCase()]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Emotion Timeline */}
                <div className="h-80">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                    Emotional Journey
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      {Object.keys(emotionColors).map((emotion, index) => {
                        if (emotion === 'unknown') return null;
                        const capitalizedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
                        return (
                          <Bar 
                            key={emotion}
                            dataKey={emotion} 
                            stackId="a" 
                            fill={emotionColors[emotion]}
                            name={capitalizedEmotion}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Emotion to Distress Correlation */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Emotion Insights</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Emotion Stats */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-500" />
                    Top Emotions
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(data.emotionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([emotion, count]) => (
                        <div key={emotion} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: emotionColors[emotion] }}></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-700 capitalize">{emotion}</span>
                              <span className="text-gray-500 text-sm">{count} instances</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                  width: `${(count / Math.max(...Object.values(data.emotionCounts))) * 100}%`,
                                  backgroundColor: emotionColors[emotion]
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                {/* Emotion Treemap */}
                <div className="h-80">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-500" />
                    Emotion Intensity Map
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={sessionsTreemapData}
                      dataKey="size"
                      nameKey="name"
                      stroke="#fff"
                      fill="#8884d8"
                    >
                      {sessionsTreemapData.map((entry, index) => {
                        let color = "#8884d8";
                        if (entry.category === "High") color = "#ef4444";
                        else if (entry.category === "Medium") color = "#f97316";
                        else if (entry.category === "Low") color = "#22c55e";
                        
                        return <Cell key={`cell-${index}`} fill={color} />
                      })}
                      <Tooltip 
                        formatter={(value, name) => [`Distress: ${(value/10).toFixed(1)}`, name]}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 lg:mb-0">Session History</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                      placeholder="Search sessions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative inline-block">
                    <div className="flex">
                      <button
                        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <Filter className="h-4 w-4 mr-2 text-gray-400" />
                        Filter
                        <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
                      </button>
                      
                      <button
                        className="ml-2 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <Download className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Session Timeline */}
              <div className="h-72 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    {renderGradients()}
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number"
                      dataKey="x"
                      name="Date"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      type="number"
                      dataKey="y"
                      name="Distress Level"
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name, props) => {
                        if (name === 'Date') return [new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), name];
                        return [value, name];
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 shadow-md rounded-md border border-gray-100">
                              <p className="text-gray-700 font-medium">{payload[0].payload.name}</p>
                              <p className="text-sm text-indigo-600">
                                Date: <span className="font-medium">{new Date(payload[0].payload.x).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </p>
                              <p className="text-sm text-indigo-600">
                                Distress: <span className="font-medium">{payload[0].payload.y}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Sessions" 
                      data={distressScatterData} 
                      fill="#8884d8"
                      shape={(props) => {
                        const { cx, cy, fill } = props;
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={8} 
                            stroke="none" 
                            fill={fill}
                            opacity={0.7}
                          />
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              {/* Sessions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Messages
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distress Level
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSessions.map((session) => (
                      <tr key={session.sessionId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <MessageCircle className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{session.sessionName}</div>
                              <div className="text-sm text-gray-500">ID: {session.sessionId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">
                              {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 ml-6">
                            {new Date(session.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <MessageCircle className="h-4 w-4 text-gray-400 mr-2" />
                            {session.messageCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`mr-2 h-3 w-3 rounded-full ${
                              session.averageDistress >= 7 ? 'bg-red-500' : 
                              session.averageDistress >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-sm text-gray-500">{session.averageDistress}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Clock className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredSessions.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No sessions found</h3>
                  <p className="text-gray-500 max-w-md">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Your emotional well-being data is private and secure. 
            <button className="text-indigo-600 hover:text-indigo-800 font-medium ml-1 inline-flex items-center">
              Learn more <Info className="h-3 w-3 ml-1" />
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}