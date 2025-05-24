import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '@components/ui/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="content-container">
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <motion.div
              className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              404
            </motion.div>
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              icon={<Home size={16} />}
              size="lg"
              fullWidth
            >
              Go Home
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              icon={<ArrowLeft size={16} />}
              size="lg"
              fullWidth
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;