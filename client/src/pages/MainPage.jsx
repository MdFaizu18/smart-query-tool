import React, { useState } from 'react';
import axios from 'axios'; // Import axios

export default function InnovativeNewsResearchTool() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setShowAnswer(false);

    try {
      // Make the API request to the backend
      const response = await axios.post('http://localhost:5000/api/process', {
        urls: [url], // Pass the URL as an array
        question: question
      });

      // Set the answer from the response
      setAnswer(response.data.answer);
      setShowAnswer(true);
    } catch (error) {
      console.error('Error fetching answer:', error);
      setAnswer('An error occurred while fetching the answer. Please try again later.');
      setShowAnswer(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Insightful Query Tool</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your news URL..."
              className="w-full bg-gray-100 border-b-2 border-gray-300 py-3 px-4 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-300"
              required
            />
            <div className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></div>
          </div>

          <div className="relative group">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question..."
              className="w-full bg-gray-100 border-b-2 border-gray-300 py-3 px-4 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-300"
              required
            />
            <div className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full bg-blue-500 text-white rounded-lg py-3 px-6 font-semibold text-lg transition duration-300 ease-in-out transform hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
              }`}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {showAnswer && (
          <div className="mt-8 bg-gray-100 rounded-lg p-6 transform transition-all duration-500 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Result</h2>
            <p className="text-gray-700">{answer}</p>
            <div className="mt-4 flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Source: {url}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
