import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Trophy, Star, Music, Target, Award, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number;
}

interface AchievementSystemProps {
  totalScore: number;
  songsCompleted: number;
  notesPlayed: number;
  onScoreUpdate: (newScore: number) => void;
}

export function AchievementSystem({ 
  totalScore, 
  songsCompleted, 
  notesPlayed, 
  onScoreUpdate 
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_steps',
      title: 'İlk Adım',
      description: '10 nota çal',
      icon: <Music className="w-5 h-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      reward: 50
    },
    {
      id: 'melody_maker',
      title: 'Melodi Ustası', 
      description: '100 nota çal',
      icon: <Star className="w-5 h-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      reward: 200
    },
    {
      id: 'song_bird',
      title: 'Şarkı Kuşu',
      description: '3 şarkı tamamla',
      icon: <Trophy className="w-5 h-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      reward: 150
    },
    {
      id: 'piano_master',
      title: 'Piyano Ustası',
      description: '500 puan topla',
      icon: <Target className="w-5 h-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 500,
      reward: 300
    },
    {
      id: 'perfect_score',
      title: 'Mükemmel Puan',
      description: 'Öğrenme modunda 100 puan al',
      icon: <Award className="w-5 h-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      reward: 500
    },
    {
      id: 'speed_demon',
      title: 'Hızlı Eller',
      description: '10 saniyede 20 nota çal',
      icon: <Zap className="w-5 h-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 20,
      reward: 250
    }
  ]);

  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  useEffect(() => {
    setAchievements(prev => prev.map(achievement => {
      let newProgress = achievement.progress;
      let unlocked = achievement.unlocked;

      switch (achievement.id) {
        case 'first_steps':
        case 'melody_maker':
          newProgress = Math.min(notesPlayed, achievement.maxProgress);
          break;
        case 'song_bird':
          newProgress = Math.min(songsCompleted, achievement.maxProgress);
          break;
        case 'piano_master':
          newProgress = Math.min(totalScore, achievement.maxProgress);
          break;
        case 'perfect_score':
          // This will be updated from learning mode
          break;
        case 'speed_demon':
          // This would need a special timer implementation
          break;
      }

      if (!unlocked && newProgress >= achievement.maxProgress) {
        unlocked = true;
        setNewlyUnlocked(prev => [...prev, achievement.id]);
        onScoreUpdate(totalScore + achievement.reward);
      }

      return {
        ...achievement,
        progress: newProgress,
        unlocked
      };
    }));
  }, [totalScore, songsCompleted, notesPlayed, onScoreUpdate]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  const dismissNotification = (id: string) => {
    setNewlyUnlocked(prev => prev.filter(achievementId => achievementId !== id));
  };

  return (
    <>
      {/* Achievement Notifications */}
      {newlyUnlocked.map((achievementId) => {
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) return null;

        return (
          <motion.div
            key={achievementId}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            onClick={() => dismissNotification(achievementId)}
          >
            <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <h4 className="text-white">Başarı Kazandın!</h4>
                  <p className="text-white/90 text-sm">{achievement.title}</p>
                  <p className="text-white/75 text-xs">+{achievement.reward} puan</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}

      {/* Achievement Panel */}
      <Card className="p-6 w-full max-w-md">
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h4>Başarılarım</h4>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm opacity-75">
              <span>{unlockedCount}/{totalAchievements} başarı tamamlandı</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0.6 }}
                animate={{ 
                  opacity: achievement.unlocked ? 1 : 0.6,
                  scale: achievement.unlocked ? 1.02 : 1 
                }}
                className={`p-3 rounded-lg border transition-all ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.unlocked 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {achievement.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold">{achievement.title}</h5>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Tamamlandı
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-75">{achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="mt-1">
                        <div className="flex justify-between text-xs opacity-60">
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                          <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1 mt-1">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {achievement.unlocked && (
                    <div className="text-right">
                      <div className="text-xs text-yellow-600 font-semibold">
                        +{achievement.reward}
                      </div>
                      <div className="text-xs opacity-60">puan</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}