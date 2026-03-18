#!/usr/bin/env node

/**
 * =====================================================
 * Science Category - 100 Questions Generator
 * =====================================================
 */

const fs = require('fs');
const path = require('path');

class ScienceQuestionsGenerator {
  constructor() {
    this.categoryId = 'science-comprehensive';
    this.categoryName = 'Science Collection';
    this.questions = [];
  }

  generatePhysicsQuestions() {
    const topics = [
      { subtopic: 'Classical Mechanics', count: 15 },
      { subtopic: 'Thermodynamics', count: 12 },
      { subtopic: 'Waves & Sound', count: 10 },
      { subtopic: 'Optics & Light', count: 10 },
      { subtopic: 'Electromagnetism', count: 15 },
      { subtopic: 'Modern Physics', count: 8 },
    ];

    let qNum = 1;
    topics.forEach(topic => {
      for (let i = 0; i < topic.count; i++) {
        this.questions.push({
          id: `physics-${qNum}`,
          categoryId: 'physics',
          type: 'text',
          difficulty: this.getRandomDifficulty(),
          points: this.getRandomPoints(),
          
          question: `${topic.subtopic} Question ${i + 1}: What is a fundamental concept in ${topic.subtopic.toLowerCase()}?`,
          questionAr: `سؤال ${topic.subtopic} ${i + 1}: ما هو المفهوم الأساسي في ${topic.subtopic.toLowerCase()}؟`,
          
          answer: 'Fundamental Principle',
          answerAr: 'مبدأ أساسي',
          
          choices: [
            'Wrong Answer 1',
            'Fundamental Principle',
            'Wrong Answer 2',
            'Wrong Answer 3'
          ],
          choicesAr: [
            'إجابة خاطئة 1',
            'مبدأ أساسي',
            'إجابة خاطئة 2',
            'إجابة خاطئة 3'
          ],
          
          tags: ['physics', topic.subtopic.toLowerCase()],
          
          stats: {
            totalAttempts: Math.floor(Math.random() * 1000),
            correctAnswers: Math.floor(Math.random() * 800),
            averageTimeSpent: 30,
            difficultyIndex: Math.random()
          },
          
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        });

        qNum++;
      }
    });
  }

  generateBiologyQuestions() {
    const topics = [
      { subtopic: 'Cell Biology', count: 15 },
      { subtopic: 'Genetics', count: 15 },
      { subtopic: 'Evolution', count: 12 },
      { subtopic: 'Ecology', count: 12 },
      { subtopic: 'Anatomy', count: 15 },
      { subtopic: 'Physiology', count: 11 },
    ];

    let qNum = 1;
    topics.forEach(topic => {
      for (let i = 0; i < topic.count; i++) {
        this.questions.push({
          id: `biology-${qNum}`,
          categoryId: 'biology',
          type: i % 3 === 0 ? 'image' : 'text',
          difficulty: this.getRandomDifficulty(),
          points: this.getRandomPoints(),
          
          question: `${topic.subtopic} Question ${i + 1}: What is important about this concept?`,
          questionAr: `سؤال ${topic.subtopic} ${i + 1}: ما أهمية هذا المفهوم؟`,
          
          answer: 'Key Concept',
          answerAr: 'مفهوم رئيسي',
          
          choices: [
            'Minor Detail',
            'Key Concept',
            'Related Topic',
            'Unrelated Answer'
          ],
          choicesAr: [
            'تفصيل ثانوي',
            'مفهوم رئيسي',
            'موضوع ذو صلة',
            'إجابة غير ذات صلة'
          ],
          
          ...(i % 3 === 0 && {
            imagePrompt: {
              description: `Modern scientific illustration related to ${topic.subtopic}`,
              imageUrl: `https://placeholder.com/600x400?text=${encodeURIComponent(topic.subtopic)}`,
              imageCaption: topic.subtopic,
              imageAlt: `Image showing ${topic.subtopic} concept`
            }
          }),
          
          tags: ['biology', topic.subtopic.toLowerCase()],
          
          stats: {
            totalAttempts: Math.floor(Math.random() * 1000),
            correctAnswers: Math.floor(Math.random() * 800),
            averageTimeSpent: 35,
            difficultyIndex: Math.random()
          },
          
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        });

        qNum++;
      }
    });
  }

  generateChemistryQuestions() {
    const topics = [
      { subtopic: 'Organic Chemistry', count: 18 },
      { subtopic: 'Inorganic Chemistry', count: 15 },
      { subtopic: 'Physical Chemistry', count: 12 },
      { subtopic: 'Biochemistry', count: 15 },
      { subtopic: 'Analytical Chemistry', count: 12 },
    ];

    let qNum = 1;
    topics.forEach(topic => {
      for (let i = 0; i < topic.count; i++) {
        const difficulty = this.getRandomDifficulty();
        const isRiddle = i % 8 === 0; // Every 8th question is a riddle
        
        this.questions.push({
          id: `chemistry-${qNum}`,
          categoryId: 'chemistry',
          type: isRiddle ? 'riddle' : 'text',
          difficulty,
          points: this.getRandomPoints(),
          
          question: isRiddle 
            ? `Riddle: I have ${i + 1} atoms, what compound am I?`
            : `${topic.subtopic} Question ${i + 1}: Which is correct?`,
          
          questionAr: isRiddle
            ? `لغز: أنا أحتوي على ${i + 1} ذرات، أي مركب أنا؟`
            : `سؤال ${topic.subtopic} ${i + 1}: أي منها صحيح؟`,
          
          answer: isRiddle ? 'Molecule' : 'Correct Answer',
          answerAr: isRiddle ? 'جزيء' : 'الإجابة الصحيحة',
          
          ...(!isRiddle && {
            choices: [
              'Wrong 1',
              'Correct Answer',
              'Wrong 2',
              'Wrong 3'
            ],
            choicesAr: [
              'خطأ 1',
              'الإجابة الصحيحة',
              'خطأ 2',
              'خطأ 3'
            ]
          }),
          
          tags: ['chemistry', topic.subtopic.toLowerCase(), ...(isRiddle ? ['riddle'] : [])],
          
          explanationText: isRiddle ? 'A molecule is a group of atoms bonded together.' : undefined,
          
          stats: {
            totalAttempts: Math.floor(Math.random() * 1000),
            correctAnswers: Math.floor(Math.random() * 800),
            averageTimeSpent: 40,
            difficultyIndex: Math.random()
          },
          
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        });

        qNum++;
      }
    });
  }

  generateAstronomyQuestions() {
    const topics = [
      { subtopic: 'Solar System', count: 20 },
      { subtopic: 'Stars', count: 15 },
      { subtopic: 'Galaxies', count: 15 },
      { subtopic: 'Cosmology', count: 12 },
      { subtopic: 'Space Exploration', count: 13 },
    ];

    let qNum = 1;
    topics.forEach(topic => {
      for (let i = 0; i < topic.count; i++) {
        const isVideo = i % 5 === 0; // Every 5th is video-based
        
        this.questions.push({
          id: `astronomy-${qNum}`,
          categoryId: 'astronomy',
          type: isVideo ? 'video' : 'text',
          difficulty: this.getRandomDifficulty(),
          points: this.getRandomPoints(),
          
          question: `${topic.subtopic} Question ${i + 1}: What do you know about this?`,
          questionAr: `سؤال ${topic.subtopic} ${i + 1}: ماذا تعرف عن هذا؟`,
          
          answer: 'Correct Fact',
          answerAr: 'حقيقة صحيحة',
          
          choices: [
            'False Fact',
            'Correct Fact',
            'Different Topic',
            'Misleading Answer'
          ],
          choicesAr: [
            'حقيقة خاطئة',
            'حقيقة صحيحة',
            'موضوع مختلف',
            'إجابة مضللة'
          ],
          
          ...(isVideo && {
            videoData: {
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              duration: 480,
              startTime: Math.floor(Math.random() * 400),
              endTime: Math.floor(Math.random() * 400) + 30,
              caption: `Learn about ${topic.subtopic}`,
              isYoutube: true
            }
          }),
          
          tags: ['astronomy', topic.subtopic.toLowerCase(), ...(isVideo ? ['video'] : [])],
          
          stats: {
            totalAttempts: Math.floor(Math.random() * 1000),
            correctAnswers: Math.floor(Math.random() * 800),
            averageTimeSpent: 45,
            difficultyIndex: Math.random()
          },
          
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        });

        qNum++;
      }
    });
  }

  getRandomDifficulty() {
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    const weights = [0.35, 0.35, 0.20, 0.10]; // More easy/medium questions
    const rand = Math.random();
    let sum = 0;
    
    for (let i = 0; i < difficulties.length; i++) {
      sum += weights[i];
      if (rand < sum) return difficulties[i];
    }
    
    return 'medium';
  }

  getRandomPoints() {
    const points = [100, 150, 200, 300];
    const difficulty = this.getRandomDifficulty();
    
    if (difficulty === 'easy') return 100;
    if (difficulty === 'medium') return 150;
    if (difficulty === 'hard') return 200;
    return 300;
  }

  generate() {
    console.log('🧬 Generating Science Questions...\n');
    console.log('  📊 Physics questions...');
    this.generatePhysicsQuestions();
    
    console.log('  📊 Biology questions...');
    this.generateBiologyQuestions();
    
    console.log('  📊 Chemistry questions...');
    this.generateChemistryQuestions();
    
    console.log('  📊 Astronomy questions...');
    this.generateAstronomyQuestions();
    
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
        }
      }
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(bankData, null, 2));
    
    console.log(`\n✅ Saved to: ${outputPath}`);
    console.log(`\n📊 Statistics:`);
    console.log(`   Total Questions: ${bankData.totalQuestions}`);
    console.log(`\n   By Type:`);
    Object.entries(bankData.stats.byType).forEach(([type, count]) => {
      console.log(`     • ${type}: ${count}`);
    });
    console.log(`\n   By Difficulty:`);
    Object.entries(bankData.stats.byDifficulty).forEach(([diff, count]) => {
      console.log(`     • ${diff}: ${count}`);
    });

    return bankData;
  }
}

// Run generator
const generator = new ScienceQuestionsGenerator();
generator.generate();
generator.save(path.join(process.cwd(), 'data', 'science-100-questions.json'));
