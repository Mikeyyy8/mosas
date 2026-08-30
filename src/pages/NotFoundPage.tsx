import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="animate-fade-in grid min-h-[70vh] place-items-center px-5">
      <div className="text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-surface-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-surface-500 text-pretty">
          The page you're looking for has moved, or never existed in the first place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Go home
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
