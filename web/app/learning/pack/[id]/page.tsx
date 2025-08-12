'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import  api  from '@/xlib/api';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export default function StudyPack() {
  const params = useParams();
  const router = useRouter();
  const packId = params.id;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStartTime] = useState(new Date());

  useEffect(() => {
    fetchFlashcards();
  }, [packId]);

  const fetchFlashcards = async () => {
    try {
      const response = await api.get(`/learning/flashcards?pack_id=${packId}`);
      setFlashcards(response.data);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyRating = async (difficulty: 'easy' | 'medium' | 'hard') => {
    const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 5 : 2;
    
    try {
      await api.post('/engagement/add-points', { points });
      setSessionStats(prev => ({ 
        correct: prev.correct + (difficulty !== 'hard' ? 1 : 0), 
        total: prev.total + 1 
      }));
    } catch (error) {
      console.error('Failed to add points:', error);
    }
    
    // Check if this was the last card
    if (currentIndex === flashcards.length - 1) {
      // Create study session record
      const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000);
      try {
        await api.post('/dashboard/sessions', {
          subject: 'Flashcards',
          duration_minutes: sessionDuration,
          completed: true,
          flashcards_reviewed: flashcards.length,
          correct_answers: sessionStats.correct + (difficulty !== 'hard' ? 1 : 0)
        });
      } catch (error) {
        console.error('Failed to create study session:', error);
      }
      
      setSessionComplete(true);
      setTimeout(() => {
        router.push('/learning');
      }, 2000);
    } else {
      nextCard();
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards in this pack</h3>
          <p className="text-gray-500">Add some flashcards to start studying!</p>
        </div>
      </Layout>
    );
  }

  const currentCard = flashcards[currentIndex];

  if (sessionComplete) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-green-600 mb-4">Session Complete!</h1>
            <p className="text-lg text-gray-700 mb-4">
              Final Score: {sessionStats.correct}/{sessionStats.total}
            </p>
            <p className="text-gray-500">Redirecting to flashcard packs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Study Session</h1>
            <div className="text-right">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {flashcards.length}
              </span>
              <div className="text-xs text-gray-400 mt-1">
                Score: {sessionStats.correct}/{sessionStats.total}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px] flex flex-col justify-center">
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {showAnswer ? 'Answer' : 'Question'}
              </h2>
              <p className="text-lg text-gray-700">
                {showAnswer ? currentCard.answer : currentCard.question}
              </p>
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 mb-8"
              >
                Show Answer
              </button>
            ) : (
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-4">How difficult was this card?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleDifficultyRating('easy')}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm"
                  >
                    Easy (+10 pts)
                  </button>
                  <button
                    onClick={() => handleDifficultyRating('medium')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 text-sm"
                  >
                    Medium (+5 pts)
                  </button>
                  <button
                    onClick={() => handleDifficultyRating('hard')}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                  >
                    Hard (+2 pts)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}