import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Button from '@components/ui/Button';

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error details from location state or props
  const errorMessage = error?.message || location.state?.error || 'An unexpected error occurred';
  const errorDetails = error?.stack || location.state?.details;

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="content-container">
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <motion.div
              className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage}
            </p>
            
            {errorDetails && process.env.NODE_ENV === 'development' && (
              <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                  {errorDetails}
                </pre>
              </details>
            )}
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleRetry}
              icon={<RotateCcw size={16} />}
              size="lg"
              fullWidth
            >
              Try Again
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              icon={<Home size={16} />}
              size="lg"
              fullWidth
            >
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorPage;