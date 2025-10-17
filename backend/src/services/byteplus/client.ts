/**
 * BytePlus API Base Client
 */

import axios, { AxiosInstance } from 'axios';
import { BytePlusConfig, BytePlusError } from './types';

export class BytePlusClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: BytePlusConfig) {
    this.apiKey = config.apiKey;

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://ark.ap-southeast.bytepluses.com/api/v3',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds
    });

    // Request interceptor to add API key
    this.client.interceptors.request.use((config) => {
      config.headers['Authorization'] = `Bearer ${this.apiKey}`;
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new BytePlusError(
            error.response.data?.error?.message || 'BytePlus API Error',
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          throw new BytePlusError('Network error: No response from BytePlus API');
        } else {
          throw new BytePlusError(`Request error: ${error.message}`);
        }
      }
    );
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  protected async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }
}
