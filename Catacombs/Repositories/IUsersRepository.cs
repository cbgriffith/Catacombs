using System.Collections.Generic;
using Catacombs.Models;

namespace Catacombs.Repositories
{
    public interface IUsersRepository
    {
        void Add(Users users);
        Users GetById(int id);
        Users GetByEmail(string email);
        void UpdatePasswordHash(int userId, string passwordHash);
    }
}
