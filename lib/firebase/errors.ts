import { FirebaseError } from "firebase/app";

const DEFAULT_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Credenciais inválidas. Verifique e tente novamente.",
  "auth/invalid-email": "E-mail inválido. Confira o endereço informado.",
  "auth/user-disabled": "Este usuário foi desativado. Fale com o administrador.",
  "auth/user-not-found": "Conta não encontrada. Confirme o e-mail informado.",
  "auth/wrong-password": "Senha incorreta. Tente novamente.",
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/weak-password": "A senha deve conter pelo menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas consecutivas. Aguarde alguns instantes.",
  "auth/missing-email": "Informe um e-mail corporativo para continuar.",
  "auth/network-request-failed": "Falha de rede. Verifique sua conexão.",
  "firestore/permission-denied": "Você não possui permissão para executar esta ação.",
  "firestore/unavailable": "O serviço está temporariamente indisponível. Tente novamente em instantes.",
  "firestore/cancelled": "A operação foi cancelada. Tente novamente.",
  "firestore/unknown": "Ocorreu um erro desconhecido ao acessar o banco de dados.",
  "firestore/deadline-exceeded": "O tempo de resposta expirou. Tente novamente.",
  "firestore/resource-exhausted": "Limite de operações excedido. Aguarde e tente novamente.",
};

export function getFirebaseErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof FirebaseError) {
    return DEFAULT_MESSAGES[error.code] ?? fallbackMessage;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
}

export function mapFirebaseError(error: unknown, fallbackMessage: string) {
  const message = getFirebaseErrorMessage(error, fallbackMessage);
  return new Error(message);
}
