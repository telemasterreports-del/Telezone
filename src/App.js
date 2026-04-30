import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import AgentReport from "./page/AgentReport";

function App() {
  return (      

<Router basename="/Telezone">
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/agent-report" element={<AgentReport />} />
  </Routes>
</Router> 
  );
}

export default App;