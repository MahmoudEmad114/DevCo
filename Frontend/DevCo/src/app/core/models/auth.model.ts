import { User } from './user.model';

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}