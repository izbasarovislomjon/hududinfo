import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Puzzle, Trophy, Star, Play, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Memory Game Component
function MemoryGame() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Array<{ id: number; emoji: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const emojis = ['🏫', '🏥', '🛣️', '💧', '🏗️', '📚', '🌳', '🏠'];

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setGameStarted(true);
    setGameWon(false);
  };

  const flipCard = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          
          if (matchedCards.every(c => c.matched)) {
            setGameWon(true);
            saveScore('memory', Math.max(100 - moves * 2, 10));
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const saveScore = async (gameType: string, score: number) => {
    if (!user) return;
    try {
      await supabase.from('game_scores').insert({
        user_id: user.id,
        game_type: gameType,
        score,
        level: 1
      });
      toast.success(`Tabriklaymiz! ${score} ball yutdingiz!`);
    } catch (error) {
      console.error('Score save error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Harakatlar: {moves}
          </Badge>
        </div>
        <Button onClick={initGame} variant="outline" className="gap-2">
          {gameStarted ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {gameStarted ? "Qayta boshlash" : "O'yinni boshlash"}
        </Button>
      </div>

      {gameWon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center"
        >
          <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
          <h3 className="text-xl font-bold text-green-400">Tabriklaymiz!</h3>
          <p className="text-muted-foreground">{moves} harakatda yutdingiz!</p>
        </motion.div>
      )}

      {gameStarted && !gameWon && (
        <div className="grid grid-cols-4 gap-3">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.button
                key={card.id}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                onClick={() => flipCard(card.id)}
                className={`aspect-square rounded-lg text-3xl font-bold transition-all duration-300 ${
                  card.flipped || card.matched
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                } ${card.matched ? 'opacity-50' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <span style={{ transform: 'rotateY(180deg)', display: 'inline-block' }}>
                  {(card.flipped || card.matched) ? card.emoji : '?'}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!gameStarted && (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>O'yinni boshlash uchun tugmani bosing</p>
        </div>
      )}
    </div>
  );
}

// Quiz Game Component
function QuizGame() {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      question: "O'zbekistonda nechta viloyat bor?",
      answers: ["12 ta", "14 ta", "13 ta", "15 ta"],
      correct: 0
    },
    {
      question: "Toshkent shahri qachon poytaxt qilingan?",
      answers: ["1917-yil", "1930-yil", "1991-yil", "1866-yil"],
      correct: 3
    },
    {
      question: "O'zbekistonning eng katta shahri qaysi?",
      answers: ["Samarqand", "Toshkent", "Buxoro", "Namangan"],
      correct: 1
    },
    {
      question: "Amudaryo qaysi dengizga quyiladi?",
      answers: ["Kaspiy dengizi", "Qora dengiz", "Orol dengizi", "Boltiq dengizi"],
      correct: 2
    },
    {
      question: "O'zbekistonda birinchi maktab qachon ochilgan?",
      answers: ["1865-yil", "1918-yil", "1924-yil", "1991-yil"],
      correct: 1
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const selectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === questions[currentQuestion].correct) {
      setScore(s => s + 20);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameEnded(true);
        saveScore();
      }
    }, 1500);
  };

  const saveScore = async () => {
    if (!user) return;
    const finalScore = score + (selectedAnswer === questions[currentQuestion].correct ? 20 : 0);
    try {
      await supabase.from('game_scores').insert({
        user_id: user.id,
        game_type: 'quiz',
        score: finalScore,
        level: 1
      });
      toast.success(`Tabriklaymiz! ${finalScore} ball yutdingiz!`);
    } catch (error) {
      console.error('Score save error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg px-4 py-2">
          Ball: {score}
        </Badge>
        {!gameStarted && (
          <Button onClick={startGame} className="gap-2">
            <Play className="h-4 w-4" />
            O'yinni boshlash
          </Button>
        )}
        {gameEnded && (
          <Button onClick={startGame} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Qayta o'ynash
          </Button>
        )}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-primary/20 border border-primary/30 rounded-lg p-6 text-center"
        >
          <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
          <h3 className="text-xl font-bold">Test yakunlandi!</h3>
          <p className="text-muted-foreground">
            {questions.length} ta savoldan {score / 20} tasiga to'g'ri javob berdingiz
          </p>
        </motion.div>
      )}

      {gameStarted && !gameEnded && (
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>Savol {currentQuestion + 1}/{questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-1 rounded ${
                    i < currentQuestion ? 'bg-primary' : i === currentQuestion ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-6">
            {questions[currentQuestion].question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions[currentQuestion].answers.map((answer, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => selectAnswer(index)}
                disabled={showResult}
                className={`h-auto py-4 text-left justify-start transition-all ${
                  showResult && index === questions[currentQuestion].correct
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : showResult && index === selectedAnswer
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : ''
                }`}
              >
                {showResult && index === questions[currentQuestion].correct && (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                )}
                {showResult && index === selectedAnswer && index !== questions[currentQuestion].correct && (
                  <XCircle className="h-5 w-5 mr-2" />
                )}
                {answer}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {!gameStarted && !gameEnded && (
        <div className="text-center py-12 text-muted-foreground">
          <Puzzle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>O'zbekiston haqida bilimingizni sinab ko'ring!</p>
        </div>
      )}
    </div>
  );
}

// Leaderboard Component
function Leaderboard() {
  const { data: scores, isLoading } = useQuery({
    queryKey: ['game_scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*, profiles:user_id(full_name)')
        .order('score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : scores && scores.length > 0 ? (
        <div className="space-y-2">
          {scores.map((score, index) => (
            <div
              key={score.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index < 3 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-yellow-950' :
                  index === 1 ? 'bg-gray-300 text-gray-800' :
                  index === 2 ? 'bg-orange-400 text-orange-950' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">
                    {(score.profiles as any)?.full_name || 'Anonim'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {score.game_type === 'memory' ? 'Xotira' : 'Viktorina'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold">{score.score}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Hali hech kim o'ynamagan</p>
        </div>
      )}
    </div>
  );
}

export default function Games() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container-gov py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Aqliy o'yinlar</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Aqliy salohiyatingizni yaxshilovchi qiziqarli o'yinlar
          </p>
        </div>

        <Tabs defaultValue="memory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="memory" className="gap-2">
              <Brain className="h-4 w-4" />
              Xotira o'yini
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Puzzle className="h-4 w-4" />
              Viktorina
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Reyting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Xotira o'yini
                </CardTitle>
                <CardDescription>
                  Bir xil rasmlarni toping va xotirangizni mustahkamlang
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemoryGame />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-primary" />
                  Viktorina
                </CardTitle>
                <CardDescription>
                  O'zbekiston haqidagi savolarga javob bering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuizGame />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Eng yaxshi natijalar
                </CardTitle>
                <CardDescription>
                  Barcha o'yinchilar reytingi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Leaderboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
