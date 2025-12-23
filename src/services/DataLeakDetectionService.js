/**
 * Data Leak Detection Service
 * Monitors and analyzes data exposure across social media platforms
 */

class DataLeakDetectionService {
  constructor() {
    this.detectedLeaks = [];
    this.threatIntelligence = [];
    this.monitoredKeywords = [
      'credentials',
      'API key',
      'password',
      'secret',
      'token',
      'database',
      'schema',
      'employee records',
      'customer data',
      'confidential',
      'proprietary',
      'source code',
      'vulnerability',
      'exploit',
      'breach',
    ];
    this.suspiciousPatterns = [
      /([A-Za-z0-9]{20,})/g, // Potential API keys
      /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g, // IP addresses
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
      /\b[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g, // Credit card patterns
    ];
  }

  /**
   * Analyze social media content for data leaks
   */
  analyzeSocialMediaContent(content, platform, username, timestamp) {
    const analysis = {
      timestamp,
      platform,
      username,
      originalContent: content,
      detectedLeaks: [],
      riskLevel: 'low',
      dataExposed: [],
      matchedKeywords: [],
      suspiciousElements: [],
      confidenceScore: 0,
    };

    // Check for monitored keywords
    const keywordMatches = this.detectKeywords(content);
    analysis.matchedKeywords = keywordMatches;

    // Check for suspicious patterns
    const patterns = this.detectSuspiciousPatterns(content);
    analysis.suspiciousElements = patterns;

    // Determine data exposure types
    const dataTypes = this.classifyDataExposure(content, keywordMatches);
    analysis.dataExposed = dataTypes;

    // Calculate risk level
    analysis.riskLevel = this.calculateRiskLevel(keywordMatches, patterns, dataTypes);
    analysis.confidenceScore = this.calculateConfidenceScore(keywordMatches, patterns);

    return analysis;
  }

  /**
   * Detect keywords related to data leaks
   */
  detectKeywords(content) {
    const matches = [];
    const lowerContent = content.toLowerCase();

    this.monitoredKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        const regex = new RegExp(keyword, 'gi');
        const count = (content.match(regex) || []).length;
        matches.push({
          keyword,
          count,
          occurrences: this.findOccurrences(content, keyword),
        });
      }
    });

    return matches;
  }

  /**
   * Find exact occurrences of a keyword in content
   */
  findOccurrences(content, keyword) {
    const regex = new RegExp(`(\\S*${keyword}\\S*)`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        text: match[1],
        index: match.index,
      });
    }
    return matches;
  }

  /**
   * Detect suspicious patterns like APIs, IPs, etc.
   */
  detectSuspiciousPatterns(content) {
    const patterns = [];

    // API Key pattern
    const apiKeyMatches = content.match(/([A-Za-z0-9]{32,})/g) || [];
    if (apiKeyMatches.length > 0) {
      patterns.push({
        type: 'API_KEY',
        severity: 'critical',
        matches: apiKeyMatches.slice(0, 5), // Limit to first 5
        count: apiKeyMatches.length,
      });
    }

    // IP Address pattern
    const ipMatches = content.match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g) || [];
    if (ipMatches.length > 0) {
      patterns.push({
        type: 'IP_ADDRESS',
        severity: 'high',
        matches: ipMatches,
        count: ipMatches.length,
      });
    }

    // Email addresses
    const emailMatches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    if (emailMatches.length > 0) {
      patterns.push({
        type: 'EMAIL_ADDRESS',
        severity: 'medium',
        matches: emailMatches.slice(0, 5),
        count: emailMatches.length,
      });
    }

    // Credit card patterns
    const ccMatches = content.match(/\b[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g) || [];
    if (ccMatches.length > 0) {
      patterns.push({
        type: 'CREDIT_CARD',
        severity: 'critical',
        matches: ccMatches,
        count: ccMatches.length,
      });
    }

    // Database connection strings
    if (content.match(/mongodb|postgresql|mysql|oracle/i)) {
      patterns.push({
        type: 'DATABASE_CONNECTION',
        severity: 'critical',
        matches: ['Potential database credentials found'],
        count: 1,
      });
    }

    return patterns;
  }

  /**
   * Classify the type of data that might be exposed
   */
  classifyDataExposure(content, keywords) {
    const dataTypes = new Set();

    // Keyword-based classification
    keywords.forEach((kw) => {
      const keyword = kw.keyword.toLowerCase();
      if (keyword.includes('employee') || keyword.includes('staff')) {
        dataTypes.add('Employee Information');
      }
      if (keyword.includes('customer') || keyword.includes('user')) {
        dataTypes.add('Customer Records');
      }
      if (keyword.includes('api') || keyword.includes('key')) {
        dataTypes.add('API Keys/Secrets');
      }
      if (keyword.includes('database') || keyword.includes('schema')) {
        dataTypes.add('Database Schema');
      }
      if (keyword.includes('password') || keyword.includes('credentials')) {
        dataTypes.add('Authentication Credentials');
      }
      if (keyword.includes('source') || keyword.includes('code')) {
        dataTypes.add('Source Code');
      }
      if (keyword.includes('financial') || keyword.includes('salary')) {
        dataTypes.add('Financial Data');
      }
    });

    // Pattern-based classification
    const contentLower = content.toLowerCase();
    if (contentLower.includes('salary') || contentLower.includes('payment')) {
      dataTypes.add('Financial Data');
    }
    if (contentLower.includes('vulnerability') || contentLower.includes('exploit')) {
      dataTypes.add('Security Vulnerability');
    }
    if (contentLower.includes('project') || contentLower.includes('roadmap')) {
      dataTypes.add('Strategic Information');
    }

    return Array.from(dataTypes);
  }

  /**
   * Calculate overall risk level
   */
  calculateRiskLevel(keywords, patterns, dataTypes) {
    let riskScore = 0;

    // Pattern severity scores
    patterns.forEach((pattern) => {
      if (pattern.severity === 'critical') riskScore += 40;
      else if (pattern.severity === 'high') riskScore += 25;
      else if (pattern.severity === 'medium') riskScore += 15;
    });

    // Keyword count affects risk
    const keywordCount = keywords.reduce((sum, kw) => sum + kw.count, 0);
    riskScore += Math.min(keywordCount * 5, 30);

    // Data type count affects risk
    riskScore += dataTypes.length * 8;

    // Determine level based on score
    if (riskScore >= 70) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence score for detection accuracy
   */
  calculateConfidenceScore(keywords, patterns) {
    let confidence = 0;

    // More patterns = higher confidence
    confidence += Math.min(patterns.length * 15, 50);

    // More keywords = higher confidence
    confidence += Math.min(keywords.length * 5, 30);

    // Additional confidence boosts
    if (patterns.length > 0) confidence += 10;
    if (keywords.length > 3) confidence += 10;

    return Math.min(confidence, 100);
  }

  /**
   * Track and aggregate leaks by type
   */
  aggregateLeaksByType(leakAnalyses) {
    const aggregation = {};

    leakAnalyses.forEach((analysis) => {
      analysis.dataExposed.forEach((dataType) => {
        if (!aggregation[dataType]) {
          aggregation[dataType] = {
            type: dataType,
            instances: 0,
            platforms: new Set(),
            severity: 'low',
            records: 0,
          };
        }
        aggregation[dataType].instances += 1;
        aggregation[dataType].platforms.add(analysis.platform);
        aggregation[dataType].severity = this.determineSeverity(
          aggregation[dataType].severity,
          analysis.riskLevel
        );
      });
    });

    // Convert to array and add platform count
    return Object.values(aggregation).map((item) => ({
      ...item,
      platforms: Array.from(item.platforms),
      platformCount: item.platforms.size,
    }));
  }

  /**
   * Determine highest severity between two levels
   */
  determineSeverity(current, incoming) {
    const severityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityMap[incoming] > severityMap[current] ? incoming : current;
  }

  /**
   * Generate recommendations based on detected leaks
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.riskLevel === 'critical') {
      recommendations.push({
        priority: 'URGENT',
        action: 'Immediately revoke and rotate all exposed credentials',
        target: 'Security Team',
      });
      recommendations.push({
        priority: 'URGENT',
        action: 'Issue press release acknowledging the data exposure',
        target: 'PR/Communications',
      });
    }

    if (analysis.suspiciousElements.some((el) => el.type === 'API_KEY')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Regenerate all exposed API keys immediately',
        target: 'DevOps/Security',
      });
    }

    if (analysis.suspiciousElements.some((el) => el.type === 'CREDIT_CARD')) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Contact payment processor and file fraud report',
        target: 'Finance/Legal',
      });
    }

    if (analysis.dataExposed.includes('Employee Information')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Notify affected employees and offer credit monitoring',
        target: 'HR',
      });
    }

    if (analysis.dataExposed.includes('Customer Records')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Prepare customer notification and breach disclosure',
        target: 'Legal/Compliance',
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      action: `Request content removal from ${analysis.platform}`,
      target: 'Social Media Management',
    });

    recommendations.push({
      priority: 'MEDIUM',
      action: 'File incident report and document for audit trail',
      target: 'Risk Management',
    });

    return recommendations;
  }

  /**
   * Monitor a user/account for suspicious activity
   */
  monitorUserAccount(username, platform) {
    return {
      username,
      platform,
      monitoringStatus: 'ACTIVE',
      alerts: [],
      lastChecked: new Date(),
      checkInterval: 'REAL_TIME',
      actions: [
        'Track new posts',
        'Monitor followers',
        'Analyze engagement patterns',
        'Detect content changes',
      ],
    };
  }

  /**
   * Create a threat intelligence report
   */
  generateThreatReport(leakAnalyses, timeframe = '24h') {
    const report = {
      generated: new Date(),
      timeframe,
      totalIncidents: leakAnalyses.length,
      criticalIncidents: leakAnalyses.filter((l) => l.riskLevel === 'critical').length,
      highRiskIncidents: leakAnalyses.filter((l) => l.riskLevel === 'high').length,
      affectedPlatforms: [...new Set(leakAnalyses.map((l) => l.platform))],
      dataTypesExposed: [
        ...new Set(leakAnalyses.flatMap((l) => l.dataExposed)),
      ],
      topThreats: this.identifyTopThreats(leakAnalyses),
      recommendations: this.aggregateRecommendations(leakAnalyses),
    };

    return report;
  }

  /**
   * Identify top threats based on severity and reach
   */
  identifyTopThreats(leakAnalyses) {
    return leakAnalyses
      .sort((a, b) => {
        const severityMap = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityMap[b.riskLevel] - severityMap[a.riskLevel];
      })
      .slice(0, 5)
      .map((threat, index) => ({
        rank: index + 1,
        platform: threat.platform,
        username: threat.username,
        riskLevel: threat.riskLevel,
        dataExposed: threat.dataExposed,
        confidenceScore: threat.confidenceScore,
      }));
  }

  /**
   * Aggregate recommendations from multiple analyses
   */
  aggregateRecommendations(leakAnalyses) {
    const recommendationMap = {};

    leakAnalyses.forEach((analysis) => {
      const recs = this.generateRecommendations(analysis);
      recs.forEach((rec) => {
        const key = rec.action;
        if (!recommendationMap[key]) {
          recommendationMap[key] = {
            ...rec,
            frequency: 0,
            relatedIncidents: [],
          };
        }
        recommendationMap[key].frequency += 1;
        recommendationMap[key].relatedIncidents.push({
          platform: analysis.platform,
          username: analysis.username,
        });
      });
    });

    return Object.values(recommendationMap)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }
}

export default DataLeakDetectionService;
