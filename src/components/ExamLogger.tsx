"use client";

import { useEffect } from "react";
import { exam } from "@/src/api/exam";

export default function ExamLogger() {
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await exam.allExam();
        console.log("allExam response:", data);
      } catch (error) {
        console.error("allExam error:", error);
      }
    };

    fetchExams();
  }, []);

  return null; // Tidak merender apapun ke UI
}
