using System.Collections.Generic;
using Catacombs.Models;

namespace Catacombs.Repositories
{
    public interface IUsersRepository
    {
        void Add(Users users);
        IReadOnlyList<Users> GetAll();
        Users GetById(int id);
        Users GetByEmail(string email);
        Users GetByUsername(string username);
        bool Ban(int userId, int bannedByUserId, string reason);
        bool Unban(int userId);
        void UpdatePasswordHash(int userId, string passwordHash);
    }
}
