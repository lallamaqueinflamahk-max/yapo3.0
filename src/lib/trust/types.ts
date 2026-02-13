/**
 * TrustScore: reputación y confianza del usuario en YAPÓ.
 */

export interface TrustScore {
  userId: string;
  reports: number;
  completedJobs: number;
  biometricLevel: number;
  locationStability: number;
}
