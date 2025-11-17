import './index.css'

import Dashboard from './Components/Dashboard'
import SignInPage from './Components/Signin'
import SignUpPage from './Components/Signup'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import StudentProfileForm from './Components/Student_Profiles'
import MentorConnectDashboard from './Components/Student_LandingPage'


function App(){
  return <>
    <Router>
      <Routes>
        <Route path='/' element = {<Dashboard />} />
        <Route path='/signin' element = {<SignInPage /> } />
        <Route path='/signup' element = {<SignUpPage />} />
        <Route path='/student-profiles' element={<StudentProfileForm />} />
        <Route path='/student-landing-page' element ={<MentorConnectDashboard />} />
      </Routes>
    </Router>
  </>
}

export default App;