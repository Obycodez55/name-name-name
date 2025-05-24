interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

interface GameAnalytics {
  gameStarted: Date;
  gameEnded?: Date;
  roomCode: string;
  playerCount: number;
  roundsPlayed: number;
  totalAnswers: number;
  playerStats: {
    playerId: string;
    playerName: string;
    totalScore: number;
    validAnswers: number;
    uniqueAnswers: number;
    averageResponseTime: number;
  }[];
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production' && 
                    process.env.REACT_APP_ANALYTICS_ENABLED === 'true';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track generic events
  track(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', event, properties);
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);
    this.sendEvent(analyticsEvent);
  }

  // Game-specific tracking methods
  trackGameStarted(roomCode: string, playerCount: number, gameConfig: any): void {
    this.track('game_started', {
      roomCode,
      playerCount,
      maxPlayers: gameConfig.maxPlayers,
      roundTimeLimit: gameConfig.roundTimeLimit,
      validationMode: gameConfig.validationMode,
      letterSelectionMode: gameConfig.letterSelectionMode,
      categories: gameConfig.categories,
    });
  }

  trackGameEnded(gameAnalytics: GameAnalytics): void {
    const gameDuration = gameAnalytics.gameEnded && gameAnalytics.gameStarted
      ? gameAnalytics.gameEnded.getTime() - gameAnalytics.gameStarted.getTime()
      : 0;

    this.track('game_ended', {
      ...gameAnalytics,
      gameDurationMs: gameDuration,
      averageScore: gameAnalytics.playerStats.reduce((sum, p) => sum + p.totalScore, 0) / gameAnalytics.playerStats.length,
    });
  }

  trackRoundCompleted(roundNumber: number, letter: string, categories: string[], playerStats: any[]): void {
    this.track('round_completed', {
      roundNumber,
      letter,
      categories,
      playerCount: playerStats.length,
      totalAnswers: playerStats.reduce((sum, p) => sum + (p.answersSubmitted || 0), 0),
      validAnswers: playerStats.reduce((sum, p) => sum + (p.validAnswers || 0), 0),
    });
  }

  trackPlayerJoined(roomCode: string, playerName: string, playerCount: number): void {
    this.track('player_joined', {
      roomCode,
      playerName: this.hashPlayerName(playerName),
      playerCount,
    });
  }

  trackPlayerLeft(roomCode: string, playerName: string, playerCount: number): void {
    this.track('player_left', {
      roomCode,
      playerName: this.hashPlayerName(playerName),
      playerCount,
    });
  }

  trackAnswerSubmitted(roundNumber: number, category: string, responseTime: number): void {
    this.track('answer_submitted', {
      roundNumber,
      category,
      responseTimeMs: responseTime,
    });
  }

  trackErrorOccurred(error: string, context?: Record<string, any>): void {
    this.track('error_occurred', {
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  trackPageView(page: string): void {
    this.track('page_view', {
      page,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  }

  trackFeatureUsed(feature: string, context?: Record<string, any>): void {
    this.track('feature_used', {
      feature,
      context,
    });
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track('performance_metric', {
      metric,
      value,
      unit,
    });
  }

  // User interaction tracking
  trackUserInteraction(interaction: string, element: string, context?: Record<string, any>): void {
    this.track('user_interaction', {
      interaction,
      element,
      context,
    });
  }

  // Privacy-preserving methods
  private hashPlayerName(playerName: string): string {
    // Simple hash for privacy - don't store actual player names
    let hash = 0;
    for (let i = 0; i < playerName.length; i++) {
      const char = playerName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `player_${Math.abs(hash)}`;
  }

  // Send event to analytics service
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // In a real implementation, you would send to your analytics service
      // For now, we'll just log and store locally
      console.log('Analytics event:', event);
      
      // Store in localStorage for now (in production, send to analytics service)
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      storedEvents.push(event);
      
      // Keep only last 100 events to prevent storage overflow
      if (storedEvents.length > 100) {
        storedEvents.splice(0, storedEvents.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Get stored events (for debugging or batch sending)
  getStoredEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored events:', error);
      return [];
    }
  }

  // Clear stored events
  clearStoredEvents(): void {
    localStorage.removeItem('analytics_events');
    this.events = [];
  }

  // Get session statistics
  getSessionStats(): {
    sessionId: string;
    eventsCount: number;
    sessionDuration: number;
    topEvents: Array<{ event: string; count: number }>;
  } {
    const eventCounts = this.events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEvents = Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([event, count]) => ({ event, count }));

    const sessionStart = this.events.length > 0 ? this.events[0].timestamp : new Date();
    const sessionDuration = Date.now() - sessionStart.getTime();

    return {
      sessionId: this.sessionId,
      eventsCount: this.events.length,
      sessionDuration,
      topEvents,
    };
  }
}

export const analytics = new AnalyticsService();
export default analytics;