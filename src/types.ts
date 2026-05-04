export type LiahOrigin = 'app' | 'link' | string;

export interface LiahConfig {
  p: string;
  n: string;
  empresa?: string | number;
  recomendacoes?: unknown[];
  origem?: LiahOrigin;
  carrinho_altura?: number;
  loja?: boolean;
  produto?: string | number;
  assinante?: boolean;
}

export interface Product {
  id: number;
  nome: string;
  codigo_marca?: string | number;
  marca: string;
  sabor?: string;
  peso?: string;
  foto: string;
  infonutri?: string;
  preco: number;
  precoNaoPromocional?: number;
  precoOriginal?: number;
  precoMedio?: number;
  nota?: number | string;
  categoria?: string[];
  variacao?: number[];
  desconto?: number;
  comentario?: string;
  disponivel: boolean | number;
  palavrasChave?: string[];
}

export interface RecommendationProduct {
  id: string | number;
  comentario?: string;
}

export interface RecommendationList {
  'nome-lista': string;
  categoria?: string;
  produtos: RecommendationProduct[];
}

export interface ProductsResponse {
  produtos: Record<string, Product>;
  indicados: RecommendationList[];
  sugeridos?: unknown[];
  origem_sugestao?: string;
  banner?: string;
}

export interface Category {
  id: string | number;
  titulo: string;
  chave: string;
  produtos: number[];
}

export interface AuthState {
  id: string | null;
  token: string | null;
}

export interface Address {
  id: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  numero: string;
  complemento?: string;
  referencia?: string;
  tipo?: string;
}

export interface Card {
  id: string;
  token?: string;
  bandeira?: string;
  numero: string;
  cvv?: string;
}

export interface ShippingOption {
  layout: string;
  valor: number;
  valor_original?: number;
  valor_beneficios?: number;
}

export interface UserInfoResponse {
  carteira_final: Card[];
  enderecos_final: Address[];
  nome: string;
  primeira_compra?: boolean;
  '90d'?: boolean;
  frete: ShippingOption[];
  correios?: string | false;
  avisos?: string;
}

export interface CheckoutProduct {
  id: number;
  quantidade: number;
  preco: number;
  precoFinal: number;
  codigo_marca?: string | number;
}

export interface CheckoutResponse {
  status: 'PIX_GERADO' | 'PAID' | 'CANCELED' | 'PENDING' | 'erro' | string;
  msg?: string;
  qrcode?: string;
  codigo?: string;
  transacao?: string;
  notificacao?: {
    envio?: boolean;
    pedido?: string | number;
    numero_pedido?: string | number;
    status?: string;
    codigo_rastreio?: string | null;
    prazo_entrega?: string | null;
  };
}

export interface NotificationItem {
  id?: string | number;
  tipo?: 'avisos' | 'marketing' | string;
  status?: 'nao_lida' | 'lida' | string;
  titulo?: string;
  subtitulo?: string;
  descricao?: string;
  image?: string;
  createdAt?: string;
  actions?: string;
}

export interface Campaign {
  titulo?: string;
  modo?: 'cupons' | 'beneficios' | string;
  condicao?: CampaignCondition[];
  popup?: string | null;
  barra_progresso?: string | null;
  campanha_valida?: boolean;
}

export interface CampaignCondition {
  codigo?: string;
  log?: string;
  valor_minimo?: number;
  valor?: number;
  tipo?: 'valor' | 'porcentagem' | string;
  valor_frete?: number;
  tipo_frete?: 'valor' | 'porcentagem' | string;
  valorDesconto?: number;
  tipoDesconto?: 'valor' | 'porcentagem' | string;
  valorDescontoFrete?: number;
  tipoDescontoFrete?: 'valor' | 'porcentagem' | string;
  atingido?: boolean;
  aplicavel?: boolean;
  descricao?: string;
  expiracao?: string;
  marca?: boolean;
  categoria?: boolean;
  motivo_indisponivel?: string;
}

export interface CouponData {
  tipo?: 'valor' | 'porcentagem' | string;
  desconto_tipo_frete?: 'valor' | 'porcentagem' | string;
  desconto?: string;
  desconto_frete?: string;
  desconto_sob_frete?: boolean | number | string;
  desconto_sob_compra?: boolean | number | string;
  cupom?: string;
  marca?: string | number;
  produtos_categoria?: number[];
  nome_marca?: string;
}

export interface OrderItem {
  id: number;
  nome: string;
  marca: string;
  sabor?: string;
  peso?: string;
  foto: string;
  nota?: number | string;
  quantidade?: number;
}

export interface Order {
  pedido: string;
  numero_pedido: string | number;
  metodo: string;
  produtos: string;
  endereco: string;
  valor: string | number;
  data: string;
  data_atualizacao?: string;
  dados_pedido?: OrderItem[];
  status: string;
}

export interface FaqItem {
  titulo?: string;
  pergunta?: string;
  resposta?: string;
}

export interface BannerItem {
  id?: string | number;
  image?: string;
  url?: string;
  click?: string;
  banner?: {
    id?: string | number;
    url?: string;
  };
}

export interface ToastMessage {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export type ModalName =
  | 'cart'
  | 'checkout'
  | 'product'
  | 'profile'
  | 'notifications'
  | 'favorites'
  | 'orders'
  | 'faq'
  | 'address'
  | 'card'
  | 'coupon'
  | 'state'
  | 'pix'
  | 'auth'
  | 'fullList'
  | null;

declare global {
  interface Window {
    url_apis?: string;
    campanhaAtivaLiah?: Campaign;
    campanhasLiah?: Campaign[];
  }
}
