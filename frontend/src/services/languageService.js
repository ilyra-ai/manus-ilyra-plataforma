// LanguageService que funciona offline para desenvolvimento
// Não faz requisições HTTP reais, retorna dados mock

const mockTranslations = {
  en: {
    'welcome': 'Welcome',
    'login': 'Login',
    'register': 'Register',
    'dashboard': 'Dashboard',
    'profile': 'Profile',
    'logout': 'Logout',
    'email': 'Email',
    'password': 'Password',
    'username': 'Username',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success'
  },
  pt: {
    'welcome': 'Bem-vindo',
    'login': 'Entrar',
    'register': 'Registrar',
    'dashboard': 'Painel',
    'profile': 'Perfil',
    'logout': 'Sair',
    'email': 'Email',
    'password': 'Senha',
    'username': 'Nome de usuário',
    'submit': 'Enviar',
    'cancel': 'Cancelar',
    'loading': 'Carregando...',
    'error': 'Erro',
    'success': 'Sucesso'
  },
  es: {
    'welcome': 'Bienvenido',
    'login': 'Iniciar sesión',
    'register': 'Registrarse',
    'dashboard': 'Panel',
    'profile': 'Perfil',
    'logout': 'Cerrar sesión',
    'email': 'Correo electrónico',
    'password': 'Contraseña',
    'username': 'Nombre de usuario',
    'submit': 'Enviar',
    'cancel': 'Cancelar',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito'
  }
};

const mockLanguages = [
  { id: 1, code: 'en', name: 'English', native_name: 'English' },
  { id: 2, code: 'pt', name: 'Portuguese', native_name: 'Português' },
  { id: 3, code: 'es', name: 'Spanish', native_name: 'Español' }
];

export const getAllLanguages = async () => {
  console.log('Mock getAllLanguages');
  return mockLanguages;
};

export const getLanguageTranslations = async (langCode) => {
  console.log('Mock getLanguageTranslations:', langCode);
  
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return mockTranslations[langCode] || mockTranslations.en;
};

// Admin functions (mock)
export const createLanguage = async (langData) => {
  console.log('Mock createLanguage:', langData);
  return { 
    id: Date.now(), 
    ...langData,
    created_at: new Date().toISOString()
  };
};

export const updateLanguage = async (langId, langData) => {
  console.log('Mock updateLanguage:', langId, langData);
  return { 
    id: langId, 
    ...langData,
    updated_at: new Date().toISOString()
  };
};

export const deleteLanguage = async (langId) => {
  console.log('Mock deleteLanguage:', langId);
  return { message: 'Language deleted successfully' };
};
