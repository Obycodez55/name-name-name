import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Clock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@utils/helpers';
import { GameConfig, ValidationMode, LetterSelectionMode, GAME_CONSTANTS } from '@name-name-name/shared';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';

interface CreateGameFormProps {
  onCreateGame: (config: Partial<GameConfig>, creatorName: string) => void;
  isLoading?: boolean;
  className?: string;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({
  onCreateGame,
  isLoading = false,
  className
}) => {
  const [creatorName, setCreatorName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<Partial<GameConfig>>({
    maxPlayers: GAME_CONSTANTS.DEFAULT_MAX_PLAYERS,
    roundTimeLimit: GAME_CONSTANTS.DEFAULT_ROUND_TIME,
    validationMode: ValidationMode.DICTIONARY,
    letterSelectionMode: LetterSelectionMode.RANDOM,
    categories: GAME_CONSTANTS.DEFAULT_CATEGORIES.slice(0, 6),
    enableChat: true,
    allowSpectators: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim()) return;
    
    onCreateGame(config, creatorName.trim());
  };

  const updateConfig = (updates: Partial<GameConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleCategory = (category: string) => {
    const currentCategories = config.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateConfig({ categories: updatedCategories });
  };

  return (
    <div className={cn('card', className)}>
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Game
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="card-body space-y-6">
        {/* Creator Name */}
        <Input
          label="Your Name"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="Enter your name"
          required
          maxLength={GAME_CONSTANTS.MAX_PLAYER_NAME_LENGTH}
          fullWidth
        />

        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Max Players"
            type="number"
            value={config.maxPlayers}
            onChange={(e) => updateConfig({ maxPlayers: parseInt(e.target.value) })}
            min={GAME_CONSTANTS.MIN_PLAYERS}
            max={GAME_CONSTANTS.MAX_PLAYERS}
            icon={<Users size={16} />}
          />
          
          <Input
            label="Round Time (seconds)"
            type="number"
            value={config.roundTimeLimit}
            onChange={(e) => updateConfig({ roundTimeLimit: parseInt(e.target.value) })}
            min={GAME_CONSTANTS.MIN_ROUND_TIME}
            max={GAME_CONSTANTS.MAX_ROUND_TIME}
            icon={<Clock size={16} />}
          />
        </div>

        {/* Categories Selection */}
        <div>
          <label className="form-label">Categories ({config.categories?.length || 0} selected)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {GAME_CONSTANTS.DEFAULT_CATEGORIES.map((category) => (
              <motion.button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={cn(
                  'p-3 rounded-lg border text-sm font-medium transition-colors',
                  config.categories?.includes(category)
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
          {(config.categories?.length || 0) < 3 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Please select at least 3 categories
            </p>
          )}
        </div>

        {/* Advanced Settings Toggle */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          icon={<Settings size={16} />}
          className="w-full"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </Button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 border-t pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Validation Mode</label>
                <select
                  className="form-input"
                  value={config.validationMode}
                  onChange={(e) => updateConfig({ validationMode: e.target.value as ValidationMode })}
                >
                  <option value={ValidationMode.DICTIONARY}>Dictionary</option>
                  <option value={ValidationMode.VOTING}>Player Voting</option>
                  <option value={ValidationMode.AI}>AI Validation</option>
                  <option value={ValidationMode.HYBRID}>Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Letter Selection</label>
                <select
                  className="form-input"
                  value={config.letterSelectionMode}
                  onChange={(e) => updateConfig({ letterSelectionMode: e.target.value as LetterSelectionMode })}
                >
                  <option value={LetterSelectionMode.RANDOM}>Random</option>
                  <option value={LetterSelectionMode.PLAYER_CHOICE}>Player Choice</option>
                  <option value={LetterSelectionMode.ROUND_ROBIN}>Round Robin</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enableChat}
                  onChange={(e) => updateConfig({ enableChat: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm">Enable Chat</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.allowSpectators}
                  onChange={(e) => updateConfig({ allowSpectators: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm">Allow Spectators</span>
              </label>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={!creatorName.trim() || (config.categories?.length || 0) < 3}
        >
          Create Game
        </Button>
      </form>
    </div>
  );
};

export default CreateGameForm;
