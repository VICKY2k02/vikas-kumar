export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  company_name: string;
  industry: string;
  company_email: string;
  company_address: string;
  company_phone: string;
  owner_name: string;
  owner_email: string;
  password: string;
  confirm_password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    company_id: number;
  };
} 