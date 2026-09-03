import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-24 text-center max-w-lg">
      <h1 className="text-6xl font-serif text-brand">404</h1>
      <p className="text-xl font-serif mt-3">Page Not Found</p>
      <p className="text-stone-500 mt-3">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Link to="/" className="btn-brand">GO HOME</Link>
        <Link to="/shop" className="btn border">CONTINUE SHOPPING</Link>
      </div>
    </div>
  );
}
