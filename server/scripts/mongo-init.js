// MongoDB initialization script
print('Starting MongoDB initialization for Name! Name!! Name!!! game...');

// Switch to the game database
db = db.getSiblingDB('name-name-name-game');

// Create collections with validation
db.createCollection('gamehistories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['gameId', 'roomCode', 'creatorId', 'config', 'players', 'rounds'],
      properties: {
        gameId: { bsonType: 'string' },
        roomCode: { bsonType: 'string' },
        creatorId: { bsonType: 'string' },
        config: { bsonType: 'object' },
        players: { bsonType: 'array' },
        rounds: { bsonType: 'array' },
        finalScores: { bsonType: 'object' },
        completedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('roomconfigs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['roomCode', 'config'],
      properties: {
        roomCode: { bsonType: 'string' },
        config: { bsonType: 'object' }
      }
    }
  }
});

db.createCollection('dictionaries', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['category', 'words'],
      properties: {
        category: { bsonType: 'string' },
        words: { bsonType: 'array' },
        wordCount: { bsonType: 'number' }
      }
    }
  }
});

// Create indexes
print('Creating indexes...');

// Game History indexes
db.gamehistories.createIndex({ roomCode: 1 });
db.gamehistories.createIndex({ 'players.id': 1 });
db.gamehistories.createIndex({ completedAt: -1 });
db.gamehistories.createIndex({ creatorId: 1 });
db.gamehistories.createIndex({ winner: 1 });

// Room Config indexes
db.roomconfigs.createIndex({ roomCode: 1 }, { unique: true });

// Dictionary indexes
db.dictionaries.createIndex({ category: 1 }, { unique: true });
db.dictionaries.createIndex({ words: 1 });
db.dictionaries.createIndex({ category: 1, words: 1 });

// Insert initial dictionary data
print('Inserting initial dictionary data...');

const initialDictionaries = [
  {
    category: 'animals',
    words: [
      'aardvark', 'albatross', 'alligator', 'ant', 'antelope', 'ape', 'armadillo',
      'badger', 'bat', 'bear', 'beaver', 'bee', 'buffalo', 'butterfly',
      'cat', 'cheetah', 'cow', 'crab', 'crocodile',
      'deer', 'dog', 'dolphin', 'duck',
      'eagle', 'elephant', 'elk', 'emu',
      'falcon', 'fish', 'fox', 'frog',
      'giraffe', 'goat', 'goose', 'gorilla',
      'hamster', 'horse', 'hyena',
      'iguana',
      'jaguar', 'jellyfish',
      'kangaroo', 'koala',
      'lion', 'llama', 'lobster',
      'monkey', 'mouse',
      'octopus', 'owl',
      'panda', 'penguin', 'pig', 'polar bear',
      'rabbit', 'raccoon', 'rhinoceros',
      'shark', 'sheep', 'snake', 'spider', 'squirrel',
      'tiger', 'turtle',
      'whale', 'wolf',
      'zebra'
    ],
    wordCount: 0
  },
  {
    category: 'foods',
    words: [
      'apple', 'avocado',
      'banana', 'bread', 'broccoli', 'burger',
      'cake', 'carrot', 'cheese', 'chicken', 'chocolate', 'cookie',
      'donut',
      'egg',
      'fish', 'french fries',
      'grapes',
      'hamburger', 'honey',
      'ice cream',
      'juice',
      'kiwi',
      'lemon', 'lettuce',
      'milk', 'mushroom',
      'noodles',
      'orange',
      'pasta', 'pizza', 'potato',
      'rice',
      'salad', 'sandwich', 'soup', 'spaghetti', 'strawberry',
      'tomato',
      'watermelon'
    ],
    wordCount: 0
  },
  {
    category: 'cities',
    words: [
      'amsterdam', 'atlanta', 'austin',
      'bangkok', 'barcelona', 'beijing', 'berlin', 'boston',
      'cairo', 'chicago',
      'dallas', 'denver', 'dubai',
      'edinburgh',
      'florence', 'frankfurt',
      'geneva',
      'hamburg', 'helsinki', 'houston',
      'istanbul',
      'jakarta',
      'kyoto',
      'london', 'los angeles',
      'madrid', 'melbourne', 'miami', 'moscow', 'mumbai',
      'new york', 'nairobi',
      'oslo',
      'paris', 'prague',
      'quebec',
      'rio de janeiro', 'rome',
      'seattle', 'singapore', 'sydney',
      'tokyo', 'toronto',
      'vancouver', 'vienna',
      'washington', 'warsaw',
      'zagreb', 'zurich'
    ],
    wordCount: 0
  },
  {
    category: 'countries',
    words: [
      'argentina', 'australia', 'austria',
      'brazil', 'belgium',
      'canada', 'china', 'colombia',
      'denmark',
      'egypt', 'england',
      'france', 'finland',
      'germany', 'greece',
      'hungary',
      'india', 'ireland', 'israel', 'italy',
      'japan',
      'kenya', 'korea',
      'lebanon',
      'mexico', 'morocco',
      'netherlands', 'norway',
      'poland', 'portugal',
      'russia',
      'spain', 'sweden', 'switzerland',
      'thailand', 'turkey',
      'ukraine', 'united states',
      'venezuela',
      'wales'
    ],
    wordCount: 0
  },
  {
    category: 'colors',
    words: [
      'amber', 'aqua', 'azure',
      'beige', 'black', 'blue', 'brown',
      'crimson', 'cyan',
      'emerald',
      'fuchsia',
      'gold', 'gray', 'green',
      'indigo', 'ivory',
      'lime',
      'magenta', 'maroon',
      'navy',
      'olive', 'orange',
      'pink', 'purple',
      'red', 'rose',
      'silver',
      'tan', 'teal', 'turquoise',
      'violet',
      'white',
      'yellow'
    ],
    wordCount: 0
  },
  {
    category: 'sports',
    words: [
      'archery', 'athletics',
      'badminton', 'baseball', 'basketball', 'boxing',
      'cricket', 'cycling',
      'diving',
      'equestrian',
      'fencing', 'football',
      'golf', 'gymnastics',
      'handball', 'hockey',
      'judo',
      'karate',
      'lacrosse',
      'marathon',
      'netball',
      'polo',
      'rowing', 'rugby',
      'sailing', 'skating', 'skiing', 'soccer', 'swimming',
      'tennis', 'track and field',
      'volleyball',
      'water polo', 'weightlifting', 'wrestling'
    ],
    wordCount: 0
  }
];

// Insert dictionaries and update word counts
initialDictionaries.forEach(dict => {
  dict.wordCount = dict.words.length;
  dict.createdAt = new Date();
  dict.updatedAt = new Date();
  
  db.dictionaries.insertOne(dict);
  print(`Inserted ${dict.words.length} words for category: ${dict.category}`);
});

print('MongoDB initialization completed successfully!');
