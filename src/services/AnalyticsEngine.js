/**
 * Analytics and Reporting Engine
 * Processes threat data and generates intelligence reports
 */

class AnalyticsEngine {
  constructor() {
    this.threatDatabase = [];
    this.reportCache = new Map();
    this.metrics = {
      totalThreatsProcessed: 0,
      averageResponseTime: 0,
      detectionAccuracy: 0,
    };
  }

  /**
   * Calculate threat severity score (0-100)
   */
  calculateThreatScore(threat) {
    let score = 0;

    // Risk level base score
    const riskScores = { critical: 40, high: 30, medium: 20, low: 10 };
    score += riskScores[threat.riskLevel] || 0;

    // Engagement multiplier (viral potential)
    const engagementScore = Math.min((threat.engagement / 1000) * 20, 20);
    score += engagementScore;

    // Platform reach factor
    const platformReachFactors = {
      github: 1.5, // Higher for code/technical repositories
      twitter: 1.3, // High viral potential
      reddit: 1.2, // Moderate reach
      linkedin: 1.1, // Professional reach
      darkweb: 2.0, // Most dangerous
      facebook: 1.0,
      instagram: 0.8,
    };
    const platformFactor = platformReachFactors[threat.platform.toLowerCase()] || 1.0;
    score = score * platformFactor;

    // Data sensitivity multiplier
    const sensitiveDataTypes = [
      'API Keys',
      'Customer Records',
      'Financial Data',
      'Database Schema',
    ];
    if (threat.dataType && sensitiveDataTypes.some((dt) => threat.dataType.includes(dt))) {
      score += 15;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Analyze threat patterns
   */
  analyzeThreatPatterns(threats) {
    const patterns = {
      byPlatform: {},
      byDataType: {},
      byRiskLevel: {},
      byTimeOfDay: {},
      byDayOfWeek: {},
      correlations: [],
    };

    threats.forEach((threat) => {
      // By Platform
      if (!patterns.byPlatform[threat.platform]) {
        patterns.byPlatform[threat.platform] = { count: 0, totalScore: 0 };
      }
      patterns.byPlatform[threat.platform].count += 1;
      patterns.byPlatform[threat.platform].totalScore += this.calculateThreatScore(threat);

      // By Data Type
      if (threat.dataType) {
        if (!patterns.byDataType[threat.dataType]) {
          patterns.byDataType[threat.dataType] = { count: 0, platforms: new Set() };
        }
        patterns.byDataType[threat.dataType].count += 1;
        patterns.byDataType[threat.dataType].platforms.add(threat.platform);
      }

      // By Risk Level
      if (!patterns.byRiskLevel[threat.riskLevel]) {
        patterns.byRiskLevel[threat.riskLevel] = 0;
      }
      patterns.byRiskLevel[threat.riskLevel] += 1;

      // By Time
      if (threat.dateDetected) {
        const date = new Date(threat.dateDetected);
        const hour = date.getHours();
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });

        patterns.byTimeOfDay[hour] = (patterns.byTimeOfDay[hour] || 0) + 1;
        patterns.byTimeOfDay[`day_${day}`] = (patterns.byTimeOfDay[`day_${day}`] || 0) + 1;
      }
    });

    // Convert Sets to arrays
    Object.keys(patterns.byDataType).forEach((key) => {
      patterns.byDataType[key].platforms = Array.from(patterns.byDataType[key].platforms);
    });

    // Identify correlations
    patterns.correlations = this.identifyCorrelations(threats);

    return patterns;
  }

  /**
   * Identify correlations between threats
   */
  identifyCorrelations(threats) {
    const correlations = [];

    // Same data type exposed across multiple platforms
    const dataTypeMap = {};
    threats.forEach((threat) => {
      if (threat.dataType) {
        if (!dataTypeMap[threat.dataType]) {
          dataTypeMap[threat.dataType] = [];
        }
        dataTypeMap[threat.dataType].push(threat);
      }
    });

    Object.entries(dataTypeMap).forEach(([dataType, threatList]) => {
      if (threatList.length > 1) {
        const platforms = [...new Set(threatList.map((t) => t.platform))];
        if (platforms.length > 1) {
          correlations.push({
            type: 'MULTI_PLATFORM_EXPOSURE',
            severity: 'high',
            dataType,
            affectedPlatforms: platforms,
            instanceCount: threatList.length,
            description: `${dataType} exposed across ${platforms.length} platforms`,
          });
        }
      }
    });

    // Same user across multiple threats
    const userMap = {};
    threats.forEach((threat) => {
      if (!userMap[threat.username]) {
        userMap[threat.username] = [];
      }
      userMap[threat.username].push(threat);
    });

    Object.entries(userMap).forEach(([username, threatList]) => {
      if (threatList.length > 1) {
        correlations.push({
          type: 'REPEAT_OFFENDER',
          severity: 'high',
          username,
          threatCount: threatList.length,
          platforms: [...new Set(threatList.map((t) => t.platform))],
          description: `User ${username} involved in ${threatList.length} threat incidents`,
        });
      }
    });

    return correlations;
  }

  /**
   * Generate comprehensive threat report
   */
  generateThreatReport(threats, timeframe = '7d') {
    const reportId = `report_${Date.now()}`;
    const report = {
      reportId,
      generatedAt: new Date(),
      timeframe,
      summary: {
        totalThreats: threats.length,
        criticalCount: threats.filter((t) => t.riskLevel === 'critical').length,
        highCount: threats.filter((t) => t.riskLevel === 'high').length,
        uniquePlatforms: [...new Set(threats.map((t) => t.platform))].length,
        uniqueDataTypes: [...new Set(threats.flatMap((t) => t.dataType))].length,
        averageThreatScore: Math.round(
          threats.reduce((sum, t) => sum + this.calculateThreatScore(t), 0) / threats.length
        ),
      },
      topThreats: this.identifyTopThreats(threats, 10),
      patterns: this.analyzeThreatPatterns(threats),
      riskAssessment: this.assessOverallRisk(threats),
      recommendations: this.generateActionItems(),
      metrics: {
        threatDensity: (threats.length / 7).toFixed(2), // Per day
        platformDispersion: this.calculateDispersion(threats),
        timelineAnalysis: this.analyzeTimeline(threats),
      },
    };

    // Cache report
    this.reportCache.set(reportId, report);
    return report;
  }

  /**
   * Identify top threats
   */
  identifyTopThreats(threats, limit = 10) {
    return threats
      .map((threat) => ({
        ...threat,
        threatScore: this.calculateThreatScore(threat),
      }))
      .sort((a, b) => b.threatScore - a.threatScore)
      .slice(0, limit)
      .map((threat, index) => ({
        rank: index + 1,
        ...threat,
      }));
  }

  /**
   * Assess overall organizational risk
   */
  assessOverallRisk(threats) {
    const scores = threats.map((t) => this.calculateThreatScore(t));
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const criticalCount = threats.filter((t) => t.riskLevel === 'critical').length;

    let overallRisk = 'LOW';
    if (maxScore >= 80 || criticalCount >= 5) overallRisk = 'CRITICAL';
    else if (avgScore >= 60 || criticalCount >= 2) overallRisk = 'HIGH';
    else if (avgScore >= 40) overallRisk = 'MEDIUM';

    return {
      level: overallRisk,
      score: Math.round(avgScore),
      maxScore: Math.round(maxScore),
      riskFactors: [
        `${criticalCount} critical threats detected`,
        `Average threat score: ${Math.round(avgScore)}/100`,
        `Maximum threat score: ${Math.round(maxScore)}/100`,
        `Total unique platforms affected: ${[...new Set(threats.map((t) => t.platform))].length}`,
      ],
      immediateActions: this.getImmediateActions(threats),
    };
  }

  /**
   * Get immediate action items
   */
  getImmediateActions(threats) {
    const actions = [];

    // Check for API key exposure
    if (threats.some((t) => t.dataType && t.dataType.includes('API'))) {
      actions.push({
        priority: 1,
        action: 'Revoke all exposed API keys',
        timeframe: 'IMMEDIATE',
        owner: 'Security Team',
      });
    }

    // Check for customer data
    if (threats.some((t) => t.dataType && t.dataType.includes('Customer'))) {
      actions.push({
        priority: 2,
        action: 'Initiate customer breach notification',
        timeframe: '24 hours',
        owner: 'Legal/PR',
      });
    }

    // Check for viral threats
    const viralThreats = threats.filter((t) => t.engagement > 5000);
    if (viralThreats.length > 0) {
      actions.push({
        priority: 3,
        action: 'Launch crisis communication response',
        timeframe: '4 hours',
        owner: 'Communications',
      });
    }

    // Check for dark web activity
    if (threats.some((t) => t.platform === 'Dark Web')) {
      actions.push({
        priority: 1,
        action: 'Engage dark web monitoring specialists',
        timeframe: 'IMMEDIATE',
        owner: 'Threat Intelligence',
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate platform dispersion
   */
  calculateDispersion(threats) {
    const platformCounts = {};
    threats.forEach((t) => {
      platformCounts[t.platform] = (platformCounts[t.platform] || 0) + 1;
    });

    const values = Object.values(platformCounts);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      platformCount: Object.keys(platformCounts).length,
      distribution: platformCounts,
      standardDeviation: stdDev.toFixed(2),
      dispersionLevel: stdDev > 5 ? 'HIGH' : stdDev > 2 ? 'MEDIUM' : 'LOW',
    };
  }

  /**
   * Analyze timeline of threats
   */
  analyzeTimeline(threats) {
    const timeline = {};

    threats.forEach((threat) => {
      if (threat.dateDetected) {
        const date = threat.dateDetected.substring(0, 10);
        timeline[date] = (timeline[date] || 0) + 1;
      }
    });

    const dates = Object.keys(timeline).sort();
    const trend = dates.length > 1 ? (timeline[dates[dates.length - 1]] > timeline[dates[0]] ? 'UP' : 'DOWN') : 'STABLE';

    return {
      dateRange: { start: dates[0], end: dates[dates.length - 1] },
      threatsPerDay: timeline,
      trend,
      peakDay: Object.keys(timeline).reduce((a, b) => (timeline[a] > timeline[b] ? a : b)),
    };
  }

  /**
   * Generate business impact analysis
   */
  generateImpactAnalysis(threats) {
    const impact = {
      financialRisk: this.estimateFinancialRisk(threats),
      reputationalRisk: this.estimateReputationalRisk(threats),
      operationalRisk: this.estimateOperationalRisk(threats),
      legalRisk: this.estimateLegalRisk(threats),
      summary: '',
    };

    const totalRisk = (impact.financialRisk + impact.reputationalRisk + impact.operationalRisk + impact.legalRisk) / 4;

    if (totalRisk > 75) {
      impact.summary = 'CRITICAL: Immediate executive and board notification required';
    } else if (totalRisk > 50) {
      impact.summary = 'HIGH: Significant risk requiring immediate action';
    } else if (totalRisk > 25) {
      impact.summary = 'MEDIUM: Moderate risk requiring prompt attention';
    } else {
      impact.summary = 'LOW: Manageable risk, monitor and document';
    }

    return impact;
  }

  /**
   * Estimate financial risk
   */
  estimateFinancialRisk(threats) {
    let risk = 0;

    // Check for customer data exposure
    const customerDataThreats = threats.filter((t) => t.dataType && t.dataType.includes('Customer'));
    risk += customerDataThreats.length * 15;

    // Check for financial data
    const financialThreats = threats.filter((t) => t.dataType && t.dataType.includes('Financial'));
    risk += financialThreats.length * 25;

    // Check for large engagement (expensive PR costs)
    const viralThreats = threats.filter((t) => t.engagement > 5000);
    risk += viralThreats.length * 10;

    return Math.min(risk, 100);
  }

  /**
   * Estimate reputational risk
   */
  estimateReputationalRisk(threats) {
    let risk = 0;

    // Viral threats impact reputation
    const viralThreats = threats.filter((t) => t.engagement > 5000);
    risk += viralThreats.length * 20;

    // Media coverage on major platforms
    const mediaPlatforms = threats.filter(
      (t) => ['Twitter', 'Reddit', 'LinkedIn'].includes(t.platform)
    );
    risk += mediaPlatforms.length * 10;

    // Critical severity
    const criticalThreats = threats.filter((t) => t.riskLevel === 'critical');
    risk += criticalThreats.length * 15;

    return Math.min(risk, 100);
  }

  /**
   * Estimate operational risk
   */
  estimateOperationalRisk(threats) {
    let risk = 0;

    // API key exposure affects operations
    const apiThreats = threats.filter((t) => t.dataType && t.dataType.includes('API'));
    risk += apiThreats.length * 25;

    // Database schema exposure
    const dbThreats = threats.filter((t) => t.dataType && t.dataType.includes('Database'));
    risk += dbThreats.length * 20;

    // Source code exposure
    const codeThreats = threats.filter((t) => t.dataType && t.dataType.includes('Source'));
    risk += codeThreats.length * 20;

    return Math.min(risk, 100);
  }

  /**
   * Estimate legal risk
   */
  estimateLegalRisk(threats) {
    let risk = 0;

    // GDPR/privacy law violations for customer data
    const customerThreats = threats.filter((t) => t.dataType && t.dataType.includes('Customer'));
    risk += customerThreats.length * 20;

    // Employee data (labor law implications)
    const employeeThreats = threats.filter((t) => t.dataType && t.dataType.includes('Employee'));
    risk += employeeThreats.length * 15;

    // Intellectual property (trade secret theft)
    const ipThreats = threats.filter((t) => t.dataType && t.dataType.includes('Source'));
    risk += ipThreats.length * 25;

    return Math.min(risk, 100);
  }

  /**
   * Generate action recommendations
   */
  generateActionItems() {
    const items = [];

    // Immediate actions
    items.push({
      timeframe: 'IMMEDIATE (0-2 hours)',
      actions: [
        'Alert security operations center (SOC)',
        'Notify CISO and executive leadership',
        'Begin threat intelligence assessment',
        'Prepare crisis communication template',
      ],
    });

    // Short-term actions
    items.push({
      timeframe: 'SHORT-TERM (2-24 hours)',
      actions: [
        'Conduct full damage assessment',
        'Identify all affected systems and data',
        'Begin incident response procedures',
        'Activate external incident response teams if needed',
        'Prepare customer/stakeholder notification',
      ],
    });

    // Medium-term actions
    items.push({
      timeframe: 'MEDIUM-TERM (1-7 days)',
      actions: [
        'Complete root cause analysis',
        'Implement temporary mitigations',
        'Execute customer notification campaign',
        'File incident reports with regulators if required',
        'Update security posture',
      ],
    });

    return items;
  }

  /**
   * Get cached report
   */
  getCachedReport(reportId) {
    return this.reportCache.get(reportId);
  }

  /**
   * Clear old cached reports (older than 30 days)
   */
  clearOldReports() {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const [id, report] of this.reportCache.entries()) {
      if (report.generatedAt.getTime() < thirtyDaysAgo) {
        this.reportCache.delete(id);
      }
    }
  }
}

export default AnalyticsEngine;
