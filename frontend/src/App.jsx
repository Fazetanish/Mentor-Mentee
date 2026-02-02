import './index.css'

import Dashboard from './Components/Dashboard'
import SignInPage from './Components/Signin'
import SignUpPage from './Components/Signup'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import StudentProfileForm from './Components/Student_Profiles'
import MentorConnectDashboard from './Components/Student_LandingPage'
import ProjectRequestPage from './Components/Requests'
import TeacherProfileForm from './Components/Teacher_Profiles'
import TeacherLandingPage from './Components/Teacher_LandingPage'


function App(){
  return <>
    <Router>
      <Routes>
        <Route path='/' element = {<Dashboard />} />
        <Route path='/signin' element = {<SignInPage /> } />
        <Route path='/signup' element = {<SignUpPage />} />
        <Route path='/student-profiles' element={<StudentProfileForm />} />
        <Route path='/student-landing-page' element ={<MentorConnectDashboard />} />
        <Route path='/teacher-profiles' element ={<TeacherProfileForm />} />
        <Route path='/teacher-landing-page' element={<TeacherLandingPage />} />
        <Route path='/project-request' element = {<ProjectRequestPage />} />
      </Routes>
    </Router>
  </>
}

export default App;