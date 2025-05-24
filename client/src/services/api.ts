import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, CreateRoomRequest, CreateRoomResponse, JoinRoomRequest, JoinRoomResponse } from '@name-name-name/shared';

class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3001') {
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Room endpoints
  async createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
    const response = await this.client.post<ApiResponse<CreateRoomResponse>>('/rooms', request);
    return response.data.data!;
  }

  async joinRoom(roomCode: string, request: JoinRoomRequest): Promise<JoinRoomResponse> {
    const response = await this.client.post<ApiResponse<JoinRoomResponse>>(`/rooms/${roomCode}/join`, request);
    return response.data.data!;
  }

  async getRoom(roomCode: string) {
    const response = await this.client.get<ApiResponse>(`/rooms/${roomCode}`);
    return response.data.data;
  }

  async leaveRoom(roomCode: string) {
    const response = await this.client.delete<ApiResponse>(`/rooms/${roomCode}/leave`);
    return response.data;
  }

  // Game endpoints
  async startGame(roomCode: string) {
    const response = await this.client.post<ApiResponse>(`/games/${roomCode}/start`);
    return response.data;
  }

  async getGameState(roomCode: string) {
    const response = await this.client.get<ApiResponse>(`/games/${roomCode}/state`);
    return response.data.data;
  }

  // Validation endpoints
  async validateAnswer(answer: string, category: string, letter: string) {
    const response = await this.client.post<ApiResponse>('/validation/validate', {
      answer,
      category,
      letter,
    });
    return response.data.data;
  }

  // Utility method for handling API errors
  handleError(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

export const apiService = new ApiService();
export default ApiService;