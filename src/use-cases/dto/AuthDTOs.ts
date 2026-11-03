/**
 * DTOs del subdominio de Identidad. Desacoplan las capas externas
 * (HTTP) de las entidades ricas de dominio.
 */
export interface RegisterUserInputDTO {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterUserOutputDTO {
  userId: string;
  email: string;
  fullName: string;
}

export interface LoginInputDTO {
  email: string;
  password: string;
}

export interface LoginOutputDTO {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}
