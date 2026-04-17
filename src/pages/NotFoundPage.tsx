import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="animate-fade-in min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-display font-bold text-surface-200 dark:text-surface-800">
          404
        </p>
        <h1 className="mt-4 text-xl font-semibold text-surface-900 dark:text-surface-100">
          Page not found
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-sm font-medium text-surface-900 dark:text-surface-100 bg-surface-100 dark:bg-surface-800 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
