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
    PieChartIcon,
    Target
  } from 'lucide-react';
  
  // Baby pink themed color palette for emotions
  const emotionColors = {
    happy: "#FF8FAB", // soft pink
    sad: "#A2D2FF", // baby blue
    angry: "#FF5C8D", // deeper pink
    fear: "#FFC2D1", // light pink
    surprise: "#DDA0DD", // plum
    disgust: "#B5EAD7", // mint
    neutral: "#E5E5E5", // light gray
    unknown: "#F8F9FA" // off-white
  };
  
  // Custom gradient colors - baby pink theme
  const gradientColors = {
    primary: ["#FFC2D1", "#FF8FAB"],
    secondary: ["#FFAFCC", "#FFC8DD"],
    tertiary: ["#BDE0FE", "#A2D2FF"]
  };
  
  // Enhanced dashboard component with baby pink theme
  export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({
      distressLevel: "all",
      dateRange: "all"
    });
    
    // Fetch data from the backend API
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          // Use the actual API endpoint
          const response = await fetch(`http://localhost:4000/api/profile/emotion/user`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token-based auth
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            setData(result.data);
          } else {
            throw new Error(result.message || 'Failed to fetch data');
          }
        } catch (err) {
          setError(err.message);
          console.error("Error fetching analytics data:", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, []);
  
    // Return loading state while waiting for API response
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-300 mx-auto"></div>
            <p className="mt-4 text-lg text-pink-600">Loading your emotional analytics...</p>
          </div>
        </div>
      );
    }
  
    // Return error state if API call fails
    if (error || !data) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-6 bg-pink-50 rounded-lg shadow-md">
            <div className="text-3xl text-pink-500 mb-4">😕</div>
            <h2 className="text-xl text-pink-700 font-medium mb-2">Unable to load your analytics</h2>
            <p className="text-pink-600 mb-4">{error || "An unknown error occurred"}</p>
            <button 
              className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
  
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
      data.emotionTrend.forEach((item) => {
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
      
      if (firstScore === 0) return 0; // Avoid division by zero
      
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
          <div className="bg-white p-3 shadow-md rounded-md border border-pink-100">
            <p className="text-pink-700 font-medium">{label}</p>
            <p className="text-sm text-pink-600">
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
      }
  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header with gradient background */}
      <header className="bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-md">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold">Emotional Wellness Dashboard</h1>
          <p className="mt-2 text-pink-100">Your emotional journey visualized</p>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-lg mt-6 border border-pink-100">
        <div className="border-b border-pink-100">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-pink-400 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-pink-400 hover:border-pink-200'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'emotions' 
                  ? 'border-pink-400 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-pink-400 hover:border-pink-200'
              }`}
              onClick={() => setActiveTab('emotions')}
            >
              Emotions
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'sessions' 
                  ? 'border-pink-400 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-pink-400 hover:border-pink-200'
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
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative border border-pink-100">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-pink-400">Total Sessions</div>
                    <div className="text-3xl font-bold mt-2 text-pink-700">{data.totalSessions}</div>
                  </div>
                  <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <CalendarClock className="h-6 w-6 text-pink-500" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-pink-300"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative border border-pink-100">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-pink-400">Messages</div>
                    <div className="text-3xl font-bold mt-2 text-pink-700">{data.totalUserMessages}</div>
                  </div>
                  <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-pink-500" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-pink-300"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative border border-pink-100">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-pink-400">Distress Level</div>
                    <div className="flex items-baseline mt-2">
                      <div className="text-3xl font-bold text-pink-700">{data.averageDistressScore}</div>
                      <div className="text-sm text-pink-400 ml-1">/10</div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-pink-500" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-pink-300"></div>
                <div className="mt-4 flex items-center text-sm">
                  {distressTrendDirection === "decreasing" ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">{trendPercentage()}% decrease</span>
                    </>
                  ) : distressTrendDirection === "increasing" ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-pink-500 font-medium">{trendPercentage()}% increase</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Stable</span>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative border border-pink-100">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-pink-400">Primary Emotion</div>
                    <div className="text-3xl font-bold mt-2 text-pink-700 capitalize">{data.dominantEmotion}</div>
                  </div>
                  <div className="h-12 w-12 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: `${emotionColors[data.dominantEmotion]}30` }}>
                    <Heart className="h-6 w-6" style={{ color: emotionColors[data.dominantEmotion] }} />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1" 
                     style={{ backgroundColor: emotionColors[data.dominantEmotion] }}></div>
              </div>
            </div>
            
            {/* Main Charts - Distress and Emotions Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-5 rounded-xl shadow-sm col-span-2 border border-pink-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-pink-700">Distress Level Trend</h2>
                  <span className="text-sm text-pink-400">Last {distressData.length} sessions</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={distressData}>
                      {renderGradients()}
                      <CartesianGrid stroke="#FBCFE8" strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: "#DB2777" }}
                        tickLine={false}
                        axisLine={{ stroke: '#FFC0CB' }}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fontSize: 12, fill: "#DB2777" }} 
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
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-pink-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-pink-700">Emotion Pattern</h2>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={emotionRadarData}>
                      {renderGradients()}
                      <PolarGrid stroke="#FBCFE8" />
                      <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 12, fill: "#DB2777" }} />
                      <PolarRadiusAxis tick={{ fontSize: 12, fill: "#DB2777" }} />
                      <Radar 
                        name="Emotions" 
                        dataKey="count" 
                        stroke="#F472B6" 
                        fill="#F472B6" 
                        fillOpacity={0.6} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recent Sessions */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-pink-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-pink-700">Recent Sessions</h2>
                <button 
                  className="text-pink-500 text-sm flex items-center hover:text-pink-700"
                  onClick={() => setActiveTab('sessions')}
                >
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentSessions.map((session) => (
                  <div key={session.sessionId} className="border border-pink-100 rounded-lg p-4 hover:bg-pink-50">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-pink-700">{session.sessionName}</h3>
                      <div className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
                        {session.averageDistress.toFixed(1)}/10
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{session.messageCount} messages</span>
                      <Clock className="h-4 w-4 ml-3 mr-1" />
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Emotions Tab */}
        {activeTab === 'emotions' && (
          <>
            {/* Emotion Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-pink-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-pink-700">Emotion Distribution</h2>
                </div>
                <div className="h-80">
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
                        outerRadius={80}
                        fill="#F472B6"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {emotionPieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={emotionColors[entry.name.toLowerCase()]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-pink-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-pink-700">Emotion Counts</h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.keys(data.emotionCounts)
                        .filter(emotion => emotion !== 'unknown')
                        .map(emotion => ({
                          name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
                          count: data.emotionCounts[emotion]
                        }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      {renderGradients()}
                      <CartesianGrid strokeDasharray="3 3" stroke="#FBCFE8" />
                      <XAxis 
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#DB2777" }}
                        tickLine={false}
                        axisLine={{ stroke: '#FFC0CB' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#DB2777" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="count" 
                        fill="url(#secondaryGradient)" 
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Emotion Over Time */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-pink-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-pink-700">Emotion Trend Over Time</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={emotionTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    {renderGradients()}
                    <CartesianGrid strokeDasharray="3 3" stroke="#FBCFE8" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#DB2777" }}
                      tickLine={false}
                      axisLine={{ stroke: '#FFC0CB' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "#DB2777" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.keys(emotionColors)
                      .filter(emotion => emotion !== 'unknown')
                      .map((emotion, index) => (
                        <Area
                          key={emotion}
                          type="monotone"
                          dataKey={emotion}
                          stackId="1"
                          stroke={emotionColors[emotion]}
                          fill={emotionColors[emotion]}
                          fillOpacity={0.6}
                        />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
        
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <>
            {/* Session Filters */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-pink-100 mb-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-pink-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <div className="relative inline-block">
                    <div className="flex items-center border border-pink-200 rounded-md px-3 py-2">
                      <Filter className="h-5 w-5 text-pink-400 mr-2" />
                      <select
                        className="appearance-none bg-transparent pr-8 focus:outline-none text-gray-700"
                        value={selectedFilters.distressLevel}
                        onChange={(e) => setSelectedFilters({...selectedFilters, distressLevel: e.target.value})}
                      >
                        <option value="all">All levels</option>
                        <option value="high">High distress</option>
                        <option value="medium">Medium distress</option>
                        <option value="low">Low distress</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pink-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative inline-block">
                    <div className="flex items-center border border-pink-200 rounded-md px-3 py-2">
                      <Calendar className="h-5 w-5 text-pink-400 mr-2" />
                      <select
                        className="appearance-none bg-transparent pr-8 focus:outline-none text-gray-700"
                        value={selectedFilters.dateRange}
                        onChange={(e) => setSelectedFilters({...selectedFilters, dateRange: e.target.value})}
                      >
                        <option value="all">All time</option>
                        <option value="week">Past week</option>
                        <option value="month">Past month</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pink-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  <button className="bg-pink-100 text-pink-600 px-4 py-2 rounded-md hover:bg-pink-200 flex items-center">
                    <Download className="h-5 w-5 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sessions List */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
              <div className="p-5 border-b border-pink-100">
                <h2 className="text-lg font-semibold text-pink-700">Session History</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-pink-100">
                  <thead className="bg-pink-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Session Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Messages</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Distress Level</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-pink-100">
                    {filteredSessions.map((session) => (
                      <tr key={session.sessionId} className="hover:bg-pink-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-pink-700">{session.sessionName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(session.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{session.messageCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.averageDistress >= 7 
                              ? 'bg-red-100 text-red-800' 
                              : session.averageDistress >= 4 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {session.averageDistress.toFixed(1)}/10
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSessions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <Info className="h-10 w-10 text-pink-300 mb-2" />
                            <p>No sessions match your filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-pink-100 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-pink-400">
            Emotional Wellness Dashboard • Data updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}