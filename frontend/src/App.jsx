import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import ExplorePage from "./pages/ExplorePage";
import FlightFinderPage from "./pages/FlightFinderPage";
import HomePage from "./pages/HomePage";
import JourneyPage from "./pages/JourneyPage";
import MyJourneysPage from "./pages/MyJourneysPage";
import PlanTripPage from "./pages/PlanTripPage";
import PreferencesPage from "./pages/PreferencesPage";
import SavedPage from "./pages/SavedPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route element={<Layout />}>
          <Route path="journey" element={<JourneyPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="plan" element={<PlanTripPage />} />
          <Route path="my-journeys" element={<MyJourneysPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="flights" element={<FlightFinderPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="*" element={<Navigate to="/journey" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
