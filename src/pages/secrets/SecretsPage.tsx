import { Box, Button, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import PageHeader from "../../components/common/PageHeader";
import { ErrorState, ForbiddenState, LoadingState } from "../../components/common/states";
import {
  AddProviderDialog,
  AddSecretDialog,
  ProviderCard,
  ProviderPanel,
} from "./SecretsComponents";
import { useSecrets } from "./useSecrets";

export default function SecretsPage() {
  const {
    providers, loading, error, forbidden,
    selectedProvider, setSelectedProvider,
    secretKeys, secretKeysLoading,
    selectedProviderSecrets, selectedProviderSecretsLoading,
    setupExpanded, setSetupExpanded,
    arnCopied,
    providerOpen, setProviderOpen, providerSaving, selectedPreset, providerForm, setProviderForm,
    secretOpen, secretSaving, activeProvider, secretKey, setSecretKey,
    loadProviders,
    handleSelectProvider, handlePresetChange, handleProviderSave, handleCopyArn,
    handleOpenAddSecret, handleSecretSave, handleCloseSecretDialog, handleDeleteSecret, handleMapSecret,
  } = useSecrets();

  return (
    <Box>
      <PageHeader
        title="Secret Management"
        subtitle="Simple provider setup, secret mapping, and setup guidance in one place."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setProviderOpen(true)} sx={{ fontWeight: 700, borderRadius: "8px", px: 2.25 }}>
            Add Provider
          </Button>
        }
      />

      {forbidden ? (
        <ForbiddenState message={error || "You do not have access to secrets"} />
      ) : error && !providers.length ? (
        <ErrorState message={error} onRetry={loadProviders} />
      ) : loading ? (
        <LoadingState text="Loading secret providers..." />
      ) : providers.length === 0 ? (
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, borderRadius: "14px", borderStyle: "dashed", textAlign: "center" }}>
          <LockIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>No secret providers configured</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560, mx: "auto" }}>
            Add a provider to begin mapping secrets. The page will stay consistent with the rest of the app and keep the workflow simple.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setProviderOpen(true)} sx={{ mt: 3, borderRadius: "8px", fontWeight: 700, px: 3 }}>
            Connect Provider
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 360px" }, alignItems: "start" }}>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id ?? provider.label ?? provider.type}
                provider={provider}
                selected={selectedProvider?.id === provider.id}
                onSelect={(p) => handleSelectProvider(p, false)}
                onSetup={(p) => handleSelectProvider(p, true)}
              />
            ))}
          </Box>

          {selectedProvider && (
            <ProviderPanel
              provider={selectedProvider}
              secrets={selectedProviderSecrets}
              secretsLoading={selectedProviderSecretsLoading}
              setupExpanded={setupExpanded}
              arnCopied={arnCopied}
              onToggleSetup={() => setSetupExpanded((v) => !v)}
              onCopyArn={handleCopyArn}
              onAddSecret={handleOpenAddSecret}
              onDeleteSecret={handleDeleteSecret}
              onClose={() => setSelectedProvider(null)}
              handleMapSecret={handleMapSecret}
            />
          )}
        </Box>
      )}

      <AddProviderDialog
        open={providerOpen}
        saving={providerSaving}
        selectedPreset={selectedPreset}
        form={providerForm}
        onClose={() => setProviderOpen(false)}
        onPresetChange={handlePresetChange}
        onFormChange={setProviderForm}
        onSave={handleProviderSave}
      />

      <AddSecretDialog
        open={secretOpen}
        saving={secretSaving}
        activeProvider={activeProvider}
        secretKey={secretKey}
        onKeyChange={setSecretKey}
        onClose={handleCloseSecretDialog}
        onSave={handleSecretSave}
        secretKeys={secretKeys ? secretKeys : null}
        secretKeysLoading={secretKeysLoading}
      />
    </Box>
  );
}