import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Todo, CreateTodoRequest, UpdateTodoRequest, ApiResponse, User } from '../types';

// Configure base URL - replace with your actual backend URL
const BASE_URL = 'http://localhost:3000/api'; // Update this with your backend URL

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token if needed
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token here if you have authentication
        // const token = getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.log('Unauthorized access - redirect to login');
        }
        return Promise.reject(error);
      }
    );
  }

  // Todo endpoints
  async getTodos(): Promise<Todo[]> {
    try {
      const response: AxiosResponse<ApiResponse<Todo[]>> = await this.api.get('/todos');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw this.handleError(error);
    }
  }

  async getTodoById(id: string): Promise<Todo> {
    try {
      const response: AxiosResponse<ApiResponse<Todo>> = await this.api.get(`/todos/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw this.handleError(error);
    }
  }

  async createTodo(todo: CreateTodoRequest): Promise<Todo> {
    try {
      const response: AxiosResponse<ApiResponse<Todo>> = await this.api.post('/todos', todo);
      return response.data.data!;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw this.handleError(error);
    }
  }

  async updateTodo(id: string, todo: UpdateTodoRequest): Promise<Todo> {
    try {
      const response: AxiosResponse<ApiResponse<Todo>> = await this.api.put(`/todos/${id}`, todo);
      return response.data.data!;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw this.handleError(error);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      await this.api.delete(`/todos/${id}`);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw this.handleError(error);
    }
  }

  async toggleTodoComplete(id: string, completed: boolean): Promise<Todo> {
    try {
      const response: AxiosResponse<ApiResponse<Todo>> = await this.api.patch(`/todos/${id}/toggle`, {
        completed,
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error toggling todo completion:', error);
      throw this.handleError(error);
    }
  }

  // User profile endpoints
  async getUserProfile(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/profile');
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw this.handleError(error);
    }
  }

  async updateUserProfile(user: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/profile', user);
      return response.data.data!;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw this.handleError(error);
    }
  }

  async uploadProfilePicture(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response: AxiosResponse<ApiResponse<{ imageUrl: string }>> = await this.api.post(
        '/profile/picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!.imageUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Server error';
      return new Error(`${message} (${error.response.status})`);
    } else if (error.request) {
      // Network error
      return new Error('Network error - please check your connection');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const apiService = new ApiService();
export default ApiService;