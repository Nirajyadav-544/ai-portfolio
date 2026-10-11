import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";

export default function NotFound() {
  useSeo("Page not found");
  return (
    <div className="container-page py-28 text-center">
      <p className="gradient-text font-mono text-6xl font-extrabold">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page doesn't exist</h1>
      <p className="muted mt-2">The link may be broken or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
