export interface User {
  _id: string;
  name: string;
  email: string;
  photo: string;
  bio?: string;
  skills: string[];
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}