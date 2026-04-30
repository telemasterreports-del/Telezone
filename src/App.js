import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgentReport from "./page/AgentReport";
import Home from "./page/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agent-report" element={<AgentReport />} />
      </Routes>
    </Router>
  );
}

export default App;