import { useAuthPanelController } from '../../hooks/useAuthPanelController';
import { ModalShell } from '../../components/layout/ModalShell';

type AuthController = ReturnType<typeof useAuthPanelController>;

export function AuthPage() {
  const controller = useAuthPanelController();
  const { closeModal, mode } = controller;

  return (
    <ModalShell title={mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Recuperar senha'} onClose={closeModal}>
      <AuthTabs controller={controller} />
      {mode === 'login' ? <LoginForm controller={controller} /> : null}
      {mode === 'register' ? <RegisterForm controller={controller} /> : null}
      {mode === 'forgot' ? <ForgotForm controller={controller} /> : null}
    </ModalShell>
  );
}

function AuthTabs({ controller }: { controller: AuthController }) {
  const { mode, setMode } = controller;

  return (
    <div className="liah-react-tabs">
      <button className={mode === 'login' ? 'is-active' : ''} type="button" onClick={() => setMode('login')}>
        Entrar
      </button>
      <button className={mode === 'register' ? 'is-active' : ''} type="button" onClick={() => setMode('register')}>
        Criar conta
      </button>
    </div>
  );
}

function LoginForm({ controller }: { controller: AuthController }) {
  const { loading, login, setLogin, setMode, submitLogin } = controller;

  return (
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
  );
}

function RegisterForm({ controller }: { controller: AuthController }) {
  const { loading, register, setRegister, submitRegister } = controller;

  return (
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
  );
}

function ForgotForm({ controller }: { controller: AuthController }) {
  const { forgot, loading, setForgot, submitForgot } = controller;

  return (
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
      {forgot.sent ? <ForgotResetFields controller={controller} /> : null}
      <button className="primary-btn" disabled={loading} type="submit">
        {forgot.sent ? 'Atualizar senha' : 'Enviar código'}
      </button>
    </form>
  );
}

function ForgotResetFields({ controller }: { controller: AuthController }) {
  const { forgot, formatForgotCode, setForgot } = controller;

  return (
    <>
      <label>
        Código
        <input
          name="forgot-code"
          autoComplete="one-time-code"
          inputMode="numeric"
          spellCheck={false}
          value={forgot.codigo}
          onChange={(event) => setForgot((current) => ({ ...current, codigo: formatForgotCode(event.target.value) }))}
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
  );
}
