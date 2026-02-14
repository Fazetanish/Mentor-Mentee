import './index.css'

import Dashboard from './Components/Dashboard'
import SignInPage from './Components/Signin'
import SignUpPage from './Components/Signup'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import StudentProfileForm from './Components/Student_ProfilesForm'
import MentorConnectDashboard from './Components/Student_LandingPage'
import ProjectRequestPage from './Components/Requests'
import TeacherProfileForm from './Components/Teacher_ProfilesForm'
import TeacherLandingPage from './Components/Teacher_LandingPage'
import StudentProfilePage from './Components/Student_Profile_Page'
import RequestDetails from './Components/Student_ViewRequestDetails'
import FilteredRequestsPage from './Components/Teacher_Filtered_Requests'
import StudentNotifications from './Components/Student_Notifications'


function App(){
  return <>
    <Router basename="/Mentor-Mentee">
      <Routes>
        <Route path='/' element = {<Dashboard />} />
        <Route path='/signin' element = {<SignInPage /> } />
        <Route path='/signup' element = {<SignUpPage />} />
        <Route path='/student-profiles' element={<StudentProfileForm />} />
        <Route path='/student-landing-page' element ={<MentorConnectDashboard />} />
        <Route path='/teacher-profiles' element ={<TeacherProfileForm />} />
        <Route path='/teacher-landing-page' element={<TeacherLandingPage />} />
        <Route path='/project-request' element = {<ProjectRequestPage />} />
        <Route path='/student-profile-page' element = {<StudentProfilePage />} />
        <Route path="/request-details/:requestId" element={<RequestDetails />} />
        <Route path="/all-requests" element={<FilteredRequestsPage />} />
        <Route path="/notifications" element={<StudentNotifications />} />
      </Routes>
    </Router>
  </>
}

export default App;