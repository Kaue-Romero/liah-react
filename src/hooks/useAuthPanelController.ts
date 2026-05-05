import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/auth/useAuth';
import { useConfig } from '../contexts/config/useConfig';
import { useToast } from '../contexts/toast/useToast';
import { useUi } from '../contexts/ui/useUi';
import { formatCep, onlyDigits } from '../utils/format';
import { writeAuth } from '../utils/storage';
import { validateCpf, validateEmail, validateName } from '../utils/validators';

export type AuthMode = 'login' | 'register' | 'forgot';

export interface LoginFormState {
  telefone: string;
  senha: string;
}

export interface RegisterFormState {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  senha: string;
}

export interface ForgotFormState {
  telefone: string;
  metodo: string;
  codigo: string;
  senha: string;
  sent: boolean;
}

export function useAuthPanelController() {
  const { closeModal } = useUi();
  const { config } = useConfig();
  const { handleAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState<LoginFormState>({ telefone: '', senha: '' });
  const [register, setRegister] = useState<RegisterFormState>({ nome: '', email: '', telefone: '', cpf: '', senha: '' });
  const [forgot, setForgot] = useState<ForgotFormState>({ telefone: '', metodo: 'whatsapp', codigo: '', senha: '', sent: false });

  async function submitLogin() {
    setLoading(true);
    try {
      const response = await api.login(config, onlyDigits(login.telefone), login.senha);
      if (response === 'erro' || !response[0] || !response[1]) {
        pushToast('Telefone ou senha incorretos.', 'error');
        return;
      }
      writeAuth(String(response[0]), String(response[1]));
      handleAuthenticated({ id: String(response[0]), token: String(response[1]) });
      pushToast('Login realizado.', 'success');
      closeModal();
    } catch {
      pushToast('Erro ao entrar. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister() {
    if (!validateName(register.nome)) {
      pushToast('Informe nome completo.', 'error');
      return;
    }
    if (!validateEmail(register.email)) {
      pushToast('Informe email válido.', 'error');
      return;
    }
    if (!validateCpf(register.cpf)) {
      pushToast('Informe CPF válido.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(config, {
        ...register,
        telefone: onlyDigits(register.telefone),
        cpf: onlyDigits(register.cpf)
      });
      if (Array.isArray(response)) {
        writeAuth(String(response[0]), String(response[1]));
        handleAuthenticated({ id: String(response[0]), token: String(response[1]) });
        pushToast('Conta criada.', 'success');
        closeModal();
        return;
      }
      pushToast(response === 'telefone_repetido' ? 'Telefone já cadastrado.' : 'Erro ao criar conta.', 'error');
    } catch {
      pushToast('Erro ao criar conta.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function submitForgot() {
    setLoading(true);
    try {
      if (!forgot.sent) {
        await api.forgotPassword(config, onlyDigits(forgot.telefone), forgot.metodo);
        setForgot((current) => ({ ...current, sent: true }));
        pushToast('Código enviado.', 'success');
        return;
      }

      const response = await api.resetPassword(config, onlyDigits(forgot.telefone), forgot.codigo, forgot.senha);
      if (response.trim() === 'erro') {
        pushToast('Código inválido.', 'error');
      } else {
        pushToast('Senha atualizada.', 'success');
        setMode('login');
      }
    } catch {
      pushToast('Erro ao recuperar senha.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return {
    closeModal,
    forgot,
    formatForgotCode: (value: string) => formatCep(value).replace('-', ''),
    loading,
    login,
    mode,
    register,
    setForgot,
    setLogin,
    setMode,
    setRegister,
    submitForgot,
    submitLogin,
    submitRegister
  };
}
