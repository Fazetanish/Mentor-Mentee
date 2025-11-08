import './index.css'

import Dashboard from './Components/Dashboard'
import SignInPage from './Components/Signin'
import SignUpPage from './Components/Signup'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import StudentProfileForm from './Components/Student_Profiles'
import MentorConnectLandingPage from './Components/Landing_Page'

function App(){
  return <>
    <Router>
      <Routes>
        <Route path='/' element = {<Dashboard />} />
        <Route path='/signin' element = {<SignInPage /> } />
        <Route path='/signup' element = {<SignUpPage />} />
        <Route path='/student-profiles' element={<StudentProfileForm />} />
        <Route path='/landing-page' element ={<MentorConnectLandingPage />} />
      </Routes>
    </Router>
  </>
}

export default App;