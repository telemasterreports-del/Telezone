import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import AgentReport from "./page/AgentReport";

<Router basename="/Telezone">
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/agent-report" element={<AgentReport />} />
  </Routes>
</Router>