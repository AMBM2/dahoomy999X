#!/usr/bin/env node

/**
 * =====================================================
 * Quiz Platform Question Generator (2026)
 * =====================================================
 * 
 * Generates 100 diverse questions for any category
 * with image prompts, video timestamps, and multimodal support.
 * 
 * Usage: node generate-questions.js --category=science --language=ar
 */

const fs = require('fs');
const path = require('path');

// =====================================================
// QUESTION GENERATION ENGINE
// =====================================================

class QuestionGenerator {
  constructor(categoryId, categoryName, options = {}) {
    this.categoryId = categoryId;
    this.categoryName = categoryName;
    this.language = options.language || 'ar';  // ar or en
    this.difficulty = ['easy', 'medium', 'hard', 'expert'];
    this.questionTypes = ['text', 'image', 'video', 'riddle', 'matching', 'ordering'];
    this.questions = [];
    this.generatedAt = new Date().toISOString();
  }

  // =====================================================
  // CORE GENERATION METHODS
  // =====================================================

  /**
   * Generate 100 questions for the category
   */
  async generate(count = 100) {
    console.log(`🚀 Generating ${count} questions for "${this.categoryName}"...`);
    
    // Distribute question types evenly
    const textCount = Math.floor(count * 0.40);      // 40% text MCQ
    const imageCount = Math.floor(count * 0.30);     // 30% image-based
    const videoCount = Math.floor(count * 0.15);     // 15% video
    const riddleCount = Math.floor(count * 0.10);    // 10% riddles
    const specialCount = count - (textCount + imageCount + videoCount + riddleCount);

    // Generate each type
    this.questions.push(...await this.generateTextQuestions(textCount));
    this.questions.push(...await this.generateImageQuestions(imageCount));
    this.questions.push(...await this.generateVideoQuestions(videoCount));
    this.questions.push(...await this.generateRiddles(riddleCount));
    this.questions.push(...await this.generateSpecialQuestions(specialCount));

    console.log(`✅ Generated ${this.questions.length} questions`);
    return this.questions;
  }

  /**
   * Generate text-based multiple choice questions
   */
  async generateTextQuestions(count) {
    const questions = [];
    const questionTemplates = this.getQuestionTemplates();

    for (let i = 0; i < count; i++) {
      const template = questionTemplates[i % questionTemplates.length];
      const difficulty = this.difficulty[i % this.difficulty.length];
      
      questions.push({
        id: `${this.categoryId}-text-${i + 1}`,
        categoryId: this.categoryId,
        type: 'text',
        difficulty,
        points: this.getPointsForDifficulty(difficulty),
        
        question: template.question,
        questionAr: template.questionAr,
        answer: template.answer,
        answerAr: template.answerAr,
        choices: template.choices,
        choicesAr: template.choicesAr,
        
        tags: template.tags,
        stats: {
          totalAttempts: 0,
          correctAnswers: 0,
          averageTimeSpent: 30,
          difficultyIndex: difficulty === 'expert' ? 0.7 : difficulty === 'hard' ? 0.5 : 0.3
        },
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }

    return questions;
  }

  /**
   * Generate image-based questions with AI prompts
   */
  async generateImageQuestions(count) {
    const questions = [];
    const imagePrompts = this.getImagePrompts();

    for (let i = 0; i < count; i++) {
      const prompt = imagePrompts[i % imagePrompts.length];
      const difficulty = this.difficulty[i % this.difficulty.length];

      questions.push({
        id: `${this.categoryId}-image-${i + 1}`,
        categoryId: this.categoryId,
        type: 'image',
        difficulty,
        points: this.getPointsForDifficulty(difficulty),

        question: prompt.question,
        questionAr: prompt.questionAr,
        answer: prompt.answer,
        answerAr: prompt.answerAr,
        choices: prompt.choices,
        choicesAr: prompt.choicesAr,

        imagePrompt: {
          description: prompt.imagePrompt,
          imageUrl: `https://placeholder.com/600x400?text=${encodeURIComponent(prompt.answer)}`,
          imageCaption: prompt.imageCaption || prompt.answer,
          imageAlt: `Image related to ${prompt.answer}`
        },

        tags: [...prompt.tags, 'visual'],
        stats: {
          totalAttempts: 0,
          correctAnswers: 0,
          averageTimeSpent: 45,
          difficultyIndex: difficulty === 'expert' ? 0.8 : 0.6
        },

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }

    return questions;
  }

  /**
   * Generate video-based questions with timestamps
   */
  async generateVideoQuestions(count) {
    const questions = [];
    const videoPrompts = this.getVideoPrompts();

    for (let i = 0; i < count; i++) {
      const prompt = videoPrompts[i % videoPrompts.length];
      const difficulty = this.difficulty[i % this.difficulty.length];

      questions.push({
        id: `${this.categoryId}-video-${i + 1}`,
        categoryId: this.categoryId,
        type: 'video',
        difficulty,
        points: this.getPointsForDifficulty(difficulty),

        question: prompt.question,
        questionAr: prompt.questionAr,
        answer: prompt.answer,
        answerAr: prompt.answerAr,
        choices: prompt.choices,
        choicesAr: prompt.choicesAr,

        videoData: {
          videoUrl: prompt.videoUrl,
          duration: prompt.duration,
          startTime: prompt.startTime,
          endTime: prompt.endTime,
          caption: prompt.caption,
          isYoutube: prompt.isYoutube
        },

        tags: [...prompt.tags, 'video'],
        stats: {
          totalAttempts: 0,
          correctAnswers: 0,
          averageTimeSpent: 60,
          difficultyIndex: 0.5
        },

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }

    return questions;
  }

  /**
   * Generate riddle-style questions
   */
  async generateRiddles(count) {
    const questions = [];
    const riddles = this.getRiddles();

    for (let i = 0; i < count; i++) {
      const riddle = riddles[i % riddles.length];
      const difficulty = 'hard';  // Riddles are challenging

      questions.push({
        id: `${this.categoryId}-riddle-${i + 1}`,
        categoryId: this.categoryId,
        type: 'riddle',
        difficulty,
        points: 250,

        question: riddle.question,
        questionAr: riddle.questionAr,
        answer: riddle.answer,
        answerAr: riddle.answerAr,

        tags: [...riddle.tags, 'challenge'],
        explanationText: riddle.explanation,

        stats: {
          totalAttempts: 0,
          correctAnswers: 0,
          averageTimeSpent: 120,
          difficultyIndex: 0.75
        },

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }

    return questions;
  }

  /**
   * Generate special question types (matching, ordering)
   */
  async generateSpecialQuestions(count) {
    const questions = [];
    const special = this.getSpecialQuestions();

    for (let i = 0; i < count; i++) {
      const q = special[i % special.length];
      const difficulty = this.difficulty[i % this.difficulty.length];

      questions.push({
        id: `${this.categoryId}-special-${i + 1}`,
        categoryId: this.categoryId,
        type: q.type,
        difficulty,
        points: this.getPointsForDifficulty(difficulty),

        question: q.question,
        questionAr: q.questionAr,
        answer: q.answer,
        answerAr: q.answerAr,

        ...(q.type === 'matching' && { matchingPairs: q.matchingPairs }),
        ...(q.type === 'ordering' && { orderingSequence: q.orderingSequence }),

        tags: q.tags,
        stats: {
          totalAttempts: 0,
          correctAnswers: 0,
          averageTimeSpent: 60,
          difficultyIndex: 0.6
        },

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }

    return questions;
  }

  // =====================================================
  // TEMPLATE GENERATORS (Override these per category)
  // =====================================================

  getQuestionTemplates() {
    return [
      {
        question: 'What is a key characteristic of this category?',
        questionAr: 'ما هي الخاصية الرئيسية لهذه الفئة؟',
        answer: 'Fundamental concept',
        answerAr: 'مفهوم أساسي',
        choices: ['Choice A', 'Fundamental concept', 'Choice C', 'Choice D'],
        choicesAr: ['خيار أ', 'مفهوم أساسي', 'خيار ج', 'خيار د'],
        tags: ['basics', 'essential']
      }
    ];
  }

  getImagePrompts() {
    return [
      {
        question: 'What does this image represent?',
        questionAr: 'ما الذي تمثله هذه الصورة؟',
        answer: 'Example',
        answerAr: 'مثال',
        choices: ['Wrong 1', 'Example', 'Wrong 2', 'Wrong 3'],
        choicesAr: ['خطأ 1', 'مثال', 'خطأ 2', 'خطأ 3'],
        imagePrompt: 'A professional educational infographic',
        imageCaption: 'Example visual',
        tags: ['visual', 'modern']
      }
    ];
  }

  getVideoPrompts() {
    return [
      {
        question: 'What happens in this video clip?',
        questionAr: 'ما الذي يحدث في هذا المقطع؟',
        answer: 'Event',
        answerAr: 'حدث',
        choices: ['Option 1', 'Event', 'Option 3', 'Option 4'],
        choicesAr: ['خيار 1', 'حدث', 'خيار 3', 'خيار 4'],
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 180,
        startTime: 0,
        endTime: 30,
        caption: 'Video context',
        isYoutube: true,
        tags: ['video', 'media']
      }
    ];
  }

  getRiddles() {
    return [
      {
        question: 'I speak without a mouth. What am I?',
        questionAr: 'أتحدث بدون فم، من أنا؟',
        answer: 'Echo',
        answerAr: 'صدى',
        tags: ['wordplay', 'challenge'],
        explanation: 'An echo is the reflection of sound waves.'
      }
    ];
  }

  getSpecialQuestions() {
    return [
      {
        type: 'matching',
        question: 'Match the items',
        questionAr: 'طابق بين العناصر',
        answer: 'Correct matches',
        answerAr: 'التطابقات الصحيحة',
        matchingPairs: [
          { left: 'Item A', right: 'Description 1' },
          { left: 'Item B', right: 'Description 2' }
        ],
        tags: ['matching']
      }
    ];
  }

  getPointsForDifficulty(difficulty) {
    const points = {
      easy: 100,
      medium: 150,
      hard: 200,
      expert: 300
    };
    return points[difficulty] || 100;
  }

  // =====================================================
  // FILE OPERATIONS
  // =====================================================

  /**
   * Save questions to JSON file
   */
  saveToFile(outputPath) {
    const bankData = {
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      totalQuestions: this.questions.length,
      questions: this.questions,
      generatedAt: this.generatedAt,
      version: '2.0'
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(bankData, null, 2));
    
    console.log(`💾 Saved to: ${outputPath}`);
    return bankData;
  }

  /**
   * Generate SQL insert statements
   */
  generateSQL() {
    let sql = '-- Question Bank Import\n\n';

    this.questions.forEach(q => {
      const values = [
        `'${q.id}'`,
        `'${q.categoryId}'`,
        `'${q.type}'`,
        `'${q.difficulty}'`,
        q.points,
        `'${q.question.replace(/'/g, "''")}'`,
        `'${q.answer.replace(/'/g, "''")}'`,
        `'${JSON.stringify(q.choices || []).replace(/'/g, "''")}'`,
        `'${new Date().toISOString()}'`,
        `'system'`
      ];

      sql += `INSERT INTO questions VALUES (${values.join(', ')});\n`;
    });

    return sql;
  }

  /**
   * Generate CSV export
   */
  generateCSV() {
    const headers = [
      'ID', 'Category', 'Type', 'Difficulty', 'Points',
      'Question', 'Answer', 'Choices', 'Tags'
    ];

    let csv = headers.join(',') + '\n';

    this.questions.forEach(q => {
      const row = [
        q.id,
        q.categoryId,
        q.type,
        q.difficulty,
        q.points,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.answer.replace(/"/g, '""')}"`,
        `"${(q.choices || []).join('; ')}"`,
        `"${q.tags.join('; ')}"`
      ];

      csv += row.join(',') + '\n';
    });

    return csv;
  }
}

// =====================================================
// CATEGORY-SPECIFIC GENERATORS
// =====================================================

class ScienceQuestionGenerator extends QuestionGenerator {
  getQuestionTemplates() {
    return [
      {
        question: 'What is the chemical symbol for Gold?',
        questionAr: 'ما هو الرمز الكيميائي للذهب؟',
        answer: 'Au',
        answerAr: 'Au',
        choices: ['Ag', 'Au', 'Cu', 'Fe'],
        choicesAr: ['Ag', 'Au', 'Cu', 'Fe'],
        tags: ['chemistry', 'elements']
      },
      {
        question: 'Which planet is closest to the Sun?',
        questionAr: 'أي كوكب هو الأقرب إلى الشمس؟',
        answer: 'Mercury',
        answerAr: 'عطارد',
        choices: ['Venus', 'Mercury', 'Mars', 'Earth'],
        choicesAr: ['الزهرة', 'عطارد', 'المريخ', 'الأرض'],
        tags: ['astronomy', 'space']
      },
      // ... more templates
    ];
  }
}

class GeographyQuestionGenerator extends QuestionGenerator {
  getQuestionTemplates() {
    return [
      {
        question: 'What is the capital of France?',
        questionAr: 'ما هي عاصمة فرنسا؟',
        answer: 'Paris',
        answerAr: 'باريس',
        choices: ['Lyon', 'Paris', 'Marseille', 'Nice'],
        choicesAr: ['ليون', 'باريس', 'مرسيليا', 'نيس'],
        tags: ['capitals', 'europe']
      },
      // ... more templates
    ];
  }
}

// =====================================================
// CLI INTERFACE
// =====================================================

async function main() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    options[key] = value;
  });

  const category = options.category || 'science';
  const language = options.language || 'ar';
  const count = parseInt(options.count) || 100;

  console.log(`
  ╔════════════════════════════════════════════════════╗
  ║   Quiz Platform Question Generator v2.0 (2026)    ║
  ╚════════════════════════════════════════════════════╝
  `);

  console.log(`📚 Category: ${category}`);
  console.log(`🌐 Language: ${language}`);
  console.log(`📝 Questions: ${count}\n`);

  try {
    const generatorClass = 
      category === 'science' ? ScienceQuestionGenerator :
      category === 'geography' ? GeographyQuestionGenerator :
      QuestionGenerator;

    const generator = new generatorClass(category, category, { language });
    await generator.generate(count);

    // Save outputs
    const outputDir = path.join(process.cwd(), 'generated-data');
    generator.saveToFile(path.join(outputDir, `${category}-questions.json`));

    // Generate additional formats
    const csv = generator.generateCSV();
    fs.writeFileSync(path.join(outputDir, `${category}-questions.csv`), csv);

    const sql = generator.generateSQL();
    fs.writeFileSync(path.join(outputDir, `${category}-questions.sql`), sql);

    console.log(`\n✨ Generation complete!`);
    console.log(`📊 Questions generated: ${generator.questions.length}`);
    console.log(`🎯 Difficulty breakdown:`);
    
    ['easy', 'medium', 'hard', 'expert'].forEach(diff => {
      const count = generator.questions.filter(q => q.difficulty === diff).length;
      console.log(`   ${diff}: ${count} questions`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { QuestionGenerator, ScienceQuestionGenerator, GeographyQuestionGenerator };
