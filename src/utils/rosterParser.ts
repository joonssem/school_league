import { Student } from '../types/league';

export interface ParsedStudentRow {
  grade: number;
  classNum: number;
  studentNum: number;
  name: string;
  gender?: 'M' | 'F';
}

/**
 * 나이스(NEIS) 또는 엑셀 출석부 텍스트 파서
 * 지원 패턴:
 * 1. "3 2 15 홍길동" -> 3학년 2반 15번 홍길동
 * 2. "3-2 15 홍길동" -> 3학년 2반 15번 홍길동
 * 3. "15 홍길동" (기본 학년/반 적용)
 * 4. 탭/쉼표 구분자 지원 ("3\t2\t15\t홍길동\t남")
 */
export function parseRosterText(
  rawText: string,
  defaultGrade = 5,
  defaultClass = 1
): ParsedStudentRow[] {
  const lines = rawText.split(/\r?\n/);
  const results: ParsedStudentRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Remove common table headers
    if (trimmed.includes('학년') && trimmed.includes('이름')) continue;
    if (trimmed.includes('번호') && trimmed.includes('성명')) continue;

    // Replace tabs or multiple spaces with single space
    const tokens = trimmed.split(/[\t, ]+/).filter(Boolean);
    if (tokens.length === 0) continue;

    let grade = defaultGrade;
    let classNum = defaultClass;
    let studentNum = 0;
    let name = '';
    let gender: 'M' | 'F' | undefined = undefined;

    // Check gender token if present (남/여, M/F)
    const filteredTokens: string[] = [];
    for (const token of tokens) {
      if (token === '남' || token.toUpperCase() === 'M') {
        gender = 'M';
      } else if (token === '여' || token.toUpperCase() === 'F') {
        gender = 'F';
      } else {
        filteredTokens.push(token);
      }
    }

    if (filteredTokens.length >= 4) {
      // e.g. ["3", "2", "15", "홍길동"]
      const g = parseInt(filteredTokens[0], 10);
      const c = parseInt(filteredTokens[1], 10);
      const n = parseInt(filteredTokens[2], 10);
      if (!isNaN(g) && !isNaN(c) && !isNaN(n)) {
        grade = g;
        classNum = c;
        studentNum = n;
        name = filteredTokens.slice(3).join(' ');
      }
    } else if (filteredTokens.length === 3) {
      // e.g. ["5-2", "15", "홍길동"] or ["2", "15", "홍길동"] (반, 번호, 이름)
      const dashMatch = filteredTokens[0].match(/^(\d+)[-~](\d+)$/);
      if (dashMatch) {
        grade = parseInt(dashMatch[1], 10);
        classNum = parseInt(dashMatch[2], 10);
        studentNum = parseInt(filteredTokens[1], 10) || 0;
        name = filteredTokens[2];
      } else {
        const c = parseInt(filteredTokens[0], 10);
        const n = parseInt(filteredTokens[1], 10);
        if (!isNaN(c) && !isNaN(n)) {
          classNum = c;
          studentNum = n;
          name = filteredTokens[2];
        }
      }
    } else if (filteredTokens.length === 2) {
      // e.g. ["15", "홍길동"] or ["홍길동", "15"]
      const firstNum = parseInt(filteredTokens[0], 10);
      const secondNum = parseInt(filteredTokens[1], 10);

      if (!isNaN(firstNum)) {
        studentNum = firstNum;
        name = filteredTokens[1];
      } else if (!isNaN(secondNum)) {
        studentNum = secondNum;
        name = filteredTokens[0];
      } else {
        // Just two words, e.g. "김철수"
        name = filteredTokens.join(' ');
      }
    } else if (filteredTokens.length === 1) {
      name = filteredTokens[0];
    }

    if (name) {
      results.push({
        grade: grade || defaultGrade,
        classNum: classNum || defaultClass,
        studentNum: studentNum || (results.length + 1),
        name,
        gender
      });
    }
  }

  return results;
}

export function createStudentsFromParsed(rows: ParsedStudentRow[], initialRP = 1000): Student[] {
  return rows.map((row, idx) => ({
    id: `std_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    name: row.name,
    grade: row.grade,
    classNum: row.classNum,
    studentNum: row.studentNum,
    gender: row.gender,
    rp: initialRP,
    initialRP,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    highestStreak: 0,
    opponentHistory: [],
    defeatHistory: [],
    victoryHistory: []
  }));
}
