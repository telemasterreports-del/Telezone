import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import AgentReport from "./page/AgentReport";
import TimezoneSplit from "./page/TimezoneSplit";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timezone-split" element={<TimezoneSplit />} />
        <Route path="/agent-report" element={<AgentReport />} />
      </Routes>
    </Router>
  );
}

export default App;
