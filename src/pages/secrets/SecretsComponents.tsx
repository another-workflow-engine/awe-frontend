import { format } from "date-fns";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import KeyIcon from "@mui/icons-material/Key";
import LockIcon from "@mui/icons-material/Lock";
import type {
  SecretItem,
  SecretKeysResponse,
  SecretProvider,
} from "../../api/schemas";

export const AWS_IAM_ROLE_ARN =
  "arn:aws:iam::125869386640:role/awe-engine-role";

export const PROVIDER_PRESETS = [
  {
    id: "infisical",
    label: "Infisical",
    host: "https://app.infisical.com",
    description: "Open-source secret management platform",
  },
] as const;

export type ProviderPresetId = (typeof PROVIDER_PRESETS)[number]["id"];

export interface ProviderFormState {
  label: string;
  host: string;
  projectId: string;
  environment: string;
  machineIdentityId: string;
}

export const DEFAULT_PROVIDER_FORM: ProviderFormState = {
  label: "",
  host: PROVIDER_PRESETS[0].host,
  projectId: "",
  environment: "",
  machineIdentityId: "",
} as const;

function getProviderConfig(provider: SecretProvider): Record<string, unknown> {
  return provider.configuration && typeof provider.configuration === "object"
    ? (provider.configuration as Record<string, unknown>)
    : {};
}

function getConfigText(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value : "-";
}

function formatSecretDate(value: SecretItem["createdAt"]): string {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : format(date, "MMM d, yyyy");
}

export function ProviderCard({
  provider,
  selected,
  onSelect,
  onSetup,
}: {
  provider: SecretProvider;
  selected: boolean;
  onSelect: (provider: SecretProvider) => void;
  onSetup: (provider: SecretProvider) => void;
}) {
  const config = getProviderConfig(provider);
  const providerName = provider.label ?? provider.type ?? "Secret Provider";

  return (
    <Paper
      role="button"
      tabIndex={0}
      elevation={0}
      onClick={() => onSelect(provider)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(provider);
        }
      }}
      sx={{
        p: 2,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        cursor: "pointer",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LockIcon sx={{ fontSize: 18, color: "primary.main" }} />
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }} noWrap>
              {providerName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {provider.type}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="How to Setup">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onSetup(provider);
            }}
            sx={{ color: "text.secondary", flexShrink: 0 }}
          >
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
        <Box
          display="grid"
          gap={0.5}
          sx={{ gridTemplateColumns: { sm: "1fr 1fr" } }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Host
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
              {getConfigText(config, "host")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Project ID
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
              {getConfigText(config, "projectId")}
            </Typography>
          </Box>
        </Box>
        <Box
          display="grid"
          gap={0.5}
          sx={{ gridTemplateColumns: { sm: "1fr 1fr" } }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Environment
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
              {getConfigText(config, "environment")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Machine Identity
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
              {getConfigText(config, "machineIdentityId")}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="body2" color="text.secondary">
          Click to manage mapped secrets
        </Typography>
      </Box>
    </Paper>
  );
}

function SetupInstructions({
  provider,
  copied,
  onCopy,
}: {
  provider: SecretProvider;
  copied: boolean;
  onCopy: () => void;
}) {
  const providerName = provider.label ?? provider.type ?? "this provider";
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>
            How to Setup
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            AWS IAM role-based access for {providerName}
          </Typography>
        </Box>
        <Tooltip title={copied ? "Copied" : "Copy ARN"}>
          <IconButton onClick={onCopy} size="small">
            <ContentCopyIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Alert severity="info" sx={{ mt: 2, borderRadius: "10px" }}>
        This configuration allows your application running on AWS to securely
        access secrets from the provider using IAM role-based authentication. No
        static credentials are required.
      </Alert>

      <Stack spacing={1.5} sx={{ mt: 2 }}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            1. Navigate to Machine Identities → AWS Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Open the AWS authentication section and use the machine identity
            that will be used by AWE.
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            2. Add this AWS IAM Role ARN
          </Typography>
          <Paper
            variant="outlined"
            sx={{ mt: 0.75, p: 1.25, borderRadius: "10px" }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1.5}
            >
              <Typography
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  overflowWrap: "anywhere",
                }}
              >
                {AWS_IAM_ROLE_ARN}
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                onClick={onCopy}
                sx={{ borderRadius: "8px", fontWeight: 700, flexShrink: 0 }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </Box>
          </Paper>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            3. Assign permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Allow the role to read the project secrets needed by your
            application.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export function ProviderPanel({
  provider,
  secrets,
  secretsLoading,
  setupExpanded,
  arnCopied,
  onToggleSetup,
  onCopyArn,
  onAddSecret,
  onDeleteSecret,
  onClose,
  handleMapSecret,
}: {
  provider: SecretProvider;
  secrets: SecretItem[];
  secretsLoading: boolean;
  setupExpanded: boolean;
  arnCopied: boolean;
  onToggleSetup: () => void;
  onCopyArn: () => void;
  onAddSecret: (provider: SecretProvider) => void;
  onDeleteSecret: (id: string | undefined) => void;
  onClose: () => void;
  handleMapSecret: (providerId: string | undefined) => void;
}) {
  const providerName = provider.label ?? provider.type ?? "Secret Provider";

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "14px",
        position: "sticky",
        top: 24,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              Provider Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {providerName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant={setupExpanded ? "contained" : "outlined"}
            startIcon={<HelpOutlineIcon />}
            onClick={onToggleSetup}
            sx={{ borderRadius: "8px", fontWeight: 700 }}
          >
            Setup
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              onAddSecret(provider);
              handleMapSecret(provider ? provider.id : undefined);
            }}
            sx={{ borderRadius: "8px", fontWeight: 700 }}
          >
            Map Secret
          </Button>
        </Stack>

        <Collapse in={setupExpanded} timeout="auto">
          <SetupInstructions
            provider={provider}
            copied={arnCopied}
            onCopy={onCopyArn}
          />
        </Collapse>

        <Box sx={{ mt: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>
              Configured Secrets
            </Typography>
            <Chip
              label={secretsLoading ? "Loading" : `${secrets.length} total`}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
            />
          </Box>

          {secretsLoading ? (
            <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={22} />
            </Box>
          ) : secrets.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: "10px", textAlign: "center" }}
            >
              <KeyIcon sx={{ fontSize: 34, color: "text.disabled" }} />
              <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 1 }}>
                No secrets configured yet
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => onAddSecret(provider)}
                sx={{ mt: 2, borderRadius: "8px", fontWeight: 700 }}
              >
                Map Secret
              </Button>
            </Paper>
          ) : (
            <Stack spacing={1.15}>
              {secrets.map((secret) => (
                <SecretRow
                  key={
                    secret.id ??
                    `${secret.key}-${secret.environment ?? "default"}`
                  }
                  secret={secret}
                  onDelete={onDeleteSecret}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

function SecretRow({
  secret,
  onDelete,
}: {
  secret: SecretItem;
  onDelete: (id: string | undefined) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: "10px" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
      >
        <Box display="flex" alignItems="flex-start" gap={1.25} minWidth={0}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 18, color: "success.main", mt: 0.25 }}
          />
          <Box minWidth={0}>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5 }} noWrap>
              {secret.key}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              noWrap
            >
              key: {secret.key}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              Created: {formatSecretDate(secret.createdAt)}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
          {secret.environment && (
            <Chip
              label={secret.environment}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            />
          )}
          <Tooltip title="Delete Secret">
            <IconButton size="small" onClick={() => onDelete(secret.id)}>
              <DeleteIcon sx={{ fontSize: 18, color: "error.main" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
}

export function AddProviderDialog({
  open,
  saving,
  selectedPreset,
  form,
  onClose,
  onPresetChange,
  onFormChange,
  onSave,
}: {
  open: boolean;
  saving: boolean;
  selectedPreset: ProviderPresetId;
  form: ProviderFormState;
  onClose: () => void;
  onPresetChange: (id: ProviderPresetId) => void;
  onFormChange: (form: ProviderFormState) => void;
  onSave: () => void;
}) {
  const isValid =
    !!form.label && !!form.host && !!form.projectId && !!form.machineIdentityId;

  return (
    <Dialog
      open={open}
      onClose={() => !saving && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
        Connect Secret Provider
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, mb: 0.75, display: "block" }}
            >
              SELECT PROVIDER TYPE
            </Typography>
            <Stack direction="row" spacing={1.25}>
              {PROVIDER_PRESETS.map((preset) => (
                <Paper
                  key={preset.id}
                  elevation={0}
                  onClick={() => onPresetChange(preset.id)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: "10px",
                    border: "1px solid",
                    cursor: "pointer",
                    flex: 1,
                    borderColor:
                      selectedPreset === preset.id ? "primary.main" : "divider",
                    backgroundColor:
                      selectedPreset === preset.id
                        ? "action.selected"
                        : "background.paper",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    {preset.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {preset.description}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
          <Divider />
          <TextField
            label="Provider Label"
            placeholder="e.g. Production Vault"
            fullWidth
            size="small"
            value={form.label}
            onChange={(e) => onFormChange({ ...form, label: e.target.value })}
          />
          <TextField
            label="Host URL"
            fullWidth
            size="small"
            value={form.host}
            onChange={(e) => onFormChange({ ...form, host: e.target.value })}
          />
          <TextField
            label="Project ID"
            placeholder="Your Infisical project ID"
            fullWidth
            size="small"
            value={form.projectId}
            onChange={(e) =>
              onFormChange({ ...form, projectId: e.target.value })
            }
          />
          <TextField
            label="Environment"
            placeholder="e.g. dev, staging, prod"
            fullWidth
            size="small"
            value={form.environment}
            onChange={(e) =>
              onFormChange({ ...form, environment: e.target.value })
            }
          />
          <TextField
            label="Machine Identity ID"
            placeholder="Your machine identity for authentication"
            fullWidth
            size="small"
            value={form.machineIdentityId}
            onChange={(e) =>
              onFormChange({ ...form, machineIdentityId: e.target.value })
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving || !isValid}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{ fontWeight: 700, borderRadius: "8px", minWidth: 140 }}
        >
          {saving ? "Connecting..." : "Connect Provider"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AddSecretDialog({
  open,
  saving,
  activeProvider,
  secretKey,
  onKeyChange,
  onClose,
  onSave,
  secretKeys,
  secretKeysLoading,
}: {
  open: boolean;
  saving: boolean;
  activeProvider: SecretProvider | null;
  secretKey: string;
  onKeyChange: (key: string) => void;
  onClose: () => void;
  onSave: () => void;
  secretKeys: SecretKeysResponse | null;
  secretKeysLoading: boolean;
}) {
  const handleChange = (event: SelectChangeEvent) => {
    onKeyChange(event.target.value as string);
  };
  return (
    <Dialog
      open={open}
      onClose={() => !saving && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
        Map Secret
        {activeProvider && (
          <Typography variant="caption" color="text.secondary" display="block">
            Adding to provider:{" "}
            <strong>{activeProvider.label ?? activeProvider.type}</strong>
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
  <FormControl fullWidth size="small">
    <InputLabel id="secret-key-label" shrink>
      Secret Key
    </InputLabel>

    <Select
      labelId="secret-key-label"
      value={secretKey ?? ""}
      label="Secret Key"
      onChange={handleChange}
      displayEmpty
      renderValue={(selected) => {
        if (!selected) {
          if (secretKeysLoading) {
            return (
              <Typography color="text.secondary">
                Loading secrets...
              </Typography>
            );
          }

          return (
            <Typography color="text.secondary">
              {secretKeys?.secrets?.length
                ? "Select a secret"
                : "No secrets available"}
            </Typography>
          );
        }

        return selected;
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            maxHeight: 320,
          },
        },
      }}
    >
      {secretKeysLoading ? (
        <MenuItem disabled>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CircularProgress size={16} />

            <Typography variant="body2" color="text.secondary">
              Loading secrets...
            </Typography>
          </Box>
        </MenuItem>
      ) : secretKeys?.secrets?.length ? (
        secretKeys.secrets
          .map((key) => {
            const isMapped = !!key.referenceId;

            return (
              <MenuItem
                key={key.secret}
                value={key.secret}
                disabled={isMapped}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ flex: 1 }}
                  >
                    {key.secret}
                  </Typography>

                  <Chip
                    label={isMapped ? "Mapped" : "Available"}
                    size="small"
                    color={isMapped ? "default" : "success"}
                    variant={isMapped ? "outlined" : "filled"}
                  />
                </Box>
              </MenuItem>
            );
          })
      ) : (
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            No secrets available to map
          </Typography>
        </MenuItem>
      )}
    </Select>
  </FormControl>
</DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving || !secretKey}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{ fontWeight: 700, borderRadius: "8px", minWidth: 120 }}
        >
          {saving ? "Mapping..." : "Map Secret"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
