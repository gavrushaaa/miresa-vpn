export type FeatureStatus = 'available' | 'not_configured' | 'error';

export interface AccountProfileDTO {
  displayName: string;
  email: string;
  clientId: string;
  registeredAt: string | null;
}

export interface SubscriptionDTO {
  status: 'active' | 'expiring' | 'inactive' | 'not_configured';
  planName: string;
  expiresAt: string | null;
  message: string;
}

export interface VPNAccessDTO {
  status: 'available' | 'revoked' | 'not_configured' | 'error';
  vlessLink: string;
  updatedAt: string | null;
  message: string;
}

export interface DeviceDTO {
  id: string;
  name: string;
  platform: string;
  lastActiveAt: string | null;
  status?: string;
}

export interface PaymentDTO {
  id: string;
  date: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
}

export interface AccountFeatureStateDTO {
  status: FeatureStatus;
  message: string;
}

export interface AccountDTO {
  profile: AccountProfileDTO;
  subscription: SubscriptionDTO;
  vpn: VPNAccessDTO;
  devices: DeviceDTO[];
  devicesState: AccountFeatureStateDTO;
  payments: PaymentDTO[];
  paymentsState: AccountFeatureStateDTO;
  capabilities: {
    changePassword: boolean;
    vpnAccess: boolean;
    devices: boolean;
    payments: boolean;
  };
}

export interface PlanDTO {
  id: string;
  name: string;
  caption: string;
  monthlyPrice: number;
  featured: boolean;
  features: string[];
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload
      ? String((payload as { error: unknown }).error)
      : 'Сервис временно недоступен. Попробуйте ещё раз.';
    throw new ApiError(response.status, message);
  }
  return payload as T;
}

export const accountApi = {
  getPlans(signal?: AbortSignal) {
    return request<{ plans: PlanDTO[] }>('/plans', { signal });
  },
  getAccount(signal?: AbortSignal) {
    return request<AccountDTO>('/account', { signal });
  },
  login(input: { email: string; password: string }) {
    return request<{ ok: boolean }>('/auth/login', { method: 'POST', body: input });
  },
  register(input: { name: string; email: string; password: string }) {
    return request<{ ok: boolean }>('/auth/register', { method: 'POST', body: input });
  },
  logout() {
    return request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  },
  updateProfile(input: { displayName: string }) {
    return request<{ ok: boolean }>('/account/profile', { method: 'PATCH', body: input });
  },
  changePassword(input: { currentPassword: string; newPassword: string }) {
    return request<{ ok: boolean }>('/account/password', { method: 'POST', body: input });
  },
};
