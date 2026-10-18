import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";
import type { SubmitQuizInput } from "../schema";
import type { QuizQuestion, QuizResultData } from "../types";

export const fetchQuiz = () => http.get<QuizQuestion[]>(API_ENDPOINTS.QUIZ.GET);

export const submitQuizAnswers = (input: SubmitQuizInput) =>
	http.post<QuizResultData>(API_ENDPOINTS.QUIZ.SUBMIT, input);

export const fetchLatestResult = () => http.get<QuizResultData>(API_ENDPOINTS.QUIZ.SUBMIT);
