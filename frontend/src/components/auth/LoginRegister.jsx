/**
 * SISTEMA DE LOGIN/REGISTRO COMPLETO - iLyra Platform
 * IMPLEMENTAÇÃO REAL - SEM PLACEHOLDERS - PRODUÇÃO
 * Integração completa com APIs do backend
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Star, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const LoginRegister = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estados do formulário
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validações em tempo real
  const [validations, setValidations] = useState({
    username: { valid: false, message: '' },
    email: { valid: false, message: '' },
    password: { valid: false, message: '' },
    confirmPassword: { valid: false, message: '' }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateField = (field, value) => {
    let validation = { valid: false, message: '' };

    switch (field) {
      case 'username':
        if (value.length < 3) {
          validation = { valid: false, message: 'Nome deve ter pelo menos 3 caracteres' };
        } else if (value.length > 20) {
          validation = { valid: false, message: 'Nome deve ter no máximo 20 caracteres' };
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          validation = { valid: false, message: 'Apenas letras, números e underscore' };
        } else {
          validation = { valid: true, message: 'Nome válido' };
        }
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) {
          validation = { valid: false, message: 'Email é obrigatório' };
        } else if (!emailRegex.test(value)) {
          validation = { valid: false, message: 'Email inválido' };
        } else {
          validation = { valid: true, message: 'Email válido' };
        }
        break;

      case 'password':
        if (value.length < 6) {
          validation = { valid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
        } else if (value.length > 50) {
          validation = { valid: false, message: 'Senha muito longa' };
        } else if (!/(?=.*[a-z])/.test(value)) {
          validation = { valid: false, message: 'Deve conter pelo menos uma letra minúscula' };
        } else if (!/(?=.*[A-Z])/.test(value)) {
          validation = { valid: false, message: 'Deve conter pelo menos uma letra maiúscula' };
        } else if (!/(?=.*\d)/.test(value)) {
          validation = { valid: false, message: 'Deve conter pelo menos um número' };
        } else {
          validation = { valid: true, message: 'Senha forte' };
        }
        break;

      case 'confirmPassword':
        if (!isLogin) {
          if (!value) {
            validation = { valid: false, message: 'Confirmação é obrigatória' };
          } else if (value !== formData.password) {
            validation = { valid: false, message: 'Senhas não coincidem' };
          } else {
            validation = { valid: true, message: 'Senhas coincidem' };
          }
        }
        break;

      default:
        break;
    }

    setValidations(prev => ({ ...prev, [field]: validation }));
  };

  const isFormValid = () => {
    if (isLogin) {
      return validations.email.valid && validations.password.valid;
    } else {
      return validations.username.valid && 
             validations.email.valid && 
             validations.password.valid && 
             validations.confirmPassword.valid;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setMessage({ type: 'error', text: 'Por favor, corrija os erros no formulário' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Login
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
          // Redirecionamento será feito pelo contexto de autenticação
        } else {
          setMessage({ type: 'error', text: result.error || 'Erro ao fazer login' });
        }
      } else {
        // Registro
        const result = await register(formData.username, formData.email, formData.password);
        if (result.success) {
          setMessage({ type: 'success', text: 'Conta criada com sucesso! Faça login para continuar.' });
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        } else {
          setMessage({ type: 'error', text: result.error || 'Erro ao criar conta' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setValidations({
      username: { valid: false, message: '' },
      email: { valid: false, message: '' },
      password: { valid: false, message: '' },
      confirmPassword: { valid: false, message: '' }
    });
    setMessage({ type: '', text: '' });
  };

  const getInputIcon = (field, validation) => {
    if (!formData[field]) return null;
    return validation.valid ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-4">
            <Star className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Entre na sua jornada espiritual' : 'Inicie sua jornada espiritual'}
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mensagem de feedback */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? 
                <CheckCircle className="h-5 w-5" /> : 
                <AlertCircle className="h-5 w-5" />
              }
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Username (apenas no registro) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      formData.username ? 
                        (validations.username.valid ? 'border-green-300' : 'border-red-300') : 
                        'border-gray-300'
                    }`}
                    placeholder="Seu nome de usuário"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {getInputIcon('username', validations.username)}
                  </div>
                </div>
                {formData.username && (
                  <p className={`mt-1 text-xs ${validations.username.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {validations.username.message}
                  </p>
                )}
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    formData.email ? 
                      (validations.email.valid ? 'border-green-300' : 'border-red-300') : 
                      'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {getInputIcon('email', validations.email)}
                </div>
              </div>
              {formData.email && (
                <p className={`mt-1 text-xs ${validations.email.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validations.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`block w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    formData.password ? 
                      (validations.password.valid ? 'border-green-300' : 'border-red-300') : 
                      'border-gray-300'
                  }`}
                  placeholder="Sua senha"
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                  {getInputIcon('password', validations.password)}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {formData.password && (
                <p className={`mt-1 text-xs ${validations.password.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validations.password.message}
                </p>
              )}
            </div>

            {/* Campo Confirmar Senha (apenas no registro) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`block w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      formData.confirmPassword ? 
                        (validations.confirmPassword.valid ? 'border-green-300' : 'border-red-300') : 
                        'border-gray-300'
                    }`}
                    placeholder="Confirme sua senha"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                    {getInputIcon('confirmPassword', validations.confirmPassword)}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {formData.confirmPassword && (
                  <p className={`mt-1 text-xs ${validations.confirmPassword.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {validations.confirmPassword.message}
                  </p>
                )}
              </div>
            )}

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading || !isFormValid()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle entre Login/Registro */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
