// src/types/api.ts (Optional: create a types file for reusability)

export interface ErrorResponse {
    error: string;
  }
  
  export interface ForgotPasswordSuccessResponse {
    message: string; // Expected from your backend's forgotPassword endpoint
  }
  
  export interface ResetPasswordSuccessResponse {
    message: string; // Expected from your backend's resetPassword endpoint
  }
  
  // For useParams in ResetPasswordPage
  export interface ResetPasswordParams {
    userId: string; // useParams extracts strings
    token: string;  // useParams extracts strings
  }