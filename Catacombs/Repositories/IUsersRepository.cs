using System.Collections.Generic;
using Catacombs.Models;

namespace Catacombs.Repositories
{
    public interface IUsersRepository
    {
        void Add(Users users);
        Users GetByEmail(string email);
    }
}
