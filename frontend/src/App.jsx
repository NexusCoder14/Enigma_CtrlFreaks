import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LanguageSelector } from './features/regional-language/LanguageSelector';
import { Dashboard } from './pages/Dashboard';
import { CaseCreation } from './pages/CaseCreation';
import { TaskView } from './pages/TaskView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Nivaran</h1>
          <div>
            <nav style={{ display: 'inline-block', marginRight: '20px' }}>
              <Link to="/">Dashboard</Link>
              <Link to="/create-case">Create Case</Link>
              <Link to="/tasks">Tasks</Link>
            </nav>
            <LanguageSelector />
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-case" element={<CaseCreation />} />
            <Route path="/tasks" element={<TaskView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
