using Npgsql;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities
{
    public static class DatabaseConnectionStringUtility
    {
        public static string ConvertNeonUriToNpgsqlConnectionString(string neonDatabaseUrl)
        {
            var uri = new Uri(neonDatabaseUrl);

            string[] userInfoParts = uri.UserInfo.Split(':', 2);
            string username = Uri.UnescapeDataString(userInfoParts[0]);
            string password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : string.Empty;
            string database = uri.AbsolutePath.TrimStart('/');

            Dictionary<string, string> queryParameters = ParseQueryString(uri.Query);

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.Port > 0 ? uri.Port : 5432,
                Database = database,
                Username = username,
                Password = password,
            };

            if (queryParameters.TryGetValue("sslmode", out string? sslMode) &&
                Enum.TryParse(sslMode, true, out SslMode parsedSslMode))
            {
                builder.SslMode = parsedSslMode;
            }

            if (queryParameters.TryGetValue("channel_binding", out string? channelBinding) &&
                Enum.TryParse(channelBinding, true, out ChannelBinding parsedChannelBinding))
            {
                builder.ChannelBinding = parsedChannelBinding;
            }

            return builder.ConnectionString;
        }

        private static Dictionary<string, string> ParseQueryString(string query)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            string trimmedQuery = query.TrimStart('?');

            if (trimmedQuery.Length == 0)
            {
                return result;
            }

            foreach (string pair in trimmedQuery.Split('&', StringSplitOptions.RemoveEmptyEntries))
            {
                string[] keyAndValue = pair.Split('=', 2);
                string key = Uri.UnescapeDataString(keyAndValue[0]);
                string value = keyAndValue.Length > 1 ? Uri.UnescapeDataString(keyAndValue[1]) : string.Empty;
                result[key] = value;
            }

            return result;
        }
    }
}
