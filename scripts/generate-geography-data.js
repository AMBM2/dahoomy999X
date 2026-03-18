#!/usr/bin/env node

/**
 * =====================================================
 * Geography Category - 100 Questions Generator
 * =====================================================
 */

const fs = require('fs');
const path = require('path');

class GeographyQuestionsGenerator {
  constructor() {
    this.categoryId = 'geography-comprehensive';
    this.categoryName = 'Geography Collection';
    this.questions = [];
    this.arabCountries = [
      { name: 'Egypt', ar: 'مصر', capital: 'Cairo', ar_capital: 'القاهرة' },
      { name: 'Saudi Arabia', ar: 'السعودية', capital: 'Riyadh', ar_capital: 'الرياض' },
      { name: 'UAE', ar: 'الإمارات', capital: 'Abu Dhabi', ar_capital: 'ابوظبي' },
      { name: 'Kuwait', ar: 'الكويت', capital: 'Kuwait City', ar_capital: 'مدينة الكويت' },
      { name: 'Iraq', ar: 'العراق', capital: 'Baghdad', ar_capital: 'بغداد' },
    ];
  }

  generateCapitalQuestions() {
    const questions_data = [
      { country: 'France', capital: 'Paris', alternatives: ['Lyon', 'Marseille', 'Nice'] },
      { country: 'Germany', capital: 'Berlin', alternatives: ['Munich', 'Hamburg', 'Cologne'] },
      { country: 'Spain', capital: 'Madrid', alternatives: ['Barcelona', 'Seville', 'Valencia'] },
      { country: 'Italy', capital: 'Rome', alternatives: ['Milan', 'Florence', 'Venice'] },
      { country: 'Japan', capital: 'Tokyo', alternatives: ['Osaka', 'Kyoto', 'Yokohama'] },
      { country: 'China', capital: 'Beijing', alternatives: ['Shanghai', 'Guangzhou', 'Xi\'an'] },
      { country: 'India', capital: 'New Delhi', alternatives: ['Mumbai', 'Bangalore', 'Chennai'] },
      { country: 'Brazil', capital: 'Brasília', alternatives: ['Rio de Janeiro', 'São Paulo', 'Salvador'] },
      { country: 'USA', capital: 'Washington DC', alternatives: ['New York', 'Los Angeles', 'Chicago'] },
      { country: 'Australia', capital: 'Canberra', alternatives: ['Sydney', 'Melbourne', 'Brisbane'] },
    ];

    for (let i = 0; i < 25; i++) {
      const data = questions_data[i % questions_data.length];
      const difficulty = this.getRandomDifficulty();
      
      this.questions.push({
        id: `geography-capital-${i + 1}`,
        categoryId: 'capitals',
        type: i % 4 === 0 ? 'image' : 'text',
        difficulty,
        points: this.getPointsByDifficulty(difficulty),
        
        question: `What is the capital of ${data.country}?`,
        questionAr: `ما عاصمة ${data.country}؟`,
        
        answer: data.capital,
        answerAr: data.capital,
        
        choices: this.shuffleArray([data.capital, ...data.alternatives]),
        choicesAr: this.shuffleArray([data.capital, ...data.alternatives]),
        
        ...(i % 4 === 0 && {
          imagePrompt: {
            description: `Flag of ${data.country} and ${data.capital} landmarks`,
            imageUrl: `https://placeholder.com/600x400?text=${encodeURIComponent(`${data.country} - ${data.capital}`)}`,
            imageCaption: `${data.capital} is the capital of ${data.country}`,
            imageAlt: `${data.capital}, capital of ${data.country}`
          }
        }),
        
        tags: ['geography', 'capitals', 'world'],
        
        stats: {
          totalAttempts: Math.floor(Math.random() * 1500),
          correctAnswers: Math.floor(Math.random() * 1200),
          averageTimeSpent: 20,
          difficultyIndex: 0.2
        },
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }
  }

  generateArabCountriesQuestions() {
    for (let i = 0; i < 20; i++) {
      const country = this.arabCountries[i % this.arabCountries.length];
      const difficulty = this.getRandomDifficulty();
      const isVideo = i % 6 === 0;
      
      this.questions.push({
        id: `geography-arab-${i + 1}`,
        categoryId: 'arab-countries',
        type: isVideo ? 'video' : 'text',
        difficulty,
        points: this.getPointsByDifficulty(difficulty),
        
        question: `What is the capital of ${country.ar}?`,
        questionAr: `ما عاصمة ${country.ar}؟`,
        
        answer: country.capital,
        answerAr: country.ar_capital,
        
        choices: this.shuffleArray([
          country.capital,
          ...this.arabCountries.filter(c => c.name !== country.name).slice(0, 3).map(c => c.capital)
        ]),
        choicesAr: this.shuffleArray([
          country.ar_capital,
          ...this.arabCountries.filter(c => c.name !== country.name).slice(0, 3).map(c => c.ar_capital)
        ]),
        
        ...(isVideo && {
          videoData: {
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: 300,
            startTime: 0,
            endTime: 30,
            caption: `Learn about ${country.ar_capital}`,
            isYoutube: true
          }
        }),
        
        tags: ['geography', 'arab-countries', 'middle-east', ...(isVideo ? ['video'] : [])],
        
        stats: {
          totalAttempts: Math.floor(Math.random() * 2000),
          correctAnswers: Math.floor(Math.random() * 1600),
          averageTimeSpent: 25,
          difficultyIndex: 0.15
        },
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }
  }

  generateGeographyRiddles() {
    const riddles = [
      {
        question: 'I am surrounded by water but not an island. What am I?',
        questionAr: 'أنا محاط بالماء لكنني لست جزيرة. ما أنا؟',
        answer: 'Peninsula',
        answerAr: 'شبه جزيرة'
      },
      {
        question: 'I divide the world into east and west. What am I?',
        questionAr: 'أنا أقسم العالم إلى شرق وغرب. ما أنا؟',
        answer: 'Prime Meridian',
        answerAr: 'خط جرينتش'
      },
      {
        question: 'I am the longest river in the world. What am I?',
        questionAr: 'أنا أطول نهر في العالم. ما أنا؟',
        answer: 'Nile River',
        answerAr: 'نهر النيل'
      },
    ];

    for (let i = 0; i < 15; i++) {
      const riddle = riddles[i % riddles.length];
      
      this.questions.push({
        id: `geography-riddle-${i + 1}`,
        categoryId: 'maps',
        type: 'riddle',
        difficulty: 'hard',
        points: 250,
        
        question: riddle.question,
        questionAr: riddle.questionAr,
        
        answer: riddle.answer,
        answerAr: riddle.answerAr,
        
        tags: ['geography', 'riddle', 'world', 'challenge'],
        
        explanationText: `This is a geography-based riddle testing your knowledge of world features and landmarks.`,
        
        stats: {
          totalAttempts: Math.floor(Math.random() * 800),
          correctAnswers: Math.floor(Math.random() * 400),
          averageTimeSpent: 60,
          difficultyIndex: 0.6
        },
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }
  }

  generateMapQuestions() {
    const locations = [
      { name: 'Mediterranean Sea', ar: 'البحر المتوسط', region: 'Europe & Africa' },
      { name: 'Sahara Desert', ar: 'الصحراء الكبرى', region: 'Africa' },
      { name: 'Rocky Mountains', ar: 'جبال روكي', region: 'North America' },
      { name: 'Amazon Rainforest', ar: 'غابة الأمازون', region: 'South America' },
    ];

    for (let i = 0; i < 20; i++) {
      const location = locations[i % locations.length];
      const difficulty = this.getRandomDifficulty();
      
      this.questions.push({
        id: `geography-map-${i + 1}`,
        categoryId: 'maps',
        type: i % 3 === 0 ? 'image' : 'text',
        difficulty,
        points: this.getPointsByDifficulty(difficulty),
        
        question: `Which region is ${location.name} located in?`,
        questionAr: `في أي منطقة يقع ${location.ar}؟`,
        
        answer: location.region,
        answerAr: location.region,
        
        choices: this.shuffleArray([
          location.region,
          'Northern Europe',
          'East Asia',
          'Southern Africa'
        ]),
        
        ...(i % 3 === 0 && {
          imagePrompt: {
            description: `Map showing the location of ${location.name}`,
            imageUrl: `https://placeholder.com/600x400?text=${encodeURIComponent(location.name)}`,
            imageCaption: `${location.name} - ${location.ar}`,
            imageAlt: `Location of ${location.name}`
          }
        }),
        
        tags: ['geography', 'maps', 'locations', 'world'],
        
        stats: {
          totalAttempts: Math.floor(Math.random() * 1200),
          correctAnswers: Math.floor(Math.random() * 900),
          averageTimeSpent: 30,
          difficultyIndex: 0.3
        },
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }
  }

  generateFlagQuestions() {
    const countries_flags = [
      { name: 'France', flag: '🇫🇷' },
      { name: 'Japan', flag: '🇯🇵' },
      { name: 'Brazil', flag: '🇧🇷' },
      { name: 'South Africa', flag: '🇿🇦' },
    ];

    for (let i = 0; i < 20; i++) {
      const country_flag = countries_flags[i % countries_flags.length];
      const difficulty = this.getRandomDifficulty();
      
      this.questions.push({
        id: `geography-flag-${i + 1}`,
        categoryId: 'flags',
        type: 'image',
        difficulty,
        points: this.getPointsByDifficulty(difficulty),
        
        question: `What country does this flag belong to? ${country_flag.flag}`,
        questionAr: `أي دولة ينتمي هذا العلم إليها؟ ${country_flag.flag}`,
        
        answer: country_flag.name,
        answerAr: country_flag.name,
        
        choices: this.shuffleArray([
          country_flag.name,
          ...countries_flags.filter(c => c.name !== country_flag.name).slice(0, 3).map(c => c.name)
        ]),
        
        imagePrompt: {
          description: `Flag of ${country_flag.name}`,
          imageUrl: `https://placeholder.com/600x400?text=${encodeURIComponent(country_flag.flag)}`,
          imageCaption: `Identify: ${country_flag.flag}`,
          imageAlt: `Flag of ${country_flag.name}`
        },
        
        tags: ['geography', 'flags', 'countries', 'identification'],
        
        stats: {
          totalAttempts: Math.floor(Math.random() * 1500),
          correctAnswers: Math.floor(Math.random() * 1200),
          averageTimeSpent: 20,
          difficultyIndex: 0.25
        },
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }
  }

  shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getRandomDifficulty() {
    const rand = Math.random();
    if (rand < 0.4) return 'easy';
    if (rand < 0.7) return 'medium';
    if (rand < 0.9) return 'hard';
    return 'expert';
  }

  getPointsByDifficulty(difficulty) {
    const points = {
      easy: 100,
      medium: 150,
      hard: 200,
      expert: 300
    };
    return points[difficulty] || 100;
  }

  generate() {
    console.log('🌍 Generating Geography Questions...\n');
    console.log('  📍 Capital cities...');
    this.generateCapitalQuestions();
    
    console.log('  📍 Arab countries...');
    this.generateArabCountriesQuestions();
    
    console.log('  📍 Map and locations...');
    this.generateMapQuestions();
    
    console.log('  📍 Flags...');
    this.generateFlagQuestions();
    
    console.log('  📍 Geography riddles...');
    this.generateGeographyRiddles();
    
    return this.questions;
  }

  save(outputPath) {
    const bankData = {
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      totalQuestions: this.questions.length,
      questions: this.questions,
      generatedAt: new Date().toISOString(),
      version: '2.0',
      stats: {
        byType: {
          text: this.questions.filter(q => q.type === 'text').length,
          image: this.questions.filter(q => q.type === 'image').length,
          video: this.questions.filter(q => q.type === 'video').length,
          riddle: this.questions.filter(q => q.type === 'riddle').length,
        },
        byDifficulty: {
          easy: this.questions.filter(q => q.difficulty === 'easy').length,
          medium: this.questions.filter(q => q.difficulty === 'medium').length,
          hard: this.questions.filter(q => q.difficulty === 'hard').length,
          expert: this.questions.filter(q => q.difficulty === 'expert').length,
        },
        byCategory: {
          capitals: this.questions.filter(q => q.categoryId === 'capitals').length,
          arabCountries: this.questions.filter(q => q.categoryId === 'arab-countries').length,
          maps: this.questions.filter(q => q.categoryId === 'maps').length,
          flags: this.questions.filter(q => q.categoryId === 'flags').length,
        }
      }
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(bankData, null, 2));
    
    console.log(`\n✅ Saved to: ${outputPath}`);
    console.log(`\n📊 Geography Statistics:`);
    console.log(`   Total Questions: ${bankData.totalQuestions}`);
    console.log(`\n   By Type:`);
    Object.entries(bankData.stats.byType).forEach(([type, count]) => {
      console.log(`     • ${type}: ${count}`);
    });
    console.log(`\n   By Difficulty:`);
    Object.entries(bankData.stats.byDifficulty).forEach(([diff, count]) => {
      console.log(`     • ${diff}: ${count}`);
    });
    console.log(`\n   By Category:`);
    Object.entries(bankData.stats.byCategory).forEach(([cat, count]) => {
      console.log(`     • ${cat}: ${count}`);
    });

    return bankData;
  }
}

// Run generator
const generator = new GeographyQuestionsGenerator();
generator.generate();
generator.save(path.join(process.cwd(), 'data', 'geography-100-questions.json'));
