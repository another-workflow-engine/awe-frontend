import { apiClient } from "../client";
import {
  SecretKeysResponseSchema,
  SecretProviderSchema,
  SecretProvidersResponseSchema,
  type SecretKeysResponse,
  type SecretProvider,
  type SecretProvidersResponse,
} from "../schemas";

export const secretProviderService = {
  list: async (): Promise<SecretProvidersResponse> => {
    return apiClient.get("/secret-providers", SecretProvidersResponseSchema);
  },

  create: async (data: SecretProvider): Promise<SecretProvider> => {
    return apiClient.post("/secret-providers", data, SecretProviderSchema);
  },

  listSecretKeys: async (providerId: string): Promise<SecretKeysResponse> => {
    const response = await apiClient.get(`/secret-providers/${providerId}/secrets`, SecretKeysResponseSchema);
    return response;
  }
};
  