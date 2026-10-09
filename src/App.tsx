import { Navigate, Route, Routes } from 'react-router-dom'
import DebugPanel from './components/DebugPanel'
import Guard from './components/Guard'
import Layout from './components/Layout'
import Activity from './pages/Activity'
import Availability from './pages/Availability'
import Lessons from './pages/Lessons'
import Login from './pages/Login'
import Notes from './pages/Notes'
import Reservations from './pages/Reservations'
import Rules from './pages/Rules'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Guard />}>
          <Route element={<Layout />}>
            <Route index element={<Availability />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="notes" element={<Notes />} />
            <Route path="activity" element={<Activity />} />
            <Route path="rules" element={<Rules />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DebugPanel app="player" />
    </>
  )
}
