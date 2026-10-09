using System.Collections.Concurrent;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers
{
    public sealed class ENValidatorHelper
    {
        private static readonly ENValidatorHelper _current = new ENValidatorHelper();

        public static ENValidatorHelper Current => _current;

        private readonly ConcurrentDictionary<string, string> _dotEnvValues;

        private ENValidatorHelper()
        {
            _dotEnvValues = new ConcurrentDictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            LoadDotEnvFile();
        }

        public string GetEnvKeyValue(string key)
        {
            if (_dotEnvValues.TryGetValue(key, out string? dotEnvValue))
            {
                return dotEnvValue;
            }

            string? processValue = Environment.GetEnvironmentVariable(key);

            if (!string.IsNullOrWhiteSpace(processValue))
            {
                return processValue;
            }

            throw new ENKeyNotFoundException(key);
        }

        // For config that's genuinely optional (e.g. an extra allowed CORS
        // origin only present in deployed environments) - GetEnvKeyValue's
        // own throw-if-missing is wrong for these, since local dev legitimately
        // never sets them.
        public bool TryGetEnvKeyValue(string key, out string? value)
        {
            if (_dotEnvValues.TryGetValue(key, out string? dotEnvValue))
            {
                value = dotEnvValue;
                return true;
            }

            string? processValue = Environment.GetEnvironmentVariable(key);

            if (!string.IsNullOrWhiteSpace(processValue))
            {
                value = processValue;
                return true;
            }

            value = null;
            return false;
        }

        private void LoadDotEnvFile()
        {
            string? directory = Directory.GetCurrentDirectory();

            while (directory is not null)
            {
                string candidatePath = Path.Combine(directory, ".env");

                if (File.Exists(candidatePath))
                {
                    ParseDotEnvFile(candidatePath);
                    return;
                }

                directory = Directory.GetParent(directory)?.FullName;
            }
        }

        private void ParseDotEnvFile(string filePath)
        {
            foreach (string rawLine in File.ReadAllLines(filePath))
            {
                string line = rawLine.Trim();

                if (line.Length == 0 || line.StartsWith('#'))
                {
                    continue;
                }

                int separatorIndex = line.IndexOf('=');

                if (separatorIndex <= 0)
                {
                    continue;
                }

                string key = line[..separatorIndex].Trim();
                string value = line[(separatorIndex + 1)..].Trim();

                if (value.Length >= 2 && value[0] == '"' && value[^1] == '"')
                {
                    value = value[1..^1];
                }

                _dotEnvValues[key] = value;
            }
        }
    }
}
