import { useCallback, useEffect, useRef, useState } from "react";
import { secretProviderService } from "../../api/services/secretProviders";
import { secretService } from "../../api/services/secrets";
import { ENVIRONMENT_CHANGE_EVENT } from "../../constants/environment";
import { useApiCall } from "../../hooks/useApiCall";
import type {
  SecretItem,
  SecretProvider,
  SecretKeysResponse,
} from "../../api/schemas";
import {
  AWS_IAM_ROLE_ARN,
  DEFAULT_PROVIDER_FORM,
  PROVIDER_PRESETS,
  type ProviderFormState,
  type ProviderPresetId,
} from "./SecretsComponents";

export function useSecrets() {
  const { call, error, forbidden } = useApiCall();

  const [providers, setProviders] = useState<SecretProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProvider, setSelectedProvider] =
    useState<SecretProvider | null>(null);
  const [selectedProviderSecrets, setSelectedProviderSecrets] = useState<
    SecretItem[]
  >([]);
  const [selectedProviderSecretsLoading, setSelectedProviderSecretsLoading] =
    useState(false);
  const selectedProviderIdRef = useRef<string | null>(null);
  const [secretKeys, setSecretKeys] = useState<SecretKeysResponse | null>(null);
  const [secretKeysLoading, setSecretKeysLoading] = useState(false);

  const [setupExpanded, setSetupExpanded] = useState(false);
  const [arnCopied, setArnCopied] = useState(false);

  const [providerOpen, setProviderOpen] = useState(false);
  const [providerSaving, setProviderSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ProviderPresetId>(
    PROVIDER_PRESETS[0].id,
  );
  const [providerForm, setProviderForm] = useState<ProviderFormState>(
    DEFAULT_PROVIDER_FORM,
  );

  const [secretOpen, setSecretOpen] = useState(false);
  const [secretSaving, setSecretSaving] = useState(false);
  const [activeProvider, setActiveProvider] = useState<SecretProvider | null>(
    null,
  );
  const [secretKey, setSecretKey] = useState("");

  const loadSelectedProviderSecrets = useCallback(
    async (providerId: string) => {
      setSelectedProviderSecretsLoading(true);
      const data = await call(() => secretService.list({ providerId }), {
        showError: true,
      });
      setSelectedProviderSecrets(data?.secrets ?? []);
      setSelectedProviderSecretsLoading(false);
    },
    [call],
  );

  const getSecretKeys = useCallback(
    async (providerId: string) => {
      setSecretKeysLoading(true);
      const data = await call(
        () => secretProviderService.listSecretKeys(providerId),
        { showError: true },
      );

      if (data) {
        data.secrets.sort((a, b) => {
          if (a.referenceId === null && b.referenceId !== null) return -1;
          if (a.referenceId !== null && b.referenceId === null) return 1;

          return a.secret.localeCompare(b.secret);
        });
      }

      setSecretKeys(data ? { secrets: data.secrets } : null);
      setSecretKeysLoading(false);
    },
    [call],
  );

  const loadProviders = useCallback(async () => {
    setLoading(true);
    const data = await call(() => secretProviderService.list(), {
      showError: true,
    });
    const next = data?.secretProviders ?? [];
    setProviders(next);
    setLoading(false);
    if (!selectedProviderIdRef.current && next.length > 0) {
      setSelectedProvider(next[0]);
      if (next[0].id) void loadSelectedProviderSecrets(next[0].id);
    }
  }, [call, loadSelectedProviderSecrets]);

  useEffect(() => {
    selectedProviderIdRef.current = selectedProvider?.id ?? null;
  }, [selectedProvider]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadProviders(), 0);
    return () => window.clearTimeout(id);
  }, [loadProviders]);

  useEffect(() => {
    const handle = () => {
      void loadProviders();
      if (selectedProviderIdRef.current)
        void loadSelectedProviderSecrets(selectedProviderIdRef.current);
    };
    window.addEventListener(ENVIRONMENT_CHANGE_EVENT, handle);
    return () => window.removeEventListener(ENVIRONMENT_CHANGE_EVENT, handle);
  }, [loadProviders, loadSelectedProviderSecrets]);

  const handleSelectProvider = (
    provider: SecretProvider,
    showSetup = false,
  ) => {
    setSelectedProvider(provider);
    setSelectedProviderSecrets([]);
    setSetupExpanded(showSetup);
    setArnCopied(false);
    if (provider.id) void loadSelectedProviderSecrets(provider.id);
  };

  const handlePresetChange = (presetId: ProviderPresetId) => {
    const preset = PROVIDER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    setProviderForm((f) => ({ ...f, host: preset.host }));
  };

  const handleProviderSave = async () => {
    setProviderSaving(true);
    const success = await call(
      () =>
        secretProviderService.create({
          type: "infisical",
          label: providerForm.label,
          configuration: {
            host: providerForm.host,
            projectId: providerForm.projectId,
            environment: providerForm.environment,
            machineIdentityId: providerForm.machineIdentityId,
          },
        }),
      { successMsg: "Secret provider configured successfully." },
    );
    setProviderSaving(false);
    if (success) {
      setProviderOpen(false);
      setProviderForm(DEFAULT_PROVIDER_FORM);
      setSelectedPreset(PROVIDER_PRESETS[0].id);
      void loadProviders();
    }
  };

  const handleCopyArn = () => {
    navigator.clipboard.writeText(AWS_IAM_ROLE_ARN).then(() => {
      setArnCopied(true);
      window.setTimeout(() => setArnCopied(false), 1800);
    });
  };

  const handleOpenAddSecret = (provider: SecretProvider) => {
    setActiveProvider(provider);
    setSecretKey("");
    setSecretOpen(true);
  };

  const handleSecretSave = async () => {
    if (!activeProvider?.id) return;
    setSecretSaving(true);
    const success = await call(
      () =>
        secretService.create({
          providerId: activeProvider.id!,
          key: secretKey,
        }),
      { successMsg: "Secret mapped successfully." },
    );
    setSecretSaving(false);
    if (success) {
      setSecretOpen(false);
      setActiveProvider(null);
      if (selectedProvider?.id)
        void loadSelectedProviderSecrets(selectedProvider.id);
    }
  };

  const handleCloseSecretDialog = () => {
    setSecretOpen(false);
    setActiveProvider(null);
    setSecretKeys(null);
  };

  const handleDeleteSecret = async (secretId: string | undefined) => {
    if (
      !secretId ||
      !window.confirm(
        "Are you sure you want to delete this secret? This action cannot be undone.",
      )
    )
      return;
    const success = await call(() => secretService.delete(secretId), {
      successMsg: "Secret deleted successfully.",
    });
    if (success && selectedProvider?.id)
      void loadSelectedProviderSecrets(selectedProvider.id);
  };

  const handleMapSecret = () => {
    getSecretKeys(selectedProvider?.id ?? "");
    setSecretOpen(true);
  };

  return {
    providers,
    loading,
    error,
    forbidden,
    selectedProvider,
    setSelectedProvider,
    secretKeys,
    secretKeysLoading,
    selectedProviderSecrets,
    selectedProviderSecretsLoading,
    setupExpanded,
    setSetupExpanded,
    arnCopied,
    providerOpen,
    setProviderOpen,
    providerSaving,
    selectedPreset,
    providerForm,
    setProviderForm,
    secretOpen,
    secretSaving,
    activeProvider,
    secretKey,
    setSecretKey,
    loadProviders,
    handleSelectProvider,
    handlePresetChange,
    handleProviderSave,
    handleCopyArn,
    handleOpenAddSecret,
    handleSecretSave,
    handleCloseSecretDialog,
    handleDeleteSecret,
    handleMapSecret,
  };
}
