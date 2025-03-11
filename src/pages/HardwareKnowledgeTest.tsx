import React, { useState, useEffect } from 'react';

const HardwareKnowledgeTest = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTargets, setDropTargets] = useState({
    cpu: null,
    ram: null,
    gpu: null,
    motherboard: null,
    storage: null
  });
  const [showHint, setShowHint] = useState(false);

  // Hardware components with their images and descriptions
  const components = [
    { 
      id: 'cpu', 
      name: 'CPU', 
      fullName: 'Central Processing Unit',
      image: '🧠', 
      description: 'The "brain" of the computer that executes instructions.'
    },
    { 
      id: 'ram', 
      name: 'RAM', 
      fullName: 'Random Access Memory',
      image: '🧩', 
      description: 'Temporary memory used to store working data for quick access.'
    },
    { 
      id: 'gpu', 
      name: 'GPU', 
      fullName: 'Graphics Processing Unit',
      image: '🖼️', 
      description: 'Specialized processor for rendering images and video.'
    },
    { 
      id: 'motherboard', 
      name: 'Motherboard', 
      fullName: 'Motherboard',
      image: '🔌', 
      description: 'The main circuit board that connects all components together.'
    },
    { 
      id: 'storage', 
      name: 'Storage', 
      fullName: 'Hard Drive/SSD',
      image: '💾', 
      description: 'Device used to store permanent data and programs.'
    }
  ];

  // Test questions for hardware knowledge
  const questions = [
    {
      type: 'multiple-choice',
      question: 'Which component is considered the "brain" of the computer?',
      options: ['Hard Drive', 'RAM', 'CPU', 'Motherboard'],
      correctAnswer: 'CPU',
      explanation: 'The CPU (Central Processing Unit) is considered the brain because it processes instructions from programs.'
    },
    {
      type: 'multiple-choice',
      question: 'What happens if you add more RAM to your computer?',
      options: [
        'Your computer can store more files permanently',
        'Your computer can run more programs at once',
        'Your computer will run cooler',
        'Your internet will be faster'
      ],
      correctAnswer: 'Your computer can run more programs at once',
      explanation: 'RAM (Random Access Memory) is temporary memory used while programs are running. More RAM allows for more programs or larger files to be open simultaneously.'
    },
    {
      type: 'drag-and-drop',
      question: 'Match the computer components to their correct descriptions',
      items: components,
      correctMatches: {
        cpu: 'cpu',
        ram: 'ram',
        gpu: 'gpu',
        motherboard: 'motherboard',
        storage: 'storage'
      },
      explanation: 'Understanding the function of each hardware component is essential for troubleshooting and upgrading your computer.'
    },
    {
      type: 'multiple-choice',
      question: 'Which of the following is an input device?',
      options: ['Monitor', 'Printer', 'Speaker', 'Keyboard'],
      correctAnswer: 'Keyboard',
      explanation: 'Input devices like keyboards send data to the computer, while output devices like monitors, printers, and speakers deliver information from the computer to the user.'
    },
    {
      type: 'multiple-choice',
      question: 'What is the difference between an HDD and an SSD?',
      options: [
        'HDD uses mechanical parts while SSD uses flash memory',
        'HDD is external storage while SSD is internal',
        'HDD is for backup while SSD is for everyday use',
        'They are different names for the same technology'
      ],
      correctAnswer: 'HDD uses mechanical parts while SSD uses flash memory',
      explanation: 'Hard Disk Drives (HDD) use spinning magnetic disks and mechanical read/write heads, while Solid State Drives (SSD) use flash memory with no moving parts, making them faster and more durable.'
    },
    {
      type: 'multiple-choice',
      question: 'Which connection would you use to connect a modern monitor to a computer?',
      options: ['VGA', 'HDMI', 'Ethernet', 'USB-A'],
      correctAnswer: 'HDMI',
      explanation: 'HDMI (High-Definition Multimedia Interface) is a common modern connection for displays that carries both video and audio in one cable. VGA is older, Ethernet is for networking, and USB-A typically doesn\'t carry display signals.',
    },
    {
      type: 'true-false',
      question: 'When installing new RAM, you need to match the type and speed with what your motherboard supports.',
      correctAnswer: true,
      explanation: 'Different motherboards support specific types of RAM (such as DDR3, DDR4) and specific speeds. Using incompatible RAM may result in the computer not functioning properly or at all.'
    },
    {
      type: 'multiple-choice',
      question: 'Which part of the computer system manages the flow of data between the CPU and other hardware?',
      options: ['Power Supply', 'Operating System', 'Motherboard', 'Network Card'],
      correctAnswer: 'Motherboard',
      explanation: 'The motherboard contains chipsets and buses that manage data flow between components. It\'s the central hub that connects everything together.'
    }
  ];

  // Handle answer selection for multiple choice questions
  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [currentStep]: answer
    });
  };

  // Handle drag start for drag-and-drop questions
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };

  // Handle drop for drag-and-drop questions
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    
    if (draggedItem) {
      setDropTargets({
        ...dropTargets,
        [targetId]: draggedItem
      });
    }
    
    setDraggedItem(null);
  };

  // Allow drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Check if all drop targets are filled
  const isDropComplete = () => {
    return Object.values(dropTargets).every(target => target !== null);
  };

  // Go to next question
  const handleNextQuestion = () => {
    // Check answer for current question
    const currentQuestion = questions[currentStep];
    let isCorrect = false;
    
    if (currentQuestion.type === 'drag-and-drop') {
      // Check if all matches are correct
      isCorrect = Object.entries(dropTargets).every(([key, value]) => 
        value && value.id === currentQuestion.correctMatches[key]
      );
    } else if (currentQuestion.type === 'true-false') {
      isCorrect = answers[currentStep] === currentQuestion.correctAnswer;
    } else {
      // Multiple choice
      isCorrect = answers[currentStep] === currentQuestion.correctAnswer;
    }
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Move to next question or finish test
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowHint(false);
    } else {
      setTestCompleted(true);
    }
  };

  // Reset the test
  const resetTest = () => {
    setCurrentStep(0);
    setScore(0);
    setAnswers({});
    setTestCompleted(false);
    setDropTargets({
      cpu: null,
      ram: null,
      gpu: null,
      motherboard: null,
      storage: null
    });
    setShowHint(false);
  };

  // Render current question
  const renderQuestion = () => {
    const question = questions[currentStep];
    
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded cursor-pointer ${
                    answers[currentStep] === option ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!answers[currentStep]}
                onClick={handleNextQuestion}
              >
                {currentStep < questions.length - 1 ? 'Next Question' : 'Finish Test'}
              </button>
            </div>
            
            {showHint && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                <p className="font-bold">Hint:</p>
                <p>Think about the primary function of each component in a computer system.</p>
              </div>
            )}
          </div>
        );
        
      case 'true-false':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">{question.question}</h3>
            <div className="space-y-3">
              <div 
                className={`p-3 border rounded cursor-pointer ${
                  answers[currentStep] === true ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAnswerSelect(true)}
              >
                True
              </div>
              <div 
                className={`p-3 border rounded cursor-pointer ${
                  answers[currentStep] === false ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAnswerSelect(false)}
              >
                False
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={answers[currentStep] === undefined}
                onClick={handleNextQuestion}
              >
                {currentStep < questions.length - 1 ? 'Next Question' : 'Finish Test'}
              </button>
            </div>
            
            {showHint && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                <p className="font-bold">Hint:</p>
                <p>Consider hardware compatibility requirements when upgrading computer components.</p>
              </div>
            )}
          </div>
        );
        
      case 'drag-and-drop':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">{question.question}</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Components to drag */}
              <div className="md:w-1/2">
                <h4 className="font-bold mb-2">Components</h4>
                <div className="flex flex-wrap gap-2">
                  {components
                    .filter(comp => !Object.values(dropTargets).some(
                      target => target && target.id === comp.id
                    ))
                    .map((comp) => (
                      <div
                        key={comp.id}
                        className="p-2 border rounded bg-gray-50 cursor-grab flex items-center"
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp)}
                      >
                        <span className="text-xl mr-2">{comp.image}</span>
                        <span>{comp.name}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Drop targets */}
              <div className="md:w-1/2">
                <h4 className="font-bold mb-2">Descriptions</h4>
                <div className="space-y-2">
                  {components.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 border rounded flex items-center"
                      onDrop={(e) => handleDrop(e, comp.id)}
                      onDragOver={handleDragOver}
                    >
                      <div className="min-h-12 min-w-12 border-r pr-2 mr-2">
                        {dropTargets[comp.id] && (
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{dropTargets[comp.id].image}</span>
                            <span>{dropTargets[comp.id].name}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm">{comp.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!isDropComplete()}
                onClick={handleNextQuestion}
              >
                {currentStep < questions.length - 1 ? 'Next Question' : 'Finish Test'}
              </button>
            </div>
            
            {showHint && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                <p className="font-bold">Hint:</p>
                <p>Each component has a specific function. Match the component to its most appropriate description.</p>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Unknown question type</div>;
    }
  };

  // Render test results
  const renderResults = () => {
    const percentage = Math.round((score / questions.length) * 100);
    let message = '';
    
    if (percentage >= 90) {
      message = 'Excellent! You have advanced hardware knowledge.';
    } else if (percentage >= 70) {
      message = 'Good job! You have solid understanding of computer hardware.';
    } else if (percentage >= 50) {
      message = 'You have basic hardware knowledge, but there\'s room for improvement.';
    } else {
      message = 'You might benefit from learning more about computer hardware.';
    }
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
        <div className="text-5xl font-bold text-blue-600 my-4">{percentage}%</div>
        <p className="mb-2">You scored {score} out of {questions.length} points</p>
        <p className="text-lg mb-6">{message}</p>
        
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Key Takeaways:</h3>
          <ul className="text-left list-disc pl-6 space-y-1">
            <li>Each component has a specific role in a computer system</li>
            <li>Hardware compatibility is crucial when upgrading</li>
            <li>Understanding connections helps troubleshoot issues</li>
            <li>Input and output devices serve different purposes</li>
          </ul>
        </div>
        
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={resetTest}
        >
          Retake Test
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-100 p-4 mb-6 rounded">
        <h2 className="text-xl font-bold text-center">Computer Hardware Knowledge Test</h2>
        {!testCompleted ? (
          <div className="flex justify-between items-center mt-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
        ) : null}
      </div>
      
      <div className="mb-8">
        {!testCompleted ? renderQuestion() : renderResults()}
      </div>
    </div>
  );
};

export default HardwareKnowledgeTest;