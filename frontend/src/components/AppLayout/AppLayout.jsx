import React from 'react';
import Login from '../Login/Login';
import {BrowserRouter as Router , Routes , Route , Navigate} from 'react-router-dom';
import Navlink from '../Navbar/Navlink';
import Events from '../../Pages/Student/Events/Events';
import EventSummary from '../../Pages/Student/EventSummary/EventSummary';
import Approvals from '../../Pages/Admin/Approvals/Approvals';
import EventHistory from '../../Pages/Admin/EventHistory/EventHistory';
import SummaryApprovals from '../../Pages/Admin/SummaryApprovals/summaryApprovals';
import RegistrationApprovals from '../../Pages/Admin/registrationApprovals/RegistrationApprovals';
import RegistrationProgress from "../../Pages/Student/RegistrationProgress/RegistrationProgress"


const AppLayout = () => {
  const role =localStorage.getItem("role");
  return (
    <Router>
      {role && <Navlink/>}
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
              <Route path="/RegistrationApprovals" element={<RegistrationApprovals/>}/>
            </>
          )}

          {role==="student" && (
            <>
              <Route path="/RegistrationProgress" element={<RegistrationProgress/>}/>
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