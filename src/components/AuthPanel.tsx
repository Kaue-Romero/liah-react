import { useState } from 'react';
import type { LiahConfig } from '../types';
import { api } from '../api/client';
import { formatCep, onlyDigits } from '../utils/format';
import { validateCpf, validateEmail, validateName } from '../utils/validators';
import { writeAuth } from '../utils/storage';
import { ModalShell } from './ModalShell';

interface AuthPanelProps {
  config: LiahConfig;
  onClose: () => void;
  onAuthenticated: (auth: { id: string; token: string }) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function AuthPanel({ config, onClose, onAuthenticated, onToast }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ telefone: '', senha: '' });
  const [register, setRegister] = useState({ nome: '', email: '', telefone: '', cpf: '', senha: '' });
  const [forgot, setForgot] = useState({ telefone: '', metodo: 'whatsapp', codigo: '', senha: '', sent: false });

  async function submitLogin() {
    setLoading(true);
    try {
      const response = await api.login(config, onlyDigits(login.telefone), login.senha);
      if (response === 'erro' || !response[0] || !response[1]) {
        onToast('Telefone ou senha incorretos.', 'error');
        return;
      }
      writeAuth(String(response[0]), String(response[1]));
      const auth = { id: String(response[0]), token: String(response[1]) };
      onAuthenticated(auth);
      onToast('Login realizado.', 'success');
      onClose();
    } catch {
      onToast('Erro ao entrar. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister() {
    if (!validateName(register.nome)) {
      onToast('Informe nome completo.', 'error');
      return;
    }
    if (!validateEmail(register.email)) {
      onToast('Informe email válido.', 'error');
      return;
    }
    if (!validateCpf(register.cpf)) {
      onToast('Informe CPF válido.', 'error');
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
        const auth = { id: String(response[0]), token: String(response[1]) };
        onAuthenticated(auth);
        onToast('Conta criada.', 'success');
        onClose();
        return;
      }
      if (response === 'telefone_repetido') {
        onToast('Telefone já cadastrado.', 'error');
      } else {
        onToast('Erro ao criar conta.', 'error');
      }
    } catch {
      onToast('Erro ao criar conta.', 'error');
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
        onToast('Código enviado.', 'success');
      } else {
        const response = await api.resetPassword(config, onlyDigits(forgot.telefone), forgot.codigo, forgot.senha);
        if (response.trim() === 'erro') {
          onToast('Código inválido.', 'error');
        } else {
          onToast('Senha atualizada.', 'success');
          setMode('login');
        }
      }
    } catch {
      onToast('Erro ao recuperar senha.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title={mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Recuperar senha'} onClose={onClose}>
      <div className="liah-react-tabs">
        <button className={mode === 'login' ? 'is-active' : ''} type="button" onClick={() => setMode('login')}>
          Entrar
        </button>
        <button className={mode === 'register' ? 'is-active' : ''} type="button" onClick={() => setMode('register')}>
          Criar conta
        </button>
      </div>

      {mode === 'login' ? (
        <form
          className="liah-react-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitLogin();
          }}
        >
          <label>
            Telefone
            <input
              value={login.telefone}
              name="login-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              onChange={(event) => setLogin((current) => ({ ...current, telefone: event.target.value }))}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              name="login-password"
              autoComplete="current-password"
              value={login.senha}
              onChange={(event) => setLogin((current) => ({ ...current, senha: event.target.value }))}
            />
          </label>
          <button className="primary-btn" disabled={loading} type="submit">
            Entrar
          </button>
          <button className="liah-link-button" type="button" onClick={() => setMode('forgot')}>
            Esqueci minha senha
          </button>
        </form>
      ) : null}

      {mode === 'register' ? (
        <form
          className="liah-react-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitRegister();
          }}
        >
          <label>
            Nome completo
            <input
              name="register-name"
              autoComplete="name"
              value={register.nome}
              onChange={(event) => setRegister((current) => ({ ...current, nome: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="register-email"
              autoComplete="email"
              spellCheck={false}
              value={register.email}
              onChange={(event) => setRegister((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            Telefone
            <input
              type="tel"
              name="register-phone"
              autoComplete="tel"
              inputMode="tel"
              value={register.telefone}
              onChange={(event) => setRegister((current) => ({ ...current, telefone: event.target.value }))}
            />
          </label>
          <label>
            CPF
            <input
              name="register-cpf"
              autoComplete="off"
              inputMode="numeric"
              value={register.cpf}
              onChange={(event) => setRegister((current) => ({ ...current, cpf: event.target.value }))}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              name="register-password"
              autoComplete="new-password"
              value={register.senha}
              onChange={(event) => setRegister((current) => ({ ...current, senha: event.target.value }))}
            />
          </label>
          <button className="primary-btn" disabled={loading} type="submit">
            Criar conta
          </button>
        </form>
      ) : null}

      {mode === 'forgot' ? (
        <form
          className="liah-react-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitForgot();
          }}
        >
          <label>
            Telefone
            <input
              type="tel"
              name="forgot-phone"
              autoComplete="tel"
              inputMode="tel"
              value={forgot.telefone}
              onChange={(event) => setForgot((current) => ({ ...current, telefone: event.target.value }))}
            />
          </label>
          {forgot.sent ? (
            <>
              <label>
                Código
                <input
                  name="forgot-code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  spellCheck={false}
                  value={forgot.codigo}
                  onChange={(event) => setForgot((current) => ({ ...current, codigo: formatCep(event.target.value).replace('-', '') }))}
                />
              </label>
              <label>
                Nova senha
                <input
                  type="password"
                  name="forgot-password"
                  autoComplete="new-password"
                  value={forgot.senha}
                  onChange={(event) => setForgot((current) => ({ ...current, senha: event.target.value }))}
                />
              </label>
            </>
          ) : null}
          <button className="primary-btn" disabled={loading} type="submit">
            {forgot.sent ? 'Atualizar senha' : 'Enviar código'}
          </button>
        </form>
      ) : null}
    </ModalShell>
  );
}
