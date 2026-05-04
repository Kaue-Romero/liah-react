import type {
  BannerItem,
  Campaign,
  CheckoutProduct,
  CheckoutResponse,
  FaqItem,
  LiahConfig,
  NotificationItem,
  Order,
  ProductsResponse,
  UserInfoResponse
} from '../types';
import { apiBaseUrl } from '../utils/env';

type FormValue = string | number | boolean | null | undefined;
type FormDataLike = Record<string, FormValue>;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function endpointUrl(endpoint: string): string {
  return `${apiBaseUrl()}${endpoint}`;
}

function toFormBody(data: FormDataLike): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  return params;
}

export function parseMaybeJson<T>(text: string, fallback: T): T {
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

async function readResponse(response: Response): Promise<string> {
  const text = await response.text();
  if (!response.ok) {
    throw new ApiError(response.statusText || 'Erro na API', response.status, parseMaybeJson(text, text));
  }
  return text;
}

async function postFormText(endpoint: string, data: FormDataLike): Promise<string> {
  const response = await fetch(endpointUrl(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: toFormBody(data)
  });
  return readResponse(response);
}

async function postFormJson<T>(endpoint: string, data: FormDataLike, fallback: T): Promise<T> {
  const text = await postFormText(endpoint, data);
  return parseMaybeJson<T>(text, fallback);
}

async function postJson<T>(endpoint: string, data: Record<string, unknown>, fallback: T): Promise<T> {
  const response = await fetch(endpointUrl(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  });
  const text = await readResponse(response);
  return parseMaybeJson<T>(text, fallback);
}

export interface InitParams {
  config: Required<Pick<LiahConfig, 'p' | 'n'>> & LiahConfig;
  estado: string;
  authId?: string | null;
}

export const api = {
  postFormText,
  postFormJson,
  postJson,

  async loadProducts(params: InitParams): Promise<ProductsResponse> {
    return postFormJson<ProductsResponse>(
      'carregarProdutos_v4.php',
      {
        p: params.config.p,
        n: params.config.n,
        recomendacoes: JSON.stringify(params.config.recomendacoes || []),
        estado: params.estado,
        origem: params.config.origem || 'app',
        empresa: params.config.empresa || 1,
        id: params.authId || ''
      },
      { produtos: {}, indicados: [] }
    );
  },

  async loadCategories(state = 'SP'): Promise<import('../types').Category[]> {
    return postFormJson('carregarCategorias.php', { praca: state }, []);
  },

  async loadProductDescription(productId: number): Promise<{ id?: number; descricao?: unknown; error?: string }> {
    return postFormJson('carregarDetalhesProduto.php', { id: productId }, {});
  },

  async loadCampaigns(config: LiahConfig, authId?: string | null): Promise<{ success?: boolean; campanhas: Campaign[] }> {
    return postFormJson(
      'checkStatusCliente.php',
      {
        p: config.p,
        n: config.n,
        empresa: config.empresa || 1,
        id: authId || ''
      },
      { campanhas: [] }
    );
  },

  async loadCarousel(config: LiahConfig): Promise<{ data?: BannerItem[] }> {
    return postFormJson(
      'get_carrossel_liah.php',
      {
        id_nutricionista: config.n,
        empresa: config.empresa || 1
      },
      { data: [] }
    );
  },

  async loadBanner(config: LiahConfig): Promise<BannerItem> {
    return postFormJson(
      'get_banner_liah.php',
      {
        id_nutricionista: config.n,
        empresa: config.empresa || 1
      },
      {}
    );
  },

  async logBannerView(data: FormDataLike): Promise<void> {
    await postFormText('log_banner_view.php', data);
  },

  async loadNotifications(authId?: string | null, token?: string | null): Promise<NotificationItem[]> {
    if (!authId || !token) return [];
    const response = await postFormJson<{ notificacoes?: NotificationItem[] | Record<string, NotificationItem[]> }>(
      'carregarNotificacoes.php',
      { id: authId, token },
      {}
    );
    const raw = response.notificacoes || [];
    return Array.isArray(raw) ? raw : Object.values(raw).flat();
  },

  async markNotificationsRead(authId?: string | null, token?: string | null): Promise<void> {
    if (!authId || !token) return;
    await postFormText('verNotificacoes.php', { id: authId, token });
  },

  async login(config: LiahConfig, telefone: string, senha: string): Promise<[string, string] | 'erro'> {
    const text = await postFormText('login.php', {
      n: config.n,
      p: config.p,
      telefone,
      senha,
      origem: config.origem || 'app',
      empresa: config.empresa || 1
    });
    if (text.trim() === 'erro') return 'erro';
    return parseMaybeJson<[string, string]>(text, ['','']);
  },

  async forgotPassword(config: LiahConfig, telefone: string, metodo: string): Promise<string> {
    return postFormText('esqueceuSenha.php', {
      n: config.n,
      p: config.p,
      telefone,
      metodo
    });
  },

  async resetPassword(config: LiahConfig, telefone: string, codigo: string, senha: string): Promise<string> {
    return postFormText('novaSenha.php', {
      n: config.n,
      p: config.p,
      telefone,
      codigo,
      senha
    });
  },

  async register(
    config: LiahConfig,
    payload: { cpf: string; nome: string; telefone: string; email: string; senha: string }
  ): Promise<[string, string] | string> {
    const text = await postFormText('cadastrar.php', {
      n: config.n,
      p: config.p,
      cpf: payload.cpf,
      nome: payload.nome,
      telefone: payload.telefone,
      email: payload.email,
      senha: payload.senha,
      origem: config.origem || 'app',
      empresa: config.empresa || 1
    });
    return parseMaybeJson<[string, string] | string>(text, text.trim());
  },

  async checkUser(config: LiahConfig, telefone: string): Promise<string | Record<string, string>> {
    const text = await postFormText('checkUsuario.php', {
      n: config.n,
      p: config.p,
      telefone,
      origem: config.origem || 'app',
      empresa: config.empresa || 1
    });
    return parseMaybeJson<Record<string, string> | string>(text, text.trim());
  },

  async loadUserInfo(
    config: LiahConfig,
    authId: string,
    token: string,
    cartValue: number
  ): Promise<UserInfoResponse | null> {
    const text = await postFormText('infoUsuario.php', {
      id: authId,
      token,
      p: config.p,
      n: config.n,
      empresa: config.empresa || 1,
      valor_carrinho: cartValue,
      usuario_assinante: Boolean(config.assinante)
    });
    return parseMaybeJson<UserInfoResponse | null>(text, null);
  },

  async loadAccount(authId: string, token: string): Promise<Record<string, unknown> | null> {
    return postFormJson('carregarDadosUsuario.php', { id: authId, token }, null);
  },

  async updateAccount(
    config: LiahConfig,
    authId: string,
    token: string,
    data: { nome: string; email: string; cpf: string; telefone: string }
  ): Promise<string> {
    return postFormText('atualizarDadosUsuario.php', {
      n: config.n,
      p: config.p,
      id: authId,
      token,
      nome: data.nome,
      email: data.email,
      cpf: data.cpf,
      telefone: data.telefone,
      origem: config.origem || 'app',
      empresa: config.empresa || 1
    });
  },

  async loadOrders(authId: string, token: string): Promise<Order[] | string> {
    const text = await postFormText('carregarPedidosAndamento.php', { id: authId, token });
    return parseMaybeJson<Order[] | string>(text, text.trim());
  },

  async loadFavorites(authId?: string | null): Promise<string[]> {
    if (!authId) return [];
    const response = await postFormJson<unknown>('listarProdutosFavoritos.php', { id: authId }, []);
    if (Array.isArray(response)) return response.map(String);
    return [];
  },

  async setFavorite(authId: string, token: string, productId: number, favorite: boolean): Promise<string> {
    const endpoint = favorite ? 'adicionarProdutoFavorito.php' : 'deletarProdutoFavorito.php';
    return postFormText(endpoint, {
      id: authId,
      token,
      usuario_id: authId,
      produto_id: productId
    });
  },

  async loadFaq(empresa: string | number = 1): Promise<FaqItem[]> {
    return postFormJson('carregarFaq.php', { empresa }, []);
  },

  async loadCartRecommendations(products: number[]): Promise<number[]> {
    const response = await postFormJson<{ success?: boolean; produtos?: number[] }>(
      'getRecomendacoesCarrinho.php',
      { produtos: JSON.stringify(products) },
      {}
    );
    return response.success ? response.produtos || [] : [];
  },

  async validateCep(zipcode: string): Promise<{ success: boolean; message?: string; data?: Record<string, string> }> {
    return postJson('validarCep.php', { zipcode }, { success: false });
  },

  async saveAddress(
    config: LiahConfig,
    authId: string,
    token: string,
    data: Record<string, string>
  ): Promise<string> {
    return postFormText('salvarEndereco.php', {
      n: config.n,
      p: config.p,
      id: authId,
      token,
      id_endereco: data.id_endereco || '',
      cep: data.cep,
      endereco: data.endereco,
      numero: data.numero,
      complemento: data.complemento || '',
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      tipo: data.tipo || '',
      origem: config.origem || 'app',
      empresa: config.empresa || 1
    });
  },

  async removeAddress(authId: string, token: string, addressId: string): Promise<string> {
    return postFormText('removerEndereco.php', { id: authId, token, id_endereco: addressId });
  },

  async chooseAddress(config: LiahConfig, authId: string, token: string, addressId: string): Promise<string> {
    return postFormText('atualizarEndereco.php', {
      n: config.n,
      p: config.p,
      id: authId,
      token,
      id_endereco: addressId
    });
  },

  async saveCard(
    config: LiahConfig,
    authId: string,
    token: string,
    data: { cartao: string; vencimento: string; cvv: string; nome: string }
  ): Promise<string> {
    return postFormText('salvarCartao.php', {
      n: config.n,
      p: config.p,
      id: authId,
      token,
      cartao: data.cartao,
      vencimento: data.vencimento,
      cvv: data.cvv,
      nome: data.nome,
      origem: config.origem || 'app',
      empresa: config.empresa || 1
    });
  },

  async removeCard(authId: string, token: string, cardId: string): Promise<string> {
    return postFormText('removerCartao.php', { id: authId, token, id_cartao: cardId });
  },

  async chooseCard(config: LiahConfig, authId: string, token: string, cardId: string): Promise<string> {
    return postFormText('atualizarCartao.php', {
      n: config.n,
      p: config.p,
      id: authId,
      token,
      id_cartao: cardId
    });
  },

  async checkCvv(authId: string, token: string, cardId: string, cvv: string): Promise<{ sucesso?: boolean }> {
    return postFormJson('checkCVV.php', { id: authId, token, cartao: cardId, cvv }, {});
  },

  async validateCoupon(
    config: LiahConfig,
    authId: string,
    coupon: string,
    products: CheckoutProduct[],
    subtotal: number
  ): Promise<{ retorno?: string; mensagem?: string; txt?: string; dados?: string }> {
    return postJson(
      'validarCupom.php',
      {
        n: config.n,
        p: config.p,
        id: authId,
        cupom: coupon,
        empresa: config.empresa || 1,
        produtos_id: JSON.stringify(products.map((product) => product.id)),
        marcas: JSON.stringify(products.map((product) => product.codigo_marca)),
        subtotal
      },
      {}
    );
  },

  async loadCouponDetails(campaigns: string[], config: LiahConfig, authId?: string | null): Promise<Record<string, unknown>> {
    return postFormJson(
      'carregarDetalhesCupom.php',
      {
        cupons: JSON.stringify(campaigns),
        n: config.n,
        p: config.p,
        empresa: config.empresa || 1,
        id: authId || ''
      },
      {}
    );
  },

  async checkout(
    config: LiahConfig,
    authId: string,
    token: string,
    data: {
      cartao: string;
      endereco: string;
      tipoFrete: Record<string, unknown>;
      produtos: CheckoutProduct[];
      preco: number;
      parcela: number;
      desconto?: string;
    }
  ): Promise<CheckoutResponse> {
    return postFormJson('checkoutFinal.php', {
      n: config.n,
      p: config.p,
      id: authId,
      token,
      cartao: data.cartao,
      endereco: data.endereco,
      tipoFrete: JSON.stringify(data.tipoFrete),
      produtos: JSON.stringify(data.produtos),
      preco: Math.round(data.preco * 100),
      parcela: data.parcela,
      origem: config.origem || 'app',
      d: data.desconto || '',
      empresa: config.empresa || 1
    }, { status: 'erro' });
  },

  async verifyPix(config: LiahConfig, transactionId: string): Promise<{ status?: string; msg?: string }> {
    return postFormJson('verificarPix.php', { n: config.n, p: config.p, id: transactionId }, {});
  },

  async log(config: LiahConfig, evento: string): Promise<void> {
    await postFormText('log.php', {
      n: config.n,
      p: config.p,
      evento,
      empresa: config.empresa || 1
    });
  },

  async notifyWhatsapp(payload: Record<string, unknown>): Promise<void> {
    await postFormText(
      'notificarWpp.php',
      Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, JSON.stringify(value)]))
    );
  },

  async addRating(config: LiahConfig, authId: string | null, productId: number, rating: number): Promise<unknown> {
    return postFormJson('adicionarAvaliacao.php', {
      p: config.p,
      n: config.n,
      e: config.empresa || 1,
      u: authId || '',
      id_produto: productId,
      nota: rating
    }, {});
  }
};
