'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import  api  from '@/xlib/api';
import { PlusIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface FlashcardPack {
  id: number;
  title: string;
  description: string;
}

export default function EditPack() {
  const params = useParams();
  const packId = params.id;
  const [pack, setPack] = useState<FlashcardPack | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [adding, setAdding] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMethod, setGenerateMethod] = useState('topic');
  const [generateContent, setGenerateContent] = useState('');
  const [generateTopic, setGenerateTopic] = useState('');
  const [numCards, setNumCards] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    fetchPackData();
  }, [packId]);

  const fetchPackData = async () => {
    try {
      const [packsResponse, flashcardsResponse] = await Promise.all([
        api.get('/learning/packs'),
        api.get(`/learning/flashcards?pack_id=${packId}`)
      ]);
      
      const currentPack = packsResponse.data.find((p: FlashcardPack) => p.id === parseInt(packId as string));
      setPack(currentPack);
      setFlashcards(flashcardsResponse.data);
    } catch (error) {
      console.error('Failed to fetch pack data:', error);
      toast.error('Failed to load pack data');
    } finally {
      setLoading(false);
    }
  };

  const addFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setAdding(true);
    try {
      const response = await api.post('/learning/flashcards', {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        pack_id: packId
      });
      setFlashcards([...flashcards, response.data]);
      setNewQuestion('');
      setNewAnswer('');
      toast.success('Flashcard added!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add flashcard');
    } finally {
      setAdding(false);
    }
  };

  const deleteFlashcard = async (cardId: number) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    
    try {
      await api.delete(`/learning/flashcards/${cardId}`);
      setFlashcards(flashcards.filter(card => card.id !== cardId));
      toast.success('Flashcard deleted!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete flashcard');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|md|pdf)$/i)) {
      toast.error('Please select a .txt, .md, or .pdf file');
      return;
    }
    
    setSelectedFile(file);
    
    if (file.type === 'application/pdf') {
      toast.error('PDF support coming soon. Please use .txt or .md files for now.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setGenerateContent(content);
    };
    reader.readAsText(file);
  };

  const generateFlashcards = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      const payload: any = {
        method: generateMethod,
        pack_id: packId
      };
      
      if (generateMethod === 'textarea') {
        payload.content = generateContent;
      } else if (generateMethod === 'topic') {
        payload.topic = generateTopic;
        payload.num_cards = numCards;
      } else if (generateMethod === 'document') {
        payload.document_text = fileContent || generateContent;
        payload.num_cards = numCards;
      }
      
      const response = await api.post('/learning/generate', payload);
      setFlashcards([...flashcards, ...response.data.flashcards]);
      setShowGenerateModal(false);
      setGenerateContent('');
      setGenerateTopic('');
      setSelectedFile(null);
      setFileContent('');
      toast.success(`Generated ${response.data.created_flashcards_count} flashcards!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
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

  if (!pack) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pack not found</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{pack.title}</h1>
          <p className="text-gray-600 mt-2">{pack.description}</p>
        </div>

        {/* Add New Flashcard */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add New Flashcard</h2>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              AI Generate
            </button>
          </div>
          <form onSubmit={addFlashcard} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the question"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer *
              </label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the answer"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newQuestion.trim() || !newAnswer.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {adding ? 'Adding...' : 'Add Flashcard'}
            </button>
          </form>
        </div>

        {/* Existing Flashcards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Flashcards ({flashcards.length})
          </h2>
          
          {flashcards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No flashcards yet. Add your first one above!
            </div>
          ) : (
            <div className="grid gap-4">
              {flashcards.map((card, index) => (
                <div key={card.id || `card-${index}`} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Question</h3>
                        <p className="text-gray-700">{card.question}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Answer</h3>
                        <p className="text-gray-700">{card.answer}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFlashcard(card.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete flashcard"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generate Flashcards Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Generate Flashcards with AI</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={generateFlashcards}>
              {/* Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generation Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'topic', label: 'From Topic' },
                    { key: 'textarea', label: 'From Text' },
                    { key: 'document', label: 'From Document' }
                  ].map((method) => (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => setGenerateMethod(method.key)}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        generateMethod === method.key
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Method */}
              {generateMethod === 'topic' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic *
                    </label>
                    <input
                      type="text"
                      value={generateTopic}
                      onChange={(e) => setGenerateTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., JavaScript fundamentals, World War II, Biology"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Cards
                    </label>
                    <input
                      type="number"
                      value={numCards}
                      onChange={(e) => setNumCards(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="20"
                    />
                  </div>
                </>
              )}

              {/* Textarea Method */}
              {generateMethod === 'textarea' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={generateContent}
                    onChange={(e) => setGenerateContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter text content or use format: Question | Answer (one per line)"
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Use "Question | Answer" format for direct input, or paste any text for AI generation
                  </p>
                </div>
              )}

              {/* Document Method */}
              {generateMethod === 'document' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".txt,.md,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="text-gray-400 mb-2">
                          📄
                        </div>
                        <span className="text-sm text-gray-600">
                          Click to upload .txt, .md, or .pdf file
                        </span>
                        {selectedFile && (
                          <span className="text-sm text-blue-600 mt-2">
                            Selected: {selectedFile.name}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or Paste Document Text
                    </label>
                    <textarea
                      value={generateContent}
                      onChange={(e) => setGenerateContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Paste your document content here..."
                      rows={6}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Cards
                    </label>
                    <input
                      type="number"
                      value={numCards}
                      onChange={(e) => setNumCards(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="20"
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || (generateMethod === 'document' && !fileContent && !generateContent)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate Flashcards'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}