import './index.css'

import Dashboard from './Components/Dashboard'
import SignInPage from './Components/Signin'
import SignUpPage from './Components/Signup'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import { HashRouter } from 'react-router-dom'
import StudentProfileForm from './Components/Student_ProfilesForm'
import MentorConnectDashboard from './Components/Student_LandingPage'
import ProjectRequestPage from './Components/Requests'
import TeacherProfileForm from './Components/Teacher_ProfilesForm'
import TeacherLandingPage from './Components/Teacher_LandingPage'
import StudentProfilePage from './Components/Student_Profile_Page'
import RequestDetails from './Components/Student_ViewRequestDetails'
import TeacherRequestDetails from './Components/Teacher_ViewRequestDetails'
import FilteredRequestsPage from './Components/Teacher_Filtered_Requests'
import StudentNotifications from './Components/Student_Notifications'
import ProtectedRoute from './Components/ProtectedRoute'


function App(){
  return <>
    <Router basename="/Mentor-Mentee">
      <Routes>
        {/* Public routes */}
        <Route path='/' element = {<Dashboard />} />
        <Route path='/signin' element = {<SignInPage /> } />
        <Route path='/signup' element = {<SignUpPage />} />

        {/* Student-only routes */}
        <Route path='/student-profiles' element={<ProtectedRoute allowedRole="student"><StudentProfileForm /></ProtectedRoute>} />
        <Route path='/student-landing-page' element={<ProtectedRoute allowedRole="student"><MentorConnectDashboard /></ProtectedRoute>} />
        <Route path='/project-request' element={<ProtectedRoute allowedRole="student"><ProjectRequestPage /></ProtectedRoute>} />
        <Route path='/student-profile-page' element={<ProtectedRoute allowedRole="student"><StudentProfilePage /></ProtectedRoute>} />
        <Route path="/request-details/:requestId" element={<ProtectedRoute allowedRole="student"><RequestDetails /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRole="student"><StudentNotifications /></ProtectedRoute>} />

        {/* Teacher-only routes */}
        <Route path='/teacher-profiles' element={<ProtectedRoute allowedRole="teacher"><TeacherProfileForm /></ProtectedRoute>} />
        <Route path='/teacher-landing-page' element={<ProtectedRoute allowedRole="teacher"><TeacherLandingPage /></ProtectedRoute>} />
        <Route path="/teacher/request-details/:requestId" element={<ProtectedRoute allowedRole="teacher"><TeacherRequestDetails /></ProtectedRoute>} />
        <Route path="/all-requests" element={<ProtectedRoute allowedRole="teacher"><FilteredRequestsPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  </>
}

export default App;