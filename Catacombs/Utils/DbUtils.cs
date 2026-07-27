using System;
using System.Data;
using System.Data.Common;

namespace Catacombs.Utils
{
    /// <summary>
    /// Helpers for interacting with ADO.NET database commands and readers.
    /// </summary>
    public static class DbUtils
    {
        public static string GetString(DbDataReader reader, string column)
        {
            var ordinal = reader.GetOrdinal(column);
            return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
        }

        public static int GetInt(DbDataReader reader, string column)
        {
            return reader.GetInt32(reader.GetOrdinal(column));
        }

        public static DateTime GetDateTime(DbDataReader reader, string column)
        {
            return reader.GetDateTime(reader.GetOrdinal(column));
        }

        public static int? GetNullableInt(DbDataReader reader, string column)
        {
            var ordinal = reader.GetOrdinal(column);
            return reader.IsDBNull(ordinal) ? null : reader.GetInt32(ordinal);
        }

        public static DateTime? GetNullableDateTime(
            DbDataReader reader,
            string column)
        {
            var ordinal = reader.GetOrdinal(column);
            return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
        }

        public static bool IsDbNull(DbDataReader reader, string column)
        {
            return reader.IsDBNull(reader.GetOrdinal(column));
        }

        public static bool IsNotDbNull(DbDataReader reader, string column)
        {
            return !IsDbNull(reader, column);
        }

        public static void AddParameter(
            DbCommand command,
            string name,
            object value,
            DbType? dbType = null)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;

            if (dbType.HasValue)
            {
                parameter.DbType = dbType.Value;
            }

            parameter.Value = value ?? DBNull.Value;
            command.Parameters.Add(parameter);
        }

        public static string GetNullableString(
            DbDataReader reader,
            string column)
        {
            return GetString(reader, column);
        }

        public static object ValueOrDBNull(object value)
        {
            return value ?? DBNull.Value;
        }
    }
}
