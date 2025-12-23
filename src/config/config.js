/**
 * Configuration and Utility Module
 * Central configuration and helper functions for monitoring system
 */

export const PLATFORM_CONFIG = {
  TWITTER: {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    rateLimit: 450,
    rateLimitWindow: 900, // 15 minutes
    endpointLimit: 50,
    priority: 'high',
  },
  LINKEDIN: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    rateLimit: 180,
    rateLimitWindow: 900,
    endpointLimit: 50,
    priority: 'high',
  },
  REDDIT: {
    id: 'reddit',
    name: 'Reddit',
    icon: 'reddit',
    color: '#FF4500',
    rateLimit: 60,
    rateLimitWindow: 60,
    endpointLimit: 30,
    priority: 'medium',
  },
  GITHUB: {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    color: '#333333',
    rateLimit: 5000,
    rateLimitWindow: 3600,
    endpointLimit: 100,
    priority: 'critical',
  },
  FACEBOOK: {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    rateLimit: 200,
    rateLimitWindow: 900,
    endpointLimit: 25,
    priority: 'medium',
  },
  INSTAGRAM: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    rateLimit: 200,
    rateLimitWindow: 900,
    endpointLimit: 25,
    priority: 'low',
  },
  DARK_WEB: {
    id: 'darkweb',
    name: 'Dark Web',
    icon: 'alert-triangle',
    color: '#8B0000',
    rateLimit: 100,
    rateLimitWindow: 3600,
    endpointLimit: 50,
    priority: 'critical',
  },
};

export const RISK_LEVELS = {
  CRITICAL: { level: 'critical', severity: 4, color: '#ff4444', label: 'Critical' },
  HIGH: { level: 'high', severity: 3, color: '#ff9800', label: 'High' },
  MEDIUM: { level: 'medium', severity: 2, color: '#ffc107', label: 'Medium' },
  LOW: { level: 'low', severity: 1, color: '#4caf50', label: 'Low' },
};

export const DATA_EXPOSURE_TYPES = {
  EMPLOYEE_DATA: 'Employee Information',
  CUSTOMER_DATA: 'Customer Records',
  API_KEYS: 'API Keys/Secrets',
  DATABASE_SCHEMA: 'Database Schema',
  SOURCE_CODE: 'Source Code',
  FINANCIAL_DATA: 'Financial Data',
  CREDENTIALS: 'Authentication Credentials',
  INTELLECTUAL_PROPERTY: 'Intellectual Property',
  INFRASTRUCTURE: 'Infrastructure Details',
  STRATEGIC_INFO: 'Strategic Information',
};

export const THREAT_TYPES = {
  CREDENTIAL_EXPOSURE: 'Credential Exposure',
  DATA_BREACH: 'Data Breach',
  VULNERABILITY_DISCLOSURE: 'Vulnerability Disclosure',
  INSIDER_THREAT: 'Insider Threat',
  SOCIAL_ENGINEERING: 'Social Engineering Attempt',
  BRAND_IMPERSONATION: 'Brand Impersonation',
  MISINFORMATION: 'Misinformation Campaign',
  COMPETITOR_INTELLIGENCE: 'Competitor Intelligence Gathering',
  REGULATORY_EXPOSURE: 'Regulatory Exposure',
};

export const ALERT_SEVERITIES = {
  CRITICAL: { level: 'CRITICAL', score: 100, requiresEscalation: true },
  HIGH: { level: 'HIGH', score: 75, requiresEscalation: true },
  MEDIUM: { level: 'MEDIUM', score: 50, requiresEscalation: false },
  LOW: { level: 'LOW', score: 25, requiresEscalation: false },
};

export const MONITORING_KEYWORDS = {
  GENERAL: [
    'data breach',
    'leaked credentials',
    'security vulnerability',
    'confidential',
    'proprietary',
  ],
  COMPANY_SPECIFIC: ['company-name', 'ceo-name', 'product-name'],
  TECHNICAL: ['API key', 'database schema', 'source code', 'secret token'],
  EMPLOYEE: ['employee', 'staff', 'hiring', 'fired'],
  SECURITY: ['exploit', 'vulnerability', 'backdoor', 'attack'],
};

export const ACTION_TEMPLATES = {
  CONTENT_REMOVAL: {
    type: 'CONTENT_REMOVAL',
    platform: '',
    action: 'Request removal of sensitive content',
    priority: 'HIGH',
  },
  CREDENTIAL_REVOCATION: {
    type: 'CREDENTIAL_REVOCATION',
    platform: 'N/A',
    action: 'Revoke compromised credentials',
    priority: 'CRITICAL',
  },
  ACCOUNT_SUSPENSION: {
    type: 'ACCOUNT_SUSPENSION',
    platform: '',
    action: 'Request account suspension',
    priority: 'HIGH',
  },
  LEGAL_ACTION: {
    type: 'LEGAL_ACTION',
    platform: 'N/A',
    action: 'Initiate legal proceedings',
    priority: 'HIGH',
  },
  CUSTOMER_NOTIFICATION: {
    type: 'CUSTOMER_NOTIFICATION',
    platform: 'N/A',
    action: 'Notify affected customers',
    priority: 'CRITICAL',
  },
  REGULATORY_FILING: {
    type: 'REGULATORY_FILING',
    platform: 'N/A',
    action: 'File breach notification with regulators',
    priority: 'CRITICAL',
  },
};

/**
 * Utility Functions
 */

export const UtilityFunctions = {
  /**
   * Format date for display
   */
  formatDate: (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  /**
   * Format time for display
   */
  formatTime: (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime: (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return UtilityFunctions.formatDate(date);
  },

  /**
   * Sanitize text for display
   */
  sanitizeText: (text, maxLength = 200) => {
    if (!text) return '';
    let sanitized = text.trim();
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }
    return sanitized;
  },

  /**
   * Extract URLs from text
   */
  extractUrls: (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  },

  /**
   * Extract mentions from text
   */
  extractMentions: (text) => {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  },

  /**
   * Extract hashtags from text
   */
  extractHashtags: (text) => {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = [];
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  },

  /**
   * Obfuscate sensitive information
   */
  obfuscate: (text) => {
    if (!text) return '';
    // Obfuscate email
    if (text.includes('@')) {
      const [name, domain] = text.split('@');
      const maskedName = name.substring(0, 2) + '*'.repeat(name.length - 2);
      return `${maskedName}@${domain}`;
    }
    // Obfuscate general text
    if (text.length <= 4) {
      return '*'.repeat(text.length);
    }
    const revealed = Math.ceil(text.length / 4);
    return text.substring(0, revealed) + '*'.repeat(text.length - revealed);
  },

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate: (engagement, totalReach) => {
    if (totalReach === 0) return 0;
    return ((engagement / totalReach) * 100).toFixed(2);
  },

  /**
   * Get color based on risk level
   */
  getRiskColor: (riskLevel) => {
    return RISK_LEVELS[riskLevel?.toUpperCase()] || RISK_LEVELS.LOW;
  },

  /**
   * Get platform color
   */
  getPlatformColor: (platform) => {
    const config = Object.values(PLATFORM_CONFIG).find(
      (p) => p.name.toLowerCase() === platform?.toLowerCase()
    );
    return config?.color || '#999999';
  },

  /**
   * Format number with commas
   */
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Generate unique ID
   */
  generateId: (prefix = '') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  },

  /**
   * Validate email
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate URL
   */
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Calculate similarity between two strings (Levenshtein distance)
   */
  calculateStringSimilarity: (str1, str2) => {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    const levenshtein = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return ((maxLength - levenshtein) / maxLength * 100).toFixed(2);
  },

  /**
   * Parse threat severity from various sources
   */
  parseSeverity: (level) => {
    const normalized = level?.toLowerCase();
    if (['critical', 'critical'].includes(normalized)) return RISK_LEVELS.CRITICAL;
    if (['high', 'severe'].includes(normalized)) return RISK_LEVELS.HIGH;
    if (['medium', 'moderate'].includes(normalized)) return RISK_LEVELS.MEDIUM;
    return RISK_LEVELS.LOW;
  },

  /**
   * Get recommended SLA based on severity
   */
  getRecommendedSLA: (riskLevel) => {
    const slas = {
      CRITICAL: '1 hour',
      HIGH: '4 hours',
      MEDIUM: '8 hours',
      LOW: '24 hours',
    };
    return slas[riskLevel?.toUpperCase()] || slas.LOW;
  },

  /**
   * Format report for export
   */
  formatReportForExport: (report, format = 'json') => {
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else if (format === 'csv') {
      // CSV conversion logic
      return 'CSV format not yet implemented';
    } else if (format === 'pdf') {
      // PDF conversion logic
      return 'PDF format not yet implemented';
    }
    return report;
  },

  /**
   * Check if threat requires immediate escalation
   */
  requiresEscalation: (threat) => {
    const escalationCriteria = [
      threat.riskLevel === 'critical',
      threat.engagement > 10000,
      threat.dataType?.includes('Customer') || threat.dataType?.includes('Financial'),
      threat.platform === 'Dark Web',
    ];
    return escalationCriteria.some((criteria) => criteria);
  },
};

export default {
  PLATFORM_CONFIG,
  RISK_LEVELS,
  DATA_EXPOSURE_TYPES,
  THREAT_TYPES,
  ALERT_SEVERITIES,
  MONITORING_KEYWORDS,
  ACTION_TEMPLATES,
  UtilityFunctions,
};
