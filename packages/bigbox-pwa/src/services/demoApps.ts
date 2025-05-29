interface DemoAppResponse {
  content: string;
  html: string;
  meta: Record<string, unknown>;
}

export class DemoApps {
  static async generateApp(appType: string): Promise<DemoAppResponse> {
    // Add delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    switch (appType.toLowerCase()) {
      case 'calculator':
        return this.generateCalculator();
      case 'todo':
      case 'task':
        return this.generateTodoList();
      case 'timer':
      case 'countdown':
        return this.generateTimer();
      default:
        throw new Error(`Demo app "${appType}" not available`);
    }
  }

  static getAvailableDemos(): string[] {
    return ['calculator', 'todo', 'timer'];
  }

  static isDemoApp(userRequest: string): string | null {
    const lowerRequest = userRequest.toLowerCase();
    
    if (lowerRequest.includes('calculator')) return 'calculator';
    if (lowerRequest.includes('todo') || lowerRequest.includes('task')) return 'todo';
    if (lowerRequest.includes('timer') || lowerRequest.includes('countdown')) return 'timer';
    
    return null;
  }

  private static generateCalculator(): DemoAppResponse {
    return {
      content: "I've created a calculator app for you! It includes basic arithmetic operations with a clean, modern interface.",
      html: `<!DOCTYPE html>
<html>
<head>
    <title>Calculator App</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .calculator { 
            background: white; border-radius: 15px; padding: 20px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); width: 280px;
        }
        .display { 
            width: 100%; height: 60px; font-size: 24px; text-align: right; 
            border: none; background: #f5f5f5; border-radius: 8px; padding: 0 15px;
            margin-bottom: 15px; box-sizing: border-box;
        }
        .buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        button { 
            height: 50px; border: none; border-radius: 8px; font-size: 18px; 
            cursor: pointer; transition: all 0.2s;
        }
        .btn-number { background: #e9ecef; }
        .btn-operator { background: #007bff; color: white; }
        .btn-equals { background: #28a745; color: white; }
        .btn-clear { background: #dc3545; color: white; }
        button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <div class="calculator">
        <input type="text" class="display" id="display" readonly value="0">
        <div class="buttons">
            <button class="btn-clear" onclick="clearDisplay()">C</button>
            <button class="btn-operator" onclick="appendToDisplay('/')">/</button>
            <button class="btn-operator" onclick="appendToDisplay('*')">×</button>
            <button class="btn-operator" onclick="deleteLast()">⌫</button>
            
            <button class="btn-number" onclick="appendToDisplay('7')">7</button>
            <button class="btn-number" onclick="appendToDisplay('8')">8</button>
            <button class="btn-number" onclick="appendToDisplay('9')">9</button>
            <button class="btn-operator" onclick="appendToDisplay('-')">-</button>
            
            <button class="btn-number" onclick="appendToDisplay('4')">4</button>
            <button class="btn-number" onclick="appendToDisplay('5')">5</button>
            <button class="btn-number" onclick="appendToDisplay('6')">6</button>
            <button class="btn-operator" onclick="appendToDisplay('+')">+</button>
            
            <button class="btn-number" onclick="appendToDisplay('1')">1</button>
            <button class="btn-number" onclick="appendToDisplay('2')">2</button>
            <button class="btn-number" onclick="appendToDisplay('3')">3</button>
            <button class="btn-equals" onclick="calculate()" rowspan="2">=</button>
            
            <button class="btn-number" onclick="appendToDisplay('0')" style="grid-column: span 2;">0</button>
            <button class="btn-number" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>
    <script>
        let display = document.getElementById('display');
        let currentInput = '0';
        let shouldResetDisplay = false;

        function updateDisplay() {
            display.value = currentInput;
        }

        function clearDisplay() {
            currentInput = '0';
            shouldResetDisplay = false;
            updateDisplay();
        }

        function deleteLast() {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        }

        function appendToDisplay(value) {
            if (shouldResetDisplay) {
                currentInput = '0';
                shouldResetDisplay = false;
            }
            
            if (currentInput === '0' && value !== '.') {
                currentInput = value;
            } else {
                currentInput += value;
            }
            updateDisplay();
        }

        function calculate() {
            try {
                // Replace × with * for evaluation
                let expression = currentInput.replace(/×/g, '*');
                let result = eval(expression);
                currentInput = result.toString();
                shouldResetDisplay = true;
                updateDisplay();
            } catch (error) {
                currentInput = 'Error';
                shouldResetDisplay = true;
                updateDisplay();
            }
        }
    </script>
</body>
</html>`,
      meta: {
        title: 'Calculator App',
        description: 'A fully functional calculator with basic arithmetic operations',
        category: 'demo',
        version: '1.0',
        demoApp: true
      }
    };
  }

  private static generateTodoList(): DemoAppResponse {
    return {
      content: "I've created a todo list app for you! You can add tasks, mark them as complete, and delete them. Perfect for staying organized!",
      html: `<!DOCTYPE html>
<html>
<head>
    <title>Todo List App</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; padding: 20px; 
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            min-height: 100vh;
        }
        .todo-app { 
            max-width: 400px; margin: 0 auto; 
            background: white; border-radius: 15px; padding: 25px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 { text-align: center; color: #2d3436; margin-bottom: 25px; }
        .input-section { display: flex; margin-bottom: 20px; }
        #taskInput { 
            flex: 1; padding: 12px; border: 2px solid #ddd; 
            border-radius: 8px; font-size: 16px;
        }
        #addBtn { 
            padding: 12px 20px; background: #00b894; color: white; 
            border: none; border-radius: 8px; margin-left: 10px; cursor: pointer;
            font-size: 16px;
        }
        #addBtn:hover { background: #00a085; }
        .task { 
            display: flex; align-items: center; padding: 12px; 
            border: 1px solid #eee; border-radius: 8px; margin-bottom: 8px;
            background: #f8f9fa;
        }
        .task.completed { opacity: 0.6; text-decoration: line-through; }
        .task-text { flex: 1; margin-left: 10px; }
        .delete-btn { 
            background: #e17055; color: white; border: none; 
            border-radius: 6px; padding: 6px 12px; cursor: pointer;
        }
        .delete-btn:hover { background: #d63031; }
        input[type="checkbox"] { transform: scale(1.2); }
    </style>
</head>
<body>
    <div class="todo-app">
        <h1>📝 My Todo List</h1>
        <div class="input-section">
            <input type="text" id="taskInput" placeholder="Add a new task..." maxlength="100">
            <button id="addBtn" onclick="addTask()">Add</button>
        </div>
        <div id="taskList"></div>
    </div>
    <script>
        let tasks = [];
        let taskIdCounter = 1;

        function addTask() {
            const taskInput = document.getElementById('taskInput');
            const taskText = taskInput.value.trim();
            
            if (taskText) {
                const task = {
                    id: taskIdCounter++,
                    text: taskText,
                    completed: false
                };
                tasks.push(task);
                taskInput.value = '';
                renderTasks();
            }
        }

        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                renderTasks();
            }
        }

        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }

        function renderTasks() {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'task' + (task.completed ? ' completed' : '');
                taskDiv.innerHTML = \`
                    <input type="checkbox" \${task.completed ? 'checked' : ''} 
                           onchange="toggleTask(\${task.id})">
                    <span class="task-text">\${task.text}</span>
                    <button class="delete-btn" onclick="deleteTask(\${task.id})">Delete</button>
                \`;
                taskList.appendChild(taskDiv);
            });
        }

        // Allow Enter key to add task
        document.getElementById('taskInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    </script>
</body>
</html>`,
      meta: {
        title: 'Todo List',
        description: 'A simple and clean todo list app to organize your tasks',
        category: 'demo',
        version: '1.0',
        demoApp: true
      }
    };
  }

  private static generateTimer(): DemoAppResponse {
    return {
      content: "I've created a beautiful timer app with countdown functionality, sound alerts, and preset options!",
      html: `<!DOCTYPE html>
<html>
<head>
    <title>Timer App</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .timer-app { 
            background: white; border-radius: 20px; padding: 30px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.3); text-align: center; min-width: 300px;
        }
        .display { font-size: 48px; font-weight: bold; color: #333; margin: 20px 0; }
        .presets { display: flex; gap: 10px; margin: 20px 0; justify-content: center; }
        .preset-btn { 
            padding: 8px 16px; background: #e9ecef; border: none; border-radius: 20px; 
            cursor: pointer; transition: all 0.2s;
        }
        .preset-btn:hover { background: #007bff; color: white; }
        .controls { margin: 20px 0; }
        .btn { 
            padding: 12px 24px; margin: 0 5px; border: none; border-radius: 8px; 
            cursor: pointer; font-size: 16px; transition: all 0.2s;
        }
        .start { background: #28a745; color: white; }
        .pause { background: #ffc107; color: black; }
        .reset { background: #dc3545; color: white; }
        .btn:hover { transform: translateY(-2px); }
        .input-section { margin: 20px 0; }
        .time-input { padding: 8px; border: 2px solid #ddd; border-radius: 5px; margin: 0 5px; width: 60px; }
    </style>
</head>
<body>
    <div class="timer-app">
        <h1>⏰ Timer App</h1>
        <div class="display" id="display">00:00</div>
        
        <div class="presets">
            <button class="preset-btn" onclick="setTimer(1, 0)">1 min</button>
            <button class="preset-btn" onclick="setTimer(5, 0)">5 min</button>
            <button class="preset-btn" onclick="setTimer(10, 0)">10 min</button>
            <button class="preset-btn" onclick="setTimer(25, 0)">Pomodoro</button>
        </div>
        
        <div class="input-section">
            <input type="number" class="time-input" id="minutes" placeholder="MM" min="0" max="59">
            <span>:</span>
            <input type="number" class="time-input" id="seconds" placeholder="SS" min="0" max="59">
            <button class="btn" onclick="setCustomTimer()" style="background: #007bff; color: white;">Set</button>
        </div>
        
        <div class="controls">
            <button class="btn start" onclick="startTimer()">Start</button>
            <button class="btn pause" onclick="pauseTimer()">Pause</button>
            <button class="btn reset" onclick="resetTimer()">Reset</button>
        </div>
    </div>

    <script>
        let totalSeconds = 0;
        let currentSeconds = 0;
        let isRunning = false;
        let interval;

        function updateDisplay() {
            const mins = Math.floor(currentSeconds / 60);
            const secs = currentSeconds % 60;
            document.getElementById('display').textContent = 
                \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
        }

        function setTimer(minutes, seconds) {
            totalSeconds = minutes * 60 + seconds;
            currentSeconds = totalSeconds;
            updateDisplay();
            if (isRunning) pauseTimer();
        }

        function setCustomTimer() {
            const mins = parseInt(document.getElementById('minutes').value) || 0;
            const secs = parseInt(document.getElementById('seconds').value) || 0;
            setTimer(mins, secs);
        }

        function startTimer() {
            if (currentSeconds <= 0) return;
            isRunning = true;
            interval = setInterval(() => {
                currentSeconds--;
                updateDisplay();
                if (currentSeconds <= 0) {
                    pauseTimer();
                    alert('⏰ Time's up!');
                }
            }, 1000);
        }

        function pauseTimer() {
            isRunning = false;
            clearInterval(interval);
        }

        function resetTimer() {
            pauseTimer();
            currentSeconds = totalSeconds;
            updateDisplay();
        }

        updateDisplay();
    </script>
</body>
</html>`,
      meta: {
        title: 'Timer App',
        description: 'A beautiful timer with presets and custom time setting',
        category: 'demo',
        version: '1.0',
        demoApp: true
      }
    };
  }
} 