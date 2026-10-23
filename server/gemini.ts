import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Transcribes audio recording into text using `gemini-3.5-transcribe`
 */
export async function transcribeAudio(base64Data: string, mimeType: string = 'audio/webm'): Promise<string> {
  const ai = getAiClient();
  try {
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this school teacher audio recording accurately. Return clean, punctuated spoken text only.' }
        ]
      },
    });

    return response.text || '';
  } catch (error: any) {
    console.error('Error during audio transcription:', error);
    throw new Error(error.message || 'Failed to transcribe audio.');
  }
}

/**
 * Generates personalized, constructive teacher remarks for a student report card
 */
export async function generateStudentRemarks(studentName: string, subjectMarks: { subject: string; score: number; max: number }[], attendanceRate: number): Promise<string> {
  const ai = getAiClient();
  try {
    const prompt = `You are a compassionate, professional school principal or head teacher.
Write a 3 to 4 sentence personalized academic progress remark for student "${studentName}".
Academic performance:
${subjectMarks.map(m => `- ${m.subject}: ${m.score}/${m.max} (${Math.round((m.score / m.max) * 100)}%)`).join('\n')}
Attendance Rate: ${attendanceRate}%

Tone: Encouraging, specific, actionable, highlighting strengths and offering one clear area for growth. Do not use generic filler words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You write concise, high-impact school report remarks.'
      }
    });

    return response.text || 'Good overall performance and participation in classroom activities.';
  } catch (error: any) {
    console.error('Error generating student remarks:', error);
    return `${studentName} demonstrates dedication across all subjects with consistent attendance of ${attendanceRate}%. Continued focus on analytical problem-solving will yield further excellence.`;
  }
}

/**
 * Generates an intelligent executive summary or academic report analysis
 */
export async function analyzeClassPerformance(className: string, stats: { totalStudents: number; averageScore: number; passingRate: number; topSubjects: string[]; strugglingSubjects: string[] }): Promise<string> {
  const ai = getAiClient();
  try {
    const prompt = `Analyze academic data for ${className}:
- Total Students: ${stats.totalStudents}
- Average Class Score: ${stats.averageScore}%
- Passing Rate: ${stats.passingRate}%
- Strongest Subjects: ${stats.topSubjects.join(', ')}
- Areas for Pedagogical Intervention: ${stats.strugglingSubjects.join(', ')}

Provide 3 concise bullet points with strategic recommendations for faculty and subject teachers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return response.text || 'Overall performance remains satisfactory with notable strengths in mathematics and science.';
  } catch (error: any) {
    console.error('Error analyzing class performance:', error);
    return '1. Implement bi-weekly revision quizzes in struggling subjects.\n2. Leverage peer study groups led by top-ranking students.\n3. Conduct targeted teacher-parent check-ins before final assessments.';
  }
}

/**
 * Generates professional parent notification letter for fee reminder or attendance alert
 */
export async function generateParentNotice(studentName: string, parentName: string, type: 'fee_overdue' | 'attendance_warning', details: { amount?: number; dueDate?: string; daysAbsent?: number }): Promise<string> {
  const ai = getAiClient();
  try {
    const prompt = type === 'fee_overdue'
      ? `Write a respectful, polite, and official school fee reminder message to parent ${parentName} regarding student ${studentName}. Outstanding balance: $${details.amount}, due date was ${details.dueDate}. Keep under 100 words.`
      : `Write a gentle yet firm school attendance inquiry notice to parent ${parentName} regarding student ${studentName}. The student has accumulated ${details.daysAbsent} unexcused absences. Invite the parent to discuss support with the counselor. Keep under 100 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    });

    return response.text || '';
  } catch (error: any) {
    console.error('Error generating parent notice:', error);
    return `Dear ${parentName}, this is a gentle notification regarding ${studentName}'s records. Please contact the administrative office at your earliest convenience.`;
  }
}
