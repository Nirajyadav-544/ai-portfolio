import { lazy, Suspense } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { Spinner } from "./components/ui";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { CrudPage } from "./features/CrudPage";
import { certificatesConfig, educationConfig, experienceConfig, projectsConfig, skillsConfig } from "./pages/admin/resources";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Certifications = lazy(() => import("./pages/Certifications"));
const Resume = lazy(() => import("./pages/Resume"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const ProfileEditor = lazy(() => import("./pages/admin/ProfileEditor"));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="resume" element={<Resume />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminShell />}>
          <Route path="login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<CrudPage config={projectsConfig} />} />
            <Route path="skills" element={<CrudPage config={skillsConfig} />} />
            <Route path="certificates" element={<CrudPage config={certificatesConfig} />} />
            <Route path="education" element={<CrudPage config={educationConfig} />} />
            <Route path="experience" element={<CrudPage config={experienceConfig} />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

/** Admin pages get no visitor chrome (chat widget, page-view tracking). */
function AdminShell() {
  return (
    <main id="main">
      <Outlet />
    </main>
  );
}
