import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DigitalLiteracyTest from './DigitalLiteracyTest';
import HardwareKnowledgeTest from './HardwareKnowledgeTest';

const Index = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  
  const tests = [
    {
      id: 'software',
      title: 'Digital Literacy: Software Skills',
      description: 'Test your ability to navigate operating systems, use applications, and evaluate online information.',
      icon: '💻',
      component: <DigitalLiteracyTest />
    },
    {
      id: 'hardware',
      title: 'Computer Hardware Knowledge',
      description: 'Identify computer components, understand connections, and troubleshoot common hardware issues.',
      icon: '🔧',
      component: <HardwareKnowledgeTest />
    }
  ];

  // Return to test selection
  const handleBackToIndex = () => {
    setSelectedTest(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Digital Skills Assessment Center</h1>
        <p className="text-gray-600">Test and improve your computer literacy with our interactive simulations</p>
      </header>

      {!selectedTest ? (
        <div className="grid md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <div 
              key={test.id}
              className="border rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
              onClick={() => setSelectedTest(test.id)}
            >
              <div className="text-4xl mb-4">{test.icon}</div>
              <h2 className="text-xl font-bold mb-2 text-blue-600">{test.title}</h2>
              <p className="text-gray-700 mb-4">{test.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Estimated time: 10-15 minutes
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Start Test
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button 
            onClick={handleBackToIndex}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <span className="mr-1">←</span> Back to test selection
          </button>
          
          {/* Render the selected test component */}
          {tests.find(test => test.id === selectedTest)?.component}
        </div>
      )}

      <footer className="mt-12 pt-4 border-t border-gray-200 text-center text-gray-600 text-sm">
        <p>© 2025 Digital Skills Assessment Center</p>
        <p className="mt-1">All tests are designed for educational purposes and self-assessment.</p>
      </footer>
    </div>
  );
};

export default Index;