import React, { useState, useRef, useEffect } from 'react';

const DigitalLiteracyTest = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState(null);
  const [windows, setWindows] = useState([]);
  const [draggingIcon, setDraggingIcon] = useState(null);
  const [currentTask, setCurrentTask] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [createdFolder, setCreatedFolder] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // Initial desktop icons
  const [icons, setIcons] = useState([
    { id: 1, name: 'My Documents', icon: '📁', left: 20, top: 20 },
    { id: 2, name: 'Recycle Bin', icon: '🗑️', left: 20, top: 100 },
    { id: 3, name: 'Internet Explorer', icon: '🌐', left: 20, top: 180 },
    { id: 4, name: 'My Computer', icon: '💻', left: 20, top: 260 }
  ]);
  
  // Predefined content for various applications
  const appContent = {
    'My Documents': `
      <div>
        <div class="text-lg font-bold mb-2">My Documents</div>
        <div class="flex flex-col space-y-1">
          <div class="flex items-center p-1 hover:bg-blue-100">
            <span class="mr-2">📄</span> Report.docx
          </div>
          <div class="flex items-center p-1 hover:bg-blue-100">
            <span class="mr-2">📊</span> Budget.xlsx
          </div>
          <div class="flex items-center p-1 hover:bg-blue-100">
            <span class="mr-2">📝</span> Notes.txt
          </div>
          ${createdFolder ? `<div class="flex items-center p-1 hover:bg-blue-100 bg-yellow-100">
            <span class="mr-2">📁</span> Research
          </div>` : ''}
        </div>
      </div>
    `,
    'Internet Explorer': `
      <div>
        <div class="bg-gray-200 p-1 flex items-center mb-2">
          <input 
            type="text" 
            value="${searchQuery}" 
            placeholder="Enter search query..."
            class="flex-1 p-1 text-sm border border-gray-300"
            id="search-input"
            onchange="window.updateSearchQuery(this.value)"
          />
          <button class="bg-blue-500 text-white px-2 py-1 ml-1 text-xs" id="search-button">Search</button>
        </div>
        ${searchResults.length > 0 ? `
          <div class="text-sm">
            <div class="font-bold mb-1">Search results for: ${searchQuery}</div>
            ${searchResults.map((result, index) => `
              <div class="mb-2 p-1 ${result.reliable ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}">
                <div class="font-bold text-blue-600 underline cursor-pointer" id="result-${index}">${result.title}</div>
                <div class="text-green-800 text-xs">${result.url}</div>
                <div class="text-xs">${result.description}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="flex flex-col items-center justify-center h-32">
            <div class="text-lg mb-2">Welcome to Internet Explorer</div>
            <div class="text-sm">Enter a search term above to find information</div>
          </div>
        `}
      </div>
    `,
    'File Explorer': `
      <div>
        <div class="flex justify-between bg-gray-200 p-1 mb-2">
          <button class="text-xs px-2 py-1" id="back-button">←</button>
          <div class="text-xs p-1">C:\\Documents</div>
          <button class="text-xs px-2 py-1 bg-blue-500 text-white" id="new-folder">New Folder</button>
        </div>
        <div class="flex flex-col space-y-1">
          <div class="flex items-center p-1 hover:bg-blue-100">
            <span class="mr-2">📄</span> Report.docx
          </div>
          <div class="flex items-center p-1 hover:bg-blue-100">
            <span class="mr-2">📊</span> Budget.xlsx
          </div>
          <div class="flex items-center p-1 hover:bg-blue-100">
            <span class="mr-2">📝</span> Notes.txt
          </div>
          ${createdFolder ? `<div class="flex items-center p-1 hover:bg-blue-100 bg-yellow-100">
            <span class="mr-2">📁</span> Research
          </div>` : ''}
        </div>
      </div>
    `,
    'Notepad': `
      <div>
        <textarea class="w-full h-32 p-2 border border-gray-300 text-sm font-mono" placeholder="Type notes here..."></textarea>
      </div>
    `
  };
  
  // Digital literacy tasks - FIX: Change the success criteria for task 2
  const tasks = [
    {
      instruction: "Log in to the Windows system using any username and password.",
      success: () => isLoggedIn,
      hint: "Fill in both the username and password fields, then click the Login button."
    },
    {
      instruction: "Open the File Explorer application from the Start menu.",
      // FIX: Change this to verify a File Explorer window exists and is NOT minimized
      success: () => windows.some(w => w.title === "File Explorer" && !w.isMinimized),
      hint: "Click the Start button in the taskbar, then click on File Explorer."
    },
    {
      instruction: "Create a new folder called 'Research' in File Explorer.",
      success: () => createdFolder,
      hint: "In the File Explorer window, click the 'New Folder' button at the top."
    },
    {
      instruction: "Open Internet Explorer and search for 'digital literacy definition'.",
      success: () => searchQuery === "digital literacy definition",
      hint: "Double-click the Internet Explorer icon on the desktop, type 'digital literacy definition' in the search box, and click Search."
    },
    {
      instruction: "Identify which search result is from a more reliable source based on the URL (.edu or .gov vs other domains).",
      success: () => {
        // This will be triggered by the user clicking on a reliable source
        return false;
      },
      hint: "Look at the URLs of the search results. Educational (.edu) and government (.gov) websites are generally more reliable sources."
    },
    {
      instruction: "Minimize the Internet Explorer window and return to the desktop.",
      success: () => windows.some(w => w.title === "Internet Explorer" && w.isMinimized),
      hint: "Find the Internet Explorer window and click the '_' button in the top-right corner."
    },
    {
      instruction: "Open the My Documents icon on the desktop.",
      success: () => windows.some(w => w.title === "My Documents" && !w.isMinimized),
      hint: "Double-click on the My Documents icon on the desktop."
    },
    {
      instruction: "Verify that your 'Research' folder appears in My Documents.",
      success: () => {
        // This requires the user to have created the folder and opened My Documents
        return createdFolder && windows.some(w => w.title === "My Documents" && !w.isMinimized);
      },
      hint: "Check if the 'Research' folder you created earlier is visible in the My Documents window."
    }
  ];
  
  const desktopRef = useRef(null);
  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ left: 0, top: 0 });

  // Handle login - FIXED to ensure task updates properly
  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
      setErrorMessage('');
      
      // Use setTimeout to ensure state is updated before checking task
      setTimeout(() => {
        // This will force the task completion check after the login state has been updated
        setTaskCompleted(true);
      }, 100);
    } else {
      setErrorMessage('Please enter both username and password');
    }
  };

  // Effect to advance to next task after login
  useEffect(() => {
    if (isLoggedIn && taskCompleted && currentTask === 0) {
      // This will run when the login task is completed
      setTimeout(() => {
        advanceTask();
      }, 500);
    }
  }, [isLoggedIn, taskCompleted, currentTask]);

  
  useEffect(() => {
    // This effect will run whenever the windows state changes
    if (isLoggedIn && !testCompleted) {
      // Small delay to ensure the DOM is fully updated
      const checkTaskTimeout = setTimeout(() => {
        checkTaskCompletion();
      }, 200);
      
      return () => clearTimeout(checkTaskTimeout);
    }
  }, [windows, isLoggedIn, testCompleted]);

  // useEffect(() => {
  //   window.updateSearchQuery = (value) => {
  //     setSearchQuery(value);
  //   };
    
  //   return () => {
  //     delete window.updateSearchQuery;
  //   };
  // }, []);


  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setStartMenuOpen(false);
    setWindows([]);
    setCurrentTask(0);
    setTaskCompleted(false);
    setScore(0);
    setTestCompleted(false);
    setCreatedFolder(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Toggle start menu
  const toggleStartMenu = () => {
    setStartMenuOpen(!startMenuOpen);
  };

  // Open window
  const openWindow = (appName) => {
    // Check if window is already open
    const existingWindow = windows.find(w => w.title === appName && !w.isMinimized);
    
    if (existingWindow) {
      // If already open, just make it active
      setActiveWindow(existingWindow.id);
      setWindows(windows.map(w => 
        w.id === existingWindow.id ? { ...w, zIndex: Math.max(...windows.map(win => win.zIndex)) + 1 } : w
      ));
    } else {
      // If minimized, restore it
      const minimizedWindow = windows.find(w => w.title === appName && w.isMinimized);
      
      if (minimizedWindow) {
        restoreWindow(minimizedWindow.id);
      } else {
        // Otherwise create a new window
        const newWindow = {
          id: Date.now(),
          title: appName,
          content: appContent[appName] || `This is the ${appName} application window.`,
          isMinimized: false,
          zIndex: windows.length + 1,
          left: 100 + (windows.length * 20) % 100,
          top: 100 + (windows.length * 20) % 100,
          width: 400,
          height: 300
        };
        
        setWindows([...windows, newWindow]);
        setActiveWindow(newWindow.id);
      }
    }
    
    setStartMenuOpen(false);
    
    // Special handling for search
    if (appName === "Internet Explorer") {
      // Prepare mock search results when Internet Explorer is opened
      prepareSearchResults();
    }
    
    // Check if task is completed
    setTimeout(checkTaskCompletion, 100);
  };

  // Close window
  const closeWindow = (id) => {
    setWindows(windows.filter(window => window.id !== id));
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  };

  // Minimize window
  const minimizeWindow = (id) => {
    setWindows(windows.map(window => 
      window.id === id ? { ...window, isMinimized: true } : window
    ));
    setActiveWindow(null);
    
    // Check for minimizing task
    setTimeout(checkTaskCompletion, 100);
  };

  // Restore window - FIX: Ensure window is properly restored and focused
  const restoreWindow = (id) => {
    setWindows(windows.map(window => 
      window.id === id ? { ...window, isMinimized: false, zIndex: Math.max(...windows.map(win => win.zIndex)) + 1 } : window
    ));
    setActiveWindow(id);
    
    // Add this to check task completion
    setTimeout(checkTaskCompletion, 100);
  };

  // Window dragging functions
  const startDraggingWindow = (e, id) => {
    const window = windows.find(w => w.id === id);
    
    // Bring window to front
    setActiveWindow(id);
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: Math.max(...windows.map(win => win.zIndex)) + 1 } : w
    ));
    
    initialMousePos.current = { x: e.clientX, y: e.clientY };
    initialPosition.current = { left: window.left, top: window.top };
    
    document.addEventListener('mousemove', moveWindow);
    document.addEventListener('mouseup', stopDraggingWindow);
  };

  // Move window
  const moveWindow = (e) => {
    if (activeWindow) {
      const dx = e.clientX - initialMousePos.current.x;
      const dy = e.clientY - initialMousePos.current.y;
      
      setWindows(windows.map(window => 
        window.id === activeWindow 
          ? { 
              ...window, 
              left: initialPosition.current.left + dx, 
              top: initialPosition.current.top + dy 
            } 
          : window
      ));
    }
  };

  // Stop dragging window
  const stopDraggingWindow = () => {
    document.removeEventListener('mousemove', moveWindow);
    document.removeEventListener('mouseup', stopDraggingWindow);
  };

  // Icon dragging functions
  const startDraggingIcon = (e, id) => {
    const icon = icons.find(i => i.id === id);
    
    initialMousePos.current = { x: e.clientX, y: e.clientY };
    initialPosition.current = { left: icon.left, top: icon.top };
    setDraggingIcon(id);
    
    document.addEventListener('mousemove', moveIcon);
    document.addEventListener('mouseup', stopDraggingIcon);
    
    e.preventDefault();
  };

  // Move icon
  const moveIcon = (e) => {
    if (draggingIcon) {
      const dx = e.clientX - initialMousePos.current.x;
      const dy = e.clientY - initialMousePos.current.y;
      
      setIcons(icons.map(icon => 
        icon.id === draggingIcon 
          ? { 
              ...icon, 
              left: initialPosition.current.left + dx, 
              top: initialPosition.current.top + dy 
            } 
          : icon
      ));
    }
  };

  // Stop dragging icon
  const stopDraggingIcon = () => {
    document.removeEventListener('mousemove', moveIcon);
    document.removeEventListener('mouseup', stopDraggingIcon);
    setDraggingIcon(null);
  };

  // Handle icon double click
  const handleIconDoubleClick = (appName) => {
    openWindow(appName);
  };

  // Create new folder
  const handleCreateFolder = () => {
    setCreatedFolder(true);
    
    // Update relevant window content
    setWindows(windows.map(window => {
      if (window.title === "File Explorer" || window.title === "My Documents") {
        return {
          ...window,
          content: appContent[window.title].replace("</div>", `
            <div class="flex items-center p-1 hover:bg-blue-100 bg-yellow-100">
              <span class="mr-2">📁</span> Research
            </div>
          </div>`)
        };
      }
      return window;
    }));
    
    // Update app content for future windows
    appContent["File Explorer"] = appContent["File Explorer"].replace(`${createdFolder ? `` : ''}</div>`, `<div class="flex items-center p-1 hover:bg-blue-100 bg-yellow-100">
      <span class="mr-2">📁</span> Research
    </div></div>`);
    
    appContent["My Documents"] = appContent["My Documents"].replace(`${createdFolder ? `` : ''}</div>`, `<div class="flex items-center p-1 hover:bg-blue-100 bg-yellow-100">
      <span class="mr-2">📁</span> Research
    </div></div>`);
    
    setTimeout(checkTaskCompletion, 100);
  };

  // Handle search input change
  const handleSearchInputChange = (event) => {
    console.log('handleSearchInputChange')
    console.log(event.target.value)
    setSearchQuery(event.target.value);
  };

  // Prepare search results
  const prepareSearchResults = () => {
    // Mock search results will be set when user performs search
    const reliableResults = [
      {
        title: "Digital Literacy - Definition and Framework",
        url: "https://www.education.gov/digital-literacy/framework",
        description: "Official government resource defining digital literacy as the ability to use information and communication technologies to find, evaluate, create, and communicate information.",
        reliable: true
      },
      {
        title: "Understanding Digital Literacy Skills",
        url: "https://digitalliteracy.stanford.edu/research/skills",
        description: "Academic research on essential digital literacy skills for the 21st century from Stanford University's Digital Education Department.",
        reliable: true
      }
    ];
    
    const unreliableResults = [
      {
        title: "SHOCKING: The Truth About Digital Literacy They Won't Tell You",
        url: "https://tech-conspiracy-blog.com/digital-literacy-truth",
        description: "Find out what big tech companies don't want you to know about digital literacy and online privacy.",
        reliable: false
      },
      {
        title: "Digital Literacy Guide - Free PDF Download",
        url: "https://free-downloads-no-virus.net/digital-literacy.pdf",
        description: "Download our comprehensive guide to digital literacy. No registration required, instant download available.",
        reliable: false
      }
    ];
    
    // We'll only set these when user actually performs search
    setSearchResults([]);
  };

  // Perform search
  const handleSearch = (handledQuery: string) => {
    console.log('handleSearch')
    console.log(handledQuery)
    if (handledQuery.toLowerCase().includes("digital literacy")) {
      checkTaskCompletion()
      
      // Mix reliable and unreliable sources
      setSearchResults([
        {
          title: "Digital Literacy - Definition and Framework",
          url: "https://www.education.gov/digital-literacy/framework",
          description: "Official government resource defining digital literacy as the ability to use information and communication technologies to find, evaluate, create, and communicate information.",
          reliable: true
        },
        {
          title: "SHOCKING: The Truth About Digital Literacy They Won't Tell You",
          url: "https://tech-conspiracy-blog.com/digital-literacy-truth",
          description: "Find out what big tech companies don't want you to know about digital literacy and online privacy.",
          reliable: false
        },
        {
          title: "Understanding Digital Literacy Skills",
          url: "https://digitalliteracy.stanford.edu/research/skills",
          description: "Academic research on essential digital literacy skills for the 21st century from Stanford University's Digital Education Department.",
          reliable: true
        },
        {
          title: "Digital Literacy Guide - Free PDF Download",
          url: "https://free-downloads-no-virus.net/digital-literacy.pdf",
          description: "Download our comprehensive guide to digital literacy. No registration required, instant download available.",
          reliable: false
        }
      ]);
      
      // Update Internet Explorer window content
      setWindows(windows.map(window => {
        if (window.title === "Internet Explorer") {
          // Check if the task is completed
          setTimeout(checkTaskCompletion, 100);
          // checkTaskCompletion()
          // console.log(searchQuery)
          return {
            ...window,
            content: `
              <div>
                <div class="bg-gray-200 p-1 flex items-center mb-2">
                  <input 
                    type="text" 
                    value="${handledQuery}" 
                    placeholder="Enter search query..."
                    class="flex-1 p-1 text-sm border border-gray-300"
                    id="search-input"
                  />
                  <button class="bg-blue-500 text-white px-2 py-1 ml-1 text-xs" id="search-button">Search</button>
                </div>
                <div class="text-sm">
                  <div class="font-bold mb-1">Search results for: ${handledQuery}</div>
                  <div class="mb-2 p-1 border-l-4 border-green-500">
                    <div class="font-bold text-blue-600 underline cursor-pointer" id="result-0">Digital Literacy - Definition and Framework</div>
                    <div class="text-green-800 text-xs">https://www.education.gov/digital-literacy/framework</div>
                    <div class="text-xs">Official government resource defining digital literacy as the ability to use information and communication technologies to find, evaluate, create, and communicate information.</div>
                  </div>
                  <div class="mb-2 p-1 border-l-4 border-red-500">
                    <div class="font-bold text-blue-600 underline cursor-pointer" id="result-1">SHOCKING: The Truth About Digital Literacy They Won't Tell You</div>
                    <div class="text-green-800 text-xs">https://tech-conspiracy-blog.com/digital-literacy-truth</div>
                    <div class="text-xs">Find out what big tech companies don't want you to know about digital literacy and online privacy.</div>
                  </div>
                  <div class="mb-2 p-1 border-l-4 border-green-500">
                    <div class="font-bold text-blue-600 underline cursor-pointer" id="result-2">Understanding Digital Literacy Skills</div>
                    <div class="text-green-800 text-xs">https://digitalliteracy.stanford.edu/research/skills</div>
                    <div class="text-xs">Academic research on essential digital literacy skills for the 21st century from Stanford University's Digital Education Department.</div>
                  </div>
                  <div class="mb-2 p-1 border-l-4 border-red-500">
                    <div class="font-bold text-blue-600 underline cursor-pointer" id="result-3">Digital Literacy Guide - Free PDF Download</div>
                    <div class="text-green-800 text-xs">https://free-downloads-no-virus.net/digital-literacy.pdf</div>
                    <div class="text-xs">Download our comprehensive guide to digital literacy. No registration required, instant download available.</div>
                  </div>
                </div>
              </div>
            `
          };
        }
        return window;
      }));
      
      
    } else {
      // Generic results for other searches
      setSearchResults([
        {
          title: `Results for: ${handledQuery}`,
          url: `https://search-engine.com/results?q=${handledQuery}`,
          description: "This is a generic search result. Please search for 'digital literacy definition' to continue the test.",
          reliable: false
        }
      ]);
      
      // Update Internet Explorer window content with generic results
      setWindows(windows.map(window => {
        if (window.title === "Internet Explorer") {
          return {
            ...window,
            content: `
              <div>
                <div class="bg-gray-200 p-1 flex items-center mb-2">
                  <input 
                    type="text" 
                    value="${handledQuery}" 
                    placeholder="Enter search query..."
                    class="flex-1 p-1 text-sm border border-gray-300"
                    id="search-input"
                  />
                  <button class="bg-blue-500 text-white px-2 py-1 ml-1 text-xs" id="search-button">Search</button>
                </div>
                <div class="text-sm">
                  <div class="font-bold mb-1">Search results for: ${handledQuery}</div>
                  <div class="mb-2 p-1">
                    <div class="font-bold text-blue-600 underline cursor-pointer">Results for: ${handledQuery}</div>
                    <div class="text-green-800 text-xs">https://search-engine.com/results?q=${handledQuery}</div>
                    <div class="text-xs">This is a generic search result. Please search for 'digital literacy definition' to continue the test.</div>
                  </div>
                </div>
              </div>
            `
          };
        }
        return window;
      }));
    }
  };

  // Select reliable source
  const selectReliableSource = (index) => {
    const result = searchResults[index];
    if (result && result.reliable) {
      // They selected a reliable source
      advanceTask();
    } else {
      // Wrong choice, don't advance
      alert("Try again! Look for .edu or .gov domains which are typically more reliable sources.");
    }
  };

  // Check if current task is completed
  const checkTaskCompletion = () => {
    console.log('checkTaskCompletion')
    if (currentTask < tasks.length) {
      const task = tasks[currentTask];

      console.log(task.success())
      if (task.success()) {
        setTaskCompleted(true);
      }
    }
  };

  // Move to next task
  const advanceTask = () => {
    if (currentTask < tasks.length - 1) {
      setScore(score + 1);
      setCurrentTask(currentTask + 1);
      setTaskCompleted(false);
    } else {
      // Test completed
      setScore(score + 1);
      setTestCompleted(true);
      setShowCompletionMessage(true);
    }
  };

  // Handle window clicks based on content
  useEffect(() => {
    const handleWindowClicks = () => {
      if (isLoggedIn) {
        // Find Internet Explorer window search button
        const searchButton = document.getElementById("search-button");
        if (searchButton) {
          searchButton.addEventListener("click", (e) => {
            handleSearch(searchQuery); // Now it will use the current searchQuery value
            
          });
        }
        
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          searchInput.addEventListener("input", (e) => {
            setSearchQuery(e.target.value);
            console.log(e.target.value)
            console.log(searchQuery)
            // console.log(typeof(e.target.value))
          });
          
          // Allow pressing Enter in search input
          searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
              handleSearch(e.target.value);
            }
          });
        }
        
        // Find File Explorer window new folder button
        const newFolderButton = document.getElementById("new-folder");
        if (newFolderButton) {
          newFolderButton.addEventListener("click", handleCreateFolder);
        }
        
        // Add click handlers for search results
        for (let i = 0; i < 4; i++) {
          const resultLink = document.getElementById(`result-${i}`);
          if (resultLink) {
            resultLink.addEventListener("click", () => selectReliableSource(i));
          }
        }
      }
      
      return () => {
        const searchButton = document.getElementById("search-button");
        if (searchButton) {
          searchButton.removeEventListener("click", handleSearch);
        }
        
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          searchInput.removeEventListener("input", (e) => {
            setSearchQuery(e.target.value);});
          searchInput.removeEventListener("keyup", (e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          });
        }
        const newFolderButton = document.getElementById("new-folder");
        if (newFolderButton) {
          newFolderButton.removeEventListener("click", handleCreateFolder);
        }
        
        for (let i = 0; i < 4; i++) {
          const resultLink = document.getElementById(`result-${i}`);
          if (resultLink) {
            resultLink.removeEventListener("click", () => selectReliableSource(i));
          }
        }
      };
    };
    
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(handleWindowClicks, 100);
    return () => clearTimeout(timeout);
  }, [windows, searchResults, isLoggedIn, currentTask]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full bg-gray-100 p-4 mb-4 rounded">
        <h2 className="text-xl font-bold text-center">Digital Literacy Test</h2>
        {!testCompleted ? (
          <div>
            <p className="font-semibold mt-2">Task {currentTask + 1} of {tasks.length}:</p>
            <p className="mt-1">{tasks[currentTask].instruction}</p>
            {taskCompleted ? (
              <div className="mt-2 flex justify-between items-center">
                <span className="text-green-600 font-bold">✓ Task completed!</span>
                <button 
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  onClick={advanceTask}
                >
                  Next Task
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <details>
                  <summary className="text-blue-600 cursor-pointer">Need a hint?</summary>
                  <p className="text-sm mt-1 pl-4 text-gray-700">{tasks[currentTask].hint}</p>
                </details>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center mt-2">
            <p className="font-bold text-xl text-green-700">Test Completed!</p>
            <p className="mt-1">You scored {score} out of {tasks.length} points.</p>
            <p className="mt-2">
              {score >= tasks.length * 0.8 ? 
                "Excellent work! You've demonstrated strong digital literacy skills." :
                score >= tasks.length * 0.6 ?
                  "Good job! You have decent digital literacy skills, but there's room for improvement." :
                  "You might need more practice with basic digital literacy skills."
              }
            </p>
            <button 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleLogout}
            >
              Restart Test
            </button>
          </div>
        )}
      </div>
      
      <div className="border-4 border-gray-700 rounded-lg w w-full max-w-4xl overflow-hidden shadow-xl">
        {/* Simulated Windows OS */}
        <div className="bg-blue-600 text-white p-1 flex justify-between items-center">
          <div className="text-sm font-bold">Windows Simulator</div>
          <div className="flex space-x-2">
            <button className="w-4 h-4 bg-gray-300 rounded-full text-black text-xs flex items-center justify-center">_</button>
            <button className="w-4 h-4 bg-gray-300 rounded-full text-black text-xs flex items-center justify-center">□</button>
            <button className="w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">×</button>
          </div>
        </div>
        
        {!isLoggedIn ? (
          // Login screen
          <div className="bg-blue-500 h-96 flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Windows Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Username:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                {errorMessage && (
                  <div className="text-red-500 mb-4">{errorMessage}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Desktop
          <div className="relative">
            <div 
              ref={desktopRef}
              className="bg-teal-100 h-96 relative overflow-hidden"
              onClick={() => {
                setStartMenuOpen(false);
                setActiveWindow(null);
              }}
            >
              {/* Desktop Icons */}
              {icons.map((icon) => (
                <div
                  key={icon.id}
                  className="absolute flex flex-col items-center w-20 cursor-pointer"
                  style={{ 
                    left: `${icon.left}px`, 
                    top: `${icon.top}px`,
                    zIndex: 1
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startDraggingIcon(e, icon.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleIconDoubleClick(icon.name);
                  }}
                >
                  <div className="text-3xl">{icon.icon}</div>
                  <div className="text-xs bg-blue-100 bg-opacity-50 p-1 mt-1 text-center">
                    {icon.name}
                  </div>
                </div>
              ))}

              {/* Windows */}
              {windows.filter(w => !w.isMinimized).map((window) => (
                <div
                  key={window.id}
                  className={`absolute bg-white border-2 rounded shadow-lg overflow-hidden ${activeWindow === window.id ? 'border-blue-500' : 'border-gray-300'}`}
                  style={{ 
                    left: `${window.left}px`, 
                    top: `${window.top}px`, 
                    width: `${window.width}px`, 
                    height: `${window.height}px`,
                    zIndex: window.zIndex
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveWindow(window.id);
                    setWindows(windows.map(w => 
                      w.id === window.id ? { ...w, zIndex: Math.max(...windows.map(win => win.zIndex)) + 1 } : w
                    ));
                  }}
                >
                  <div 
                    className={`p-1 flex justify-between items-center ${activeWindow === window.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startDraggingWindow(e, window.id);
                    }}
                  >
                    <div className="text-sm font-bold truncate">{window.title}</div>
                    <div className="flex space-x-1">
                      <button 
                        className="w-5 h-5 bg-gray-300 flex items-center justify-center text-black text-xs rounded hover:bg-gray-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          minimizeWindow(window.id);
                        }}
                      >
                        _
                      </button>
                      <button 
                        className="w-5 h-5 bg-red-500 flex items-center justify-center text-white text-xs rounded hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeWindow(window.id);
                        }}>
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="p-2 text-sm" 
                       dangerouslySetInnerHTML={{ __html: window.content }}
                  />
                </div>
              ))}
            </div>

            {/* Taskbar */}
            <div className="bg-gray-300 p-1 flex items-center">
              <button 
                className={`px-3 py-1 mr-2 ${startMenuOpen ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'} rounded`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStartMenu();
                }}
              >
                Start
              </button>
              
              {/* Open windows in taskbar */}
              <div className="flex-1 flex space-x-1">
                {windows.map((window) => (
                  <button 
                    key={window.id}
                    className={`px-2 py-1 text-xs truncate max-w-xs border ${window.isMinimized ? 'bg-gray-200' : activeWindow === window.id ? 'bg-blue-200 border-blue-600' : 'bg-white border-gray-400'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.isMinimized) {
                        restoreWindow(window.id);
                      } else {
                        setActiveWindow(window.id);
                        setWindows(windows.map(w => 
                          w.id === window.id ? { ...w, zIndex: Math.max(...windows.map(win => win.zIndex)) + 1 } : w
                        ));
                      }
                    }}
                  >
                    {window.title}
                  </button>
                ))}
              </div>
              
              <div className="text-xs p-1 border border-gray-400 bg-white">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            {/* Start Menu */}
            {startMenuOpen && (
              <div 
                className="absolute left-0 bottom-8 w-64 bg-blue-700 text-white shadow-lg rounded-t-lg overflow-hidden z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-blue-900 p-2 flex items-center">
                  <div className="font-bold">Start Menu</div>
                </div>
                <div className="p-2">
                  <div 
                    className="p-2 hover:bg-blue-600 cursor-pointer flex items-center"
                    onClick={() => openWindow("File Explorer")}
                  >
                    <span className="mr-2">📂</span> File Explorer
                  </div>
                  <div 
                    className="p-2 hover:bg-blue-600 cursor-pointer flex items-center"
                    onClick={() => openWindow("Internet Explorer")}
                  >
                    <span className="mr-2">🌐</span> Internet Explorer
                  </div>
                  <div 
                    className="p-2 hover:bg-blue-600 cursor-pointer flex items-center"
                    onClick={() => openWindow("Notepad")}
                  >
                    <span className="mr-2">📝</span> Notepad
                  </div>
                  <div className="border-t border-blue-600 my-2"></div>
                  <div 
                    className="p-2 hover:bg-blue-600 cursor-pointer flex items-center"
                    onClick={handleLogout}
                  >
                    <span className="mr-2">🚪</span> Log Out
                  </div>
                </div>
              </div>
            )}
            
            {/* Completion message modal */}
            {showCompletionMessage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                  <h2 className="text-xl font-bold mb-2 text-green-700">Congratulations!</h2>
                  <p className="mb-4">
                    You've successfully completed the Digital Literacy Test with a score of {score} out of {tasks.length}.
                  </p>
                  <p className="mb-4">
                    You've demonstrated skills in:
                    <ul className="list-disc pl-5 mt-2">
                      <li>Basic computer operation and navigation</li>
                      <li>File management and organization</li>
                      <li>Web browsing and information searching</li>
                      <li>Critical evaluation of online information sources</li>
                    </ul>
                  </p>
                  <div className="flex justify-end">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      onClick={() => {
                        setShowCompletionMessage(false);
                        handleLogout();
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isLoggedIn && !testCompleted && (
        <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-sm">
          <p className="font-bold">Tip:</p>
          <p>This is a simulation. You can interact with the desktop by dragging icons, opening windows from the Start menu, and completing the tasks as instructed.</p>
        </div>
      )}
    </div>
  );
};

export default DigitalLiteracyTest;