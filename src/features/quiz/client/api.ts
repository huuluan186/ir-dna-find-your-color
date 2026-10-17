import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";
import type { QuizQuestion } from "../types";

export const fetchQuiz = () => http.get<QuizQuestion[]>(API_ENDPOINTS.QUIZ.GET);
