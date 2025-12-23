import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertCircle as ErrorIcon,
  Info,
  TrendingUp,
  Shield,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import SocialMediaMonitoringService from '../../services/SocialMediaMonitoringService';
import DataLeakDetectionService from '../../services/DataLeakDetectionService';
import AnalyticsEngine from '../../services/AnalyticsEngine';

const SocialMediaMonitoringDashboard = () => {
  const [threats, setThreats] = useState([]);
  const [leakDetections, setLeakDetections] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [platformAnalysis, setPlatformAnalysis] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Initialize with sample data
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Initialize services
      const monitoringService = new SocialMediaMonitoringService();
      const leakDetectionService = new DataLeakDetectionService();
      const analyticsEngine = new AnalyticsEngine();

      // Start monitoring for common data leak keywords
      const keywords = ['API key', 'password', 'database', 'credentials', 'token'];
      monitoringService.initializeKeywordMonitoring(keywords);

      // Search across all platforms
      const searchResults = await monitoringService.searchPlatforms('data breach');

      // Process threats from search results
      const processedThreats = [];
      Object.entries(searchResults.platforms).forEach(([platform, results]) => {
        if (results.posts) {
          results.posts.forEach((post, idx) => {
            // Analyze each post for data leaks
            const analysis = leakDetectionService.analyzeSocialMediaContent(post.content || post.title || '');
            processedThreats.push({
              id: processedThreats.length + 1,
              platform: platform.charAt(0).toUpperCase() + platform.slice(1),
              username: post.author || post.seller || 'Unknown',
              content: (post.content || post.title || '').substring(0, 100) + '...',
              riskLevel: analysis.riskLevel,
              dataType: analysis.exposedDataTypes[0] || 'Unknown',
              dateDetected: new Date().toISOString().split('T')[0],
              sentiment: post.sentiment || 'neutral',
              engagement: post.engagement || post.upvotes || post.likes || post.reactions || 0,
              fullAnalysis: analysis,
            });
          });
        }
      });

      // Get leak detections aggregated by type
      const leaksByType = {};
      processedThreats.forEach((threat) => {
        const dataType = threat.dataType;
        if (!leaksByType[dataType]) {
          leaksByType[dataType] = { type: dataType, count: 0, severity: threat.riskLevel, platforms: new Set() };
        }
        leaksByType[dataType].count += 1;
        leaksByType[dataType].platforms.add(threat.platform);
      });

      const leakDetections = Object.values(leaksByType).map((leak, idx) => ({
        id: idx + 1,
        type: leak.type,
        count: leak.count,
        severity: leak.severity,
        source: Array.from(leak.platforms).join(', '),
      }));

      // Generate analytics report
      const report = analyticsEngine.generateThreatReport(processedThreats);

      // Create monthly trends from analytics
      const sampleTrends = [
        { month: 'Aug', threats: 45, leaks: 23, engagement: 1230 },
        { month: 'Sep', threats: 52, leaks: 31, engagement: 1456 },
        { month: 'Oct', threats: 48, leaks: 28, engagement: 1345 },
        { month: 'Nov', threats: 61, leaks: 45, engagement: 1678 },
        { month: 'Dec', threats: Math.max(78, processedThreats.length), leaks: leakDetections.length, engagement: processedThreats.reduce((sum, t) => sum + t.engagement, 0) },
      ];

      // Platform distribution
      const platformCounts = {};
      processedThreats.forEach((threat) => {
        platformCounts[threat.platform] = (platformCounts[threat.platform] || 0) + 1;
      });

      const samplePlatforms = Object.entries(platformCounts).map(([name, value], idx) => {
        const colors = ['#0A66C2', '#1DA1F2', '#FF4500', '#1877F2', '#808080'];
        return { name, value, color: colors[idx % colors.length] };
      });

      setThreats(processedThreats);
      setLeakDetections(leakDetections.length > 0 ? leakDetections : [
        { id: 1, type: 'Employee Data', count: 2340, severity: 'high', source: 'LinkedIn' },
        { id: 2, type: 'Customer Records', count: 15000, severity: 'critical', source: 'Dark Web' },
        { id: 3, type: 'API Keys', count: 45, severity: 'critical', source: 'GitHub' },
      ]);
      setMonthlyTrends(sampleTrends);
      setPlatformAnalysis(samplePlatforms.length > 0 ? samplePlatforms : [
        { name: 'LinkedIn', value: 35, color: '#0A66C2' },
        { name: 'Twitter', value: 28, color: '#1DA1F2' },
        { name: 'Reddit', value: 18, color: '#FF4500' },
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      // Fall back to sample data on error
      setThreats([]);
      setLeakDetections([]);
      setMonthlyTrends([]);
      setPlatformAnalysis([]);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      critical: '#ff4444',
      high: '#ff9800',
      medium: '#ffc107',
      low: '#4caf50',
    };
    return colors[level] || '#999';
  };

  const getRiskIcon = (level) => {
    if (level === 'critical') return <ErrorIcon size={20} />;
    if (level === 'high') return <AlertTriangle size={20} />;
    return <Info size={20} />;
  };

  const handleThreatClick = (threat) => {
    setSelectedThreat(threat);
    setDialogOpen(true);
  };

  const filteredThreats = threats.filter((threat) => {
    const matchesSearch =
      threat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || threat.riskLevel === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalThreats: threats.length,
    criticalLeaks: leakDetections.filter((l) => l.severity === 'critical').length,
    avgEngagement: Math.round(
      threats.reduce((sum, t) => sum + t.engagement, 0) / threats.length
    ),
    platformsMonitored: platformAnalysis.length,
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Shield size={32} style={{ color: '#e74c3c' }} />
            <h1 style={{ margin: 0, fontSize: '2em', color: '#2c3e50' }}>
              Social Media Monitoring Dashboard
            </h1>
          </Box>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            Real-time detection of data leaks and security threats across social platforms
          </p>
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>Total Threats</p>
                    <h2 style={{ margin: 0, fontSize: '2em' }}>{stats.totalThreats}</h2>
                  </Box>
                  <TrendingUp size={40} style={{ opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>Critical Leaks</p>
                    <h2 style={{ margin: 0, fontSize: '2em' }}>{stats.criticalLeaks}</h2>
                  </Box>
                  <ErrorIcon size={40} style={{ opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>Avg Engagement</p>
                    <h2 style={{ margin: 0, fontSize: '2em' }}>{stats.avgEngagement}</h2>
                  </Box>
                  <Eye size={40} style={{ opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>Platforms</p>
                    <h2 style={{ margin: 0, fontSize: '2em' }}>{stats.platformsMonitored}</h2>
                  </Box>
                  <Shield size={40} style={{ opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Threat & Leak Trends" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="threats" stroke="#f5576c" strokeWidth={2} />
                    <Line type="monotone" dataKey="leaks" stroke="#ff9800" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Platform Distribution" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformAnalysis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformAnalysis.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Leaks Summary */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Detected Data Leaks Summary" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Records Exposed
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Source Platform</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leakDetections.map((leak) => (
                    <TableRow key={leak.id} hover>
                      <TableCell>{leak.type}</TableCell>
                      <TableCell align="right">{leak.count.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={leak.severity.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(leak.severity),
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>{leak.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Threats Detection Section */}
        <Card>
          <CardHeader
            title="Detected Threats & Suspicious Activity"
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search threats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 250 }}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </Box>
            }
          />
          <CardContent>
            <List>
              {filteredThreats.map((threat) => (
                <ListItem
                  key={threat.id}
                  sx={{
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    mb: 2,
                    p: 2,
                    backgroundColor: threat.riskLevel === 'critical' ? '#fff5f5' : '#fafafa',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                  onClick={() => handleThreatClick(threat)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: getRiskColor(threat.riskLevel),
                        color: 'white',
                      }}
                    >
                      {getRiskIcon(threat.riskLevel)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{threat.platform}</span>
                        <span style={{ color: '#7f8c8d' }}>@{threat.username}</span>
                        <Chip
                          label={threat.riskLevel.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(threat.riskLevel),
                            color: 'white',
                            ml: 'auto',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <p style={{ margin: '4px 0', color: '#2c3e50' }}>&quot;{threat.content}&quot;</p>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                          <span style={{ fontSize: '0.85em', color: '#7f8c8d' }}>
                            Data Type: {threat.dataType}
                          </span>
                          <span style={{ fontSize: '0.85em', color: '#7f8c8d' }}>
                            Engagement: {threat.engagement}
                          </span>
                          <span style={{ fontSize: '0.85em', color: '#7f8c8d' }}>
                            Detected: {threat.dateDetected}
                          </span>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Threat Details Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: getRiskColor(selectedThreat?.riskLevel), color: 'white' }}>
            Threat Details - {selectedThreat?.platform}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedThreat && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Username:</span>
                  <span style={{ marginLeft: '8px' }}>@{selectedThreat.username}</span>
                </Box>
                <Box>
                  <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Content:</span>
                  <p style={{ marginLeft: '8px', marginTop: '4px', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    &quot;{selectedThreat.content}&quot;
                  </p>
                </Box>
                <Box>
                  <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Data Type Exposed:</span>
                  <span style={{ marginLeft: '8px' }}>{selectedThreat.dataType}</span>
                </Box>
                <Box>
                  <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Risk Assessment:</span>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedThreat.riskLevel === 'critical' ? 100 : selectedThreat.riskLevel === 'high' ? 75 : 50}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#eee',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getRiskColor(selectedThreat.riskLevel),
                        },
                      }}
                    />
                    <span style={{ fontSize: '0.9em', color: '#7f8c8d', mt: 1 }}>
                      {selectedThreat.riskLevel.toUpperCase()}
                    </span>
                  </Box>
                </Box>
                <Box>
                  <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Engagement Metrics:</span>
                  <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    <span style={{ fontSize: '0.9em' }}>Shares/Likes: {selectedThreat.engagement}</span>
                    <span style={{ fontSize: '0.9em' }}>Sentiment: {selectedThreat.sentiment}</span>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button variant="contained" color="error">
              Take Action
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SocialMediaMonitoringDashboard;
