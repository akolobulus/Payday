import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Award, Flame, Target, Trophy, Zap } from "lucide-react";
import type { User, Badge as UserBadge, DailyStreak } from "@shared/schema";

interface GamificationDashboardProps {
  user: User;
}

export default function GamificationDashboard({ user }: GamificationDashboardProps) {
  const { data: badges = [] } = useQuery<UserBadge[]>({
    queryKey: ['/api/badges', user.id],
  });

  const { data: streaks = [] } = useQuery<DailyStreak[]>({
    queryKey: ['/api/streaks', user.id],
  });

  const trustScorePercentage = Math.min((user.trustScore / 1000) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {user.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4 text-payday-yellow" />
              Gigs Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalGigsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-payday-blue" />
              Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.trustScore}</div>
            <Progress value={trustScorePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
            <p className="text-xs text-muted-foreground">
              Achievements unlocked
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Your Badges
          </CardTitle>
          <CardDescription>Achievements you've unlocked</CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Complete gigs to earn badges!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  data-testid={`badge-${badge.badgeType}`}
                >
                  <div className="flex items-start gap-3">
                    <Award className="w-8 h-8 text-payday-yellow flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">{badge.badgeName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {badge.badgeDescription}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned {new Date(badge.earnedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-payday-blue" />
            Next Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Trust Score: 500</p>
              <p className="text-sm text-muted-foreground">Unlock microloan access</p>
            </div>
            <Badge variant={user.trustScore >= 500 ? "default" : "outline"}>
              {user.trustScore >= 500 ? "Unlocked" : `${user.trustScore}/500`}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">7-Day Streak</p>
              <p className="text-sm text-muted-foreground">Earn Consistency badge</p>
            </div>
            <Badge variant={user.currentStreak >= 7 ? "default" : "outline"}>
              {user.currentStreak >= 7 ? "Unlocked" : `${user.currentStreak}/7`}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">10 Gigs Completed</p>
              <p className="text-sm text-muted-foreground">Earn Veteran badge</p>
            </div>
            <Badge variant={user.totalGigsCompleted >= 10 ? "default" : "outline"}>
              {user.totalGigsCompleted >= 10 ? "Unlocked" : `${user.totalGigsCompleted}/10`}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
