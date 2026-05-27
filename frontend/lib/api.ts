// API client for Campus-Connect backend
// Matches Express.js + MongoDB backend structure

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"; 

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data: unknown;
  code?: string;
  details?: any;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
    
    // Extract error information from backend response
    if (typeof data === 'object' && data && 'error' in data) {
      const errorData = data as any;
      this.code = errorData.error?.code;
      this.message = errorData.error?.message || message;
      this.details = errorData.error?.details;
    }
  }

  // Helper method to get user-friendly error message
  getUserMessage(): string {
    if (this.details && Array.isArray(this.details)) {
      // Format validation errors
      const messages = this.details.map((d: any) => d.message || d.field).filter(Boolean);
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }
    
    // Return the main error message
    return this.message;
  }
}

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const getAccessToken = () => {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

export const getRefreshToken = () => {
  if (!refreshToken && typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
};

async function request<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string,string>; skipAuth?: boolean } = {}): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  const token = getAccessToken();
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token && !skipAuth) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  } else if (!skipAuth) {
    console.warn('No access token available for request:', path);
  }

  const res = await fetch(`${BASE_URL}/api${path}`.replace(/\/$/, ""), {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body != null ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  let data: any = null;
  
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    // Log error for debugging
    console.error('API Request Failed:', {
      path,
      method,
      status: res.status,
      statusText: res.statusText,
      data,
    });

    // Try to refresh token if unauthorized
    if (res.status === 401 && !skipAuth && path !== '/auth/refresh' && path !== '/auth/login') {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the request with new token
        return request<T>(path, { ...options, headers: { ...headers, Authorization: `Bearer ${newToken}` } });
      }
    }
    throw new ApiError(`Request failed with ${res.status}`, res.status, data);
  }

  // For paginated responses, return the full object with data and meta
  // For other responses, extract data from backend envelope format { data: ... }
  if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
    // This is a paginated response, return as is
    return data as T;
  } else if (data && typeof data === 'object' && 'data' in data) {
    // This is a regular response, extract data
    return data.data as T;
  }

  return data as T;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.data?.accessToken || data.accessToken;
      const newRefreshToken = data.data?.refreshToken || data.refreshToken || refresh;
      setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  clearTokens();
  return null;
}

// Domain-specific endpoints matching backend structure
export const api = {
  // Auth
  login: async (payload: { email: string; password: string }) => {
    const result = await request<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", { method: "POST", body: payload, skipAuth: true });
    setTokens(result.accessToken, result.refreshToken);
    return result;
  },
  signup: async (payload: { name: string; email: string; password: string; role?: User["role"] }) => {
    const result = await request<{ user: User; accessToken: string; refreshToken: string }>("/auth/signup", { method: "POST", body: payload, skipAuth: true });
    setTokens(result.accessToken, result.refreshToken);
    return result;
  },
  me: () => request<User>("/auth/me"),
  logout: async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      await request<void>("/auth/logout", { method: "POST", body: { refreshToken: refresh } });
    }
    clearTokens();
  },
  refresh: async () => {
    const token = await refreshAccessToken();
    return token;
  },

  // Users
  getUser: (id: string) => request<User>(`/users/${id}`),
  updateUser: (id: string, payload: Partial<User>) => request<User>(`/users/${id}`, { method: "PATCH", body: payload }),
  getOrganizerSummary: (id: string) => request<OrganizerSummary>(`/organizers/${id}/summary`),

  // Events
  listEvents: (params?: { search?: string; from?: string; to?: string; status?: string; page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<Event>>("/events" + (query ? `?${query}` : ""));
  },
  getEvent: (id: string) => request<Event>(`/events/${id}`),
  createEvent: (payload: CreateEventPayload) => request<Event>("/events", { method: "POST", body: payload }),
  updateEvent: (id: string, payload: Partial<CreateEventPayload>) => request<Event>(`/events/${id}`, { method: "PATCH", body: payload }),
  deleteEvent: (id: string) => request<Event>(`/events/${id}`, { method: "DELETE" }),
  getOrganizerEvents: (organizerId: string, params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<Event>>(`/organizers/${organizerId}/events` + (query ? `?${query}` : ""));
  },

  // Registrations
  registerForEvent: (eventId: string) => request<Registration>(`/events/${eventId}/register`, { method: "POST" }),
  getRegistration: (registrationId: string) => request<Registration>(`/registrations/${registrationId}`),
  myRegistrations: (params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    // Backend returns { data: [...] } which gets extracted to just the array by request()
    return request<Registration[]>("/users/me/registrations" + (query ? `?${query}` : ""));
  },
  getEventRegistrations: (eventId: string, params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<Registration>>(`/events/${eventId}/registrations` + (query ? `?${query}` : ""));
  },

  // Tickets
  getTicket: (ticketId: string) => request<Ticket>(`/tickets/${ticketId}`),
  getTicketQRCode: (ticketId: string) => request<{ token: string }>(`/tickets/${ticketId}/qrcode`),

  // Check-in
  scanQRCode: (payload: { token: string }) => request<CheckInResult>("/checkin/scan", { method: "POST", body: payload }),
  getCheckInHistory: (params: { eventId: string; page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<CheckInLog>>("/checkin/history" + (query ? `?${query}` : ""));
  },

  // Feedback
  submitFeedback: (eventId: string, payload: { rating: number; comment?: string }) => 
    request<Feedback>(`/events/${eventId}/feedback`, { method: "POST", body: payload }),
  getEventFeedback: (eventId: string, params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<Feedback>>(`/events/${eventId}/feedback` + (query ? `?${query}` : ""));
  },
  getOrganizerFeedback: (organizerId: string, params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<Feedback>>(`/organizers/${organizerId}/feedback` + (query ? `?${query}` : ""));
  },

  // Payments
  createPaymentIntent: (payload: { eventId: string }) => 
    request<{ paymentId: string; clientSecret: string }>("/payments/intent", { method: "POST", body: payload }),
  confirmPayment: (payload: { paymentId: string; success: boolean }) =>
    request<Payment>("/payments/confirm", { method: "POST", body: payload }),
  getPaymentHistory: (params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<Payment>>("/payments/history" + (query ? `?${query}` : ""));
  },
  getOrganizerPayments: (organizerId: string, params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<PaginatedResponse<Payment>>(`/organizers/${organizerId}/payments` + (query ? `?${query}` : ""));
  },

  // Analytics
  getOrganizerAnalytics: (organizerId: string, params?: { from?: string; to?: string }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<OrganizerAnalytics>(`/analytics/organizer/${organizerId}/overview` + (query ? `?${query}` : ""));
  },
  getEventAnalytics: (eventId: string, params?: { from?: string; to?: string }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<EventAnalytics>(`/analytics/events/${eventId}` + (query ? `?${query}` : ""));
  },

  // Volunteers
  createVolunteerProfile: (payload: { bio?: string; skills?: string[]; availability?: string }) =>
    request<Volunteer>(`/volunteers`, { method: "POST", body: payload }),
  getMyVolunteerProfile: () => request<Volunteer>(`/volunteers/me`),
  getVolunteer: (id: string) => request<Volunteer>(`/volunteers/${id}`),
  listVolunteers: (params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<Volunteer[]>(`/volunteers` + (query ? `?${query}` : ""));
  },
  updateVolunteer: (id: string, payload: Partial<Volunteer>) =>
    request<Volunteer>(`/volunteers/${id}`, { method: "PATCH", body: payload }),

  // Sponsors
  createSponsor: (payload: { companyName: string; website?: string; industry?: string; contactEmail?: string; packages?: any[] }) =>
    request<Sponsor>(`/sponsors`, { method: "POST", body: payload }),
  getMySponsorProfile: () => request<Sponsor>(`/sponsors/me`),
  getSponsor: (id: string) => request<Sponsor>(`/sponsors/${id}`),
  listSponsors: (params?: { page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<Sponsor[]>(`/sponsors` + (query ? `?${query}` : ""));
  },
  updateSponsor: (id: string, payload: Partial<Sponsor>) =>
    request<Sponsor>(`/sponsors/${id}`, { method: "PATCH", body: payload }),

  // Volunteer tasks
  listVolunteerTasks: (params?: { eventId?: string; assignedTo?: string; status?: "todo" | "in_progress" | "done" }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<{ data: VolunteerTask[] }>(`/volunteer-tasks` + (query ? `?${query}` : ""));
  },
  createVolunteerTask: (payload: Partial<VolunteerTask> & { title: string }) =>
    request<{ data: VolunteerTask }>(`/volunteer-tasks`, { method: "POST", body: payload }),
  updateVolunteerTask: (id: string, payload: Partial<VolunteerTask>) =>
    request<{ data: VolunteerTask }>(`/volunteer-tasks/${id}`, { method: "PATCH", body: payload }),
  deleteVolunteerTask: (id: string) => request<void>(`/volunteer-tasks/${id}`, { method: "DELETE" }),

  // Volunteer applications
  listVolunteerApplications: (params?: { eventId?: string; volunteerId?: string; status?: VolunteerApplicationStatus; page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<VolunteerApplication[]>(`/volunteer-applications` + (query ? `?${query}` : ""));
  },
  getVolunteerApplication: (id: string) => request<VolunteerApplication>(`/volunteer-applications/${id}`),
  createVolunteerApplication: (payload: CreateVolunteerApplicationPayload) =>
    request<VolunteerApplication>(`/volunteer-applications`, { method: "POST", body: payload }),
  updateVolunteerApplication: (id: string, payload: Partial<VolunteerApplication>) =>
    request<VolunteerApplication>(`/volunteer-applications/${id}`, { method: "PATCH", body: payload }),
  deleteVolunteerApplication: (id: string) => request<void>(`/volunteer-applications/${id}`, { method: "DELETE" }),

  // Volunteer assignments
  listVolunteerAssignments: (params?: { eventId?: string; volunteerId?: string; status?: VolunteerAssignmentStatus; page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<VolunteerAssignment[]>(`/volunteer-assignments` + (query ? `?${query}` : ""));
  },
  getVolunteerAssignment: (id: string) => request<VolunteerAssignment>(`/volunteer-assignments/${id}`),
  createVolunteerAssignment: (payload: CreateVolunteerAssignmentPayload) =>
    request<VolunteerAssignment>(`/volunteer-assignments`, { method: "POST", body: payload }),
  updateVolunteerAssignment: (id: string, payload: Partial<VolunteerAssignment>) =>
    request<VolunteerAssignment>(`/volunteer-assignments/${id}`, { method: "PATCH", body: payload }),
  deleteVolunteerAssignment: (id: string) => request<void>(`/volunteer-assignments/${id}`, { method: "DELETE" }),

  // Sponsor opportunities
  listSponsorOpportunities: (params?: { eventId?: string; organizerId?: string; status?: SponsorOpportunityStatus; page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<SponsorOpportunity[]>(`/sponsor-opportunities` + (query ? `?${query}` : ""));
  },
  getSponsorOpportunity: (id: string) => request<SponsorOpportunity>(`/sponsor-opportunities/${id}`),
  createSponsorOpportunity: (payload: CreateSponsorOpportunityPayload) =>
    request<SponsorOpportunity>(`/sponsor-opportunities`, { method: "POST", body: payload }),
  updateSponsorOpportunity: (id: string, payload: Partial<SponsorOpportunity>) =>
    request<SponsorOpportunity>(`/sponsor-opportunities/${id}`, { method: "PATCH", body: payload }),
  deleteSponsorOpportunity: (id: string) => request<void>(`/sponsor-opportunities/${id}`, { method: "DELETE" }),

  // Sponsorship deals
  listSponsorshipDeals: (params?: { eventId?: string; sponsorId?: string; status?: SponsorshipDealStatus; opportunityId?: string; page?: number; limit?: number }) => {
    const usp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const query = usp.toString();
    return request<SponsorshipDeal[]>(`/sponsorship-deals` + (query ? `?${query}` : ""));
  },
  getSponsorshipDeal: (id: string) => request<SponsorshipDeal>(`/sponsorship-deals/${id}`),
  createSponsorshipDeal: (payload: CreateSponsorshipDealPayload) =>
    request<SponsorshipDeal>(`/sponsorship-deals`, { method: "POST", body: payload }),
  updateSponsorshipDeal: (id: string, payload: Partial<SponsorshipDeal>) =>
    request<SponsorshipDeal>(`/sponsorship-deals/${id}`, { method: "PATCH", body: payload }),
  deleteSponsorshipDeal: (id: string) => request<void>(`/sponsorship-deals/${id}`, { method: "DELETE" }),

  // Certificates
  issueCertificate: (payload: { eventId: string; userId: string; role: string; certificateUrl: string }) =>
    request<any>(`/certificates/issue`, { method: "POST", body: payload }),
  getMyCertificates: () => request<any[]>(`/certificates/me`),
  getEventCertificates: (eventId: string) => request<any[]>(`/certificates/event/${eventId}`),

  // Budget
  addBudgetTransaction: (payload: { eventId: string; amount: number; type: "income" | "expense"; category: string; description: string; date?: string }) =>
    request<any>(`/budget/transaction`, { method: "POST", body: payload }),
  getEventBudget: (eventId: string) => request<any>(`/budget/event/${eventId}`),
  getMyBudget: () => request<any[]>(`/budget/me`),
};

// Shared types matching backend models
export type User = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "organizer" | "admin" | "volunteer" | "sponsor";
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Event = {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  category?: string;
  location: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isPaid: boolean;
  price?: number;
  status: "draft" | "published" | "archived";
  organizerId: string | User;
  venue?: string;
  registeredCount?: number;
  checkedInCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type VolunteerTask = {
  _id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  eventId?: string;
  status: "todo" | "in_progress" | "done";
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

export type VolunteerApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";

export type VolunteerApplication = {
  _id: string;
  volunteerId: string | Volunteer;
  eventId: string | Event;
  status: VolunteerApplicationStatus;
  motivation?: string;
  availability?: string;
  skillsSnapshot?: string[];
  appliedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateVolunteerApplicationPayload = {
  volunteerId: string;
  eventId: string;
  motivation?: string;
  availability?: string;
  skillsSnapshot?: string[];
};

export type VolunteerAssignmentStatus = "assigned" | "confirmed" | "completed" | "cancelled";

export type VolunteerAssignment = {
  _id: string;
  volunteerId: string | Volunteer;
  eventId: string | Event;
  roleTitle?: string;
  status: VolunteerAssignmentStatus;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateVolunteerAssignmentPayload = {
  volunteerId: string;
  eventId: string;
  roleTitle?: string;
  status?: VolunteerAssignmentStatus;
  startTime?: string;
  endTime?: string;
  notes?: string;
};

export type Volunteer = {
  _id: string;
  userId: string | User;
  bio?: string;
  skills?: string[];
  availability?: string;
  assignedEvents?: Array<string | Event>;
  score?: number;
  achievements?: Array<{ title: string; points?: number; awardedAt?: string }>;
  createdAt?: string;
  updatedAt?: string;
};

export type SponsorshipPackage = {
  title: string;
  amount: number;
  description?: string;
};

export type Sponsor = {
  _id: string;
  userId?: string | User;
  companyName: string;
  website?: string;
  industry?: string;
  contactEmail?: string;
  packages?: SponsorshipPackage[];
  interestedCategories?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type SponsorOpportunityStatus = "open" | "closed" | "fulfilled";

export type SponsorOpportunity = {
  _id: string;
  eventId: string | Event;
  organizerId: string | User;
  title: string;
  description?: string;
  packageTitle?: string;
  targetAmount?: number;
  categories?: string[];
  status: SponsorOpportunityStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSponsorOpportunityPayload = {
  eventId: string;
  organizerId: string;
  title: string;
  description?: string;
  packageTitle?: string;
  targetAmount?: number;
  categories?: string[];
  status?: SponsorOpportunityStatus;
};

export type SponsorshipDealStatus = "proposed" | "active" | "completed" | "cancelled";

export type SponsorshipDeal = {
  _id: string;
  sponsorId: string | Sponsor;
  eventId: string | Event;
  opportunityId?: string | SponsorOpportunity;
  packageTitle?: string;
  amount: number;
  status: SponsorshipDealStatus;
  signedAt?: string;
  roi?: {
    impressions?: number;
    clicks?: number;
    leads?: number;
    notes?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSponsorshipDealPayload = {
  sponsorId: string;
  eventId: string;
  opportunityId?: string;
  packageTitle?: string;
  amount: number;
  status?: SponsorshipDealStatus;
  signedAt?: string;
  roi?: {
    impressions?: number;
    clicks?: number;
    leads?: number;
    notes?: string;
  };
};

export type CreateEventPayload = {
  title: string;
  description: string;
  coverImage?: string;
  category?: string;
  location: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isPaid: boolean;
  price?: number;
  status?: "draft" | "published" | "archived";
  venue?: string;
};

export type Registration = {
  _id: string;
  userId: string | User;
  eventId: string | Event;
  status: "pending" | "confirmed" | "cancelled";
  ticketId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Ticket = {
  _id: string;
  userId: string | User;
  eventId: string | Event;
  registrationId: string;
  qrCode: string;
  issuedAt: string;
  checkedInAt?: string;
  checkInMethod?: "qr" | "manual" | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CheckInLog = {
  _id: string;
  ticketId: string | Ticket;
  scannerId?: string | User;
  method: "qr" | "manual";
  timestamp: string;
};

export type CheckInResult = {
  ticketId: string;
  checkedInAt: string;
  user?: User;
  event?: Event;
};

export type Feedback = {
  _id: string;
  userId: string | User;
  eventId: string | Event;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Payment = {
  _id: string;
  userId: string | User;
  eventId: string | Event;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  provider: string;
  providerRef?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedResponse<T> = {
  data?: T[];
  items?: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
};

export type OrganizerSummary = {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
};

export type OrganizerAnalytics = {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  totalRevenue: number;
  checkInRate: number;
  volunteerProfiles?: number;
  volunteersAssigned?: number;
  sponsorCount?: number;
  volunteerApplications?: number;
  volunteerAssignments?: number;
  sponsorOpportunities?: number;
  sponsorshipDeals?: number;
  sponsorshipRevenue?: number;
  registrationsByDay?: Array<{ date: string; count: number }>;
  revenueByEvent?: Array<{ eventId: string; eventTitle: string; revenue: number }>;
};

export type EventAnalytics = {
  eventId: string;
  totalRegistrations: number;
  totalAttendees: number;
  revenue: number;
  checkInRate: number;
  volunteerApplications?: number;
  volunteerAssignments?: number;
  sponsorOpportunities?: number;
  sponsorshipDeals?: number;
  sponsorshipRevenue?: number;
  registrationsByDay?: Array<{ date: string; count: number }>;
  checkInsByDay?: Array<{ date: string; count: number }>;
};
