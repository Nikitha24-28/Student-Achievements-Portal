import React from 'react';
import Login from "../Login/Login";
import {BrowserRouter as Router , Routes , Route , Navigate} from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import Events from '../../Pages/Student/Events/Events';
import EventSummary from "../../Pages/Student/EventSummary/EventSummary";
import Approvals from "../../Pages/Admin/Approvals/Approvals";
import EventHistory from "../../Pages/Admin/EventHistory/EventHistory";
import SummaryApprovals from "../../Pages/Admin/SummaryApprovals/SummaryApprovals";




const AppLayout = () => {
  const role =localStorage.getItem("role");
  return (
    <Router>
      {role && <Navbar/>}
      <Routes>
        {!role ?
        (<>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>):
        (<>
          {role==="admin" && (
            <>
              <Route path="/Approvals" element={<Approvals/>}/>
              <Route path="/SummaryApprovals" element={<SummaryApprovals/>}/>
              <Route path="/EventHistory" element={<EventHistory/>}/>
            </>
          )}




          {role==="student" && (
            <>
              <Route path="/Events" element={<Events/>}/>
              <Route path="/EventSummary" element={<EventSummary/>}/>
            </>
          )}
        </>)}
      </Routes>
    </Router>
  )
}

export default AppLayout